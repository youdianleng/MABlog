"""Permission-safe search, signed pagination, and streamed grounded explanations."""
import json
import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from ..dependencies import current_user, database
from ..config import (
    ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR,
    ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR,
    GLOBAL_ENHANCED_SEARCHES_PER_DAY,
    SEARCH_PAGE_SIZE,
    SIGNED_IN_ENHANCED_SEARCHES_PER_HOUR,
    SIGNED_IN_KEYWORD_SEARCHES_PER_HOUR,
)
from ..models import Post, SearchPassage, User
from ..schemas import ExplanationPayload, SearchCursorPayload, SearchPayload
from ..services.capacity import consume_capacity, consume_once
from ..services.embeddings import OpenAIServiceError, cloud_ai_configured, embed_texts
from ..services.generation import stream_grounded_explanation
from ..services.indexing import post_search_status
from ..services.permissions import role_for
from ..services.posts import post_summary
from ..services.retrieval import RankedPost, request_subject, retrieve, select_answer_context
from ..services.tokens import sign_search_state, verify_search_state
from ..utils import new_id

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger("mablog.search")


def _remote_host(request: Request) -> str:
    """Resolve a stable local rate-limit identity without trusting forwarded headers."""
    return request.client.host if request.client else "unknown"


def _rate_identity(user: User | None, request: Request) -> str:
    """Use an account ID when available and otherwise the direct client address."""
    return user.id if user else _remote_host(request)


def _serialize_result(db, result: RankedPost, user: User | None) -> dict:
    """Present one ranked post with a safe excerpt and creator-visible index state."""
    return {
        **post_summary(db, result.post, user),
        "matched_block_id": result.block_id,
        "snippet": result.snippet,
        "score": round(result.score, 8),
        "search_status": post_search_status(db, result.post),
    }


def _cursor_entry(result: RankedPost) -> list:
    """Compress continuation metadata while leaving current permissions authoritative."""
    return [result.post.id, result.passage_id, result.block_id, round(result.score, 10)]


def _result_group(db, results: list[RankedPost], user: User | None, subject: str, group: str, category: str | None) -> dict:
    """Return ten ranked posts and sign the remaining order with its original filter contract."""
    first = results[:SEARCH_PAGE_SIZE]
    remaining = results[SEARCH_PAGE_SIZE:]
    cursor = sign_search_state(
        "cursor",
        subject,
        {"items": [_cursor_entry(item) for item in remaining], "group": group, "category": category},
    ) if remaining else None
    return {"items": [_serialize_result(db, item, user) for item in first], "total": len(results), "cursor": cursor}


def _matches_cursor_filters(post: Post, group: str, category: str | None) -> bool:
    """Recheck mutable publication and category fields before returning a saved ranking entry."""
    if group == "public" and not post.public:
        return False
    if group == "personal" and post.public:
        return False
    current_category = str(post.document.get("details", {}).get("category", "general"))
    return category is None or current_category == category


def _context_token(subject: str, query: str, evidence: list[dict]) -> str | None:
    """Sign only query and passage identities; approved source text remains server-side."""
    if not evidence:
        return None
    references = [
        {"citation": item["citation"], "post_id": item["post_id"], "passage_id": item["passage_id"]}
        for item in evidence
    ]
    return sign_search_state("explanation", subject, {"query": query, "references": references, "request_id": new_id()})


def _load_evidence(db, references: list[dict], user: User | None) -> list[dict]:
    """Recheck current access and two-sided consent before sending any passage to OpenAI."""
    evidence: list[dict] = []
    for reference in references:
        passage = db.get(SearchPassage, str(reference.get("passage_id", "")))
        post = db.get(Post, str(reference.get("post_id", "")))
        if not passage or not post or passage.post_id != post.id or role_for(db, post, user) == "none":
            continue
        author = db.get(User, post.author_id)
        if not post.public and (not user or not user.personal_cloud_processing or not author.personal_cloud_processing):
            continue
        evidence.append(
            {
                "citation": int(reference.get("citation", 0)),
                "post_id": post.id,
                "title": str(post.document.get("details", {}).get("title", "Untitled")),
                "passage_id": passage.id,
                "block_id": passage.block_id,
                "content": passage.content,
            }
        )
    return evidence


def _sse(event: str, data: dict) -> str:
    """Encode one browser-safe server-sent event with compact JSON data."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False, separators=(',', ':'))}\n\n"


@router.post("")
def search(data: SearchPayload, request: Request, user=Depends(current_user), db=Depends(database)):
    """Return immediate grouped ranking and a short-lived token for optional answer streaming."""
    started = time.monotonic()
    request_id = new_id()
    query = data.query.strip()
    if not query:
        raise HTTPException(422, "Enter a search question")
    identity = _rate_identity(user, request)
    keyword_limit = SIGNED_IN_KEYWORD_SEARCHES_PER_HOUR if user else ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR
    if not consume_capacity("keyword-hour", identity, keyword_limit, 3600):
        raise HTTPException(429, "Keyword search limit reached. Please wait and try again.")
    vector = None
    enhanced_allowed = False
    fallback_reason = "ai_not_configured" if not cloud_ai_configured() else ""
    if cloud_ai_configured():
        enhanced_limit = SIGNED_IN_ENHANCED_SEARCHES_PER_HOUR if user else ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR
        hourly_allowed = consume_capacity("enhanced-hour", identity, enhanced_limit, 3600)
        daily_allowed = hourly_allowed and consume_capacity("enhanced-day", "application", GLOBAL_ENHANCED_SEARCHES_PER_DAY, 86400)
        if not hourly_allowed:
            fallback_reason = "enhanced_hourly_limit"
        elif not daily_allowed:
            fallback_reason = "enhanced_daily_limit"
        else:
            enhanced_allowed = True
            try:
                vector = embed_texts([query])[0]
            except OpenAIServiceError:
                fallback_reason = "ai_unavailable"
    retrieval = retrieve(db, query, user, data.category, data.scope, vector)
    combined = sorted(retrieval.personal + retrieval.public, key=lambda item: -item.score)
    # A failed query embedding should not also disable a potentially healthy
    # answer model. Lexical matches remain valid, permission-checked evidence.
    evidence = select_answer_context(db, combined, vector, user) if enhanced_allowed else []
    subject = request_subject(user, _remote_host(request))
    token = _context_token(subject, query, evidence)
    duration_ms = round((time.monotonic() - started) * 1000)
    logger.info(
        "search_completed request_id=%s mode=%s personal=%s public=%s duration_ms=%s",
        request_id,
        retrieval.mode,
        len(retrieval.personal),
        len(retrieval.public),
        duration_ms,
    )
    return {
        "request_id": request_id,
        "mode": retrieval.mode,
        "fallback_reason": fallback_reason or None,
        "personal_cloud_processing": bool(user and user.personal_cloud_processing),
        "explanation_available": token is not None,
        "explanation_token": token,
        "personal": _result_group(db, retrieval.personal, user, subject, "personal", data.category),
        "public": _result_group(db, retrieval.public, user, subject, "public", data.category),
    }


@router.post("/more")
def more(data: SearchCursorPayload, request: Request, user=Depends(current_user), db=Depends(database)):
    """Read the next ten signed results while removing posts that are no longer accessible."""
    subject = request_subject(user, _remote_host(request))
    state = verify_search_state(data.cursor, "cursor", subject)
    entries = list(state.get("items", []))
    group = str(state.get("group", ""))
    category = state.get("category")
    if group not in {"personal", "public"} or category not in {None, "technology", "travel", "general", "anime"}:
        raise HTTPException(400, "Search state expired. Run the search again.")
    delivered: list[dict] = []
    consumed = 0
    while consumed < len(entries) and len(delivered) < SEARCH_PAGE_SIZE:
        entry = entries[consumed]
        consumed += 1
        if not isinstance(entry, list) or len(entry) != 4:
            continue
        post = db.get(Post, str(entry[0]))
        passage = db.get(SearchPassage, str(entry[1]))
        if not post or not passage or passage.post_id != post.id or role_for(db, post, user) == "none":
            continue
        if not _matches_cursor_filters(post, group, category):
            continue
        snippet_source = passage.content
        result = RankedPost(
            post=post,
            passage_id=str(entry[1]),
            block_id=str(entry[2]) if entry[2] is not None else None,
            snippet=(snippet_source[:237] + "...") if len(snippet_source) > 240 else snippet_source,
            score=float(entry[3]),
        )
        delivered.append(_serialize_result(db, result, user))
    remaining = entries[consumed:]
    cursor = sign_search_state("cursor", subject, {"items": remaining, "group": group, "category": category}) if remaining else None
    return {"items": delivered, "cursor": cursor}


@router.post("/explanation")
def explanation(data: ExplanationPayload, request: Request, user=Depends(current_user), db=Depends(database)):
    """Stream a grounded explanation after revalidating every client-carried evidence reference."""
    subject = request_subject(user, _remote_host(request))
    state = verify_search_state(data.token, "explanation", subject)
    evidence = _load_evidence(db, list(state.get("references", [])), user)
    if not evidence:
        raise HTTPException(409, "Search evidence changed. Run the search again.")
    if not consume_once("explanation", data.token, float(state.get("expires", 0))):
        raise HTTPException(409, "This explanation was already generated. Run the search again.")
    citations: dict[int, dict] = {}
    for item in evidence:
        citations.setdefault(
            item["citation"],
            {
                "number": item["citation"],
                "title": item["title"],
                "url": f"/posts/{item['post_id']}" + (f"?block={item['block_id']}&highlight=search" if item["block_id"] else ""),
            },
        )

    async def events():
        """Yield citation metadata first, then provider text deltas, completion, or a safe failure code."""
        yield _sse("citations", {"items": list(citations.values())})
        try:
            async for delta in stream_grounded_explanation(str(state.get("query", "")), evidence):
                yield _sse("delta", {"text": delta})
            yield _sse("done", {})
            logger.info("generation_completed request_id=%s model_configured=true", state.get("request_id", "unknown"))
        except OpenAIServiceError:
            yield _sse("error", {"code": "generation_failed"})
            logger.warning("generation_failed request_id=%s", state.get("request_id", "unknown"))

    return StreamingResponse(events(), media_type="text/event-stream", headers={"X-Accel-Buffering": "no"})


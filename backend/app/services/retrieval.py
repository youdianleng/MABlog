"""Permission-safe lexical/vector candidates, rank fusion, and answer context selection."""
from dataclasses import dataclass
import math
import re

from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.orm import aliased

from ..config import (
    FRESHNESS_BOOST_CAP,
    FRESHNESS_HALF_LIFE_DAYS,
    LIKE_BOOST_CAP,
    LIKE_WINDOW_SECONDS,
    RRF_K,
    SEARCH_CANDIDATE_LIMIT,
    SEARCH_CONTEXT_PASSAGES,
    SEARCH_CONTEXT_PASSAGES_PER_POST,
    SEARCH_CONTEXT_POSTS,
)
from ..models import Grant, Like, Post, SearchPassage, User
from ..utils import now

# Excluding common question words keeps keyword fallback broad enough for natural-language queries.
QUERY_STOP_WORDS = {
    "a", "about", "and", "are", "de", "del", "el", "en", "find", "for", "i", "is", "la", "las", "los",
    "me", "of", "para", "por", "post", "posts", "que", "show", "sobre", "the", "to", "una", "un", "with",
}


@dataclass
class PassageCandidate:
    """One permission-checked passage candidate and its parent approved post."""

    passage: SearchPassage
    post: Post
    likes: int


@dataclass
class RankedPost:
    """A fused post result with its best available deep-link passage."""

    post: Post
    passage_id: str
    block_id: str | None
    snippet: str
    score: float


@dataclass
class RetrievalResult:
    """Personal and public results plus the candidate mode used for this query."""

    personal: list[RankedPost]
    public: list[RankedPost]
    mode: str


def request_subject(user: User | None, remote_host: str) -> str:
    """Bind signed search state to an account or a non-reversible anonymous address digest."""
    if user:
        return f"user:{user.id}"
    from ..utils import digest
    return f"anonymous:{digest(remote_host)}"


def _visible_condition(user: User | None):
    """Build the authoritative visibility predicate used inside every candidate SQL query."""
    if not user:
        return Post.public.is_(True)
    grant_exists = select(Grant.post_id).where(Grant.post_id == Post.id, Grant.user_id == user.id).exists()
    return or_(Post.public.is_(True), Post.author_id == user.id, grant_exists)


def _scope_condition(scope: str):
    """Translate the Personal/Public interface filter into an approved-post predicate."""
    if scope == "personal":
        return Post.public.is_(False)
    if scope == "public":
        return Post.public.is_(True)
    return True


def _category_condition(category: str | None):
    """Filter the approved JSON metadata while treating legacy posts as General."""
    if category is None:
        return True
    return func.coalesce(Post.document["details"]["category"].as_string(), "general") == category


def _semantic_condition(user: User | None, author_alias):
    """Require two-sided consent for personal semantic candidates while public posts remain automatic."""
    if not user or not user.personal_cloud_processing:
        return Post.public.is_(True)
    return or_(Post.public.is_(True), and_(Post.public.is_(False), author_alias.personal_cloud_processing.is_(True)))


def _like_count_expression():
    """Count active likes from the confirmed rolling fourteen-day ranking window."""
    return (
        select(func.count())
        .select_from(Like)
        .where(Like.post_id == Post.id, Like.created >= now() - LIKE_WINDOW_SECONDS)
        .correlate(Post)
        .scalar_subquery()
    )


def query_terms(query: str) -> list[str]:
    """Extract safe distinct lexical terms without accepting PostgreSQL query operators."""
    terms: list[str] = []
    for word in re.findall(r"[^\W_]+", query.casefold(), flags=re.UNICODE):
        if word not in QUERY_STOP_WORDS and word not in terms:
            terms.append(word)
        if len(terms) == 12:
            break
    if not terms:
        terms = re.findall(r"[^\W_]+", query.casefold(), flags=re.UNICODE)[:4]
    return terms


def lexical_candidates(db, query: str, user: User | None, category: str | None, scope: str) -> list[PassageCandidate]:
    """Retrieve full-text candidates only after applying current visibility, scope, and category in SQL."""
    terms = query_terms(query)
    if not terms:
        return []
    author = aliased(User)
    # Prefix lexemes keep the local fallback intuitive when a query and title
    # differ only by a common suffix, such as ``mountain`` and ``mountains``.
    ts_query = func.to_tsquery("simple", " | ".join(f"{term}:*" for term in terms))
    document_vector = func.to_tsvector("simple", SearchPassage.content)
    rank = func.ts_rank_cd(document_vector, ts_query)
    statement = (
        select(SearchPassage, Post, _like_count_expression().label("likes"))
        .join(Post, Post.id == SearchPassage.post_id)
        .join(author, author.id == Post.author_id)
        .where(
            _visible_condition(user),
            _scope_condition(scope),
            _category_condition(category),
            document_vector.op("@@")(ts_query),
        )
        .order_by(rank.desc(), Post.published.desc(), SearchPassage.id)
        .limit(SEARCH_CANDIDATE_LIMIT)
    )
    return [PassageCandidate(passage=row[0], post=row[1], likes=int(row[2] or 0)) for row in db.execute(statement)]


def semantic_candidates(db, vector: list[float], user: User | None, category: str | None, scope: str) -> list[PassageCandidate]:
    """Retrieve cosine candidates with visibility and personal-consent predicates inside vector SQL."""
    author = aliased(User)
    distance = SearchPassage.embedding.cosine_distance(vector)
    statement = (
        select(SearchPassage, Post, _like_count_expression().label("likes"))
        .join(Post, Post.id == SearchPassage.post_id)
        .join(author, author.id == Post.author_id)
        .where(
            _visible_condition(user),
            _scope_condition(scope),
            _category_condition(category),
            _semantic_condition(user, author),
            SearchPassage.embedding.is_not(None),
        )
        .order_by(distance, Post.id, SearchPassage.id)
        .limit(SEARCH_CANDIDATE_LIMIT)
    )
    return [PassageCandidate(passage=row[0], post=row[1], likes=int(row[2] or 0)) for row in db.execute(statement)]


def _first_post_candidates(candidates: list[PassageCandidate]) -> dict[str, tuple[int, PassageCandidate]]:
    """Keep the best passage rank for each post so long posts cannot dominate fusion."""
    result: dict[str, tuple[int, PassageCandidate]] = {}
    for rank, candidate in enumerate(candidates, start=1):
        result.setdefault(candidate.post.id, (rank, candidate))
    return result


def _engagement_multiplier(candidate: PassageCandidate) -> float:
    """Return a combined like/freshness tie-breaker capped at the confirmed ten percent."""
    like_factor = min(1.0, math.log1p(candidate.likes) / math.log1p(10)) * LIKE_BOOST_CAP
    timestamp = candidate.post.published or candidate.post.created
    age_days = max(0.0, (now() - timestamp) / 86400)
    freshness_factor = math.pow(0.5, age_days / FRESHNESS_HALF_LIFE_DAYS) * FRESHNESS_BOOST_CAP
    return 1 + min(LIKE_BOOST_CAP + FRESHNESS_BOOST_CAP, like_factor + freshness_factor)


def fuse_candidates(lexical: list[PassageCandidate], semantic: list[PassageCandidate]) -> list[RankedPost]:
    """Fuse per-post ranks through RRF and apply the bounded engagement tie-breaker."""
    lexical_best = _first_post_candidates(lexical)
    semantic_best = _first_post_candidates(semantic)
    ranked: list[RankedPost] = []
    for post_id in lexical_best.keys() | semantic_best.keys():
        lexical_entry = lexical_best.get(post_id)
        semantic_entry = semantic_best.get(post_id)
        candidate = semantic_entry[1] if semantic_entry else lexical_entry[1]
        score = 0.0
        if lexical_entry:
            score += 1 / (RRF_K + lexical_entry[0])
        if semantic_entry:
            score += 1 / (RRF_K + semantic_entry[0])
        score *= _engagement_multiplier(candidate)
        text = re.sub(r"\s+", " ", candidate.passage.content).strip()
        ranked.append(
            RankedPost(
                post=candidate.post,
                passage_id=candidate.passage.id,
                block_id=candidate.passage.block_id,
                snippet=text[:237] + "..." if len(text) > 240 else text,
                score=score,
            )
        )
    return sorted(ranked, key=lambda item: (-item.score, -(item.post.published or item.post.created), item.post.id))


def retrieve(db, query: str, user: User | None, category: str | None, scope: str, vector: list[float] | None) -> RetrievalResult:
    """Return separately ranked Personal and Public posts without duplicating published author results."""
    lexical = lexical_candidates(db, query, user, category, scope)
    semantic = semantic_candidates(db, vector, user, category, scope) if vector else []
    fused = fuse_candidates(lexical, semantic)
    return RetrievalResult(
        personal=[item for item in fused if not item.post.public],
        public=[item for item in fused if item.post.public],
        mode="hybrid" if vector else "keyword",
    )


def select_answer_context(db, ranked: list[RankedPost], vector: list[float] | None, user: User | None) -> list[dict]:
    """Select at most eight current passages across five posts with two-sided personal consent."""
    evidence: list[dict] = []
    selected_posts = 0
    for result in ranked:
        if selected_posts >= SEARCH_CONTEXT_POSTS or len(evidence) >= SEARCH_CONTEXT_PASSAGES:
            break
        author = db.get(User, result.post.author_id)
        if not result.post.public and (not user or not user.personal_cloud_processing or not author.personal_cloud_processing):
            continue
        order = [case((SearchPassage.id == result.passage_id, 0), else_=1)]
        if vector:
            order.append(SearchPassage.embedding.cosine_distance(vector).nullslast())
        order.extend([SearchPassage.reading_order, SearchPassage.chunk_index])
        passages = list(
            db.scalars(
                select(SearchPassage)
                .where(SearchPassage.post_id == result.post.id)
                .order_by(*order)
                .limit(SEARCH_CONTEXT_PASSAGES_PER_POST)
            )
        )
        if not passages:
            continue
        selected_posts += 1
        citation = selected_posts
        for passage in passages[: SEARCH_CONTEXT_PASSAGES - len(evidence)]:
            evidence.append(
                {
                    "citation": citation,
                    "post_id": result.post.id,
                    "title": str(result.post.document.get("details", {}).get("title", "Untitled")),
                    "passage_id": passage.id,
                    "block_id": passage.block_id,
                    "content": passage.content,
                }
            )
    return evidence


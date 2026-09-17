"""Curator-managed official registry and review-only provider suggestions."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from ...dependencies import database
from ...models import NewsSource, NewsSourceSuggestion, User
from ...schemas import NewsSourcePayload, NewsSuggestionPayload
from ...services.admin_audit import audit
from ...services.administration import require_admin
from ...services.ai_news.extraction import extract_source
from ...services.ai_news.safe_fetch import SafeFetchError, fetch_public_document
from ...services.step_up import require_step_up
from ...utils import new_id, now
from .serializers import source_summary, suggestion_summary

router = APIRouter()


def _live_validation(url: str) -> dict:
    """Validate network safety, supported extraction, and bounded public content for activation."""
    try:
        fetched = fetch_public_document(url)
        extracted = extract_source(fetched)
        return {"passed": True, "canonical_url": fetched.canonical_url, "mime": fetched.media_type, "content_hash": extracted.content_hash, "warnings": extracted.warnings}
    except (SafeFetchError, ValueError) as error:
        return {"passed": False, "code": str(error)[:120]}


@router.get("/sources")
def list_sources(db=Depends(database), user: User = Depends(require_admin)):
    """List every active or disabled official source in provider order."""
    records = db.scalars(select(NewsSource).order_by(NewsSource.provider_name, NewsSource.name))
    return [source_summary(record) for record in records]


@router.post("/sources/test")
def test_source(data: NewsSourcePayload, user: User = Depends(require_admin)):
    """Test a proposed source without changing the registry."""
    return _live_validation(data.url)


@router.post("/sources")
def create_source(data: NewsSourcePayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Add an audited source and activate it only after a successful live safety check."""
    if db.scalar(select(NewsSource).where(NewsSource.url == data.url)):
        raise HTTPException(409, "This official source already exists")
    validation = _live_validation(data.url)
    if data.active and not validation["passed"]:
        raise HTTPException(422, f"Source validation failed: {validation.get('code', 'unknown')}")
    source = NewsSource(id=new_id(), provider_key=data.provider_key, provider_name=data.provider_name, name=data.name, url=data.url, kind=data.kind, active=data.active, validation_status="passed" if validation["passed"] else "failed", validation=validation, last_checked=now())
    db.add(source)
    audit(db, user, "ai_news.source.created", "news_source", source.id, data.reason, after=source_summary(source))
    db.commit()
    return source_summary(source)


@router.put("/sources/{source_id}")
def update_source(source_id: str, data: NewsSourcePayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Edit, activate, reactivate, or disable one source after current validation."""
    source = db.scalar(select(NewsSource).where(NewsSource.id == source_id).with_for_update())
    if not source:
        raise HTTPException(404, "Official source not found")
    before = source_summary(source)
    validation = _live_validation(data.url)
    if data.active and not validation["passed"]:
        raise HTTPException(422, f"Source validation failed: {validation.get('code', 'unknown')}")
    source.provider_key = data.provider_key
    source.provider_name = data.provider_name
    source.name = data.name
    source.url = data.url
    source.kind = data.kind
    source.active = data.active
    source.validation_status = "passed" if validation["passed"] else "failed"
    source.validation = validation
    source.last_checked = now()
    source.updated = now()
    audit(db, user, "ai_news.source.updated", "news_source", source.id, data.reason, before, source_summary(source))
    db.commit()
    return source_summary(source)


@router.get("/suggestions")
def list_suggestions(db=Depends(database), user: User = Depends(require_admin)):
    """List inactive web-discovered providers for explicit curator review."""
    records = db.scalars(select(NewsSourceSuggestion).order_by(NewsSourceSuggestion.status, NewsSourceSuggestion.created.desc()))
    return [suggestion_summary(record) for record in records]


@router.post("/suggestions/{suggestion_id}")
def review_suggestion(suggestion_id: str, data: NewsSuggestionPayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Dismiss a suggestion or validate and promote it into the official registry."""
    suggestion = db.scalar(select(NewsSourceSuggestion).where(NewsSourceSuggestion.id == suggestion_id).with_for_update())
    if not suggestion or suggestion.status != "pending":
        raise HTTPException(404, "Pending source suggestion not found")
    if data.action == "dismiss":
        suggestion.status = "dismissed"
        suggestion.reviewed_by = user.id
        suggestion.reviewed_at = now()
        audit(db, user, "ai_news.suggestion.dismissed", "news_source_suggestion", suggestion.id, data.reason)
        db.commit()
        return suggestion_summary(suggestion)
    if not data.provider_key or not data.provider_name or not data.name:
        raise HTTPException(422, "Provider key, provider name, and source name are required for approval")
    validation = _live_validation(suggestion.url)
    if not validation["passed"]:
        raise HTTPException(422, f"Source validation failed: {validation.get('code', 'unknown')}")
    source = NewsSource(id=new_id(), provider_key=data.provider_key, provider_name=data.provider_name, name=data.name, url=suggestion.url, kind=data.kind, active=True, validation_status="passed", validation=validation, last_checked=now())
    db.add(source)
    suggestion.status = "approved"
    suggestion.reviewed_by = user.id
    suggestion.reviewed_at = now()
    audit(db, user, "ai_news.suggestion.approved", "news_source_suggestion", suggestion.id, data.reason, after=source_summary(source))
    db.commit()
    return {"suggestion": suggestion_summary(suggestion), "source": source_summary(source)}



"""Curator unpublication, synchronized correction, verification, and republication."""

import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from ...dependencies import database
from ...models import AutomatedEdition, NewsRevision, NewsRun, Post, User
from ...schemas import ActionReasonPayload, NewsCorrectionAcceptance, NewsCorrectionPayload
from ...services.admin_audit import audit
from ...services.administration import require_admin
from ...services.ai_news.corrections import synchronize_correction, validate_correction
from ...services.ai_news.publication import publish_edition, replace_edition_documents, unpublish_edition
from ...services.ai_news.providers.openai import NewsProviderError
from ...services.ai_news.safety import publication_safety
from ...services.ai_news.verification import verify_once
from ...services.step_up import require_step_up
from ...utils import new_id, now
from .serializers import edition_summary

router = APIRouter()


@router.get("/editions")
def editions(db=Depends(database), user: User = Depends(require_admin)):
    """List retained automated editions without exposing ordinary user posts."""
    records = db.scalars(select(AutomatedEdition).order_by(AutomatedEdition.created.desc()).limit(100))
    return [edition_summary(record) for record in records]


@router.post("/editions/{edition_id}/unpublish")
def unpublish(edition_id: str, data: ActionReasonPayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Immediately unpublish only a `MABlog_IA` edition and retain its complete history."""
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.id == edition_id).with_for_update())
    if not edition or not edition.post_id:
        raise HTTPException(404, "Automated edition not found")
    post = db.get(Post, edition.post_id)
    if not post or post.kind != "ai_news":
        raise HTTPException(403, "Only MABlog_IA posts can be curated here")
    unpublish_edition(db, edition)
    audit(db, user, "ai_news.edition.unpublished", "automated_edition", edition.id, data.reason)
    db.commit()
    return edition_summary(edition)


@router.post("/editions/{edition_id}/corrections")
def start_correction(edition_id: str, data: NewsCorrectionPayload, db=Depends(database), user: User = Depends(require_admin)):
    """Store one edited language and propose its synchronized counterpart for review."""
    edition = db.get(AutomatedEdition, edition_id)
    run = db.get(NewsRun, edition.run_id) if edition else None
    if not edition or not run or edition.status not in {"published", "unpublished", "unpublished_contradicted", "corrected_verified"}:
        raise HTTPException(404, "Correctable automated edition not found")
    try:
        documents = synchronize_correction(db, run, edition.documents, data.language, data.document)
    except NewsProviderError as error:
        raise HTTPException(503, f"Correction provider unavailable: {error.code}") from error
    except RuntimeError as error:
        raise HTTPException(422, str(error)) from error
    revision = NewsRevision(id=new_id(), edition_id=edition.id, status="awaiting_acceptance", documents=documents, created_by=user.id)
    db.add(revision)
    audit(db, user, "ai_news.correction.proposed", "news_revision", revision.id)
    db.commit()
    return {"id": revision.id, "status": revision.status, "documents": revision.documents}


@router.post("/revisions/{revision_id}/accept")
def accept_correction(revision_id: str, data: NewsCorrectionAcceptance, db=Depends(database), user: User = Depends(require_step_up)):
    """Verify accepted bilingual text and atomically replace or prepare the corrected edition."""
    revision = db.scalar(select(NewsRevision).where(NewsRevision.id == revision_id).with_for_update())
    edition = db.get(AutomatedEdition, revision.edition_id) if revision else None
    run = db.get(NewsRun, edition.run_id) if edition else None
    if not revision or not edition or not run or revision.status != "awaiting_acceptance":
        raise HTTPException(404, "Pending correction not found")
    try:
        validate_correction(edition.documents, data.documents)
        digest = hashlib.sha256(json.dumps(data.documents, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:24]
        report = verify_once(db, run, data.documents, attempt=f"correction-{digest}")
        safety = publication_safety(db, run, data.documents)
    except NewsProviderError as error:
        raise HTTPException(503, f"Verification provider unavailable: {error.code}") from error
    except RuntimeError as error:
        raise HTTPException(422, str(error)) from error
    revision.documents = data.documents
    revision.verification = {**report, "safety": safety}
    revision.updated = now()
    if not report.get("passed") or not safety.get("passed"):
        revision.status = "verification_failed"
        db.commit()
        return {"id": revision.id, "status": revision.status, "verification": revision.verification}
    revision.status = "published" if edition.status == "published" else "verified"
    replace_edition_documents(db, edition, data.documents, data.correction_note)
    audit(db, user, "ai_news.correction.verified", "news_revision", revision.id, data.correction_note)
    db.commit()
    return {"id": revision.id, "status": revision.status, "edition": edition_summary(edition)}


@router.post("/editions/{edition_id}/publish")
def republish(edition_id: str, data: ActionReasonPayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Publish a retained verified or corrected automated edition after curator review."""
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.id == edition_id).with_for_update())
    run = db.get(NewsRun, edition.run_id) if edition else None
    if not edition or not run or edition.status not in {"verified_preview", "corrected_verified", "unpublished"} or not edition.verification.get("passed"):
        raise HTTPException(409, "A verified automated edition is required")
    post = publish_edition(db, run, edition)
    audit(db, user, "ai_news.edition.published", "post", post.id, data.reason)
    db.commit()
    return {"post_id": post.id}



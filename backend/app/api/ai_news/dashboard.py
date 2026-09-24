"""AI-news workspace status, run history, details, previews, and schedule controls."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select

from ...dependencies import database
from ...models import (
    AutomatedEdition,
    NewsAlert,
    NewsAlertReceipt,
    NewsCandidate,
    NewsClaim,
    NewsDocument,
    NewsJob,
    NewsRun,
    NewsSetting,
    NewsUsage,
    Post,
    User,
)
from ...schemas import NewsEvidenceOverridePayload, NewsPinPayload, NewsPreviewPayload, NewsSchedulePayload
from ...services.admin_audit import audit
from ...services.administration import require_admin
from ...services.ai_news.composition import validate_structured_documents
from ...services.ai_news.extraction import extract_source
from ...services.ai_news.providers.openai import NewsProviderError
from ...services.ai_news.publication import publish_edition
from ...services.ai_news.readiness import readiness
from ...services.ai_news.safe_fetch import SafeFetchError, fetch_public_document
from ...services.ai_news.safety import publication_safety
from ...services.ai_news.scheduler import active_run, calculate_next_run, create_run
from ...services.step_up import require_step_up
from ...utils import now
from .serializers import candidate_summary, document_summary, edition_summary, job_summary, run_summary

router = APIRouter()


def _published_release_conflicts(db, run: NewsRun) -> list[dict[str, str | None]]:
    """Find releases already covered by another run and link only still-public posts."""
    conflicts: list[dict[str, str | None]] = []
    candidates = db.scalars(select(NewsCandidate).where(NewsCandidate.run_id == run.id, NewsCandidate.status == "qualifying"))
    for candidate in candidates:
        prior = db.scalar(select(NewsCandidate).where(NewsCandidate.normalized_key == candidate.normalized_key, NewsCandidate.status == "published", NewsCandidate.run_id != run.id))
        if not prior:
            continue
        post_id = (prior.details or {}).get("published_post_id")
        post = db.get(Post, post_id) if isinstance(post_id, str) else None
        conflicts.append({"model_name": candidate.model_name, "post_id": post.id if post and post.public else None})
    return conflicts


def _recheck_publication_sources(db, run: NewsRun, *, allow_changed: bool = False) -> list[dict[str, str]]:
    """Recheck official evidence and duplicates, returning acknowledged hash drift only for an exception."""
    conflicts = _published_release_conflicts(db, run)
    if conflicts:
        names = ", ".join(str(item["model_name"])[:120] for item in conflicts[:3])
        raise HTTPException(409, f"Already published in another AI-news edition: {names}. Open the existing post or generate a preview with new releases")
    documents = list(db.scalars(select(NewsDocument).where(NewsDocument.run_id == run.id, NewsDocument.official.is_(True))))
    if not documents:
        raise HTTPException(409, "At least one retained official source is required")
    changed_sources: list[dict[str, str]] = []
    for document in documents:
        try:
            current = fetch_public_document(document.canonical_url)
            current_hash = extract_source(current).content_hash
        except (SafeFetchError, ValueError) as error:
            raise HTTPException(409, f"Official source recheck failed: {error}") from error
        if current_hash != document.content_hash:
            if not allow_changed:
                raise HTTPException(409, "An official source changed; run a new preview before publishing")
            # The original snapshot remains the article's evidence. Only this
            # administrator exception can acknowledge a newer live page.
            changed_sources.append({"document_id": document.id, "retained_hash": document.content_hash, "current_hash": current_hash})
    return changed_sources


@router.get("/status")
def status(db=Depends(database), user: User = Depends(require_admin)):
    """Return the compact workspace overview without exposing credentials."""
    settings = db.get(NewsSetting, 1)
    recent = list(db.scalars(select(NewsRun).order_by(NewsRun.created.desc()).limit(8)))
    unread = db.scalar(select(func.count()).select_from(NewsAlertReceipt).join(NewsAlert, NewsAlert.id == NewsAlertReceipt.alert_id).where(NewsAlertReceipt.user_id == user.id, NewsAlertReceipt.read_at == 0, NewsAlert.resolved == 0))
    current = active_run(db)
    return {
        "readiness": readiness(db),
        "schedule": {"enabled": settings.schedule_enabled, "timezone": settings.timezone, "weekday": settings.weekday, "hour": settings.hour, "minute": settings.minute, "next_run": settings.next_run, "activation_preview_run_id": settings.activation_preview_run_id},
        "budget": {"run_limit": settings.openai_run_budget, "month_limit": settings.openai_month_budget, "brave_limit": settings.brave_query_budget, "month_spend": float(db.scalar(select(func.coalesce(func.sum(NewsUsage.estimated_cost), 0))) or 0)},
        "active_run": run_summary(current) if current else None,
        "recent_runs": [run_summary(run) for run in recent],
        "unread_alerts": int(unread or 0),
    }


@router.get("/runs")
def runs(offset: int = 0, db=Depends(database), user: User = Depends(require_admin)):
    """List retained news runs in newest-first pages."""
    records = db.scalars(select(NewsRun).order_by(NewsRun.created.desc()).offset(max(offset, 0)).limit(50))
    return [run_summary(record) for record in records]


@router.get("/runs/{run_id}")
def run_detail(run_id: str, db=Depends(database), user: User = Depends(require_admin)):
    """Return stage, candidate, evidence, verification, and preview details for one run."""
    run = db.get(NewsRun, run_id)
    if not run:
        raise HTTPException(404, "News run not found")
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run.id))
    claims = list(db.scalars(select(NewsClaim).where(NewsClaim.run_id == run.id).order_by(NewsClaim.claim_key)))
    return {
        **run_summary(run),
        "jobs": [job_summary(value) for value in db.scalars(select(NewsJob).where(NewsJob.run_id == run.id).order_by(NewsJob.updated))],
        "candidates": [candidate_summary(value) for value in db.scalars(select(NewsCandidate).where(NewsCandidate.run_id == run.id))],
        "documents": [document_summary(value, include_text=True) for value in db.scalars(select(NewsDocument).where(NewsDocument.run_id == run.id))],
        "claims": [{"id": value.id, "claim_key": value.claim_key, "text_en": value.text_en, "text_es": value.text_es, "status": value.status, "evidence": value.evidence, "verifier_model": value.verifier_model} for value in claims],
        "publication_conflicts": _published_release_conflicts(db, run) if run.kind == "preview" and run.status == "preview" else [],
        "edition": edition_summary(edition) if edition else None,
    }


@router.patch("/runs/{run_id}/pin")
def pin_run(run_id: str, data: NewsPinPayload, db=Depends(database), user: User = Depends(require_admin)):
    """Change the retention pin stored with a failed or private run."""
    run = db.scalar(select(NewsRun).where(NewsRun.id == run_id).with_for_update())
    if not run:
        raise HTTPException(404, "News run not found")
    run.result = {**run.result, "pinned": data.pinned}
    audit(db, user, "ai_news.run.pin_changed", "news_run", run.id, after={"pinned": data.pinned})
    db.commit()
    return run_summary(run)


@router.post("/runs/{run_id}/retry")
def retry_failed_run(run_id: str, db=Depends(database), user: User = Depends(require_admin)):
    """Retry only the retained failed stage without rebuilding completed checkpoints."""
    run = db.scalar(select(NewsRun).where(NewsRun.id == run_id).with_for_update())
    job = db.scalar(select(NewsJob).where(NewsJob.run_id == run_id, NewsJob.status == "failed").with_for_update()) if run else None
    if not run or not job:
        raise HTTPException(409, "This run has no failed stage to retry")
    job.status = "retrying"
    job.attempts = 0
    job.available_at = now()
    job.last_error = ""
    run.status = "retrying"
    run.last_error = ""
    run.completed = 0
    audit(db, user, "ai_news.run.retried", "news_run", run.id, after={"stage": job.stage})
    db.commit()
    return run_summary(run)


@router.post("/runs/preview")
def start_preview(data: NewsPreviewPayload, db=Depends(database), user: User = Depends(require_admin)):
    """Start a private preview, checking claims only for explicit activation tests."""
    run, created = create_run(db, "preview", False, requested_by=user.id, historical_days=data.historical_days, verify_for_activation=data.verify_for_activation)
    if created:
        audit(db, user, "ai_news.preview.started", "news_run", run.id)
        db.commit()
    return {"created": created, "run": run_summary(run)}


@router.post("/runs/run-and-publish")
def run_and_publish(db=Depends(database), user: User = Depends(require_step_up)):
    """Start the fully gated immediate-publication path or link to the active run."""
    run, created = create_run(db, "immediate", True, requested_by=user.id)
    if created:
        audit(db, user, "ai_news.run_and_publish.started", "news_run", run.id)
        db.commit()
    return {"created": created, "run": run_summary(run)}


@router.post("/runs/{run_id}/publish")
def publish_preview(run_id: str, db=Depends(database), user: User = Depends(require_step_up)):
    """Recheck retained official source hashes and atomically publish a verified preview."""
    run = db.scalar(select(NewsRun).where(NewsRun.id == run_id).with_for_update())
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run_id)) if run else None
    if not run or not edition or run.status != "preview" or edition.status != "verified_preview":
        raise HTTPException(409, "Only a verified private preview can be published")
    _recheck_publication_sources(db, run)
    post = publish_edition(db, run, edition)
    audit(db, user, "ai_news.preview.published", "post", post.id)
    db.commit()
    return {"post_id": post.id}


@router.post("/runs/{run_id}/publish-evidence-override")
def publish_evidence_override(run_id: str, data: NewsEvidenceOverridePayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Publish a failed evidence-check preview only after explicit human approval and safety gates."""
    run = db.scalar(select(NewsRun).where(NewsRun.id == run_id).with_for_update())
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run_id)) if run else None
    failed_verify = db.scalar(select(NewsJob).where(NewsJob.run_id == run_id, NewsJob.stage == "verify", NewsJob.status == "failed")) if run else None
    if not (
        run and edition and failed_verify
        and run.kind == "preview" and not run.publication_intent
        and run.status == "failed" and run.stage == "verify"
        and run.last_error == "verification_failed_after_repairs"
        and edition.status == "composed" and not edition.post_id
        and edition.verification.get("passed") is False
        and not edition.verification.get("source_contradicted")
    ):
        raise HTTPException(409, "Only a retained preview that failed evidence verification can use this override")
    if active_run(db):
        raise HTTPException(409, "Wait for the active AI-news run to finish before publishing an exception")
    release_ids = set(db.scalars(select(NewsCandidate.id).where(NewsCandidate.run_id == run.id, NewsCandidate.status == "qualifying")))
    if not release_ids:
        raise HTTPException(409, "The preview has no qualifying release to publish")
    try:
        validate_structured_documents(edition.documents, release_ids)
    except (KeyError, TypeError, RuntimeError) as error:
        raise HTTPException(409, f"The retained bilingual draft is incomplete: {error}") from error
    changed_sources = _recheck_publication_sources(db, run, allow_changed=True)
    try:
        safety = publication_safety(db, run, edition.documents)
    except NewsProviderError as error:
        raise HTTPException(503, f"Safety moderation is unavailable: {error.code}") from error
    if not safety.get("passed"):
        raise HTTPException(409, "Safety checks failed: " + ", ".join(str(issue) for issue in safety.get("issues", [])[:6]))
    edition.verification = {
        **edition.verification,
        "safety": safety,
        "manual_override": {"approved_by": user.id, "approved_at": now(), "reason": data.reason, "failure_code": run.last_error, "changed_sources": changed_sources},
    }
    post = publish_edition(db, run, edition, allow_evidence_override=True)
    audit(db, user, "ai_news.preview.evidence_override_published", "post", post.id, data.reason, after={"run_id": run.id, "edition_id": edition.id, "fact_check_passed": False, "safety_passed": True, "risk_acknowledged": data.acknowledged_risk, "changed_source_count": len(changed_sources)})
    db.commit()
    return {"post_id": post.id, "verification_status": "administrator_override"}


@router.post("/runs/{run_id}/publish-unverified-preview")
def publish_unverified_preview(run_id: str, data: NewsEvidenceOverridePayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Publish only a safety-cleared manual preview after step-up and an audited acknowledgement."""
    run = db.scalar(select(NewsRun).where(NewsRun.id == run_id).with_for_update())
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run_id).with_for_update()) if run else None
    if not (
        run and edition and run.kind == "preview" and not run.publication_intent
        and not run.result.get("verify_for_activation") and run.status == "preview"
        and edition.status == "safety_cleared_preview" and not edition.post_id
        and edition.verification.get("fact_check_performed") is False
        and (edition.verification.get("safety") or {}).get("passed") is True
    ):
        raise HTTPException(409, "Only a safety-cleared ordinary administrator preview can use this action")
    if active_run(db):
        raise HTTPException(409, "Wait for the active AI-news run before publishing")
    release_ids = set(db.scalars(select(NewsCandidate.id).where(NewsCandidate.run_id == run.id, NewsCandidate.status == "qualifying")))
    if not release_ids:
        raise HTTPException(409, "The preview has no qualifying release to publish")
    try:
        validate_structured_documents(edition.documents, release_ids)
    except (KeyError, TypeError, RuntimeError) as error:
        raise HTTPException(409, f"The retained bilingual draft is incomplete: {error}") from error
    changed_sources = _recheck_publication_sources(db, run, allow_changed=True)
    try:
        safety = publication_safety(db, run, edition.documents)
    except NewsProviderError as error:
        raise HTTPException(503, f"Safety moderation is unavailable: {error.code}") from error
    if not safety.get("passed"):
        raise HTTPException(409, "Safety checks failed: " + ", ".join(str(issue) for issue in safety.get("issues", [])[:6]))
    edition.verification = {
        **edition.verification,
        "safety": safety,
        "manual_unverified_preview": {"approved_by": user.id, "approved_at": now(), "reason": data.reason, "changed_sources": changed_sources},
    }
    post = publish_edition(db, run, edition, allow_unverified_preview=True)
    audit(db, user, "ai_news.preview.unverified_published", "post", post.id, data.reason, after={"run_id": run.id, "edition_id": edition.id, "fact_check_performed": False, "safety_passed": True, "risk_acknowledged": data.acknowledged_risk, "changed_source_count": len(changed_sources)})
    db.commit()
    return {"post_id": post.id, "verification_status": "administrator_unverified_preview"}


@router.put("/schedule")
def change_schedule(data: NewsSchedulePayload, db=Depends(database), user: User = Depends(require_step_up)):
    """Enable only after a complete activation preview or disable future scheduled starts."""
    settings = db.scalar(select(NewsSetting).where(NewsSetting.id == 1).with_for_update())
    if data.enabled and not settings.activation_preview_run_id:
        raise HTTPException(409, "A complete generated activation preview is required")
    before = {"enabled": settings.schedule_enabled, "next_run": settings.next_run}
    settings.schedule_enabled = data.enabled
    settings.next_run = calculate_next_run(settings) if data.enabled else 0
    settings.updated = now()
    audit(db, user, "ai_news.schedule.changed", "news_settings", "1", before=before, after={"enabled": settings.schedule_enabled, "next_run": settings.next_run})
    db.commit()
    return {"enabled": settings.schedule_enabled, "next_run": settings.next_run}



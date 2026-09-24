"""AI-news workspace status, run history, details, previews, and schedule controls."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select

from ...dependencies import database
from ...models import AutomatedEdition, NewsAlert, NewsAlertReceipt, NewsCandidate, NewsClaim, NewsDocument, NewsJob, NewsRun, NewsSetting, NewsUsage, User
from ...schemas import NewsPinPayload, NewsPreviewPayload, NewsSchedulePayload
from ...services.admin_audit import audit
from ...services.administration import require_admin
from ...services.ai_news.publication import publish_edition
from ...services.ai_news.readiness import readiness
from ...services.ai_news.extraction import extract_source
from ...services.ai_news.safe_fetch import SafeFetchError, fetch_public_document
from ...services.ai_news.scheduler import active_run, calculate_next_run, create_run
from ...services.step_up import require_step_up
from ...utils import now
from .serializers import candidate_summary, document_summary, edition_summary, job_summary, run_summary

router = APIRouter()


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
    """Start a current or up-to-30-day historical no-publication run."""
    run, created = create_run(db, "preview", False, requested_by=user.id, historical_days=data.historical_days)
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
    for document in db.scalars(select(NewsDocument).where(NewsDocument.run_id == run.id, NewsDocument.official.is_(True))):
        try:
            current = fetch_public_document(document.canonical_url)
        except SafeFetchError as error:
            raise HTTPException(409, f"Official source recheck failed: {error}") from error
        if extract_source(current).content_hash != document.content_hash:
            raise HTTPException(409, "An official source changed; run a new preview before publishing")
    for candidate in db.scalars(select(NewsCandidate).where(NewsCandidate.run_id == run.id, NewsCandidate.status == "qualifying")):
        newer = db.scalar(select(NewsCandidate).where(NewsCandidate.normalized_key == candidate.normalized_key, NewsCandidate.status == "published", NewsCandidate.run_id != run.id))
        if newer:
            raise HTTPException(409, "A release in this preview was already published")
    post = publish_edition(db, run, edition)
    audit(db, user, "ai_news.preview.published", "post", post.id)
    db.commit()
    return {"post_id": post.id}


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



"""Checkpointed AI-news stage execution, leasing, retries, and terminal alerts."""

from datetime import datetime, timezone
import os
from urllib.parse import urlsplit

from sqlalchemy import delete, select, update

from ...config import NEWS_JOB_LEASE_SECONDS, NEWS_RETRY_SECONDS, NEWS_SNAPSHOT_SECONDS
from ...database import SessionLocal
from ...models import AutomatedEdition, NewsCandidate, NewsClaim, NewsDocument, NewsJob, NewsRun, NewsSetting
from ...utils import new_id, now
from .classification import classify_releases
from .composition import compose_roundup
from .discovery import discover_candidates
from .extraction import extract_source
from .monitoring import monitor_recent_sources
from .notifications import create_alert
from .providers.openai import NewsProviderError
from .publication import publish_edition
from .readiness import require_run_readiness
from .registry import match_official_source, suggest_unknown_source
from .retention import run_retention
from .safe_fetch import SafeFetchError, fetch_public_document
from .safety import publication_safety
from .scheduler import promote_waiting_run
from .verification import verify_with_repairs

STAGES = ("readiness", "monitor", "discover", "fetch", "classify", "compose", "verify", "safety", "finalize", "retention")
PROGRESS = {stage: int(index * 100 / len(STAGES)) for index, stage in enumerate(STAGES)}
RETRYABLE_CODES = {"broad_discovery_unavailable", "official_registry_unavailable"}


class PipelineTerminalError(RuntimeError):
    """Stop a run immediately when retrying cannot change a gated result."""


def _stage_readiness(db, run: NewsRun) -> dict:
    """Require mandatory configuration and attach degradable readiness warnings."""
    status = require_run_readiness(db)
    run.warnings = list(dict.fromkeys([*run.warnings, *status["warnings"]]))
    return status


def _stage_monitor(db, run: NewsRun) -> dict:
    """Check recent published sources before researching the new edition."""
    return monitor_recent_sources(db, run)


def _stage_discover(db, run: NewsRun) -> dict:
    """Persist normalized discovery metadata while keeping snippets non-authoritative."""
    discovered = discover_candidates(db, run)
    for value in discovered:
        if value.get("discovered_by") != "registry" and not match_official_source(db, value["url"]):
            suggest_unknown_source(db, value.get("provider") or (urlsplit(value["url"]).hostname or ""), value["url"], value.get("discovered_by", "web"), {"title": value.get("title", "")})
    run.result = {**run.result, "discovered": discovered}
    return {"candidates": len(discovered)}


def _stage_fetch(db, run: NewsRun) -> dict:
    """Safely fetch discovered pages and store bounded untrusted source snapshots."""
    db.execute(delete(NewsDocument).where(NewsDocument.run_id == run.id))
    fetched_count = official_count = 0
    errors: list[dict] = []
    seen: set[str] = set()
    for candidate in run.result.get("discovered", []):
        try:
            fetched = fetch_public_document(str(candidate.get("url", "")))
            if fetched.canonical_url in seen:
                continue
            seen.add(fetched.canonical_url)
            extracted = extract_source(fetched)
            source = match_official_source(db, fetched.canonical_url)
            official = bool(source)
            db.add(
                NewsDocument(
                    id=new_id(),
                    run_id=run.id,
                    source_id=source.id if source else None,
                    url=fetched.url,
                    canonical_url=fetched.canonical_url,
                    mime=fetched.media_type,
                    content_hash=extracted.content_hash,
                    extracted_text=extracted.text,
                    warnings=extracted.warnings,
                    official=official,
                    snapshot_expires=now() + NEWS_SNAPSHOT_SECONDS,
                )
            )
            fetched_count += 1
            official_count += int(official)
        except (SafeFetchError, ValueError) as error:
            errors.append({"url": str(candidate.get("url", ""))[:500], "code": str(error)[:120]})
    if official_count == 0:
        raise RuntimeError("official_registry_unavailable")
    run.warnings = [*run.warnings, *[f"fetch:{value['code']}" for value in errors[:20]]]
    return {"fetched": fetched_count, "official": official_count, "failed": len(errors)}


def _stage_classify(db, run: NewsRun) -> dict:
    """Create only qualifying, evidence-backed, nonduplicate release records."""
    # A stage retry rebuilds its checkpoint from retained source documents so a
    # half-finished provider response cannot duplicate candidates or claims.
    db.execute(delete(NewsClaim).where(NewsClaim.run_id == run.id))
    db.execute(delete(NewsCandidate).where(NewsCandidate.run_id == run.id))
    candidates = classify_releases(db, run)
    run.result = {**run.result, "qualifying": len(candidates)}
    return {"qualifying": len(candidates)}


def _stage_compose(db, run: NewsRun) -> dict:
    """Create one private bilingual structured edition or mark a quiet run."""
    documents, citations = compose_roundup(db, run)
    if not documents:
        run.result = {**run.result, "quiet": True}
        return {"quiet": True}
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run.id))
    if not edition:
        edition = AutomatedEdition(id=new_id(), run_id=run.id)
        db.add(edition)
    edition.documents = documents
    edition.source_count = len(citations)
    edition.status = "composed"
    edition.updated = now()
    run.result = {**run.result, "edition_id": edition.id}
    return {"edition_id": edition.id, "sources": len(citations)}


def _stage_verify(db, run: NewsRun) -> dict:
    """Independently verify and repair the complete bilingual edition twice at most."""
    if run.result.get("quiet"):
        return {"quiet": True}
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run.id))
    documents, report = verify_with_repairs(db, run, edition.documents)
    edition.documents = documents
    edition.verification = report
    edition.updated = now()
    if not report.get("passed"):
        raise PipelineTerminalError("verification_failed_after_repairs")
    edition.status = "verified"
    edition.verified_at = now()
    return {"passed": True, "model": report.get("model", "")}


def _stage_safety(db, run: NewsRun) -> dict:
    """Apply deterministic and moderation gates to both public languages."""
    if run.result.get("quiet"):
        return {"quiet": True}
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run.id))
    report = publication_safety(db, run, edition.documents)
    edition.verification = {**edition.verification, "safety": report}
    edition.updated = now()
    if not report["passed"]:
        raise PipelineTerminalError("publication_safety_failed")
    edition.status = "verified_preview"
    return report


def _stage_finalize(db, run: NewsRun) -> dict:
    """Advance a quiet cursor, retain a preview, or atomically publish a verified edition."""
    settings = db.get(NewsSetting, 1)
    if run.result.get("quiet"):
        run.status = "quiet"
        run.completed = now()
        run.result = {**run.result, "terminal_status": "quiet"}
        if run.kind in {"scheduled", "catchup"}:
            settings.last_successful_scan = max(settings.last_successful_scan, run.window_end)
            settings.updated = now()
        return {"quiet": True}
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run.id))
    if not edition or edition.status != "verified_preview":
        raise PipelineTerminalError("verified_edition_missing")
    # Every nonempty verified preview proves the full live pipeline for schedule activation.
    settings.activation_preview_run_id = run.id
    settings.updated = now()
    if run.publication_intent:
        post = publish_edition(db, run, edition)
        run.result = {**run.result, "terminal_status": "published"}
        return {"published": True, "post_id": post.id}
    run.status = "preview"
    run.completed = now()
    run.result = {**run.result, "terminal_status": "preview"}
    edition.status = "verified_preview"
    return {"preview": True, "edition_id": edition.id}


def _stage_retention(db, run: NewsRun) -> dict:
    """Apply snapshot and operational retention after the run reaches an outcome."""
    result = run_retention(db)
    run.status = str(run.result.get("terminal_status", "preview"))
    run.progress = 100
    run.completed = run.completed or now()
    return result


HANDLERS = {
    "readiness": _stage_readiness,
    "monitor": _stage_monitor,
    "discover": _stage_discover,
    "fetch": _stage_fetch,
    "classify": _stage_classify,
    "compose": _stage_compose,
    "verify": _stage_verify,
    "safety": _stage_safety,
    "finalize": _stage_finalize,
    "retention": _stage_retention,
}


def reclaim_expired_jobs(db) -> int:
    """Return abandoned processing stages to retry state after their lease expires."""
    result = db.execute(
        update(NewsJob)
        .where(NewsJob.status == "processing", NewsJob.lease_until < now())
        .values(status="retrying", lease_owner=None, available_at=now(), last_error="worker_lease_expired", updated=now())
    )
    db.commit()
    return int(result.rowcount or 0)


def claim_next_job(db, worker_id: str) -> NewsJob | None:
    """Lease one available stage using row locking so workers cannot duplicate work."""
    job = db.scalar(
        select(NewsJob)
        .where(NewsJob.status.in_(["pending", "retrying"]), NewsJob.available_at <= now())
        .order_by(NewsJob.available_at, NewsJob.updated)
        .with_for_update(skip_locked=True)
    )
    if not job:
        return None
    run = db.get(NewsRun, job.run_id)
    job.status = "processing"
    job.attempts += 1
    job.lease_owner = worker_id
    job.lease_until = now() + NEWS_JOB_LEASE_SECONDS
    job.updated = now()
    run.status = "running"
    run.stage = job.stage
    run.progress = PROGRESS[job.stage]
    run.lease_owner = worker_id
    run.lease_until = job.lease_until
    run.started = run.started or now()
    db.commit()
    return job


def _complete_stage(db, job: NewsJob, run: NewsRun, checkpoint: dict) -> None:
    """Checkpoint a successful stage and enqueue its unique successor."""
    job.status = "done"
    job.checkpoint = checkpoint
    job.lease_owner = None
    job.lease_until = 0
    job.updated = now()
    index = STAGES.index(job.stage)
    if index + 1 < len(STAGES):
        next_stage = STAGES[index + 1]
        if not db.scalar(select(NewsJob).where(NewsJob.run_id == run.id, NewsJob.stage == next_stage)):
            db.add(NewsJob(run_id=run.id, stage=next_stage, idempotency_key=f"{run.id}:{next_stage}"))
        run.stage = next_stage
        run.progress = PROGRESS[next_stage]
    else:
        run.progress = 100
    run.lease_owner = None
    run.lease_until = 0


def _fail_stage(db, job: NewsJob, run: NewsRun, code: str, retry_after: float = 0, terminal: bool = False) -> None:
    """Retry a transient stage three times or retain a terminal action-required run."""
    safe_code = code[:240]
    job.last_error = safe_code
    job.lease_owner = None
    job.lease_until = 0
    job.updated = now()
    run.last_error = safe_code
    run.lease_owner = None
    run.lease_until = 0
    if not terminal and job.attempts <= len(NEWS_RETRY_SECONDS):
        delay = max(float(NEWS_RETRY_SECONDS[job.attempts - 1]), retry_after)
        job.status = "retrying"
        job.available_at = now() + delay
        run.status = "retrying"
        return
    job.status = "failed"
    run.status = "failed"
    run.completed = now()
    create_alert(db, run, "pipeline_failed", "Weekly AI-news run needs attention", f"Run {run.id} stopped at {job.stage}: {safe_code}")


def process_job(job_id: str) -> str:
    """Execute one leased stage and persist success, retry, or terminal failure atomically."""
    with SessionLocal() as db:
        job = db.get(NewsJob, job_id)
        if not job or job.status != "processing":
            return "skipped"
        run = db.get(NewsRun, job.run_id)
        try:
            checkpoint = HANDLERS[job.stage](db, run)
            _complete_stage(db, job, run, checkpoint)
            db.commit()
            return "done"
        except PipelineTerminalError as error:
            _fail_stage(db, job, run, str(error), terminal=True)
            db.commit()
            return "failed"
        except NewsProviderError as error:
            _fail_stage(db, job, run, error.code, error.retry_after)
            db.commit()
            return "retrying" if job.status == "retrying" else "failed"
        except RuntimeError as error:
            code = str(error)
            _fail_stage(db, job, run, code, terminal=code not in RETRYABLE_CODES)
            db.commit()
            return "retrying" if job.status == "retrying" else "failed"
        except Exception:
            _fail_stage(db, job, run, "unexpected_stage_error")
            db.commit()
            return "retrying" if job.status == "retrying" else "failed"


def run_one_worker_cycle(worker_id: str | None = None) -> bool:
    """Reclaim leases, process one available job, and promote a waiting schedule afterward."""
    identity = worker_id or f"news-worker:{os.getpid()}"
    with SessionLocal() as db:
        reclaim_expired_jobs(db)
        job = claim_next_job(db, identity)
    if not job:
        with SessionLocal() as db:
            promote_waiting_run(db)
        return False
    process_job(job.id)
    with SessionLocal() as db:
        promote_waiting_run(db)
    return True

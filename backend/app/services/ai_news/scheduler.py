"""Timezone-aware weekly scheduling, catch-up collapse, and one-run concurrency."""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from ...config import NEWS_MASTER_ENABLED
from ...models import NewsJob, NewsRun, NewsSetting
from ...utils import new_id, now

ACTIVE_STATUSES = {"pending", "running", "retrying"}
TERMINAL_STATUSES = {"published", "preview", "quiet", "failed", "unpublished"}
FIRST_STAGE = "readiness"


def calculate_next_run(settings: NewsSetting, after: float | None = None) -> float:
    """Return the next configured local weekday/time strictly after the supplied instant."""
    zone = ZoneInfo(settings.timezone)
    local = datetime.fromtimestamp(after or now(), tz=zone)
    days = (settings.weekday - local.weekday()) % 7
    candidate = (local + timedelta(days=days)).replace(hour=settings.hour, minute=settings.minute, second=0, microsecond=0)
    if candidate <= local:
        candidate += timedelta(days=7)
    return candidate.timestamp()


def scan_window(settings: NewsSetting, end: float, historical_days: int | None = None) -> tuple[float, float]:
    """Use an optional activation range or the successful cursor with the accepted overlap."""
    if historical_days is not None:
        return end - min(max(historical_days, 1), 30) * 86400, end
    start = settings.last_successful_scan - 2 * 86400 if settings.last_successful_scan else end - 9 * 86400
    return start, end


def active_run(db) -> NewsRun | None:
    """Return the one active run protected by the database partial unique index."""
    return db.scalar(select(NewsRun).where(NewsRun.status.in_(ACTIVE_STATUSES)).order_by(NewsRun.created))


def create_run(db, kind: str, publication_intent: bool, requested_by: str | None = None, historical_days: int | None = None, idempotency_key: str | None = None, waiting: bool = False, verify_for_activation: bool = False) -> tuple[NewsRun, bool]:
    """Create one durable run, atomically recording an optional full-path preview policy."""
    existing = active_run(db)
    if existing and not waiting:
        return existing, False
    if waiting:
        # Collapse all missed starts into one waiting catch-up while another run owns the slot.
        queued = db.scalar(select(NewsRun).where(NewsRun.status == "waiting").order_by(NewsRun.created))
        if queued:
            return queued, False
    settings = db.get(NewsSetting, 1)
    end = now()
    start, end = scan_window(settings, end, historical_days)
    run = NewsRun(
        id=new_id(),
        kind=kind,
        status="waiting" if waiting else "pending",
        stage=FIRST_STAGE,
        publication_intent=publication_intent,
        historical=historical_days is not None,
        window_start=start,
        window_end=end,
        requested_by=requested_by,
        idempotency_key=idempotency_key or f"manual:{new_id()}",
        result={"verify_for_activation": True} if kind == "preview" and verify_for_activation else {},
    )
    db.add(run)
    db.flush()
    if not waiting:
        db.add(NewsJob(run_id=run.id, stage=FIRST_STAGE, idempotency_key=f"{run.id}:{FIRST_STAGE}"))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        current = active_run(db)
        if current:
            return current, False
        raise
    return run, True


def promote_waiting_run(db) -> NewsRun | None:
    """Start the oldest waiting scheduled request after the active slot becomes free."""
    if active_run(db):
        return None
    waiting = db.scalar(select(NewsRun).where(NewsRun.status == "waiting").order_by(NewsRun.created).with_for_update(skip_locked=True))
    if not waiting:
        return None
    settings = db.get(NewsSetting, 1)
    waiting.window_start, waiting.window_end = scan_window(settings, now())
    waiting.status = "pending"
    db.add(NewsJob(run_id=waiting.id, stage=FIRST_STAGE, idempotency_key=f"{waiting.id}:{FIRST_STAGE}"))
    db.commit()
    return waiting


def enqueue_due_schedule(db) -> NewsRun | None:
    """Create one normal or catch-up request when the enabled durable schedule is overdue."""
    settings = db.scalar(select(NewsSetting).where(NewsSetting.id == 1).with_for_update())
    if not NEWS_MASTER_ENABLED or not settings.schedule_enabled:
        return None
    if settings.next_run <= 0:
        settings.next_run = calculate_next_run(settings)
        db.commit()
        return None
    if settings.next_run > now():
        return None
    due = settings.next_run
    key = f"scheduled:{int(due)}"
    existing = db.scalar(select(NewsRun).where(NewsRun.idempotency_key == key))
    if existing:
        settings.next_run = calculate_next_run(settings, due)
        db.commit()
        return existing
    current = active_run(db)
    # More than one day late is displayed as a catch-up, while both kinds use the cursor window.
    kind = "catchup" if now() - due > 86400 else "scheduled"
    run, _ = create_run(db, kind, True, idempotency_key=key, waiting=bool(current))
    settings = db.get(NewsSetting, 1)
    settings.next_run = calculate_next_run(settings, due)
    db.commit()
    return run

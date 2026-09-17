"""Tiered deletion of source snapshots and ordinary AI-news operational records."""

from sqlalchemy import delete, select, update

from ...config import NEWS_FAILED_RETENTION_SECONDS, NEWS_OPERATION_RETENTION_SECONDS
from ...models import NewsDocument, NewsRun, NewsSourceCheck
from ...utils import now


def expire_source_snapshots(db) -> int:
    """Clear expired full extracted text while permanently preserving hash and metadata."""
    identifiers = list(db.scalars(select(NewsDocument.id).where(NewsDocument.snapshot_expires > 0, NewsDocument.snapshot_expires <= now(), NewsDocument.extracted_text != "")))
    if identifiers:
        db.execute(update(NewsDocument).where(NewsDocument.id.in_(identifiers)).values(extracted_text=""))
    return len(identifiers)


def delete_expired_operational_runs(db) -> int:
    """Delete old unpinned failed/preview runs and ordinary quiet runs under their retention tiers."""
    failed_cutoff = now() - NEWS_FAILED_RETENTION_SECONDS
    operation_cutoff = now() - NEWS_OPERATION_RETENTION_SECONDS
    # A pinned flag lives in result JSON so retention can remain additive without another column.
    records = list(db.scalars(select(NewsRun).where(NewsRun.completed > 0)))
    removable = [
        record.id
        for record in records
        if not record.result.get("pinned")
        and ((record.status in {"failed", "preview"} and record.completed < failed_cutoff) or (record.status == "quiet" and record.completed < operation_cutoff))
    ]
    if removable:
        db.execute(delete(NewsRun).where(NewsRun.id.in_(removable)))
    return len(removable)


def run_retention(db) -> dict:
    """Apply all current retention tiers inside the caller's transaction."""
    return {"snapshots_cleared": expire_source_snapshots(db), "runs_deleted": delete_expired_operational_runs(db)}

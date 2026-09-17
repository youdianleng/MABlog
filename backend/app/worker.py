"""Dedicated durable OpenAI passage-indexing worker and administrator recovery commands."""
import argparse
import time

from sqlalchemy import or_, select, update

from .config import GLOBAL_INDEXED_PASSAGES_PER_DAY, INDEX_RETRY_SECONDS, INDEX_WORKER_POLL_SECONDS, OPENAI_EMBEDDING_MODEL
from .database import SessionLocal
from .models import IndexingJob, SearchPassage
from .services.capacity import consume_capacity, seconds_until_window_reset
from .services.embeddings import OpenAIServiceError, cloud_ai_configured, embed_texts
from .services.indexing import prepare_all_posts
from .utils import now

# A worker interrupted for ten minutes is safe to reclaim because revision checks reject stale output.
PROCESSING_LEASE_SECONDS = 600
# One initial attempt plus the five documented delayed retries may run before terminal failure.
MAX_INDEX_ATTEMPTS = len(INDEX_RETRY_SECONDS) + 1


def claim_job() -> tuple[str, str] | None:
    """Atomically lease one due or abandoned latest-revision job across worker replicas."""
    with SessionLocal() as db:
        job = db.scalar(
            select(IndexingJob)
            .where(
                or_(
                    (IndexingJob.status == "pending") & (IndexingJob.available_at <= now()),
                    (IndexingJob.status == "processing") & (IndexingJob.updated <= now() - PROCESSING_LEASE_SECONDS),
                )
            )
            .order_by(IndexingJob.available_at, IndexingJob.post_id)
            .with_for_update(skip_locked=True)
            .limit(1)
        )
        if not job:
            return None
        job.status = "processing"
        job.updated = now()
        result = (job.post_id, job.revision_hash)
        db.commit()
        return result


def defer_job(post_id: str, revision_hash: str, delay_seconds: float) -> None:
    """Return a current leased job to pending without consuming a failure attempt."""
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        if job and job.revision_hash == revision_hash:
            job.status = "pending"
            job.available_at = now() + delay_seconds
            job.updated = now()
            db.commit()


def record_failure(post_id: str, revision_hash: str, error_code: str) -> None:
    """Schedule an increasing retry or expose a terminal creator-visible failed state."""
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        if not job or job.revision_hash != revision_hash:
            return
        job.attempts += 1
        job.last_error = error_code[:120]
        job.updated = now()
        if job.attempts >= MAX_INDEX_ATTEMPTS:
            job.status = "failed"
        else:
            job.status = "pending"
            job.available_at = now() + INDEX_RETRY_SECONDS[job.attempts - 1]
        db.commit()


def process_job(post_id: str, revision_hash: str) -> bool:
    """Embed one leased revision outside a transaction and commit only if it remains current."""
    if not cloud_ai_configured():
        defer_job(post_id, revision_hash, 60)
        return False
    with SessionLocal() as db:
        passages = list(
            db.scalars(
                select(SearchPassage)
                .where(SearchPassage.post_id == post_id, SearchPassage.revision_hash == revision_hash)
                .order_by(SearchPassage.reading_order, SearchPassage.chunk_index, SearchPassage.id)
            )
        )
        passage_ids = [item.id for item in passages]
        texts = [item.content for item in passages]
    if not texts:
        with SessionLocal() as db:
            job = db.get(IndexingJob, post_id)
            if job and job.revision_hash == revision_hash:
                job.status = "done"
                job.last_error = ""
                job.updated = now()
                db.commit()
        return True
    if not consume_capacity("index-passages-day", "application", GLOBAL_INDEXED_PASSAGES_PER_DAY, 86400, len(texts)):
        defer_job(post_id, revision_hash, seconds_until_window_reset(86400))
        return False
    try:
        vectors = embed_texts(texts)
    except OpenAIServiceError as error:
        record_failure(post_id, revision_hash, str(error))
        return False
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        if not job or job.revision_hash != revision_hash:
            return False
        for passage_id, vector in zip(passage_ids, vectors, strict=True):
            passage = db.get(SearchPassage, passage_id)
            if passage and passage.revision_hash == revision_hash:
                passage.embedding = vector
                passage.embedding_model = OPENAI_EMBEDDING_MODEL
        job.status = "done"
        job.last_error = ""
        job.updated = now()
        db.commit()
    return True


def process_next_job() -> bool:
    """Claim and process one job, returning whether any due work was found."""
    job = claim_job()
    if not job:
        return False
    process_job(*job)
    return True


def retry_failed_jobs() -> int:
    """Reset terminal jobs for administrator-directed recovery without changing passages."""
    with SessionLocal() as db:
        result = db.execute(
            update(IndexingJob)
            .where(IndexingJob.status == "failed")
            .values(status="pending", attempts=0, last_error="", available_at=now(), updated=now())
        )
        db.commit()
        return int(result.rowcount or 0)


def run_worker(prepared: int) -> None:
    """Poll durable jobs until the container stops after reporting prepared keyword records."""
    print(f"Prepared search records for {prepared} posts.", flush=True)
    while True:
        if not process_next_job():
            time.sleep(INDEX_WORKER_POLL_SECONDS)


def main() -> None:
    """Expose rollout preparation, one-shot work, retry, and continuous worker modes."""
    parser = argparse.ArgumentParser(description="MAblog search indexing worker")
    parser.add_argument("--prepare-only", action="store_true", help="Create keyword passages and queue eligible vectors, then exit")
    parser.add_argument("--once", action="store_true", help="Prepare passages and process at most one due job")
    parser.add_argument("--retry-failed", action="store_true", help="Reset all failed jobs to pending, then exit")
    arguments = parser.parse_args()
    if arguments.retry_failed:
        print(f"Reset {retry_failed_jobs()} failed indexing jobs.")
        return
    with SessionLocal() as db:
        prepared = prepare_all_posts(db)
    if arguments.prepare_only:
        print(f"Prepared search records for {prepared} posts.")
        return
    if arguments.once:
        print("Processed one indexing job." if process_next_job() else "No indexing job was due.")
        return
    run_worker(prepared)


if __name__ == "__main__":
    main()

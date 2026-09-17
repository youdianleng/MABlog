"""Dedicated durable AI-news worker and local administrator recovery commands."""

import argparse
import time

from sqlalchemy import select

from .config import NEWS_WORKER_POLL_SECONDS
from .database import SessionLocal
from .models import NewsJob, NewsRun
from .services.ai_news.scheduler import enqueue_due_schedule
from .services.ai_news.state_machine import run_one_worker_cycle
from .utils import now


def work_forever() -> None:
    """Poll the durable scheduler and stage queue without keeping state in process memory."""
    while True:
        with SessionLocal() as db:
            enqueue_due_schedule(db)
        processed = run_one_worker_cycle()
        if not processed:
            time.sleep(NEWS_WORKER_POLL_SECONDS)


def retry_run(run_id: str) -> bool:
    """Reset only the failed stage of an administrator-selected retained run."""
    with SessionLocal() as db:
        run = db.get(NewsRun, run_id)
        job = db.scalar(select(NewsJob).where(NewsJob.run_id == run_id, NewsJob.status == "failed")) if run else None
        if not run or not job:
            return False
        job.status = "retrying"
        job.attempts = 0
        job.available_at = now()
        job.last_error = ""
        run.status = "retrying"
        run.last_error = ""
        run.completed = 0
        db.commit()
        return True


def main() -> None:
    """Run the worker or an explicit failed-stage recovery command."""
    parser = argparse.ArgumentParser(description="MAblog durable AI-news worker")
    parser.add_argument("--retry-run", default="")
    parser.add_argument("--once", action="store_true")
    arguments = parser.parse_args()
    if arguments.retry_run:
        raise SystemExit(0 if retry_run(arguments.retry_run) else 1)
    if arguments.once:
        run_one_worker_cycle()
        return
    work_forever()


if __name__ == "__main__":
    main()

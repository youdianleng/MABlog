"""Service health endpoint."""
import redis
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from ..dependencies import database
from ..models import IndexingJob, NewsJob, NewsRun
from ..services.ai_news.readiness import readiness
from ..services.embeddings import cloud_ai_configured
from ..services.public_cache import cache

router = APIRouter()

@router.get("/health")
def health(db=Depends(database)):
    """Check database availability and report cache degradation separately."""
    db.execute(select(1))
    try:
        cached = cache.ping()
    except redis.RedisError:
        cached = False
    pending = db.scalar(select(func.count()).select_from(IndexingJob).where(IndexingJob.status.in_(["pending", "processing"])))
    failed = db.scalar(select(func.count()).select_from(IndexingJob).where(IndexingJob.status == "failed"))
    news_pending = db.scalar(select(func.count()).select_from(NewsJob).where(NewsJob.status.in_(["pending", "processing", "retrying"])))
    news_failed = db.scalar(select(func.count()).select_from(NewsRun).where(NewsRun.status == "failed"))
    return {"status": "ok", "database": True, "redis": cached, "ai_configured": cloud_ai_configured(), "indexing": {"pending": pending, "failed": failed}, "ai_news": {"readiness": readiness(db), "pending_jobs": news_pending, "failed_runs": news_failed}}


"""Composition root for focused administrator AI-news route groups."""

from fastapi import APIRouter

from . import dashboard, editions, notifications, sources

router = APIRouter(prefix="/admin/ai-news", tags=["ai-news administration"])
router.include_router(dashboard.router)
router.include_router(sources.router)
router.include_router(notifications.router)
router.include_router(editions.router)



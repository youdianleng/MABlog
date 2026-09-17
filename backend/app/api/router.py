"""Composition root for independently maintained API route groups."""
from fastapi import APIRouter
from . import administrators, ai_news, auth, collaboration, health, media, posts, profiles, search

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(posts.router)
api_router.include_router(collaboration.router)
api_router.include_router(profiles.router)
api_router.include_router(media.router)
api_router.include_router(search.router)
api_router.include_router(administrators.router)
api_router.include_router(ai_news.router)



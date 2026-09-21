"""Public collection, reader, publication, workspace, and like endpoints."""
import json
import redis
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, select, update
from ..dependencies import current_user, database, signed_in
from ..config import CACHE_SECONDS, LIKE_WINDOW_SECONDS, UPLOAD_DIR
from ..models import Draft, Grant, Like, Media, Post, Proposal, User
from ..schemas import Document, DraftPayload, PostCategory, PublicationPayload
from ..services.documents import clean_document, media_ids, targets
from ..services.indexing import synchronize_post_search
from ..services.permissions import require_post, role_for
from ..services.posts import apply_target, ensure_publishable, post_summary, submitted_media, user_profile, validate_media
from ..services.public_cache import cache, invalidate_public_cache
from ..utils import now

router = APIRouter()
PUBLIC_POST_PAGE_LIMIT = 50
PUBLIC_POST_NAVIGATION_SIZE = 15

@router.get("/posts")
def public_posts(offset: int = 0, limit: int = Query(PUBLIC_POST_PAGE_LIMIT, ge=1, le=PUBLIC_POST_PAGE_LIMIT), category: PostCategory | None = None, language: Literal["en", "es"] = "en", user=Depends(current_user), db=Depends(database)):
    """Filter approved public metadata before bounded pagination; legacy posts default to General."""
    query = select(Post).where(Post.public.is_(True))
    if category is not None:
        # JSON metadata already participates in creator approval; no duplicate category column is needed.
        query = query.where(func.coalesce(Post.document["details"]["category"].as_string(), "general") == category)
    posts = db.scalars(query.order_by(Post.published.desc(), Post.id).offset(max(0, offset)).limit(limit))
    return [post_summary(db, post, user, language) for post in posts]


@router.get("/posts/page")
def public_post_page(page: int = Query(1, ge=1), page_size: int = Query(PUBLIC_POST_NAVIGATION_SIZE, ge=1, le=PUBLIC_POST_NAVIGATION_SIZE), category: PostCategory | None = None, language: Literal["en", "es"] = "en", user=Depends(current_user), db=Depends(database)):
    """Return one numbered public-post page plus the filtered total for navigation."""
    visibility = [Post.public.is_(True)]
    if category is not None:
        # Count and item queries must use the same approved metadata predicate.
        visibility.append(func.coalesce(Post.document["details"]["category"].as_string(), "general") == category)
    total = db.scalar(select(func.count()).select_from(Post).where(*visibility)) or 0
    posts = db.scalars(
        select(Post)
        .where(*visibility)
        .order_by(Post.published.desc(), Post.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    # At least one page keeps the empty collection navigation state understandable.
    page_count = max(1, (total + page_size - 1) // page_size)
    return {
        "items": [post_summary(db, post, user, language) for post in posts],
        "page": page,
        "page_size": page_size,
        "pages": page_count,
        "total": total,
    }


@router.get("/carousel")
def carousel(language: Literal["en", "es"] = "en", user=Depends(current_user), db=Depends(database)):
    """Cache ranking candidates for 15 seconds while rechecking visibility on every read."""
    identifiers = None
    try:
        saved = cache.get("carousel")
        identifiers = json.loads(saved) if saved else None
    except (redis.RedisError, ValueError):
        pass
    if identifiers is None:
        ranking = select(Post.id, Post.kind).outerjoin(Like, (Like.post_id == Post.id) & (Like.created >= now() - LIKE_WINDOW_SECONDS)).where(Post.public.is_(True)).group_by(Post.id).order_by(func.count(Like.user_id).desc(), Post.published.desc(), Post.id).limit(25)
        identifiers = []
        ai_news_selected = False
        for identifier, kind in db.execute(ranking):
            # One automated roundup may appear, leaving most featured space for community authors.
            if kind == "ai_news" and ai_news_selected:
                continue
            identifiers.append(identifier)
            ai_news_selected = ai_news_selected or kind == "ai_news"
            if len(identifiers) == 5:
                break
        try:
            cache.set("carousel", json.dumps(identifiers), ex=CACHE_SECONDS)
        except redis.RedisError:
            pass
    result = []
    for identifier in identifiers:
        post = db.get(Post, identifier)
        # The cache contains only IDs. Private titles, covers, and content never come from it.
        if post and post.public:
            result.append(post_summary(db, post, user, language))
    return result


@router.get("/workspace")
def workspace(user=Depends(signed_in), db=Depends(database)):
    """List owned/shared posts and count proposals awaiting this creator's review."""
    owned = list(db.scalars(select(Post).where(Post.author_id == user.id).order_by(Post.created.desc())))
    shared = db.scalars(select(Post).join(Grant, Grant.post_id == Post.id).where(Grant.user_id == user.id))
    return {"owned": [post_summary(db, p, user) for p in owned], "shared": [post_summary(db, p, user) for p in shared], "reviews": [{"id": p.id, "title": p.document["details"]["title"], "count": db.scalar(select(func.count()).select_from(Proposal).where(Proposal.post_id == p.id, Proposal.status == "pending"))} for p in owned]}


@router.post("/posts")
def create_post(user=Depends(signed_in), db=Depends(database)):
    """Create an empty personal composition for the signed-in author."""
    post = Post(author_id=user.id, document=Document().model_dump(), versions={})
    db.add(post)
    db.commit()
    return {"id": post.id}


@router.get("/posts/{post_id}")
def read_post(post_id: str, language: Literal["en", "es"] = "en", user=Depends(current_user), db=Depends(database)):
    """Return approved content and a creator-only count of pending review decisions."""
    post = require_post(db, post_id, user)
    pending_reviews = (
        db.scalar(
            select(func.count())
            .select_from(Proposal)
            .where(Proposal.post_id == post.id, Proposal.status == "pending")
        )
        if user and user.id == post.author_id
        else 0
    )
    return {
        **post_summary(db, post, user, language),
        "document": post.document,
        "versions": post.versions,
        "pending_reviews": pending_reviews,
    }


@router.post("/posts/{post_id}/publication")
def publication(post_id: str, data: PublicationPayload, user=Depends(signed_in), db=Depends(database)):
    """Let the creator publish or unpublish while preserving explicit sharing grants."""
    post = require_post(db, post_id, user, ["author"], lock=True)
    state = data.public
    if state:
        ensure_publishable(post.document)
        if not post.public:
            post.published = now()
    post.public = state
    # Publication changes whether vectors are automatic or require author consent.
    synchronize_post_search(db, post)
    db.commit()
    invalidate_public_cache()
    return {"ok": True}


@router.delete("/posts/{post_id}")
def delete_post(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Delete only a creator-owned post and its associated private files."""
    post = require_post(db, post_id, user, ["author"], lock=True)
    filenames = list(db.scalars(select(Media.filename).where(Media.post_id == post.id)))
    db.delete(post)
    db.commit()
    for filename in filenames:
        (UPLOAD_DIR / filename).unlink(missing_ok=True)
    invalidate_public_cache()
    return {"ok": True}


@router.post("/posts/{post_id}/like")
def toggle_like(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Toggle one active like; the post lock serializes concurrent requests."""
    post = require_post(db, post_id, user, lock=True)
    if not post.public:
        raise HTTPException(403, "Only public posts can be liked")
    existing = db.get(Like, (post.id, user.id))
    if existing:
        db.delete(existing)
    else:
        db.add(Like(post_id=post.id, user_id=user.id))
    db.commit()
    invalidate_public_cache()
    return post_summary(db, post, user)




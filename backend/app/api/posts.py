"""Public collection, reader, publication, workspace, and like endpoints."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select

from ..config import UPLOAD_DIR
from ..dependencies import current_user, database, signed_in
from ..models import Grant, Like, Media, Post, Proposal
from ..models.posts import post_category_expression
from ..schemas import Document, PostCategory, PublicationPayload
from ..services.carousel import carousel_posts
from ..services.indexing import synchronize_post_search
from ..services.permissions import require_post
from ..services.posts import ensure_publishable, post_summaries, post_summary
from ..services.public_cache import invalidate_public_cache
from ..utils import now

router = APIRouter()
PUBLIC_POST_PAGE_LIMIT = 50
PUBLIC_POST_NAVIGATION_SIZE = 15


@router.get("/posts")
def public_posts(
    offset: int = 0,
    limit: int = Query(PUBLIC_POST_PAGE_LIMIT, ge=1, le=PUBLIC_POST_PAGE_LIMIT),
    category: PostCategory | None = None,
    language: Literal["en", "es"] = "en",
    user=Depends(current_user),
    db=Depends(database),
):
    """Filter approved public metadata before bounded pagination; legacy posts default to General."""
    query = select(Post).where(Post.public.is_(True))
    if category is not None:
        # JSON metadata already participates in creator approval; no duplicate category column is needed.
        query = query.where(post_category_expression() == category)
    posts = list(db.scalars(query.order_by(Post.published.desc(), Post.id).offset(max(0, offset)).limit(limit)))
    return post_summaries(db, posts, user, language)


@router.get("/posts/page")
def public_post_page(
    page: int = Query(1, ge=1),
    page_size: int = Query(PUBLIC_POST_NAVIGATION_SIZE, ge=1, le=PUBLIC_POST_NAVIGATION_SIZE),
    category: PostCategory | None = None,
    language: Literal["en", "es"] = "en",
    user=Depends(current_user),
    db=Depends(database),
):
    """Return one numbered public-post page plus the filtered total for navigation."""
    visibility = [Post.public.is_(True)]
    if category is not None:
        # Count and item queries must use the same approved metadata predicate.
        visibility.append(post_category_expression() == category)
    total = db.scalar(select(func.count()).select_from(Post).where(*visibility)) or 0
    posts = list(db.scalars(select(Post).where(*visibility).order_by(Post.published.desc(), Post.id).offset((page - 1) * page_size).limit(page_size)))
    # At least one page keeps the empty collection navigation state understandable.
    page_count = max(1, (total + page_size - 1) // page_size)
    return {
        "items": post_summaries(db, posts, user, language),
        "page": page,
        "page_size": page_size,
        "pages": page_count,
        "total": total,
    }


@router.get("/carousel")
def carousel(language: Literal["en", "es"] = "en", user=Depends(current_user), db=Depends(database)):
    """Return featured public posts ranked by recent likes; see ``services.carousel`` for caching."""
    return post_summaries(db, carousel_posts(db), user, language)


@router.get("/workspace")
def workspace(user=Depends(signed_in), db=Depends(database)):
    """List owned/shared posts and count proposals awaiting this creator's review."""
    owned = list(db.scalars(select(Post).where(Post.author_id == user.id).order_by(Post.created.desc())))
    shared = list(db.scalars(select(Post).join(Grant, Grant.post_id == Post.id).where(Grant.user_id == user.id)))
    pending = (
        dict(
            db.execute(
                select(Proposal.post_id, func.count())
                .where(Proposal.post_id.in_([post.id for post in owned]), Proposal.status == "pending")
                .group_by(Proposal.post_id)
            ).all()
        )
        if owned
        else {}
    )
    return {
        "owned": post_summaries(db, owned, user),
        "shared": post_summaries(db, shared, user),
        "reviews": [{"id": post.id, "title": post.document["details"]["title"], "count": pending.get(post.id, 0)} for post in owned],
    }


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
        db.scalar(select(func.count()).select_from(Proposal).where(Proposal.post_id == post.id, Proposal.status == "pending"))
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

"""Reusable post presentation, validation, and target-application rules."""
import copy

from fastapi import HTTPException
from sqlalchemy import func, select

from ..config import LIKE_WINDOW_SECONDS
from ..models import AutomatedEdition, Like, Media, Post, PostLocalization, Proposal, User
from ..utils import now
from .documents import clean_document, media_ids
from .indexing import post_search_status
from .permissions import role_for


def user_profile(user: User) -> dict:
    """Expose public profile fields without leaking account email or auth state."""
    return {"id": user.id, "username": user.username, "display_name": user.display_name, "bio": user.bio, "avatar": user.avatar}


def post_summary(db, post: Post, user=None, language: str = "en") -> dict:
    """Present current approved metadata with active rolling-window like counts."""
    count = db.scalar(select(func.count()).select_from(Like).where(Like.post_id == post.id, Like.created >= now() - LIKE_WINDOW_SECONDS))
    localization = db.get(PostLocalization, (post.id, language)) if post.kind == "ai_news" else None
    presentation = localization.document if localization else post.document
    edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.post_id == post.id)) if post.kind == "ai_news" else None
    return {
        "id": post.id,
        "category": "general",
        **presentation["details"],
        "public": post.public,
        "author": user_profile(db.get(User, post.author_id)),
        "likes": count,
        "liked": bool(user and db.get(Like, (post.id, user.id))),
        "role": role_for(db, post, user),
        "created": post.created,
        "kind": post.kind,
        "ai_news_document": presentation if localization else None,
        "ai_news": ({"source_count": edition.source_count, "verified_at": edition.verified_at, "correction_note": edition.correction_note, "fact_check_passed": edition.verification.get("passed") is True, "manual_unverified_preview": bool(edition.verification.get("manual_unverified_preview")), "source_changed_on_publish": bool(((edition.verification.get("manual_override") or edition.verification.get("manual_unverified_preview")) or {}).get("changed_sources"))} if edition else None),
        "search_status": post_search_status(db, post),
    }


def validate_media(db, post: Post, user: User, document: dict) -> None:
    """Reject references to another post or another editor's unapproved private uploads."""
    approved = media_ids(post.document)
    reviewable = submitted_media(db, post.id) if user.id == post.author_id else set()
    for identifier in media_ids(document):
        media = db.get(Media, identifier)
        if not media or media.post_id != post.id or (media.owner_id != user.id and identifier not in approved and identifier not in reviewable):
            raise HTTPException(422, "Media is not available for this post")
    cover = document["details"]["cover"]
    if cover:
        identifiers = media_ids({"cover": cover})
        if len(identifiers) != 1 or cover != f"/api/media/{next(iter(identifiers))}":
            raise HTTPException(422, "Choose an uploaded cover image")
        media = db.get(Media, next(iter(identifiers)))
        if not media.mime.startswith("image/"):
            raise HTTPException(422, "Cover must be an image")


def submitted_media(db, post_id: str) -> set[str]:
    """Find uploads explicitly submitted for review, including retained rejected alternatives."""
    identifiers = set()
    for value in db.scalars(select(Proposal.value).where(Proposal.post_id == post_id)):
        identifiers.update(media_ids(value))
    return identifiers


def apply_target(post: Post, target: str, value: dict | None) -> None:
    """Apply one reviewed target without replacing unrelated approved blocks."""
    document = copy.deepcopy(post.document)
    if target in {"details", "canvas"}:
        document[target] = value
    else:
        block_id = target.removeprefix("block:")
        document["blocks"] = [block for block in document["blocks"] if block["id"] != block_id]
        if value:
            document["blocks"].append(value)
    post.document = clean_document(document)
    # Tombstone counters remain after deletion so an old draft cannot resurrect a block silently.
    post.versions = {**post.versions, target: post.versions.get(target, 0) + 1}


def ensure_publishable(document: dict) -> None:
    """Require carousel-ready metadata whenever a public document is changed."""
    if not document["details"]["title"].strip() or not document["details"]["cover"]:
        raise HTTPException(422, "Public posts require a title and uploaded cover image")


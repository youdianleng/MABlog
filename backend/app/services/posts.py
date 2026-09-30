"""Reusable post presentation, validation, and target-application rules."""

import copy

from fastapi import HTTPException
from sqlalchemy import func, select

from ..config import LIKE_WINDOW_SECONDS
from ..models import AutomatedEdition, Grant, IndexingJob, Like, Media, Post, PostLocalization, Proposal, User
from ..utils import now
from .documents import clean_document, media_ids
from .indexing import search_status_for


def user_profile(user: User) -> dict:
    """Expose public profile fields without leaking account email or auth state."""
    return {"id": user.id, "username": user.username, "display_name": user.display_name, "bio": user.bio, "avatar": user.avatar}


def _edition_badges(edition: AutomatedEdition) -> dict:
    """Summarize an automated edition's public verification disclosures for cards and readers."""
    verification = edition.verification or {}
    exception = verification.get("manual_override") or verification.get("manual_unverified_preview") or {}
    return {
        "source_count": edition.source_count,
        "verified_at": edition.verified_at,
        "correction_note": edition.correction_note,
        "fact_check_passed": verification.get("passed") is True,
        "manual_unverified_preview": bool(verification.get("manual_unverified_preview")),
        "source_changed_on_publish": bool(exception.get("changed_sources")) if isinstance(exception, dict) else False,
    }


def post_summaries(db, posts: list[Post], user: User | None = None, language: str = "en") -> list[dict]:
    """Present many posts with a fixed number of queries instead of several queries per post.

    Rolling-window like counts, the viewer's likes and grants, authors, indexing jobs, and
    AI-news localizations/editions are each loaded in one batched query. Roles follow the same
    rules as ``permissions.role_for``: author, then the viewer's explicit grant, then public reader.
    """
    if not posts:
        return []
    post_ids = [post.id for post in posts]
    like_counts = dict(
        db.execute(
            select(Like.post_id, func.count()).where(Like.post_id.in_(post_ids), Like.created >= now() - LIKE_WINDOW_SECONDS).group_by(Like.post_id)
        ).all()
    )
    liked: set[str] = set()
    grant_roles: dict[str, str] = {}
    if user:
        liked = set(db.scalars(select(Like.post_id).where(Like.post_id.in_(post_ids), Like.user_id == user.id)))
        grant_roles = dict(db.execute(select(Grant.post_id, Grant.role).where(Grant.post_id.in_(post_ids), Grant.user_id == user.id)).all())
    authors = {author.id: author for author in db.scalars(select(User).where(User.id.in_({post.author_id for post in posts})))}
    jobs = {job.post_id: job for job in db.scalars(select(IndexingJob).where(IndexingJob.post_id.in_(post_ids)))}
    news_ids = [post.id for post in posts if post.kind == "ai_news"]
    localizations: dict[str, PostLocalization] = {}
    editions: dict[str, AutomatedEdition] = {}
    if news_ids:
        localizations = {
            item.post_id: item
            for item in db.scalars(select(PostLocalization).where(PostLocalization.post_id.in_(news_ids), PostLocalization.language == language))
        }
        editions = {item.post_id: item for item in db.scalars(select(AutomatedEdition).where(AutomatedEdition.post_id.in_(news_ids)))}

    summaries = []
    for post in posts:
        localization = localizations.get(post.id)
        presentation = localization.document if localization else post.document
        edition = editions.get(post.id)
        if user and post.author_id == user.id:
            role = "author"
        else:
            role = grant_roles.get(post.id) or ("reader" if post.public else "none")
        summaries.append(
            {
                "id": post.id,
                # Legacy posts without an approved category are presented as General.
                "category": "general",
                **presentation["details"],
                "public": post.public,
                "author": user_profile(authors[post.author_id]),
                "likes": like_counts.get(post.id, 0),
                "liked": post.id in liked,
                "role": role,
                "created": post.created,
                "kind": post.kind,
                "ai_news_document": presentation if localization else None,
                "ai_news": _edition_badges(edition) if edition else None,
                "search_status": search_status_for(jobs.get(post.id)),
            }
        )
    return summaries


def post_summary(db, post: Post, user: User | None = None, language: str = "en") -> dict:
    """Present current approved metadata with active rolling-window like counts for one post."""
    return post_summaries(db, [post], user, language)[0]


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

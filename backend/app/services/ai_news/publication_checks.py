"""Publication-time rechecks for AI-news previews: duplicate releases and official-source drift.

These checks run immediately before an administrator publishes a preview. They refetch each retained
official source through the safe-fetch controls, so they perform outbound HTTPS requests and can be
slow; callers should expect them to take up to the configured fetch timeout per source.
"""

from fastapi import HTTPException
from sqlalchemy import select

from ...models import NewsCandidate, NewsDocument, NewsRun, Post
from .extraction import extract_source
from .safe_fetch import SafeFetchError, fetch_public_document


def published_release_conflicts(db, run: NewsRun) -> list[dict[str, str | None]]:
    """Find releases already covered by another run and link only still-public posts."""
    conflicts: list[dict[str, str | None]] = []
    candidates = db.scalars(select(NewsCandidate).where(NewsCandidate.run_id == run.id, NewsCandidate.status == "qualifying"))
    for candidate in candidates:
        prior = db.scalar(
            select(NewsCandidate).where(
                NewsCandidate.normalized_key == candidate.normalized_key, NewsCandidate.status == "published", NewsCandidate.run_id != run.id
            )
        )
        if not prior:
            continue
        post_id = (prior.details or {}).get("published_post_id")
        post = db.get(Post, post_id) if isinstance(post_id, str) else None
        conflicts.append({"model_name": candidate.model_name, "post_id": post.id if post and post.public else None})
    return conflicts


def recheck_publication_sources(db, run: NewsRun, *, allow_changed: bool = False) -> list[dict[str, str]]:
    """Recheck official evidence and duplicates, returning acknowledged hash drift only for an exception."""
    conflicts = published_release_conflicts(db, run)
    if conflicts:
        names = ", ".join(str(item["model_name"])[:120] for item in conflicts[:3])
        raise HTTPException(409, f"Already published in another AI-news edition: {names}. Open the existing post or generate a preview with new releases")
    documents = list(db.scalars(select(NewsDocument).where(NewsDocument.run_id == run.id, NewsDocument.official.is_(True))))
    if not documents:
        raise HTTPException(409, "At least one retained official source is required")
    changed_sources: list[dict[str, str]] = []
    for document in documents:
        try:
            current = fetch_public_document(document.canonical_url)
            current_hash = extract_source(current).content_hash
        except (SafeFetchError, ValueError) as error:
            raise HTTPException(409, f"Official source recheck failed: {error}") from error
        if current_hash != document.content_hash:
            if not allow_changed:
                raise HTTPException(409, "An official source changed; run a new preview before publishing")
            # The original snapshot remains the article's evidence. Only this
            # administrator exception can acknowledge a newer live page.
            changed_sources.append({"document_id": document.id, "retained_hash": document.content_hash, "current_hash": current_hash})
    return changed_sources

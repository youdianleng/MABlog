"""Atomic localized publication and unpublication for verified automated editions."""

from html import escape

from sqlalchemy import select

from ...models import AutomatedEdition, Media, NewsCandidate, NewsRun, NewsSetting, Post, PostLocalization, User
from ...schemas import Document
from ...services.indexing import synchronize_post_search
from ...services.public_cache import invalidate_public_cache
from ...utils import new_id, now
from .cover import render_cover


def _citation_links(numbers: list[int], citations: dict[int, dict]) -> str:
    """Render safe compatibility links for keyword extraction and legacy composition readers."""
    links = []
    for number in numbers:
        citation = citations.get(number)
        if citation:
            links.append(f'<a href="{escape(citation["url"], quote=True)}" target="_blank" rel="noopener noreferrer">[{number}]</a>')
    return " ".join(links)


def compatibility_document(structured: dict) -> dict:
    """Create an approved legacy composition used by media checks and existing post services."""
    document = Document().model_dump()
    document["details"] = dict(structured["details"])
    citations = {
        int(citation["number"]): citation
        for block in structured.get("blocks", [])
        if block.get("type") == "sources"
        for citation in block.get("citations", [])
    }
    blocks = []
    y = 40
    for order, block in enumerate(structured.get("blocks", [])):
        if block.get("type") == "sources":
            continue
        heading = f"<h2>{escape(str(block.get('title', '')))}</h2>" if block.get("title") else ""
        visible_paragraphs = [*block.get("paragraphs", []), *block.get("benchmarks", [])]
        paragraphs = "".join(
            f"<p>{escape(str(paragraph.get('text', '')))} {_citation_links(paragraph.get('citations', []), citations)}</p>"
            for paragraph in visible_paragraphs
        )
        # The compatibility copy feeds older readers and search indexing, so
        # source-backed benchmark text must not disappear outside AiNewsReader.
        height = max(180, 80 + 34 * sum(max(1, len(str(paragraph.get("text", ""))) // 80) for paragraph in visible_paragraphs))
        blocks.append({"id": str(block.get("id", f"section-{order}")), "x": 60, "y": y, "width": 880, "height": height, "rotation": 0, "z": order, "order": order, "html": heading + paragraphs})
        y += height + 28
    document["canvas"] = {"x": 0, "y": 0, "width": 1000, "height": max(900, y + 40)}
    document["blocks"] = blocks
    return document


def system_publisher(db) -> User:
    """Resolve the immutable system identity used as the canonical post author."""
    publisher = db.scalar(select(User).where(User.username == "mablog_ia", User.is_system.is_(True)))
    if not publisher:
        raise RuntimeError("system_publisher_missing")
    return publisher


def publish_edition(db, run: NewsRun, edition: AutomatedEdition, *, allow_evidence_override: bool = False, allow_unverified_preview: bool = False) -> Post:
    """Publish a verified edition or one narrowly authorized administrator preview."""
    if edition.verification.get("source_contradicted"):
        raise RuntimeError("source_contradicted")
    if allow_evidence_override and allow_unverified_preview:
        raise RuntimeError("publication_modes_conflict")
    if allow_evidence_override:
        approval = edition.verification.get("manual_override") or {}
        safety = edition.verification.get("safety") or {}
        # An override never bypasses moderation, source checks, or a different
        # pipeline failure; the protected API supplies and audits the approval.
        if not (
            run.kind == "preview"
            and not run.publication_intent
            and run.status == "failed"
            and run.stage == "verify"
            and run.last_error == "verification_failed_after_repairs"
            and edition.status == "composed"
            and not edition.post_id
            and not edition.verification.get("passed")
            and safety.get("passed") is True
            and approval.get("approved_by")
        ):
            raise RuntimeError("evidence_override_not_eligible")
    elif allow_unverified_preview:
        approval = edition.verification.get("manual_unverified_preview") or {}
        safety = edition.verification.get("safety") or {}
        # Only the protected, audited manual-preview endpoint may set this
        # approval; automatic and activation-test runs can never use it.
        if not (
            run.kind == "preview" and not run.publication_intent
            and not run.result.get("verify_for_activation")
            and run.status == "preview" and edition.status == "safety_cleared_preview"
            and not edition.post_id and edition.verification.get("fact_check_performed") is False
            and safety.get("passed") is True and approval.get("approved_by")
        ):
            raise RuntimeError("unverified_preview_not_eligible")
    elif edition.status not in {"verified_preview", "corrected_verified", "unpublished"} or not edition.verification.get("passed"):
        raise RuntimeError("edition_not_verified")
    if edition.post_id:
        post = db.scalar(select(Post).where(Post.id == edition.post_id).with_for_update())
    else:
        post = Post(author_id=system_publisher(db).id, public=False, document=Document().model_dump(), versions={}, kind="ai_news")
        db.add(post)
        db.flush()
        edition.post_id = post.id
    documents = {language: dict(value) for language, value in edition.documents.items()}
    current_cover = post.document.get("details", {}).get("cover", "")
    if current_cover.startswith("/api/media/"):
        cover_id = current_cover.rsplit("/", 1)[-1]
    else:
        cover_id = new_id()
        cover_path = render_cover(cover_id, documents["en"]["details"]["title"], documents["en"].get("edition_date", ""))
        db.add(Media(id=cover_id, post_id=post.id, owner_id=system_publisher(db).id, mime="image/png", filename=cover_path.name))
    for language in ("en", "es"):
        localized = dict(documents[language])
        localized["details"] = {**localized["details"], "cover": f"/api/media/{cover_id}"}
        documents[language] = localized
        record = db.get(PostLocalization, (post.id, language))
        if not record:
            record = PostLocalization(post_id=post.id, language=language, document=localized)
            db.add(record)
        else:
            record.document = localized
            record.revision += 1
            record.updated = now()
    post.document = compatibility_document(documents["en"])
    post.public = True
    post.kind = "ai_news"
    post.published = post.published or now()
    edition.documents = documents
    edition.status = "published"
    edition.updated = now()
    for candidate in db.scalars(select(NewsCandidate).where(NewsCandidate.run_id == run.id, NewsCandidate.status == "qualifying")):
        candidate.status = "published"
        candidate.details = {**candidate.details, "published_post_id": post.id}
    run.status = "published"
    run.progress = 100
    run.completed = now()
    run.result = {**run.result, "post_id": post.id, "edition_id": edition.id, **({"evidence_override_published": True} if allow_evidence_override else {}), **({"manual_unverified_preview_published": True} if allow_unverified_preview else {})}
    settings = db.get(NewsSetting, 1)
    if not allow_evidence_override and not allow_unverified_preview and (run.kind in {"scheduled", "catchup"} or (run.kind == "preview" and not run.historical)):
        settings.last_successful_scan = max(settings.last_successful_scan, run.window_end)
        settings.updated = now()
    synchronize_post_search(db, post)
    db.flush()
    invalidate_public_cache()
    return post


def unpublish_edition(db, edition: AutomatedEdition) -> None:
    """Remove an automated edition from every public surface while retaining private history."""
    post = db.get(Post, edition.post_id) if edition.post_id else None
    if post:
        post.public = False
        synchronize_post_search(db, post)
    edition.status = "unpublished"
    edition.updated = now()
    invalidate_public_cache()


def replace_edition_documents(db, edition: AutomatedEdition, documents: dict, correction_note: str) -> None:
    """Atomically replace both localized public versions after corrected verification passes."""
    if not edition.post_id:
        raise RuntimeError("edition_post_missing")
    post = db.scalar(select(Post).where(Post.id == edition.post_id).with_for_update())
    if not post:
        raise RuntimeError("edition_post_missing")
    current_cover = post.document.get("details", {}).get("cover", "")
    updated_documents = {}
    for language in ("en", "es"):
        document = dict(documents[language])
        document["details"] = {**document["details"], "cover": current_cover}
        updated_documents[language] = document
        localization = db.get(PostLocalization, (post.id, language))
        if not localization:
            localization = PostLocalization(post_id=post.id, language=language, document=document)
            db.add(localization)
        else:
            localization.document = document
            localization.revision += 1
            localization.updated = now()
    post.document = compatibility_document(updated_documents["en"])
    edition.documents = updated_documents
    edition.correction_note = correction_note
    edition.verified_at = now()
    edition.verification = {**edition.verification, "source_contradicted": False}
    edition.updated = now()
    if post.public:
        edition.status = "published"
    else:
        edition.status = "corrected_verified"
    synchronize_post_search(db, post)
    invalidate_public_cache()

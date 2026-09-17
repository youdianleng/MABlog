"""Approved-content extraction, immediate keyword indexing, and durable job state."""
import hashlib
import json
import re
from html.parser import HTMLParser

from sqlalchemy import delete, select, update

from ..config import OPENAI_EMBEDDING_MODEL
from ..models import IndexingJob, Post, PostLocalization, SearchPassage, User
from ..utils import new_id, now

# Character bounds approximate 350–500 tokens while preserving readable source excerpts.
PASSAGE_MAX_CHARACTERS = 1600
PASSAGE_OVERLAP_CHARACTERS = 200
MIN_BLOCK_USEFUL_CHARACTERS = 30


class VisibleTextExtractor(HTMLParser):
    """Collect visible rich-text, link labels, and image alternative text from sanitized HTML."""

    def __init__(self) -> None:
        """Initialize a tolerant standard-library parser with an empty text buffer."""
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        """Retain user-visible text nodes, including labels nested inside links."""
        self.parts.append(data)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        """Add image alternative text and explicit media titles without indexing URLs."""
        values = dict(attrs)
        if tag == "img" and values.get("alt"):
            self.parts.append(values["alt"] or "")
        if tag in {"video", "iframe"} and values.get("title"):
            self.parts.append(values["title"] or "")

    def text(self) -> str:
        """Collapse whitespace into stable plain text for hashing and retrieval."""
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


def plain_text(html: str) -> str:
    """Extract indexable visible text from one already-sanitized content block."""
    parser = VisibleTextExtractor()
    parser.feed(html)
    parser.close()
    return parser.text()


def chunk_text(text: str) -> list[str]:
    """Split long text near word boundaries with a small overlap for semantic continuity."""
    normalized = re.sub(r"\s+", " ", text).strip()
    if len(normalized) <= PASSAGE_MAX_CHARACTERS:
        return [normalized] if normalized else []
    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        end = min(len(normalized), start + PASSAGE_MAX_CHARACTERS)
        if end < len(normalized):
            boundary = normalized.rfind(" ", start + PASSAGE_MAX_CHARACTERS // 2, end)
            if boundary > start:
                end = boundary
        chunks.append(normalized[start:end].strip())
        if end >= len(normalized):
            break
        start = max(start + 1, end - PASSAGE_OVERLAP_CHARACTERS)
    return chunks


def detect_language(text: str) -> str:
    """Store a lightweight English/Spanish signal while cross-language meaning comes from embeddings."""
    words = set(re.findall(r"[^\W\d_]+", text.casefold(), flags=re.UNICODE))
    spanish = len(words & {"el", "la", "los", "las", "de", "que", "una", "para", "con", "historia"})
    english = len(words & {"the", "a", "of", "that", "for", "with", "story", "and", "to"})
    if spanish > english:
        return "es"
    if english > spanish:
        return "en"
    return "und"


def useful_characters(text: str) -> int:
    """Count letters and numbers so punctuation-only blocks cannot become search passages."""
    return sum(character.isalnum() for character in text)


def hash_text(text: str) -> str:
    """Create a stable content digest without placing approved text in job metadata."""
    return hashlib.sha256(text.encode()).hexdigest()


def _composition_passages(document: dict, author: User, language: str | None = None) -> list[dict]:
    """Extract metadata and visible HTML from one ordinary freeform composition."""
    details = document.get("details", {})
    title = str(details.get("title", "")).strip()
    summary = str(details.get("summary", "")).strip()
    category = str(details.get("category", "general"))
    author_name = author.display_name or author.username
    passage_values: list[dict] = []
    if title or summary:
        metadata = f"Title: {title}\nSummary: {summary}\nCategory: {category}\nAuthor: {author_name}".strip()
        passage_values.append({"block_id": None, "source_kind": "metadata", "chunk_index": 0, "reading_order": -1, "content": metadata, "language": language or detect_language(metadata)})
    for block in sorted(document.get("blocks", []), key=lambda value: (value.get("order", 0), value.get("id", ""))):
        visible = plain_text(str(block.get("html", "")))
        if useful_characters(visible) < MIN_BLOCK_USEFUL_CHARACTERS:
            continue
        for index, chunk in enumerate(chunk_text(visible)):
            passage_values.append({"block_id": str(block.get("id")), "source_kind": "block", "chunk_index": index, "reading_order": int(block.get("order", 0)), "content": chunk, "language": language or detect_language(chunk)})
    return passage_values


def _automated_passages(document: dict, author: User) -> list[dict]:
    """Extract localized typed edition blocks without converting them to executable markup."""
    language = str(document.get("language", "und"))
    details = document.get("details", {})
    tags = " ".join(str(tag) for tag in document.get("tags", []))
    metadata = f"Title: {details.get('title', '')}\nSummary: {details.get('summary', '')}\nCategory: technology\nAuthor: {author.display_name or author.username}\nTags: {tags}".strip()
    values = [{"block_id": None, "source_kind": "metadata", "chunk_index": 0, "reading_order": -1, "content": metadata, "language": language}]
    for order, block in enumerate(document.get("blocks", [])):
        if block.get("type") == "sources":
            content = " ".join(str(citation.get("title", "")) for citation in block.get("citations", []))
        else:
            content = " ".join([str(block.get("title", "")), *(str(paragraph.get("text", "")) for paragraph in block.get("paragraphs", []))]).strip()
        if useful_characters(content) < MIN_BLOCK_USEFUL_CHARACTERS:
            continue
        for index, chunk in enumerate(chunk_text(content)):
            values.append({"block_id": str(block.get("id", "")) or None, "source_kind": "ai_news_block", "chunk_index": index, "reading_order": order, "content": chunk, "language": language})
    return values


def extract_passages(post: Post, author: User, localized_documents: list[dict] | None = None) -> tuple[str, list[dict]]:
    """Transform approved ordinary or localized automated content into bounded passages."""
    if localized_documents:
        passage_values = [value for document in localized_documents for value in _automated_passages(document, author)]
    else:
        passage_values = _composition_passages(post.document, author)
    revision_material = json.dumps(
        [{key: value for key, value in passage.items() if key != "content"} | {"content_hash": hash_text(passage["content"])} for passage in passage_values],
        sort_keys=True,
        separators=(",", ":"),
    )
    return hash_text(revision_material), passage_values


def _cloud_eligible(post: Post, author: User) -> bool:
    """Allow public content automatically and personal content only after author consent."""
    return post.public or author.personal_cloud_processing


def synchronize_post_search(db, post: Post) -> str:
    """Refresh keyword passages immediately and enqueue only a needed latest-revision embedding job."""
    author = db.get(User, post.author_id)
    localizations = list(db.scalars(select(PostLocalization).where(PostLocalization.post_id == post.id).order_by(PostLocalization.language))) if post.kind == "ai_news" else []
    revision_hash, values = extract_passages(post, author, [record.document for record in localizations] or None)
    existing = list(db.scalars(select(SearchPassage).where(SearchPassage.post_id == post.id)))
    unchanged = bool(existing) and all(item.revision_hash == revision_hash for item in existing) and len(existing) == len(values)
    if values and not unchanged:
        db.execute(delete(SearchPassage).where(SearchPassage.post_id == post.id))
        for value in values:
            content = value.pop("content")
            db.add(
                SearchPassage(
                    id=new_id(),
                    post_id=post.id,
                    content=content,
                    content_hash=hash_text(content),
                    revision_hash=revision_hash,
                    language=value.pop("language", detect_language(content)),
                    **value,
                )
            )
        db.flush()
        existing = list(db.scalars(select(SearchPassage).where(SearchPassage.post_id == post.id)))
    elif not values:
        db.execute(delete(SearchPassage).where(SearchPassage.post_id == post.id))
        existing = []
    job = db.get(IndexingJob, post.id)
    if existing and _cloud_eligible(post, author):
        ready = unchanged and all(item.embedding is not None and item.embedding_model == OPENAI_EMBEDDING_MODEL for item in existing)
        if not job:
            job = IndexingJob(post_id=post.id, revision_hash=revision_hash)
            db.add(job)
        job.revision_hash = revision_hash
        job.status = "done" if ready else "pending"
        job.attempts = 0 if not ready else job.attempts
        job.available_at = now()
        job.last_error = ""
        job.updated = now()
    else:
        if existing:
            db.execute(update(SearchPassage).where(SearchPassage.post_id == post.id).values(embedding=None, embedding_model=None))
        if job:
            db.delete(job)
    return revision_hash


def synchronize_author_posts(db, author: User) -> int:
    """Refresh every owned post after author-name or personal-cloud-setting changes."""
    posts = list(db.scalars(select(Post).where(Post.author_id == author.id)))
    for post in posts:
        synchronize_post_search(db, post)
    return len(posts)


def prepare_all_posts(db) -> int:
    """Make keyword passages immediately available and enqueue missing vectors during rollout."""
    posts = list(db.scalars(select(Post).order_by(Post.created, Post.id)))
    for post in posts:
        synchronize_post_search(db, post)
    db.commit()
    return len(posts)


def post_search_status(db, post: Post) -> str:
    """Map durable indexing state to the creator-facing three-state status vocabulary."""
    job = db.get(IndexingJob, post.id)
    if not job or job.status == "done":
        return "ready"
    if job.status == "failed":
        return "failed"
    return "indexing"


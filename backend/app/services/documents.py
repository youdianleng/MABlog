"""Composition sanitizing, target decomposition, and media-reference extraction."""
import json
import re
import bleach
from fastapi import HTTPException
from ..schemas import Document

RICH_TEXT_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "s", "u", "ul", "ol", "li", "br", "blockquote", "a", "img", "video", "source", "iframe", "div"]
MIN_IMAGE_WIDTH = 80
MAX_IMAGE_WIDTH = 4000

def allowed_attribute(tag: str, name: str, value: str) -> bool:
    """Allow safe rich-text attributes and only local uploads or known embed origins."""
    if name == "href":
        return tag == "a" and value.startswith(("https://", "http://", "mailto:"))
    if name == "src":
        if tag in {"img", "video", "source"}:
            return bool(re.fullmatch(r"/api/media/[a-f0-9-]{36}", value))
        if tag == "iframe":
            return bool(re.fullmatch(r"https://(?:www\.youtube-nocookie\.com/embed/[\w-]+|player\.vimeo\.com/video/\d+)", value))
    if tag == "img" and name == "width":
        return value.isdigit() and MIN_IMAGE_WIDTH <= int(value) <= MAX_IMAGE_WIDTH
    return name in {"alt", "title", "controls", "allowfullscreen", "data-youtube-video"}


def clean_document(value: dict) -> dict:
    """Validate geometry and sanitize each block's HTML before persistence or approval."""
    doc = Document.model_validate(value).model_dump()
    ids = [b["id"] for b in doc["blocks"]]
    if len(ids) != len(set(ids)):
        raise HTTPException(422, "Duplicate block identifiers")
    for block in doc["blocks"]:
        block["html"] = bleach.clean(block["html"], tags=RICH_TEXT_TAGS, attributes=allowed_attribute, protocols=["http", "https", "mailto"], strip=True)
    # Target applications can arrive in any order; normalize storage without changing geometry or layers.
    doc["blocks"].sort(key=block_reading_key)
    return doc


def block_reading_key(block: dict) -> tuple:
    """Break equal logical reading positions by stable identity for deterministic documents."""
    return block["order"], block["id"]


def targets(doc: dict) -> dict:
    """Flatten a composition into independently reviewable targets."""
    return {"details": doc["details"], "canvas": doc["canvas"], **{f"block:{b['id']}": b for b in doc["blocks"]}}


def media_ids(value: dict | None) -> set[str]:
    """Extract local upload identifiers from sanitized composition data."""
    return set(re.findall(r"/api/media/([a-f0-9-]{36})", json.dumps(value)))


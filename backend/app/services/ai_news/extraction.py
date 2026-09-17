"""Bounded untrusted-source extraction for HTML, PDF, Markdown, and plain text."""

from dataclasses import dataclass
import hashlib
from html.parser import HTMLParser
import io
import re

from pypdf import PdfReader

from .safe_fetch import FetchedDocument

# Source excerpts need enough release context but must not turn entire pages into model prompts.
MAX_EXTRACTED_CHARACTERS = 80_000
SUSPICIOUS_PATTERNS = (
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"system\s+prompt",
    r"reveal\s+(?:the\s+)?(?:api\s+key|secret|credentials)",
    r"execute\s+(?:this\s+)?(?:command|tool)",
)


class VisibleSourceParser(HTMLParser):
    """Collect visible article-like HTML while excluding active and hidden regions."""

    EXCLUDED = {"script", "style", "form", "noscript", "template", "svg", "canvas"}

    def __init__(self) -> None:
        """Initialize exclusion depth and visible text and link buffers."""
        super().__init__(convert_charrefs=True)
        self.excluded_depth = 0
        self.parts: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.current_href = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        """Enter excluded regions and remember visible HTTPS link destinations."""
        values = {key.lower(): value or "" for key, value in attrs}
        hidden = "hidden" in values or values.get("aria-hidden", "").lower() == "true" or "display:none" in values.get("style", "").replace(" ", "").lower()
        if self.excluded_depth:
            self.excluded_depth += 1
        elif tag.lower() in self.EXCLUDED or hidden:
            self.excluded_depth += 1
        if not self.excluded_depth and tag.lower() == "a" and values.get("href", "").startswith("https://"):
            self.current_href = values["href"]

    def handle_endtag(self, tag: str) -> None:
        """Leave excluded regions and close a visible link boundary."""
        if self.excluded_depth:
            self.excluded_depth -= 1
        if tag.lower() == "a":
            self.current_href = ""
        if not self.excluded_depth and tag.lower() in {"p", "div", "section", "article", "li", "h1", "h2", "h3", "h4", "br", "tr"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        """Append only text outside active or explicitly hidden regions."""
        if self.excluded_depth:
            return
        normalized = re.sub(r"\s+", " ", data).strip()
        if normalized:
            self.parts.append(normalized)
            if self.current_href:
                self.links.append((normalized[:300], self.current_href))


@dataclass(frozen=True)
class ExtractedSource:
    """Clean bounded text, content hash, visible links, and prompt-injection warnings."""

    text: str
    content_hash: str
    links: list[tuple[str, str]]
    warnings: list[str]


def _normalize_text(text: str) -> str:
    """Collapse horizontal whitespace while retaining paragraph boundaries."""
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.replace("\x00", "").splitlines()]
    return "\n".join(line for line in lines if line)[:MAX_EXTRACTED_CHARACTERS]


def extract_source(document: FetchedDocument) -> ExtractedSource:
    """Extract a supported source as untrusted bounded text with suspicious-content warnings."""
    links: list[tuple[str, str]] = []
    if document.media_type in {"text/html", "application/xhtml+xml"}:
        parser = VisibleSourceParser()
        parser.feed(document.body.decode("utf-8", errors="replace"))
        parser.close()
        text, links = " ".join(parser.parts), parser.links
    elif document.media_type == "application/pdf":
        try:
            reader = PdfReader(io.BytesIO(document.body), strict=False)
            text = "\n".join((page.extract_text() or "") for page in reader.pages[:200])
        except Exception as error:
            raise ValueError("invalid_pdf") from error
    else:
        text = document.body.decode("utf-8", errors="replace")
        if document.media_type == "text/markdown":
            # Remove fenced code and image destinations; headings and link labels remain useful evidence.
            text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
            text = re.sub(r"!\[([^]]*)\]\([^)]*\)", r"\1", text)
    normalized = _normalize_text(text)
    if not normalized:
        raise ValueError("empty_document")
    warnings = [f"suspicious_pattern:{index}" for index, pattern in enumerate(SUSPICIOUS_PATTERNS, 1) if re.search(pattern, normalized, flags=re.IGNORECASE)]
    return ExtractedSource(normalized, hashlib.sha256(normalized.encode()).hexdigest(), links[:500], warnings)

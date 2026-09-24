"""Deterministic publication checks plus bounded OpenAI moderation."""

import re

from ...models import NewsRun
from .composition import public_text
from .providers.openai import moderate_text

SECRET_PATTERNS = (
    r"sk-[A-Za-z0-9_-]{20,}",
    r"(?i)(?:api[_ -]?key|secret|password)\s*[:=]\s*[^\s]{8,}",
    r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
)
UNSAFE_MARKUP = re.compile(r"(?i)<\s*(?:script|iframe|object|embed)|javascript\s*:")
PERSONAL_EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
LONG_QUOTATION = re.compile(r"(?:\"|“)([^\"”]+)(?:\"|”)")


def deterministic_safety(documents: dict) -> list[str]:
    """Return high-confidence secret, personal-data, and executable-markup failures."""
    issues: list[str] = []
    for language, document in documents.items():
        text = public_text(document)
        if any(re.search(pattern, text) for pattern in SECRET_PATTERNS):
            issues.append(f"secret_pattern:{language}")
        if UNSAFE_MARKUP.search(text):
            issues.append(f"unsafe_markup:{language}")
        if PERSONAL_EMAIL.search(text):
            issues.append(f"personal_email:{language}")
        # Long verbatim quotations are unnecessary in a digest and increase copyright risk.
        if any(len(match.split()) > 25 for match in LONG_QUOTATION.findall(text)):
            issues.append(f"excessive_verbatim_quote:{language}")
        for block in document.get("blocks", []):
            for paragraph in block.get("paragraphs", []):
                if len(paragraph.get("text", "").split()) > 500:
                    issues.append(f"excessive_paragraph:{language}:{block.get('id', '')}")
    return issues


def publication_safety(db, run: NewsRun, documents: dict) -> dict:
    """Combine deterministic failures with moderation of both locales and cover alt text."""
    issues = deterministic_safety(documents)
    moderation: dict[str, dict] = {}
    for language, document in documents.items():
        value = moderate_text(f"{public_text(document)}\n{document.get('cover_alt', '')}"[:100_000], db)
        moderation[language] = value
        if value["flagged"]:
            issues.append(f"moderation_flagged:{language}")
    return {"passed": not issues, "issues": issues, "moderation": moderation}

"""Bounded Brave Search adapter that never logs its credential or raw failures."""

from dataclasses import dataclass

import httpx

from ....config import BRAVE_API_KEY, BRAVE_API_URL, OPENAI_TIMEOUT_SECONDS
from .openai import NewsProviderError


@dataclass(frozen=True)
class BraveResult:
    """One normalized public web result from the Brave Search API."""

    title: str
    url: str
    description: str


def brave_search(query: str, count: int = 10) -> list[BraveResult]:
    """Search Brave with a bounded query and return only title, URL, and snippet data."""
    if not BRAVE_API_KEY:
        raise NewsProviderError("brave_not_configured")
    try:
        response = httpx.get(
            BRAVE_API_URL,
            headers={"Accept": "application/json", "X-Subscription-Token": BRAVE_API_KEY},
            params={"q": query[:400], "count": min(max(count, 1), 20), "safesearch": "moderate", "text_decorations": "false"},
            timeout=OPENAI_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as error:
        raise NewsProviderError("brave_transport_error") from error
    if response.status_code >= 400:
        retry_after = float(response.headers.get("retry-after", "0") or 0)
        raise NewsProviderError(f"brave_http_{response.status_code}", retry_after)
    try:
        items = response.json().get("web", {}).get("results", [])
        return [
            BraveResult(str(item.get("title", ""))[:300], str(item.get("url", ""))[:2000], str(item.get("description", ""))[:1200])
            for item in items
            if isinstance(item, dict) and str(item.get("url", "")).startswith("https://")
        ]
    except (TypeError, ValueError) as error:
        raise NewsProviderError("brave_invalid_response") from error

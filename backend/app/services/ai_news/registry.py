"""Official-domain resolution and inactive provider suggestion helpers."""

from urllib.parse import urlsplit

from sqlalchemy import select

from ...models import NewsSource, NewsSourceSuggestion
from ...utils import new_id


def registrable_domain(hostname: str) -> str:
    """Return a conservative last-two-label domain for current core provider matching."""
    labels = hostname.casefold().strip(".").split(".")
    return ".".join(labels[-2:]) if len(labels) >= 2 else hostname.casefold()


def official_domain_map(db) -> dict[str, NewsSource]:
    """Map each active registry root domain to its owning source record."""
    sources = list(db.scalars(select(NewsSource).where(NewsSource.active.is_(True))))
    return {registrable_domain(urlsplit(source.url).hostname or ""): source for source in sources}


def match_official_source(db, url: str) -> NewsSource | None:
    """Resolve a URL only when its registered domain belongs to an active official source."""
    hostname = urlsplit(url).hostname or ""
    return official_domain_map(db).get(registrable_domain(hostname))


def suggest_unknown_source(db, provider_name: str, url: str, discovered_by: str, details: dict | None = None) -> NewsSourceSuggestion | None:
    """Create an inactive audited-review candidate without trusting or activating it."""
    if match_official_source(db, url) or db.scalar(select(NewsSourceSuggestion).where(NewsSourceSuggestion.url == url)):
        return None
    suggestion = NewsSourceSuggestion(id=new_id(), provider_name=provider_name[:160], url=url[:2000], discovered_by=discovered_by[:80], details=details or {})
    db.add(suggestion)
    return suggestion

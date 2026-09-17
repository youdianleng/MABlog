"""AI-news scheduler, source, correction, and publication request schemas."""
from typing import Literal

from pydantic import Field

from .common import StrictModel


class NewsPreviewPayload(StrictModel):
    """Start a current or historical preview without publication side effects."""

    historical_days: int | None = Field(default=None, ge=1, le=30)


class NewsSchedulePayload(StrictModel):
    """Enable or disable the durable schedule after activation readiness."""

    enabled: bool


class NewsPinPayload(StrictModel):
    """Preserve or release one run from the normal retention window."""

    pinned: bool


class NewsSourcePayload(StrictModel):
    """Create or replace one curator-managed official provider endpoint."""

    provider_key: str = Field(pattern=r"^[a-z0-9_-]{2,60}$")
    provider_name: str = Field(min_length=2, max_length=160)
    name: str = Field(min_length=2, max_length=200)
    url: str = Field(pattern=r"^https://", max_length=2000)
    kind: str = Field(pattern=r"^[a-z_]{2,40}$")
    active: bool = False
    reason: str = Field(min_length=3, max_length=1000)


class NewsSuggestionPayload(StrictModel):
    """Approve or dismiss one inactive discovered provider suggestion."""

    action: Literal["approve", "dismiss"]
    provider_key: str | None = Field(default=None, pattern=r"^[a-z0-9_-]{2,60}$")
    provider_name: str | None = Field(default=None, min_length=2, max_length=160)
    name: str | None = Field(default=None, min_length=2, max_length=200)
    kind: str = Field(default="release_notes", pattern=r"^[a-z_]{2,40}$")
    reason: str = Field(min_length=3, max_length=1000)


class NewsEmailPreferencePayload(StrictModel):
    """Enable or mute action-required AI-news email for an administrator."""

    enabled: bool


class NewsCorrectionPayload(StrictModel):
    """Submit one curator-edited localization for synchronized correction."""

    language: Literal["en", "es"]
    document: dict


class NewsCorrectionAcceptance(StrictModel):
    """Accept synchronized documents before corrected verification."""

    documents: dict
    correction_note: str = Field(min_length=3, max_length=600)


class ActionReasonPayload(StrictModel):
    """Require an audit explanation for a high-impact publication action."""

    reason: str = Field(min_length=3, max_length=1000)

"""Search retrieval and streamed explanation request schemas."""
from typing import Literal

from pydantic import Field

from .common import StrictModel
from .posts import PostCategory

SearchScope = Literal["all", "personal", "public"]


class SearchPayload(StrictModel):
    """Validate one independent search and its optional collection filters."""

    query: str = Field(min_length=1, max_length=500)
    category: PostCategory | None = None
    scope: SearchScope = "all"


class SearchCursorPayload(StrictModel):
    """Carry a signed, non-persisted continuation from initial retrieval."""

    cursor: str = Field(min_length=1, max_length=60000)


class ExplanationPayload(StrictModel):
    """Carry permission-bound evidence for a streamed grounded explanation."""

    token: str = Field(min_length=1, max_length=30000)

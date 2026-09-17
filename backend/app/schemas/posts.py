"""Post composition, collaboration, profile, and publication request schemas."""
from typing import Literal

from pydantic import Field

from .common import StrictModel

PostCategory = Literal["technology", "travel", "general", "anime"]


class Details(StrictModel):
    """Represent metadata reviewed independently from canvas and block content."""

    title: str = Field(default="", max_length=160)
    summary: str = Field(default="", max_length=600)
    cover: str = Field(default="", max_length=200)
    # Existing posts without a category belong to General until their creator changes it.
    category: PostCategory = "general"


class Canvas(StrictModel):
    """Represent crop bounds whose changes never move the contained blocks."""

    x: float = Field(default=0, ge=-20000, le=20000)
    y: float = Field(default=0, ge=-20000, le=20000)
    width: float = Field(default=1200, ge=200, le=20000)
    height: float = Field(default=900, ge=200, le=20000)


class Block(StrictModel):
    """Represent rich content, geometry, identity, and logical reading order."""

    id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,80}$")
    x: float = Field(default=40, ge=-20000, le=20000)
    y: float = Field(default=40, ge=-20000, le=20000)
    width: float = Field(default=500, ge=80, le=20000)
    height: float = Field(default=320, ge=80, le=20000)
    rotation: float = Field(default=0, ge=-360, le=360)
    z: int = Field(default=0, ge=-10000, le=10000)
    order: int = Field(default=0, ge=-10000, le=10000)
    html: str = Field(default="<p></p>", max_length=100000)


class Document(StrictModel):
    """Bound a structured composition to safe browser and storage limits."""

    details: Details = Field(default_factory=Details)
    canvas: Canvas = Field(default_factory=Canvas)
    blocks: list[Block] = Field(default_factory=list, max_length=100)


class DraftPayload(StrictModel):
    """Validate working content and its optimistic-revision snapshot."""

    document: Document
    baseline: Document
    versions: dict[str, int] = Field(default_factory=dict)


class CloudProcessingPayload(StrictModel):
    """Change explicit account consent for personal cloud processing."""

    enabled: bool


class ProfilePayload(StrictModel):
    """Validate public profile fields and an optional profile-owned avatar URL."""

    display_name: str = Field(max_length=80)
    bio: str = Field(max_length=600)
    avatar: str = Field(default="", max_length=200)


class PublicationPayload(StrictModel):
    """Choose whether a creator-owned post is publicly visible."""

    public: bool


class GrantPayload(StrictModel):
    """Grant one registered email view or edit access to one post."""

    # Local bootstrap accounts intentionally use the special-use `.local` domain, which
    # public-address validators reject. The endpoint performs an authoritative lookup and
    # never stores unknown invitation addresses, so a bounded address string is appropriate.
    email: str = Field(min_length=3, max_length=254)
    role: Literal["viewer", "editor"]


class ProposalReviewPayload(StrictModel):
    """Approve or reject one proposal against the displayed target revision."""

    action: Literal["approve", "reject"]
    current_version: int | None = Field(default=None, ge=0)

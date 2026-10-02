"""Request bodies for the administrator review of AI model files."""

from typing import Literal

from pydantic import Field

from .common import StrictModel

# A file version is the hex SHA-256 of the text the reviewer loaded (optimistic concurrency).
SHA256_PATTERN = r"^[0-9a-f]{64}$"


class ModelApprovalPayload(StrictModel):
    """Approve a draft: the reviewer confirms both languages and the facts were checked."""

    sha256: str = Field(pattern=SHA256_PATTERN)
    # Must be true; the page only enables Approve after the reviewer ticks the confirmation.
    acknowledged: Literal[True]
    note: str = Field(default="", max_length=500)


class ModelReturnPayload(StrictModel):
    """Take a reviewed file off the public page; the reason becomes a review note."""

    sha256: str = Field(pattern=SHA256_PATTERN)
    reason: str = Field(min_length=10, max_length=500)

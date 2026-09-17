"""Authentication and administrator authorization request schemas."""
from pydantic import EmailStr, Field

from .common import StrictModel


class Registration(StrictModel):
    """Validate new credentials with a case-insensitive account identity."""

    email: EmailStr
    username: str = Field(pattern=r"^[a-zA-Z0-9_]{3,30}$")
    password: str = Field(min_length=10, max_length=200)


class Credentials(StrictModel):
    """Accept an email or username login and a bounded password."""

    login: str = Field(max_length=254)
    password: str = Field(max_length=200)


class Verification(StrictModel):
    """Validate a single-use code and an optional recovery password."""

    challenge_id: str = Field(min_length=1, max_length=100)
    code: str = Field(pattern=r"^\d{6}$")
    new_password: str | None = Field(default=None, min_length=10, max_length=200)


class RecoveryPayload(StrictModel):
    """Accept a bounded recovery email without revealing account existence."""

    email: str = Field(min_length=1, max_length=254)


class AdminRolePayload(StrictModel):
    """Change one human account's administrator status with an audit reason."""

    is_admin: bool
    reason: str = Field(min_length=3, max_length=1000)


class StepUpRequest(StrictModel):
    """Confirm the current administrator password before sending a code."""

    password: str = Field(min_length=1, max_length=200)


class StepUpVerification(StrictModel):
    """Consume the purpose-bound code for the current administrator session."""

    challenge_id: str = Field(min_length=1, max_length=100)
    code: str = Field(pattern=r"^\d{6}$")

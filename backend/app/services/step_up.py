"""Recent administrator authorization bound to the current opaque session."""

import os

from fastapi import Depends, HTTPException, Request

from ..dependencies import database
from ..config import ADMIN_STEP_UP_SECONDS, APP_ENV, LOCAL_ADMIN_STEP_UP_BYPASS
from ..models import AdminStepUp, User
from ..utils import digest, now
from .administration import require_admin


def current_session_key(request: Request) -> str:
    """Return the hashed current cookie token used by session and step-up records."""
    token = request.cookies.get("mablog_session", "")
    if not token:
        raise HTTPException(401, "Please sign in and verify your email")
    return digest(token)


def local_bypass_allowed(user: User) -> bool:
    """Limit the development convenience bypass to the configured seeded local administrator."""
    configured_username = os.getenv("LOCAL_ADMIN_USERNAME", "mablog_admin").strip().lower()
    return APP_ENV == "local" and LOCAL_ADMIN_STEP_UP_BYPASS and user.username == configured_username


def step_up_status(request: Request, db, user: User) -> dict:
    """Describe recent authorization without revealing any token or challenge metadata."""
    if local_bypass_allowed(user):
        return {"authorized": True, "expires": user.verified_until, "local_bypass": True}
    record = db.get(AdminStepUp, current_session_key(request))
    return {"authorized": bool(record and record.expires > now()), "expires": record.expires if record else 0, "local_bypass": False}


def grant_step_up(db, request: Request) -> AdminStepUp:
    """Create or replace the ten-minute authorization for the current login session."""
    session_key = current_session_key(request)
    record = db.get(AdminStepUp, session_key)
    if not record:
        record = AdminStepUp(session_token=session_key)
        db.add(record)
    record.created = now()
    record.expires = now() + ADMIN_STEP_UP_SECONDS
    return record


def require_step_up(request: Request, db=Depends(database), user: User = Depends(require_admin)) -> User:
    """Require recent password-and-email verification for a high-impact operation."""
    if not step_up_status(request, db, user)["authorized"]:
        raise HTTPException(403, "Recent administrator verification is required")
    return user


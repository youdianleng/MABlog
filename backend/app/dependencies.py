"""Request-scoped database and verified-account dependencies."""
from collections.abc import Generator

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import LoginSession, User
from .utils import digest, now


def database() -> Generator[Session, None, None]:
    """Yield one database session per request and always close it afterward."""

    with SessionLocal() as db:
        yield db


def current_user(request: Request, db: Session = Depends(database)) -> User | None:
    """Resolve a session cookie only while account and verification remain valid."""

    token = request.cookies.get("mablog_session")
    session = db.get(LoginSession, digest(token)) if token else None
    user = db.get(User, session.user_id) if session and session.expires > now() else None
    return user if user and user.active and not user.is_system and user.verified_until > now() else None


def signed_in(user: User | None = Depends(current_user)) -> User:
    """Require a verified human account for a private operation."""

    if not user:
        raise HTTPException(401, "Please sign in and verify your email")
    return user

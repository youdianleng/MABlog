"""Reusable password, verification-code, throttling, and session behavior."""
import hashlib
import hmac
import os
import secrets

from fastapi import HTTPException, Response
from pwdlib import PasswordHash
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert

from ..config import APP_SECRET, CODE_SECONDS, RESEND_SECONDS
from ..models import Challenge, LoginSession, RateLimit, User
from ..utils import digest, new_id, now
from .email_delivery import EmailDeliveryError, send_verification_email

password_hasher = PasswordHash.recommended()
# Equal-cost dummy verification reduces timing differences for unknown usernames.
DUMMY_HASH = password_hasher.hash(secrets.token_urlsafe(24))
DEFAULT_THROTTLE_LIMIT = 20
DEFAULT_THROTTLE_PERIOD_SECONDS = 60


def throttle(db, key: str, limit: int = DEFAULT_THROTTLE_LIMIT, period: int = DEFAULT_THROTTLE_PERIOD_SECONDS) -> None:
    """Atomically enforce a fixed-window counter in PostgreSQL."""

    bucket = f"{digest(key)}:{int(now() // period)}"
    statement = insert(RateLimit).values(key=bucket, count=1)
    count = db.scalar(statement.on_conflict_do_update(index_elements=[RateLimit.key], set_={"count": RateLimit.count + 1}).returning(RateLimit.count))
    db.commit()
    if count > limit:
        raise HTTPException(429, "Too many requests. Please wait and try again.")


def code_digest(challenge_id: str, code: str) -> str:
    """Bind a low-entropy numeric code to the app secret and challenge identity."""

    return hmac.new(APP_SECRET.encode(), f"{challenge_id}:{code}".encode(), hashlib.sha256).hexdigest()


def issue_code(db, user: User, purpose: str) -> dict:
    """Replace older codes and deliver a time-limited purpose-bound challenge."""

    # Lock the account so simultaneous requests cannot issue two valid codes.
    db.scalar(select(User).where(User.id == user.id).with_for_update())
    latest = db.scalar(select(Challenge).where(Challenge.user_id == user.id, Challenge.purpose == purpose).order_by(Challenge.created.desc()))
    if latest and latest.created > now() - RESEND_SECONDS:
        raise HTTPException(429, f"Wait {RESEND_SECONDS} seconds before requesting another code")
    challenge_id, code = new_id(), f"{secrets.randbelow(1_000_000):06d}"
    db.execute(delete(Challenge).where(Challenge.user_id == user.id, Challenge.purpose == purpose))
    db.add(Challenge(id=challenge_id, user_id=user.id, purpose=purpose, code_hash=code_digest(challenge_id, code), expires=now() + CODE_SECONDS))
    try:
        send_verification_email(user, code, purpose)
    except EmailDeliveryError as error:
        db.rollback()
        raise HTTPException(503, str(error)) from error
    db.commit()
    return {"challenge_id": challenge_id, "verification_required": True}


def establish_session(db, user: User, response: Response) -> dict:
    """Create an opaque HttpOnly cookie bounded by weekly verification."""

    token = secrets.token_urlsafe(32)
    db.add(LoginSession(token=digest(token), user_id=user.id, expires=user.verified_until))
    db.commit()
    response.set_cookie("mablog_session", token, httponly=True, samesite="lax", secure=os.getenv("COOKIE_SECURE", "false") == "true", max_age=max(0, int(user.verified_until - now())))
    return {"ok": True}


"""Account registration, login, verification, recovery, and session routes."""
import hmac

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import delete, select

from ..config import CODE_ATTEMPTS, VERIFICATION_SECONDS
from ..dependencies import current_user, database
from ..models import Challenge, LoginSession, User
from ..schemas import Credentials, RecoveryPayload, Registration, Verification
from ..services.authentication import DUMMY_HASH, code_digest, establish_session, issue_code, password_hasher, throttle
from ..utils import digest, new_id, now

router = APIRouter(prefix="/auth", tags=["accounts"])


@router.post("/register")
def register(data: Registration, request: Request, db=Depends(database)):
    """Register an inactive account and send the code required for access."""

    throttle(db, f"register:{request.client.host}", 10, 3600)
    email, username = str(data.email).lower(), data.username.lower()
    existing = db.scalar(select(User).where((User.email == email) | (User.username == username)))
    if existing:
        raise HTTPException(409, "Email or username already registered")
    user = User(email=email, username=username, display_name=data.username, password=password_hasher.hash(data.password))
    db.add(user)
    db.commit()
    return issue_code(db, user, "login")


@router.post("/login")
def login(data: Credentials, request: Request, response: Response, db=Depends(database)):
    """Check a password and request a code when weekly verification has expired."""

    throttle(db, f"login:{request.client.host}:{data.login.lower()}", 10)
    user = db.scalar(select(User).where((User.email == data.login.lower()) | (User.username == data.login.lower())))
    valid = password_hasher.verify(data.password, user.password if user and not user.is_system else DUMMY_HASH)
    if not user or user.is_system or not valid:
        raise HTTPException(401, "Invalid login or password")
    if not user.active or user.verified_until <= now():
        return issue_code(db, user, "login")
    return establish_session(db, user, response)


@router.post("/verify")
def verify(data: Verification, response: Response, request: Request, db=Depends(database)):
    """Consume a code once and establish a verified login or recovery session."""

    throttle(db, f"verify:{request.client.host}", 30)
    challenge = db.scalar(select(Challenge).where(Challenge.id == data.challenge_id).with_for_update())
    if not challenge or challenge.expires <= now() or challenge.attempts >= CODE_ATTEMPTS:
        raise HTTPException(400, "Code expired or unavailable. Request a new code.")
    challenge.attempts += 1
    if not hmac.compare_digest(challenge.code_hash, code_digest(challenge.id, data.code)):
        db.commit()
        raise HTTPException(400, "Incorrect verification code")
    user = db.get(User, challenge.user_id)
    if challenge.purpose == "recovery":
        if not data.new_password:
            raise HTTPException(422, "A new password is required")
        user.password = password_hasher.hash(data.new_password)
        db.execute(delete(LoginSession).where(LoginSession.user_id == user.id))
    user.active = True
    user.verified_until = now() + VERIFICATION_SECONDS
    db.delete(challenge)
    return establish_session(db, user, response)


@router.post("/recover")
def recover(data: RecoveryPayload, request: Request, db=Depends(database)):
    """Send a recovery code without disclosing whether the email exists."""

    email = data.email.strip().lower()
    throttle(db, f"recover:{request.client.host}:{email}", 5, 3600)
    user = db.scalar(select(User).where(User.email == email))
    return issue_code(db, user, "recovery") if user else {"challenge_id": new_id(), "verification_required": True}


@router.post("/logout")
def logout(request: Request, response: Response, db=Depends(database)):
    """Revoke the current cookie without changing other verified sessions."""

    token = request.cookies.get("mablog_session", "")
    db.execute(delete(LoginSession).where(LoginSession.token == digest(token)))
    db.commit()
    response.delete_cookie("mablog_session")
    return {"ok": True}


@router.get("/me")
def me(user=Depends(current_user)):
    """Return private settings only to the authenticated account itself."""

    if not user:
        return {"user": None}
    return {"user": {"id": user.id, "email": user.email, "username": user.username, "display_name": user.display_name, "bio": user.bio, "avatar": user.avatar, "personal_cloud_processing": user.personal_cloud_processing, "is_admin": user.is_admin, "ai_news_email": user.ai_news_email}}


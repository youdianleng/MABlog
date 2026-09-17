"""Administrator listing, role management, and high-impact step-up endpoints."""

import hmac

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select

from ..dependencies import database
from ..models import AdminStepUp, Challenge, LoginSession, User
from ..schemas import AdminRolePayload, StepUpRequest, StepUpVerification
from ..services.admin_audit import audit
from ..config import CODE_ATTEMPTS
from ..services.authentication import code_digest, issue_code, password_hasher, throttle
from ..services.administration import active_admin_count, public_admin, require_admin
from ..services.step_up import grant_step_up, local_bypass_allowed, require_step_up, step_up_status
from ..utils import now

router = APIRouter(prefix="/admin", tags=["administration"])


@router.get("/step-up")
def read_step_up(request: Request, db=Depends(database), user: User = Depends(require_admin)):
    """Return whether the current administrator session has recent authorization."""
    return step_up_status(request, db, user)


@router.post("/step-up/request")
def request_step_up(data: StepUpRequest, request: Request, db=Depends(database), user: User = Depends(require_admin)):
    """Verify the current password and email a purpose-bound one-time code."""
    throttle(db, f"admin-step-up:{user.id}:{request.client.host}", 5, 3600)
    if not password_hasher.verify(data.password, user.password):
        raise HTTPException(401, "Invalid password")
    if local_bypass_allowed(user):
        grant_step_up(db, request)
        db.commit()
        return {"authorized": True, "local_bypass": True}
    return issue_code(db, user, "admin_step_up")


@router.post("/step-up/verify")
def verify_step_up(data: StepUpVerification, request: Request, db=Depends(database), user: User = Depends(require_admin)):
    """Consume an administrator code and authorize high-impact actions for ten minutes."""
    throttle(db, f"admin-step-up-verify:{user.id}:{request.client.host}", 20, 3600)
    challenge = db.scalar(select(Challenge).where(Challenge.id == data.challenge_id, Challenge.user_id == user.id).with_for_update())
    if not challenge or challenge.purpose != "admin_step_up" or challenge.expires <= now() or challenge.attempts >= CODE_ATTEMPTS:
        raise HTTPException(400, "Code expired or unavailable. Request a new code.")
    challenge.attempts += 1
    if not hmac.compare_digest(challenge.code_hash, code_digest(challenge.id, data.code)):
        db.commit()
        raise HTTPException(400, "Incorrect verification code")
    db.delete(challenge)
    record = grant_step_up(db, request)
    db.commit()
    return {"authorized": True, "expires": record.expires, "local_bypass": False}


@router.get("/administrators")
def administrators(db=Depends(database), user: User = Depends(require_admin)):
    """List human accounts for protected role management."""
    records = db.scalars(select(User).where(User.is_system.is_(False)).order_by(User.is_admin.desc(), User.username))
    return [public_admin(record) for record in records]


@router.put("/administrators/{user_id}")
def change_administrator(user_id: str, data: AdminRolePayload, db=Depends(database), actor: User = Depends(require_step_up)):
    """Promote or demote a human account while preserving one active administrator."""
    target = db.scalar(select(User).where(User.id == user_id).with_for_update())
    if not target or target.is_system:
        raise HTTPException(404, "Account not found")
    if target.is_admin and not data.is_admin and target.active and active_admin_count(db) <= 1:
        raise HTTPException(409, "The final active administrator cannot be removed")
    before = public_admin(target)
    target.is_admin = data.is_admin
    if not data.is_admin:
        db.query(AdminStepUp).filter(AdminStepUp.session_token.in_(select(LoginSession.token).where(LoginSession.user_id == target.id))).delete(synchronize_session=False)
    after = public_admin(target)
    audit(db, actor, "administrator.role.changed", "user", target.id, data.reason, before, after)
    db.commit()
    return after




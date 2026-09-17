"""Authoritative site-administrator access and role-transition rules."""

from fastapi import Depends, HTTPException
from sqlalchemy import func, select

from ..dependencies import signed_in
from ..models import User


def require_admin(user: User = Depends(signed_in)) -> User:
    """Require an active non-system account carrying the site-administrator role."""
    if not user.is_admin or user.is_system:
        raise HTTPException(403, "Administrator access is required")
    return user


def active_admin_count(db) -> int:
    """Count active human administrators for final-administrator protection."""
    return int(db.scalar(select(func.count()).select_from(User).where(User.is_admin.is_(True), User.is_system.is_(False), User.active.is_(True))) or 0)


def public_admin(user: User) -> dict:
    """Expose bounded administrator-management fields without password or session data."""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": user.display_name,
        "active": user.active,
        "is_admin": user.is_admin,
        "ai_news_email": user.ai_news_email,
    }


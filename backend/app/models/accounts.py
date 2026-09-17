"""Account, authentication, authorization, and rate-limit records."""
from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint, literal_column, text
from sqlalchemy.orm import Mapped, mapped_column

from ..config import EMBEDDING_DIMENSIONS
from ..database import Base
from ..utils import new_id, now


class User(Base):
    """An account, its public profile, and last verified email deadline."""
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String, unique=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    display_name: Mapped[str] = mapped_column(String, default="")
    bio: Mapped[str] = mapped_column(String, default="")
    avatar: Mapped[str] = mapped_column(String, default="")
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_until: Mapped[float] = mapped_column(Float, default=0)
    personal_cloud_processing: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_news_email: Mapped[bool] = mapped_column(Boolean, default=True)


class LoginSession(Base):
    """Revocable opaque-cookie authentication with a fixed verification deadline."""
    __tablename__ = "sessions"
    token: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    expires: Mapped[float] = mapped_column(Float)


class AdminStepUp(Base):
    """Recent high-impact authorization bound to one hashed login-session token."""
    __tablename__ = "admin_step_ups"
    session_token: Mapped[str] = mapped_column(ForeignKey("sessions.token", ondelete="CASCADE"), primary_key=True)
    expires: Mapped[float] = mapped_column(Float, index=True)
    created: Mapped[float] = mapped_column(Float, default=now)


class AdminAuditEvent(Base):
    """Append-only administrator action with bounded before-and-after metadata."""
    __tablename__ = "admin_audit_events"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    actor_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String)
    target_type: Mapped[str] = mapped_column(String)
    target_id: Mapped[str] = mapped_column(String)
    reason: Mapped[str] = mapped_column(String, default="")
    before: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    after: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created: Mapped[float] = mapped_column(Float, default=now, index=True)


class Challenge(Base):
    """A purpose-bound single-use email code, stored as a keyed digest."""
    __tablename__ = "challenges"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    purpose: Mapped[str] = mapped_column(String)
    code_hash: Mapped[str] = mapped_column(String)
    expires: Mapped[float] = mapped_column(Float)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created: Mapped[float] = mapped_column(Float, default=now)


class RateLimit(Base):
    """Database-backed request counters continue enforcing limits without Redis."""
    __tablename__ = "rate_limits"
    key: Mapped[str] = mapped_column(String, primary_key=True)
    count: Mapped[int] = mapped_column(Integer, default=1)

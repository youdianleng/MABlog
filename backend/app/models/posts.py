"""Post, localization, collaboration, media, and engagement records."""
from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint, literal_column, text
from sqlalchemy.orm import Mapped, mapped_column

from ..config import EMBEDDING_DIMENSIONS
from ..database import Base
from ..utils import new_id, now


class Post(Base):
    """Approved composition and per-target revision counters."""
    __tablename__ = "posts"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    public: Mapped[bool] = mapped_column(Boolean, default=False)
    document: Mapped[dict] = mapped_column(JSON)
    versions: Mapped[dict] = mapped_column(JSON, default=dict)
    created: Mapped[float] = mapped_column(Float, default=now)
    published: Mapped[float] = mapped_column(Float, default=0)
    kind: Mapped[str] = mapped_column(String, default="human")


class PostLocalization(Base):
    """One language representation of a canonical automated-edition post."""
    __tablename__ = "post_localizations"
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    language: Mapped[str] = mapped_column(String, primary_key=True)
    document: Mapped[dict] = mapped_column(JSON)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    updated: Mapped[float] = mapped_column(Float, default=now)


class Grant(Base):
    """A registered recipient's permission on exactly one post."""
    __tablename__ = "grants"
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role: Mapped[str] = mapped_column(String)


class Draft(Base):
    """An editor-private working document and its original revision snapshot."""
    __tablename__ = "drafts"
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    document: Mapped[dict] = mapped_column(JSON)
    versions: Mapped[dict] = mapped_column(JSON)
    baseline: Mapped[dict] = mapped_column(JSON)


class Proposal(Base):
    """Immutable target proposal retained after rejection or access revocation."""
    __tablename__ = "proposals"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    editor_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    target: Mapped[str] = mapped_column(String)
    base_version: Mapped[int] = mapped_column(Integer)
    value: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending")
    created: Mapped[float] = mapped_column(Float, default=now)


class Media(Base):
    """Upload ownership for approved content and private working versions."""
    __tablename__ = "media"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    post_id: Mapped[str | None] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    mime: Mapped[str] = mapped_column(String)
    filename: Mapped[str] = mapped_column(String)


class Like(Base):
    """One currently active like per account/post, timestamped when received."""
    __tablename__ = "likes"
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created: Mapped[float] = mapped_column(Float, default=now)

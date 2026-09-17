"""Search passages, durable indexing jobs, and replay protection."""
from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint, literal_column, text
from sqlalchemy.orm import Mapped, mapped_column

from ..config import EMBEDDING_DIMENSIONS
from ..database import Base
from ..utils import new_id, now


class SearchPassage(Base):
    """Permission-joined approved text with an optional cloud embedding."""
    __tablename__ = "search_passages"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    block_id: Mapped[str | None] = mapped_column(String, nullable=True)
    source_kind: Mapped[str] = mapped_column(String)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    reading_order: Mapped[int] = mapped_column(Integer, default=0)
    content: Mapped[str] = mapped_column(Text)
    content_hash: Mapped[str] = mapped_column(String)
    revision_hash: Mapped[str] = mapped_column(String, index=True)
    language: Mapped[str] = mapped_column(String, default="und")
    embedding_model: Mapped[str | None] = mapped_column(String, nullable=True)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(EMBEDDING_DIMENSIONS), nullable=True)


class IndexingJob(Base):
    """One durable latest-revision embedding job per approved post."""
    __tablename__ = "indexing_jobs"
    post_id: Mapped[str] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    revision_hash: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="pending", index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    available_at: Mapped[float] = mapped_column(Float, default=now, index=True)
    last_error: Mapped[str] = mapped_column(String, default="")
    updated: Mapped[float] = mapped_column(Float, default=now)


class SearchReplay(Base):
    """A short-lived digest that makes an explanation token single-use without Redis."""
    __tablename__ = "search_replays"
    key: Mapped[str] = mapped_column(String, primary_key=True)
    expires: Mapped[float] = mapped_column(Float, index=True)

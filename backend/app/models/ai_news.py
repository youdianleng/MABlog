"""Durable AI-news pipeline, evidence, edition, and notification records."""
from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint, literal_column, text
from sqlalchemy.orm import Mapped, mapped_column

from ..config import EMBEDDING_DIMENSIONS
from ..database import Base
from ..utils import new_id, now


class NewsRun(Base):
    """One durable preview, scheduled, catch-up, or immediate AI-news execution."""
    __tablename__ = "news_runs"
    __table_args__ = (
        # A constant-expression partial index guarantees one active run across all workers.
        Index("uq_news_runs_one_active", literal_column("(1)"), unique=True, postgresql_where=text("status IN ('pending', 'running', 'retrying')")),
    )
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    kind: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="pending", index=True)
    stage: Mapped[str] = mapped_column(String, default="readiness")
    publication_intent: Mapped[bool] = mapped_column(Boolean, default=False)
    historical: Mapped[bool] = mapped_column(Boolean, default=False)
    window_start: Mapped[float] = mapped_column(Float)
    window_end: Mapped[float] = mapped_column(Float)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    openai_cost: Mapped[float] = mapped_column(Float, default=0)
    brave_queries: Mapped[int] = mapped_column(Integer, default=0)
    warnings: Mapped[list] = mapped_column(JSON, default=list)
    result: Mapped[dict] = mapped_column(JSON, default=dict)
    last_error: Mapped[str] = mapped_column(Text, default="")
    requested_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String, unique=True)
    lease_owner: Mapped[str | None] = mapped_column(String, nullable=True)
    lease_until: Mapped[float] = mapped_column(Float, default=0)
    created: Mapped[float] = mapped_column(Float, default=now, index=True)
    started: Mapped[float] = mapped_column(Float, default=0)
    completed: Mapped[float] = mapped_column(Float, default=0)


class NewsSetting(Base):
    """Singleton durable schedule, cursor, activation, and economy-limit policy."""
    __tablename__ = "news_settings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    schedule_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    timezone: Mapped[str] = mapped_column(String, default="Europe/Madrid")
    weekday: Mapped[int] = mapped_column(Integer, default=0)
    hour: Mapped[int] = mapped_column(Integer, default=9)
    minute: Mapped[int] = mapped_column(Integer, default=0)
    next_run: Mapped[float] = mapped_column(Float, default=0)
    last_successful_scan: Mapped[float] = mapped_column(Float, default=0)
    activation_preview_run_id: Mapped[str | None] = mapped_column(ForeignKey("news_runs.id", ondelete="SET NULL", use_alter=True, name="fk_news_settings_activation_preview_run_id_news_runs"), nullable=True)
    openai_run_budget: Mapped[float] = mapped_column(Float, default=2)
    openai_month_budget: Mapped[float] = mapped_column(Float, default=10)
    brave_query_budget: Mapped[int] = mapped_column(Integer, default=15)
    updated: Mapped[float] = mapped_column(Float, default=now)


class NewsSource(Base):
    """Curator-managed verified first-party discovery endpoint."""
    __tablename__ = "news_sources"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    provider_key: Mapped[str] = mapped_column(String, index=True)
    provider_name: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String, unique=True)
    kind: Mapped[str] = mapped_column(String)
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    validation_status: Mapped[str] = mapped_column(String, default="pending")
    validation: Mapped[dict] = mapped_column(JSON, default=dict)
    last_checked: Mapped[float] = mapped_column(Float, default=0)
    created: Mapped[float] = mapped_column(Float, default=now)
    updated: Mapped[float] = mapped_column(Float, default=now)


class NewsSourceSuggestion(Base):
    """Inactive web-discovered provider endpoint awaiting curator review."""
    __tablename__ = "news_source_suggestions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    provider_name: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String, unique=True)
    discovered_by: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="pending")
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created: Mapped[float] = mapped_column(Float, default=now)
    reviewed_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[float] = mapped_column(Float, default=0)


class NewsJob(Base):
    """One leased idempotent and checkpointed stage belonging to a news run."""
    __tablename__ = "news_jobs"
    __table_args__ = (UniqueConstraint("run_id", "stage"),)
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"))
    stage: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="pending")
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    available_at: Mapped[float] = mapped_column(Float, default=now)
    lease_owner: Mapped[str | None] = mapped_column(String, nullable=True)
    lease_until: Mapped[float] = mapped_column(Float, default=0)
    checkpoint: Mapped[dict] = mapped_column(JSON, default=dict)
    idempotency_key: Mapped[str] = mapped_column(String, unique=True)
    last_error: Mapped[str] = mapped_column(Text, default="")
    updated: Mapped[float] = mapped_column(Float, default=now)


class NewsCandidate(Base):
    """Normalized possible release and its classification or duplicate outcome."""
    __tablename__ = "news_candidates"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String)
    model_name: Mapped[str] = mapped_column(String)
    model_version: Mapped[str] = mapped_column(String, default="")
    update_type: Mapped[str] = mapped_column(String, default="release")
    normalized_key: Mapped[str] = mapped_column(String, index=True)
    title: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    official_url: Mapped[str] = mapped_column(String, default="")
    published_at: Mapped[float] = mapped_column(Float, default=0)
    classification: Mapped[str] = mapped_column(String, default="pending")
    classification_reason: Mapped[str] = mapped_column(Text, default="")
    content_hash: Mapped[str] = mapped_column(String, default="")
    duplicate_of_post_id: Mapped[str | None] = mapped_column(ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="discovered")
    details: Mapped[dict] = mapped_column(JSON, default=dict)


class NewsDocument(Base):
    """Safely fetched source snapshot and its permanent hash and metadata."""
    __tablename__ = "news_documents"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"), index=True)
    candidate_id: Mapped[str | None] = mapped_column(ForeignKey("news_candidates.id", ondelete="CASCADE"), nullable=True)
    source_id: Mapped[str | None] = mapped_column(ForeignKey("news_sources.id", ondelete="SET NULL"), nullable=True)
    url: Mapped[str] = mapped_column(String)
    canonical_url: Mapped[str] = mapped_column(String)
    mime: Mapped[str] = mapped_column(String)
    content_hash: Mapped[str] = mapped_column(String)
    extracted_text: Mapped[str] = mapped_column(Text)
    warnings: Mapped[list] = mapped_column(JSON, default=list)
    official: Mapped[bool] = mapped_column(Boolean, default=False)
    fetched_at: Mapped[float] = mapped_column(Float, default=now)
    snapshot_expires: Mapped[float] = mapped_column(Float)


class NewsClaim(Base):
    """Language-paired factual claim mapped to retained exact evidence excerpts."""
    __tablename__ = "news_claims"
    __table_args__ = (UniqueConstraint("run_id", "claim_key"),)
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"))
    candidate_id: Mapped[str | None] = mapped_column(ForeignKey("news_candidates.id", ondelete="CASCADE"), nullable=True)
    claim_key: Mapped[str] = mapped_column(String)
    text_en: Mapped[str] = mapped_column(Text)
    text_es: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, default="pending")
    evidence: Mapped[list] = mapped_column(JSON, default=list)
    verifier_model: Mapped[str] = mapped_column(String, default="")
    updated: Mapped[float] = mapped_column(Float, default=now)


class AutomatedEdition(Base):
    """Private or public bilingual edition produced by exactly one news run."""
    __tablename__ = "automated_editions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"), unique=True)
    post_id: Mapped[str | None] = mapped_column(ForeignKey("posts.id", ondelete="SET NULL"), unique=True, nullable=True)
    status: Mapped[str] = mapped_column(String, default="preview")
    documents: Mapped[dict] = mapped_column(JSON, default=dict)
    verification: Mapped[dict] = mapped_column(JSON, default=dict)
    source_count: Mapped[int] = mapped_column(Integer, default=0)
    verified_at: Mapped[float] = mapped_column(Float, default=0)
    correction_note: Mapped[str] = mapped_column(String, default="")
    created: Mapped[float] = mapped_column(Float, default=now)
    updated: Mapped[float] = mapped_column(Float, default=now)


class NewsRevision(Base):
    """Private curator correction awaiting bilingual acceptance and verification."""
    __tablename__ = "news_revisions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    edition_id: Mapped[str] = mapped_column(ForeignKey("automated_editions.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String, default="draft")
    documents: Mapped[dict] = mapped_column(JSON, default=dict)
    verification: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created: Mapped[float] = mapped_column(Float, default=now)
    updated: Mapped[float] = mapped_column(Float, default=now)


class NewsAlert(Base):
    """One deduplicated action-required condition for a run and alert type."""
    __tablename__ = "news_alerts"
    __table_args__ = (UniqueConstraint("run_id", "alert_type"),)
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str | None] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"), nullable=True)
    alert_type: Mapped[str] = mapped_column(String)
    severity: Mapped[str] = mapped_column(String, default="error")
    title: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(Text)
    email_status: Mapped[str] = mapped_column(String, default="pending")
    created: Mapped[float] = mapped_column(Float, default=now, index=True)
    resolved: Mapped[float] = mapped_column(Float, default=0)


class NewsAlertReceipt(Base):
    """Per-administrator read state for a mandatory in-app news alert."""
    __tablename__ = "news_alert_receipts"
    alert_id: Mapped[str] = mapped_column(ForeignKey("news_alerts.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    read_at: Mapped[float] = mapped_column(Float, default=0)


class NewsUsage(Base):
    """Redacted provider usage and estimated cost for one paid pipeline stage."""
    __tablename__ = "news_usage"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(ForeignKey("news_runs.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String)
    model: Mapped[str] = mapped_column(String)
    stage: Mapped[str] = mapped_column(String)
    input_units: Mapped[int] = mapped_column(Integer, default=0)
    output_units: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0)
    created: Mapped[float] = mapped_column(Float, default=now)


class NewsSourceCheck(Base):
    """Post-publication source hash comparison and any reverification outcome."""
    __tablename__ = "news_source_checks"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    edition_id: Mapped[str] = mapped_column(ForeignKey("automated_editions.id", ondelete="CASCADE"), index=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("news_documents.id", ondelete="CASCADE"))
    previous_hash: Mapped[str] = mapped_column(String)
    current_hash: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    checked_at: Mapped[float] = mapped_column(Float, default=now)

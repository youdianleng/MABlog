"""Add administrator, localization, and durable weekly AI-news records."""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"


def upgrade() -> None:
    """Add the AI-news schema without replacing existing users, posts, or search data."""
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("users", sa.Column("is_system", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("users", sa.Column("ai_news_email", sa.Boolean(), server_default=sa.true(), nullable=False))
    op.add_column("posts", sa.Column("kind", sa.String(), server_default="human", nullable=False))

    op.create_table(
        "admin_step_ups",
        sa.Column("session_token", sa.String(), nullable=False),
        sa.Column("expires", sa.Float(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["session_token"], ["sessions.token"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_token"),
    )
    op.create_index("ix_admin_step_ups_expires", "admin_step_ups", ["expires"])
    op.create_table(
        "admin_audit_events",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("actor_id", sa.String(), nullable=True),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("target_type", sa.String(), nullable=False),
        sa.Column("target_id", sa.String(), nullable=False),
        sa.Column("reason", sa.String(), nullable=False),
        sa.Column("before", sa.JSON(), nullable=True),
        sa.Column("after", sa.JSON(), nullable=True),
        sa.Column("created", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_admin_audit_events_created", "admin_audit_events", ["created"])
    op.create_table(
        "post_localizations",
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("document", sa.JSON(), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("post_id", "language"),
    )
    op.create_table(
        "news_runs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("kind", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("stage", sa.String(), nullable=False),
        sa.Column("publication_intent", sa.Boolean(), nullable=False),
        sa.Column("historical", sa.Boolean(), nullable=False),
        sa.Column("window_start", sa.Float(), nullable=False),
        sa.Column("window_end", sa.Float(), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False),
        sa.Column("openai_cost", sa.Float(), nullable=False),
        sa.Column("brave_queries", sa.Integer(), nullable=False),
        sa.Column("warnings", sa.JSON(), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False),
        sa.Column("last_error", sa.Text(), nullable=False),
        sa.Column("requested_by", sa.String(), nullable=True),
        sa.Column("idempotency_key", sa.String(), nullable=False),
        sa.Column("lease_owner", sa.String(), nullable=True),
        sa.Column("lease_until", sa.Float(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.Column("started", sa.Float(), nullable=False),
        sa.Column("completed", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["requested_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_news_runs_status", "news_runs", ["status"])
    op.create_index("ix_news_runs_created", "news_runs", ["created"])
    # A waiting scheduled request uses status=waiting and therefore does not occupy the active slot.
    op.execute("CREATE UNIQUE INDEX uq_news_runs_one_active ON news_runs ((1)) WHERE status IN ('pending', 'running', 'retrying')")
    op.create_table(
        "news_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("schedule_enabled", sa.Boolean(), nullable=False),
        sa.Column("timezone", sa.String(), nullable=False),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("hour", sa.Integer(), nullable=False),
        sa.Column("minute", sa.Integer(), nullable=False),
        sa.Column("next_run", sa.Float(), nullable=False),
        sa.Column("last_successful_scan", sa.Float(), nullable=False),
        sa.Column("activation_preview_run_id", sa.String(), nullable=True),
        sa.Column("openai_run_budget", sa.Float(), nullable=False),
        sa.Column("openai_month_budget", sa.Float(), nullable=False),
        sa.Column("brave_query_budget", sa.Integer(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["activation_preview_run_id"], ["news_runs.id"], name="fk_news_settings_activation_preview_run_id_news_runs", ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "news_sources",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("provider_key", sa.String(), nullable=False),
        sa.Column("provider_name", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("kind", sa.String(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("validation_status", sa.String(), nullable=False),
        sa.Column("validation", sa.JSON(), nullable=False),
        sa.Column("last_checked", sa.Float(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("url"),
    )
    op.create_index("ix_news_sources_provider_key", "news_sources", ["provider_key"])
    op.create_table(
        "news_source_suggestions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("provider_name", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("discovered_by", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.Column("reviewed_by", sa.String(), nullable=True),
        sa.Column("reviewed_at", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("url"),
    )
    op.create_table(
        "news_jobs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=False),
        sa.Column("stage", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("available_at", sa.Float(), nullable=False),
        sa.Column("lease_owner", sa.String(), nullable=True),
        sa.Column("lease_until", sa.Float(), nullable=False),
        sa.Column("checkpoint", sa.JSON(), nullable=False),
        sa.Column("idempotency_key", sa.String(), nullable=False),
        sa.Column("last_error", sa.Text(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("run_id", "stage"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_news_jobs_claim", "news_jobs", ["status", "available_at"])
    op.create_table(
        "news_candidates",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("model_name", sa.String(), nullable=False),
        sa.Column("model_version", sa.String(), nullable=False),
        sa.Column("update_type", sa.String(), nullable=False),
        sa.Column("normalized_key", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("official_url", sa.String(), nullable=False),
        sa.Column("published_at", sa.Float(), nullable=False),
        sa.Column("classification", sa.String(), nullable=False),
        sa.Column("classification_reason", sa.Text(), nullable=False),
        sa.Column("content_hash", sa.String(), nullable=False),
        sa.Column("duplicate_of_post_id", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["duplicate_of_post_id"], ["posts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_news_candidates_run_id", "news_candidates", ["run_id"])
    op.create_index("ix_news_candidates_normalized_key", "news_candidates", ["normalized_key"])
    op.create_table(
        "news_documents",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=False),
        sa.Column("candidate_id", sa.String(), nullable=True),
        sa.Column("source_id", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("canonical_url", sa.String(), nullable=False),
        sa.Column("mime", sa.String(), nullable=False),
        sa.Column("content_hash", sa.String(), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.Column("warnings", sa.JSON(), nullable=False),
        sa.Column("official", sa.Boolean(), nullable=False),
        sa.Column("fetched_at", sa.Float(), nullable=False),
        sa.Column("snapshot_expires", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["news_candidates.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_id"], ["news_sources.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_news_documents_run_id", "news_documents", ["run_id"])
    op.create_table(
        "news_claims",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=False),
        sa.Column("candidate_id", sa.String(), nullable=True),
        sa.Column("claim_key", sa.String(), nullable=False),
        sa.Column("text_en", sa.Text(), nullable=False),
        sa.Column("text_es", sa.Text(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False),
        sa.Column("verifier_model", sa.String(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["news_candidates.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("run_id", "claim_key"),
    )
    op.create_table(
        "automated_editions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("documents", sa.JSON(), nullable=False),
        sa.Column("verification", sa.JSON(), nullable=False),
        sa.Column("source_count", sa.Integer(), nullable=False),
        sa.Column("verified_at", sa.Float(), nullable=False),
        sa.Column("correction_note", sa.String(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("post_id"),
        sa.UniqueConstraint("run_id"),
    )
    op.create_table(
        "news_revisions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("edition_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("documents", sa.JSON(), nullable=False),
        sa.Column("verification", sa.JSON(), nullable=False),
        sa.Column("created_by", sa.String(), nullable=True),
        sa.Column("created", sa.Float(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["edition_id"], ["automated_editions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_news_revisions_edition_id", "news_revisions", ["edition_id"])
    op.create_table(
        "news_alerts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=True),
        sa.Column("alert_type", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("email_status", sa.String(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.Column("resolved", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("run_id", "alert_type"),
    )
    op.create_index("ix_news_alerts_created", "news_alerts", ["created"])
    op.create_table(
        "news_alert_receipts",
        sa.Column("alert_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("read_at", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["alert_id"], ["news_alerts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("alert_id", "user_id"),
    )
    op.create_table(
        "news_usage",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("run_id", sa.String(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("stage", sa.String(), nullable=False),
        sa.Column("input_units", sa.Integer(), nullable=False),
        sa.Column("output_units", sa.Integer(), nullable=False),
        sa.Column("estimated_cost", sa.Float(), nullable=False),
        sa.Column("created", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["run_id"], ["news_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_news_usage_run_id", "news_usage", ["run_id"])
    op.create_table(
        "news_source_checks",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("edition_id", sa.String(), nullable=False),
        sa.Column("document_id", sa.String(), nullable=False),
        sa.Column("previous_hash", sa.String(), nullable=False),
        sa.Column("current_hash", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("checked_at", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["news_documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["edition_id"], ["automated_editions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_news_source_checks_edition_id", "news_source_checks", ["edition_id"])


def downgrade() -> None:
    """Remove only the AI-news extension introduced by this revision."""
    op.drop_index("ix_news_source_checks_edition_id", table_name="news_source_checks")
    op.drop_table("news_source_checks")
    op.drop_index("ix_news_usage_run_id", table_name="news_usage")
    op.drop_table("news_usage")
    op.drop_table("news_alert_receipts")
    op.drop_index("ix_news_alerts_created", table_name="news_alerts")
    op.drop_table("news_alerts")
    op.drop_index("ix_news_revisions_edition_id", table_name="news_revisions")
    op.drop_table("news_revisions")
    op.drop_table("automated_editions")
    op.drop_table("news_claims")
    op.drop_index("ix_news_documents_run_id", table_name="news_documents")
    op.drop_table("news_documents")
    op.drop_index("ix_news_candidates_normalized_key", table_name="news_candidates")
    op.drop_index("ix_news_candidates_run_id", table_name="news_candidates")
    op.drop_table("news_candidates")
    op.drop_index("ix_news_jobs_claim", table_name="news_jobs")
    op.drop_table("news_jobs")
    op.drop_table("news_source_suggestions")
    op.drop_index("ix_news_sources_provider_key", table_name="news_sources")
    op.drop_table("news_sources")
    op.drop_table("news_settings")
    op.execute("DROP INDEX IF EXISTS uq_news_runs_one_active")
    op.drop_index("ix_news_runs_created", table_name="news_runs")
    op.drop_index("ix_news_runs_status", table_name="news_runs")
    op.drop_table("news_runs")
    op.drop_table("post_localizations")
    op.drop_index("ix_admin_audit_events_created", table_name="admin_audit_events")
    op.drop_table("admin_audit_events")
    op.drop_index("ix_admin_step_ups_expires", table_name="admin_step_ups")
    op.drop_table("admin_step_ups")
    op.drop_column("posts", "kind")
    op.drop_column("users", "ai_news_email")
    op.drop_column("users", "is_system")
    op.drop_column("users", "is_admin")

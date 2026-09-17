"""Add personal cloud consent, pgvector passages, and durable indexing jobs."""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision = "0002"
down_revision = "0001"


def upgrade():
    """Extend the PostgreSQL 17 schema without replacing existing application data."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column("users", sa.Column("personal_cloud_processing", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.create_table(
        "search_passages",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("block_id", sa.String(), nullable=True),
        sa.Column("source_kind", sa.String(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("reading_order", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_hash", sa.String(), nullable=False),
        sa.Column("revision_hash", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("embedding_model", sa.String(), nullable=True),
        sa.Column("embedding", Vector(1536), nullable=True),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_search_passages_post_id", "search_passages", ["post_id"])
    op.create_index("ix_search_passages_revision_hash", "search_passages", ["revision_hash"])
    # The simple dictionary preserves English and Spanish surface words in one permission-safe index.
    op.execute("CREATE INDEX ix_search_passages_fts ON search_passages USING gin (to_tsvector('simple', content))")
    # HNSW serves low-latency cosine candidates; null vectors remain usable through keyword search.
    op.execute("CREATE INDEX ix_search_passages_embedding ON search_passages USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL")
    op.create_table(
        "indexing_jobs",
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("revision_hash", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("available_at", sa.Float(), nullable=False),
        sa.Column("last_error", sa.String(), nullable=False),
        sa.Column("updated", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("post_id"),
    )
    op.create_index("ix_indexing_jobs_status", "indexing_jobs", ["status"])
    op.create_index("ix_indexing_jobs_available_at", "indexing_jobs", ["available_at"])


def downgrade():
    """Remove search records and consent while leaving pre-search application data intact."""
    op.drop_index("ix_indexing_jobs_available_at", table_name="indexing_jobs")
    op.drop_index("ix_indexing_jobs_status", table_name="indexing_jobs")
    op.drop_table("indexing_jobs")
    op.execute("DROP INDEX IF EXISTS ix_search_passages_embedding")
    op.execute("DROP INDEX IF EXISTS ix_search_passages_fts")
    op.drop_index("ix_search_passages_revision_hash", table_name="search_passages")
    op.drop_index("ix_search_passages_post_id", table_name="search_passages")
    op.drop_table("search_passages")
    op.drop_column("users", "personal_cloud_processing")

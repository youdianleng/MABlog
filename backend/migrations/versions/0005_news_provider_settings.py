"""Store encrypted newsroom-only provider credentials and model overrides."""

from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"


def upgrade() -> None:
    """Add nullable overrides so existing environment configuration stays effective."""
    op.add_column("news_settings", sa.Column("openai_key_ciphertext", sa.Text(), nullable=True))
    op.add_column("news_settings", sa.Column("brave_key_ciphertext", sa.Text(), nullable=True))
    op.add_column("news_settings", sa.Column("small_model_override", sa.String(length=160), nullable=True))
    op.add_column("news_settings", sa.Column("strong_model_override", sa.String(length=160), nullable=True))


def downgrade() -> None:
    """Remove only the four provider overrides, retaining scheduler records."""
    op.drop_column("news_settings", "strong_model_override")
    op.drop_column("news_settings", "small_model_override")
    op.drop_column("news_settings", "brave_key_ciphertext")
    op.drop_column("news_settings", "openai_key_ciphertext")

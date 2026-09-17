"""Add durable, expiring explanation replay protection."""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"


def upgrade():
    """Create opaque single-use records without storing queries or generated text."""
    op.create_table(
        "search_replays",
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("expires", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )
    op.create_index("ix_search_replays_expires", "search_replays", ["expires"])


def downgrade():
    """Remove only the explanation replay records introduced by this revision."""
    op.drop_index("ix_search_replays_expires", table_name="search_replays")
    op.drop_table("search_replays")

"""Index public post listings by publication time and approved category.

The collection, pagination, and search category filters read the category from JSON document
metadata. Without an expression index every filtered page scanned all public posts.
"""

from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "0005"

# Must match app.models.posts.POST_CATEGORY_SQL exactly for the planner to use the index.
POST_CATEGORY_SQL = "coalesce(document -> 'details' ->> 'category', 'general')"
# Must match app.models.posts.PUBLIC_POST_PREDICATE; queries use ``public IS TRUE``.
PUBLIC_POST_PREDICATE = "public IS TRUE"


def upgrade() -> None:
    """Create partial indexes that cover only public posts, the rows these listings read."""
    op.create_index("ix_posts_public_published", "posts", [sa.text("published DESC"), "id"], postgresql_where=sa.text(PUBLIC_POST_PREDICATE))
    op.create_index(
        "ix_posts_public_category_published",
        "posts",
        [sa.text(POST_CATEGORY_SQL), sa.text("published DESC"), "id"],
        postgresql_where=sa.text(PUBLIC_POST_PREDICATE),
    )


def downgrade() -> None:
    """Drop the listing indexes; queries remain correct but slower."""
    op.drop_index("ix_posts_public_category_published", table_name="posts")
    op.drop_index("ix_posts_public_published", table_name="posts")

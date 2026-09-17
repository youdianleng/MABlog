"""Configure migrations from the same database settings as the application."""
from alembic import context
from app import models  # noqa: F401
from app.database import Base, engine


def run_migrations() -> None:
    """Apply the version history transactionally against the configured database."""
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations()


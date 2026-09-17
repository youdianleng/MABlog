"""Shared fixtures for isolated FastAPI integration suites."""
from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app import main
from app.database import Base, engine

TEST_DATABASE_SUFFIX = "/mablog_test"
SAME_ORIGIN_HEADERS = {"X-MAblog": "1", "Origin": "http://localhost:3000"}


@pytest.fixture
def client() -> TestClient:
    """Provide a browser-like same-origin API client for every backend suite."""

    return TestClient(main.app, headers=SAME_ORIGIN_HEADERS)


@pytest.fixture
def reset_database() -> Callable[[str], None]:
    """Return a guarded schema reset that can only target the named test database."""

    def reset(suite_name: str) -> None:
        """Create pgvector and rebuild tables for one isolated suite test."""

        if not str(engine.url).endswith(TEST_DATABASE_SUFFIX):
            pytest.fail(suite_name + " require the separate mablog_test database")
        with engine.begin() as connection:
            # Vector is database-scoped and must exist before search passage tables.
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.drop_all(engine)
        Base.metadata.create_all(engine)

    return reset

"""Search/RAG integration tests against an isolated pgvector PostgreSQL database."""
import asyncio
import copy
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select

from app import worker
from app.services import authentication as auth
from app.api import search as search_routes
from app.database import SessionLocal
from app.models import Draft, Grant, IndexingJob, LoginSession, Post, Proposal, RateLimit, SearchPassage, User
from app.schemas import Document
from app.utils import digest, now
from app.services import generation
from app.config import INDEX_RETRY_SECONDS
from app.services.embeddings import OpenAIServiceError
from app.services.indexing import extract_passages, synchronize_post_search


@pytest.fixture(autouse=True)
def isolated_search_database(reset_database, monkeypatch):
    """Reset pgvector data and default cloud retrieval to offline keyword mode."""

    reset_database("Search tests")
    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: False)
    yield

def create_account(name: str, cloud: bool = False) -> tuple[str, str]:
    """Create a verified search fixture account and return its ID and raw cookie token."""
    with SessionLocal() as db:
        user = User(
            email=f"{name}@example.com",
            username=name,
            password=auth.password_hasher.hash("test-password-123"),
            active=True,
            verified_until=now() + 604800,
            display_name=name.title(),
            personal_cloud_processing=cloud,
        )
        db.add(user)
        db.flush()
        token = f"search-token-{name}"
        db.add(LoginSession(token=digest(token), user_id=user.id, expires=user.verified_until))
        db.commit()
        return user.id, token


def sign_in(client: TestClient, token: str | None) -> None:
    """Select one fixture account or clear cookies for an anonymous search."""
    client.cookies.clear()
    if token:
        client.cookies.set("mablog_session", token)


def create_search_post(author_id: str, title: str, content: str, public: bool = False, category: str = "general") -> str:
    """Persist an approved composition and synchronously make its keyword passages available."""
    document = Document().model_dump()
    document["details"].update({"title": title, "summary": f"Summary for {title}", "category": category})
    document["blocks"] = [
        {"id": "source-block", "order": 1, "html": f'<p>{content}</p><a href="https://example.com">Reference label</a><img alt="Illustrated moon garden">'}
    ]
    post = Post(author_id=author_id, document=document, versions={}, public=public, published=now() if public else 0)
    with SessionLocal() as db:
        db.add(post)
        db.flush()
        synchronize_post_search(db, post)
        db.commit()
        return post.id


def set_post_vector(post_id: str, value: float = 1.0, axis: int = 0) -> None:
    """Attach a deterministic 1536-dimensional test vector and complete its durable job."""
    vector = [0.0] * 1536
    vector[axis] = value
    with SessionLocal() as db:
        for passage in db.scalars(select(SearchPassage).where(SearchPassage.post_id == post_id)):
            passage.embedding = vector
            passage.embedding_model = "text-embedding-3-small"
        job = db.get(IndexingJob, post_id)
        if job:
            job.status = "done"
        db.commit()


def search(client: TestClient, query: str, **filters) -> dict:
    """Run the validated search endpoint and return its decoded grouped response."""
    response = client.post("/api/search", json={"query": query, "scope": "all", **filters})
    assert response.status_code == 200, response.text
    return response.json()


def test_keyword_search_enforces_visibility_and_excludes_proposals(client):
    """Keep private posts permission-safe and prevent pending editor text from entering retrieval."""
    author_id, author_token = create_account("searchauthor")
    viewer_id, viewer_token = create_account("searchviewer")
    _, stranger_token = create_account("searchstranger")
    public_id = create_search_post(author_id, "Public starlight", "crimson constellation over a public shrine", public=True)
    private_id = create_search_post(author_id, "Private garden", "silver fireflies in a private garden")
    with SessionLocal() as db:
        private_post = db.get(Post, private_id)
        private_draft = copy.deepcopy(private_post.document)
        private_draft["blocks"][0]["html"] = "<p>unapproved phoenix draft secret</p>"
        db.add(Grant(post_id=private_id, user_id=viewer_id, role="viewer"))
        db.add(Draft(post_id=private_id, user_id=author_id, document=private_draft, baseline=private_post.document, versions={}))
        db.add(Proposal(post_id=private_id, editor_id=viewer_id, target="block:source-block", base_version=0, value={"id": "source-block", "html": "unapproved dragon secret"}))
        db.commit()
    sign_in(client, None)
    assert [item["id"] for item in search(client, "crimson constellation")["public"]["items"]] == [public_id]
    assert search(client, "silver fireflies")["personal"]["items"] == []
    sign_in(client, viewer_token)
    assert [item["id"] for item in search(client, "silver fireflies")["personal"]["items"]] == [private_id]
    sign_in(client, stranger_token)
    assert search(client, "silver fireflies")["personal"]["items"] == []
    sign_in(client, author_token)
    assert search(client, "unapproved dragon")["personal"]["items"] == []
    assert search(client, "unapproved phoenix")["personal"]["items"] == []


def test_keyword_search_matches_a_title_with_a_common_suffix(client):
    """Match a singular query to a plural word in approved title metadata."""
    author_id, _ = create_account("prefixauthor")
    post_id = create_search_post(
        author_id,
        "Where the mountains remember",
        "A quiet walk beyond the old torii gate",
        public=True,
    )
    sign_in(client, None)
    result = search(client, "mountain")
    assert [item["id"] for item in result["public"]["items"]] == [post_id]


def test_extraction_indexes_labels_alt_text_and_skips_short_blocks():
    """Index approved mixed-content labels and alt text while omitting tiny block passages."""
    author_id, _ = create_account("extractauthor")
    post_id = create_search_post(author_id, "Mixed media", "A sufficiently descriptive block about lanterns")
    with SessionLocal() as db:
        post = db.get(Post, post_id)
        post.document["blocks"].append({"id": "tiny", "html": "<p>Hi</p>", "order": 2})
        author = db.get(User, author_id)
        _, passages = extract_passages(post, author)
    content = " ".join(item["content"] for item in passages)
    assert "Reference label" in content
    assert "Illustrated moon garden" in content
    assert "Hi" not in content


def test_two_sided_consent_and_permission_safe_vector_retrieval(client, monkeypatch):
    """Retrieve personal vectors only when author, searcher, and current grant all allow them."""
    author_id, _ = create_account("vectorauthor", cloud=True)
    viewer_id, viewer_token = create_account("vectorviewer", cloud=True)
    _, stranger_token = create_account("vectorstranger", cloud=True)
    private_id = create_search_post(author_id, "Jardín lunar", "Luciérnagas plateadas junto al santuario privado")
    with SessionLocal() as db:
        db.add(Grant(post_id=private_id, user_id=viewer_id, role="viewer"))
        db.commit()
    set_post_vector(private_id)
    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(search_routes, "embed_texts", lambda values: [[1.0] + [0.0] * 1535])
    sign_in(client, viewer_token)
    result = search(client, "serene celestial refuge")
    assert result["mode"] == "hybrid"
    assert [item["id"] for item in result["personal"]["items"]] == [private_id]
    sign_in(client, stranger_token)
    assert search(client, "serene celestial refuge")["personal"]["items"] == []
    with SessionLocal() as db:
        viewer = db.get(User, viewer_id)
        viewer.personal_cloud_processing = False
        db.commit()
    sign_in(client, viewer_token)
    assert search(client, "serene celestial refuge")["personal"]["items"] == []


def test_checked_in_evaluation_fixture_meets_top_five_and_bilingual_gates(client, monkeypatch):
    """Exercise the complete hybrid pipeline against the accepted retrieval quality thresholds."""
    fixture_path = Path(__file__).parent.parent / "evaluation" / "rag_retrieval.json"
    fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
    author_id, _ = create_account("evaluationauthor")
    post_ids: dict[str, str] = {}
    query_axes: dict[str, int] = {}
    for axis, document in enumerate(fixture["documents"]):
        content = " ".join([document["content"], document["link_label"], document["image_alt"]])
        post_id = create_search_post(author_id, document["title"], content, public=True, category=document["category"])
        set_post_vector(post_id, axis=axis)
        post_ids[document["key"]] = post_id
    key_axes = {document["key"]: axis for axis, document in enumerate(fixture["documents"])}
    for case in fixture["cases"]:
        query_axes[case["query"]] = key_axes[case["expected_key"]]

    def fixture_embedding(values: list[str]) -> list[list[float]]:
        """Map each fixture question to its intended semantic axis without a cloud dependency."""
        vectors: list[list[float]] = []
        for value in values:
            vector = [0.0] * 1536
            vector[query_axes[value]] = 1.0
            vectors.append(vector)
        return vectors

    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(search_routes, "embed_texts", fixture_embedding)
    monkeypatch.setattr(search_routes, "consume_capacity", lambda *args, **kwargs: True)
    directions = set()
    successes = 0
    bilingual_successes = 0
    bilingual_total = 0
    for case in fixture["cases"]:
        result = search(client, case["query"])
        top_five = {item["id"] for item in result["public"]["items"][:5]}
        found = post_ids[case["expected_key"]] in top_five
        successes += int(found)
        if case["bilingual"]:
            target_language = next(document["language"] for document in fixture["documents"] if document["key"] == case["expected_key"])
            directions.add((case["query_language"], target_language))
            bilingual_total += 1
            bilingual_successes += int(found)
    assert directions == {("en", "es"), ("es", "en")}
    assert successes / len(fixture["cases"]) >= fixture["thresholds"]["overall_top_five"]
    assert bilingual_successes / bilingual_total >= fixture["thresholds"]["bilingual_top_five"]


def test_search_limits_degrade_to_keyword_before_rejecting_abuse(client, monkeypatch):
    """Enforce enhanced and protective limits independently while validating the query boundary."""
    author_id, _ = create_account("limitauthor")
    post_id = create_search_post(author_id, "Bounded search", "a bounded search result beside the river", public=True)
    set_post_vector(post_id)
    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(search_routes, "embed_texts", lambda values: [[1.0] + [0.0] * 1535])
    monkeypatch.setattr(search_routes, "ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR", 1)
    monkeypatch.setattr(search_routes, "ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR", 3)
    first = search(client, "bounded search")
    assert first["mode"] == "hybrid"
    hourly_fallback = search(client, "bounded search")
    assert hourly_fallback["fallback_reason"] == "enhanced_hourly_limit"
    assert hourly_fallback["explanation_available"] is False
    assert search(client, "bounded search")["mode"] == "keyword"
    limited = client.post("/api/search", json={"query": "bounded search", "scope": "all"})
    assert limited.status_code == 429
    oversized = client.post("/api/search", json={"query": "x" * 501, "scope": "all"})
    assert oversized.status_code == 422

    # Clear only isolated test counters before proving that the application-wide daily gate is separate.
    with SessionLocal() as db:
        db.execute(delete(RateLimit))
        db.commit()
    monkeypatch.setattr(search_routes, "ANONYMOUS_ENHANCED_SEARCHES_PER_HOUR", 10)
    monkeypatch.setattr(search_routes, "ANONYMOUS_KEYWORD_SEARCHES_PER_HOUR", 10)
    monkeypatch.setattr(search_routes, "GLOBAL_ENHANCED_SEARCHES_PER_DAY", 1)
    assert search(client, "bounded search")["mode"] == "hybrid"
    daily_fallback = search(client, "bounded search")
    assert daily_fallback["mode"] == "keyword"
    assert daily_fallback["fallback_reason"] == "enhanced_daily_limit"
    assert daily_fallback["explanation_available"] is False


def test_stale_indexing_revision_cannot_overwrite_new_approved_content(monkeypatch):
    """Discard old worker output and complete only the latest approved passage revision."""
    author_id, _ = create_account("staleauthor", cloud=True)
    post_id = create_search_post(author_id, "First revision", "the first approved revision has enough searchable words")
    with SessionLocal() as db:
        old_revision = db.get(IndexingJob, post_id).revision_hash
        post = db.get(Post, post_id)
        document = copy.deepcopy(post.document)
        document["blocks"][0]["html"] = "<p>the replacement approved revision has entirely different searchable words</p>"
        post.document = document
        new_revision = synchronize_post_search(db, post)
        db.commit()
    assert new_revision != old_revision
    monkeypatch.setattr(worker, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(worker, "consume_capacity", lambda *args, **kwargs: True)
    monkeypatch.setattr(worker, "embed_texts", lambda texts: [[1.0] + [0.0] * 1535 for _ in texts])
    worker.process_job(post_id, old_revision)
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        assert job.revision_hash == new_revision and job.status == "pending"
        assert all(passage.embedding is None for passage in db.scalars(select(SearchPassage).where(SearchPassage.post_id == post_id)))
    assert worker.process_job(post_id, new_revision) is True
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        assert job.status == "done"
        assert all(passage.embedding is not None for passage in db.scalars(select(SearchPassage).where(SearchPassage.post_id == post_id)))


def test_streamed_explanation_uses_clickable_permission_checked_citations(client, monkeypatch):
    """Stream citation metadata before prose and avoid placing passage text in the signed evidence token."""
    author_id, _ = create_account("streamauthor")
    post_id = create_search_post(author_id, "Moonlit bridge", "A moonlit bridge carries wishes across quiet water", public=True)
    set_post_vector(post_id)
    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(search_routes, "embed_texts", lambda values: [[1.0] + [0.0] * 1535])

    async def fake_explanation(query: str, evidence: list[dict]):
        """Yield deterministic provider-style deltas without contacting a cloud service."""
        assert query == "wishes over water"
        assert evidence and all(item["post_id"] == post_id for item in evidence)
        yield "The imagery in "
        yield "[1] matches your search through its quiet water and wishes."

    monkeypatch.setattr(search_routes, "stream_grounded_explanation", fake_explanation)
    sign_in(client, None)
    result = search(client, "wishes over water")
    assert result["explanation_available"] is True
    assert "quiet water" not in result["explanation_token"]
    streamed = client.post("/api/search/explanation", json={"token": result["explanation_token"]})
    assert streamed.status_code == 200
    assert "event: citations" in streamed.text
    assert json.dumps("Moonlit bridge") in streamed.text
    assert "event: delta" in streamed.text
    assert "event: done" in streamed.text
    replayed = client.post("/api/search/explanation", json={"token": result["explanation_token"]})
    assert replayed.status_code == 409


def test_disabling_author_consent_removes_vectors_but_keeps_keyword_search(client):
    """Delete personal semantic vectors immediately while retaining permission-safe keyword passages."""
    author_id, author_token = create_account("optoutauthor", cloud=True)
    post_id = create_search_post(author_id, "Private comet", "a private comet crosses the winter garden")
    set_post_vector(post_id)
    sign_in(client, author_token)
    response = client.patch("/api/profile/cloud-processing", json={"enabled": False})
    assert response.status_code == 200
    with SessionLocal() as db:
        passages = list(db.scalars(select(SearchPassage).where(SearchPassage.post_id == post_id)))
        assert passages and all(item.embedding is None for item in passages)
        assert db.get(IndexingJob, post_id) is None
    result = search(client, "private comet")
    assert [item["id"] for item in result["personal"]["items"]] == [post_id]


def test_signed_load_more_returns_ten_then_remaining_results(client):
    """Paginate Personal and Public groups independently without repeating the original search."""
    author_id, _ = create_account("pageauthor")
    for index in range(11):
        create_search_post(author_id, f"Lantern archive {index}", f"lantern archive story number {index} beside the river", public=True)
    sign_in(client, None)
    result = search(client, "lantern archive")
    assert len(result["public"]["items"]) == 10
    assert result["public"]["total"] == 11
    page = client.post("/api/search/more", json={"cursor": result["public"]["cursor"]})
    assert page.status_code == 200
    assert len(page.json()["items"]) == 1
    assert page.json()["cursor"] is None


def test_indexing_retries_reach_failed_state_and_admin_recovery(monkeypatch):
    """Schedule all five delayed retries, expose the sixth failure, and support recovery."""
    author_id, _ = create_account("retryauthor", cloud=True)
    post_id = create_search_post(author_id, "Retry story", "retryable cloud embedding passage with enough approved text")
    with SessionLocal() as db:
        revision_hash = db.get(IndexingJob, post_id).revision_hash
    monkeypatch.setattr(worker, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(worker, "consume_capacity", lambda *args, **kwargs: True)

    def fail_embedding(texts: list[str]):
        """Raise a content-safe provider code for every simulated indexing attempt."""
        raise OpenAIServiceError("embedding_http_503")

    monkeypatch.setattr(worker, "embed_texts", fail_embedding)
    for attempt, delay in enumerate(INDEX_RETRY_SECONDS, start=1):
        worker.process_job(post_id, revision_hash)
        with SessionLocal() as db:
            job = db.get(IndexingJob, post_id)
            assert job.status == "pending" and job.attempts == attempt
            assert abs((job.available_at - job.updated) - delay) < 1
    worker.process_job(post_id, revision_hash)
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        assert job.status == "failed" and job.attempts == 6 and job.last_error == "embedding_http_503"
    assert worker.retry_failed_jobs() == 1
    with SessionLocal() as db:
        job = db.get(IndexingJob, post_id)
        assert job.status == "pending" and job.attempts == 0 and job.last_error == ""


def test_provider_outage_preserves_results_and_keyword_grounded_answer(client, monkeypatch):
    """Use lexical evidence for the answer when query embedding cannot reach OpenAI."""
    author_id, _ = create_account("fallbackauthor")
    post_id = create_search_post(author_id, "Resilient lantern", "a resilient lantern beside the cedar gate", public=True)
    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: True)

    def unavailable_embedding(texts: list[str]):
        """Represent a provider outage without retaining submitted query text."""
        raise OpenAIServiceError("embedding_transport_error")

    async def available_answer(query: str, evidence: list[dict]):
        """Prove that approved lexical passages can still ground the answer stream."""
        assert query == "resilient lantern"
        assert any("Resilient lantern" in item["content"] for item in evidence)
        yield "[1] matches through its resilient lantern."

    monkeypatch.setattr(search_routes, "embed_texts", unavailable_embedding)
    monkeypatch.setattr(search_routes, "stream_grounded_explanation", available_answer)
    result = search(client, "resilient lantern")
    assert result["mode"] == "keyword"
    assert result["fallback_reason"] == "ai_unavailable"
    assert result["explanation_available"] is True
    assert result["explanation_token"]
    assert [item["id"] for item in result["public"]["items"]] == [post_id]
    streamed = client.post("/api/search/explanation", json={"token": result["explanation_token"]})
    assert streamed.status_code == 200
    assert "event: delta" in streamed.text and "event: done" in streamed.text


def test_explanation_rechecks_visibility_after_retrieval(client, monkeypatch):
    """Reject a public citation token when its source is unpublished before generation."""
    author_id, _ = create_account("visibilityauthor")
    post_id = create_search_post(author_id, "Fading lighthouse", "a fading lighthouse above the winter harbor", public=True)
    set_post_vector(post_id)
    monkeypatch.setattr(search_routes, "cloud_ai_configured", lambda: True)
    monkeypatch.setattr(search_routes, "embed_texts", lambda values: [[1.0] + [0.0] * 1535])
    result = search(client, "winter harbor lighthouse")
    assert result["explanation_token"]
    with SessionLocal() as db:
        post = db.get(Post, post_id)
        post.public = False
        synchronize_post_search(db, post)
        db.commit()
    response = client.post("/api/search/explanation", json={"token": result["explanation_token"]})
    assert response.status_code == 409


def test_load_more_rechecks_category_and_current_passage(client):
    """Drop continuation entries whose mutable filter fields or indexed revision changed."""
    author_id, _ = create_account("cursorauthor")
    post_ids = [
        create_search_post(author_id, f"Travel lantern {index}", f"travel lantern archive number {index} beside the river", public=True, category="travel")
        for index in range(11)
    ]
    result = search(client, "travel lantern", category="travel")
    delivered = {item["id"] for item in result["public"]["items"]}
    remaining_id = next(identifier for identifier in post_ids if identifier not in delivered)
    with SessionLocal() as db:
        post = db.get(Post, remaining_id)
        document = copy.deepcopy(post.document)
        document["details"]["category"] = "general"
        post.document = document
        synchronize_post_search(db, post)
        db.commit()
    page = client.post("/api/search/more", json={"cursor": result["public"]["cursor"]})
    assert page.status_code == 200
    assert page.json()["items"] == []


def test_operational_search_log_excludes_query_and_post_text(client, caplog):
    """Retain operational counts while excluding queries, titles, passages, and explanations."""
    author_id, _ = create_account("logauthor")
    create_search_post(author_id, "Unlogged secret title", "unlogged violet observatory phrase", public=True)
    caplog.set_level("INFO", logger="mablog.search")
    search(client, "unlogged violet observatory phrase")
    assert "search_completed" in caplog.text
    assert "unlogged violet observatory phrase" not in caplog.text
    assert "Unlogged secret title" not in caplog.text


def test_generation_rejects_a_truncated_provider_stream(monkeypatch):
    """Do not report success when a provider connection ends without a completion event."""
    class FakeResponse:
        """Provide one text delta and then simulate an early transport close."""

        status_code = 200

        async def __aenter__(self):
            """Enter the fake streaming response context."""
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            """Leave the fake response context without suppressing exceptions."""
            return False

        async def aiter_lines(self):
            """Yield one valid delta without the required response.completed event."""
            yield 'data: {"type":"response.output_text.delta","delta":"Partial"}'

    class FakeClient:
        """Stand in for the async OpenAI HTTP client during truncation handling."""

        def __init__(self, *args, **kwargs):
            """Accept the production timeout argument without network setup."""

        async def __aenter__(self):
            """Enter the fake client context."""
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            """Leave the fake client context without suppressing exceptions."""
            return False

        def stream(self, *args, **kwargs):
            """Return the incomplete fake provider response."""
            return FakeResponse()

    async def consume_stream():
        """Collect provider deltas so the terminal validation branch executes."""
        return [part async for part in generation.stream_grounded_explanation("question", [{"citation": 1, "title": "Post", "content": "Evidence"}])]

    monkeypatch.setattr(generation, "OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(generation.httpx, "AsyncClient", FakeClient)
    with pytest.raises(OpenAIServiceError, match="generation_incomplete_response"):
        asyncio.run(consume_stream())




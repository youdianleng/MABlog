"""Integration coverage for the durable weekly AI-news extension."""

import copy
import json
from datetime import UTC, datetime
from types import SimpleNamespace

import pytest

from app import bootstrap
from app.database import SessionLocal
from app.models import AdminStepUp, AutomatedEdition, LoginSession, NewsClaim, NewsDocument, NewsJob, NewsRun, NewsSetting, Post, PostLocalization, User
from app.schemas import Document
from app.services import authentication as auth
from app.services.ai_news import classification, verification
from app.services.ai_news.classification import _classification_excerpt
from app.services.ai_news.composition import _paragraphs, public_text, structured_document, validate_structured_documents
from app.services.ai_news.corrections import _restore_locked_evidence, validate_correction
from app.services.ai_news.providers.openai import OpenAIResult
from app.services.ai_news.provider_settings import effective_key, model_for
from app.services.ai_news.publication import compatibility_document
from app.services.ai_news.safe_fetch import SafeFetchError, validate_public_https
from app.services.ai_news.safety import deterministic_safety
from app.services.ai_news.scheduler import create_run
from app.services.public_cache import invalidate_public_cache
from app.utils import digest, new_id, now


@pytest.fixture(autouse=True)
def isolated_news_database(reset_database):
    """Reset data and seed the AI-news foundation for each pipeline test."""

    reset_database("AI-news tests")
    bootstrap.ensure_ai_news_foundation()
    invalidate_public_cache()
    yield

def create_account(name: str, administrator: bool = False) -> tuple[str, str]:
    """Create one active account and its raw fixture cookie token."""
    with SessionLocal() as db:
        user = User(email=f"{name}@example.com", username=name, display_name=name, password=auth.password_hasher.hash("test-password-123"), active=True, verified_until=now() + 604800, is_admin=administrator)
        db.add(user)
        db.flush()
        token = f"ai-news-token-{name}"
        db.add(LoginSession(token=digest(token), user_id=user.id, expires=user.verified_until))
        db.commit()
        return user.id, token


def localized_document(language: str, title: str) -> dict:
    """Build one valid typed AI-news localization for presentation tests."""
    return {
        "kind": "ai_news",
        "language": language,
        "details": {"title": title, "summary": f"{title} summary", "cover": "/api/media/test-cover", "category": "technology"},
        "edition_date": "2026-09-14",
        "cover_alt": "Celestial AI model release cover",
        "tags": ["ai-news", "model-release"],
        "blocks": [
            {"id": "overview", "type": "overview", "paragraphs": [{"text": "Evidence-backed overview.", "citations": [1]}]},
            {"id": "release-one", "type": "release", "release_id": "one", "title": "Model update", "paragraphs": [{"text": "The model became available.", "citations": [1]}], "source_numbers": [1]},
            {"id": "sources", "type": "sources", "citations": [{"number": 1, "url": "https://openai.com/products/release-notes/", "title": "Official release notes", "official": True}]},
        ],
    }


def test_system_identity_cannot_login_and_admin_workspace_is_protected(client):
    """Keep the publisher noninteractive and require a current human administrator session."""
    rejected = client.post("/api/auth/login", json={"login": "mablog_ia", "password": "!system-account-no-login!"})
    assert rejected.status_code == 401
    _, regular_token = create_account("regular")
    client.cookies.set("mablog_session", regular_token)
    assert client.get("/api/admin/ai-news/status").status_code == 403
    client.cookies.clear()
    _, administrator_token = create_account("curator", True)
    client.cookies.set("mablog_session", administrator_token)
    response = client.get("/api/admin/ai-news/status")
    assert response.status_code == 200
    assert response.json()["schedule"]["enabled"] is False


def test_provider_management_redacts_keys_and_blocks_mid_run_changes(client):
    """Require step-up, encrypt keys, hide validation input, and freeze active runs."""
    _, regular_token = create_account("provider_reader")
    client.cookies.set("mablog_session", regular_token)
    assert client.get("/api/admin/ai-news/providers").status_code == 403
    _, token = create_account("provider_curator", True)
    client.cookies.set("mablog_session", token)
    initial = client.get("/api/admin/ai-news/providers")
    assert initial.status_code == 200
    assert "ciphertext" not in initial.text and "api_key" not in initial.text
    path = "/api/admin/ai-news/providers/keys/brave"
    assert client.put(path, json={"api_key": "brave-test-key-1234"}).status_code == 403
    with SessionLocal() as db:
        db.add(AdminStepUp(session_token=digest(token), created=now(), expires=now() + 600))
        db.commit()
    invalid = client.put(path, json={"api_key": "short"})
    assert invalid.status_code == 422 and "short" not in invalid.text
    saved = client.put(path, json={"api_key": "brave-test-key-1234"})
    assert saved.status_code == 200
    assert saved.json()["providers"]["brave"] == {"configured": True, "source": "saved"}
    assert "brave-test-key-1234" not in saved.text
    with SessionLocal() as db:
        settings = db.get(NewsSetting, 1)
        assert settings.brave_key_ciphertext and "brave-test-key-1234" not in settings.brave_key_ciphertext
        assert effective_key(db, "brave") == "brave-test-key-1234"
    changed = client.put("/api/admin/ai-news/providers/models", json={"small_model": "test-fast-model", "strong_model": "test-strong-model"})
    assert changed.status_code == 200
    with SessionLocal() as db:
        assert model_for(db, "small") == "test-fast-model"
        assert model_for(db, "strong") == "test-strong-model"
    with SessionLocal() as db:
        create_run(db, "preview", False)
    blocked = client.delete(path)
    assert blocked.status_code == 409
    assert client.put("/api/admin/ai-news/providers/models", json={"small_model": "another-model", "strong_model": "test-strong-model"}).status_code == 409


def test_scheduler_links_active_requests_and_keeps_one_waiting_catchup():
    """Prevent parallel executions and collapse overlapping scheduled starts into one waiting run."""
    with SessionLocal() as db:
        active, created = create_run(db, "preview", False)
        linked, linked_created = create_run(db, "immediate", True)
        waiting, waiting_created = create_run(db, "scheduled", True, waiting=True)
        repeated, repeated_created = create_run(db, "catchup", True, waiting=True)
        assert created is True
        assert linked_created is False and linked.id == active.id
        assert waiting_created is True and waiting.status == "waiting"
        assert repeated_created is False and repeated.id == waiting.id
        assert db.query(NewsRun).filter(NewsRun.status.in_(["pending", "running", "retrying"])).count() == 1
        assert db.query(NewsJob).count() == 1


def test_bilingual_reader_and_carousel_limit_automated_editions(client):
    """Return the selected localization and allow at most one AI-news card among five features."""
    author_id, _ = create_account("community")
    with SessionLocal() as db:
        system = db.query(User).filter(User.username == "mablog_ia").one()
        for index in range(2):
            compatibility = Document().model_dump()
            compatibility["details"].update({"title": f"English AI {index}", "summary": "English", "cover": "/api/media/test-cover", "category": "technology"})
            post = Post(author_id=system.id, public=True, document=compatibility, versions={}, kind="ai_news", published=now() + 100 + index)
            db.add(post)
            db.flush()
            documents = {"en": localized_document("en", f"English AI {index}"), "es": localized_document("es", f"IA española {index}")}
            db.add_all([PostLocalization(post_id=post.id, language=language, document=document) for language, document in documents.items()])
            db.add(AutomatedEdition(id=new_id(), run_id=_completed_run(db), post_id=post.id, status="published", documents=documents, verification={"passed": True}, source_count=1, verified_at=now()))
        for index in range(4):
            document = Document().model_dump()
            document["details"].update({"title": f"Community {index}", "summary": "Human story", "cover": "/api/media/human", "category": "general"})
            db.add(Post(author_id=author_id, public=True, document=document, versions={}, kind="human", published=now() + index))
        db.commit()
    collection = client.get("/api/posts?language=es").json()
    localized = [post for post in collection if post["kind"] == "ai_news"]
    assert localized and all(post["title"].startswith("IA española") for post in localized)
    featured = client.get("/api/carousel?language=es").json()
    assert len(featured) == 5
    assert sum(post["kind"] == "ai_news" for post in featured) == 1


def _completed_run(db) -> str:
    """Persist a terminal run that can own one automated edition fixture."""
    run = NewsRun(kind="scheduled", status="published", stage="retention", publication_intent=True, window_start=now() - 86400, window_end=now(), progress=100, idempotency_key=f"fixture:{new_id()}")
    db.add(run)
    db.flush()
    return run.id


def test_safe_fetch_rejections_and_verbatim_publication_gate():
    """Reject private/credential URLs and long quoted passages before public moderation."""
    for unsafe in ("http://example.com", "https://user:pass@example.com", "https://example.com:444/path", "https://127.0.0.1/test"):
        with pytest.raises(SafeFetchError):
            validate_public_https(unsafe)
    documents = {"en": localized_document("en", "Weekly update"), "es": localized_document("es", "Actualización semanal")}
    quoted = '"' + " ".join(["copied"] * 26) + '"'
    documents["en"]["blocks"][0]["paragraphs"][0]["text"] = quoted
    assert "excessive_verbatim_quote:en" in deterministic_safety(documents)


def test_verification_keeps_last_complete_document_when_first_repair_is_malformed(monkeypatch):
    """Use the second bounded repair after rejecting a structurally invalid first repair."""
    original = {"en": {"complete": True}, "es": {"complete": True}}
    repaired = {"en": {"repaired": True}, "es": {"repaired": True}}
    repair_attempts: list[int] = []

    def fake_verify_once(db, run, documents, attempt=0):
        """Fail the original verification and accept the second complete repair."""
        if documents is original:
            return {"passed": False, "issues": [{"reason": "unsupported"}]}
        return {"passed": True, "issues": []}

    def fake_compose_roundup(db, run, context):
        """Simulate one malformed provider repair followed by a complete edition."""
        repair_attempts.append(context["attempt"])
        if context["attempt"] == 1:
            raise RuntimeError("empty_block_en")
        assert context["previous_documents"] is original
        assert context["issues"][-1]["reason"] == "repair_structure:empty_block_en"
        return repaired, []

    monkeypatch.setattr(verification, "verify_once", fake_verify_once)
    monkeypatch.setattr(verification, "compose_roundup", fake_compose_roundup)

    documents, report = verification.verify_with_repairs(None, object(), original)
    assert documents is repaired
    assert report["passed"] is True
    assert repair_attempts == [1, 2]


def test_structured_paragraph_removes_duplicate_trailing_citation_markers():
    """Keep prose intact while making the typed citation array the only rendered marker source."""
    values = [{"text": "A supported release statement. [1, 2]", "citations": [1, 2]}]
    assert _paragraphs(values, {1, 2}) == [{"text": "A supported release statement.", "citations": [1, 2]}]


def test_classification_reaches_later_provider_benchmark_tables():
    """Expose bounded table evidence beyond the release introduction without full-page prompts."""
    source = "A" * 18_000 + "\nUnrelated detail\nTerminal-Bench 4.0 Opus 5.5 66.4% with tools\nFurther source context"
    excerpt = _classification_excerpt(source)
    assert excerpt.startswith("A" * 18_000)
    assert "Terminal-Bench 4.0 Opus 5.5 66.4% with tools" in excerpt
    assert len(excerpt) < 27_000


def test_classification_retains_only_exact_official_benchmark_evidence(monkeypatch):
    """Store provider score claims separately from release facts only when their quote exists."""
    source_url = "https://example.com/release"
    quote = "Terminal-Bench 4.0 Opus 5.5 66.4% with tools"
    payload = {"releases": [{"provider": "Example", "model_name": "Opus 5.5", "model_version": "5.5", "update_type": "release", "title": "Opus 5.5 release", "published_date": "2026-09-22", "official_url": source_url, "source_urls": [source_url], "claims": [{"key": "release", "kind": "fact", "text_en": "Opus 5.5 launched.", "text_es": "Se lanzó Opus 5.5.", "evidence_quote": "Opus 5.5 launched", "source_url": source_url}, {"key": "terminal-bench", "kind": "benchmark", "text_en": "Opus 5.5 scored 66.4% on Terminal-Bench 4.0 with tools.", "text_es": "Opus 5.5 logró un 66,4 % en Terminal-Bench 4.0 con herramientas.", "evidence_quote": quote, "source_url": source_url}, {"key": "invented", "kind": "benchmark", "text_en": "An unsupported score.", "text_es": "Una puntuación no respaldada.", "evidence_quote": "Unpublished benchmark 99.9%", "source_url": source_url}]}]}

    def fake_responses_call(*args, **kwargs):
        """Return a deterministic classification without contacting a paid model."""
        return OpenAIResult(text=json.dumps(payload), input_tokens=0, output_tokens=0, model="test-model")

    monkeypatch.setattr(classification, "responses_call", fake_responses_call)
    with SessionLocal() as db:
        run = NewsRun(kind="preview", status="running", window_start=datetime(2026, 9, 21, tzinfo=UTC).timestamp(), window_end=datetime(2026, 9, 23, tzinfo=UTC).timestamp(), idempotency_key=f"test:{new_id()}")
        db.add(run)
        db.flush()
        db.add(NewsDocument(run_id=run.id, url=source_url, canonical_url=source_url, mime="text/html", content_hash="source-hash", extracted_text=f"Opus 5.5 launched. {quote}", official=True, snapshot_expires=now() + 86400))
        db.flush()
        candidates = classification.classify_releases(db, run)
        db.flush()
        claims = db.query(NewsClaim).filter(NewsClaim.candidate_id == candidates[0].id).all()
        assert len(candidates) == 1
        assert len(claims) == 2
        assert {claim.evidence[0]["kind"] for claim in claims} == {"fact", "benchmark"}


def test_new_roundup_preserves_cited_benchmarks_and_distinct_audience_impacts():
    """Keep provider scores visible and searchable while requiring useful release sections."""
    citations = [{"number": 1, "url": "https://example.com/release", "title": "Official release", "official": True}]
    claims = {"one": [{"kind": "benchmark", "text_en": "Terminal-Bench 4.0: 66.4% with tools; predecessor 55.8%.", "text_es": "Terminal-Bench 4.0: 66,4 % con herramientas; predecesor 55,8 %.", "evidence": [{"citation": 1}]}]}

    def release_value(language: str) -> dict:
        """Build one cited section with separate release, developer, and reader impacts."""
        return {"title": "Weekly AI models", "summary": "Evidence-based changes", "overview": [{"text": "A model launched.", "citations": [1]}], "sections": [{"release_id": "one", "title": "New model", "paragraphs": [{"focus": focus, "text": f"{focus} detail in {language}.", "citations": [1]} for focus in ("change", "developer", "reader")], "source_numbers": [1]}]}

    run = SimpleNamespace(window_end=1_789_646_400)
    documents = {language: structured_document(language, release_value(language), citations, run, release_claims=claims) for language in ("en", "es")}
    validate_structured_documents(documents, {"one"})
    release = documents["en"]["blocks"][1]
    assert release["benchmarks"] == [{"text": claims["one"][0]["text_en"], "citations": [1]}]
    assert "66.4%" in public_text(documents["en"])
    assert "66.4%" in compatibility_document(documents["en"])["blocks"][1]["html"]

    missing_impact = copy.deepcopy(documents)
    missing_impact["es"]["blocks"][1]["paragraphs"] = missing_impact["es"]["blocks"][1]["paragraphs"][:2]
    with pytest.raises(RuntimeError, match="release_impact_missing_es"):
        validate_structured_documents(missing_impact, {"one"})

    altered_benchmark = copy.deepcopy(documents)
    altered_benchmark["en"]["blocks"][1]["benchmarks"][0]["text"] = "Unverified higher score."
    with pytest.raises(RuntimeError, match="correction_benchmark_identity_changed"):
        validate_correction(documents, altered_benchmark)

    translated = copy.deepcopy(documents["es"])
    translated["blocks"][1]["benchmarks"] = []
    translated["blocks"][1]["paragraphs"][0]["focus"] = "reader"
    translated["blocks"][1]["paragraphs"][0]["text"] = "Rewritten, cited change."
    restored = _restore_locked_evidence(documents["es"], translated)
    assert restored["blocks"][1]["benchmarks"] == documents["es"]["blocks"][1]["benchmarks"]
    assert restored["blocks"][1]["paragraphs"][0]["focus"] == "change"




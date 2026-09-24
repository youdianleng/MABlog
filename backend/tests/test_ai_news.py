"""Integration coverage for the durable weekly AI-news extension."""

import copy
import json
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace

import pytest
from sqlalchemy import select

from app import bootstrap
from app.database import SessionLocal
from app.models import (
    AdminAuditEvent,
    AdminStepUp,
    AutomatedEdition,
    LoginSession,
    NewsCandidate,
    NewsClaim,
    NewsDocument,
    NewsJob,
    NewsRun,
    NewsSetting,
    Post,
    PostLocalization,
    User,
)
from app.schemas import Document
from app.services import authentication as auth
from app.services.ai_news import classification, publication, safety, state_machine, verification
from app.services.ai_news.classification import _classification_excerpt
from app.services.ai_news.composition import _paragraphs, public_text, structured_document, validate_structured_documents
from app.services.ai_news.corrections import _restore_locked_evidence, validate_correction
from app.services.ai_news.provider_settings import effective_key, model_for
from app.services.ai_news.providers.openai import OpenAIResult
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


def create_failed_evidence_preview(*, unsafe_text: bool = False) -> str:
    """Retain a bilingual, source-backed preview stopped only by fact verification."""
    source_url = "https://example.com/official-release"
    release_id = new_id()
    documents = {"en": localized_document("en", "AI update"), "es": localized_document("es", "Actualización de IA")}
    for document in documents.values():
        document["blocks"][1]["release_id"] = release_id
        document["blocks"][-1]["citations"][0]["url"] = source_url
    if unsafe_text:
        documents["en"]["blocks"][0]["paragraphs"][0]["text"] = "Secret sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    with SessionLocal() as db:
        run = NewsRun(kind="preview", status="failed", stage="verify", publication_intent=False, window_start=now() - 86400, window_end=now(), progress=60, last_error="verification_failed_after_repairs", idempotency_key=f"override:{new_id()}")
        db.add(run)
        db.flush()
        db.add(NewsCandidate(id=release_id, run_id=run.id, provider="Example", model_name="Example 1", normalized_key=f"example:{run.id}", title="Example release", url=source_url, official_url=source_url, published_at=now(), status="qualifying"))
        db.add(NewsDocument(run_id=run.id, url=source_url, canonical_url=source_url, mime="text/html", content_hash="retained-hash", extracted_text="Example release", official=True, snapshot_expires=now() + 86400))
        db.add(AutomatedEdition(run_id=run.id, status="composed", documents=documents, verification={"passed": False, "issues": [{"release_id": release_id, "language": "both", "reason": "Citation does not establish the model name."}]}, source_count=1))
        db.add(NewsJob(run_id=run.id, stage="verify", status="failed", attempts=1, idempotency_key=f"{run.id}:verify", last_error=run.last_error))
        db.commit()
        return run.id


def create_safety_cleared_manual_preview(*, unsafe_text: bool = False) -> str:
    """Retain an ordinary preview that bypassed claim review but passed initial safety checks."""
    run_id = create_failed_evidence_preview(unsafe_text=unsafe_text)
    with SessionLocal() as db:
        run = db.get(NewsRun, run_id)
        run.status = "preview"
        run.stage = "retention"
        run.last_error = ""
        edition = db.query(AutomatedEdition).filter_by(run_id=run_id).one()
        edition.status = "safety_cleared_preview"
        edition.verification = {"fact_check_performed": False, "safety": {"passed": True, "issues": []}}
        db.query(NewsJob).filter_by(run_id=run_id).delete()
        db.commit()
    return run_id


def test_preview_policy_skips_claim_review_only_for_ordinary_administrator_runs(monkeypatch):
    """Keep automatic and activation-test verification while skipping ordinary-preview jobs."""
    documents = {"en": localized_document("en", "AI update"), "es": localized_document("es", "Actualización de IA")}

    def compose(_db, _run):
        """Return a fixed bilingual draft without a paid composition request."""
        return documents, [{"number": 1}]

    def check_safety(_db, _run, _documents):
        """Stand in for the separate bilingual safety gate."""
        return {"passed": True, "issues": []}

    def verify(_db, _run, value):
        """Record that a full-path run actually reached the retained verifier."""
        assert value == documents
        return value, {"passed": True, "model": "test-verifier"}

    monkeypatch.setattr(state_machine, "compose_roundup", compose)
    monkeypatch.setattr(state_machine, "publication_safety", check_safety)
    monkeypatch.setattr(state_machine, "verify_with_repairs", verify)
    with SessionLocal() as db:
        manual, _ = create_run(db, "preview", False)
        state_machine._stage_compose(db, manual)
        job = db.scalar(select(NewsJob).where(NewsJob.run_id == manual.id))
        job.stage = "compose"
        state_machine._complete_stage(db, job, manual, {})
        assert manual.stage == "safety"
        assert db.scalar(select(NewsJob).where(NewsJob.run_id == manual.id, NewsJob.stage == "verify")) is None
        state_machine._stage_safety(db, manual)
        state_machine._stage_finalize(db, manual)
        assert db.get(NewsSetting, 1).activation_preview_run_id is None
        assert db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == manual.id)).verification["fact_check_performed"] is False
        db.commit()
        rehearsal, _ = create_run(db, "preview", False, verify_for_activation=True)
        state_machine._stage_compose(db, rehearsal)
        rehearsal_job = db.scalar(select(NewsJob).where(NewsJob.run_id == rehearsal.id))
        rehearsal_job.stage = "compose"
        state_machine._complete_stage(db, rehearsal_job, rehearsal, {})
        assert rehearsal.stage == "verify"
        state_machine._stage_verify(db, rehearsal)
        state_machine._stage_safety(db, rehearsal)
        state_machine._stage_finalize(db, rehearsal)
        assert db.get(NewsSetting, 1).activation_preview_run_id == rehearsal.id


def test_manual_unverified_preview_requires_explicit_approval_and_discloses_status(client, monkeypatch):
    """Allow a reviewed manual preview without enabling the schedule or claiming verification."""
    from app.api.ai_news import dashboard

    run_id = create_safety_cleared_manual_preview()
    path = f"/api/admin/ai-news/runs/{run_id}/publish-unverified-preview"
    payload = {"reason": "Reviewed both languages and official links", "acknowledged_risk": True}
    _, regular_token = create_account("manual_reader")
    client.cookies.set("mablog_session", regular_token)
    assert client.post(path, json=payload).status_code == 403
    _, admin_token = create_account("manual_curator", True)
    client.cookies.set("mablog_session", admin_token)
    assert client.post(path, json=payload).status_code == 403
    with SessionLocal() as db:
        db.add(AdminStepUp(session_token=digest(admin_token), created=now(), expires=now() + 600))
        db.commit()
    assert client.post(path, json={**payload, "acknowledged_risk": False}).status_code == 422
    assert client.post(f"/api/admin/ai-news/runs/{run_id}/publish").status_code == 409

    def current_source(_url):
        """Avoid a live network request while exercising source reachability."""
        return SimpleNamespace()

    def changed_hash(_source):
        """Ensure a reachable changed source is disclosed rather than blocking approval."""
        return SimpleNamespace(content_hash="new-source-hash")

    def safe_moderation(_text, _db):
        """Replace paid moderation while preserving the real deterministic gate."""
        return {"flagged": False, "categories": {}}

    def local_cover(*_args):
        """Avoid writing a real cover to disk in this isolated database test."""
        return Path("fixture-cover.png")

    def no_search_index(*_args):
        """Keep search indexing outside this publication-boundary test."""
        return None

    monkeypatch.setattr(dashboard, "fetch_public_document", current_source)
    monkeypatch.setattr(dashboard, "extract_source", changed_hash)
    monkeypatch.setattr(safety, "moderate_text", safe_moderation)
    monkeypatch.setattr(publication, "render_cover", local_cover)
    monkeypatch.setattr(publication, "synchronize_post_search", no_search_index)
    response = client.post(path, json=payload)
    assert response.status_code == 200, response.text
    assert response.json()["verification_status"] == "administrator_unverified_preview"
    with SessionLocal() as db:
        edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run_id))
        assert edition.verification["fact_check_performed"] is False
        assert edition.verification["manual_unverified_preview"]["reason"] == payload["reason"]
        assert db.get(NewsSetting, 1).activation_preview_run_id is None
        assert db.get(NewsSetting, 1).last_successful_scan == 0
        assert db.query(AdminAuditEvent).filter_by(action="ai_news.preview.unverified_published").count() == 1
    public = client.get(f"/api/posts/{response.json()['post_id']}")
    assert public.status_code == 200
    assert public.json()["ai_news"]["fact_check_passed"] is False
    assert public.json()["ai_news"]["manual_unverified_preview"] is True
    assert public.json()["ai_news"]["source_changed_on_publish"] is True
    assert client.post(path, json=payload).status_code == 409


def test_unverified_preview_cannot_bypass_safety_or_full_path_policy(client, monkeypatch):
    """Reject unsafe text and forbid a full-path rehearsal from using manual approval."""
    from app.api.ai_news import dashboard

    _, token = create_account("manual_safety_curator", True)
    client.cookies.set("mablog_session", token)
    with SessionLocal() as db:
        db.add(AdminStepUp(session_token=digest(token), created=now(), expires=now() + 600))
        db.commit()
    payload = {"reason": "Reviewed both languages and original sources", "acknowledged_risk": True}
    run_id = create_safety_cleared_manual_preview(unsafe_text=True)

    def current_source(_url):
        """Keep source reachability independent of the safety rejection."""
        return SimpleNamespace()

    def retained_hash(_source):
        """Match the retained official-source fingerprint."""
        return SimpleNamespace(content_hash="retained-hash")

    def safe_moderation(_text, _db):
        """Let the deterministic secret rule trigger the intended rejection."""
        return {"flagged": False, "categories": {}}

    monkeypatch.setattr(dashboard, "fetch_public_document", current_source)
    monkeypatch.setattr(dashboard, "extract_source", retained_hash)
    monkeypatch.setattr(safety, "moderate_text", safe_moderation)
    path = f"/api/admin/ai-news/runs/{run_id}/publish-unverified-preview"
    blocked = client.post(path, json=payload)
    assert blocked.status_code == 409 and "secret_pattern:en" in blocked.text
    with SessionLocal() as db:
        run = db.get(NewsRun, run_id)
        run.result = {"verify_for_activation": True}
        db.commit()
    assert client.post(path, json=payload).status_code == 409
    with SessionLocal() as db:
        assert db.query(Post).filter_by(kind="ai_news", public=True).count() == 0


def test_verified_preview_explains_duplicate_publication_before_source_recheck(client):
    """Expose the existing post and reject republication without a misleading source error."""
    run_id = create_safety_cleared_manual_preview()
    with SessionLocal() as db:
        run = db.get(NewsRun, run_id)
        candidate = db.scalar(select(NewsCandidate).where(NewsCandidate.run_id == run_id))
        edition = db.scalar(select(AutomatedEdition).where(AutomatedEdition.run_id == run_id))
        run.result = {"verify_for_activation": True}
        edition.status = "verified_preview"
        edition.verification = {"passed": True, "safety": {"passed": True}}
        system = db.scalar(select(User).where(User.username == "mablog_ia"))
        post = Post(author_id=system.id, public=True, document=Document().model_dump(), versions={}, kind="ai_news", published=now())
        db.add(post)
        db.flush()
        post_id = post.id
        db.add(NewsCandidate(run_id=_completed_run(db), provider=candidate.provider, model_name=candidate.model_name, normalized_key=candidate.normalized_key, title=candidate.title, url=candidate.url, official_url=candidate.official_url, status="published", details={"published_post_id": post.id}))
        db.commit()
    _, token = create_account("duplicate_curator", True)
    client.cookies.set("mablog_session", token)
    with SessionLocal() as db:
        db.add(AdminStepUp(session_token=digest(token), created=now(), expires=now() + 600))
        db.commit()
    detail = client.get(f"/api/admin/ai-news/runs/{run_id}")
    assert detail.status_code == 200
    assert detail.json()["publication_conflicts"] == [{"model_name": "Example 1", "post_id": post_id}]
    blocked = client.post(f"/api/admin/ai-news/runs/{run_id}/publish")
    assert blocked.status_code == 409
    assert "Already published" in blocked.json()["detail"]
    assert "source changed" not in blocked.json()["detail"]


def test_evidence_override_requires_step_up_and_acknowledgement_then_discloses_publicly(client, monkeypatch):
    """Allow only a deliberate administrator exception and never relabel it verified."""
    from app.api.ai_news import dashboard

    run_id = create_failed_evidence_preview()
    path = f"/api/admin/ai-news/runs/{run_id}/publish-evidence-override"
    payload = {"reason": "Reviewed the unsupported citation in both languages", "acknowledged_risk": True}
    _, regular_token = create_account("override_reader")
    client.cookies.set("mablog_session", regular_token)
    assert client.post(path, json=payload).status_code == 403
    _, admin_token = create_account("override_curator", True)
    client.cookies.set("mablog_session", admin_token)
    assert client.post(path, json=payload).status_code == 403
    with SessionLocal() as db:
        db.add(AdminStepUp(session_token=digest(admin_token), created=now(), expires=now() + 600))
        db.commit()
    assert client.post(path, json={"reason": payload["reason"]}).status_code == 422
    assert client.post(path, json={**payload, "acknowledged_risk": False}).status_code == 422
    assert client.post(path, json={**payload, "reason": "            "}).status_code == 422
    assert client.post(f"/api/admin/ai-news/runs/{run_id}/publish").status_code == 409
    with SessionLocal() as db:
        active, _ = create_run(db, "preview", False)
        active_id = active.id
        db.commit()
    assert client.post(path, json=payload).status_code == 409
    with SessionLocal() as db:
        db.get(NewsRun, active_id).status = "quiet"
        db.commit()

    def current_source(_url):
        """Represent a still-identical official source without network access."""
        return SimpleNamespace()

    def retained_hash(_source):
        """Return the source fingerprint stored with the failed preview."""
        return SimpleNamespace(content_hash="retained-hash")

    def safe_moderation(_text, _db):
        """Avoid a paid provider request while exercising the real safety gate."""
        return {"flagged": False, "categories": {}}

    def local_cover(*_args):
        """Avoid writing an image during the database-only publication test."""
        return Path("fixture-cover.png")

    def no_search_index(*_args):
        """Leave search indexing outside this publication-boundary test."""
        return None

    monkeypatch.setattr(dashboard, "fetch_public_document", current_source)
    monkeypatch.setattr(dashboard, "extract_source", retained_hash)
    monkeypatch.setattr(safety, "moderate_text", safe_moderation)
    monkeypatch.setattr(publication, "render_cover", local_cover)
    monkeypatch.setattr(publication, "synchronize_post_search", no_search_index)
    result = client.post(path, json=payload)
    assert result.status_code == 200, result.text
    assert result.json()["verification_status"] == "administrator_override"
    post_id = result.json()["post_id"]
    with SessionLocal() as db:
        run = db.get(NewsRun, run_id)
        edition = db.query(AutomatedEdition).filter_by(run_id=run_id).one()
        assert db.get(Post, post_id).public is True
        assert run.status == "published" and run.last_error == "verification_failed_after_repairs"
        assert run.result["evidence_override_published"] is True
        assert edition.verification["passed"] is False
        assert edition.verification["safety"]["passed"] is True
        assert edition.verification["manual_override"]["reason"] == payload["reason"]
        assert db.get(NewsSetting, 1).activation_preview_run_id is None
        assert db.query(AdminAuditEvent).filter_by(action="ai_news.preview.evidence_override_published").count() == 1
    public = client.get(f"/api/posts/{post_id}")
    assert public.status_code == 200
    assert public.json()["ai_news"]["fact_check_passed"] is False
    assert public.json()["ai_news"]["source_changed_on_publish"] is False
    assert client.post(path, json=payload).status_code == 409


def test_evidence_override_accepts_source_drift_but_still_blocks_unsafe_content(client, monkeypatch):
    """Audit changed official pages in an exception while retaining safety and normal-publication gates."""
    from app.api.ai_news import dashboard

    _, admin_token = create_account("override_safety_curator", True)
    client.cookies.set("mablog_session", admin_token)
    with SessionLocal() as db:
        db.add(AdminStepUp(session_token=digest(admin_token), created=now(), expires=now() + 600))
        db.commit()
    payload = {"reason": "Reviewed the bilingual draft and accept the citation risk", "acknowledged_risk": True}
    changed_run_id = create_failed_evidence_preview()

    def current_source(_url):
        """Return a network-free source stand-in for both checks."""
        return SimpleNamespace()

    def changed_hash(_source):
        """Simulate official content changing after the preview was retained."""
        return SimpleNamespace(content_hash="changed-hash")

    def retained_hash(_source):
        """Simulate the original source remaining available and unchanged."""
        return SimpleNamespace(content_hash="retained-hash")

    def safe_moderation(_text, _db):
        """Leave the deterministic secret check as the failing safety gate."""
        return {"flagged": False, "categories": {}}

    def local_cover(*_args):
        """Avoid writing a generated cover in this database-only publication test."""
        return Path("fixture-cover.png")

    def no_search_index(*_args):
        """Keep the source-drift regression independent of search indexing."""
        return None

    monkeypatch.setattr(dashboard, "fetch_public_document", current_source)
    monkeypatch.setattr(dashboard, "extract_source", changed_hash)
    monkeypatch.setattr(safety, "moderate_text", safe_moderation)
    monkeypatch.setattr(publication, "render_cover", local_cover)
    monkeypatch.setattr(publication, "synchronize_post_search", no_search_index)
    verified_run_id = create_failed_evidence_preview()
    with SessionLocal() as db:
        verified_run = db.get(NewsRun, verified_run_id)
        verified_run.status = "preview"
        verified_run.last_error = ""
        verified_edition = db.query(AutomatedEdition).filter_by(run_id=verified_run_id).one()
        verified_edition.status = "verified_preview"
        verified_edition.verification = {"passed": True}
        db.commit()
    assert client.post(f"/api/admin/ai-news/runs/{verified_run_id}/publish").status_code == 409
    changed = client.post(f"/api/admin/ai-news/runs/{changed_run_id}/publish-evidence-override", json=payload)
    assert changed.status_code == 200, changed.text
    public = client.get(f"/api/posts/{changed.json()['post_id']}")
    assert public.json()["ai_news"]["fact_check_passed"] is False
    assert public.json()["ai_news"]["source_changed_on_publish"] is True
    with SessionLocal() as db:
        edition = db.query(AutomatedEdition).filter_by(run_id=changed_run_id).one()
        assert edition.verification["manual_override"]["changed_sources"][0]["current_hash"] == "changed-hash"
        assert db.get(NewsRun, changed_run_id).status == "published"
    unreachable_run_id = create_failed_evidence_preview()

    def unavailable_source(_url):
        """Keep unsafe or unreachable official pages outside the override."""
        raise SafeFetchError("source_unavailable")

    monkeypatch.setattr(dashboard, "fetch_public_document", unavailable_source)
    assert client.post(f"/api/admin/ai-news/runs/{unreachable_run_id}/publish-evidence-override", json=payload).status_code == 409
    unsafe_run_id = create_failed_evidence_preview(unsafe_text=True)
    monkeypatch.setattr(dashboard, "fetch_public_document", current_source)
    monkeypatch.setattr(dashboard, "extract_source", retained_hash)
    unsafe = client.post(f"/api/admin/ai-news/runs/{unsafe_run_id}/publish-evidence-override", json=payload)
    assert unsafe.status_code == 409
    assert "secret_pattern:en" in unsafe.text
    with SessionLocal() as db:
        assert db.get(NewsRun, verified_run_id).status == "preview"
        assert db.get(NewsRun, unreachable_run_id).status == "failed"
        assert db.get(NewsRun, unsafe_run_id).status == "failed"
        assert db.query(Post).filter_by(kind="ai_news", public=True).count() == 1


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


def test_verification_excludes_rejected_claims_from_later_repair_evidence(monkeypatch):
    """Prevent an unsupported extracted price from contradicting the repaired article forever."""
    requests: list[dict] = []

    def fake_response(model, instructions, input_text, max_output_tokens, **kwargs):
        """Return first-pass rejection, then approval over only the retained claim."""
        payload = json.loads(input_text)
        requests.append(payload)
        keys = [claim["claim_key"] for claim in payload["claims"]]
        report = {
            "passed": len(requests) == 2,
            "language_consistent": True,
            "citations_valid": len(requests) == 2,
            "claims": [{"claim_key": key, "status": "unsupported" if key == "rejected-price" else "supported", "reason": "quote omits units" if key == "rejected-price" else ""} for key in keys],
            "issues": [] if len(requests) == 2 else [{"release_id": "release", "language": "both", "reason": "Price quote omits units."}],
        }
        return OpenAIResult(text=json.dumps(report), input_tokens=0, output_tokens=0, model=model)

    def ignore_accounting(*_args):
        """Keep the evidence-scope regression independent of paid-stage counters."""
        return None

    def test_model(*_args):
        """Select a fixed verifier model name without reading provider settings."""
        return "test-verifier"

    monkeypatch.setattr(verification, "responses_call", fake_response)
    monkeypatch.setattr(verification, "assert_paid_stage_budget", ignore_accounting)
    monkeypatch.setattr(verification, "record_openai_usage", ignore_accounting)
    monkeypatch.setattr(verification, "model_for", test_model)
    with SessionLocal() as db:
        run = NewsRun(kind="preview", status="running", stage="verify", publication_intent=False, window_start=now() - 86400, window_end=now(), idempotency_key=f"fixture:{new_id()}")
        db.add(run)
        db.flush()
        db.add_all([
            NewsClaim(run_id=run.id, claim_key="eligible-release", text_en="Released.", text_es="Lanzado.", status="supported", evidence=[]),
            NewsClaim(run_id=run.id, claim_key="rejected-price", text_en="Price per million tokens.", text_es="Precio por millón de tokens.", status="supported", evidence=[]),
        ])
        db.flush()
        first = verification.verify_once(db, run, {"en": {}, "es": {}}, 0)
        second = verification.verify_once(db, run, {"en": {}, "es": {}}, 1)
        assert first["passed"] is False
        assert second["passed"] is True
        assert [claim["claim_key"] for claim in requests[0]["claims"]] == ["eligible-release", "rejected-price"]
        assert [claim["claim_key"] for claim in requests[1]["claims"]] == ["eligible-release"]
        assert db.query(NewsClaim).filter_by(run_id=run.id, claim_key="rejected-price").one().status == "unsupported"


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




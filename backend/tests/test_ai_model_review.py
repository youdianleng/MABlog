"""Integration coverage for the administrator review of AI model files."""

from pathlib import Path

import pytest
import yaml
from sqlalchemy import select

from app.database import SessionLocal
from app.models import AdminAuditEvent, AdminStepUp, LoginSession, User
from app.services import ai_model_review
from app.services import authentication as auth
from app.utils import digest, now

DRAFT = """---
schema: mablog-ai-model/1
review_status: draft
slug: example-model
title_en: "Example Model"
review_notes:
  - Check the price page.
  - "Quote: verify the date"
---

# English

## Summary

Example.

## Update history

- 2026-10-02 — File created.

# Español

## Resumen

Ejemplo.

## Historial de actualizaciones

- 2026-10-02 — Ficha creada.
"""
NAME = "2026-10-01_example_example-model.md"


@pytest.fixture(autouse=True)
def isolated_review(reset_database, tmp_path, monkeypatch) -> Path:
    """Reset accounts and point the review service at a temporary model folder."""
    reset_database("AI model review tests")
    (tmp_path / NAME).write_text(DRAFT, encoding="utf-8")
    (tmp_path / "_run-report_2026-10-02.md").write_text("# Report\n", encoding="utf-8")
    (tmp_path / "rankings.yaml").write_text("schema: mablog-ai-rankings/1\n", encoding="utf-8")
    monkeypatch.setattr(ai_model_review, "AI_MODELS_DIR", tmp_path)
    return tmp_path


def login(client, name: str, administrator: bool = False, step_up: bool = False) -> str:
    """Create an account, attach its session cookie to the client, and optionally grant step-up."""
    with SessionLocal() as db:
        user = User(
            email=f"{name}@example.com",
            username=name,
            display_name=name,
            password=auth.password_hasher.hash("test-password-123"),
            active=True,
            verified_until=now() + 604800,
            is_admin=administrator,
        )
        db.add(user)
        db.flush()
        token = f"model-review-token-{name}"
        db.add(LoginSession(token=digest(token), user_id=user.id, expires=user.verified_until))
        # The step-up row references the session, so the session must be inserted first.
        db.flush()
        if step_up:
            db.add(AdminStepUp(session_token=digest(token), created=now(), expires=now() + 600))
        db.commit()
    client.cookies.set("mablog_session", token)
    return token


def current_version(client) -> str:
    """Return the listed sha256 of the example file."""
    files = client.get("/api/admin/ai-models").json()["files"]
    return next(item["sha256"] for item in files if item["name"] == NAME)


def front_matter(text: str) -> dict:
    """Parse the YAML front matter of a model file."""
    return yaml.safe_load(text.split("---\n")[1])


def test_only_administrators_can_read_model_files(client):
    """Drafts are unpublished: anonymous and regular accounts are refused, notes are excluded."""
    assert client.get("/api/admin/ai-models").status_code == 401
    login(client, "reader")
    assert client.get("/api/admin/ai-models").status_code == 403
    login(client, "curator", administrator=True)
    response = client.get("/api/admin/ai-models")
    assert response.status_code == 200
    body = response.json()
    assert [item["name"] for item in body["files"]] == [NAME]
    assert body["rankings"].startswith("schema: mablog-ai-rankings/1")


def test_approval_requires_step_up_and_records_notes_history_and_audit(client, isolated_review):
    """Approve only with recent verification; keep accepted notes in the history and audit it."""
    login(client, "approver", administrator=True)
    version = current_version(client)
    payload = {"sha256": version, "acknowledged": True, "note": "Checked\nboth languages."}
    assert client.post(f"/api/admin/ai-models/{NAME}/approve", json=payload).status_code == 403
    login(client, "verified", administrator=True, step_up=True)
    assert client.post(f"/api/admin/ai-models/{NAME}/approve", json={**payload, "acknowledged": False}).status_code == 422
    response = client.post(f"/api/admin/ai-models/{NAME}/approve", json=payload)
    assert response.status_code == 200
    text = (isolated_review / NAME).read_text(encoding="utf-8")
    assert response.json()["text"] == text
    data = front_matter(text)
    assert data["review_status"] == "reviewed" and data["review_notes"] == []
    assert "Marked reviewed by verified on the admin review page. Accepted open review notes: Check the price page. | Quote: verify the date" in text
    assert "Reviewer note: Checked both languages." in text
    assert "Notas de revisión aceptadas: 2" in text
    assert text.index("Marked reviewed") < text.index("# Español") < text.index("Marcada como revisada")
    with SessionLocal() as db:
        event = db.scalar(select(AdminAuditEvent).where(AdminAuditEvent.action == "ai_model_file.approved"))
        assert event.target_id == NAME and event.before["review_notes"] == ["Check the price page.", "Quote: verify the date"]
    # The same version cannot be approved twice, and a reviewed file cannot be approved again.
    assert client.post(f"/api/admin/ai-models/{NAME}/approve", json=payload).status_code == 409
    assert client.post(f"/api/admin/ai-models/{NAME}/approve", json={**payload, "sha256": current_version(client)}).status_code == 409


def test_stale_versions_and_unsafe_names_are_rejected(client, isolated_review):
    """A file edited after loading is not overwritten; names outside the pattern are not served."""
    login(client, "guard", administrator=True, step_up=True)
    version = current_version(client)
    (isolated_review / NAME).write_text(DRAFT.replace("Example.", "Edited."), encoding="utf-8")
    stale = client.post(f"/api/admin/ai-models/{NAME}/approve", json={"sha256": version, "acknowledged": True})
    assert stale.status_code == 409
    assert "Edited." in (isolated_review / NAME).read_text(encoding="utf-8")
    for name in ("_run-report_2026-10-02.md", "rankings.yaml", "..%2Fsecret.md", "missing.md"):
        response = client.post(f"/api/admin/ai-models/{name}/approve", json={"sha256": "0" * 64, "acknowledged": True})
        assert response.status_code == 404, name


def test_return_to_draft_requires_a_reason_and_adds_it_as_a_note(client, isolated_review):
    """Unpublishing keeps an explanation in review_notes and both history sections."""
    login(client, "editor", administrator=True, step_up=True)
    approved = client.post(f"/api/admin/ai-models/{NAME}/approve", json={"sha256": current_version(client), "acknowledged": True})
    assert approved.status_code == 200
    path = f"/api/admin/ai-models/{NAME}/return-to-draft"
    assert client.post(path, json={"sha256": approved.json()["sha256"], "reason": "short"}).status_code == 422
    response = client.post(path, json={"sha256": approved.json()["sha256"], "reason": "The price changed on the official page."})
    assert response.status_code == 200
    data = front_matter(response.json()["text"])
    assert data["review_status"] == "draft"
    assert data["review_notes"][0].endswith("by editor: The price changed on the official page.")
    assert "Devuelta a borrador por editor" in response.json()["text"]


def test_missing_folder_reports_unavailable(client, monkeypatch):
    """Without a configured folder the page explains the problem instead of failing silently."""
    monkeypatch.setattr(ai_model_review, "AI_MODELS_DIR", None)
    login(client, "operator", administrator=True)
    assert client.get("/api/admin/ai-models").status_code == 503

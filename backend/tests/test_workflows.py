"""Integration tests against an isolated PostgreSQL test database."""
import copy
import io
import re

import pytest
import redis
from PIL import Image
from sqlalchemy import delete, select

from app import bootstrap
from app.services import authentication as auth
from app.services import email_delivery
from app.api import media as media_routes, posts as post_routes
from app.database import SessionLocal
from app.models import Challenge, Draft, Grant, Like, LoginSession, Post, Proposal, User
from app.schemas import Document
from app.utils import digest, now
from app.services.public_cache import invalidate_public_cache


@pytest.fixture(autouse=True)
def isolated_database(reset_database, monkeypatch, tmp_path):
    """Reset data, isolate uploads, and invalidate public cache for each workflow."""

    reset_database("Workflow tests")
    monkeypatch.setattr(media_routes, "UPLOAD_DIR", tmp_path)
    monkeypatch.setattr(post_routes, "UPLOAD_DIR", tmp_path)
    invalidate_public_cache()
    yield

def account(name: str) -> tuple[str, str]:
    """Create a verified fixture account and an opaque session token."""
    with SessionLocal() as db:
        user = User(email=f"{name}@example.com", username=name, password=auth.password_hasher.hash("test-password-123"), active=True, verified_until=now() + 604800, display_name=name)
        db.add(user)
        db.flush()
        token = f"fixture-token-{name}"
        db.add(LoginSession(token=digest(token), user_id=user.id, expires=user.verified_until))
        db.commit()
        return user.id, token


def sign_in(client, token: str):
    """Select the fixture account for subsequent authenticated API operations."""
    client.cookies.clear()
    client.cookies.set("mablog_session", token)


def create(client) -> str:
    """Create a personal post through the public API contract."""
    response = client.post("/api/posts")
    assert response.status_code == 200, response.text
    return response.json()["id"]


def image_bytes() -> bytes:
    """Generate a valid small image to exercise real upload validation."""
    output = io.BytesIO()
    Image.new("RGB", (20, 20), "#963b3f").save(output, "PNG")
    return output.getvalue()


def test_local_admin_bootstrap_allows_password_only_login(client, monkeypatch):
    """Create the opt-in local account once and sign in without issuing an email challenge."""
    monkeypatch.setenv("LOCAL_ADMIN_ENABLED", "true")
    monkeypatch.setenv("LOCAL_ADMIN_USERNAME", "local_admin_test")
    monkeypatch.setenv("LOCAL_ADMIN_EMAIL", "local-admin-test@mablog.local")
    monkeypatch.setenv("LOCAL_ADMIN_PASSWORD", "local-admin-test-password")
    assert bootstrap.ensure_local_admin() is True
    assert bootstrap.ensure_local_admin() is True
    response = client.post("/api/auth/login", json={"login": "local_admin_test", "password": "local-admin-test-password"})
    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert "mablog_session" in response.cookies
    with SessionLocal() as db:
        users = list(db.scalars(select(User).where(User.username == "local_admin_test")))
        assert len(users) == 1
        assert users[0].active is True
        assert users[0].verified_until > now() + 300_000_000


def save_document(client, post_id, document, baseline=None, versions=None):
    """Save a working copy without making it visible to readers."""
    current = client.get(f"/api/posts/{post_id}/draft").json()
    response = client.put(f"/api/posts/{post_id}/draft", json={"document": document, "baseline": baseline or current["baseline"], "versions": current["versions"] if versions is None else versions})
    assert response.status_code == 200, response.text


def publishable(client, post_id):
    """Prepare an approved post with a real uploaded cover and two independent blocks."""
    upload = client.post(f"/api/uploads?post_id={post_id}", files={"file": ("cover.png", image_bytes(), "image/png")})
    assert upload.status_code == 200, upload.text
    document = Document().model_dump()
    document["details"] = {"title": "A moonlit story", "summary": "Test composition", "cover": upload.json()["url"]}
    document["blocks"] = [{"id": "alpha", "html": "<p>Original alpha</p>"}, {"id": "beta", "html": "<p>Original beta</p>", "x": 1500}]
    save_document(client, post_id, document)
    assert client.post(f"/api/posts/{post_id}/submit").status_code == 200
    return client.get(f"/api/posts/{post_id}").json()["document"]


def test_categories_filter_approved_metadata(client):
    """Keep draft categories private, filter before pagination, and support legacy General posts."""
    _, owner = account("categoryowner")
    sign_in(client, owner)
    post = create(client)
    document = publishable(client, post)
    assert client.post(f"/api/posts/{post}/publication", json={"public": True}).status_code == 200
    document["details"]["category"] = "technology"
    save_document(client, post, document)
    assert client.get("/api/posts?category=technology").json() == []
    assert client.post(f"/api/posts/{post}/submit").status_code == 200
    assert client.get("/api/posts?category=technology").json()[0]["id"] == post
    assert client.get("/api/posts?category=anime").json() == []
    assert client.get("/api/posts?category=invalid").status_code == 422
    assert client.post(f"/api/posts/{post}/publication", json={"public": False}).status_code == 200
    assert client.get("/api/posts?category=technology").json() == []
    with SessionLocal() as db:
        record = db.get(Post, post)
        legacy = copy.deepcopy(record.document)
        legacy["details"].pop("category")
        record.document, record.public = legacy, True
        db.commit()
    assert client.get("/api/posts?category=general").json()[0]["category"] == "general"


def test_public_post_pagination_is_bounded_and_stable(client):
    """Return non-overlapping public pages and reject invalid client page sizes."""
    owner_id, _ = account("pageowner")
    with SessionLocal() as db:
        for index in range(7):
            document = Document().model_dump()
            document["details"] = {"title": f"Page story {index}", "summary": "Pagination fixture", "category": "general"}
            db.add(Post(author_id=owner_id, public=True, document=document, versions={}, published=now() - index))
        db.commit()
    first = client.get("/api/posts?offset=0&limit=3").json()
    second = client.get("/api/posts?offset=3&limit=3").json()
    final = client.get("/api/posts?offset=6&limit=3").json()
    assert [len(first), len(second), len(final)] == [3, 3, 1]
    assert not ({post["id"] for post in first} & {post["id"] for post in second})
    assert client.get("/api/posts?limit=0").status_code == 422


def test_registration_codes_and_weekly_expiry(client, monkeypatch):
    """Verify activation, wrong-code handling, one-time consumption, and weekly logout."""
    messages = []
    class Inbox:
        """Capture test messages without depending on the development SMTP inbox."""
        def __init__(self, *args, **kwargs):
            """Accept the SMTP connection signature without opening a socket."""
        def __enter__(self):
            """Expose the fake SMTP connection within the application's context manager."""
            return self
        def __exit__(self, *args):
            """Close the fake SMTP context without suppressing failures."""
        def send_message(self, message):
            """Retain the delivered plaintext only in the test process."""
            messages.append(message.get_content())
    monkeypatch.setattr(email_delivery.smtplib, "SMTP", Inbox)
    response = client.post("/api/auth/register", json={"email": "new@example.com", "username": "newwriter", "password": "test-password-123"})
    assert response.status_code == 200, response.text
    challenge = response.json()["challenge_id"]
    code = re.search(r"\b\d{6}\b", messages[-1]).group()
    assert client.get("/api/auth/me").json()["user"] is None
    wrong = "111111" if code != "111111" else "222222"
    assert client.post("/api/auth/verify", json={"challenge_id": challenge, "code": wrong}).status_code == 400
    with SessionLocal() as db:
        record = db.get(Challenge, challenge)
        assert record.code_hash != code and record.attempts == 1
    response = client.post("/api/auth/verify", json={"challenge_id": challenge, "code": code})
    assert response.status_code == 200, response.text
    assert "HttpOnly" in response.headers["set-cookie"]
    assert client.post("/api/auth/verify", json={"challenge_id": challenge, "code": code}).status_code == 400
    assert client.get("/api/workspace").status_code == 200
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.username == "newwriter"))
        user.verified_until = now() - 1
        db.commit()
    assert client.get("/api/workspace").status_code == 401
    assert client.get("/api/posts").status_code == 200
    assert client.post("/api/auth/login", json={"login": "new@example.com", "password": "test-password-123"}).json()["verification_required"]


def test_post_access_and_creator_only_authority(client):
    """Enforce per-post grants, unknown-email rejection, and creator-only management."""
    author_id, author = account("author")
    editor_id, editor = account("editor")
    viewer_id, viewer = account("viewer")
    sign_in(client, author)
    post, other = create(client), create(client)
    assert client.post(f"/api/posts/{post}/grants", json={"email": "missing@example.com", "role": "editor"}).json()["detail"] == "Email not found"
    for email, role in [("editor@example.com", "editor"), ("viewer@example.com", "viewer")]:
        assert client.post(f"/api/posts/{post}/grants", json={"email": email, "role": role}).status_code == 200
    sign_in(client, editor)
    assert client.get(f"/api/posts/{post}/draft").status_code == 200
    assert client.get(f"/api/posts/{other}").status_code == 404
    assert client.delete(f"/api/posts/{post}").status_code == 403
    assert client.post(f"/api/posts/{post}/publication", json={"public": True}).status_code == 403
    assert client.get(f"/api/posts/{post}/grants").status_code == 403
    sign_in(client, viewer)
    assert client.get(f"/api/posts/{post}").status_code == 200
    assert client.get(f"/api/posts/{post}/draft").status_code == 403
    client.cookies.clear()
    assert client.get(f"/api/posts/{post}").status_code == 404


def test_local_admin_address_can_receive_post_access(client):
    """Allow an existing bootstrap-style `.local` account to receive a normal post grant."""
    _, author = account("localgrantauthor")
    with SessionLocal() as db:
        administrator = User(
            email="admin@mablog.local",
            username="localgrantadmin",
            password=auth.password_hasher.hash("test-password-123"),
            active=True,
            verified_until=now() + 604800,
            display_name="Local Administrator",
            is_admin=True,
        )
        db.add(administrator)
        db.commit()
        administrator_id = administrator.id
    sign_in(client, author)
    post = create(client)
    response = client.post(
        f"/api/posts/{post}/grants",
        json={"email": "admin@mablog.local", "role": "viewer"},
    )
    assert response.status_code == 200, response.text
    with SessionLocal() as db:
        grant = db.get(Grant, (post, administrator_id))
        assert grant is not None
        assert grant.role == "viewer"


def test_independent_review_conflicts_and_revocation(client):
    """Approve a competing block after revocation, rejecting its alternative but preserving other targets."""
    _, author = account("author")
    first_id, first = account("first")
    _, second = account("second")
    sign_in(client, author)
    post = create(client)
    original = publishable(client, post)
    for name in ["first", "second"]:
        client.post(f"/api/posts/{post}/grants", json={"email": f"{name}@example.com", "role": "editor"})
    sign_in(client, first)
    one = copy.deepcopy(original)
    one["blocks"][0]["html"] = "<p>Preferred</p>"
    one["blocks"][1]["html"] = "<p>Unrelated pending</p>"
    one["canvas"]["width"] = 700
    save_document(client, post, one)
    assert client.get(f"/api/posts/{post}").json()["document"] == original
    sign_in(client, second)
    assert client.get(f"/api/posts/{post}/draft").json()["document"] == original
    two = copy.deepcopy(original)
    two["blocks"][0]["html"] = "<p>Alternative</p>"
    save_document(client, post, two)
    client.post(f"/api/posts/{post}/submit")
    sign_in(client, first)
    client.post(f"/api/posts/{post}/submit")
    sign_in(client, author)
    assert client.get(f"/api/posts/{post}").json()["pending_reviews"] == 4
    client.delete(f"/api/posts/{post}/grants/{first_id}")
    proposals = client.get(f"/api/posts/{post}/proposals").json()
    winner = next(p for p in proposals if p["target"] == "block:alpha" and p["editor"]["id"] == first_id)
    response = client.post(f"/api/posts/{post}/proposals/{winner['id']}", json={"action": "approve", "current_version": winner["current_version"]})
    assert response.status_code == 200, response.text
    statuses = client.get(f"/api/posts/{post}/proposals").json()
    assert sorted(p["status"] for p in statuses if p["target"] == "block:alpha") == ["approved", "rejected"]
    assert all(p["status"] == "pending" for p in statuses if p["target"] != "block:alpha")
    assert client.get(f"/api/posts/{post}").json()["pending_reviews"] == 2
    updated = client.get(f"/api/posts/{post}").json()["document"]
    assert updated["canvas"] == original["canvas"]
    layout = next(p for p in statuses if p["target"] == "canvas")
    assert client.post(f"/api/posts/{post}/proposals/{layout['id']}", json={"action": "approve", "current_version": layout["current_version"]}).status_code == 200
    assert client.get(f"/api/posts/{post}").json()["pending_reviews"] == 1
    updated = client.get(f"/api/posts/{post}").json()["document"]
    assert updated["canvas"]["width"] == 700
    assert next(b for b in updated["blocks"] if b["id"] == "beta")["x"] == 1500
    sign_in(client, first)
    assert client.get(f"/api/posts/{post}/draft").status_code == 404


def test_private_uploads_and_immediate_unpublishing(client):
    """Do not leak draft media or cached public content when current visibility changes."""
    _, author = account("author")
    _, editor = account("editor")
    sign_in(client, author)
    post = create(client)
    doc = publishable(client, post)
    cover = doc["details"]["cover"]
    secret = client.post(f"/api/uploads?post_id={post}", files={"file": ("draft.png", image_bytes(), "image/png")}).json()["url"]
    client.post(f"/api/posts/{post}/publication", json={"public": True})
    client.post(f"/api/posts/{post}/grants", json={"email": "editor@example.com", "role": "editor"})
    client.cookies.clear()
    assert client.get(cover).status_code == 200
    assert client.get(secret).status_code == 404
    assert any(p["id"] == post for p in client.get("/api/carousel").json())
    sign_in(client, author)
    client.post(f"/api/posts/{post}/publication", json={"public": False})
    client.cookies.clear()
    assert client.get(cover).status_code == 404
    assert client.get(f"/api/posts/{post}").status_code == 404
    assert not any(p["id"] == post for p in client.get("/api/carousel").json())
    sign_in(client, editor)
    assert client.get(cover).status_code == 200


def test_sanitization_and_stale_creator_save(client):
    """Remove executable markup and prevent old working copies from overwriting a changed target."""
    _, author = account("author")
    sign_in(client, author)
    post = create(client)
    original = publishable(client, post)
    snapshot = client.get(f"/api/posts/{post}/draft").json()
    doc = copy.deepcopy(original)
    doc["blocks"][0]["html"] = '<p onclick="alert(1)">Safe</p><script>alert(1)</script><img src="https://evil.invalid/pixel" onerror="alert(1)"><iframe src="https://evil.invalid"></iframe>'
    save_document(client, post, doc)
    client.post(f"/api/posts/{post}/submit")
    result = client.get(f"/api/posts/{post}").json()["document"]
    text = next(b["html"] for b in result["blocks"] if b["id"] == "alpha")
    assert "onclick" not in text and "<script" not in text and "evil.invalid" not in text and "onerror" not in text
    doc["blocks"][0]["html"] = "<p>Stale overwrite</p>"
    save_document(client, post, doc, baseline=snapshot["baseline"], versions=snapshot["versions"])
    assert client.post(f"/api/posts/{post}/submit").status_code == 409


def test_rolling_likes_and_cache_outage(client, monkeypatch):
    """Exclude old likes, allow one active author like, and fall back when Redis fails."""
    author_id, author = account("author")
    other_id, other = account("other")
    sign_in(client, author)
    first, second = create(client), create(client)
    publishable(client, first)
    publishable(client, second)
    client.post(f"/api/posts/{first}/publication", json={"public": True})
    client.post(f"/api/posts/{second}/publication", json={"public": True})
    with SessionLocal() as db:
        db.add(Like(post_id=second, user_id=other_id, created=now() - 15 * 86400))
        db.commit()
    assert client.post(f"/api/posts/{first}/like").json()["likes"] == 1
    assert client.get("/api/carousel").json()[0]["id"] == first
    assert client.post(f"/api/posts/{first}/like").json()["likes"] == 0
    class OfflineCache:
        """Simulate Redis downtime without interfering with the database."""
        def get(self, *args):
            """Fail reads exactly as an unavailable Redis connection would."""
            raise redis.ConnectionError()
        def set(self, *args, **kwargs):
            """Fail cache population while permitting uncached content delivery."""
            raise redis.ConnectionError()
    monkeypatch.setattr(post_routes, "cache", OfflineCache())
    assert client.get("/api/carousel").status_code == 200


def test_csrf_and_upload_validation(client):
    """Reject cross-origin writes and image declarations that hide invalid content."""
    _, author = account("author")
    sign_in(client, author)
    assert client.post("/api/posts", headers={"Origin": "https://another-site.example"}).status_code == 403
    post = create(client)
    response = client.post(f"/api/uploads?post_id={post}", files={"file": ("fake.png", b"<script>bad</script>", "image/png")})
    assert response.status_code == 422


def test_code_attempt_limit_and_recovery_revokes_sessions(client):
    """Exhaust a code's attempts and confirm password recovery invalidates every old session."""
    user_id, token = account("recoverable")
    with SessionLocal() as db:
        db.add(Challenge(id="attempt-test", user_id=user_id, purpose="login", code_hash=auth.code_digest("attempt-test", "123456"), expires=now() + 600))
        db.add(Challenge(id="recovery-test", user_id=user_id, purpose="recovery", code_hash=auth.code_digest("recovery-test", "654321"), expires=now() + 600))
        db.commit()
    for _ in range(5):
        assert client.post("/api/auth/verify", json={"challenge_id": "attempt-test", "code": "000000"}).status_code == 400
    assert client.post("/api/auth/verify", json={"challenge_id": "attempt-test", "code": "123456"}).status_code == 400
    sign_in(client, token)
    assert client.post("/api/auth/verify", json={"challenge_id": "recovery-test", "code": "654321", "new_password": "replacement-password"}).status_code == 200
    assert client.get("/api/workspace").status_code == 200
    sign_in(client, token)
    assert client.get("/api/workspace").status_code == 401
    assert client.post("/api/auth/login", json={"login": "recoverable", "password": "test-password-123"}).status_code == 401
    assert client.post("/api/auth/login", json={"login": "recoverable", "password": "replacement-password"}).status_code == 200


def test_stale_review_and_invalid_draft_are_rejected(client):
    """Reject malformed snapshots and a creator review that races with a newer approved change."""
    _, author = account("author")
    editor_id, editor = account("editor")
    sign_in(client, author)
    post = create(client)
    original = publishable(client, post)
    client.post(f"/api/posts/{post}/grants", json={"email": "editor@example.com", "role": "editor"})
    assert client.put(f"/api/posts/{post}/draft", json={"document": original, "baseline": original, "versions": []}).status_code == 422
    sign_in(client, editor)
    proposal_doc = copy.deepcopy(original)
    proposal_doc["canvas"]["width"] = 600
    save_document(client, post, proposal_doc)
    assert client.post(f"/api/posts/{post}/submit").status_code == 200
    sign_in(client, author)
    proposal = client.get(f"/api/posts/{post}/proposals").json()[0]
    changed = copy.deepcopy(original)
    changed["canvas"]["width"] = 1000
    save_document(client, post, changed)
    assert client.post(f"/api/posts/{post}/submit").status_code == 200
    assert client.post(f"/api/posts/{post}/proposals/{proposal['id']}", json={"action": "approve", "current_version": proposal["current_version"]}).status_code == 409
    assert client.get(f"/api/posts/{post}").json()["document"]["canvas"]["width"] == 1000


def test_editor_media_stays_private_until_submission(client):
    """Hide an editor's unsubmitted upload even from the creator, then permit explicit review."""
    _, author = account("author")
    editor_id, editor = account("editor")
    sign_in(client, author)
    post = create(client)
    original = publishable(client, post)
    client.post(f"/api/posts/{post}/grants", json={"email": "editor@example.com", "role": "editor"})
    sign_in(client, editor)
    upload = client.post(f"/api/uploads?post_id={post}", files={"file": ("private.png", image_bytes(), "image/png")}).json()["url"]
    changed = copy.deepcopy(original)
    changed["blocks"][0]["html"] = f'<p>Private work</p><img src="{upload}">'
    save_document(client, post, changed)
    sign_in(client, author)
    assert client.get(upload).status_code == 404
    sign_in(client, editor)
    assert client.post(f"/api/posts/{post}/submit").status_code == 200
    sign_in(client, author)
    assert client.get(upload).status_code == 200
    client.delete(f"/api/posts/{post}/grants/{editor_id}")
    assert client.get(upload).status_code == 200
    sign_in(client, editor)
    assert client.get(upload).status_code == 404




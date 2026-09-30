"""Create the explicitly enabled local test administrator after migrations."""

import re

from sqlalchemy import select

from .config import NEWS_BRAVE_QUERY_BUDGET, NEWS_HOUR, NEWS_MINUTE, NEWS_MONTH_BUDGET_USD, NEWS_RUN_BUDGET_USD, NEWS_TIMEZONE, NEWS_WEEKDAY, load_settings
from .database import SessionLocal
from .models import NewsSetting, NewsSource, User
from .services.authentication import password_hasher
from .utils import new_id, now


def ensure_local_admin() -> bool:
    """Create or reactivate one local test account; return whether bootstrapping was enabled.

    The function deliberately grants no cross-account privileges. It only gives the configured
    account a long verification window so password login can create a normal session immediately.
    Existing credentials are never overwritten, preventing a container restart from undoing a
    password change. Conflicting username/email records stop startup instead of modifying a user.
    """
    # Read the environment now rather than at import so one-shot runs and tests see current values.
    settings = load_settings()
    if not settings.local_admin_enabled:
        return False
    username = settings.local_admin_username
    email = settings.local_admin_email
    password = settings.local_admin_password
    verification_seconds = settings.local_admin_verification_seconds
    if not re.fullmatch(r"[a-z0-9_]{3,30}", username):
        raise RuntimeError("LOCAL_ADMIN_USERNAME must contain 3-30 letters, numbers, or underscores")
    if "@" not in email or len(email) > 254:
        raise RuntimeError("LOCAL_ADMIN_EMAIL must be a valid local email address")
    if not 10 <= len(password) <= 200:
        raise RuntimeError("LOCAL_ADMIN_PASSWORD must contain 10-200 characters")
    if verification_seconds < 86400:
        raise RuntimeError("LOCAL_ADMIN_VERIFICATION_SECONDS must be at least one day")
    with SessionLocal() as db:
        by_username = db.scalar(select(User).where(User.username == username))
        by_email = db.scalar(select(User).where(User.email == email))
        if by_username and by_email and by_username.id != by_email.id:
            raise RuntimeError("Configured local admin username and email belong to different accounts")
        user = by_username or by_email
        if user and (user.username != username or user.email != email):
            raise RuntimeError("Configured local admin username or email conflicts with an existing account")
        if not user:
            user = User(
                username=username,
                email=email,
                display_name="Local Administrator",
                bio="Local account for testing MAblog without email verification.",
                password=password_hasher.hash(password),
            )
            db.add(user)
        user.active = True
        user.is_admin = True
        user.is_system = False
        # New ORM instances receive column defaults at INSERT time, so normalize a pre-flush None.
        user.verified_until = max(user.verified_until or 0, now() + verification_seconds)
        db.commit()
    return True


CORE_NEWS_SOURCES = (
    ("openai", "OpenAI", "Product release notes", "https://openai.com/products/release-notes/", "release_notes"),
    ("google", "Google DeepMind / Gemini", "Gemini API release notes", "https://ai.google.dev/gemini-api/docs/changelog", "changelog"),
    ("anthropic", "Anthropic / Claude", "Claude Platform release notes", "https://platform.claude.com/docs/en/release-notes/overview", "release_notes"),
    ("deepseek", "DeepSeek", "DeepSeek API updates", "https://api-docs.deepseek.com/updates", "release_notes"),
    ("moonshot", "Moonshot AI / Kimi", "Kimi model catalog", "https://platform.kimi.ai/docs/models", "model_catalog"),
)


def ensure_ai_news_foundation() -> None:
    """Create the immutable publisher, singleton settings, and idempotent core source seeds."""
    with SessionLocal() as db:
        publisher = db.scalar(select(User).where(User.username == "mablog_ia"))
        if not publisher:
            publisher = User(
                username="mablog_ia",
                email="mablog-ia@mablog.local",
                display_name="MABlog_IA",
                bio="Verified weekly AI model release roundups from MAblog.",
                password="!system-account-no-login!",
                active=True,
                verified_until=0,
                is_system=True,
                is_admin=False,
                ai_news_email=False,
            )
            db.add(publisher)
        else:
            publisher.is_system = True
            publisher.is_admin = False
            publisher.active = True
        if not db.get(NewsSetting, 1):
            db.add(
                NewsSetting(
                    id=1,
                    timezone=NEWS_TIMEZONE,
                    weekday=NEWS_WEEKDAY,
                    hour=NEWS_HOUR,
                    minute=NEWS_MINUTE,
                    openai_run_budget=NEWS_RUN_BUDGET_USD,
                    openai_month_budget=NEWS_MONTH_BUDGET_USD,
                    brave_query_budget=NEWS_BRAVE_QUERY_BUDGET,
                )
            )
        for provider_key, provider_name, name, url, kind in CORE_NEWS_SOURCES:
            if not db.scalar(select(NewsSource).where(NewsSource.url == url)):
                db.add(
                    NewsSource(
                        id=new_id(),
                        provider_key=provider_key,
                        provider_name=provider_name,
                        name=name,
                        url=url,
                        kind=kind,
                        active=True,
                        validation_status="seeded",
                        validation={"official_domain": True, "requires_live_test": True},
                    )
                )
        db.commit()


if __name__ == "__main__":
    if ensure_local_admin():
        print("Local test administrator is ready.")
    ensure_ai_news_foundation()
    print("AI-news publisher, settings, and core registry are ready.")

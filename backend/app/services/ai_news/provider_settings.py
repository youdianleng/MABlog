"""Resolve newsroom-only provider overrides without exposing stored credentials."""

import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from ...config import APP_SECRET, BRAVE_API_KEY, NEWS_SMALL_MODEL, NEWS_STRONG_MODEL, OPENAI_API_KEY
from ...models import NewsSetting

PROVIDERS = {"openai": "openai_key_ciphertext", "brave": "brave_key_ciphertext"}


def _cipher() -> Fernet:
    """Derive a purpose-separated encryption key from the deployment APP_SECRET."""
    digest = hashlib.sha256(b"mablog:ai-news:provider-key:v1:" + APP_SECRET.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_key(value: str) -> str:
    """Encrypt a newly supplied provider key before it reaches durable storage."""
    return _cipher().encrypt(value.encode()).decode()


def effective_key(db, provider: str) -> str:
    """Return a decrypted newsroom override or its process environment fallback."""
    if provider not in PROVIDERS:
        raise ValueError("unknown_news_provider")
    settings = db.get(NewsSetting, 1)
    token = getattr(settings, PROVIDERS[provider]) if settings else None
    if token:
        try:
            return _cipher().decrypt(token.encode()).decode()
        except InvalidToken as error:
            # Never log the token or silently substitute another credential.
            raise RuntimeError("news_credential_decryption_failed") from error
    return OPENAI_API_KEY if provider == "openai" else BRAVE_API_KEY


def model_for(db, tier: str) -> str:
    """Resolve the curator's fast or strong model, falling back to deployment policy."""
    if tier not in {"small", "strong"}:
        raise ValueError("unknown_news_model_tier")
    settings = db.get(NewsSetting, 1)
    override = getattr(settings, f"{tier}_model_override") if settings else None
    return override or (NEWS_SMALL_MODEL if tier == "small" else NEWS_STRONG_MODEL)


def provider_status(db) -> dict:
    """Describe configuration sources and effective model IDs without reading key plaintext."""
    settings = db.get(NewsSetting, 1)
    status = {}
    for provider, field in PROVIDERS.items():
        stored = bool(getattr(settings, field)) if settings else False
        environment = bool(OPENAI_API_KEY if provider == "openai" else BRAVE_API_KEY)
        status[provider] = {"configured": stored or environment, "source": "saved" if stored else "environment" if environment else "missing"}
    return {
        "providers": status,
        "models": {
            "small": {"value": model_for(db, "small"), "source": "saved" if settings and settings.small_model_override else "environment"},
            "strong": {"value": model_for(db, "strong"), "source": "saved" if settings and settings.strong_model_override else "environment"},
        },
    }

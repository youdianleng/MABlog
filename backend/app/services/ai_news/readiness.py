"""Redacted provider and schedule readiness for administrator and worker use."""

import os
import socket

from ...config import BRAVE_API_KEY, NEWS_MASTER_ENABLED, OPENAI_API_KEY


def email_configured() -> bool:
    """Treat local Mailpit or an explicitly configured SMTP host as available configuration."""
    return bool(os.getenv("SMTP_HOST", "").strip())


def smtp_reachable() -> bool:
    """Perform a short redacted TCP readiness check without sending a message."""
    host = os.getenv("SMTP_HOST", "").strip()
    if not host:
        return False
    try:
        with socket.create_connection((host, int(os.getenv("SMTP_PORT", "1025"))), timeout=1):
            return True
    except OSError:
        return False


def readiness(include_connectivity: bool = False) -> dict:
    """Return only booleans and safe status codes for the AI-news workspace."""
    openai_ready = bool(OPENAI_API_KEY)
    brave_ready = bool(BRAVE_API_KEY)
    email_ready = email_configured() and (smtp_reachable() if include_connectivity else True)
    warnings = []
    if not brave_ready:
        warnings.append("brave_not_configured")
    if not email_ready:
        warnings.append("email_not_configured")
    return {
        "ready": NEWS_MASTER_ENABLED and openai_ready,
        "master_enabled": NEWS_MASTER_ENABLED,
        "openai": "ready" if openai_ready else "missing",
        "brave": "ready" if brave_ready else "degraded",
        "email": "ready" if email_ready else "degraded",
        "warnings": warnings,
    }


def require_run_readiness() -> dict:
    """Raise a safe configuration code when a mandatory run dependency is unavailable."""
    status = readiness()
    if not status["master_enabled"]:
        raise RuntimeError("news_master_disabled")
    if status["openai"] != "ready":
        raise RuntimeError("openai_not_configured")
    return status

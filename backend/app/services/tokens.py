"""Short-lived signed search state that avoids server-side query history."""
import base64
import hashlib
import hmac
import json

from fastapi import HTTPException

from ..config import APP_SECRET, SEARCH_TOKEN_SECONDS
from ..utils import now


def sign_search_state(kind: str, subject: str, payload: dict) -> str:
    """Sign bounded continuation or evidence metadata for one authenticated subject."""
    body = {"kind": kind, "subject": subject, "expires": now() + SEARCH_TOKEN_SECONDS, **payload}
    encoded = base64.urlsafe_b64encode(json.dumps(body, separators=(",", ":"), ensure_ascii=False).encode()).decode().rstrip("=")
    signature = hmac.new(APP_SECRET.encode(), encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"


def verify_search_state(token: str, kind: str, subject: str) -> dict:
    """Verify signature, purpose, caller binding, and expiry before using client-carried state."""
    try:
        encoded, supplied_signature = token.rsplit(".", 1)
        expected = hmac.new(APP_SECRET.encode(), encoded.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(supplied_signature, expected):
            raise ValueError("signature")
        padding = "=" * (-len(encoded) % 4)
        payload = json.loads(base64.urlsafe_b64decode(encoded + padding))
        if payload.get("kind") != kind or payload.get("subject") != subject or float(payload.get("expires", 0)) <= now():
            raise ValueError("claims")
        return payload
    except (ValueError, TypeError, KeyError, json.JSONDecodeError) as error:
        raise HTTPException(400, "Search state expired. Run the search again.") from error


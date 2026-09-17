"""Small identity, time, and token helpers shared across backend features."""
import hashlib
import uuid
from datetime import datetime, timezone

def now() -> float:
    """Return UTC epoch seconds so expiry comparisons are timezone-independent."""
    return datetime.now(timezone.utc).timestamp()


def new_id() -> str:
    """Create an opaque identifier for independently addressable domain records."""
    return str(uuid.uuid4())


def digest(value: str) -> str:
    """Hash high-entropy session tokens before persistence."""
    return hashlib.sha256(value.encode()).hexdigest()

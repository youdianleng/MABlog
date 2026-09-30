"""Redis-backed caches that never hold private post content."""

import json
import logging

import redis

from ..config import REDIS_URL

logger = logging.getLogger(__name__)

# Redis is an optional accelerator; a short 0.3-second timeout keeps an outage from stalling requests.
REDIS_TIMEOUT_SECONDS = 0.3
CAROUSEL_KEY = "carousel"

cache = redis.Redis.from_url(REDIS_URL, socket_connect_timeout=REDIS_TIMEOUT_SECONDS, socket_timeout=REDIS_TIMEOUT_SECONDS, decode_responses=True)


def read_cached_ids(key: str) -> list[str] | None:
    """Return a cached list of record IDs, or ``None`` when absent, malformed, or Redis is unavailable."""
    try:
        saved = cache.get(key)
        value = json.loads(saved) if saved else None
    except (redis.RedisError, ValueError) as error:
        logger.warning("Public cache read failed for %s: %s", key, error)
        return None
    return value if isinstance(value, list) else None


def write_cached_ids(key: str, identifiers: list[str], seconds: int) -> None:
    """Store record IDs for ``seconds``; failures are logged and otherwise ignored."""
    try:
        cache.set(key, json.dumps(identifiers), ex=seconds)
    except redis.RedisError as error:
        logger.warning("Public cache write failed for %s: %s", key, error)


def invalidate_public_cache() -> None:
    """Discard carousel candidates after writes without failing durable database work."""
    try:
        cache.delete(CAROUSEL_KEY)
    except redis.RedisError as error:
        logger.warning("Public cache invalidation failed: %s", error)

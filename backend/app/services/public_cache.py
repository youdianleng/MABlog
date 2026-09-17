"""Redis-backed caches that never hold private post content."""
import os
import redis

cache = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), socket_connect_timeout=0.3, socket_timeout=0.3, decode_responses=True)

def invalidate_public_cache() -> None:
    """Discard carousel candidates after writes without failing durable database work."""
    try:
        cache.delete("carousel")
    except redis.RedisError:
        pass


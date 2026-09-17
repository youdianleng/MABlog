"""Atomic fixed-window capacity and single-use controls for search operations."""
from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

from ..database import SessionLocal
from ..models import RateLimit, SearchReplay
from ..utils import digest, now


def consume_capacity(name: str, identity: str, limit: int, period_seconds: int, amount: int = 1) -> bool:
    """Consume a counter without logging its raw identity and return whether it stayed allowed."""
    bucket = f"search:{name}:{digest(identity)}:{int(now() // period_seconds)}"
    with SessionLocal() as db:
        statement = insert(RateLimit).values(key=bucket, count=amount)
        count = db.scalar(
            statement.on_conflict_do_update(
                index_elements=[RateLimit.key],
                set_={"count": RateLimit.count + amount},
            ).returning(RateLimit.count)
        )
        db.commit()
    return bool(count is not None and count <= limit)


def seconds_until_window_reset(period_seconds: int) -> float:
    """Return the remaining seconds in the active fixed window for deferred work."""
    return period_seconds - (now() % period_seconds) + 1


def consume_once(name: str, identity: str, expires: float) -> bool:
    """Atomically consume one opaque operation and opportunistically remove expired digests."""
    key = f"search-once:{name}:{digest(identity)}"
    with SessionLocal() as db:
        db.execute(delete(SearchReplay).where(SearchReplay.expires <= now()))
        inserted = db.scalar(
            insert(SearchReplay)
            .values(key=key, expires=expires)
            .on_conflict_do_nothing(index_elements=[SearchReplay.key])
            .returning(SearchReplay.key)
        )
        db.commit()
    return inserted is not None


"""Featured carousel ranking with a short, rebuildable Redis cache of public post IDs."""

from sqlalchemy import func, select

from ..config import CACHE_SECONDS, LIKE_WINDOW_SECONDS
from ..models import Like, Post
from ..utils import now
from .public_cache import CAROUSEL_KEY, read_cached_ids, write_cached_ids

# The carousel shows five featured posts; 25 ranked candidates leave room to skip extra AI-news cards.
CAROUSEL_SIZE = 5
CAROUSEL_CANDIDATES = 25
# One automated roundup may appear, leaving most featured space for community authors.
MAX_AI_NEWS_CARDS = 1


def rank_carousel_ids(db) -> list[str]:
    """Rank public posts by likes received in the rolling window, then by recency.

    Ties on likes fall back to newest publication and then ID so the order is deterministic.
    At most ``MAX_AI_NEWS_CARDS`` automated editions are kept.
    """
    ranking = (
        select(Post.id, Post.kind)
        .outerjoin(Like, (Like.post_id == Post.id) & (Like.created >= now() - LIKE_WINDOW_SECONDS))
        .where(Post.public.is_(True))
        .group_by(Post.id)
        .order_by(func.count(Like.user_id).desc(), Post.published.desc(), Post.id)
        .limit(CAROUSEL_CANDIDATES)
    )
    identifiers: list[str] = []
    ai_news_cards = 0
    for identifier, kind in db.execute(ranking):
        if kind == "ai_news":
            if ai_news_cards >= MAX_AI_NEWS_CARDS:
                continue
            ai_news_cards += 1
        identifiers.append(identifier)
        if len(identifiers) == CAROUSEL_SIZE:
            break
    return identifiers


def carousel_posts(db) -> list[Post]:
    """Return the currently public featured posts, using cached ranking IDs when available.

    The cache holds only IDs for ``CACHE_SECONDS``. Visibility is rechecked against PostgreSQL on
    every read, so a post made private is dropped immediately even while its ID is still cached.
    """
    identifiers = read_cached_ids(CAROUSEL_KEY)
    if identifiers is None:
        identifiers = rank_carousel_ids(db)
        write_cached_ids(CAROUSEL_KEY, identifiers, CACHE_SECONDS)
    if not identifiers:
        return []
    found = {post.id: post for post in db.scalars(select(Post).where(Post.id.in_(identifiers), Post.public.is_(True)))}
    # Preserve ranking order; the IN query returns rows in arbitrary order.
    return [found[identifier] for identifier in identifiers if identifier in found]

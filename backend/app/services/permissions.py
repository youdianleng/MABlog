"""Authoritative post-role resolution and access enforcement."""
from fastapi import HTTPException
from sqlalchemy import select
from ..models import Grant, Post, User

def role_for(db, post: Post, user: User | None) -> str:
    """Resolve current access from authoritative records, never a shared cache."""
    if user and post.author_id == user.id:
        return "author"
    grant = db.get(Grant, (post.id, user.id)) if user else None
    if grant:
        return grant.role
    return "reader" if post.public else "none"


def require_post(db, post_id: str, user: User | None, roles=None, lock=False) -> Post:
    """Hide inaccessible posts and optionally lock before a read-modify-write operation."""
    query = select(Post).where(Post.id == post_id)
    if lock:
        query = query.with_for_update()
    post = db.scalar(query)
    if not post or role_for(db, post, user) == "none":
        raise HTTPException(404, "Post not found")
    if roles and role_for(db, post, user) not in roles:
        raise HTTPException(403, "This action requires the creator or an allowed editor")
    return post


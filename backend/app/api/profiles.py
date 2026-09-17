"""Public profile reading and signed-in profile editing endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select, update
from ..dependencies import current_user, database, signed_in
from ..config import CACHE_SECONDS, LIKE_WINDOW_SECONDS, UPLOAD_DIR
from ..models import Draft, Grant, Like, Media, Post, Proposal, User
from ..schemas import CloudProcessingPayload, Document, DraftPayload, PostCategory, ProfilePayload
from ..services.documents import clean_document, media_ids, targets
from ..services.indexing import synchronize_author_posts
from ..services.permissions import require_post, role_for
from ..services.posts import apply_target, ensure_publishable, post_summary, submitted_media, user_profile, validate_media
from ..services.public_cache import cache, invalidate_public_cache
from ..utils import now

router = APIRouter()

@router.get("/profiles/{username}")
def profile(username: str, db=Depends(database)):
    """Expose a user's public profile and approved public posts only."""
    user = db.scalar(select(User).where(User.username == username.lower(), User.active.is_(True)))
    if not user:
        raise HTTPException(404, "Profile not found")
    return {**user_profile(user), "posts": [post_summary(db, p) for p in db.scalars(select(Post).where(Post.author_id == user.id, Post.public.is_(True)))]}


@router.patch("/profile")
def update_profile(data: ProfilePayload, user=Depends(signed_in), db=Depends(database)):
    """Update public biography fields and a profile-owned uploaded avatar."""
    previous_display_name = user.display_name
    user.display_name = data.display_name
    user.bio = data.bio
    avatar = data.avatar
    if avatar:
        media = db.get(Media, avatar.removeprefix("/api/media/"))
        if not media or media.owner_id != user.id or media.post_id is not None or not media.mime.startswith("image/"):
            raise HTTPException(422, "Choose your uploaded avatar image")
    user.avatar = avatar
    if user.display_name != previous_display_name:
        # Author names are approved search metadata, so refresh their owned keyword passages.
        synchronize_author_posts(db, user)
    db.commit()
    return user_profile(user)


@router.patch("/profile/cloud-processing")
def update_cloud_processing(data: CloudProcessingPayload, user=Depends(signed_in), db=Depends(database)):
    """Apply explicit personal-content cloud consent and refresh every owned personal index."""
    user.personal_cloud_processing = data.enabled
    synchronize_author_posts(db, user)
    db.commit()
    return {"enabled": user.personal_cloud_processing}




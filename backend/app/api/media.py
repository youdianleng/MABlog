"""Validated upload and permission-checked media delivery endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse
from PIL import Image
from ..dependencies import current_user, database, signed_in
from ..config import IMAGE_LIMIT_MB, VIDEO_LIMIT_MB, UPLOAD_DIR
from ..models import Media, User
from ..services.documents import media_ids
from ..services.permissions import require_post, role_for
from ..services.posts import submitted_media
from ..utils import new_id

router = APIRouter()

@router.post("/uploads")
def upload(file: UploadFile, post_id: str | None = None, user=Depends(signed_in), db=Depends(database)):
    """Stream bounded validated media to the persistent volume under an opaque filename."""
    if post_id:
        require_post(db, post_id, user, ["author", "editor"])
    image_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    video_types = {"video/mp4", "video/webm"}
    if file.content_type not in image_types | (video_types if post_id else set()):
        raise HTTPException(422, "Unsupported media format")
    # The accepted local limits are 10 MiB per image and 100 MiB per video.
    limit = (IMAGE_LIMIT_MB if file.content_type in image_types else VIDEO_LIMIT_MB) * 1024 * 1024
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    identifier = new_id()
    path = UPLOAD_DIR / identifier
    try:
        size = 0
        with path.open("wb") as destination:
            while chunk := file.file.read(1024 * 1024):
                size += len(chunk)
                if size > limit:
                    raise HTTPException(413, "File exceeds the upload size limit")
                destination.write(chunk)
        if file.content_type in image_types:
            with Image.open(path) as image:
                if Image.MIME.get(image.format) != file.content_type:
                    raise HTTPException(422, "Image contents do not match its format")
                image.verify()
        else:
            with path.open("rb") as source:
                header = source.read(16)
            if (file.content_type == "video/mp4" and header[4:8] != b"ftyp") or (file.content_type == "video/webm" and header[:4] != b"\x1aE\xdf\xa3"):
                raise HTTPException(422, "Invalid video container")
        db.add(Media(id=identifier, post_id=post_id, owner_id=user.id, mime=file.content_type, filename=identifier))
        db.commit()
    except Exception as error:
        path.unlink(missing_ok=True)
        if isinstance(error, HTTPException):
            raise
        raise HTTPException(422, "File could not be validated") from error
    return {"url": f"/api/media/{identifier}", "mime": file.content_type}


@router.get("/media/{identifier}")
def read_media(identifier: str, user=Depends(current_user), db=Depends(database)):
    """Recheck access for each media request, distinguishing approved from draft-only uploads."""
    media = db.get(Media, identifier)
    if not media:
        raise HTTPException(404, "Media not found")
    if media.post_id:
        post = require_post(db, media.post_id, user)
        approved = identifier in media_ids(post.document)
        # Creator authority does not reveal an editor's unsubmitted private working media.
        owns_upload = user and user.id == media.owner_id and role_for(db, post, user) in {"author", "editor"}
        can_review = user and user.id == post.author_id and identifier in submitted_media(db, post.id)
        private_allowed = owns_upload or can_review
        if not approved and not private_allowed:
            raise HTTPException(404, "Media not found")
    else:
        owner = db.get(User, media.owner_id)
        if owner.avatar != f"/api/media/{identifier}" and (not user or user.id != owner.id):
            raise HTTPException(404, "Media not found")
    return FileResponse(UPLOAD_DIR / media.filename, media_type=media.mime)



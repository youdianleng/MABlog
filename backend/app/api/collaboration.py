"""Per-post grants, private drafts, submissions, and creator review endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select, update
from ..dependencies import current_user, database, signed_in
from ..config import CACHE_SECONDS, LIKE_WINDOW_SECONDS, UPLOAD_DIR
from ..models import Draft, Grant, Like, Media, Post, Proposal, User
from ..schemas import Document, DraftPayload, GrantPayload, PostCategory, ProposalReviewPayload
from ..services.documents import clean_document, media_ids, targets
from ..services.indexing import synchronize_post_search
from ..services.permissions import require_post, role_for
from ..services.posts import apply_target, ensure_publishable, post_summary, submitted_media, user_profile, validate_media
from ..services.public_cache import cache, invalidate_public_cache
from ..utils import now

router = APIRouter()

@router.get("/posts/{post_id}/grants")
def grants(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Show invitation emails only to the creator managing that post."""
    require_post(db, post_id, user, ["author"])
    rows = db.execute(select(Grant, User).join(User, User.id == Grant.user_id).where(Grant.post_id == post_id))
    return [{"user_id": u.id, "email": u.email, "username": u.username, "role": grant.role} for grant, u in rows]


@router.post("/posts/{post_id}/grants")
def grant_access(post_id: str, data: GrantPayload, user=Depends(signed_in), db=Depends(database)):
    """Grant registered accounts view/edit access; never retain unknown-email invitations."""
    require_post(db, post_id, user, ["author"], lock=True)
    # Normalize at both sides so copied addresses with surrounding spaces or legacy casing still
    # resolve to the one registered account. The unique stored email remains the grant identity.
    email = str(data.email).strip().casefold()
    recipient = db.scalar(select(User).where(func.lower(func.trim(User.email)) == email))
    if not recipient:
        raise HTTPException(404, "Email not found")
    if recipient.id == user.id or data.role not in {"viewer", "editor"}:
        raise HTTPException(422, "Choose another account and a valid access role")
    grant = db.get(Grant, (post_id, recipient.id))
    if grant:
        grant.role = data.role
    else:
        db.add(Grant(post_id=post_id, user_id=recipient.id, role=data.role))
    db.commit()
    return {"ok": True}


@router.delete("/posts/{post_id}/grants/{recipient_id}")
def revoke_access(post_id: str, recipient_id: str, user=Depends(signed_in), db=Depends(database)):
    """Revoke access while keeping drafts and submitted proposals stored for review."""
    require_post(db, post_id, user, ["author"], lock=True)
    db.execute(delete(Grant).where(Grant.post_id == post_id, Grant.user_id == recipient_id))
    db.commit()
    return {"ok": True}


@router.get("/posts/{post_id}/draft")
def read_draft(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Read only the caller's draft or initialize from the approved document."""
    post = require_post(db, post_id, user, ["author", "editor"])
    draft = db.get(Draft, (post_id, user.id))
    return {"document": draft.document if draft else post.document, "baseline": draft.baseline if draft else post.document, "versions": draft.versions if draft else post.versions, "role": role_for(db, post, user)}


@router.put("/posts/{post_id}/draft")
def save_draft(post_id: str, data: DraftPayload, user=Depends(signed_in), db=Depends(database)):
    """Save private work without publishing it or implicitly submitting a proposal."""
    post = require_post(db, post_id, user, ["author", "editor"], lock=True)
    document = clean_document(data.document.model_dump())
    baseline = clean_document(data.baseline.model_dump())
    validate_media(db, post, user, document)
    draft = db.get(Draft, (post_id, user.id))
    if not draft:
        draft = Draft(post_id=post_id, user_id=user.id)
        db.add(draft)
    draft.document, draft.baseline, draft.versions = document, baseline, data.versions
    db.commit()
    return {"ok": True}


@router.post("/posts/{post_id}/submit")
def submit(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Submit changed targets; creators apply their own work with optimistic conflict checks."""
    post = require_post(db, post_id, user, ["author", "editor"], lock=True)
    draft = db.get(Draft, (post_id, user.id))
    if not draft:
        raise HTTPException(422, "Save a draft first")
    before, after = targets(draft.baseline), targets(draft.document)
    changed = [target for target in before.keys() | after.keys() if before.get(target) != after.get(target)]
    validate_media(db, post, user, draft.document)
    is_author = user.id == post.author_id
    for target in changed:
        version = draft.versions.get(target, 0)
        if is_author:
            if post.versions.get(target, 0) != version:
                raise HTTPException(409, "This target changed. Review the current version before saving.")
            apply_target(post, target, after.get(target))
        else:
            db.add(Proposal(post_id=post.id, editor_id=user.id, target=target, base_version=version, value=after.get(target)))
    if is_author and post.public:
        ensure_publishable(post.document)
    if is_author and changed:
        # Only applied approved content enters search; editor proposals remain excluded.
        synchronize_post_search(db, post)
    db.delete(draft)
    db.commit()
    invalidate_public_cache()
    return {"ok": True, "targets": len(changed)}


@router.delete("/posts/{post_id}/draft")
def discard_draft(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Let the current editor discard their own saved work after explicit UI confirmation."""
    require_post(db, post_id, user, ["author", "editor"])
    db.execute(delete(Draft).where(Draft.post_id == post_id, Draft.user_id == user.id))
    db.commit()
    return {"ok": True}


@router.get("/posts/{post_id}/proposals")
def proposals(post_id: str, user=Depends(signed_in), db=Depends(database)):
    """Show all proposals to the creator and only their own to a currently allowed editor."""
    post = require_post(db, post_id, user, ["author", "editor"])
    query = select(Proposal).where(Proposal.post_id == post_id)
    if user.id != post.author_id:
        query = query.where(Proposal.editor_id == user.id)
    return [{"id": p.id, "target": p.target, "value": p.value, "base_version": p.base_version, "current_version": post.versions.get(p.target, 0), "status": p.status, "editor": user_profile(db.get(User, p.editor_id))} for p in db.scalars(query.order_by(Proposal.created.desc()))]


@router.post("/posts/{post_id}/proposals/{proposal_id}")
def review(post_id: str, proposal_id: str, data: ProposalReviewPayload, user=Depends(signed_in), db=Depends(database)):
    """Approve one target atomically and reject its competitors, preserving unrelated proposals."""
    post = require_post(db, post_id, user, ["author"], lock=True)
    proposal = db.get(Proposal, proposal_id)
    if not proposal or proposal.post_id != post.id or proposal.status != "pending":
        raise HTTPException(409, "Proposal is no longer pending")
    if data.action == "approve":
        # The reviewer sends the revision shown alongside alternatives. A competing review must refresh.
        if data.current_version != post.versions.get(proposal.target, 0):
            raise HTTPException(409, "Current content changed; compare the versions again")
        apply_target(post, proposal.target, proposal.value)
        validate_media(db, post, user, post.document)
        if post.public:
            ensure_publishable(post.document)
        # Creator approval changes the authoritative Post.document immediately.
        synchronize_post_search(db, post)
        db.execute(update(Proposal).where(Proposal.post_id == post.id, Proposal.target == proposal.target, Proposal.status == "pending").values(status="rejected"))
        proposal.status = "approved"
    elif data.action == "reject":
        proposal.status = "rejected"
    else:
        raise HTTPException(422, "Choose approve or reject")
    db.commit()
    invalidate_public_cache()
    return {"ok": True}



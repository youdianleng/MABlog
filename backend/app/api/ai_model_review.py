"""Administrator review of the AI model files that feed the public ``/ai-models`` page."""

from fastapi import APIRouter, Depends

from ..dependencies import database
from ..models import User
from ..schemas import ModelApprovalPayload, ModelReturnPayload
from ..services import ai_model_review
from ..services.admin_audit import audit
from ..services.administration import require_admin
from ..services.step_up import require_step_up

router = APIRouter(prefix="/admin/ai-models", tags=["administration"])


@router.get("")
def list_model_files(user: User = Depends(require_admin)) -> dict:
    """Return every model file and ``rankings.yaml`` for the review page (administrators only).

    Drafts are unpublished editorial material, so even reading them requires the administrator role.
    """
    return ai_model_review.list_model_files()


@router.post("/{name}/approve")
def approve_model_file(name: str, data: ModelApprovalPayload, db=Depends(database), user: User = Depends(require_step_up)) -> dict:
    """Publish a draft on ``/ai-models`` by marking it reviewed.

    Publishing changes a public page, so it needs recent administrator verification (step-up), like
    newsroom publication. The change is written only if the file still matches the version the
    reviewer saw, and every approval is recorded in the administrator audit log.
    """

    def record(before: dict, after: dict) -> None:
        """Stage the audit event before the file is written (committed after the write)."""
        audit(db, user, "ai_model_file.approved", "ai_model_file", name, data.note, before, after)
        db.flush()

    result = ai_model_review.change_file(name, data.sha256, lambda text: ai_model_review.approve(text, user.username, data.note), record)
    db.commit()
    return result


@router.post("/{name}/return-to-draft")
def return_model_file(name: str, data: ModelReturnPayload, db=Depends(database), user: User = Depends(require_step_up)) -> dict:
    """Remove a reviewed file from ``/ai-models`` and record the reason as a review note.

    Same protections as approval: step-up, version check, and an audit event.
    """

    def record(before: dict, after: dict) -> None:
        """Stage the audit event before the file is written (committed after the write)."""
        audit(db, user, "ai_model_file.returned_to_draft", "ai_model_file", name, data.reason, before, after)
        db.flush()

    result = ai_model_review.change_file(name, data.sha256, lambda text: ai_model_review.return_to_draft(text, user.username, data.reason), record)
    db.commit()
    return result

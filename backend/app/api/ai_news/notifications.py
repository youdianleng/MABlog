"""Administrator AI-news alert reading and personal email preferences."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from ...dependencies import database
from ...models import NewsAlert, NewsAlertReceipt, User
from ...schemas import NewsEmailPreferencePayload
from ...services.administration import require_admin
from ...utils import now
from .serializers import alert_summary

router = APIRouter()


@router.get("/notifications")
def notifications(db=Depends(database), user: User = Depends(require_admin)):
    """List the current administrator's mandatory in-app alerts and email preference."""
    rows = db.execute(select(NewsAlert, NewsAlertReceipt).join(NewsAlertReceipt, NewsAlertReceipt.alert_id == NewsAlert.id).where(NewsAlertReceipt.user_id == user.id).order_by(NewsAlert.created.desc()).limit(100)).all()
    return {"email_enabled": user.ai_news_email, "items": [alert_summary(alert, receipt.read_at) for alert, receipt in rows]}


@router.post("/notifications/{alert_id}/read")
def mark_notification_read(alert_id: str, db=Depends(database), user: User = Depends(require_admin)):
    """Mark one administrator-specific in-app receipt as read."""
    receipt = db.get(NewsAlertReceipt, (alert_id, user.id))
    if not receipt:
        raise HTTPException(404, "Notification not found")
    receipt.read_at = now()
    db.commit()
    return {"ok": True}


@router.patch("/notifications/email")
def update_email_preference(data: NewsEmailPreferencePayload, db=Depends(database), user: User = Depends(require_admin)):
    """Mute or enable action-required email while preserving in-app alerts."""
    user.ai_news_email = data.enabled
    db.commit()
    return {"enabled": user.ai_news_email}



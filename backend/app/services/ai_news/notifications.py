"""Deduplicated in-app and administrator-email notifications for failed news runs."""

import os
import smtplib
from email.message import EmailMessage

from sqlalchemy import select

from ...models import NewsAlert, NewsAlertReceipt, NewsRun, User
from ...utils import new_id, now


def create_alert(db, run: NewsRun | None, alert_type: str, title: str, message: str, severity: str = "error") -> NewsAlert:
    """Create one alert per run/type and initialize mandatory administrator receipts."""
    existing = db.scalar(select(NewsAlert).where(NewsAlert.run_id == (run.id if run else None), NewsAlert.alert_type == alert_type))
    if existing:
        return existing
    alert = NewsAlert(
        id=new_id(),
        run_id=run.id if run else None,
        alert_type=alert_type,
        severity=severity,
        title=title[:200],
        message=message[:4000],
    )
    db.add(alert)
    db.flush()
    administrators = list(db.scalars(select(User).where(User.is_admin.is_(True), User.is_system.is_(False), User.active.is_(True))))
    for administrator in administrators:
        db.add(NewsAlertReceipt(alert_id=alert.id, user_id=administrator.id))
    _send_alert_email(alert, [administrator for administrator in administrators if administrator.ai_news_email and administrator.verified_until > now()])
    return alert


def _send_alert_email(alert: NewsAlert, recipients: list[User]) -> None:
    """Deliver one message to opted-in administrators and retain only a safe outcome code."""
    if not recipients or not os.getenv("SMTP_HOST", "").strip():
        alert.email_status = "not_configured" if recipients else "no_recipients"
        return
    message = EmailMessage()
    message["From"] = "MAblog <noreply@mablog.local>"
    message["To"] = ", ".join(user.email for user in recipients)
    message["Subject"] = f"MAblog AI news: {alert.title}"
    message.set_content(f"{alert.message}\n\nOpen the administrator AI-news workspace for details.")
    try:
        with smtplib.SMTP(os.getenv("SMTP_HOST", "localhost"), int(os.getenv("SMTP_PORT", "1025")), timeout=10) as smtp:
            smtp.send_message(message)
        alert.email_status = "sent"
    except OSError:
        alert.email_status = "failed"

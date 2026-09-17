"""SMTP delivery for purpose-bound verification codes."""
import os
import smtplib
from email.message import EmailMessage

from ..config import CODE_SECONDS
from ..models import User

SMTP_TIMEOUT_SECONDS = 10
SENDER = "MAblog <noreply@mablog.local>"


class EmailDeliveryError(RuntimeError):
    """Signal that a verification message could not reach the configured inbox."""


def send_verification_email(user: User, code: str, purpose: str) -> None:
    """Deliver one bilingual verification code through the configured SMTP server."""

    message = EmailMessage()
    message["From"], message["To"] = SENDER, user.email
    message["Subject"] = "MAblog verification / Verificación"
    minutes = CODE_SECONDS // 60
    message.set_content(
        f"Your MAblog code / Tu código MAblog: {code}\n"
        f"Expires in {minutes} minutes / Caduca en {minutes} minutos.\n"
        f"Purpose: {purpose}"
    )
    try:
        with smtplib.SMTP(
            os.getenv("SMTP_HOST", "localhost"),
            int(os.getenv("SMTP_PORT", "1025")),
            timeout=SMTP_TIMEOUT_SECONDS,
        ) as smtp:
            smtp.send_message(message)
    except OSError as error:
        raise EmailDeliveryError("Local email inbox is unavailable") from error


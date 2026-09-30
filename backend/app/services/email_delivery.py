"""SMTP delivery for purpose-bound verification codes."""

import smtplib
from email.message import EmailMessage

from ..config import CODE_SECONDS, SMTP_HOST, SMTP_PORT
from ..models import User

SMTP_TIMEOUT_SECONDS = 10
SENDER = "MAblog <noreply@mablog.local>"
# Verification mail falls back to a local SMTP catcher when no host is configured.
DEFAULT_SMTP_HOST = "localhost"


class EmailDeliveryError(RuntimeError):
    """Signal that a verification message could not reach the configured inbox."""


def send_verification_email(user: User, code: str, purpose: str) -> None:
    """Deliver one bilingual verification code through the configured SMTP server."""

    message = EmailMessage()
    message["From"], message["To"] = SENDER, user.email
    message["Subject"] = "MAblog verification / Verificación"
    minutes = CODE_SECONDS // 60
    message.set_content(f"Your MAblog code / Tu código MAblog: {code}\nExpires in {minutes} minutes / Caduca en {minutes} minutos.\nPurpose: {purpose}")
    try:
        with smtplib.SMTP(
            SMTP_HOST or DEFAULT_SMTP_HOST,
            SMTP_PORT,
            timeout=SMTP_TIMEOUT_SECONDS,
        ) as smtp:
            smtp.send_message(message)
    except OSError as error:
        raise EmailDeliveryError("Local email inbox is unavailable") from error

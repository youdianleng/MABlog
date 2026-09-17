"""Append-only administrator audit helpers for bounded non-secret metadata."""

import json

from ..models import AdminAuditEvent, User

# Audit snapshots are operational metadata rather than source documents; bound their stored size.
MAX_AUDIT_JSON_CHARACTERS = 12_000


def bounded_metadata(value: dict | None) -> dict | None:
    """Return metadata only when its serialized representation stays within the audit limit."""
    if value is None:
        return None
    encoded = json.dumps(value, ensure_ascii=False, default=str)
    return value if len(encoded) <= MAX_AUDIT_JSON_CHARACTERS else {"truncated": True, "characters": len(encoded)}


def audit(db, actor: User | None, action: str, target_type: str, target_id: str, reason: str = "", before: dict | None = None, after: dict | None = None) -> AdminAuditEvent:
    """Append an administrator action to the current transaction without committing it."""
    event = AdminAuditEvent(
        actor_id=actor.id if actor else None,
        action=action,
        target_type=target_type,
        target_id=target_id,
        reason=reason[:1000],
        before=bounded_metadata(before),
        after=bounded_metadata(after),
    )
    db.add(event)
    return event


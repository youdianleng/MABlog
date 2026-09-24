"""Protected AI-news provider credentials and editorial model assignments."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...dependencies import database
from ...models import NewsRun, NewsSetting, User
from ...schemas import NewsModelsPayload, NewsProviderKeyPayload
from ...services.admin_audit import audit
from ...services.administration import require_admin
from ...services.ai_news.provider_settings import PROVIDERS, encrypt_key, provider_status
from ...services.step_up import require_step_up
from ...utils import now

router = APIRouter(prefix="/providers")
AdminDB = Annotated[Session, Depends(database)]
AdminUser = Annotated[User, Depends(require_admin)]
StepUpUser = Annotated[User, Depends(require_step_up)]


def _require_idle(db) -> NewsSetting:
    """Prevent a running edition from mixing old and newly rotated providers."""
    settings = db.scalar(select(NewsSetting).where(NewsSetting.id == 1).with_for_update())
    active = db.scalar(select(NewsRun.id).where(NewsRun.status.in_(["pending", "running", "retrying"])).limit(1))
    if active:
        raise HTTPException(409, "Wait for the current AI-news run to finish before changing providers")
    if not settings:
        raise HTTPException(503, "AI-news settings are unavailable")
    return settings


@router.get("")
def get_providers(response: Response, db: AdminDB, user: AdminUser):
    """Return source/status and model IDs, never credential values or fragments."""
    response.headers["Cache-Control"] = "no-store"
    return provider_status(db)


@router.put("/keys/{provider}")
def replace_key(provider: str, data: NewsProviderKeyPayload, response: Response, db: AdminDB, user: StepUpUser):
    """Encrypt and audit one replacement key without persisting its plaintext in logs."""
    if provider not in PROVIDERS:
        raise HTTPException(404, "Unknown AI-news provider")
    settings = _require_idle(db)
    value = data.api_key.get_secret_value().strip()
    if len(value) < 8:
        raise HTTPException(422, "Key must contain at least 8 non-space characters")
    setattr(settings, PROVIDERS[provider], encrypt_key(value))
    settings.updated = now()
    audit(db, user, "ai_news.provider.key_replaced", "news_settings", "1", after={"provider": provider, "configured": True})
    db.commit()
    response.headers["Cache-Control"] = "no-store"
    return provider_status(db)


@router.delete("/keys/{provider}")
def clear_key(provider: str, response: Response, db: AdminDB, user: StepUpUser):
    """Remove only the saved override; any environment key remains effective."""
    if provider not in PROVIDERS:
        raise HTTPException(404, "Unknown AI-news provider")
    settings = _require_idle(db)
    setattr(settings, PROVIDERS[provider], None)
    settings.updated = now()
    audit(db, user, "ai_news.provider.key_override_cleared", "news_settings", "1", after={"provider": provider, "saved_override": False})
    db.commit()
    response.headers["Cache-Control"] = "no-store"
    return provider_status(db)


@router.put("/models")
def set_models(data: NewsModelsPayload, response: Response, db: AdminDB, user: StepUpUser):
    """Persist the fast and strong model roles after the active-run safety check."""
    settings = _require_idle(db)
    before = {"small": settings.small_model_override, "strong": settings.strong_model_override}
    settings.small_model_override = data.small_model
    settings.strong_model_override = data.strong_model
    settings.updated = now()
    audit(db, user, "ai_news.provider.models_changed", "news_settings", "1", before=before, after={"small": data.small_model, "strong": data.strong_model})
    db.commit()
    response.headers["Cache-Control"] = "no-store"
    return provider_status(db)

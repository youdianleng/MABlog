"""Shared strict schema behavior used by every API request model."""
from pydantic import BaseModel, ConfigDict


class StrictModel(BaseModel):
    """Reject unknown client fields and non-finite numbers at API boundaries."""

    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

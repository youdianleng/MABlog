"""Signed-in access to the AI-news research and model-file instructions."""

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse

from ..dependencies import signed_in
from ..models import User
from ..services.ai_news.instructions import INSTRUCTIONS_FILENAME, read_instructions

router = APIRouter()


@router.get("/ai-news/instructions", response_class=PlainTextResponse)
def ai_news_instructions(user: User = Depends(signed_in)) -> PlainTextResponse:
    """Return the instruction Markdown so the profile page can save it into the user's folder.

    Any verified account may read it: the file contains editorial rules and public source URLs,
    no secrets. Sign-in is still required because only the profile page uses it.
    """
    return PlainTextResponse(
        read_instructions(),
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'inline; filename="{INSTRUCTIONS_FILENAME}"'},
    )

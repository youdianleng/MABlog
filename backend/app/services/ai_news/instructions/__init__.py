"""Versioned AI-news research and model-file instructions shipped with the backend.

The Markdown file beside this module is the master copy. The API serves it so the profile page
can save a snapshot into a user's chosen folder, and the newsroom will load it as its rulebook in
a later stage.
"""

from pathlib import Path

INSTRUCTIONS_PATH = Path(__file__).with_name("ai-news-instructions.md")
# Name used when the profile page saves a copy into the user's folder.
INSTRUCTIONS_FILENAME = "ai-news-instructions.md"


def read_instructions() -> str:
    """Return the current instruction Markdown as UTF-8 text.

    Raises:
        FileNotFoundError: if the image was built without the instruction file, which is a
            deployment error rather than a client error.
    """
    return INSTRUCTIONS_PATH.read_text(encoding="utf-8")

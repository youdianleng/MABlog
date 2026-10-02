"""Read and change the review status of the AI model Markdown files behind ``/ai-models``.

The files live in ``frontend/content/ai-models/`` (format: the AI-news instruction file, sections
4–6). Compose bind-mounts that folder into the backend (read-write) and the frontend (read-only), so
an approval here changes what the public page shows on its next request and also appears as a Git
change in the repository for the owner to commit.

Edits are textual so the rest of each file keeps its exact formatting; PyYAML only reads the front
matter to check the current state and to validate the edited result before it is written.
"""

import hashlib
import json
import os
import re
import threading
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import yaml
from fastapi import HTTPException

from ..config import AI_MODELS_DIR, NEWS_TIMEZONE

# Model files are lower-case kebab names ending in .md; "_" notes such as run reports are excluded,
# matching the frontend loader's isModelFileName rule.
MODEL_FILE_NAME = re.compile(r"^[a-z0-9][a-z0-9_-]*\.md$")
RANKINGS_FILE = "rankings.yaml"
FRONT_MATTER = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
# The review_notes block: an empty inline list, or one "  - item" line per note (notes are single
# lines in this format; a continuation line indented four spaces is accepted for safety).
REVIEW_NOTES_BLOCK = re.compile(r"^review_notes:(?: \[\])?\n(?:(?:  - |    ).*\n)*", re.MULTILINE)
HISTORY_HEADINGS = ("## Update history\n\n", "## Historial de actualizaciones\n\n")

# One uvicorn process serves the API (backend Dockerfile CMD), so an in-process lock is enough to
# make "check the hash, then replace the file" atomic between concurrent requests.
_write_lock = threading.Lock()


def content_folder() -> Path:
    """Return the configured model folder.

    :raises HTTPException: 503 when ``AI_MODELS_DIR`` is unset or the folder is missing.
    """
    if AI_MODELS_DIR is None or not AI_MODELS_DIR.is_dir():
        raise HTTPException(503, "The AI model folder is not available on this server")
    return AI_MODELS_DIR


def file_hash(text: str) -> str:
    """SHA-256 of a file's text, used as its version for optimistic concurrency."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _read(path: Path) -> str:
    """Read a file as UTF-8 text with LF line endings, as the files are stored."""
    return path.read_text(encoding="utf-8").replace("\r\n", "\n")


def list_model_files() -> dict:
    """Return every model file's raw text and version, plus the raw ``rankings.yaml``.

    The frontend parses the text with the same validator the public page uses, so the review page
    previews exactly what would be published.
    """
    folder = content_folder()
    files = []
    for path in sorted(folder.iterdir()):
        if path.is_file() and MODEL_FILE_NAME.match(path.name):
            text = _read(path)
            files.append({"name": path.name, "sha256": file_hash(text), "text": text})
    rankings = folder / RANKINGS_FILE
    return {"files": files, "rankings": _read(rankings) if rankings.is_file() else ""}


def _model_path(name: str) -> Path:
    """Resolve a requested file name inside the folder, refusing anything else.

    :raises HTTPException: 404 for names outside the model-file pattern or files that do not exist.
    """
    if not MODEL_FILE_NAME.match(name):
        raise HTTPException(404, "Model file not found")
    path = content_folder() / name
    if not path.is_file():
        raise HTTPException(404, "Model file not found")
    return path


def _front_matter(text: str) -> tuple[dict, re.Match]:
    """Parse the YAML front matter of a model file.

    :raises HTTPException: 422 when the front matter is missing or not a YAML mapping.
    """
    match = FRONT_MATTER.match(text)
    data = yaml.safe_load(match.group(1)) if match else None
    if not isinstance(data, dict):
        raise HTTPException(422, "The model file has no valid front matter")
    return data, match


def _replace_in_front_matter(text: str, match: re.Match, pattern: re.Pattern | str, replacement: str) -> str:
    """Replace exactly one occurrence inside the front matter only.

    :raises HTTPException: 422 when the pattern does not occur exactly once.
    """
    head = match.group(1) + "\n"
    if isinstance(pattern, str):
        count = head.count(pattern)
        new_head = head.replace(pattern, replacement)
    else:
        new_head, count = pattern.subn(replacement, head)
    if count != 1:
        raise HTTPException(422, "The model file does not follow the expected front-matter layout")
    return "---\n" + new_head + "---\n" + text[match.end() :]


def _append_history(text: str, english: str, spanish: str) -> str:
    """Add one dated line to the end of the English and Spanish "Update history" lists.

    :raises HTTPException: 422 when either history heading is missing.
    """
    for heading, line in zip(HISTORY_HEADINGS, (english, spanish), strict=True):
        if text.count(heading) != 1:
            raise HTTPException(422, "The model file is missing an Update history section")
        start = text.index(heading) + len(heading)
        end = text.find("\n\n", start)
        end = len(text.rstrip("\n")) if end == -1 else end
        text = text[:end] + "\n" + line + text[end:]
    return text


def _notes_yaml(notes: list[str]) -> str:
    """Render review notes as the block list used in the files (JSON strings are valid YAML)."""
    if not notes:
        return "review_notes: []\n"
    return "review_notes:\n" + "".join(f"  - {json.dumps(note, ensure_ascii=False)}\n" for note in notes)


def editorial_date() -> str:
    """Today's date in the newsroom's time zone (Europe/Madrid by default), as YYYY-MM-DD."""
    return datetime.now(ZoneInfo(NEWS_TIMEZONE)).date().isoformat()


def _single_line(value: str) -> str:
    """Collapse whitespace so free text cannot break the one-line history or note format."""
    return " ".join(value.split())


def approve(text: str, reviewer: str, note: str = "") -> tuple[str, dict, dict]:
    """Mark a draft model file reviewed.

    Empties ``review_notes`` (instructions section 5) but keeps the accepted notes in the English
    history line so nothing the reviewer acknowledged is lost.

    :returns: the new text, and before/after summaries for the audit log.
    :raises HTTPException: 409 when the file is not a draft; 422 for an unexpected layout.
    """
    data, match = _front_matter(text)
    if data.get("review_status") != "draft":
        raise HTTPException(409, "Only draft files can be approved")
    notes = [str(item) for item in (data.get("review_notes") or [])]
    text = _replace_in_front_matter(text, match, "review_status: draft\n", "review_status: reviewed\n")
    _, match = _front_matter(text)
    text = _replace_in_front_matter(text, match, REVIEW_NOTES_BLOCK, _notes_yaml([]))
    date, note = editorial_date(), _single_line(note)
    english = f"- {date} — Marked reviewed by {reviewer} on the admin review page."
    spanish = f"- {date} — Marcada como revisada por {reviewer} en la página de revisión."
    if notes:
        english += " Accepted open review notes: " + " | ".join(_single_line(item) for item in notes)
        spanish += f" Notas de revisión aceptadas: {len(notes)} (detalle en el historial en inglés)."
    if note:
        english += f" Reviewer note: {note}"
        spanish += f" Nota del revisor: {note}"
    text = _append_history(text, english, spanish)
    _check_result(text, "reviewed")
    return text, {"review_status": "draft", "review_notes": notes}, {"review_status": "reviewed", "review_notes": [], "note": note}


def return_to_draft(text: str, reviewer: str, reason: str) -> tuple[str, dict, dict]:
    """Take a reviewed model file off the public page and record why as a review note.

    :returns: the new text, and before/after summaries for the audit log.
    :raises HTTPException: 409 when the file is already a draft; 422 for an unexpected layout.
    """
    data, match = _front_matter(text)
    if data.get("review_status") != "reviewed":
        raise HTTPException(409, "Only reviewed files can be returned to draft")
    reason, date = _single_line(reason), editorial_date()
    notes = [f"Returned to draft on {date} by {reviewer}: {reason}"]
    text = _replace_in_front_matter(text, match, "review_status: reviewed\n", "review_status: draft\n")
    _, match = _front_matter(text)
    text = _replace_in_front_matter(text, match, REVIEW_NOTES_BLOCK, _notes_yaml(notes))
    text = _append_history(
        text,
        f"- {date} — Returned to draft by {reviewer} on the admin review page: {reason}",
        f"- {date} — Devuelta a borrador por {reviewer} en la página de revisión: {reason}",
    )
    _check_result(text, "draft")
    return text, {"review_status": "reviewed"}, {"review_status": "draft", "review_notes": notes}


def _check_result(text: str, status: str) -> None:
    """Re-parse an edited file before writing it, so a bad edit never reaches the public page.

    :raises HTTPException: 500 when the edit did not produce the intended status.
    """
    data, _ = _front_matter(text)
    if data.get("review_status") != status or not isinstance(data.get("review_notes"), list):
        raise HTTPException(500, "The model file could not be updated safely")


def change_file(name: str, expected_sha256: str, edit, record) -> dict:
    """Apply one review edit to a file if it still matches the version the reviewer saw.

    ``edit`` receives the current text and returns ``(new_text, before, after)``. ``record`` is
    called with ``before`` and ``after`` before anything is written, so the caller can add and
    flush its audit event first: a database failure then leaves the file untouched, and the caller
    commits only after the write succeeded. The new text goes to a temporary file in the same
    folder and is moved into place, so the frontend never reads a half-written file.

    :returns: the updated file record (name, sha256, text).
    :raises HTTPException: 404 for an unknown file; 409 when the file changed since it was loaded.
    """
    path = _model_path(name)
    with _write_lock:
        current = _read(path)
        if file_hash(current) != expected_sha256:
            raise HTTPException(409, "This file changed since you opened it. Reload and review it again.")
        text, before, after = edit(current)
        record(before, after)
        temporary = path.with_name(f".{name}.tmp")
        temporary.write_bytes(text.encode("utf-8"))
        os.replace(temporary, path)
    return {"name": name, "sha256": file_hash(text), "text": text}

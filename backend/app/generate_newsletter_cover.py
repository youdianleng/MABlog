"""One-time command: generate the fixed "MABlog AI Newsletter" cover through the OpenAI image API.

Usage (inside the backend container)::

    python -m app.generate_newsletter_cover [--out PATH] [--force]

The prompt is read from section 10.1 of the AI-news instruction file, so the cover and its
documented prompt cannot drift apart. The site owner approved one generation on 2026-10-02 with the
cheapest OpenAI image model; running it again costs money, so an existing cover is never replaced
without ``--force``.
"""

import argparse
import base64
import re
import sys
from pathlib import Path

import httpx

from .config import OPENAI_API_KEY, OPENAI_BASE_URL
from .services.ai_news.instructions import read_instructions

# GPT Image 1 Mini is OpenAI's cheapest image model; medium quality at 1536x1024 is listed at
# $0.015 per image in OpenAI's image-generation guide (checked 2026-10-02). Low quality saves only
# a fraction of a cent and is too rough for a permanent cover.
COVER_MODEL = "gpt-image-1-mini"
COVER_SIZE = "1536x1024"
COVER_QUALITY = "medium"
# Image generation can take much longer than text requests.
COVER_TIMEOUT_SECONDS = 180
DEFAULT_OUTPUT = Path(__file__).parent / "services" / "ai_news" / "assets" / "mablog-ai-newsletter-cover.png"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class CoverGenerationError(RuntimeError):
    """A cover could not be produced; the message never contains the API key or image data."""


def cover_prompt(instructions: str) -> str:
    """Extract the quoted cover prompt from section 10.1 of the instruction file.

    Raises:
        CoverGenerationError: if the section or its blockquote is missing.
    """
    match = re.search(r"### 10\.1 Cover image prompt.*?\n\n((?:> .*\n?)+)", instructions)
    if not match:
        raise CoverGenerationError("cover prompt section 10.1 not found in the instruction file")
    return " ".join(line[2:].strip() for line in match.group(1).strip().splitlines())


def request_cover(prompt: str) -> bytes:
    """Call the OpenAI image API once and return the decoded PNG bytes.

    Raises:
        CoverGenerationError: when no key is configured, the request fails, or the response does not
            contain a PNG image.
    """
    if not OPENAI_API_KEY:
        raise CoverGenerationError("OPENAI_API_KEY is not configured")
    try:
        response = httpx.post(
            f"{OPENAI_BASE_URL}/images/generations",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={"model": COVER_MODEL, "prompt": prompt, "size": COVER_SIZE, "quality": COVER_QUALITY, "n": 1},
            timeout=COVER_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as error:
        raise CoverGenerationError(f"image request failed: {type(error).__name__}") from error
    if response.status_code >= 400:
        raise CoverGenerationError(f"image request returned HTTP {response.status_code}")
    try:
        image = base64.b64decode(response.json()["data"][0]["b64_json"])
    except (KeyError, IndexError, TypeError, ValueError) as error:
        raise CoverGenerationError("image response did not contain base64 image data") from error
    if not image.startswith(PNG_SIGNATURE):
        raise CoverGenerationError("image response was not a PNG")
    return image


def generate_cover(output: Path, force: bool = False) -> Path:
    """Generate the cover and write it to ``output``.

    Raises:
        CoverGenerationError: if the output already exists and ``force`` is false, or generation fails.
    """
    if output.exists() and not force:
        raise CoverGenerationError(f"{output} already exists; pass --force to pay for a new image")
    image = request_cover(cover_prompt(read_instructions()))
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(image)
    return output


def main() -> None:
    """Parse arguments, generate the cover once, and report where it was saved."""
    parser = argparse.ArgumentParser(description="Generate the fixed MABlog AI Newsletter cover (paid API call).")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT, help="where to write the PNG")
    parser.add_argument("--force", action="store_true", help="replace an existing cover (costs another generation)")
    arguments = parser.parse_args()
    try:
        path = generate_cover(arguments.out, arguments.force)
    except CoverGenerationError as error:
        print(f"Cover not generated: {error}", file=sys.stderr)
        raise SystemExit(1) from error
    print(f"Saved {path} ({path.stat().st_size} bytes) using {COVER_MODEL}, {COVER_QUALITY}, {COVER_SIZE}.")


if __name__ == "__main__":
    main()

"""Local original dark-celestial cover rendering for automated weekly editions."""

from pathlib import Path
import random
import textwrap

from PIL import Image, ImageDraw, ImageFont

from ...config import UPLOAD_DIR

COVER_WIDTH = 1600
COVER_HEIGHT = 900


def _font(size: int, bold: bool = False):
    """Load a common container font and fall back to Pillow's built-in face."""
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(name, size=size)
    except OSError:
        return ImageFont.load_default()


def render_cover(identifier: str, title: str, edition_date: str) -> Path:
    """Render an original deterministic celestial cover and save it under an opaque media ID."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (COVER_WIDTH, COVER_HEIGHT), "#07080d")
    draw = ImageDraw.Draw(image, "RGBA")
    # A run-derived seed keeps retries idempotent while giving each edition a distinct star field.
    randomizer = random.Random(identifier)
    for _ in range(85):
        x, y = randomizer.randrange(COVER_WIDTH), randomizer.randrange(COVER_HEIGHT)
        radius = randomizer.choice((1, 1, 2, 3))
        color = randomizer.choice(((235, 205, 125, 120), (165, 65, 72, 130), (112, 192, 211, 105)))
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    for inset, color, width in ((-260, (191, 143, 65, 95), 3), (-100, (139, 62, 67, 85), 2), (70, (206, 177, 103, 80), 2)):
        draw.arc((inset, 220 + inset // 6, COVER_WIDTH - inset, 1320 - inset // 6), 195, 345, fill=color, width=width)
    draw.rounded_rectangle((120, 112, 1480, 788), radius=24, fill=(9, 10, 17, 160), outline=(196, 157, 84, 90), width=2)
    draw.text((170, 166), "MABLOG  IA  ·  VERIFIED MODEL UPDATE", font=_font(28, True), fill="#d6ae66")
    y = 286
    for line in textwrap.wrap(title, width=34)[:4]:
        draw.text((170, y), line, font=_font(68, True), fill="#fff4df")
        y += 84
    draw.text((170, 710), edition_date, font=_font(30), fill="#aeb8c7")
    path = UPLOAD_DIR / identifier
    image.save(path, format="PNG", optimize=True)
    return path

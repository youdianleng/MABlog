"""Explicit, idempotent local sample data; never runs as part of normal startup."""
import shutil
from pathlib import Path

from sqlalchemy import select
from .services.authentication import password_hasher
from .config import UPLOAD_DIR
from .database import SessionLocal
from .models import Like, Media, Post, User
from .schemas import Block, Document
from .services.indexing import synchronize_post_search
from .services.public_cache import invalidate_public_cache
from .utils import new_id, now

STORIES = [
    ("Where the mountains remember", "A quiet walk beyond the last torii gate, where the wind still knows our names.", "shrine.png", "travel", "I followed the stone lanterns until the village became a memory. Above the clouds, the mountains were gathering the last light of the afternoon. There was no quest marker here, no destination to unlock. Only a path, a red gate, and the feeling that arriving slowly was its own kind of discovery."),
    ("Lanterns for the wandering moon", "Some wishes are too small to speak aloud. We send them across the water instead.", "moon.png", "general", "At dusk, everyone brought one lantern to the lake. Some carried names; others carried apologies. Mine was empty. I wanted to leave room for a wish I had not found yet. When the lantern joined the others, its reflection looked like a new constellation beneath the bridge."),
    ("Letters from the crimson path", "An autumn pilgrimage, a paper umbrella, and the stories we leave between seasons.", "autumn.png", "travel", "The corridor was longer than I remembered. Red leaves had gathered against every wooden pillar, and someone had left a letter beneath a stone. It began with a simple invitation: take the road you usually hurry past. So I did, and the afternoon unfolded like a story written just for that moment."),
    ("A library between worlds", "In the sky above the clouds, a thousand unfinished stories are waiting for a reader.", "library.png", "anime", "The librarian never asked what I wanted to know. She asked what I was willing to imagine. Beyond the window, paper birds carried unfinished sentences from one floating island to the next. I chose a slim blue volume, opened it, and heard the ocean."),
    ("When the garden wakes", "Follow the blue butterflies. They know a place that only exists after midnight.", "garden.png", "anime", "The fox waited at the first step, patient as moonlight. Every flower in the garden was closed except the wisteria, whose pale branches seemed to hold the stars. I followed a single blue butterfly through the gate and finally understood why some places belong to the night."),
    ("The cartographer of rain", "She mapped storms by the memories they carried, not by where they made landfall.", "shrine.png", "travel", "Mara arrived in the hill town with a case of blank maps and left with every page stained blue. The villagers taught her that each rain had a different voice: tin roofs remembered laughter, cedar branches remembered farewells, and the river remembered every bridge it had ever touched. By morning, her map showed no roads at all—only the places where someone had once waited for the sky to clear."),
    ("Static between the stars", "An old receiver finds a message hidden inside the silence between weather satellites.", "moon.png", "technology", "The signal appeared at 03:17, too regular to be weather and too patient to be interference. Inez slowed it down until the static became a sequence of tiny pauses. They were not coordinates. They were instructions for repairing a forgotten radio, written by someone who had known it would break decades later. When the final valve warmed, the receiver played the sound of distant waves."),
    ("The tea house at the edge of winter", "Every cup offers one last conversation before the snow closes the mountain road.", "autumn.png", "general", "The tea house opened only on the final evening of autumn. Travelers came carrying questions they had postponed all year, and the owner answered none of them. She simply chose a cup, measured the leaves, and waited. By the time the steam faded, most visitors had discovered that what they needed was not advice but enough quiet to hear their own answer."),
    ("Signal from the paper moon", "A rooftop inventor sends a handmade satellite into a sky full of impossible constellations.", "library.png", "anime", "Jun built the paper moon from bamboo ribs, silver thread, and a transmitter rescued from the school science room. Everyone said it would fold before reaching the clouds. Instead, it rose beyond the city lights and began returning images of constellations no telescope had recorded. In the final photograph, someone on the far side of the sky was holding up a paper sun."),
    ("The city of sleeping kites", "Above a windless harbor, thousands of kites wait for one child to remember their names.", "garden.png", "travel", "No kite had flown over Vela for nineteen years. They hung between balconies and bell towers, bright as frozen birds. On her first morning in the city, Lio found a spool beneath the harbor clock with her name carved into the wood. When she whispered the names printed along its thread, the sea breeze returned one street at a time."),
    ("Archive of small miracles", "A night clerk records the ordinary moments that quietly keep the world together.", "shrine.png", "general", "The archive had no shelves for grand victories. It kept the first tomato from a balcony garden, a bus ticket from the day two sisters reconciled, and the recipe a baker finally remembered without looking. Each object glowed only faintly. Together, they lit the underground rooms more warmly than any chandelier could."),
    ("The last train to Hoshikawa", "The midnight carriage stops at stations that disappeared from every modern map.", "moon.png", "anime", "Aya boarded with a ticket dated twelve years earlier. Beyond the window, abandoned stations bloomed briefly into life: a summer festival, a classroom after rain, her grandfather waving beside a vending machine. The conductor warned that she could step off only once. Aya stayed aboard until the final platform, where tomorrow was waiting with the lights on."),
    ("Notes from a borrowed tomorrow", "A prototype calendar begins printing kind warnings from days that have not happened yet.", "library.png", "technology", "At first the machine predicted trivial things: bring an umbrella, charge the bicycle, call your brother. Then it printed a blank page with only a time and a hospital corridor number. Dev spent the day trying to prevent a disaster and arrived to find a stranger alone in the waiting room. The warning had never been about saving a life. It had been about making sure someone did not face the night alone."),
    ("Beneath the glass forest", "A field researcher discovers that every crystal tree preserves a sound the world has lost.", "garden.png", "travel", "The forest chimed when the sun crossed the valley. Some trunks held birdsong from extinct islands; others kept the creak of ships that had never returned. Sera was told to collect samples, but cutting even one branch would silence it forever. She unpacked her recorder instead and stayed until every battery was empty."),
    ("A map drawn in fireflies", "Two friends follow a living constellation toward the summer they thought they had forgotten.", "autumn.png", "anime", "The fireflies gathered above the rice fields in the shape of a road. Emi recognized every turn, though the path had vanished when the reservoir was built. She and Kaito followed the lights across the water until they reached the hill where they had buried a tin box as children. Inside was a map of places they still promised to see."),
]


def seed() -> None:
    """Create any missing illustrated sample stories and demo accounts without duplicating prior seed data."""
    assets = Path(__file__).resolve().parent.parent / "seed-assets"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with SessionLocal() as db:
        password = password_hasher.hash("mablog-local-2026")
        names = ["Miyori", "Akira", "Ren", "Sora", "Hana", "Yuki", "Aoi", "Nori"]
        users = []
        for index, name in enumerate(names):
            username = "mablog_demo" if index == 0 else f"mablog_demo_{index}"
            user = db.scalar(select(User).where(User.username == username))
            if user is None:
                user = User(username=username, email=f"{username}@example.com", display_name=name, bio="Collecting imagined worlds, quiet moments, and stories worth sharing.", password=password, active=True, verified_until=0)
                db.add(user)
            users.append(user)
        db.flush()
        existing_titles = {
            str(post.document.get("details", {}).get("title", ""))
            for post in db.scalars(select(Post))
        }
        created = 0
        for index, (title, summary, filename, category, story) in enumerate(STORIES):
            if title in existing_titles:
                continue
            source = assets / filename
            if not source.exists():
                raise FileNotFoundError(f"Missing sample artwork: {source}")
            identifier = new_id()
            shutil.copyfile(source, UPLOAD_DIR / identifier)
            url = f"/api/media/{identifier}"
            document = Document().model_dump()
            document["details"] = {"title": title, "summary": summary, "cover": url, "category": category}
            document["blocks"] = [
                Block(id="opening", x=65, y=50, width=1060, height=190, html=f"<h1>{title}</h1><p>{summary}</p>").model_dump(),
                Block(id="art", x=65, y=260, width=630, height=500, order=1, html=f'<img src="{url}" alt="An imagined landscape"><p><em>A place between memory and imagination.</em></p>').model_dump(),
                Block(id="notes", x=730, y=270, width=390, height=490, rotation=1, order=2, html=f"<h2>Field notes</h2><p>{story}</p><p>What would you leave for the next traveler?</p>").model_dump(),
            ]
            post = Post(author_id=users[index % 3].id, public=True, document=document, versions={"details": 1, "canvas": 1, "block:opening": 1, "block:art": 1, "block:notes": 1}, published=now() - index * 3600)
            db.add(post)
            db.flush()
            db.add(Media(id=identifier, owner_id=post.author_id, post_id=post.id, filename=identifier, mime="image/png"))
            for liker in users[:max(2, 7 - (index % 5))]:
                db.add(Like(post_id=post.id, user_id=liker.id, created=now() - 60))
            synchronize_post_search(db, post)
            created += 1
        db.commit()
    invalidate_public_cache()
    print(f"Created {created} missing sample stories. Demo username: mablog_demo; password: mablog-local-2026. Email verification goes to Mailpit.")


if __name__ == "__main__":
    seed()


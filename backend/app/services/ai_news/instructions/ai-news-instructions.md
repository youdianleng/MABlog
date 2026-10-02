# MAblog AI news: research and model-file instructions

- **Instruction version:** 1.2
- **Last reviewed:** 2026-10-02
- **Status:** stage 2. The `/ai-models` page reads reviewed model files and `rankings.yaml`; the newsroom does not follow this file yet (stage 3).
- **Changes in 1.1:** migration rule (section 5.4), `ranking` key replaces `primary`, optional `review_notes`, fixed format for the users/developers section, `rankings.yaml` format (section 4.1).
- **Changes in 1.2:** recency rules. Every run starts with a freshness sweep (section 3.0) so the newest release of every model line has a file, even outside the 7-day news window. Sources are read newest-first and dates come only from the official item (section 2.3). `family` is the version-free model line, older releases get `superseded_by`, and the run report includes a freshness table. Added after a review on 2026-10-02 found Claude Opus 5.5 (2026-09-22), GPT-6 Sol and Luna (2026-09-22), and GPT-6.1 Sol (2026-09-29) missing from the files.
- **Master copy:** `backend/app/services/ai_news/instructions/ai-news-instructions.md`. Edit only this file. Copies saved through the profile page are snapshots.

This file tells an AI agent (the MABlog_IA newsroom, or any agent you run by hand) how to:

1. Find new AI model releases from official sources each week.
2. Write or update **one Markdown file per model release** in the exact format below.
3. Use those files to build the weekly bilingual news post.

The model files feed two places:

- **The weekly AI-news post** on the blog (one roundup per week).
- **The AI Models benchmark page** (`/ai-models`): model descriptions, access, prices, plans, and benchmark entries. Only files marked `review_status: reviewed` appear there.

Decisions marked **proposed default** are the implementer's suggestions and can change. Everything else was confirmed by the site owner.

---

## 1. Scope

### 1.1 Categories

Every file belongs to exactly one category. Use these keys exactly:

| Key            | Category              | Covers                                                                       |
| -------------- | --------------------- | ---------------------------------------------------------------------------- |
| `llm-agents`   | Language models & agents | Chat and reasoning models, coding agents, computer-use and tool-using agents |
| `image`        | Image generation      | Text-to-image and image-editing models                                       |
| `video`        | Video generation      | Text-to-video and image-to-video models, with or without native audio       |
| `music`        | Music generation      | Song (vocal) and instrumental generation                                     |
| `voice-sound`  | Voice & sound         | Text-to-speech, voice cloning, dubbing, speech-to-speech, sound effects      |

A model that clearly spans two categories (for example a video model that also generates music) goes in the category of its **primary** use, and mentions the other ability under "Key capabilities".

Out of scope for now: 3D/world models, real-time avatars, robotics.

### 1.2 What counts as news

Include a release only if a reader can **use it** or it **changes their choice**:

- A new model or a new version (for example 6.0 to 6.1).
- A major product feature built on a model (for example a new agent mode).
- An availability change: new regions, open weights released, API access opened, or general availability after preview.
- A price change, a new plan, or a plan change that adds or removes the model.
- A deprecation or retirement date.

Exclude: funding, partnerships, hiring, policy statements, events, benchmark-only blog posts with no new model, research papers without a usable product or API, and rumours or leaks.

### 1.3 Time window and schedule

Two different windows apply. Do not confuse them:

- **News window (the weekly post):** the post covers releases announced in the **previous 7 days**, run every **Monday 09:00, Europe/Madrid**. If a run was missed, the post covers everything since the last successful run (catch-up).
- **Coverage (the model files):** the folder must always contain a file for the **newest release of every model line** from every provider in section 2.2, whatever its date. The freshness sweep (section 3.0) enforces this on every run. A release older than 7 days that has no file still gets one; it just does not appear in this week's post unless it was announced inside the news window.
- A release's date is the date the **official source** announced it (section 2.3), not the date it was first rumoured, reported by an aggregator, or remembered by a person.

### 1.4 Languages

Every file and every weekly post is bilingual: **English first, then Spanish**, in the same file. Model names, provider names, benchmark names, URLs, and quoted source text are never translated.

---

## 2. Sources

### 2.1 Source rules

- **Official sources are the evidence.** Every fact in a file (date, price, plan, benchmark, capability, availability) must be backed by an official page from the company that made the model: its news page, blog, changelog, documentation, pricing page, or model card.
- **Aggregators are for discovery only.** Use Artificial Analysis, LMArena, The Verge, TechCrunch, and similar outlets to *find* releases you might have missed, then confirm on the official source. Never cite an aggregator as the only source for a release.
  - **Exception:** independent benchmark results *are* evidence when they come from the benchmark's own publisher (for example an Artificial Analysis arena score). Label these `kind: independent`.
- If a release cannot be confirmed on an official page, do not create a file. List it under "Unconfirmed leads" in the run report (section 9).
- Pages that block scripted fetches (marked "blocks scripts" below) must be read through a real browser fetch or the listed fallback. Never guess their content.

### 2.2 Official source list

The machine-readable list below can be imported into the newsroom's source registry later. Notes explain fetch quirks found when the list was checked on 2026-10-01.

```yaml
sources:
  # Language models & agents
  - provider: OpenAI
    provider_key: openai
    categories: [llm-agents, image, video, voice-sound]
    pages:
      - { name: News RSS feed, url: "https://openai.com/news/rss.xml", kind: rss, note: "preferred: dated, newest first, readable by scripts" }
      - { name: Product releases, url: "https://openai.com/news/product-releases/", kind: news, note: "blocks scripts; use the RSS feed" }
      - { name: ChatGPT release notes, url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes", kind: release_notes, note: "blocks scripts" }
  - provider: Anthropic
    provider_key: anthropic
    categories: [llm-agents]
    pages:
      - { name: News, url: "https://www.anthropic.com/news", kind: news, note: "dated cards; read newest first" }
      - { name: Claude Platform release notes, url: "https://platform.claude.com/docs/en/release-notes/overview", kind: release_notes }
  - provider: Google (Gemini / DeepMind)
    provider_key: google
    categories: [llm-agents, image, video, music, voice-sound]
    pages:
      - { name: Gemini product blog, url: "https://blog.google/products-and-platforms/products/gemini/", kind: news }
      - { name: Google DeepMind blog, url: "https://deepmind.google/discover/blog/", kind: news }
      - { name: Gemini API changelog, url: "https://ai.google.dev/gemini-api/docs/changelog", kind: changelog }
      - { name: Veo model page, url: "https://deepmind.google/models/veo/", kind: model_page }
      - { name: Lyria model page, url: "https://deepmind.google/models/lyria/", kind: model_page }
  - provider: xAI
    provider_key: xai
    categories: [llm-agents, image, video]
    pages:
      - { name: News, url: "https://x.ai/news", kind: news }
  - provider: DeepSeek
    provider_key: deepseek
    categories: [llm-agents]
    pages:
      - { name: News, url: "https://www.deepseek.com/en/news/", kind: news }
      - { name: API updates, url: "https://api-docs.deepseek.com/updates", kind: release_notes }
  - provider: Meta
    provider_key: meta
    categories: [llm-agents, image, video]
    pages:
      - { name: Meta AI blog, url: "https://ai.meta.com/blog/", kind: news, note: "blocks scripts" }
  - provider: Mistral AI
    provider_key: mistral
    categories: [llm-agents]
    pages:
      - { name: News, url: "https://mistral.ai/news", kind: news }
  - provider: Alibaba (Qwen / Wan)
    provider_key: alibaba
    categories: [llm-agents, image, video, voice-sound]
    pages:
      - { name: Model Studio newly released models, url: "https://www.alibabacloud.com/help/en/model-studio/newly-released-models", kind: release_notes, note: "dated list covering Qwen and Wan; preferred" }
      - { name: Qwen blog, url: "https://qwen.ai/blog", kind: news, note: "content loads by script" }
      - { name: Alibaba Cloud press room, url: "https://www.alibabacloud.com/press-room", kind: news }
  - provider: Moonshot AI (Kimi)
    provider_key: moonshot
    categories: [llm-agents]
    pages:
      - { name: Kimi research & tech blog, url: "https://www.kimi.com/blog", kind: news }
      - { name: Moonshot platform blog, url: "https://platform.moonshot.ai/blog", kind: news }
      - { name: Kimi model catalog, url: "https://platform.kimi.ai/docs/models", kind: model_catalog }
  - provider: Z.ai (GLM)
    provider_key: zai
    categories: [llm-agents, voice-sound]
    pages:
      - { name: New releases, url: "https://docs.z.ai/release-notes/new-released", kind: release_notes, note: "z.ai/blog returns 404" }
      - { name: Pricing, url: "https://docs.z.ai/guides/overview/pricing", kind: pricing }

  # Image
  - provider: Midjourney
    provider_key: midjourney
    categories: [image, video]
    pages:
      - { name: Updates, url: "https://updates.midjourney.com/", kind: news }
  - provider: Black Forest Labs (FLUX)
    provider_key: bfl
    categories: [image]
    pages:
      - { name: Blog, url: "https://bfl.ai/blog", kind: news }
  - provider: Ideogram
    provider_key: ideogram
    categories: [image]
    pages:
      - { name: API documentation, url: "https://docs.ideogram.ai/", kind: docs, note: "ideogram.ai blocks scripts and no public news page was found; discover via aggregators, confirm in docs" }
  - provider: Recraft
    provider_key: recraft
    categories: [image]
    pages:
      - { name: Blog, url: "https://www.recraft.ai/blog", kind: news }
  - provider: Stability AI
    provider_key: stability
    categories: [image, music]
    pages:
      - { name: News, url: "https://stability.ai/news", kind: news }
  - provider: Microsoft AI (MAI)
    provider_key: microsoft-ai
    categories: [image, voice-sound]
    pages:
      - { name: News, url: "https://microsoft.ai/news/", kind: news }

  # Video
  - provider: Runway
    provider_key: runway
    categories: [video]
    pages:
      - { name: News, url: "https://runwayml.com/news", kind: news }
  - provider: Kuaishou (Kling)
    provider_key: kling
    categories: [video, image]
    pages:
      - { name: Release notes, url: "https://kling.ai/release-note/release-notes", kind: release_notes, note: "content loads by script" }
  - provider: Luma AI
    provider_key: luma
    categories: [video, image]
    pages:
      - { name: News, url: "https://lumalabs.ai/news", kind: news }
  - provider: MiniMax (Hailuo / Speech / Music)
    provider_key: minimax
    categories: [llm-agents, video, music, voice-sound]
    pages:
      - { name: News, url: "https://www.minimax.io/news", kind: news, note: "content loads by script" }
  - provider: ByteDance Seed (Seedance / Seedream)
    provider_key: bytedance-seed
    categories: [video, image]
    pages:
      - { name: Blog, url: "https://seed.bytedance.com/en/blog", kind: news, note: "content loads by script" }
  - provider: Pika
    provider_key: pika
    categories: [video]
    pages:
      - { name: Blog, url: "https://pika.art/blog", kind: news }

  # Music
  - provider: StepFun (StepAudio)
    provider_key: stepfun
    categories: [music, voice-sound]
    pages:
      - { name: StepAudio 3 Music page, url: "https://static.stepfun.com/blog/stepaudio3/music/assets/video/promo.html", kind: product, note: "added 2026-10-02 because StepAudio 3 Music is ranked; no dated news page found" }
  - provider: Suno
    provider_key: suno
    categories: [music]
    pages:
      - { name: Blog, url: "https://suno.com/blog", kind: news }
  - provider: Udio
    provider_key: udio
    categories: [music]
    pages:
      - { name: Blog, url: "https://www.udio.com/blog", kind: news, note: "low activity: last post 2025-11-19 when checked" }
  - provider: Mureka
    provider_key: mureka
    categories: [music]
    pages:
      - { name: Website, url: "https://www.mureka.ai/", kind: product, note: "no news page found; discover via aggregators, confirm on the product site" }

  # Voice & sound
  - provider: ElevenLabs
    provider_key: elevenlabs
    categories: [voice-sound, music]
    pages:
      - { name: Blog, url: "https://elevenlabs.io/blog", kind: news }
      - { name: Changelog, url: "https://elevenlabs.io/docs/changelog", kind: changelog }
  - provider: Cartesia
    provider_key: cartesia
    categories: [voice-sound]
    pages:
      - { name: Blog, url: "https://cartesia.ai/blog", kind: news }
  - provider: Hume AI
    provider_key: hume
    categories: [voice-sound]
    pages:
      - { name: Blog, url: "https://www.hume.ai/blog", kind: news }
  - provider: Resemble AI
    provider_key: resemble
    categories: [voice-sound]
    pages:
      - { name: Blog, url: "https://www.resemble.ai/blog/", kind: news }

discovery_only:
  - { name: Artificial Analysis, url: "https://artificialanalysis.ai/" }
  - { name: LMArena leaderboard, url: "https://lmarena.ai/leaderboard" }
  - { name: The Verge AI, url: "https://www.theverge.com/ai-artificial-intelligence" }
  - { name: TechCrunch AI, url: "https://techcrunch.com/category/artificial-intelligence/" }
```

OpenAI audio, Google voice, Google Veo/Lyria, and OpenAI Sora have no separate entries; they are covered by those companies' main pages above.

### 2.3 Reading sources for recency

- **Read newest-first.** Use a dated feed where one exists (RSS or Atom, a changelog, a dated release-notes list), otherwise the news page itself. Sort items by their official publication date, newest first, and keep reading until items are older than the period you need: the news window for the post, or the newest existing file of each model line for the sweep. Do not stop at the first screen of a page that paginates.
- **Take dates only from the official item:** the feed's `pubDate`, the page's visible date, or its `datePublished` metadata. If a date reached you any other way (an aggregator, a social post, a reviewer's note, your own memory), confirm it on the official item and record the official date. If they differ, the official date wins; mention the difference in `review_notes`. Example: GPT-6.1 Sol was reported as 2026-09-23, but OpenAI's feed dates "Introducing GPT-6.1 Sol" 2026-09-29.
- **Check the provider's whole lineup, not one page.** A provider can announce several lines at once ("Introducing GPT-6 Sol and Luna"; "Introducing Claude Fable 5.1 and Claude Mythos 5.1"). Every line named in an announcement is a separate release that needs its own file.
- **Record how far you read.** For every provider, note the newest official item you saw and its date; the run report needs it (section 9).

---

## 3. Weekly research workflow

Follow these steps in order on every run.

### 3.0 Freshness sweep (every run, before the news window)

The weekly post can only be as current as the files, so first make sure the files are current.

1. **List the model lines.** From the existing files, list every `family` (model line) per provider. Then add any line the provider currently offers that has no file. The provider's model list, changelog, or newest announcements show its current lineup.
2. **Find the newest release of each line.** Read the provider's sources newest-first (section 2.3) and identify the newest officially announced release of each line, with its official date.
3. **Compare with the files.** For each line:
   - If the newest release has no file, create one (steps 5–7 below), **even if it was announced before the news window**.
   - If a newer release exists than the newest file, create the new file and set `superseded_by: <new slug>` on the older file, with a dated "Update history" line. Never delete the older file.
   - If a file says a model is current but the provider has retired or replaced it, update `status` and `superseded_by` accordingly.
4. **Prices and plans.** For every file that is not superseded, re-read its pricing and plan sources when `checked_at` is older than 30 days, and update values that changed (with quotes and an "Update history" line).
5. **Report.** Fill the freshness table in the run report (section 9). A provider whose newest official item you could not read (blocked or failing source) is listed as **not verified**, never as up to date.

### 3.1 News window

1. **Discover.** Read every official page in section 2.2 for posts dated inside the window. Then scan the discovery-only sites for releases you missed.
2. **Qualify.** Keep only items that meet section 1.2. Assign each one category (section 1.1).
3. **Confirm.** Open the official announcement. Record its URL and publication date. If you cannot confirm it officially, add it to "Unconfirmed leads" and stop for that item.
4. **Match existing files.** Look in the model-file folder for a file with the same `provider_key` and model `slug`. Most releases in the window should already have a file from the freshness sweep.
   - **New version:** create a new file (section 4).
   - **Price, plan, availability, or status change to an existing release:** update that file in place and add a dated entry to "Update history" (section 6, item 10).
5. **Extract facts with quotes.** For every price, plan, benchmark, context window, and availability claim, copy the exact sentence from the official page into the structured block (section 5).
6. **Write the file.** Fill the front matter and both language bodies. New files always start as `review_status: draft`.
7. **Self-check.** Run the checklist in section 8 before saving.
8. **Report.** Produce the run report (section 9).

Never edit `rankings.yaml`. The Top 5 order on `/ai-models` is chosen by a person. You may *suggest* ranking changes in the run report.

---

## 4. Files and folders

- **Folder:** `frontend/content/ai-models/` (in the browser profile panel, select this folder).
- **One file per release.** Name: `YYYY-MM-DD_<provider_key>_<model-slug>.md`, using the official announcement date. When no official source states the date, use `undated_<provider_key>_<model-slug>.md` and rename the file once a date is confirmed.
  - Example: `2026-09-28_examplelab_nova-2-1.md`
  - `model-slug`: lowercase, ASCII, words joined by `-`, dots become `-` (`Nova 2.1` becomes `nova-2-1`).
- A new version (6.1 to 6.2) always gets a **new file**. Link versions with the same `family` value.
- Changes to an existing release update **the same file**. Change the value, set `checked_at`, and add a dated "Update history" line with the old and new values.
- `rankings.yaml` in the same folder holds the reviewed Top 5 order. Agents do not edit it.

### 4.1 `rankings.yaml`

The reviewed ranking editorial for `/ai-models`. A person edits it; agents only suggest changes in the run report. Leaderboard keys are the page's rankings (the coding leaderboard belongs to the `llm-agents` category, and music has separate vocal and instrumental leaderboards):

```yaml
schema: mablog-ai-rankings/1
scores_evaluated: 2026-09-22      # date the shown scores were reviewed
review_after_days: 45
leaderboards:
  coding:                         # coding | image | video | music-vocal | music-instrumental
    - slug: claude-fable-5-1      # must match a model file slug (or the built-in snapshot until files are reviewed)
      rank_reason:                # the "Why #N" text, both languages
        en: "..."
        es: "..."
      tie_note: null              # or { en: "...", es: "..." } when source ranges overlap
```

The list order is the displayed rank. Each leaderboard lists exactly five entries.

---

## 5. Front matter

Every file starts with YAML front matter between `---` lines. All keys below are required. The example uses a fictional company ("ExampleLab") and placeholder values; never copy its values into a real file. When a value is unknown, use `null` and make sure the body says "Not published"; never invent a value.

```yaml
---
schema: mablog-ai-model/1
review_status: draft            # draft | reviewed. Agents always write draft; a person sets reviewed.
slug: nova-2-1                  # the <model-slug> part of the file name; unique; also the /ai-models/<slug> URL
title_en: "ExampleLab Nova 2.1 brings ..."  # news-style headline, max 90 characters
title_es: "ExampleLab Nova 2.1 trae ..."
provider: ExampleLab
provider_key: examplelab        # from the source list in section 2.2
model: Nova 2.1                 # official model name, exact spelling
version: "2.1"
family: examplelab-nova         # model line without version numbers; the same for Nova 2.0, 2.1, 3 …
superseded_by: null             # slug of the newer release of this line once one exists, else null
category: llm-agents            # llm-agents | image | video | music | voice-sound
release_date: 2026-09-28        # official announcement date (ISO)
status: generally_available     # generally_available | preview | beta | deprecated | retired
access: [Subscription, API]     # any of: Free access, Subscription, API, Open weights, Regional access
regions: null                   # list of region names when access is region-limited, else null
accent: sage                    # crimson | gold | blue | sage | violet (badge colour on /ai-models)
context_window: 400000          # tokens; llm-agents only, else null
official_sources:
  - url: https://example.com/news/nova-2-1
    label: Announcement
    published: 2026-09-28
discovered_via: official        # official | artificialanalysis | lmarena | theverge | techcrunch | other
checked_at: 2026-10-05          # date the values below were last verified

pricing:                        # API list prices; empty list if not published
  - unit: per-1m-tokens         # see units below
    input: 10                   # numbers only, in `currency`
    output: 50
    amount: null                # used instead of input/output for non-token units
    currency: USD
    variant: null               # tier, resolution, or mode the price applies to
    source_url: https://example.com/...
    quote: "Exact sentence copied from the pricing page."
    evidence: null              # only for migrated values without a quote (section 5.4)

plans:                          # consumer or team plans that include the model
  - name: ExampleLab Plus
    price_monthly: 20
    currency: USD
    includes: [Nova 2.1, ExampleLab Code]
    limits: null                # published usage limits as text, else null
    regions: null
    source_url: https://example.com/...
    quote: "Exact sentence copied from the plan page."

benchmarks:
  - name: SWE-bench Verified    # benchmark or arena name
    metric: "% resolved"        # source-native metric
    score: "00.0"               # string, exactly as published (placeholder)
    confidence_interval: null   # e.g. "±9"
    samples: null               # e.g. "2,215 votes" or "500 tasks"
    source_rank: null           # e.g. "1–2" for arenas
    kind: self-reported         # self-reported | independent
    source_label: ExampleLab
    source_url: https://example.com/...
    measured_at: 2026-09-28
    quote: "Exact sentence or table cell containing the score."
    evidence: null              # only for migrated values without a quote (section 5.4)
    ranking: null               # coding | image | video | music-vocal | music-instrumental when this
                                # entry is the score shown on that /ai-models leaderboard, else null

review_notes: []                # optional: points the reviewer must check; empty the list when reviewed
---
```

### 5.0 Values that may be null

`release_date`, `version`, `context_window`, `regions`, and plan prices may be `null` when the official source does not state them; the body then says "Not published". Never fill them from memory or from an aggregator alone.

### 5.0.1 Model lines (`family`) and supersession

- `family` names the model **line**, without version numbers, prefixed with the provider when the name alone is ambiguous: `claude-opus`, `claude-fable`, `gpt-astra`, `gpt-sol`, `gpt-luna`, `grok`, `glm`, `gemini-omni-flash`, `suno`. Releases of the same line share it (GPT-6 Sol and GPT-6.1 Sol are both `gpt-sol`). Different lines from one provider never share it (Claude Opus and Claude Fable are separate lines).
- A variant sold as its own model (for example GLM-5.3-Flash next to GLM-5.3) is its own line when the provider lists it as a separate model with its own price.
- When a newer release of a line gets a file, set `superseded_by` on the previous newest file of that line to the new slug. Superseded files stay in the folder for history and keep their profile, but the weekly post and any ranking suggestion must use the newest release.

### 5.1 Price units

| Category      | `unit` values                                              |
| ------------- | ---------------------------------------------------------- |
| `llm-agents`  | `per-1m-tokens` (use `input` and `output`)                 |
| `image`       | `per-image`, `per-1k-images`                               |
| `video`       | `per-second`, `per-minute`                                 |
| `music`       | `per-song`, `per-minute`                                   |
| `voice-sound` | `per-1k-characters`, `per-minute`                          |

Copy the price exactly as published. Do not convert currencies or units. If the source uses a unit not listed here, use the closest listed unit only when the conversion is exact (for example 60 seconds = 1 minute); otherwise record `unit: other` and explain in `variant`.

### 5.2 Benchmarks

- Record **both** the company's own scores (`kind: self-reported`) and independent results (`kind: independent`), each with its source and date.
- Preferred benchmarks:
  - `llm-agents`: SWE-bench Verified, Terminal-Bench, Artificial Analysis Intelligence Index, Artificial Analysis Coding Agent Index
  - `image`: Artificial Analysis Text-to-Image Arena
  - `video`: Artificial Analysis Text-to-Video Arena (note whether the leaderboard is with or without audio)
  - `music`: Artificial Analysis Music Arena (Vocals and Instrumental separately)
  - `voice-sound`: Artificial Analysis Speech Arena
- Set `ranking:` on the independent leaderboard entry that `/ai-models` shows for that leaderboard (for example `ranking: coding`). Each leaderboard key appears at most once per file; a music file usually has two (`music-vocal` and `music-instrumental`).
- A benchmark with no published score is left out of `benchmarks` and shown as "Not published" in the body table. Never estimate, average, or round a score.

### 5.4 Migration rule (one time, 2026-10-02)

The first 20 files were migrated from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check, which stored values and source links but not quotes. For those carried-over values only:

- `quote: null` is allowed when the entry has `evidence: snapshot-2026-09-22` (benchmark scores) or `evidence: price-check-2026-10-01` (prices). The `source_url` still points to where the value was read.
- The next time such a value is refreshed, replace it with a quoted value and remove `evidence`.
- Every new value, in these files or any other, needs a quote. `evidence` is never used for new values.

---

## 6. Body template

After the front matter, write the English body, then the Spanish body. Use these headings exactly, in this order. Both languages contain the same facts.

```markdown
# English

## Summary
## Description
## What's new compared with the previous version
## Key capabilities
## Benchmarks
## Pricing and availability
## Limitations and caveats
## Best for users / best for developers
## Sources
## Update history

# Español

## Resumen
## Descripción
## Novedades respecto a la versión anterior
## Capacidades clave
## Benchmarks
## Precios y disponibilidad
## Limitaciones y advertencias
## Ideal para usuarios / ideal para desarrolladores
## Fuentes
## Historial de actualizaciones
```

What each section contains:

1. **Summary**, 100–200 words. What the model is, who made it, when it was released, what it is best at, and **how people can use it**: the plans and products that include it (for example "available in ChatGPT Plus and Pro, and in Codex" or "included in Claude Pro and Max, and in Claude Code"), plus API access. This text is reused in the weekly post.
2. **Description.** A fuller, neutral explanation of the model and its place in the provider's lineup.
3. **What's new compared with the previous version.** 3–6 bullet points. Name the previous version. For a provider's first model in a category, say so.
4. **Key capabilities.** Bullet points: modalities, context window, tools, languages, output length or resolution, and any secondary category.
5. **Benchmarks.** A table that **must match the `benchmarks` front matter exactly**:

   | Benchmark | Score | Kind | Source | Date |
   | --------- | ----- | ---- | ------ | ---- |

   Add a row reading "Not published" for any preferred benchmark (section 5.2) with no score.
6. **Pricing and availability.** API prices (matching `pricing`), plans (matching `plans`), access routes, regions, and status. Missing values say "Not published".
7. **Limitations and caveats.** Only limitations stated by the provider or shown by cited evidence: preview status, regional limits, known weaknesses, safety restrictions, deprecations.
8. **Best for users / best for developers.** Exactly two bullet points in this format, one sentence or short paragraph each:

   ```markdown
   - **Users:** interface, learning curve, plans.
   - **Developers:** API, integration, control, licence.
   ```

   In Spanish use `- **Usuarios:**` and `- **Desarrolladores:**`. `/ai-models` reads these two lines.
9. **Sources.** A numbered list of every URL used, each with its label and publication date.
10. **Update history.** One dated line per change, for example `2026-10-12 — API output price changed from $X to $Y per 1M tokens (source: …)`. On a new file write `2026-10-05 — File created.`

---

## 7. Writing and evidence rules

- **Every number has a source.** Each price, score, date, limit, and context window must appear in the front matter with `source_url` and an exact `quote`. A value without a quote is written "Not published".
- **Quotes are exact and short:** copy the sentence or table cell as published, at most 25 words. Do not paraphrase inside `quote`.
- **Neutral tone.** No marketing language ("revolutionary", "game-changing", "best ever", "mind-blowing", and similar). Attribute claims: "OpenAI says…", "according to Artificial Analysis…".
- **Label who measured what.** Self-reported results are always called self-reported in the body text, never presented as independent tests.
- **Do not copy articles.** Write in your own words; only `quote` fields contain copied text.
- **Dates** use ISO format (`2026-09-28`) in front matter and readable dates in the body.
- **Currencies** stay as published; do not convert.
- **No logos or downloaded images** in model files. The `/ai-models` page draws its own badges from `accent`.
- **Spanish** is natural Spanish (Spain), not a word-for-word translation, with identical facts and numbers.

---

## 8. Self-check before saving a file

- [ ] File name matches `YYYY-MM-DD_<provider_key>_<model-slug>.md` and `slug`.
- [ ] `review_status` is `draft` (agents never set `reviewed`).
- [ ] **Newest release:** reading the provider's sources newest-first found no newer release of this `family`. If one exists, write that file instead and mark this one `superseded_by`.
- [ ] `release_date` was read from the official item itself, not from an aggregator, a reviewer's note, or memory.
- [ ] `category`, `status`, `access`, `accent`, and price `unit` use only the allowed values.
- [ ] Every `pricing`, `plans`, and `benchmarks` entry has `source_url` and an exact `quote`.
- [ ] The Benchmarks table and the Pricing section match the front matter exactly.
- [ ] Summary is 100–200 words in each language and names the plans or products that include the model.
- [ ] Both language bodies contain the same facts and numbers.
- [ ] Missing values say "Not published"; nothing is estimated.
- [ ] At least one official source is listed, and no aggregator is the only source for the release.
- [ ] "Update history" has a dated line for this change.

---

## 9. Run report

End every run with a report (in the newsroom run detail, or as `_run-report_YYYY-MM-DD.md` in the folder when run by hand):

- **Window:** start and end dates, and whether this was a catch-up run.
- **Freshness table:** one row per provider, with the newest official item read (title, date, link), the newest release per model line, the newest file per line, and a status: `up to date`, `file created`, `superseded`, or `not verified` (source blocked or failing). Every provider in section 2.2 appears, including those with nothing new.
- **Created files:** file names.
- **Updated files:** file names with a one-line change summary.
- **Unconfirmed leads:** releases seen only on aggregators, with the link where they were seen.
- **Skipped:** sources that could not be read (with the error) and items excluded by section 1.2, with the reason.
- **Suggested ranking changes:** proposals for `rankings.yaml` with evidence. A person decides.
- **Budget:** estimated cost of the run, and any category skipped because the budget cap was reached.

---

## 10. Weekly news post

Built from the model files after the run.

- **One roundup per week**, bilingual, with one section per category in this order: Language models & agents, Image, Video, Music, Voice & sound. Leave out categories with no news that week.
- Each release gets a short entry based on its file's Summary and "What's new", with its key price and plan facts, and a link to its `/ai-models/<slug>` profile. Every reviewed file has a profile; models outside the Top 5 are marked "Not ranked in this edition".
- Draft files can be used as leads, but every claim in the published post must still pass the newsroom's normal check against official sources.
- **Cover:** every weekly post uses the same fixed "MABlog AI Newsletter" cover image (generated once in stage 2). Model files never get their own cover.
- The homepage carousel still shows at most one AI-news card.

### 10.1 Cover image prompt (used once, in stage 2)

> Editorial cover illustration for "MABlog AI Newsletter". Warm parchment and deep night-sky palette: crimson (#993c3d), antique gold (#c28a32) and ink black. A rotated square crimson seal containing a serif letter "M" at the centre, surrounded by thin gold orbital rings and a soft star field, evoking a celestial almanac. Elegant, calm, premium, minimal. No company logos, no robot or brain clichés, no screenshots, no readable text other than the seal letter. 16:9, 1600×900.

---

## 11. Budget

- The newsroom's caps stay at **USD 2 per run** and **USD 10 per month**. They are never exceeded.
- If a run reaches the cap, finish the current file, then cover the remaining categories in priority order, skipping the rest and recording them in the run report. **Proposed default priority:** Language models & agents, Video, Image, Voice & sound, Music.
- After the first real preview run with these instructions, the owner reviews the measured cost and decides whether to change the caps.

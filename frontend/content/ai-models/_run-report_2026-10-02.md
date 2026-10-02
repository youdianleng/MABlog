# Run report — 2026-10-02 (manual freshness sweep)

Run by hand with instructions v1.2 after a review found the files missing recent releases. The loader on `/ai-models` ignores files whose name starts with `_`, so this report is never parsed as a model file.

## Window

- **Freshness sweep:** releases announced from 2026-08-27 to 2026-10-02, plus a check that every existing model line points to its newest release.
- **News window:** not run. No weekly post was written; this run only brings the model files up to date.
- **Catch-up run:** yes, the first run with the v1.2 freshness rules.

## Freshness table

Statuses: `file created` (new file this run), `superseded` (older file now points to a newer one), `up to date` (newest official item read, no newer model release), `not verified` (source blocked, rendered by script, or not read far enough).

The sweep ran in two batches on the same day. The table shows the state after the second batch; files from the second batch are marked with (2).

| Provider | Newest official item read | Newest release per line | Newest file per line | Status |
| --- | --- | --- | --- | --- |
| OpenAI | RSS: "Introducing GPT-6.1 Sol", 2026-09-29 | GPT-6.1 Sol (2026-09-29); GPT-6 Luna (2026-09-22); GPT-6 Astra (2026-09-03); GPT-Live-1 (2026-09-10); GPT Image 2.5 Sunburst | gpt-6-1-sol, gpt-6-luna, gpt-6-astra, gpt-live-1, gpt-image-2-5-sunburst | file created; gpt-6-sol superseded |
| Anthropic | News: "Introducing Claude Opus 5.5", 2026-09-22 | Claude Opus 5.5 (2026-09-22); Claude Fable 5.1 (2026-09-01) | claude-opus-5-5, claude-fable-5-1 | file created |
| Google | Gemini API changelog: 3.8 Flash TTS / Flash-Lite TTS, 2026-09-22 | Gemini 3.8 Flash (09-02); Omni Flash 1.1 (08-27); Lyria 3.5 (09-03); 3.8 Live (09-15); 3.8 Flash TTS (09-22) | gemini-3-8-flash, gemini-omni-1-1-flash, lyria-3-5, nano-banana-2, gemini-3-8-live (2), gemini-3-8-live-extended-thinking (2), gemini-3-8-flash-tts (2), gemini-3-8-flash-lite-tts (2) | file created; gemini-omni-flash and lyria-3-pro superseded |
| xAI | Not readable (blocked) | Grok 4.7 (2026-09-21) per the existing file | grok-4-7, grok-imagine-image-2 | not verified |
| DeepSeek | API change log: DeepSeek-V4.1-Flash, 2026-09-10 | DeepSeek-V4.1-Flash (2026-09-10) | deepseek-v4-1-flash | file created |
| Meta | No new posts in the items read | Muse Spark 1.3, Muse Image | muse-spark-1-3, muse-image | up to date |
| Mistral AI | News: Munich hub, 2026-09-28 (company news only) | No model release in the window | — | up to date |
| Alibaba (Qwen / Wan) | Model Studio release list, updated 2026-09-28 | qwen3.8-omni-flash-realtime (2026-09-21), qwen3.8-omni-flash (2026-09-17), qwen-audio-3.1-realtime-plus (2026-09-20) | wan-3, qwen3-8-omni-flash (2), qwen3-8-omni-flash-realtime (2), qwen-audio-3-1-realtime-plus (2) | file created (Qwen lines); Wan not verified |
| Moonshot AI (Kimi) | Not readable (script-rendered) | — | — | not verified |
| Z.ai (GLM) | No dated items in the page text | GLM-5.3 per the existing file | glm-5-3 | not verified |
| Midjourney | Not readable | — | — | not verified |
| Black Forest Labs | Blog: "Introducing FLUX 3 Action", 2026-09-23 (robotics, excluded) | FLUX 3 Image (date not read) | — | not verified (FLUX 3 Image has no file) |
| Ideogram | Only seen on Recraft's blog ("Ideogram 4.5 is coming to Recraft Studio") | — | — | not verified |
| Recraft | Blog: "Meet Recraft V4.1 Flash", 2026-09-23 | Recraft V4.1 Flash (2026-09-23); Recraft V4.1 (2026-05-14) | recraft-v4-1-flash, recraft-v4-1 (2) | file created |
| Stability AI | Not readable | — | — | not verified |
| Microsoft AI (MAI) | Blog index, modified 2026-10-01; no new model found | MAI-Image-2.6 (2026-07-23) | mai-image-2-6 | not verified |
| Runway | News: "Introducing Runway Ads" and "Introducing Praxis-1" (robotics), 2026-09-30 | No new video model | — | up to date |
| Kuaishou (Kling) | Not read this run | Kling 3 per the existing file | kling-3 | not verified |
| Luma AI | Blog posts, 2026-10-02 (guides only) | No model release in the items read | — | up to date |
| MiniMax | Blog: "MiniMax Music 3.0", 2026-08-13 | MiniMax M3 (undated), Speech 2.8 (2026-01-23), Music 3.0 (2026-08-13), H3 | minimax-h3, minimax-m3 (2), minimax-speech-2-8 (2), minimax-music-3 (2) | file created; minimax-music superseded; M3 date not published |
| ByteDance Seed | No dated items in the page text | Seedance 2.0 per the existing file; Seedance 2.5 only on aggregators | seedance-2 | not verified |
| Pika | Blog: "Welcome to the New Pika", 2026-09-17 (platform release) | No new model | — | up to date |
| StepFun | Not read this run | StepAudio 3 Music per the existing file | stepaudio-3-music | not verified |
| Suno | Blog: "Introducing Speech (beta)", 2026-10-01 (feature) | Suno v6 (2026-09-09) | suno-v6 | file created; suno-v5-5 superseded |
| Udio | Not readable | — | — | not verified |
| Mureka | Not read this run | Mureka V9 per the existing file | mureka-v9 | not verified |
| ElevenLabs | Blog: "Introducing Eleven v4", 2026-09-28 | Eleven v4 and Eleven v4 Turbo (2026-09-28) | eleven-v4, eleven-v4-turbo (2) | file created |
| Cartesia | Blog: "Introducing Multilingual Voices", 2026-09-23 (feature) | Sonic-3.6 (2026-08-27 on the post; the blog index shows Sep 3) | sonic-3-6 (2) | file created |
| Hume AI | Not readable | — | — | not verified |
| Resemble AI | Blog: Deepfake Watchlist, 2026-10-01 | No model release in the items read | — | up to date |

## Created files (12, all `review_status: draft`)

- `2026-09-22_anthropic_claude-opus-5-5.md`
- `2026-09-22_openai_gpt-6-sol.md` (created already superseded by GPT-6.1 Sol, so the line history is complete)
- `2026-09-22_openai_gpt-6-luna.md`
- `2026-09-29_openai_gpt-6-1-sol.md`
- `2026-09-10_openai_gpt-live-1.md`
- `2026-09-02_google_gemini-3-8-flash.md`
- `2026-08-27_google_gemini-omni-1-1-flash.md`
- `2026-09-03_google_lyria-3-5.md`
- `2026-09-09_suno_suno-v6.md`
- `2026-09-28_elevenlabs_eleven-v4.md`
- `2026-09-23_recraft_recraft-v4-1-flash.md`
- `2026-09-10_deepseek_deepseek-v4-1-flash.md`

Every price, plan, and benchmark quote was checked verbatim against the saved page text, and every summary is 100–200 words in both languages.

## Created files, second batch (13, all `review_status: draft`)

- `2026-09-15_google_gemini-3-8-live.md`
- `2026-09-15_google_gemini-3-8-live-extended-thinking.md`
- `2026-09-22_google_gemini-3-8-flash-tts.md`
- `2026-09-22_google_gemini-3-8-flash-lite-tts.md`
- `2026-09-28_elevenlabs_eleven-v4-turbo.md`
- `2026-08-27_cartesia_sonic-3-6.md`
- `2026-09-17_alibaba_qwen3-8-omni-flash.md`
- `2026-09-21_alibaba_qwen3-8-omni-flash-realtime.md`
- `2026-09-20_alibaba_qwen-audio-3-1-realtime-plus.md`
- `undated_minimax_minimax-m3.md` (the model page gives no release date)
- `2026-01-23_minimax_minimax-speech-2-8.md` (older than the window, but still MiniMax's newest speech model)
- `2026-08-13_minimax_minimax-music-3.md`
- `2026-05-14_recraft_recraft-v4-1.md` (older than the window; the main model of the line that V4.1 Flash belongs to)

The same quote and word-count checks were run on the second batch.

## Updated files

- `2026-03-26_suno_suno-v5-5.md` — `superseded_by: suno-v6`.
- `undated_google_lyria-3-pro.md` — `superseded_by: lyria-3-5`.
- `undated_google_gemini-omni-flash.md` — `superseded_by: gemini-omni-1-1-flash`.
- `undated_minimax_minimax-music.md` — `superseded_by: minimax-music-3` (second batch).
- `2026-09-28_elevenlabs_eleven-v4.md` and `2026-09-23_recraft_recraft-v4-1-flash.md` — review notes now point to the new Turbo and V4.1 files (second batch).
- `2026-09-03_openai_gpt-6-astra.md` (renamed from `undated_openai_gpt-6-astra.md`) — `release_date: 2026-09-03` from the RSS item "GPT-6 Astra: A new generation of intelligence"; the 2026-09-09 item is a follow-up business post.

## Found but not filed

None. Every release listed in the first batch's "found but not filed" list now has a file (second batch, same day). Remaining gaps are the `not verified` providers in the freshness table and older lines without files (Nano Banana 2 Lite, GLM-5.3-Flash, FLUX 3 Image).

## Unconfirmed leads

- Seedance 2.5 (ByteDance Seed): seen on aggregators only; no official page found.
- Ideogram 4.5: Recraft's blog says it "is coming" to Recraft Studio; no Ideogram announcement read.

## Skipped

- **Sources not readable:** x.ai (blocked), Kimi, Midjourney, Stability AI, Udio, Hume AI, and the Z.ai and ByteDance Seed news pages (script-rendered, no dated items in the text). OpenAI announcement pages block scripts; their dates come from the official RSS feed.
- **Excluded by section 1.2:**
  - Claude Mythos 5.1: trusted access only, not generally available.
  - FLUX 3 Action and Runway Praxis-1: robotics models, outside the five categories.
  - Suno Speech (beta) and Cartesia Multilingual Voices: product features, not new models.
  - The new Pika: a platform release with no named model.
  - Nano Banana 2 Lite and GLM-5.3-Flash: variants of lines that have no file yet; recorded as gaps.

## Suggested ranking changes (a person decides)

- **Coding:** consider Claude Opus 5.5 and GPT-6.1 Sol once an independent Coding Agent Index score exists. Anthropic self-reports 66.4% on Terminal-Bench 4.0 for Opus 5.5, against 57.9% for GPT-6 Astra as reported by OpenAI.
- **Music (vocal and instrumental):** Suno v5.5, Lyria 3 Pro and MiniMax Music (2.6 link) are now superseded. Re-check the Artificial Analysis Music Arena for Suno v6, Lyria 3.5 and MiniMax Music 3.0 before the next ranking review.
- **Video:** Gemini Omni Flash is superseded by 1.1. Check which version the arena entry scored before moving the ranking.

## Budget

Run by hand in a Claude Code session, not through the newsroom, so the newsroom's token budget did not apply. No category was skipped for budget.

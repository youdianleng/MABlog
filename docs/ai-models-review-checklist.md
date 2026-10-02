# AI model files: review checklist (stage 2, 2026-10-02)

The 20 files in `frontend/content/ai-models/` start as `review_status: draft`, so `/ai-models` still shows the built-in 2026-09-22 snapshot. Review a file, set `review_status: reviewed`, and empty its `review_notes` to switch that model's facts, score, and price to the file. The change appears on the next page request; a frontend rebuild is needed only for the Docker image copy.

**Reviewing in the browser:** administrators can open **Model review** in the side menu (`/admin/ai-models`) to read each file's facts, sources, and both languages, then approve it or return it to draft. Approval clears `review_notes` and keeps the accepted notes in the file's update history; commit the changed files afterwards.

**Newer releases found on 2026-10-02:** the first 20 files describe the models ranked in the 2026-09-22 snapshot, not the newest releases.
- Anthropic announced Claude Opus 5.5 (2026-09-22) and Claude Mythos 5.1 (2026-09-01).
- OpenAI announced GPT-6 Sol and Luna (2026-09-22) and GPT-6.1 Sol (2026-09-29).

**Freshness sweep run on 2026-10-02:** 25 new draft files were added in two batches; they are listed at the end of this checklist. Suno V5.5, Lyria 3 Pro, Gemini Omni Flash, and MiniMax Music are now `superseded_by` newer files. Claude Mythos 5.1 was excluded (trusted access only). Sources that could not be read are in `frontend/content/ai-models/_run-report_2026-10-02.md`.

How the values were gathered:

- **Scores** (`evidence: snapshot-2026-09-22`) and **comparison prices** (`evidence: price-check-2026-10-01`) are carried over from reviewed data without quotes (migration rule, instructions section 5.4).
- **Every other value has an exact quote**, checked word for word against the official page's raw text on 2026-10-02. One exception: the Muse Image availability quote, read through a web reader because Meta blocks scripted requests.
- **Summaries** use only these facts, the snapshot's descriptions and verdicts, and the ranking data.

### Seedance 2.0 — `2026-02-12_bytedance-seed_seedance-2.md`

- [ ] Check new facts against the linked official sources: release date 2026-02-12.
- [ ] Artificial Analysis now also lists a newer Dreamina Seedance 2.5; this file covers the ranked 2.0 version.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Suno V5.5 — `2026-03-26_suno_suno-v5-5.md`

- [ ] Check new facts against the linked official sources: release date 2026-03-26.
- [ ] Superseded by Suno v6 (2026-09-09, file suno-v6); Suno says it will retire previous models as v6 rolls out. Consider a ranking review.
- [ ] Release date taken from the post's datePublished metadata (2026-03-26).
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Muse Image — `2026-07-07_meta_muse-image.md`

- [ ] Check new facts against the linked official sources: release date 2026-07-07.
- [ ] Meta's page blocks scripted reading; the date and quote were read through a web reader and could not be checked against raw page text.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### MAI-Image-2.6 — `2026-07-23_microsoft-ai_mai-image-2-6.md`

- [ ] Check new facts against the linked official sources: release date 2026-07-23.
- [ ] Release date taken from the model page's datePublished metadata (2026-07-23).
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### MiniMax H3 — `2026-08-03_minimax_minimax-h3.md`

- [ ] Check new facts against the linked official sources: release date 2026-08-03.
- [ ] 2026-08-03 is the open-source release date from the article metadata; an earlier closed release may exist.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Grok Imagine Image 2.0 — `2026-08-07_xai_grok-imagine-image-2.md`

- [ ] Check new facts against the linked official sources: release date 2026-08-07.
- [ ] Release date taken from the announcement page's datePublished metadata (2026-08-07).
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### GLM-5.3 — `2026-08-18_zai_glm-5-3.md`

- [ ] Check new facts against the linked official sources: release date 2026-08-18; context window 1,000,000; price "GLM-5.3 $1.4 $0.26 Limited-time Free $4.4"; plan GLM Coding Plan $18/month.
- [ ] Some aggregators report a 2026-08-14 release; the official release notes date it 2026-08-18.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Claude Fable 5.1 — `2026-09-01_anthropic_claude-fable-5-1.md`

- [ ] Check new facts against the linked official sources: release date 2026-09-01; price "Cache reads now cost $0.25 per million tokens, 75% less than Fable 5"; plan Claude Pro $20/month; plan Claude Max $100/month; plan Claude Team (standard seat) $25/month.
- [ ] Plan inclusion of Claude Fable 5.1 comes from the announcement sentence 'available to Pro, Max, Team, and Enterprise users'; Claude Code inclusion comes from the Pro feature list on claude.com/pricing.
- [ ] Context window is not stated on the announcement page.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### GPT Image 2.5 Sunburst — `2026-09-08_openai_gpt-image-2-5-sunburst.md`

- [ ] Check new facts against the linked official sources: release date 2026-09-08; price "Price $5 • $30 Input • Output".
- [ ] Release date is the dated snapshot ID (gpt-image-2.5-sunburst-2026-09-08), not an announcement post.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Grok 4.7 — `2026-09-21_xai_grok-4-7.md`

- [ ] Check new facts against the linked official sources: release date 2026-09-21; context window 500,000; plan Grok Build (price not in page text); plan Cursor (price not in page text).
- [ ] Release date taken from the announcement page's datePublished metadata (2026-09-21).
- [ ] The Grok app lists Grok 4.7 for its Expert and Heavy modes behind an upgrade, but SuperGrok prices are not in the page text; check in a browser if you want them listed.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Wan 3.0 — `undated_alibaba_wan-3.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] The official repository gives no announcement date (it was created on 2026-08-11); release_date left null.
- [ ] Licence shown on the repository: Apache-2.0.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Gemini Omni Flash — `undated_google_gemini-omni-flash.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] Superseded by Gemini Omni Flash 1.1 (GA 2026-08-27, file gemini-omni-1-1-flash); the preview endpoint was scheduled for deprecation on 2026-09-30. The 2026-09-22 ranking scored this file; check which version the arena used before moving the ranking.
- [ ] Price is not published for the ranked version; the source lists a price only for the 1.1 release.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Lyria 3 Pro — `undated_google_lyria-3-pro.md`

- [ ] Check new facts against the linked official sources: price "Lyria 3 Pro Preview (Full Song) Not available $0.08 per song".
- [ ] The docs give only 'Latest update March 2026', not a release day.
- [ ] Google now publishes $0.08 per song; music had no comparable prices when the 2026-10-01 price check ran.
- [ ] Superseded by Lyria 3.5 (GA 2026-09-03, file lyria-3-5); the pricing page now lists Lyria 3 previews as legacy models. Consider a ranking review.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Nano Banana 2 — `undated_google_nano-banana-2.md`

- [ ] Check new facts against the linked official sources: price "$0.50 (text/image) Output price Not available $3 (text and thinking) $60.00 (images)".
- [ ] The docs give only 'Latest update February 2026', not a release day, so release_date is null.
- [ ] Gemini app plan inclusion (free and Google AI plans) was not confirmed in page text for this model; check before marking reviewed.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Kling 3.0 — `undated_kling_kling-3.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] Kling's official pages load their content by script; no new facts could be read, so only the snapshot values are included.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Muse Spark 1.3 — `undated_meta_muse-spark-1-3.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] No official Meta announcement for Muse Spark 1.3 was found (Meta's blog index shows Muse Spark 1.1). Axios reports a 2026-09-02 release; release date left null under the official-source rule.
- [ ] The migrated API price comes from independent price trackers, not a Meta page.
- [ ] The snapshot's official link (ai.meta.com/llama) is a general page; replace it with the Muse Spark 1.3 announcement when available.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### MiniMax Music — `undated_minimax_minimax-music.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] The snapshot's official link is the MiniMax Music 2.6 post (2026-04-10). MiniMax Music 3.0 (2026-08-13, file minimax-music-3) is now the newest release, so this file is superseded. Confirm which version the 2026-09-22 ranking scored before moving the ranking.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Mureka V9 — `undated_mureka_mureka-v9.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] Mureka's site exposes no readable model details and has no news page; only snapshot values are included.
- [ ] Aggregators report newer Mureka V9.5 and O3 models; consider a ranking review.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### GPT-6 Astra — `2026-09-03_openai_gpt-6-astra.md`

- [ ] Check new facts against the linked official sources: context window 1,050,000; plan ChatGPT Plus (price not in page text); plan ChatGPT Pro (price not in page text).
- [ ] Release date from the OpenAI news RSS item "GPT-6 Astra: A new generation of intelligence" (2026-09-03); the announcement page blocks scripts and was not read.
- [ ] ChatGPT plan prices are rendered per region by script and are not in the page text; check them in a browser before marking reviewed.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### StepAudio 3 Music — `undated_stepfun_stepaudio-3-music.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] The official promo page has no date or prices; release_date left null.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

## Freshness sweep files (added 2026-10-02)

These files were written from official sources only. Every quote was checked verbatim against the saved page text; none of them is ranked.

### Claude Opus 5.5 — `2026-09-22_anthropic_claude-opus-5-5.md`

- [ ] Context window is not stated in the announcement; check the Claude model overview before review.
- [ ] Claude plan prices are not in the announcement; the plan entry records the higher usage limits only.
- [ ] Not ranked: rankings.yaml is human-curated. Consider it for the coding leaderboard once an independent Coding Agent Index score exists.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### GPT-6 Sol — `2026-09-22_openai_gpt-6-sol.md`

- [ ] Release date from the OpenAI news RSS item "Introducing GPT-6 Sol and Luna" (2026-09-22); the announcement page blocks scripts and was not read.
- [ ] Superseded by GPT-6.1 Sol (2026-09-29); the model page says: "See GPT-6.1 Sol for the newer Sol model."
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### GPT-6 Luna — `2026-09-22_openai_gpt-6-luna.md`

- [ ] Release date from the OpenAI news RSS item "Introducing GPT-6 Sol and Luna" (2026-09-22); the announcement page blocks scripts and was not read.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### GPT-6.1 Sol — `2026-09-29_openai_gpt-6-1-sol.md`

- [ ] Release date from the OpenAI news RSS item "Introducing GPT-6.1 Sol" (2026-09-29), not 2026-09-23 as first reported; the announcement page blocks scripts and was not read.
- [ ] The one-fifth claim comes from the RSS description: "Meet GPT-6.1 Sol: near-Astra intelligence for coding, computer use, and professional work at one-fifth of Astra’s standard API input and output token prices."
- [ ] Not ranked: consider it for the coding leaderboard once an independent Coding Agent Index score exists.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### GPT-Live-1 — `2026-09-10_openai_gpt-live-1.md`

- [ ] Release date from the OpenAI news RSS item "Build more natural voice experiences with GPT‑Live‑1 in the API" (2026-09-10). The two announcement URLs were taken from the RSS feed; the pages block scripts and were not read.
- [ ] Category: voice-sound (real-time speech to speech). It is not a text-to-speech model, so Speech Arena results may never apply.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Gemini 3.8 Flash — `2026-09-02_google_gemini-3-8-flash.md`

- [ ] Each pricing entry quotes one row of the pricing table: the first quotes the input row, the second the output row; both rows were read together.
- [ ] Context window and Gemini app availability were not checked; read the Gemini 3.8 Flash model page before review.
- [ ] Previous release of the line: Gemini 3.7 Flash (2026-08-13), which has no file.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Gemini Omni Flash 1.1 — `2026-08-27_google_gemini-omni-1-1-flash.md`

- [ ] The 2026-09-22 ranking scored the earlier Gemini Omni Flash (gemini-omni-flash.md); it is not clear whether the arena entry already used 1.1. Check the arena before moving the ranking to this file.
- [ ] The same price row is published for the 1.1 release and the preview, so the price is unchanged.
- [ ] Gemini app availability was not checked.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Lyria 3.5 — `2026-09-03_google_lyria-3-5.md`

- [ ] Family kept as lyria-pro: Google names 3.5 without "Pro", but it is the full-song successor of the Lyria 3 Pro preview, which the pricing page now lists among "Google's family of legacy music generation models."
- [ ] Gemini app availability was not checked.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Suno v6 — `2026-09-09_suno_suno-v6.md`

- [ ] One file covers the v6 generation (v6, v6-wild and v6-mini), because Suno announced them as one release of three models for different plans. Split into separate files if a reviewer prefers.
- [ ] Plan prices were not read; check suno.com/pricing before review.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Eleven v4 — `2026-09-28_elevenlabs_eleven-v4.md`

- [ ] ElevenLabs says the model is ranked #1 by Artificial Analysis; no score was recorded because the arena page was not read. Read it before review.
- [ ] Eleven v4 Turbo was announced in the same post and has its own file (eleven-v4-turbo).
- [ ] Prices and plans were not read; check elevenlabs.io/pricing before review.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Recraft V4.1 Flash — `2026-09-23_recraft_recraft-v4-1-flash.md`

- [ ] The 1.3-second figure is Recraft's own median measurement: "Recraft V4.1 Flash is the fastest model on the market at 1.3 seconds from prompt to image."
- [ ] Access and prices for Flash specifically were not stated in the post; the site navigation says Recraft's models are available in Recraft Studio and via API. Check the API pricing page before review.
- [ ] Recraft V4.1 (the full model, 2026-05-14) has its own file (recraft-v4-1).
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### DeepSeek-V4.1-Flash — `2026-09-10_deepseek_deepseek-v4-1-flash.md`

- [ ] The price quote is part of the pricing table: the first value after each PEAK label is the V4.1 Flash column ($0.3 input on cache miss, $1.2 output).
- [ ] Open-weights availability and the DeepSeek chat app were not checked.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

## Freshness sweep files, second batch (added 2026-10-02)

Same checks as the first batch: quotes verified verbatim against saved page text, none ranked.

### Gemini 3.8 Live — `2026-09-15_google_gemini-3-8-live.md`

- [ ] The pricing entry quotes the output row of the shared Live pricing table; the $3.00 audio input price is in the input row: "Input price Free of charge $0.75 (text) $3.00 or $0.005/min (audio) $1.00 or $0.002/min (image/video)".
- [ ] Gemini app availability was not checked.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Gemini 3.8 Live Extended Thinking — `2026-09-15_google_gemini-3-8-live-extended-thinking.md`

- [ ] The pricing entry quotes the output row of the shared Live pricing table; the $3.00 audio input price is in the input row: "Input price Free of charge $0.75 (text) $3.00 or $0.005/min (audio) $1.00 or $0.002/min (image/video)".
- [ ] Google lists this model in the same pricing row as Gemini 3.8 Live, so the prices are shared.
- [ ] First release of this line; no earlier Extended Thinking Live model was found.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Gemini 3.8 Flash TTS — `2026-09-22_google_gemini-3-8-flash-tts.md`

- [ ] The pricing entry quotes the output row; the $0.50 text input price is in the input row: "Input price Free of charge $0.50 (text) through December 31, 2026. $1.00 (text) starting January 1, 2027."
- [ ] Gemini app availability was not checked.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Gemini 3.8 Flash-Lite TTS — `2026-09-22_google_gemini-3-8-flash-lite-tts.md`

- [ ] The pricing entry quotes the output row; the $0.50 text input price is in the input row, which is the same as for Gemini 3.8 Flash TTS.
- [ ] Gemini app availability was not checked.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Eleven v4 Turbo — `2026-09-28_elevenlabs_eleven-v4-turbo.md`

- [ ] Announced in the same post as Eleven v4; one file per release (instructions 2.3).
- [ ] The two posts give different latency figures: ~100 ms median inference latency and ~150 ms median time to first speech. Both are recorded.
- [ ] Prices and plans were not read; check elevenlabs.io/pricing before review.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Sonic-3.6 — `2026-08-27_cartesia_sonic-3-6.md`

- [ ] Release date from the post itself ("Aug 27, 2026" and datePublished 2026-08-27); Cartesia's blog index shows Sep 3, 2026 next to the card.
- [ ] Cartesia says Sonic-3.6 is #1 on the Artificial Analysis leaderboard; no score was recorded because the arena page was not read.
- [ ] Prices were not read; check cartesia.ai/pricing before review.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Qwen3.8-Omni-Flash — `2026-09-17_alibaba_qwen3-8-omni-flash.md`

- [ ] The International price row has three values; by the column order of the other regional tables they are input, cache-hit input and output per 1M tokens. Confirm the column headers in a browser.
- [ ] Only the Model Studio release list and pricing page were read; no announcement post or context window was found.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Qwen3.8-Omni-Flash-Realtime — `2026-09-21_alibaba_qwen3-8-omni-flash-realtime.md`

- [ ] Price columns (Singapore table): input text/images/video 0.23, input audio 0.93, output text 0.70, output audio 1.87 USD per 1M tokens; the comparable entry uses the audio columns.
- [ ] Only the Model Studio release list and pricing page were read; no announcement post was found.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Qwen-Audio-3.1-Realtime-Plus — `2026-09-20_alibaba_qwen-audio-3-1-realtime-plus.md`

- [ ] Price columns: input text 0.8, input audio 6.4, output text 6.4, output audio 24 USD per 1M tokens; the comparable entry uses the audio columns.
- [ ] The 262,144-token context window is from the release list; context_window stays null because the field is for llm-agents files only.
- [ ] Only the Model Studio release list and pricing page were read; no announcement post was found.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### MiniMax M3 — `undated_minimax_minimax-m3.md`

- [ ] Release date not published on the model page; find the dated announcement before review.
- [ ] The BrowseComp measured_at is the date the page was read (2026-10-02), because the page has no date.
- [ ] The page compares M3 with Opus 4.7 and GPT-5.5, which suggests it predates the September 2026 frontier releases.
- [ ] The page says M3 "will soon be fully open-sourced on HuggingFace and GitHub", so access does not list Open weights yet.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### MiniMax Speech 2.8 — `2026-01-23_minimax_minimax-speech-2-8.md`

- [ ] Release date from the page's datePublished metadata (2026-01-23). This is outside the sweep window but is still MiniMax's newest speech model in its site menu, so the line gets a file.
- [ ] Access: the page links to "Access API" and "Try Audio Now"; confirm whether MiniMax Audio is free before review.
- [ ] Prices were not read.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### MiniMax Music 3.0 — `2026-08-13_minimax_minimax-music-3.md`

- [ ] Access is based on the post's title and "Open Weights" tag; the post text read did not include a weights link, licence, API or app availability. Check before review.
- [ ] The ranked file minimax-music.md links the Music 2.6 post; it is now superseded by this file. Check which version the 2026-09-22 arena entry scored before moving the ranking.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

### Recraft V4.1 — `2026-05-14_recraft_recraft-v4-1.md`

- [ ] Release date 2026-05-14 is outside the sweep window; the file was added because Recraft V4.1 Flash (2026-09-23) is a variant of this line.
- [ ] A Recraft press release says V4.1 Utility Pro became the highest-ranked text-to-image model outside Google and OpenAI; it was found by search and not read.
- [ ] Access: the post says "Start creating via our API or in Recraft Studio" and "get started for free". Prices were not read.
- [x] Marked `review_status: reviewed` with empty `review_notes` on 2026-10-02 at the site owner's request. The open points above were accepted as caveats and remain to be checked.

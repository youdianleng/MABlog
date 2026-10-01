# AI model files: review checklist (stage 2, 2026-10-02)

The 20 files in `frontend/content/ai-models/` start as `review_status: draft`, so `/ai-models` still shows the built-in 2026-09-22 snapshot. Review a file, set `review_status: reviewed`, and empty its `review_notes` to switch that model's facts, score, and price to the file. The change appears on the next page request; a frontend rebuild is needed only for the Docker image copy.

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
- [ ] Suno released v6 on 2026-09-09 and its pricing page now lists v6 models for paid plans; consider a new v6 file and a ranking review.
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
- [ ] The docs now describe gemini-omni-1.1-flash, while the 2026-09-22 ranking scored the earlier Gemini Omni Flash. Decide whether this file should track 1.1 (new file) or stay on the ranked version.
- [ ] Price is not published for the ranked version; the source lists a price only for the 1.1 release.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Lyria 3 Pro — `undated_google_lyria-3-pro.md`

- [ ] Check new facts against the linked official sources: price "Lyria 3 Pro Preview (Full Song) Not available $0.08 per song".
- [ ] The docs give only 'Latest update March 2026', not a release day.
- [ ] Google now publishes $0.08 per song; music had no comparable prices when the 2026-10-01 price check ran.
- [ ] The Gemini API navigation also lists a newer Lyria 3.5; consider a ranking review.
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
- [ ] The snapshot's official link is the MiniMax Music 2.6 post (2026-04-10), but MiniMax now lists MiniMax Music 3.0 as its current music model. Confirm which version the 2026-09-22 ranking scored before setting version and release_date.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### Mureka V9 — `undated_mureka_mureka-v9.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] Mureka's site exposes no readable model details and has no news page; only snapshot values are included.
- [ ] Aggregators report newer Mureka V9.5 and O3 models; consider a ranking review.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### GPT-6 Astra — `undated_openai_gpt-6-astra.md`

- [ ] Check new facts against the linked official sources: context window 1,050,000; plan ChatGPT Plus (price not in page text); plan ChatGPT Pro (price not in page text).
- [ ] Release date is not stated on the API model page (only the Apr 30, 2026 knowledge cutoff).
- [ ] ChatGPT plan prices are rendered per region by script and are not in the page text; check them in a browser before marking reviewed.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

### StepAudio 3 Music — `undated_stepfun_stepaudio-3-music.md`

- [ ] Check new facts against the linked official sources: none beyond the snapshot.
- [ ] The official promo page has no date or prices; release_date left null.
- [ ] Read the English and Spanish summaries, then set `review_status: reviewed` and empty `review_notes`.

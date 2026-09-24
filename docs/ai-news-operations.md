# Weekly AI-news local operations

The dedicated `news-worker` creates one evidence-backed English/Spanish roundup from official AI model release sources. Its durable schedule is stored in PostgreSQL and is disabled by default. The system-owned `MABlog_IA` account cannot sign in or receive ordinary collaboration permissions.

## Configuration and provider readiness

The administrator can now open **AI newsroom → Providers & models** to replace the newsroom's OpenAI and Brave keys and select the fast/strong OpenAI model IDs. These saved values apply to future runs in both the API and worker without restarting containers. Saving, removing, or changing them requires recent administrator step-up and is refused while a run is active. The page shows only configured status and whether a value comes from a saved override or the environment; it never displays a stored key. Removing a saved key restores the environment fallback.

Alternatively, set the following deployment defaults in `.env`, then rebuild `backend` and `news-worker`:

```powershell
OPENAI_API_KEY=your-platform-key
BRAVE_API_KEY=your-optional-brave-key
NEWS_SMALL_MODEL=gpt-5.6-luna
NEWS_STRONG_MODEL=gpt-5.6-terra
NEWS_TIMEZONE=Europe/Madrid
NEWS_WEEKDAY=0
NEWS_HOUR=9
NEWS_MINUTE=0
NEWS_RUN_BUDGET_USD=2
NEWS_MONTH_BUDGET_USD=10
NEWS_BRAVE_QUERY_BUDGET=15
```

OpenAI is required for classification, bilingual writing, repair, verification, moderation, and OpenAI web discovery. Brave expands discovery beyond the verified registry. A missing or unavailable Brave key is shown as degraded coverage; registry discovery and OpenAI can continue. Email is required for protected administrator actions outside the local test-account bypass.

Saved newsroom keys are encrypted in PostgreSQL using a key derived from `APP_SECRET`. Keep that secret stable and backed up securely: changing it makes saved key overrides unreadable until they are removed or replaced. Production must use a unique non-default `APP_SECRET` and HTTPS. The newsroom override does not change OpenAI keys used by site search, embeddings, or other features. Model changes do not update the environment-configured per-token price estimates; review those rates and run budgets before enabling the schedule. The form stores an ID but does not validate the model against a paid provider call.

`NEWS_MASTER_ENABLED=false` is the environment-level emergency stop. It prevents scheduled starts even if the database schedule is enabled. Changing an environment value requires recreating the worker:

```powershell
docker compose up -d --build backend news-worker frontend
```

The readiness panel at **Administration → AI newsroom** reports OpenAI, Brave, email, database, worker, schedule, budget, and queue state without displaying credentials.

## First preview and activation

1. Sign in as an administrator and open **AI newsroom**.
2. Keep the schedule disabled and choose **Test weekly pipeline** for a full private activation rehearsal. An ordinary **Generate preview** intentionally skips claim fact-checking and does not qualify; the first release gate can use a real qualifying full-path preview over up to 30 historical days.
3. Review both languages, every inline citation, the official-source list, the safety result, and the run warnings.
4. Enable the Monday 09:00 Europe/Madrid schedule only after the panel reports a complete verified preview.

A preview has no automatic publication intent. Only a successful full-path **Test weekly pipeline** records the activation proof in PostgreSQL; it does not enable the schedule. A quiet run, ordinary preview, or administrator evidence exception does not qualify.

## Durable run behavior and recovery

Only one run may be pending, running, or retrying. If the weekly time arrives during that run, the worker keeps one waiting catch-up request and collapses later missed starts into it. Scheduled scans begin at the last successful cursor with a two-day overlap. Restarting the worker reclaims expired leases and resumes from the retained stage.

Retry a failed run from its run drawer in **AI newsroom**. This resets only the failed checkpoint; completed discovery, source snapshots, and evidence remain available. The worker automatically retries eligible operational failures after about 1, 5, and 20 minutes. Failed verification or safety gates stop the run for administrator review.

For local recovery when the interface is unavailable:

```powershell
docker compose run --rm backend python -m app.news_worker --retry-run RUN_ID
docker compose run --rm backend python -m app.news_worker --once
```

Pin a preview or failed run in the interface before its normal retention deadline when it is needed for diagnosis. Check `http://localhost:3000/api/health` and `docker compose logs news-worker backend` for queue or startup failures.

## Publication, correction, and urgent removal

Automatic publication occurs only for scheduled/catch-up runs after the database schedule is enabled and every verification and safety gate passes. Manual **Run and publish** and full-path **Publish preview** also retain fact-checking. Ordinary **Generate preview** skips the claim-to-source verifier, remains private after bilingual structure and safety checks, and requires **Review and publish** before it can become public. Publication requires recent administrator step-up, a written reason and risk acknowledgement, reachable official sources, duplicate-release protection, and a fresh safety/moderation pass. Changed but reachable official pages are recorded and disclosed, not silently treated as unchanged. This manual route does not activate the schedule or advance its scan cursor. Unpublish, official-source changes, and administrator-role changes also require step-up. The local seeded administrator may use the documented local-only bypass.

If **Publish preview** is rejected, its run drawer now shows the server's reason beside the action; a successful click confirms publication and exposes **Open post**. A preview containing a release already published by another run is identified before clicking, with a link to the existing public article, and its duplicate-publication button is disabled. Keep the existing story or generate a preview with genuinely new releases; do not try to publish the same release twice. A changed or unreachable official page can still block a fully verified preview, and the drawer now explains that instead of appearing inert.

For a retained **preview that failed specifically at evidence verification**, an administrator may open its run drawer and choose **Publish with exception**. This high-risk action requires recent step-up, a written audit reason, an explicit acknowledgement, a complete bilingual draft, reachable official sources, no already-published release, and fresh deterministic safety plus moderation checks. A changed official page does **not** block this particular exception: the article still uses the retained source snapshot, the changed document and hashes are kept in the private approval record, and readers see that the current page may differ. Normal verified-preview publication still rejects source changes. The exception cannot override a safety failure, publish a malformed draft, or enable the weekly schedule. The edition remains marked fact-check-failed in durable history, the failed verify job remains visible, and public readers see a prominent warning that claims or citations may be unsupported. An administrator should review both languages and linked official sources before using it; a corrected or newly verified preview is preferable when available. No exception is applied automatically.

An administrator can immediately unpublish a `MABlog_IA` article while retaining its edition, citations, evidence, and audit history. Corrections are saved privately, synchronized into both languages, rechecked for citations, factual support, and language consistency, and then explicitly accepted. The current public version remains visible while a correction is being verified unless an administrator unpublishes it.

Fully checked public editions show **AI-generated · source-reviewed by MAblog**, the source count, review time, correction note when present, inline numbered citations, and section source links. Ordinary manually approved editions instead show **AI-generated · administrator-published without fact-check**; historical failed-verifier exceptions retain the separate **published by administrator exception** label. When a source changed before either manual publication, the reader warns that the live page can differ from the retained evidence. Neither manual route displays a false verified timestamp. Public search indexes both localizations, and the home carousel includes no more than one AI-news card.

## Source registry and monitoring

The registry begins with verified core provider pages for OpenAI, Gemini, Claude, DeepSeek, and Kimi. Curators can test a URL before adding or changing it. Web-discovered domains remain inactive suggestions until reviewed. Source text is always treated as untrusted data and can never issue application instructions.

Published sources are monitored for 30 days. A material contradiction unpublishes the affected AI-news edition and creates an administrator alert. Other availability or content changes create an alert for review without silently rewriting the article.

## Budgets and retention

The economy profile enforces an estimated USD 2 per run, USD 10 per calendar month, and 15 Brave queries per run. Paid stages check the remaining allowance before a call; the dashboard shows actual token/cost estimates and warnings. Update the per-million-token price settings in `backend/app/config.py` when provider prices change.

Evidence metadata, canonical URLs, hashes, citations, provider/model audit fields, and public edition history are permanent while their owning records exist. Full extracted source text expires after 30 days. Unpinned preview and failed runs expire after 90 days; ordinary quiet operational runs expire after one year. Pinned runs are retained.

## Backup, restore, and local limitations

Run `scripts/backup.ps1` before schema or operational changes. It pauses both durable workers with the API and frontend, then saves PostgreSQL and uploaded media together. The pre-AI-news migration checkpoint is `backups/pre-ai-news-20260914`.

Restore commands are in [local operations](local-operations.md). Include `news-worker` whenever manually stopping or restarting application writers around a restore.

This release is for local Docker use. Production still needs managed secrets, HTTPS, real SMTP delivery, managed PostgreSQL/Redis, centralized logs and alerts, external backups with restore drills, provider-cost monitoring, and a deliberate deployment review.

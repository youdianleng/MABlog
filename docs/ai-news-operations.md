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
2. Keep the schedule disabled and run a private preview. The first release gate uses a real qualifying preview over up to 30 historical days.
3. Review both languages, every inline citation, the official-source list, the safety result, and the run warnings.
4. Enable the Monday 09:00 Europe/Madrid schedule only after the panel reports a complete verified preview.

A preview has no publication intent and cannot create a public post. Passing it records the activation proof in PostgreSQL; it does not enable the schedule. A quiet run proves the pipeline operated but does not qualify as the required complete generated preview.

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

Automatic publication occurs only for scheduled/catch-up runs after the database schedule is enabled and every verification and safety gate passes. Manual **Run and publish**, **Publish preview**, unpublish, official-source changes, and administrator-role changes require recent administrator step-up. The local seeded administrator may use the documented local-only bypass.

An administrator can immediately unpublish a `MABlog_IA` article while retaining its edition, citations, evidence, and audit history. Corrections are saved privately, synchronized into both languages, rechecked for citations, factual support, and language consistency, and then explicitly accepted. The current public version remains visible while a correction is being verified unless an administrator unpublishes it.

Every public edition shows **AI-generated · verified by MAblog**, the source count, verification time, correction note when present, inline numbered citations, and section source links. Public search indexes both localizations, and the home carousel includes no more than one AI-news card.

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

# MAblog

A local multi-user blog with an Onmyoji-inspired visual style, a dark animated celestial-ring Discover hero with rotating anime characters, a featured carousel ranked by likes received over 14 days, a freeform post composer, creator-reviewed collaboration, and permission-aware hybrid search with grounded AI explanations.

## Start locally

Start Docker Desktop, then run in PowerShell:

```powershell
Set-Location F:\AI_Roadmap_2026\MAblog
docker compose up -d --build
```

- Blog: http://localhost:3000
- AI model rankings: http://localhost:3000/ai-models
- Local email inbox: http://localhost:8025
- API documentation: http://localhost:8000/docs
- Health check: http://localhost:3000/api/health

The Compose defaults work without an `.env` file and provide keyword search. To enable semantic retrieval and generated explanations, copy `.env.example` to `.env`, set a backend-only `OPENAI_API_KEY`, and recreate the services. The example credentials are for this local setup.

## Try the sample collection

```powershell
docker compose exec backend python -m app.seed
```

This explicit command creates any missing entries from the fifteen-story illustrated sample collection. It identifies seed posts by title, leaves existing posts alone, and does not run automatically on startup, so rerunning it is safe. The original fantasy artwork is included under `backend/seed-assets/` and is reused across the larger sample collection.

Use **Create an account** to make your own profile. You can also try the sample author: username `mablog_demo`, password `mablog-local-2026`. Email verification still applies; read the code in Mailpit. Other sample authors are `mablog_demo_1` through `mablog_demo_7`, with the same local sample password.

For immediate local testing, Compose automatically creates a password-only account:

- Username: `mablog_admin`
- Email: `admin@mablog.local`
- Password: `mablog-admin-local-2026`

This account skips the initial email-code screen because it receives a long local verification window during startup. It behaves as a normal post creator and does not gain access to another user's personal posts. Change or disable it with the `LOCAL_ADMIN_*` settings in `.env`; set `LOCAL_ADMIN_ENABLED=false` before adapting this configuration for production.

## Write and collaborate

The collection page has a vertical category menu: All posts, Technology, Travel, General, and Anime. Discover and the collection show at most fifteen posts per numbered page, with the selected page and collection category retained in the URL. Choose a category in the composer's Post details before applying or submitting changes. Editors' category changes need creator approval; existing uncategorized posts appear under General. The menu, pagination, and editor labels support English and Spanish.

1. Register or sign in using email/username and password. Read the local verification email in Mailpit and enter its code. Verified access lasts seven days.
2. Click **Write**. The canvas uses the full editor width; open **Post & canvas settings** at its upper-right for post details, canvas bounds, selected-block geometry, layers, and draft reset. Add a block or use **Draw block** to choose its rectangle. Each block can mix rich text, uploaded images/videos, links, and YouTube/Vimeo embeds. Select an inserted image and drag its lower-right handle to resize it; focus the same handle and use Left/Right Arrow for 10-pixel steps or Shift + Arrow for 25-pixel steps.
3. Drag a block by its header, resize its edges, or set position/rotation numerically. The trash button on each block header removes it immediately, and Undo restores it while the editing history remains available. Use the layer list and forward/backward controls for overlapping blocks. Reading order is independent of stacking.
4. Drag any canvas edge or corner to change the page width and height directly, like resizing a block. Use **Adjust canvas bounds** when you also want to drag the top bar and move the crop area; the frame remains at its dropped workspace position. Hold **Ctrl** and roll the mouse wheel over the editor to zoom from 25% to 300% around the pointer without changing saved geometry. Hidden content stays stored and reappears when the canvas expands.
5. **Save draft** stores private work. Creators use **Apply my changes** to update approved content. Invited editors use **Submit for approval**.
6. In the reader, creators can publish, make a post personal, delete it, or open **Sharing**. Public publication requires a title and uploaded cover. Sharing uses an existing registered email and applies only to that post.
7. In **Review**, compare the current target with submitted alternatives. Approving one rejects competing pending alternatives for that target. Other blocks, canvas changes, and post-detail proposals remain independent.

Revocation keeps submitted proposals for creator review. Readers see approved content. Private drafts and media are checked against current permissions on the backend. If a session expires while editing, sign in in the overlay and retry saving; the open editor keeps its input.

Phone reading preserves the composition and provides a zoom slider. English and Spanish cover the interface; authored text is not automatically translated. Uploaded MP4/WebM playback depends on browser codec support; the first version does not transcode video.

## Search and grounded explanations

The global header search opens `/search`. Results appear immediately in **Personal** and **Public** groups, with category and scope filters and independent **Load more** controls. When cloud AI is available, a short explanation streams above the ranked results. Its numbered post names link to the exact matched block and highlight that block in the reader. Keyword matching accepts common suffix differences such as `mountain` and `mountains`. If query embeddings fail, MAblog can still ground an explanation in permission-safe keyword matches; if answer generation also fails, the ranked results remain visible.

Search indexes approved titles, summaries, categories, author names, written block text, link labels, and image alternative text. Drafts and proposal records never become search sources. Every lexical and vector candidate query applies current publication and grant rules in PostgreSQL; permissions are checked again before a continuation page or explanation is returned.

Public posts use cloud embeddings automatically. Personal posts stay keyword-only until the author enables **Personal AI search** in profile settings. Shared personal semantic retrieval also requires the searching user to enable the same setting, so both sides consent before approved personal passages or a query are sent to OpenAI. Turning the setting off removes the author's personal vectors and keeps keyword passages.

The dedicated `worker` container prepares durable embeddings after an approved post changes. Administrator commands are available for a backfill or recovery:

```powershell
docker compose run --rm backend python -m app.worker --prepare-only
docker compose run --rm backend python -m app.worker --retry-failed
```

The checked-in synthetic English/Spanish fixture can measure the configured embedding model without changing application data:

```powershell
docker compose run --rm backend python -m app.evaluate_search
```

The command passes only when an intended result appears in the top five for at least 85% of all cases and 80% of cross-language cases. It prints aggregate scores and failed case IDs, without printing fixture questions or story text.

## Weekly verified AI model news

Administrators can open `/admin/ai-news` to operate the system-owned `MABlog_IA` newsroom. A dedicated `news-worker` discovers recent model lifecycle updates from a curator-managed official registry plus OpenAI and optional Brave web discovery, fetches sources through strict public-HTTPS controls, and creates one structured English/Spanish roundup. Luna handles economical classification and evidence extraction; Terra writes, independently verifies, repairs at most twice, and checks both languages before the publication safety gate.

The local schedule targets Monday at 09:00 Europe/Madrid and stays disabled until a complete real private preview passes. A preview has no publication side effects. When an administrator later enables the schedule, only fully verified runs can publish. Public articles show their AI/verification disclosure, citations, sources, verification time, and correction state; the home carousel includes at most one AI-news card.

All runs, checkpoints, budgets, evidence, alerts, corrections, source checks, and schedule state are durable in PostgreSQL. Missing Brave configuration degrades discovery without stopping official-registry coverage. See [weekly AI-news operations](docs/ai-news-operations.md) for activation, recovery, correction, unpublication, retention, and provider setup.

## Project layout

```text
frontend/          Next.js, React, shadcn/ui, Tailwind CSS, Tiptap, freeform controls
frontend/src/features/ Feature-owned pages, components, and local hooks
frontend/src/hooks/ Reusable data, browser subscription, measurement, and draft hooks
frontend/src/lib/api/ API client, media upload client, and transport types
frontend/src/styles/ Focused base, post, carousel, celestial-background, character-cycle, reader, composer, and responsive styles
backend/app/api/   Focused FastAPI route groups, including the administrator AI newsroom
backend/app/services/ Permission, post/search, OpenAI, cache, and staged AI-news services
backend/app/        Application entry point, authentication, models, schemas, and configuration
backend/migrations/ Versioned Alembic schema changes
backend/evaluation/ Checked-in bilingual semantic-retrieval fixture
backend/tests/     PostgreSQL integration tests
frontend/tests/    Playwright browser checks
scripts/           Local backup tooling
docs/              Design decisions, build progress, and operation notes
compose.yaml       Local service composition and persistent volumes
AGENTS.md          Development and function-documentation requirements
```

See [application structure](docs/architecture.md) for ownership rules and the complete frontend/backend module map. Compatibility export files keep existing imports stable, while implementation remains in feature modules.

Each application has its own manifest, configuration, and Dockerfile. Next.js proxies `/api/` to FastAPI so the browser uses same-origin cookies. The Docker frontend build argument `BACKEND_URL` defaults to `http://backend:8000`; rewrites are compiled at build time. If the backend address changes for a future deployment, rebuild the frontend with the appropriate argument.

PostgreSQL is authoritative for accounts, sessions, approved compositions, permissions, drafts, proposals, media metadata, and timestamped likes. Content is stored as validated structured blocks with sanitized rich HTML, separately from each block's geometry. Per-target revisions and post-row locks prevent competing approvals or stale saves from silently overwriting changes.

Redis caches carousel candidate IDs for a configurable short interval. Visibility is rechecked against PostgreSQL when those candidates are read. Redis failure falls back to database reads. Sessions, durable indexing jobs, search pagination, one-use explanation state, and request-limit enforcement remain in PostgreSQL.

Zustand holds transient search questions, ranked results, and streamed explanation state in the browser. Search questions, generated explanations, and conversation history are not saved as product data. Production deployment remains future work.

## Development and verification

The pinned Python dependencies are in `backend/requirements.txt`; npm versions are locked in `frontend/package-lock.json`. See [build progress](docs/build-progress.md) for the actual checks performed and completed steps.

```powershell
# Run once to create a separate test database; never point this suite at the main database.
docker compose exec db createdb -U mablog mablog_test
docker compose run --rm -e DATABASE_URL=postgresql+psycopg://mablog:mablog-local-development@db:5432/mablog_test backend python -m pytest tests -q

Set-Location frontend
npm ci
npm run test:e2e:install
npm run typecheck
npm run test:e2e
```

Use the password from your `.env` in the test URL if you changed it. Browser tests run against the local app and Mailpit, expect the sample collection, and create test accounts; their successfully completed test posts are removed. Backend tests reset only the separate `mablog_test` database. The `AGENTS.md` requires a comment/docstring for every project function and explanations for complex logic and fixed business values.

## Stop, update, and preserve data

```powershell
docker compose stop
docker compose up -d --build
```

Database records, uploaded media, and captured emails survive ordinary container replacement through named volumes. `docker compose down` also retains them. Adding `-v` deletes volumes and their data, so do not use it when preserving posts. The local stack now runs separate `worker` and `news-worker` containers for search indexing and weekly AI news.

See [local operations](docs/local-operations.md) for backup and restore. All exposed services bind to localhost. Real email delivery, HTTPS, public hosting, and production operations will be designed in the later production phase.

## Framework references

The implementation follows the official setup documentation for [Next.js](https://nextjs.org/docs/app/getting-started/installation), [shadcn/ui](https://ui.shadcn.com/docs/installation/next), and [Tiptap with Next.js](https://tiptap.dev/docs/editor/getting-started/install/nextjs). Password hashing uses the approach described in the [FastAPI security guide](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/); MAblog uses revocable database sessions rather than JWTs. Semantic retrieval uses [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings), and explanations use the [Responses API](https://platform.openai.com/docs/api-reference/responses/create) with response storage disabled.

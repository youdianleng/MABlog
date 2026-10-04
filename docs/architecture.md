# MAblog application structure

This structure keeps the Next.js and FastAPI applications independently deployable while giving each feature an explicit home. Files should have one primary responsibility. Compatibility barrels may re-export public APIs, but application logic must remain in the feature module that owns it.

The confirmed search/RAG requirements and release gates are maintained in [`rag-design.md`](rag-design.md). That specification controls its implementation scope and permission boundaries.

## Frontend

```text
frontend/src/
├── app/                    Next.js entry files and global stylesheet imports
├── app-shell/              Providers, site shell (header, skip link), side menu, shared nav links, footer
├── components/
│   ├── feedback/           Shared loading and error presentation
│   └── ui/                 Reusable shadcn/ui primitives (Tailwind utility classes)
├── features/
│   ├── auth/               Account context, forms, and account lifecycle hooks
│   ├── ai-news/            Administrator newsroom, editions, sources, alerts, and public reader
│   ├── composer/           Canvas composer, inspector, rich editor, and editor hooks
│   ├── home/               Discovery and collection page
│   ├── posts/              Avatar, cards, grids, carousel, reader, and post hooks
│   ├── profile/            Public and editable profile pages
│   ├── review/             Creator proposal review
│   ├── search/             Query state, filters, streamed explanation, ranked groups
│   ├── sharing/            Per-post invitation management
│   ├── site-info/          Reusable bilingual About, Help, AI-model, policy, and terms presentation
│   └── workspace/          Owned, shared, and review-request lists
├── hooks/                  Cross-feature browser and data hooks
├── lib/
│   └── api/                API client, upload client, and transport types
│                           (lib/markdown-directory.ts: browser-local Markdown folder handle)
└── styles/                 Focused feature stylesheets imported by app/globals.css
```

The persistent application shell owns the global header, skip link, side menu, and footer. `navigation-links.ts` is the single list of primary and information destinations for both the header bar and the side menu, and `use-shell-actions.ts` holds the shared Write and Sign out actions. Below 1,180 CSS px, which narrow windows and heavy browser zoom both produce, the header keeps only the Menu button and brand, and the side menu (`side-menu.tsx`, `styles/side-menu.css`) carries all navigation. The footer links only to implemented routes; its public information destinations reuse `features/site-info/`, while their route files own metadata and page-specific bilingual copy. The `/ai-models` benchmark leaderboard and `/ai-models/[slug]` profiles are built per request by `ai-models-content.server.ts`. It reads `frontend/content/ai-models/` (model Markdown files plus `rankings.yaml`, which the Docker image copies next to the server), validates them with `ai-model-files.ts`, and merges them in `ai-models-data.ts`. `rankings.yaml` fixes the order, "Why #N" reasons, and tie notes. A model whose file is `reviewed` uses the file's facts, score, and price. Drafts are ignored, and the typed `ai-model-rankings.ts` snapshot and the `ai-model-benchmark-context.ts` 2026-10-01 price check remain the fallback. Prices are compared only within one unit, `ai-model-benchmark-metrics.ts` computes the within-category recommendation and price bars (unit-tested), and the row, meter, and section components are styled by `styles/ai-benchmark.css`. `/ai-models/other-models` (`other-models-page.tsx`, `other-model-card.tsx`, `styles/other-models.css`) lists the reviewed models that are on no leaderboard. `otherModels()` in `ai-models-data.ts` groups them by file category, with current releases first, newest first. The rankings page links to it from its category bar and from a "Beyond the Top 5" section. The slug `other-models` is reserved, so no model profile can take that path. Administrators review the files at `/admin/ai-models` (`features/model-review/`, `styles/model-review.css`). The page loads every file from `GET /api/admin/ai-models`, parses it with the same validator, and shows the open review notes, each fact's quote and source link, and the text in both languages. Approve and Return to draft call `api/ai_model_review.py`. These calls need the administrator role, recent step-up verification, and the file version the reviewer loaded (an edited file is refused with 409), and each one writes an audit event. `services/ai_model_review.py` edits the front matter and update history as text and replaces the file atomically. Compose bind-mounts the repository folder into the backend (read-write, `AI_MODELS_DIR`) and the frontend (read-only), and both `/ai-models` routes render per request, so an approval is public on the next request and shows up as a Git change to commit. These modules share the snapshot so native benchmark scores, access routes, and family identity cannot diverge between list and detail views; a future reviewed backend feed can replace this module without changing the presentation contracts.

AI-news publication paths, evidence exceptions, duplicate/source rechecks, and provider overrides are documented in [`ai-news-publisher-design.md`](ai-news-publisher-design.md#implementation-notes). The backend keeps those rechecks in `services/ai_news/publication_checks.py`; the newsroom routers only authorize, validate, and delegate.

A component that represents an independently understandable interface element belongs in its own file. Feature-only hooks stay beside the feature; hooks useful in more than one feature belong in `hooks/`. Effects for network loading, subscriptions, timers, measurements, synchronization, and navigation guards should live in a named hook so components primarily describe rendering and user actions.

The small files `components/composer.tsx`, `components/posts.tsx`, and `lib/api.ts` are re-export barrels that contain no logic; `lib/api.ts` is the conventional import path for API transport (`@/lib/api`), while implementation lives in `lib/api/` and the feature modules.

### Styling

shadcn/ui primitives in `components/ui/` use Tailwind utilities and the shared `cn` helper from `lib/utils.ts`. Feature presentation uses focused, class-based stylesheets in `src/styles/` (one per feature area, imported from `app/globals.css`); Tailwind utilities are welcome in new components, but an existing feature should not mix both approaches for the same element.

### Formatting and unit tests

Prettier (`npm run format`) is the only frontend formatter. Pure logic has Vitest unit tests beside the module as `*.test.ts` (`npm run test:unit`); Playwright browser workflows remain in `frontend/tests/*.spec.ts`.

## Backend

```text
backend/app/
├── api/
│   ├── router.py           Route composition
│   ├── health.py           Service availability
│   ├── ai_news/            Protected newsroom status, runs, sources, editions, and alerts
│   ├── administrators.py   Protected role and step-up management
│   ├── auth.py             Registration, login, verification codes, and sessions
│   ├── posts.py            Collection, reader, publication, workspace, likes
│   ├── collaboration.py    Grants, drafts, submissions, proposal review
│   ├── profiles.py         Public and editable profiles
│   ├── search.py           Ranked retrieval, pagination, streamed explanations
│   └── media.py            Upload validation and protected delivery
├── services/
│   ├── admin_audit.py      Administrator audit trail records
│   ├── administration.py   Administrator role checks
│   ├── authentication.py   Password hashing, codes, sessions, and rate limits
│   ├── capacity.py         Search/indexing counters and one-use explanation tokens
│   ├── carousel.py         Featured-post ranking with cached candidate IDs
│   ├── documents.py        Composition validation and sanitization helpers
│   ├── email_delivery.py   SMTP delivery of verification codes
│   ├── embeddings.py       Backend-only OpenAI embedding transport
│   ├── generation.py       Grounded Responses API streaming adapter
│   ├── indexing.py         Approved passage extraction and durable job preparation
│   ├── permissions.py      Authoritative role and post-access rules
│   ├── posts.py            Batched post presentation and approval operations
│   ├── public_cache.py     Rebuildable Redis cache access
│   ├── retrieval.py        Permission predicates, lexical/vector ranking, RRF
│   ├── ai_news/            Discovery, safe fetch, evidence, verification, publication, and publication rechecks
│   ├── step_up.py          Recent administrator re-authorization
│   └── tokens.py           Signed, expiring search continuation state
├── config.py               Typed pydantic-settings configuration and documented defaults
├── dependencies.py         Request-scoped database session and signed-in account dependencies
├── logging_setup.py        Shared process logging configuration (LOG_LEVEL)
├── database.py             Engine, session factory, and migration metadata
├── models/                 SQLAlchemy records by domain (accounts, posts, search, ai_news)
├── schemas/                Pydantic transport and composition schemas by domain
├── utils.py                Shared time, identifier, and digest helpers
├── bootstrap.py            Optional local administrator creation
├── evaluate_search.py      Live bilingual embedding-quality release gate
├── seed.py                 Explicit sample-content command
├── worker.py               Durable background passage embedding worker
├── news_worker.py          Durable weekly AI-news scheduler and checkpoint worker
└── main.py                 FastAPI composition, middleware, and error handlers
```

Routes validate HTTP input and delegate shared rules to services. Permission checks remain centralized in `services/permissions.py`. SQLAlchemy records and Pydantic request/document schemas remain separate so persistence details do not leak into API validation. List endpoints present posts through `services.posts.post_summaries`, which loads likes, grants, authors, indexing state, and AI-news metadata in a fixed number of batched queries; avoid per-row queries in new list endpoints.

Configuration is declared once on `config.Settings` (pydantic-settings) and validated at import, so a malformed value stops the container at startup. Upper-case module constants remain the import surface. Code that must observe environment changes at runtime (the local-admin bootstrap and its test) calls `load_settings()`.

The API and both workers log through `logging_setup.configure_logging()`. Worker loops log and survive unexpected cycle failures, and the AI-news state machine logs the traceback of an unexpected stage error while the durable run stores only a stable error code. Only PostgreSQL unique violations become a retryable 409; other integrity violations are logged and returned as 500.

Search reads only approved `Post.document` passages. PostgreSQL applies publication, ownership, current grant, category, scope, and two-sided personal-cloud consent predicates inside lexical and vector candidate queries. The API fuses per-post ranks, signs continuation/evidence identifiers, and rechecks permissions before pagination or generation. A dedicated worker is the only component that writes embeddings; durable PostgreSQL jobs survive Redis or worker restarts.

Public discovery routes server-render numbered pages of at most fifteen posts. FastAPI applies approved category filtering before counting and offsetting, returns the filtered total and page count, and preserves deterministic publication/id ordering so pages do not overlap. `features/posts/post-pagination.tsx` provides the shared accessible navigation; page and collection-category state live in the URL so a result view can be linked, refreshed, and restored through browser history. Profile and workspace grids remain finite account-scoped results rather than silently paginating permission-sensitive management views.

## Rules for new work

1. Add a new user-facing capability under `frontend/src/features/<feature>/` and a matching FastAPI route group under `backend/app/api/` when backend support is needed.
2. Put reusable business behavior in a backend service and reusable browser behavior in a named frontend hook.
3. Keep components focused on one interface responsibility; extract a child when it has its own state, effects, sizable markup, or reuse potential.
4. Keep API transport types in `frontend/src/lib/api/types.ts` and validated backend payloads in the matching `backend/app/schemas/` domain module.
5. Do not place domain logic in `main.py`, route composition files, compatibility barrels, or global style imports.
6. Document every function and callback, explain fixed business values, and update `docs/build-progress.md` after verified changes.

## Browser-local Markdown folder

The profile page lets a signed-in user choose a folder on their own computer for Markdown (`.md`) files, using the File System Access directory picker (Chrome and Edge on desktop). `lib/markdown-directory.ts` owns picking, permission checks, and keeping the handle in this browser's IndexedDB under a per-account key. `features/profile/use-markdown-directory.ts` exposes the status, and `markdown-folder-settings.tsx` renders the panel. Nothing is sent to the backend, and the page never sees the folder's full path. Browsers may require write access to be re-approved in a later session; the panel offers **Allow access** when that happens. Future features that write Markdown should load the handle through this module and check `markdownDirectoryPermission` before writing. `writeMarkdownFile` writes one plain `.md` file inside the folder. The panel's **Save AI-news instructions** button uses it to save the master instruction file, served by `GET /api/ai-news/instructions` (`backend/app/api/ai_news_instructions.py`). See [`ai-news-instructions.md`](ai-news-instructions.md).

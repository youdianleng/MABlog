# MAblog application structure

This structure keeps the Next.js and FastAPI applications independently deployable while giving each feature an explicit home. Files should have one primary responsibility. Compatibility barrels may re-export public APIs, but application logic must remain in the feature module that owns it.

The confirmed search/RAG requirements and release gates are maintained in [`rag-design.md`](rag-design.md). That specification controls its implementation scope and permission boundaries.

## Frontend

```text
frontend/src/
├── app/                    Next.js entry files and global stylesheet imports
├── app-shell/              Application composition, route selection, header, footer, dialogs
├── components/
│   ├── feedback/           Shared loading and error presentation
│   └── ui/                 Reusable shadcn-style primitives
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
└── styles/                 Base, feature, footer, information-page, and responsive styles
```

The persistent application shell owns the global header, skip link, and footer. The footer links only to implemented routes; its public information destinations reuse `features/site-info/`, while their route files own metadata and page-specific bilingual copy. AI ranking cards and `/ai-models/[slug]` profiles read from the same typed, versioned `ai-model-rankings.ts` snapshot so native benchmark scores, access routes, and family identity cannot diverge between list and detail views; a future reviewed backend feed can replace this module without changing the presentation contracts.

Generated AI-news editions use versioned structured blocks. New release blocks separate sourced change, developer, and reader implications from deterministic provider-benchmark rows built out of exact official-source claims. The public reader labels reported results as provider-published, while correction preserves their citation and score evidence; legacy editions without these fields remain readable.

The administrator newsroom's Providers & models tab reads a redacted status endpoint. Step-up-protected mutations store encrypted OpenAI/Brave key overrides and model IDs on the durable news-settings row; the API and worker resolve those values for each AI-news stage, falling back to environment defaults. General site AI services remain on their separate environment configuration. The server rejects override changes while a newsletter run is active.

A component that represents an independently understandable interface element belongs in its own file. Feature-only hooks stay beside the feature; hooks useful in more than one feature belong in `hooks/`. Effects for network loading, subscriptions, timers, measurements, synchronization, and navigation guards should live in a named hook so components primarily describe rendering and user actions.

The small files in `components/blog-app.tsx`, `components/composer.tsx`, `components/posts.tsx`, and `lib/api.ts` are compatibility exports. They allow stable imports while implementation lives in the structured modules.

## Backend

```text
backend/app/
├── api/
│   ├── router.py           Route composition
│   ├── health.py           Service availability
│   ├── ai_news/            Protected newsroom status, runs, sources, editions, and alerts
│   ├── administrators.py   Protected role and step-up management
│   ├── posts.py            Collection, reader, publication, workspace, likes
│   ├── collaboration.py    Grants, drafts, submissions, proposal review
│   ├── profiles.py         Public and editable profiles
│   ├── search.py           Ranked retrieval, pagination, streamed explanations
│   └── media.py            Upload validation and protected delivery
├── services/
│   ├── capacity.py         Search/indexing counters and one-use explanation tokens
│   ├── documents.py        Composition validation and sanitization helpers
│   ├── embeddings.py       Backend-only OpenAI embedding transport
│   ├── generation.py       Grounded Responses API streaming adapter
│   ├── indexing.py         Approved passage extraction and durable job preparation
│   ├── permissions.py      Authoritative role and post-access rules
│   ├── posts.py            Post presentation and approval operations
│   ├── public_cache.py     Rebuildable Redis cache access
│   ├── retrieval.py        Permission predicates, lexical/vector ranking, RRF
│   ├── ai_news/            Discovery, safe fetch, evidence, bilingual verification, and publication
│   └── tokens.py           Signed, expiring search continuation state
├── config.py               Environment configuration and documented defaults
├── database.py             Engine, session factory, and migration metadata
├── models.py               SQLAlchemy records
├── schemas.py              Pydantic transport and composition schemas
├── utils.py                Shared time, identifier, and digest helpers
├── auth.py                 Authentication routes and code/session policies
├── bootstrap.py            Optional local administrator creation
├── evaluate_search.py      Live bilingual embedding-quality release gate
├── seed.py                 Explicit sample-content command
├── worker.py               Durable background passage embedding worker
├── news_worker.py          Durable weekly AI-news scheduler and checkpoint worker
└── main.py                 FastAPI composition, middleware, and error handlers
```

Routes validate HTTP input and delegate shared rules to services. Permission checks remain centralized in `services/permissions.py`. SQLAlchemy records and Pydantic request/document schemas remain separate so persistence details do not leak into API validation. `core.py` is a temporary compatibility export for migrations, existing scripts, and tests; new backend code should import the focused module directly.

Search reads only approved `Post.document` passages. PostgreSQL applies publication, ownership, current grant, category, scope, and two-sided personal-cloud consent predicates inside lexical and vector candidate queries. The API fuses per-post ranks, signs continuation/evidence identifiers, and rechecks permissions before pagination or generation. A dedicated worker is the only component that writes embeddings; durable PostgreSQL jobs survive Redis or worker restarts.

Public discovery routes server-render numbered pages of at most fifteen posts. FastAPI applies approved category filtering before counting and offsetting, returns the filtered total and page count, and preserves deterministic publication/id ordering so pages do not overlap. `features/posts/post-pagination.tsx` provides the shared accessible navigation; page and collection-category state live in the URL so a result view can be linked, refreshed, and restored through browser history. Profile and workspace grids remain finite account-scoped results rather than silently paginating permission-sensitive management views.

## Rules for new work

1. Add a new user-facing capability under `frontend/src/features/<feature>/` and a matching FastAPI route group under `backend/app/api/` when backend support is needed.
2. Put reusable business behavior in a backend service and reusable browser behavior in a named frontend hook.
3. Keep components focused on one interface responsibility; extract a child when it has its own state, effects, sizable markup, or reuse potential.
4. Keep API transport types in `frontend/src/lib/api/types.ts` and validated backend payloads in `backend/app/schemas.py` or a future feature-specific schema module.
5. Do not place domain logic in `main.py`, route composition files, compatibility barrels, or global style imports.
6. Document every function and callback, explain fixed business values, and update `docs/build-progress.md` after verified changes.

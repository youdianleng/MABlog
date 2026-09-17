# Use a durable gated pipeline for weekly AI model-news publication

Status: Accepted and implemented locally on 2026-09-14

Date: 2026-09-14

## Context

MAblog needs a system-owned publisher that researches recent AI model releases, produces one bilingual weekly roundup, and publishes without advance review only when strict evidence, verification, citation, duplicate, budget, and safety gates pass. The system must survive local Docker restarts, keep administrators in control, protect provider credentials, and integrate published editions with existing public search and carousel behavior.

The existing application already uses PostgreSQL for durable data, Redis only for optional caching, a dedicated PostgreSQL-leased passage-indexing worker, FastAPI route and service modules, and a feature-based Next.js frontend.

## Decision

Add a second dedicated backend worker backed by a PostgreSQL news-run and news-job state machine. Store every checkpoint and publication decision durably, use idempotent stage and publication keys, and permit only one active AI-news run. Redis will not own schedule, job, evidence, or publication state.

Research will combine a curator-managed official-source registry with OpenAI web search and Brave Search. All fetched documents are untrusted and pass strict network, extraction, evidence, verification, and safety boundaries. `gpt-5.6-luna` performs lower-cost classification and evidence extraction; `gpt-5.6-terra` performs bilingual composition, repair, and separate verification. Both are configurable.

Publish one canonical post with atomic English and Spanish structured block versions. The system-owned `MABlog_IA` identity cannot sign in or use human collaboration features. Every site administrator acts as an AI news curator through backend-enforced authorization, step-up authentication for high-impact actions, and append-only auditing.

## Consequences

- Restart recovery and retries do not depend on Redis or process memory.
- The pipeline adds substantial schema and administrator UI surface, but each stage remains independently observable and repairable.
- Publication cannot expose a partial bilingual edition because post creation, localization, evidence links, covered releases, cursor advancement, and indexing enqueue occur atomically.
- Live provider costs are bounded before each paid stage and remain visible to administrators.
- A real private preview, rather than a stored automated-test result, is the product-level schedule activation gate; engineering tests still verify security and recovery during development.
- Production hosting and secret infrastructure remain outside the first local release.

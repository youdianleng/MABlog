# MAblog search and RAG specification

Status: confirmed and implemented locally. Deterministic permission, retrieval, streaming, fallback, retry, privacy, pagination, and bilingual quality checks pass. The live OpenAI embedding gate remains rerunnable because the currently configured provider account returns HTTP 429.

## 1. User experience

- A search begins with an independent natural-language question of no more than 500 characters.
- The page first presents a generated explanation describing why the retrieved posts match the question.
- Every post named inside that explanation is a clickable link to the corresponding MAblog reader page.
- Citations open the normal reader at the matched block and visually highlight that source block.
- The explanation targets approximately 120–220 words and cites no more than five posts.
- Ranked post results appear below the explanation.
- Results are divided into **Personal** first and **Public** second. Each group ranks its own accessible results.
- Each group initially returns up to ten posts. Category and Personal/Public scope filters are available, and each group supports **Load more** independently.
- Ranked results appear as soon as retrieval finishes. The explanation streams above them. If generation fails, ranked search remains usable and the page shows a clear explanation-status message.
- Each query is independent. MAblog does not provide multi-turn conversation memory in the first release.
- MAblog does not persist search queries, generated explanations, or conversation history in the first release.
- A search field in the global header opens the dedicated `/search` page from anywhere in the application.
- Creators see **Search ready**, **Indexing**, or **Indexing failed** for approved content in their workspace.
- One answer may use up to eight passages across at most five posts, with no more than two passages from one post.

## 2. Retrieval scope and permissions

- Only approved `Post.document` content is indexed. Drafts and pending, approved, or rejected editor proposals are excluded as separate source material; an approved proposal becomes searchable only after it is applied to `Post.document`.
- Anonymous visitors may retrieve public posts and receive public-post RAG explanations.
- Signed-in users may retrieve public posts, their own approved personal posts, and approved personal posts currently shared with them as viewer or editor.
- Current PostgreSQL permissions are applied inside every lexical and vector candidate query. A global vector result must never be filtered for permission only after retrieval.
- Published posts belong in the Public group even when the requester authored them. A public post is not duplicated into Personal.
- Unpublishing, deleting, revoking access, or changing a grant affects search authorization immediately and does not wait for re-embedding.
- The answer generator receives only passages from posts returned by the permission-safe retrieval query.
- Cloud processing of personal posts is disabled per account by default. One explicit account setting controls both sides of consent: an author permits cloud indexing of personal posts they own, and a searcher permits their query and authorized personal passages to be sent to OpenAI.
- A shared personal post participates in semantic retrieval and generation only when both its author and the current searcher enabled personal cloud processing. It remains available through permission-safe PostgreSQL keyword search otherwise.
- Public posts are cloud-indexed automatically. Turning the setting off removes semantic vectors for the author's personal posts and retains their keyword-search records.
- The personal-cloud-processing setting uses a clear consent panel. It explains what approved private text may be sent to OpenAI, the required two-sided consent, the provider's applicable data-handling terms, the effect of disabling the setting, and continued keyword-search availability. It does not interrupt every search with another confirmation.

## 3. Indexed content

- Index approved post titles, summaries, categories, author names, written block text, link labels, and image alternative text.
- Always index valid title and summary metadata. Skip extracted individual block passages shorter than 30 useful characters.
- Preserve the post ID, stable block ID or metadata target, reading order, content revision/hash, language signals, and embedding-model version with every passage.
- Do not add OCR, image understanding, uploaded-video transcription, or audio transcription in the first release.
- Strip presentation-only HTML and canvas geometry from embedding text while retaining source identity and reading order.

## 4. Ranking and languages

- Use hybrid retrieval: PostgreSQL full-text relevance plus semantic vector similarity.
- Apply small secondary boosts for recent likes and publication freshness. These signals must not overpower a substantially better text/semantic match.
- Merge keyword and vector rankings with Reciprocal Rank Fusion. Apply the combined like and freshness adjustment after fusion and cap its ranking contribution at 10%; keep the exact constants environment/configuration owned and evaluation-tunable.
- Only active likes received during the existing rolling 14-day window contribute to the like boost.
- English queries may retrieve Spanish posts, and Spanish queries may retrieve English posts.
- The generated explanation uses the language of the search query.
- The explanation is grounded only in retrieved MAblog passages. It cannot use live web search or unsupported general model knowledge.
- When the retrieved evidence is insufficient, the explanation must say so rather than inventing an answer.

## 5. Cloud AI and credentials

- Use OpenAI cloud APIs for embeddings and generated explanations.
- Use `gpt-5.6-terra` as the initial balanced answer model. Model identifiers remain environment configuration so they can be changed without a schema redesign.
- The initial embedding default is `text-embedding-3-small`; its exact vector dimensions and migration definition must match the implemented API request.
- Send answer requests through the Responses API with response storage disabled.
- `OPENAI_API_KEY` is a backend/worker environment secret. It must never appear in frontend code, browser responses, PostgreSQL records, checked-in files, logs, screenshots, or this chat.
- The user will set the key in the local `.env` file. A ChatGPT subscription does not substitute for an OpenAI Platform API key.

## 6. Indexing lifecycle and resilience

- Saving or approving content completes immediately. Embedding generation runs asynchronously in a dedicated Docker worker.
- Use a durable PostgreSQL indexing-job/outbox table as the source of truth. Redis may wake workers or cache safe public results, but job durability cannot depend on Redis.
- Retry a failed indexing job five times with approximate delays of 1 minute, 5 minutes, 15 minutes, 1 hour, and 6 hours. After the final attempt, mark it failed, expose the status in the creator workspace, and support administrator retry and backfill commands.
- Author application and creator approval enqueue only the changed approved targets. A backfill command indexes existing approved posts.
- Keyword search remains available while an embedding is pending or when OpenAI is unavailable.
- If an hourly cloud allowance is exhausted, return PostgreSQL keyword results and disable semantic retrieval and the explanation until the allowance resets.
- The index stores its content revision and model version so stale jobs cannot overwrite newer approved content.
- Deleting a post deletes its passages and pending jobs. Publication and grant changes alter eligibility through authoritative joins and do not require new embeddings.
- Stream explanations over a normal HTTP response using server-sent events. Starting a replacement search or leaving the page cancels the active generation request. Retrieved results remain visible when streaming is cancelled or fails.
- Before the pgvector rollout, back up the existing PostgreSQL volume. Then use a PostgreSQL 17 image containing pgvector, run additive migrations, enable keyword search immediately, and let the durable worker backfill vectors without resetting existing data.

## 7. Usage limits

- Accept at most 500 characters per search query.
- Allow anonymous visitors ten search requests per hour.
- Allow signed-in users sixty search requests per hour.
- These hourly limits govern cloud-enhanced searches. After they are exhausted, permission-safe keyword-only search remains available at a separate protective limit of 60 requests per hour for anonymous visitors and 300 requests per hour for signed-in users.
- Apply an environment-configured application-wide ceiling of 500 enhanced user searches per day. The query embedding and answer generation together count as one product search.
- Give background passage indexing a separate environment-configured ceiling of 10,000 passages per day. Queued durable jobs resume when capacity resets.
- Rate limits apply as abuse and cloud-cost boundaries. After an allowance is exhausted, permission-safe PostgreSQL keyword search remains available.

## 8. Privacy-safe operations

- Do not log query text, retrieved passages, generated explanations, or post titles.
- Operational logs may contain a request identifier, anonymous-session hash or user identifier, status, latency, candidate counts, token usage, model name, and error category.
- Responses API requests disable response storage. Provider-side data handling and retention must be described accurately in the personal-content consent panel and operations documentation.

## 9. Project ownership

```text
frontend/src/features/search/       Search page, query form, filters, streamed explanation, result groups
frontend/src/lib/api/types.ts       Search request/result and streaming event types
frontend/src/styles/search.css      Search-specific responsive presentation
backend/app/api/search.py           Permission-safe search and explanation endpoints
backend/app/services/retrieval.py   Lexical/vector candidate retrieval and rank fusion
backend/app/services/embeddings.py  OpenAI embedding adapter
backend/app/services/generation.py  Grounded OpenAI explanation adapter
backend/app/services/indexing.py    Passage extraction and durable job processing
backend/app/models.py               Passage and indexing-job records
backend/app/schemas.py              Validated search/index/generation payloads
backend/app/worker.py               Dedicated indexing worker entry point
backend/migrations/                 pgvector extension, passages, indexes, durable jobs, user opt-in
```

The PostgreSQL service must use a PostgreSQL 17 image containing the pgvector extension. The existing PostgreSQL volume must be backed up before changing the database image. Search vectors remain durable database data and are covered by the existing database backup process.

## 10. Required verification

- Test anonymous, author, viewer, editor, revoked, unpublished, and deleted-post visibility across lexical retrieval, vector retrieval, ranked results, and generated context.
- Test that drafts and proposals never enter retrieval or an OpenAI request.
- Test cloud-personal-content opt-in and opt-out, including disabling the setting after indexing.
- Test English-to-Spanish and Spanish-to-English relevance with a checked-in evaluation fixture.
- Test immediate lexical fallback, delayed embedding completion, stale jobs, retries, OpenAI outage, Redis outage, and worker restart.
- Test clickable citations, insufficient-evidence explanations, streaming interruption, category/scope filters, independent pagination, and phone layout.
- Test rate limits without storing query text or generated output.
- Test the separate enhanced-search, keyword-fallback, global daily-search, and background-indexing limits.
- Test all five indexing retries, the terminal failed state, administrator retry/backfill recovery, pgvector migration, and background backfill from the preserved PostgreSQL 17 volume.
- Test that operational logs never include query text, post titles, retrieved passages, or generated explanations.
- Require a relevant result in the top five for at least 85% of the complete evaluation set and at least 80% of the bilingual subset. Require valid clickable citations in every supported answer and zero permission leaks.
- Run the complete existing PostgreSQL and Playwright suites alongside new search/RAG tests.

## 11. Design confirmation and delivery

- Questions Q1-Q34 are resolved and recorded in this specification.
- The design-tree frontier is empty: retrieval scope, permissions, consent, indexed content, ranking, languages, generation, streaming, persistence, indexing, retries, rollout, limits, privacy, interface behavior, and release verification all have an explicit decision.
- The user confirmed the consolidated specification before implementation.
- The delivered system uses additive pgvector migrations, immediate keyword indexing, a durable worker, permission-aware hybrid retrieval, transient Zustand search state, and streamed grounded Responses API explanations.
- The checked-in evaluation fixture and `python -m app.evaluate_search` command preserve the accepted 85% overall and 80% bilingual top-five release gates for reruns after model or ranking changes.

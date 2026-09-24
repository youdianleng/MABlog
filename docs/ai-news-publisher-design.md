# Automatic weekly AI model-news publisher design interview

Status: confirmed on 2026-09-14 and implemented for the local Docker release. The automatic schedule remains disabled until an administrator enables it after reviewing the successful real preview.

Last updated: 2026-09-23.

## Editorial-depth amendment, 2026-09-23

Future generated editions must give each model release distinct, cited explanations of what changed versus its predecessor, what the change means for production developers, and what it means for everyday users. A limitation/uncertainty paragraph is added when the official evidence supports one; unsupported comparisons and generic praise are not substitutes for concrete consequences.

The classifier now seeks up to six representative benchmark results per release from extractable first-party announcement, model-card, or technical-report text. Each saved benchmark claim retains an exact source excerpt and must identify the metric, reported result, and any published setup or comparator. The public release section displays these results in a dedicated cited panel labeled as **provider-published, not independently retested by MAblog**; it never normalizes unlike metrics into one score. If no result is verifiable in the official materials reviewed, the panel says that, without asserting the provider published none. Screenshots or charts with no extractable text are not OCR-verified by this pipeline and require a readable official document or later curator review.

New editions use versioned structured blocks so their focus labels and locked benchmark evidence survive bilingual correction. Existing published editions remain unchanged. This amendment refines the presentation of qualifying releases; benchmark-only promotions still do not qualify as news, the independent verification and safety gates still apply, and automatic scheduling remains disabled until the existing activation requirements are met.

## User-supplied objective

- Add an automatic weekly publisher focused on recent AI model releases and meaningful lifecycle updates.
- Give it the visible name `MABlog_IA`.
- Let it research recent news, create a MAblog post, and publish that post on the public posts page.
- Continue the interview one question at a time, following the user's established preference.

## Design tree

1. Publisher identity and control.
2. Publication authority and human review.
3. Editorial scope, source policy, and recency window.
4. Research evidence, citations, and copyright-safe synthesis.
5. Post format, language, category, artwork, and links.
6. Duplicate detection, fact checking, and quality gates.
7. Weekly schedule, timezone, retries, and no-news behavior.
8. AI models, search provider, budget, and usage limits.
9. Corrections, unpublishing, moderation, and audit history.
10. Credentials, isolation, operations, and recovery.
11. Validation and acceptance criteria.

Questions whose prerequisites are unresolved remain later branches rather than implicit defaults.

## Current frontier

### Final confirmation

The decision tree is complete. The concrete file structure, storage model, worker stages, API surfaces, frontend modules, rollout order, and verification approach are consolidated in `docs/ai-news-publisher-implementation-plan.md`. Implementation begins only after the user explicitly confirms that blueprint.

## Confirmed decisions

- `MABlog_IA` is a non-interactive system-owned publisher.
- Only the backend news worker can act as this identity. It has no password login or weekly email-verification flow.
- Its public profile and published posts remain readable like those of other authors, while it cannot like content, invite collaborators, or access users' personal posts.
- Weekly editions use gated automatic publication. An edition publishes without advance human review only after the required source, recency, factual-support, duplicate, citation, and safety checks pass.
- Failed gates never expose an incomplete public post.
- An administrator can later edit or reject a published `MABlog_IA` edition if its quality is insufficient.
- Administrator edit/reject authority is limited to `MABlog_IA` posts. It grants no control over public or personal posts owned by human authors.
- Rejecting a public edition immediately unpublishes it and removes it from public lists, search results, and carousel eligibility. Its content, sources, generation record, and rejection reason remain private for audit and correction, and the curator may republish a corrected edition.
- The publisher covers only publicly announced new AI models and material updates to existing models, including proprietary API models and open-weight models from any provider, such as OpenAI, Gemini, DeepSeek, Claude, and Kimi.
- It excludes general AI business, policy, research, funding, opinion, and product-feature coverage unless the development directly announces or materially changes a model.
- A meaningful lifecycle update includes a new model, family, or named version; new official API or weight availability; a major capability, modality, or context-window change; or a material access, pricing, licensing, or deprecation change.
- Routine fixes, benchmark-only promotions, unrelated interface features, and minor regional availability changes do not qualify.
- Every release or update must be established by a first-party provider announcement, model card, official documentation, API changelog, release repository, or provider-authored technical report.
- Independent reporting may add context but cannot establish a release by itself. The publisher does not publish when no qualifying first-party source exists.
- The default weekly publication time is Monday at 09:00 in the `Europe/Madrid` timezone.
- The weekly schedule is environment-configurable so deployment operators can change it without modifying application code.
- Each weekly scan starts 48 hours before the last successful scan and runs through the current start time. The first scan covers the preceding nine days.
- A failed weekly run does not advance the successful-scan cursor, so the next run automatically covers the missed period.
- Already covered releases are removed through canonical-source and normalized-release deduplication before generation.
- Each successful weekly run produces one public roundup rather than separate posts for each provider or release.
- The roundup begins with a short overview and contains one clearly titled section per qualifying release, with evidence and source links retained for each section.
- Every weekly roundup has complete English and Spanish versions. MAblog shows the version matching the reader's selected interface language and falls back to English.
- Both language versions communicate the same source-grounded claims, release sections, and evidence links.
- Clickable numbered citations appear immediately after the paragraphs they support, and every release section ends with a compact source list.
- Citation links open their original pages in a new tab. First-party authoritative sources and independent context sources have distinct labels.
- Every factual claim is mapped to stored supporting source evidence before generation can pass.
- A separate AI verification pass marks each claim as supported, contradicted, or unsupported.
- The automatic publication gate passes only when every claim is supported and every release has an authoritative first-party source.
- When verification fails, the worker regenerates only failing sections from the structured findings and re-verifies the complete English and Spanish edition.
- The worker makes at most two repair attempts. If either language still fails, it publishes nothing, retains the run and evidence privately, records the failure report, and notifies the AI news curator.
- When no qualifying release is found, the run succeeds without creating a public post, advances the successful-scan cursor, and retains its discovery record privately for the curator.
- Release discovery combines a maintained registry of official feeds, changelogs, documentation pages, and repositories with broad web discovery for new providers.
- A web-discovered candidate cannot enter generation until its domain and page pass authoritative first-party validation.
- Broad discovery uses OpenAI Responses API web search plus one independent dedicated search API. Results are merged and deduplicated before first-party validation.
- Brave Search is the first-release secondary discovery provider. MAblog merges its normalized candidate URLs with OpenAI web-search candidates before validation.
- The Brave credential is separate from the OpenAI API key. Each uses an encrypted newsroom-only database override when saved by an administrator, otherwise its deployment-secret default.
- The AI pipeline uses two configurable model tiers: a smaller tier for candidate classification and structured evidence extraction, and a stronger tier for bilingual writing, repair, and independent verification.
- Verification is a separate model call that receives the article and evidence but no writer reasoning or conversation state.
- Every stage stores its resolved model identifier and prompt version for audit and reproducibility.
- The first-release smaller tier uses `gpt-5.6-luna`; the stronger writing, repair, and verification tier uses `gpt-5.6-terra`.
- Both model identifiers are deployment settings rather than hard-coded application constants.
- Each language version uses a 100-150 word overview, 150-350 words per qualifying release, and a target ceiling of approximately 3,000 words.
- When many releases qualify, sections become shorter without omitting a qualifying release.
- Each section covers what changed, availability, evidence-backed capabilities, practical significance, and known limitations.
- Automated roundups always use the existing Technology category.
- Each roundup receives normalized tags for AI, provider, model or family, and release type. Tags use stable language-neutral identifiers with localized English and Spanish labels.
- The AI news curator may correct tags without modifying the article body.
- Every roundup receives a locally rendered MAblog-branded cover using the dark celestial style, an abstract AI motif, and the edition date.
- Covers use no provider logos or copied announcement artwork, are stored through MAblog's existing media service, and include English and Spanish alternative text.
- MAblog permanently retains source metadata, content hashes, and the exact excerpts used as claim evidence.
- Complete cleaned page snapshots remain private for 30 days for debugging and curator review, then an automated retention job deletes them.
- Stored source text is never publicly exposed beyond the short evidence excerpts necessary to support the roundup's claims.
- Exact canonical URL matches and unchanged source-content hashes are treated as duplicates.
- New pages about an already covered provider, model, version, and release type are compared with prior claim evidence.
- A materially changed release becomes a labeled follow-up section linked to the earlier MAblog edition; a candidate with no material new facts is skipped.
- Published automated roundups enter MAblog's existing durable public-post indexing pipeline for keyword and semantic retrieval.
- Curator edits create a private corrected revision and do not directly mutate the currently public content.
- Citation integrity, factual verification, and English-Spanish consistency checks must pass before the corrected revision atomically replaces the public version.
- The curator can immediately unpublish the current version before correction when continued visibility would be harmful.
- A curator may edit either English or Spanish, after which MAblog generates a synchronized proposal for the other language.
- The correction interface shows both localized versions and their changes, and the curator must explicitly accept the synchronized text before verification begins.
- MAblog creates one in-app notification and sends one email when a run exhausts retries, fails verification after repair, exceeds its spend limit, or otherwise requires curator action.
- Successful publications and quiet weeks remain visible in the curator dashboard without email, and repeated alerts for the same run are deduplicated.
- An unavailable discovery provider receives up to three retries with exponential backoff.
- Publication may continue when the official registry scan and at least one of OpenAI web search or Brave Search succeed; the run records a degraded-coverage warning.
- If both broad-discovery providers fail, the run remains private, creates an action-required notification, and publishes nothing.
- The local first release caps OpenAI usage at USD 2 per run and USD 10 per calendar month, and Brave Search at 15 queries per run.
- Before starting a paid stage, the worker checks projected usage against the configured limits. A limit stop retains the run privately, publishes nothing, and alerts the curator.
- Administrators can run the complete pipeline as a private preview, publish a verified preview through a separate action, or explicitly run and publish immediately.
- Manual runs use the same source, verification, safety, duplicate, and budget gates as scheduled runs.
- Pipeline previews do not advance the successful-scan cursor or mark releases as covered.
- Publishing a verified preview rechecks source hashes and duplicate state, then atomically publishes, records covered releases, and advances the cursor only when its scan window represents the current scheduled period.
- Weekly publishing uses PostgreSQL-backed news-run and news-job records with durable stage checkpoints, processing leases, retries, and restart recovery.
- A dedicated Docker news worker processes these jobs separately from the existing passage-indexing worker.
- Redis may cache public status summaries but does not own job, schedule, cursor, evidence, or publication state.
- Only one AI-news run may be active at a time. New manual-start controls link to the active run instead of creating another.
- One uniquely keyed scheduled request may wait behind the active run; it recalculates its scan window and duplicate state when processing starts.
- MAblog never automatically cancels an active run to start a newer one.
- Completed pipeline stages are checkpointed, and transient source, OpenAI, Brave, or email failures retry only the failed stage after approximately 1, 5, and 20 minutes.
- Provider `Retry-After` instructions override the configured delay when longer. Paid and publication operations use idempotency keys so completed work is not repeated.
- After the third transient failure, the run remains private and action-required, the curator is notified, and the successful-scan cursor does not advance.
- The first-release extractor supports public HTML, PDF, Markdown, and plain-text first-party materials, including documentation, technical reports, model cards, changelogs, and repository releases.
- Login-gated, paywalled, social-only, audio-only, and video-only announcements are excluded unless they link to a supported authoritative document.
- Client-rendered pages that cannot be extracted through ordinary HTTP are recorded for curator review rather than processed with browser automation.
- Source fetching accepts HTTPS URLs that resolve only to public Internet addresses and repeats DNS and address validation after every redirect.
- Fetches allow at most five redirects, 20 seconds, and 10 MB, accept only supported media types, identify the MAblog crawler, and honor `robots.txt`.
- URLs containing credentials, nonstandard ports, local or private addresses, unsafe redirects, oversized bodies, or mismatched content types are rejected.
- Every fetched source is treated as untrusted data. Extraction removes scripts, styles, forms, metadata instructions, and invisible content before creating bounded excerpts.
- AI stages receive explicit source/data boundaries and strict structured schemas, ignore embedded commands, and receive no tools, credentials, conversation state, or network access.
- Suspicious source content is recorded as a private curator-visible warning.
- Publication requires deterministic checks for exposed credentials, personal contact data, unsafe links, malformed markup, and excessive quotation, followed by moderation of both localized versions and public alternative text.
- A high-confidence safety failure keeps the run private, retains its report, and creates an action-required notification. Private run metadata and credentials are never submitted for moderation.
- Published and rejected edition history, claim evidence, citations, curator actions, and cost totals are retained permanently.
- Quiet-run and ordinary operational-stage records are retained for one year. Unpublished previews and failed-run details expire after 90 days unless a curator pins them.
- Verbose request diagnostics expire after 30 days. Secrets and hidden model reasoning are never stored.
- MAblog provides a dedicated administrator-only `/admin/ai-news` workspace.
- Its overview shows active progress, next schedule, budget usage, recent outcomes, and action-required alerts. Run details expose candidates, sources, evidence, stage results, costs, warnings, previews, and curator actions.
- The workspace includes separate views for official-source management and retained run history.
- The official-source registry is seeded with known providers and maintained by AI news curators from the dedicated workspace.
- Curators can add, edit, test, disable, and re-enable providers and endpoints. A source must pass domain-ownership signals, HTTPS safety, supported-format, and fetch checks before activation.
- Web-discovered providers appear only as review suggestions and are never activated automatically. Every registry change is audited with actor, time, old value, new value, and reason.
- Every `MABlog_IA` post and its public publisher profile show a clear `AI-generated · verified by MAblog` label, the last verification time, and the number of cited sources.
- The label links to a reader-friendly explanation of MAblog's automated research and verification process. A corrected edition also shows its updated time and a concise correction note.
- Public pages never expose private evidence excerpts, internal verification scores, prompts, model costs, or operational logs.
- Every site administrator is automatically an AI news curator and can access the AI-news workspace and its review, correction, unpublish, registry, preview, and publication actions.
- Ordinary user accounts and post collaboration grants never receive this authority. Backend authorization remains authoritative, frontend controls follow it, and every curator action is audited.
- Site administrator status is stored explicitly in PostgreSQL. The existing local test administrator is seeded from environment configuration.
- Administrators can promote or remove other administrators through a protected, audited management interface. MAblog prevents removal or deactivation of the final active administrator.
- Ordinary registration, email ownership, and post collaboration never confer administrator status.
- Administrator promotion or removal, manual publication, unpublication, and official-source activation or material modification require recent password confirmation plus an emailed one-time code.
- This step-up authorization is bound to the administrator session, remains valid for ten minutes, and is invalidated by password or email changes.
- The seeded test administrator may bypass step-up authentication only when the application explicitly runs in local-development mode. Production configuration cannot enable the bypass.
- The AI-news workspace shows redacted readiness for OpenAI, Brave Search, and email delivery without exposing or logging their credentials.
- The Providers & models tab lets a step-up-authorized administrator rotate or clear saved OpenAI/Brave newsroom keys and assign the fast/strong OpenAI model IDs. Status responses never include key values or fragments; active runs block configuration changes so an edition cannot mix configurations midstream. Clearing a saved key restores any deployment default, and rotating `APP_SECRET` requires replacing encrypted overrides.
- A usable OpenAI credential is mandatory for scheduled and manual runs. If it is absent or invalid, no run starts and the workspace shows the blocking configuration error.
- A missing or invalid Brave credential permits degraded discovery when the official registry and OpenAI web search succeed, with a persistent coverage warning.
- Missing email delivery preserves in-app action-required alerts and records a curator-visible delivery warning. Readiness is rechecked before every run and after configuration reload.
- Automatic scheduling is initially disabled while complete manual previews remain available.
- After at least one preview passes every required gate, an administrator with step-up authorization may enable the weekly schedule from the AI-news workspace.
- The enabled state and next-run time are stored durably in PostgreSQL. A deployment-level master kill switch prevents new scheduled starts, and readiness is checked again when a run becomes due.
- Disabling the weekly schedule or activating the kill switch does not cancel an already active run.
- On worker startup and periodic schedule checks, an overdue enabled schedule creates one uniquely keyed catch-up run instead of skipping the missed publication.
- Multiple missed Mondays collapse into the same catch-up. Its research window begins from the last successful scan with the normal two-day overlap, and normal deduplication removes releases already covered.
- Catch-up runs obey all readiness, budget, evidence, verification, safety, and publication gates and cannot duplicate an active or already queued scheduled request.
- A catch-up still creates one public roundup, even when its window contains many qualifying releases.
- For catch-ups only, sections may compress below the normal 150-word minimum into short cited briefs. The approximately 3,000-word ceiling remains a target, while including every qualifying release takes priority over the normal per-section length.
- The same claim evidence, bilingual consistency, citation, verification, and safety gates apply to every compressed brief.
- The only formal activation gate for automatic scheduling is one real private preview using the configured live services within the normal run budget.
- That preview must pass all ordinary source, evidence, bilingual, citation, verification, safety, cover, and publication-preparation gates and must not leak credentials. No automated test-suite result is required by the scheduler activation control.
- A quiet preview does not authorize schedule activation because it does not exercise generated content, evidence mapping, citations, cover rendering, or publication preparation.
- An administrator may run a private historical activation preview over a selected window of up to 30 days to include at least one real qualifying release. It uses the normal budget and has no publication, covered-release, or scan-cursor side effects.
- Each weekly roundup is one canonical post with separate English and Spanish content versions, one public URL, one author, one publication state, and shared likes and view counts.
- MAblog renders the reader's selected language and falls back to English. Both localized passage sets are indexed for search, while ranked results deduplicate the canonical post and prefer the searcher's language.
- Publication and correction replace both localized versions atomically so readers never see a mixed revision.
- Verified `MABlog_IA` posts remain in the normal public feed and public search and may qualify for the homepage carousel through the same likes-received-during-two-weeks ranking as human posts.
- At most one of the five carousel cards may belong to `MABlog_IA`. Only real user likes count, and the automated publisher cannot like content.
- Carousel cards and their destination pages retain the automated-authorship disclosure.
- Every active site administrator receives deduplicated in-app action-required alerts.
- Administrators with verified email addresses receive the corresponding deduplicated email when their AI-news email preference is enabled. The preference is enabled by default for current and newly promoted administrators and may be muted individually without disabling in-app alerts.
- Ordinary users and the non-interactive `MABlog_IA` identity never receive curator notifications.
- For 30 days after publication, weekly processing refetches cited authoritative sources and compares content hashes. Unchanged content requires no AI verification call.
- A materially changed source triggers new claim verification. If it contradicts a published claim, MAblog automatically unpublishes the edition, retains it privately, and sends action-required notifications to administrators.
- If a cited page only becomes unavailable, the edition remains public because its original evidence is retained permanently, while administrators receive a curator-visible warning. Every recheck is audited and normal correction and republication remain available.
- Automated editions use versioned structured blocks for the overview, release sections, callouts, and source lists inside a responsive branded vertical template.
- English and Spanish block trees share stable section identifiers and evidence references. Curators may edit content and reorder release sections through the dedicated bilingual correction interface.
- Automated editions do not expose free rotation or arbitrary canvas positioning. They render through reusable MAblog components and never store model-generated executable HTML or scripts; human-authored posts retain the existing freeform canvas editor.
- The first local registry seeds verified first-party sources for OpenAI, Google DeepMind/Gemini, Anthropic/Claude, DeepSeek, and Moonshot AI/Kimi.
- Only official announcement, documentation, model-card, changelog, and release-repository endpoints that pass registry checks become active. News aggregators and unofficial mirrors are not seeded.
- OpenAI and Brave discovery may suggest other proprietary or open-weight providers, but those providers remain inactive until curator review.
- Development tests may still be maintained and run as engineering checks, but they do not determine whether an administrator can enable the schedule.
- The original daily cadence has been replaced by one weekly edition.

## Confirmed domain terms

- **Automated news publisher:** confirmed canonical name for the application-controlled `MABlog_IA` author identity and its weekly publishing responsibility.
- **Weekly model update:** proposed canonical name for one generated weekly post, subject to later decisions about weeks with no qualifying releases.
- **AI news curator:** confirmed canonical name for the administrator authority limited to reviewing, editing, rejecting, and later correcting `MABlog_IA` posts.
- **Rejected news edition:** confirmed canonical name for a previously public automated news post that the curator has unpublished and retained privately with its evidence and history.
- **Model release news:** confirmed canonical name for coverage of a publicly announced new AI model or meaningful lifecycle update to an existing proprietary API or open-weight model.
- **Authoritative release source:** confirmed canonical name for a first-party source that can establish a model release or update.
- **Weekly publication schedule:** confirmed canonical name for the configurable Monday 09:00 `Europe/Madrid` default.
- **Weekly scan window:** confirmed canonical name for the successful-run cursor plus two-day overlap used to discover eligible releases.
- **Weekly roundup:** confirmed canonical name for the single post that groups all qualifying releases from one weekly scan.
- **Localized roundup:** confirmed canonical name for the English and Spanish representations of the same weekly roundup and evidence set.
- **Reader citation:** confirmed canonical name for a numbered paragraph-level link to stored release evidence.
- **Claim evidence:** confirmed canonical name for the source excerpt and metadata supporting one factual statement.
- **Verification report:** confirmed canonical name for the independent structured claim-level pass/fail result.
- **Failed publication run:** confirmed canonical name for an unpublished retained run that exhausted its two verification repair attempts.
- **Quiet week:** confirmed canonical name for a successful weekly scan that finds no qualifying release and creates no post.
- **Hybrid release discovery:** confirmed canonical name for official-registry monitoring plus validated web discovery.
- **Discovery provider:** confirmed canonical name for a replaceable adapter that returns candidate source URLs and metadata without deciding publication eligibility.
- **Secondary discovery provider:** confirmed canonical name for Brave Search in the first release.
- **Model tier:** confirmed canonical name for a configurable AI workload class rather than a hard-coded provider model identifier.
- **Resolved model:** confirmed canonical name for the exact provider model ID stored with a pipeline-stage result.
- **Edition cover:** confirmed canonical name for the locally rendered, reusable-template cover associated with a weekly roundup.
- **Source snapshot:** confirmed canonical name for a private, cleaned copy of a fetched source page retained for 30 days.
- **Release identity:** confirmed canonical name for the normalized provider, model, version, and release-type key used in update-aware deduplication.
- **Release follow-up:** confirmed canonical name for materially new evidence about a previously covered release.
- **Corrected news revision:** confirmed canonical name for an administrator-edited private version awaiting verification and publication.
- **Action-required notification:** confirmed canonical name for the deduplicated in-app and email alert tied to a failed or blocked run.
- **Degraded discovery:** confirmed canonical name for a run completed with the registry and only one broad-discovery provider.
- **Run budget:** confirmed canonical name for the configurable OpenAI spend and Brave query limits applied before each paid pipeline stage.
- **Pipeline preview:** confirmed canonical name for a manually started, fully verified run that stops before publication.
- **Preview publication:** confirmed canonical name for the atomic conversion of a revalidated pipeline preview into a public roundup and covered-release records.
- **News run:** confirmed canonical name for one durable scheduled, preview, or immediate-publish pipeline execution.
- **News job:** confirmed canonical name for one leased, restartable stage belonging to a news run.
- **Pending scheduled run:** confirmed canonical name for the single durable Monday request waiting behind an active run.
- **Stage retry:** confirmed canonical name for a checkpoint-preserving retry of one transiently failed news job.
- **Supported source document:** confirmed canonical name for an extractable public HTML, PDF, Markdown, or plain-text first-party document.
- **Safe source fetch:** confirmed canonical name for the restricted HTTP retrieval process applied before extraction.
- **Untrusted source content:** confirmed canonical name for all fetched material before bounded structured extraction.
- **Publication safety report:** confirmed canonical name for the deterministic and moderation results attached to a candidate edition.
- **Pinned news run:** confirmed canonical name for a preview or failed run exempted from normal 90-day deletion for investigation.
- **AI-news workspace:** confirmed canonical name for the dedicated administrator interface at `/admin/ai-news`.
- **Official-source registry:** confirmed canonical name for the curator-managed, audited set of active first-party provider endpoints and review-only discovery suggestions.
- **Automated-authorship disclosure:** confirmed canonical name for the public AI-generation and verification label, last-verified time, source count, and correction status shown on `MABlog_IA` content.
- **Site administrator:** confirmed canonical name for a user account carrying the PostgreSQL-backed administrator role and, therefore, AI-news curator authority.
- **Step-up authorization:** confirmed canonical name for the ten-minute, session-bound password and emailed-code verification required for high-impact administrator actions.
- **Pipeline readiness:** confirmed canonical name for the redacted preflight status of mandatory OpenAI access and degradable Brave Search and email delivery.
- **Schedule activation:** confirmed canonical name for the administrator-controlled transition from preview-only operation to automatic weekly runs after a successful verified preview.
- **Catch-up run:** confirmed canonical name for one overdue scheduled run that collapses one or more missed Mondays and resumes discovery from the last successful scan.
- **Compressed catch-up edition:** confirmed canonical name for the single catch-up roundup whose release sections may become short cited briefs to preserve complete coverage.
- **Activation preview:** confirmed canonical name for the real private live-service preview whose successful gated result authorizes an administrator to enable weekly scheduling.
- **Historical activation preview:** confirmed canonical name for the no-side-effect preview over an administrator-selected window of up to 30 days used to exercise the complete pipeline with a real qualifying release.
- **Localized post:** confirmed canonical name for one canonical post carrying English and Spanish content versions with shared identity, lifecycle, and engagement.
- **Automated carousel slot:** confirmed canonical name for the maximum one position a qualifying `MABlog_IA` post may occupy in the five-card homepage carousel.
- **Curator notification preference:** confirmed canonical name for an administrator's optional AI-news email delivery setting; in-app action-required alerts remain mandatory.
- **Source-monitoring window:** confirmed canonical name for the 30-day period in which cited authoritative pages are hash-checked and materially changed content is reverified.
- **Automated edition block:** confirmed canonical name for a typed, responsive overview, release, callout, or source-list block with stable bilingual identity and evidence references.
- **Core provider registry:** confirmed canonical name for the initial verified first-party source set covering OpenAI, Gemini, Claude, DeepSeek, and Kimi.
- **Synchronized correction:** confirmed canonical name for the accepted bilingual change set derived from a curator's edit in either language.
- **Adaptive technical digest:** confirmed canonical name for the length-limited weekly roundup format.
- **Release tag:** confirmed canonical name for stable provider, model-family, and release-type metadata attached to a weekly roundup.

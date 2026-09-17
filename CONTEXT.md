# MAblog

MAblog lets users maintain individual profiles and create posts. Authors can keep posts personal, grant other people access by email, or publish posts to a shared public posts page.

## Language

**Profile page**:
A page representing an individual user on MAblog.
_Avoid_: Blog, when referring to the user's profile page

**Post**:
An individual piece of blog content belonging to a user, composed of editable content blocks that can contain text, images, links, and videos.
_Avoid_: Blog, when referring to a single post

**Author**:
The user who owns a post and exclusively controls its access grants and publication to the public posts page.
_Avoid_: Editor, when referring to the post owner

**Automated news publisher**:
The non-interactive system-owned author identity named `MABlog_IA`. Only MAblog's backend news worker can act as it. Its profile and weekly published posts are public, but it has no password login or email-verification flow and cannot like content, invite collaborators, or access users' personal posts.
_Avoid_: Administrator, bot user, or private account

**Gated automatic publication**:
Publication of an automated news post without advance human review only after its required research, recency, factual-support, duplicate, citation, and content-safety checks pass. A failed gate leaves no incomplete post visible on the public posts page.
_Avoid_: Unconditional automatic publishing

**AI news curator**:
A site administrator with authority to access the AI-news workspace and review, edit, reject, preview, or publish posts owned by the automated news publisher. Every site administrator receives this authority. It does not apply to public or personal posts owned by human authors and does not grant access to their private content.
_Avoid_: Site-wide moderator

**Site administrator**:
A user account with an explicit PostgreSQL-backed administrator role. The local test administrator is seeded from environment configuration; administrators may promote or remove others through protected audited controls, but MAblog prevents removal of the final active administrator. Registration, email ownership, and post collaboration do not grant this role. Every site administrator is an AI news curator.
_Avoid_: Local test account, post author, editor

**Step-up authorization**:
A ten-minute authorization bound to one administrator session after recent password confirmation and an emailed one-time code. It is required for administrator role changes, manual publication, unpublication, and official-source activation or material changes, and is invalidated by password or email changes. Only the seeded test administrator may bypass it, and only in explicit local-development mode.
_Avoid_: Confirmation dialog, ordinary signed-in session

**Pipeline readiness**:
The redacted configuration and connectivity state shown before an AI-news run starts. OpenAI access is mandatory; missing Brave Search permits documented degraded discovery, and missing email delivery preserves in-app alerts while recording a delivery warning. Credentials and their raw values never appear in status responses or logs.
_Avoid_: Secret display, silent provider omission

**Schedule activation**:
The administrator-controlled transition from preview-only AI-news operation to automatic Monday runs after at least one complete preview passes every gate. PostgreSQL stores the enabled state and next-run time, while a deployment-level master kill switch can prevent new scheduled starts without canceling an active run.
_Avoid_: Automatic activation on installation

**Catch-up run**:
One uniquely keyed overdue scheduled run created after MAblog resumes from downtime. It collapses multiple missed Mondays into a research window starting from the last successful scan with the normal overlap, applies deduplication, and obeys every normal readiness, budget, and publication gate.
_Avoid_: One run per missed week, skipped schedule

**Compressed catch-up edition**:
The single roundup produced by a catch-up run when its window has too many releases for normal section lengths. Every qualifying release remains included, but sections may become short cited briefs below the normal minimum; all evidence, bilingual, citation, verification, and safety requirements remain unchanged.
_Avoid_: Catch-up series, silently omitted release

**Activation preview**:
The real private preview run using configured live services that must pass every normal production gate before an administrator can enable weekly scheduling. It runs within the ordinary budget and has no publication or successful-scan cursor side effects. Automated test results are engineering checks rather than schedule-activation requirements.
_Avoid_: Automated acceptance suite

**Historical activation preview**:
A private activation preview over an administrator-selected period of up to 30 days, used when the current period has no qualifying release. It must process at least one real release through the complete bilingual pipeline and has no publication, covered-release, or scan-cursor side effects.
_Avoid_: Quiet activation preview

**Localized post**:
One canonical post with English and Spanish content versions, a single public URL, one author and publication state, and shared likes and views. MAblog renders the selected language with English fallback, indexes both versions, deduplicates the post in search results, and replaces both versions atomically during publication or correction.
_Avoid_: Separate translated posts, combined bilingual page

**Automated carousel slot**:
The maximum one position that a verified `MABlog_IA` post may occupy in the five-card homepage carousel. It qualifies through the ordinary two-week user-like ranking and retains its automated-authorship disclosure; the system publisher cannot contribute likes.
_Avoid_: Reserved carousel placement, unlimited automated cards

**Curator notification preference**:
An administrator's personal setting for AI-news action-required email. It defaults to enabled for verified administrator addresses and may be muted, while deduplicated in-app alerts remain enabled for every active administrator.
_Avoid_: User notification preference, disabled in-app alert

**Source-monitoring window**:
The 30 days after an automated edition publishes during which MAblog hash-checks its cited authoritative pages. Material changes trigger claim reverification and a new contradiction automatically unpublishes the edition; an unavailable page leaves the edition public with a curator warning because the original evidence remains retained.
_Avoid_: Permanent source polling, silent source drift

**Automated edition block**:
A typed responsive overview, release, callout, or source-list block in a `MABlog_IA` post. English and Spanish variants share a stable section identity and evidence references; curators edit and reorder them through the bilingual correction interface. These blocks do not allow arbitrary canvas placement or model-generated executable markup.
_Avoid_: Freeform AI-news canvas block, generated HTML

**Rejected news edition**:
A previously public post from the automated news publisher that its AI news curator has unpublished because it did not meet the required quality. Public lists, search, and carousel results exclude it, while its content, source evidence, generation record, and rejection reason remain private for correction and possible republication.
_Avoid_: Deleted post

**Corrected news revision**:
A private administrator-edited version of a `MABlog_IA` post. It replaces the public version atomically only after citation integrity, factual verification, and English-Spanish consistency checks pass; the curator may unpublish the public version immediately while correction is pending.
_Avoid_: Direct public edit

**Synchronized correction**:
A bilingual change set created when an AI news curator edits either English or Spanish and accepts MAblog's proposed corresponding change in the other language. Verification begins only after both versions are accepted.
_Avoid_: Unreviewed automatic translation

**Action-required notification**:
One deduplicated in-app alert and one email tied to an automated-news run that exhausts retries, fails verification after repair, exceeds its spend limit, or otherwise requires an AI news curator. Successful publications and quiet weeks stay in the dashboard without email.
_Avoid_: Routine run notification

**Degraded discovery**:
A weekly run completed after the official registry scan succeeds and only one of OpenAI web search or Brave Search remains available after three retries. It may publish when every other gate passes and records a coverage warning; failure of both broad providers blocks publication.
_Avoid_: Complete discovery

**Run budget**:
The configured paid-service limit checked before every pipeline stage. The local defaults are USD 2 of OpenAI usage per run, USD 10 per calendar month, and 15 Brave Search queries per run. Reaching a limit blocks publication and alerts the AI news curator.
_Avoid_: Provider account balance

**Pipeline preview**:
A manually started execution of discovery, extraction, bilingual generation, and verification that stops before publication. It does not advance the scheduled scan cursor or mark releases as covered. The AI news curator may inspect it and separately publish it after every normal gate passes and source and duplicate state are rechecked.
_Avoid_: Draft post, scheduled run

**News run**:
One durable scheduled, preview, or immediate-publish execution of the automated-news pipeline, stored in PostgreSQL with its current stage, progress, costs, evidence, warnings, and terminal result.
_Avoid_: HTTP request, Redis task

**News job**:
One leased and restartable pipeline stage belonging to a news run. A dedicated Docker news worker claims jobs from PostgreSQL and checkpoints results before advancing the run.
_Avoid_: Indexing job

**Pending scheduled run**:
The one durable Monday publication request allowed to wait while another AI-news run is active. It recalculates its scan window and duplicate state when it eventually starts.
_Avoid_: Concurrent news run

**Stage retry**:
A checkpoint-preserving retry of one transiently failed news job after approximately 1, 5, and 20 minutes, or a longer provider-directed delay. After three failures the run becomes action-required without advancing the scan cursor.
_Avoid_: Full-run restart, verification repair

**Supported source document**:
A public HTML page, PDF, Markdown file, or plain-text file that MAblog can extract as first-party release evidence. Login-gated, paywalled, social-only, audio-only, video-only, and unextractable client-rendered announcements do not qualify unless they link to such a document.
_Avoid_: Search-result snippet

**Safe source fetch**:
An HTTPS retrieval that resolves only to public Internet addresses, revalidates each redirect, honors `robots.txt`, identifies the MAblog crawler, and enforces five redirects, a 20-second timeout, a 10 MB body limit, supported media types, and no credentials or nonstandard ports.
_Avoid_: Browser automation, unrestricted URL fetch

**Untrusted source content**:
All material fetched from an external page or document before extraction. MAblog removes active, hidden, and instruction-like content, supplies only bounded excerpts through strict schemas, and gives downstream AI calls no tools, credentials, conversation state, or network access.
_Avoid_: Trusted prompt context

**Publication safety report**:
The private result of deterministic secret, personal-data, URL, markup, and quotation checks plus moderation of both localized versions and public image descriptions. A high-confidence failure blocks automatic publication and alerts the AI news curator.
_Avoid_: Verification report

**Pinned news run**:
An unpublished preview or failed news run that an AI news curator has exempted from the normal 90-day deletion period for investigation. Unpinning returns it to the applicable retention schedule.
_Avoid_: Permanent published-edition history

**AI-news workspace**:
The administrator-only `/admin/ai-news` interface for monitoring schedules, progress, budgets, alerts, runs, candidates, sources, evidence, verification and safety reports, previews, curator actions, and the official-source registry.
_Avoid_: Public publisher profile

**Official-source registry**:
The audited set of first-party AI provider endpoints used by hybrid release discovery. AI news curators add, test, edit, disable, re-enable, and approve sources in the AI-news workspace. Web-discovered providers remain inactive review suggestions until a curator approves them after ownership, HTTPS safety, format, and fetch checks.
_Avoid_: Automatically trusted web discovery

**Core provider registry**:
The first local set of verified official announcement, documentation, model-card, changelog, and release-repository sources for OpenAI, Google DeepMind/Gemini, Anthropic/Claude, DeepSeek, and Moonshot AI/Kimi. Broader discovery creates inactive suggestions for other providers rather than automatically expanding this set.
_Avoid_: News aggregator seed list, unofficial mirror

**Automated-authorship disclosure**:
The public `AI-generated · verified by MAblog` label on the `MABlog_IA` profile and posts, accompanied by the last verification time and cited-source count. It links to a reader-friendly process explanation, while corrected editions also display an updated time and concise correction note. Private evidence, scores, prompts, costs, and logs remain restricted to authorized operations.
_Avoid_: Unlabeled automated article

**Model release news**:
News about a publicly announced new AI model or meaningful lifecycle update to an existing proprietary API or open-weight model. Qualifying updates include new model versions, API or weight availability, major capability, modality, or context-window changes, and material access, pricing, licensing, or deprecation changes. Routine fixes and marketing-only benchmark claims do not qualify.
_Avoid_: General AI news, public model

**Authoritative release source**:
A first-party provider announcement, model card, official documentation, API changelog, release repository, or provider-authored technical report that establishes a model release or update. Independent reporting may add context but cannot establish the event by itself.
_Avoid_: Rumor, unattributed report

**Weekly model update**:
One automatically generated public roundup from `MABlog_IA` covering qualifying model release news for a weekly research period. It begins with an overview and contains a separately titled, independently sourced section for each qualifying release. Complete English and Spanish versions share the same claims and evidence; MAblog shows the selected interface language and falls back to English. Its default publication schedule is Monday at 09:00 in the `Europe/Madrid` timezone and is configurable through deployment settings.
_Avoid_: Daily edition

**Localized roundup**:
The English or Spanish representation of one weekly model update. Both representations express the same source-grounded facts and retain the same evidence links.
_Avoid_: Independent translated post

**Claim evidence**:
A stored source excerpt and its source metadata that support one factual statement in a weekly model update.
_Avoid_: Citation without supporting text

**Verification report**:
The structured result of a separate AI pass that marks every factual claim as supported, contradicted, or unsupported against its claim evidence. Automatic publication requires every claim to be supported.
_Avoid_: Writer self-check

**Failed publication run**:
A private retained weekly run that still contains unsupported or contradicted claims after two targeted repair attempts. It includes the candidate editions, evidence, and verification reports, publishes no post, and requires an AI news curator notification.
_Avoid_: Rejected news edition, which was already public before a curator unpublished it

**Reader citation**:
A clickable numbered citation placed after the paragraph it supports in a weekly model update. Each release section also contains a compact source list, and MAblog labels authoritative first-party sources separately from independent context sources.
_Avoid_: Unlabeled link dump

**Weekly scan window**:
The research interval from 48 hours before the last successful weekly scan through the current run. The first scan covers nine days, and failed runs do not advance the cursor. Canonical-source and release-identity deduplication remove announcements already covered.
_Avoid_: Previous calendar week

**Quiet week**:
A successful weekly scan that finds no qualifying model release news. It advances the scan cursor and retains its discovery record for the AI news curator without creating a public post.
_Avoid_: Failed run, empty roundup

**Hybrid release discovery**:
The combination of monitoring a maintained registry of first-party feeds, changelogs, documentation pages, and release repositories with broad web discovery for new providers. Web results are candidates only until their domain and page pass authoritative first-party validation.
_Avoid_: Unverified web search ingestion

**Discovery provider**:
A replaceable adapter that returns candidate URLs and search metadata for the weekly research pipeline. OpenAI web search and Brave Search supply separate result sets that MAblog merges and validates; neither provider decides that a source is authoritative or publishable.
_Avoid_: Source authority

**Model tier**:
A configurable AI workload class. The smaller tier classifies candidates and extracts structured evidence; the stronger tier writes, repairs, and independently verifies localized roundups. Each stage records the resolved provider model and prompt version.
_Avoid_: Hard-coded model name

**Resolved model**:
The exact provider model ID recorded for one AI pipeline-stage result. The first-release defaults are `gpt-5.6-luna` for the smaller tier and `gpt-5.6-terra` for the stronger tier, while deployment settings may replace either default.
_Avoid_: Model tier

**Adaptive technical digest**:
The weekly model-update format: a 100-150 word overview, 150-350 words for each qualifying release, and a target ceiling of approximately 3,000 words in each language. Sections become shorter when needed but still explain the change, availability, supported capabilities, practical significance, and known limitations.
_Avoid_: Fixed-length article

**Edition cover**:
A locally rendered cover for a weekly model update, produced from MAblog's reusable dark celestial template with an abstract AI motif and edition date. It uses no provider logos or copied announcement artwork and has English and Spanish alternative text.
_Avoid_: Provider artwork

**Source snapshot**:
A private cleaned copy of a fetched authoritative or context page retained for 30 days to support debugging and curator review. Source metadata, content hashes, and exact claim-evidence excerpts remain after the snapshot expires.
_Avoid_: Claim evidence, public quotation archive

**Release identity**:
The normalized provider, model, version, and release-type key used with canonical URLs and content hashes to compare a discovered announcement with prior coverage.
_Avoid_: Source URL alone

**Release follow-up**:
A section reporting materially new, source-supported facts about a release identity covered in an earlier weekly model update. It links to that earlier MAblog edition.
_Avoid_: Duplicate announcement

**Release tag**:
A stable language-neutral tag identifier attached to a weekly model update for AI, provider, model family, or release type. Its English and Spanish display labels may differ without changing filtering or search behavior.
_Avoid_: Category

**Personal post**:
A post accessible only to its author and people the author has allowed to access it.
_Avoid_: Public post

**Access grant**:
Permission from an author for another registered MAblog user, identified by email address, to view or edit one specific personal post. Each post has its own access grants, managed only by its author.

**Viewer**:
A person given permission to read a personal post without editing it.

**Editor**:
A person granted editing access to a post, whose edits its author can approve or reject. An editor cannot delete the post.
_Avoid_: Author, when referring only to a recipient of editing permission

**Edit review**:
The author's decision to approve or reject an editor's proposed changes before they become visible to readers. Each content block and a change to the overall canvas layout are reviewed separately.

**Approved version**:
The version of a post that readers can see while an editor's proposed changes await the author's review.

**Pending changes**:
An editor's submitted changes awaiting the author's approval or rejection, retained for review even if the editor's access is removed. They do not replace the approved version shown to readers.

**Public post**:
A post its author has chosen to publish on the shared public posts page, which readers can access without signing in.

**Public posts page**:
The shared page containing posts their authors have chosen to publish there.
_Avoid_: Personal feed

**Carousel**:
A rotating collection of image cards that highlights selected posts.

**Carousel card**:
An image supplied by a user that links to its associated post.
_Avoid_: Slide

**Featured post**:
A publicly published post selected to appear in the carousel based on the likes it received during the preceding two weeks.

**Like**:
A reader's expression of appreciation for a post, used to rank posts for the carousel.

**Uploaded video**:
A video file supplied directly to MAblog for inclusion in a post.

**Embedded video**:
A video hosted elsewhere and presented within a post through an external video link.

**Post composer**:
The visual writing interface where a user creates or revises a post by drawing and arranging content blocks on its canvas.
_Avoid_: Editor alone, which denotes a person granted editing access

**Post discovery**:
Finding a ranked list of posts relevant to a reader's description of what they want to read.

**Search passage**:
An indexable section extracted only from an approved post version. It retains its post and block identity for permission checks and reader deep links.

**Hybrid retrieval**:
The combination of PostgreSQL keyword relevance and semantic vector similarity, merged by reciprocal-rank fusion before small like and freshness adjustments.

**Grounded explanation**:
A streamed description of why retrieved MAblog posts match a search. It may use only the permission-checked passages supplied for that search and names sources through clickable numeric citations.

**Personal cloud processing**:
An account setting that permits approved personal content or personal search evidence to be sent to the configured cloud AI provider. A shared personal post requires consent from both its author and the searching reader for semantic retrieval; keyword retrieval remains available without it.

**Indexing job**:
A durable PostgreSQL work item that asks the background worker to embed the latest approved revision of a post. Older revisions cannot overwrite newer search passages.

**Personal results**:
The first post-discovery section, containing relevant personal posts owned by the reader or explicitly shared with them.

**Public results**:
The second post-discovery section, containing relevant publicly published posts.

**Email verification**:
A user's confirmation of control over their MAblog email address by entering a one-time code delivered by email. MAblog requires this confirmation to be renewed every seven days.

**Unpublishing**:
The creator's withdrawal of a post from public visibility, returning it to personal visibility while retaining its existing access grants.

**Working draft**:
An editor's saved work on a post that has not yet been submitted for the author's review.
_Avoid_: Pending changes, which have already been submitted

**Content block**:
An individually editable region of a post with user-chosen width, height, position, rotation, and layer order. A block can combine text, images, links, and videos.
_Avoid_: Post, when referring to just one unit of its content

**Post canvas**:
The user-sized composition surface on which a post's content blocks are freely positioned and rotated. Its drag-adjustable bounds hide outside content without deleting it, allowing that content to reappear when the canvas expands.

**Competing block changes**:
Alternative submitted changes to the same content block. The creator compares them and approves the preferred version, rejecting the competing alternative.

**Layer order**:
The front-to-back arrangement of content blocks, determining which block appears above another where they overlap.

**Canvas layout change**:
An editor's proposed adjustment to the post canvas's bounds, reviewed separately by the author before it affects the reader-visible layout.

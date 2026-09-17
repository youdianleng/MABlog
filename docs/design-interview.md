# MAblog design interview

Status: local implementation authorized by the user on 2026-09-07 and delivered. The interview below preserves the initial decision history; the later confirmed search/RAG interview in [rag-design.md](rag-design.md) supersedes its original future-discovery assumptions. Implementation defaults and amendments are recorded in [design-review.md](design-review.md), with verification in [build-progress.md](build-progress.md).

## Agreed location

Use the existing project directory: `F:\AI_Roadmap_2026\MAblog`.

## Requirements supplied by the user

- A personal game/anime-style blog site supporting multiple users.
- Use an Onmyoji-inspired visual style, as selected by the user.
- A clickable carousel whose cards advance automatically. Each card uses a user-supplied image and links to the associated blog content.
- Next.js frontend using shadcn/ui and Tailwind CSS for design, with FastAPI as the backend.
- Use Zustand for client-side state management later, as requested by the user.
- Keep the frontend and backend in separate top-level folders: `frontend/` for Next.js and `backend/` for FastAPI. This separation is required to simplify future production deployment.
- Docker-based data storage, with PostgreSQL permitted.
- Redis to accelerate selected data access.
- Prepare for future AI discovery that returns relevant posts in Personal and Public result sections, respecting post-access permissions.
- Maintain `docs/build-progress.md` with marked completion status and a short-to-medium description for every meaningful build step, including affected files and actual verification results.
- Document every project function with a suitable comment or docstring, and explain complex logic and hard-coded business values with nearby comments. Keep comments accurate as code changes.
- Record these ongoing development requirements in the project-level `AGENTS.md` for both frontend and backend work.

## First design round

1. Project directory: resolved in favor of the existing directory above.
2. Publishing model: partially resolved. Each user has their own profile page and can create personal posts or publish posts to one shared public posts page. Personal posts are accessible only to their author and people the author explicitly allows by email address. Access is granted separately for each post, and each recipient receives view-only or editing permission for that post. Editors can edit post content but cannot delete the post or manage access, and the creator can approve or reject their edits. Readers continue to see the approved version until the creator approves the changes. Only the creator manages invitations and access permissions. Only the creator can publish a post to the shared public posts page or unpublish it back to personal visibility. Existing sharing permissions are preserved when it is unpublished. Visitors can read public posts without signing in. Invitations require an existing MAblog account for the supplied email. If no matching account exists, reject the invitation and show the creator Email not found.
3. Visual direction: Onmyoji-inspired style confirmed, with the horizontal carousel described below. Exact palette, typography, artwork, and layout details remain to be refined; ink, parchment, and crimson are proposed visual elements.
4. Supported post content: text, images, links, and videos, as selected by the user. Dedicated code-block support was not selected. Both direct video uploads and embedded video links are supported. Users write and format posts in a freeform canvas editor. They can draw blocks with chosen width and height, drag them to their desired positions, and rotate them. On phones, the reader view preserves the arrangement, scales it to fit the screen, and allows zooming. The creator approves or rejects changes separately for each block. For two competing edits to the same block, the creator compares both, approves the preferred version, and the other version is rejected automatically. Detailed controls remain to be refined.
5. Future discovery: users describe what they want to read and receive relevant posts grouped into Personal first and Public second. Search includes their own personal posts, personal posts explicitly shared with them, and public posts, subject to current access permissions. The prior relevance-ranking requirement carries over within each group. Saved favorites, personalized recommendations, and generated answers are not selected requirements. AI discovery remains a future feature.
6. Physical storage location: Docker-managed persistent volumes for the database and uploaded media, confirmed by the user. Project files remain in F:\AI_Roadmap_2026\MAblog; the data volumes need not be physically inside that folder.
7. First release environment: a working local version on the user's computer using Docker Compose. Production deployment will be discussed in the future and is outside the current implementation scope.
8. Interface languages: English as the default option and Spanish as the second available language, confirmed by the user. Both are included in the first version. Post-content translation and cross-language search behavior have not been requested or decided.

Recommendations are not accepted decisions.

## Interview preferences and current question

The user wants one question at a time. This supersedes the original grouped-question format. The original broad topics have been addressed. Follow-up questions clarify material product decisions; remaining routine details will be made concrete and explicitly marked as proposals for the final design review.

Current question: none pending. The user authorized building and later requested a vertical collection filter plus a password-only default local test administrator; these amendments are recorded in the design review.

## Agreed personal-post sharing model

- Personal posts are accessible to the author and explicitly authorized recipients.
- The author identifies recipients using their email addresses.
- The email address must belong to an existing MAblog account. If no matching account exists, reject the invitation and show the creator the message Email not found.
- Do not retain a pending invitation for an unregistered email address. The user rejected that earlier recommendation.
- This lookup concerns registration in MAblog; it is not a check of whether an external mailbox exists. The notification is feedback to the creator during the invitation action.
- The author can grant view-only or editing permission.
- Access grants apply separately to each individual post, as explicitly confirmed by the user.
- Only the creator can invite other people and manage their access permissions. Editors cannot extend access to others.
- This replaces the earlier unaccepted recommendation that personal posts be author-only.

Removing an editor's access does not discard changes they already submitted; the creator can still review those changes. Access removal does not preserve any editing privilege for the former editor. Public reading remains available for a post that is publicly published. Email verification follows the agreed account flow; a separate invitation email has not been requested. No invitation email or notification service has been authorized or selected.

Future design implication: search, retrieval, and caches must respect the eventual post-access rules. Their implementation has not been selected.

## Agreed editing and review requirements

- Editors can edit post content but cannot delete the post, invite other people, change access permissions, or publish it publicly.
- Editors can save drafts while working, then explicitly click Submit for approval when ready.
- Saving a working draft is distinct from submitting it for review.
- Editing targets individual blocks within a post, following the newly requested modular composition model.
- Approving changes to one block leaves pending changes to unrelated blocks available for creator review. For two competing edits to the same block, the creator compares both, chooses the preferred version, and the other is rejected automatically.
- The creator approves or rejects proposed changes separately for each block. One block can be approved while another remains pending.
- Editors can propose resizing the overall canvas. The creator reviews this separately as a layout change before it becomes visible to readers.
- When resolving two competing submissions for the same block, approving the preferred version automatically rejects the other version. The decision is made by the creator, consistent with the existing review authority; no editor-review role was introduced.
- Editor changes become visible to readers only after the creator approves them. While changes await review, readers continue to see the previously approved version.
- Rejecting proposed changes leaves the approved reader-visible version unchanged.
- Already-submitted changes remain available for the creator to approve or reject after the editor's access is removed.
- Creator is understood as the post's author/owner in the existing glossary; the user has not introduced a separate role.
- Only the creator can publish a post to the shared public posts page or unpublish it back to personal visibility. Editors cannot change this publication state.
- Unpublishing retains existing per-post sharing permissions, while removing public access and eligibility for public listings, the carousel, and public search.

Proposed first-version defaults for block operations, post metadata, and draft visibility are specified in design-review.md section D3 and await confirmation. The earlier proposal to require resubmission whenever the whole post changes was not accepted and must not be treated as the conflict policy. The approval-before-visibility rule is accepted; its technical implementation has not been selected.

## Agreed visual and carousel requirements

- The site should use an Onmyoji-inspired style.
- The carousel is horizontal and automatically advances, retaining the original clickable image-to-post behavior.
- It contains the five publicly published posts with the most likes received during the preceding two weeks (a rolling 14-day window). The window applies to when likes were received, not when a post was published. Personal and privately shared posts are not eligible.
- Posts/cards use fade-in and fade-out effects.
- In the user's words, only the center post appears complete; neighboring cards are more transparent.
- The approved first-edition homepage art uses three transparent, half-body anime characters: a white-haired cyberpunk catgirl, a technical robot, and a bespectacled reader holding a book. Their visible heights and baselines remain equal behind the carousel.
- Two characters appear at once and advance every 3.5 seconds in this loop: catgirl-left/robot-right, robot-left/reader-right, then reader-left/catgirl-right. The left position mirrors its character to face left, while the right position faces right.
- The approved Discover background is a full-width black celestial scene behind the headline, characters, carousel cards, and controls. Three centered gold and crimson elliptical rings move subtly, while scattered stars inside and outside the rings drift independently instead of following the ring paths. The discarded black-hole concept is not part of the site.

Proposed first-version defaults for carousel appearance, timing, controls, ties, empty/fewer-card states, and like semantics are specified in design-review.md sections D6 and D7 and await confirmation.

These open details are not defaults or accepted requirements.

## Agreed post content

- Posts support text, images, links, and videos. These content types can be combined within the same block.
- Users create and edit posts through a freeform canvas editor with independently editable content blocks. The specific editor library has not been selected.
- Users can add videos through either direct uploads or embedded video links.
- Uploaded videos are supplied to the site as files; embedded videos remain hosted at their external source. The embedding-provider list and storage implementation remain unresolved.
- Dedicated code-block support was part of an earlier recommendation and was not selected by the user.

Proposed first-version defaults for writing controls, covers, uploads, and supported embed providers are specified in design-review.md sections D2, D4, and D5 and await confirmation.

## Agreed block-composition direction

- A post is assembled from independently editable content blocks.
- Users choose the overall canvas size through a drag-based interface similar to adjusting a crop area. Width and height are user-controlled; dragging edges/corners is the intended interaction.
- The previous fixed-width, automatically growing-height proposal was not accepted.
- Shrinking the canvas hides content outside its boundaries without deleting any blocks or their content. Enlarging the canvas reveals that content again.
- Canvas resizing changes the visible bounds; it retains the underlying block sizes and arrangement.
- A single block can contain text, images, links, and videos together; blocks are not restricted to a single content type.
- Users draw blocks with their chosen width and height, drag them to positions they choose, and rotate them.
- Blocks may overlap. Bring forward and Send backward controls let users arrange the visible layer order.
- If content exceeds a block's chosen height, it scrolls inside the block. The block keeps its chosen size.
- This is a freeform canvas composition model. It supersedes the earlier WordPress-style content-flow proposal, which the user found too static.
- Other submitted edits to unrelated blocks stay available for creator approval. A competing alternative to the same block is rejected automatically when the creator selects the preferred version.
- Block dimensions and placement are user-controlled. Automatic content-based sizing and fixed-height page slicing are not accepted rules.
- On phones, the post's reading view preserves the authored arrangement, scales it to fit the screen, and allows zooming for small text. This settles mobile presentation; it does not separately specify the mobile authoring interface.
- The requested Next.js and FastAPI stack remains the agreed technology direction. Canvas describes the user-facing composition surface; it does not select a rendering technology.

The approved-version and creator-review rules apply to editor changes, including layout changes. Review is per block: approving one block does not automatically approve other submitted block changes. For two competing versions of the same block, the creator compares them and approves the preferred version; the competing version is rejected automatically.

Editor canvas-resizing proposals require separate creator review, as confirmed by the user. Proposed reading-order and content-control defaults are specified in design-review.md section D2 and await confirmation. Freehand illustration tools, automatic reflow, and separate device layouts have not been requested or accepted.

## Agreed future discovery experience

- Users describe what they want to read and receive relevant posts in two labeled sections: Personal first, then Public.
- Personal contains matching personal posts owned by the current user or explicitly shared with them; Public contains matching publicly published posts.
- Results respect the current user's post-access permissions.
- The existing relevance-ranking requirement carries over within each section; section order is Personal then Public.
- The user's word tags refers to section headings in their example. Clickable filters or content-topic tags were not requested by this decision.
- This is the intended future AI discovery experience; it does not add AI search to the initial implementation scope.
- Titles, cover images, and short previews were suggested for result presentation but have not been separately confirmed.

Still to clarify: empty-section behavior and result pagination; which content versions can be searched; how ranking and results should be evaluated; whether initial non-AI search is needed; and whether saved favorites are a separate feature. Retrieval must honor the agreed access rules. No embedding model or answer-generation service has been selected.

## Agreed storage approach

- Docker is the primary approach for the site's data services and storage.
- Database records and uploaded media use Docker-managed persistent volumes.
- Project files remain in F:\AI_Roadmap_2026\MAblog. Docker-managed data volumes do not have to be physically located in that folder.
- This applies to uploaded images and video files. Embedded videos remain hosted by their external source, as recorded in the content model.

Proposed service layout, cache behavior, backup/restore, and operational defaults are specified in design-review.md sections D9-D11 and await confirmation. Container replacement must retain durable data through the chosen volumes.

## Agreed first release scope

- Build the first working version for local use on the user's computer with Docker Compose.
- Discuss a production version and public deployment in the future. Current work does not include deployment to a public server.
- Future AI discovery remains a later feature, with the agreed behavior captured above.

The local application still needs the agreed multi-user ownership, sharing, and review behavior. Local execution does not remove those product requirements.

## Agreed interface languages

- English is the first/default interface language.
- Spanish is the second available interface language.
- Users need a way to select the interface language. The control's placement and preference-storage mechanism remain implementation details.
- This decision covers menus, buttons, and interface messages. It does not introduce automatic translation of user-written posts.

Content-language handling and future cross-language discovery can be refined separately from interface localization.

## Agreed sign-in requirements

- Registration is open to anyone, with the agreed email-verification step required for account activation.
- Users can sign in using either their email address or their username, together with a password.
- Email verification is required and must be renewed every week (seven days).
- Verification uses a one-time code delivered by email, entered after the username/email and password step.
- After seven days, the user's signed-in session expires and they are treated as logged out.
- To resume access to personal/shared posts or account actions after expiry, the user must sign in again and complete email verification. Public posts remain readable while logged out.
- This specifies expiry and reauthentication. It does not request automatic email delivery while the user is inactive.
- Visitors can read public posts and the shared public posts page without signing in.
- Sign-in is required for personal/shared posts and account actions such as liking or editing.

Proposed verification, session-clock, recovery, and unsaved-work defaults are specified in design-review.md section D8 and await confirmation. No external email messages have been authorized or sent.

## Agreed local email delivery

- Use Mailpit in Docker as the first version's local test inbox.
- Verification emails are captured and read in a local browser inbox during testing.
- Initial local testing does not deliver these messages to real external mailboxes. Real mailbox delivery can be configured later, alongside the future production discussion.
- The verification-code workflow is exercised locally; captured messages simulate delivery and do not establish ownership of real external email addresses.

No external email provider or credentials are needed for the agreed local testing setup. No real email has been sent during this design interview.

## Later branches of the design interview

- Publishing model -> registration, authentication, roles, ownership, visibility, moderation, and author profiles.
- Content type -> editor, drafts, publishing lifecycle, tags, uploads, and image limits.
- Publishing model and visual direction -> carousel curation, destinations, timing, navigation, and behavior when featured content is unpublished.
- Discovery intent and languages -> initial search, bookmarks, retrieval permissions, future indexing, and RAG scope.
- Storage and release environment -> service layout, persistent storage, backup/restore, operational setup, and cache behavior.
- Visual direction and languages -> branding, page layouts, responsive behavior, and accessibility.
- Agreed scope -> acceptance criteria and final confirmation of shared understanding.

These are discussion topics, not a commitment to implement every possible feature.

## Environment facts checked on 2026-09-06

- The chosen project directory existed and was empty before these documents were saved.
- Docker CLI 28.3.2 and Compose v2.38.2-desktop.1 are installed.
- Docker's Linux daemon was unreachable during inspection; runtime verification will require Docker Desktop to be running.
- Node.js 22.20.0, npm 11.6.1, Git 2.48.1, and Python are available. Python 3.11 and 3.10 are also listed alongside the default 3.14.6.

## Reference findings

- [Onmyoji official site](https://en.onmyojigame.com/): inspected page text includes image-rich character content, news, videos, and community references. Proposed adaptations include image-led article cards and author profiles. No rendered screenshot was inspected.
- [Genshin Impact official site](https://genshin.hoyoverse.com/en/home): did not expose extractable layout text during inspection; its visual composition was not verified.
- [Docker Compose application model](https://docs.docker.com/compose/intro/compose-application-model/): supports separate services in a multi-container application. Separate frontend, API, database, and cache services are a proposal, pending agreement.
- [Docker volumes](https://docs.docker.com/engine/storage/volumes/): persistent volumes exist independently of individual containers. Database records and uploaded media require explicit durable storage.
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/): Redis supports persistence options and can also serve as a rebuildable cache. Using it for cached public feeds and carousel metadata is a proposal.
- [pgvector](https://github.com/pgvector/pgvector): a possible future PostgreSQL extension for similarity search. No embedding model, vector dimensions, or answer-generation service has been selected.
- [Mailpit Docker documentation](https://mailpit.axllent.org/docs/install/docker/): official Docker images and a Compose example support a local SMTP capture service and browser inbox for development.
- [Mailpit SMTP relay documentation](https://mailpit.axllent.org/docs/configuration/smtp-relay/): delivery to external mailboxes requires an upstream relay and release/relay configuration. A captured development email alone does not verify control of a real mailbox.
- [WordPress block editor](https://wordpress.org/documentation/article/wordpress-block-editor/): blocks represent content elements such as paragraphs, images, and videos. This was an earlier reference; the user subsequently chose a more flexible freeform canvas model. It does not settle MAblog's approval rules.
- [Working with blocks](https://wordpress.org/documentation/article/work-with-blocks/) and [Moving blocks](https://wordpress.org/documentation/article/moving-blocks/): document insertion, editing, removal, grouping, and rearrangement. Fixed-height page slices are not the documented block definition.

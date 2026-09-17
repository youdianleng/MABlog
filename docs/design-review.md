# MAblog: local version design review

Prepared 2026-09-07. Status: implementation authorized on 2026-09-07 after the user reviewed and amended this design.

The requirements below come from the design interview. On 2026-09-07 the user instructed us to start building after adding the stack, folder separation, progress tracking, and code-comment requirements. The previously proposed defaults in section 2 are the working defaults for this local implementation and can be adjusted as the user tests the site.

The canonical project and documentation location is `F:\AI_Roadmap_2026\MAblog`. This review copy is provided in the conversation's outputs folder for convenient reading.

## 1. Agreed product behavior

### Site and accounts

- Build a personal, multi-user blog site with an Onmyoji-inspired appearance.
- Each user has a profile and can create personal posts or publish posts to a shared public posts page.
- Public posts can be read without signing in. Personal/shared posts and actions such as editing and liking require sign-in.
- Anyone can register. Sign-in accepts email or username plus a password, with verification by a one-time email code.
- Signed-in access expires after seven days. The next use of protected features requires sign-in and email verification again; public reading remains available.
- English is the default interface language; Spanish is also available.

### Sharing and creator authority

- Access is granted separately for each post, using a registered user's email address, with view-only or editing permission.
- If the email is not registered, reject the invitation and show the creator **Email not found**. Do not create an invitation waiting for future registration.
- Only the creator can manage access, delete the post, publish it publicly, or unpublish it.
- Unpublishing returns the post to personal visibility, preserves existing access grants, and removes public access and eligibility for public listings, the carousel, and future public search.
- Removing an editor's access preserves changes they have already submitted for creator review.

### Freeform post composition

- A post consists of independently editable blocks on a freeform canvas.
- Users draw blocks at their chosen width and height, drag them to their chosen positions, and rotate them.
- Each block can contain text, images, links, and videos together.
- Videos support direct uploads and external video embeds.
- Blocks can overlap, with **Bring forward** and **Send backward** controls.
- When content exceeds a block's height, it scrolls inside the block; the block retains its chosen size.
- Users resize the overall canvas by dragging its boundaries, like adjusting a crop area. Neither a fixed canvas width nor automatic downward growth is a requirement.
- Shrinking the canvas hides out-of-bounds content without deleting it or changing the underlying block arrangement. Expanding it reveals that content again.
- On phones, the reading view preserves the composition, scales it to fit, and allows zooming.

### Drafts, review, and conflicts

- Editors save working drafts and explicitly click **Submit for approval** when ready.
- Readers continue to see approved content until the creator approves changes.
- The creator approves or rejects changes separately for each block.
- For competing edits to the same block, the creator compares the versions and approves the preferred version. The competing alternative is automatically rejected. Pending changes to unrelated blocks remain available for review.
- Editors can propose changes to the overall canvas size. These are reviewed separately by the creator as layout changes.

### Homepage carousel

- A horizontal, clickable carousel features the five public posts with the most likes received during the preceding 14 days.
- The window concerns the time of the likes, not the age of the post.
- Cards use user-supplied images and open their corresponding posts.
- The center card appears complete; neighboring cards are more transparent.
- The carousel advances automatically with fade-in/fade-out effects.
- Equal-height half-body character art sits behind the carousel in two outward-facing edge positions. The 3.5-second sequence is catgirl/robot, robot/reader, then reader/catgirl; reduced-motion mode keeps the first pair static.
- The Discover hero uses the approved full-width black background with three centered gold/crimson elliptical rings and independently drifting stars distributed inside and outside them. This celestial layer sits behind all hero content and becomes static when reduced motion is requested; no black hole appears in the delivered design.

### Local delivery and future discovery

- First build a working local version with Next.js, shadcn/ui, and Tailwind CSS for the frontend; FastAPI for the backend; and PostgreSQL, Redis, and Docker Compose. Production deployment will be discussed later.
- Use Zustand for client-side state management later.
- Keep the frontend and backend in separate top-level folders: `frontend/` for Next.js and `backend/` for FastAPI. This separation is required to simplify future production deployment.
- Database records and uploaded media use Docker-managed persistent volumes. Those volumes need not physically reside in the F: project folder.
- Mailpit provides a local browser inbox for verification emails. This exercises the verification workflow without delivery to real mailboxes; real email delivery is a future configuration task.
- Future AI discovery accepts a description of what the reader wants and returns relevant posts, grouped into **Personal** first and **Public** second, ranked within each group.
- Personal results include owned personal posts and posts explicitly shared with the reader. Public results include publicly published posts. Retrieval respects current access permissions.
- AI discovery is a later feature; this first version establishes the content and permission model it will need.

### Build records and code documentation

- Maintain `docs/build-progress.md` throughout the build. Mark completed steps and give each a short-to-medium description of what changed and why, the affected files, and the actual verification result.
- Keep completed, in-progress, pending, and blocked work clearly identified. Record remaining limitations and update the log as features, fixes, infrastructure, and documentation are delivered.
- Document every project function, including backend handlers, methods, frontend components, hooks, helpers, and callbacks. Use Python docstrings and frontend comments or JSDoc/TSDoc, with detail appropriate to the function.
- Add nearby comments explaining complex logic and hard-coded business values, including their purpose, units, assumptions, and relevant edge cases. Keep these comments accurate when behavior changes.
- Preserve these working requirements in the project-level `AGENTS.md` so they apply to future work in both application folders.

## 2. Local implementation defaults

These fill in the remaining choices for a complete first implementation. Previously confirmed stack choices are repeated for context.

### D1. Branding, profiles, and navigation

Use **MAblog** as the initial working site name. Use parchment backgrounds, dark ink colors, crimson accents, restrained gold details, and original decorative artwork. Keep reading and editing controls clear and legible.

Public profiles show username, display name, avatar, short biography, and public posts. Email addresses and access grants stay in account/sharing screens. A signed-in workspace provides **My posts**, **Shared with me**, and **Review requests**. The language switcher remembers the user's choice.

### D2. Canvas and writing controls

Start a new post with a 1200 by 900 canvas as an editable starting size. Provide drag handles and numeric fields for precise canvas/block sizing, position, and rotation; this starting size is not a fixed-width restriction. The canvas boundary can move across the composition without moving the blocks underneath it.

Provide headings, bold/italic text, lists, links, image insertion, video insertion, and embedded video insertion inside blocks. Include undo/redo for unsaved editing, block duplication, and a layer list for selecting overlapping blocks. Preserve a logical content order separately from the visible front-to-back order, with controls to adjust it. This supports keyboard navigation and later text extraction.

### D3. Editor permissions and review details

Editors can propose adding, removing, duplicating, moving, resizing, rotating, and restacking blocks, as well as editing their contents. Removing a block is a content change requiring approval; it is distinct from deleting the entire post, which remains creator-only.

Working drafts are private to the person editing until submitted. After submission, the creator and submitting editor can inspect the proposal while that editor still has access. Creators save their own changes directly; collaborators' changes require review.

Post title, summary, and cover-image changes can also be proposed by editors and reviewed as a separate **Post details** change. Canvas bounds are a separate **Canvas layout** change. Neither action grants editors control of sharing, publishing, unpublishing, or deletion.

For more than two competing proposals for the same block, accepting one rejects the other pending alternatives to that block at the time of the decision. Apply the same conflict rule to competing canvas or post-details proposals. Approval is explicit; concurrent requests cannot silently overwrite a version already approved by the creator.

Submitted proposals are kept as review records when rejected. Revoked users lose further access to private post data and editing operations; revocation does not delete already-submitted review records. Saved but unsubmitted work is retained, but is unavailable through that post until access is restored.

### D4. Post title and cover

Allow incomplete personal drafts. Require a title and an uploaded cover image before a post is published publicly, so every eligible carousel post has the user-supplied image required by the design. A summary is optional. Show a preview of the chosen cover before publication.

### D5. Media support

Start with JPEG, PNG, WebP, and GIF images up to 10 MB each, and MP4/WebM video files up to 100 MB each. These limits are configurable. Validate uploads and return a clear message when a format or file is unsupported. Automatic video conversion is outside this first version.

Initially support YouTube and Vimeo video embeds. Other external URLs can still be inserted as links. Videos require the reader to press play. Uploaded media is served through the application's post-access rules; private media is not exposed through an unrestricted static upload directory.

### D6. Carousel presentation and ranking details

Advance every 5 seconds, using a 600 ms horizontal movement with fading. Keep the center card fully visible and opaque; show smaller neighboring cards at approximately 40% opacity, allowing the distant cards to be clipped at the carousel's edges.

Provide previous/next buttons, position indicators, keyboard navigation, and touch swiping. Pause automatic advancement while hovered, focused, or explicitly paused. Respect reduced-motion preferences with a static/manual presentation. On narrow screens, show the center card with visible portions of the neighboring cards.

Show fewer cards when fewer than five public posts exist. Show an empty-state message when there are none. Break equal 14-day like counts by newest publication time, then a stable post identifier. Changes in publication state take effect immediately for eligibility; a carousel must not continue serving a now-personal post from cache.

### D7. Likes

Allow one active like per signed-in user per public post, including the author. Users can unlike a post. An unlike removes that contribution; a later like receives a new timestamp and still contributes at most one active like for that user. Only active likes received within the current 14-day window contribute to carousel ranking.

### D8. Verification, sessions, and recovery

Use six-digit codes, valid for 10 minutes, with a maximum of five attempts per code and a 60-second resend cooldown. Add request-rate limits. These are configurable local defaults.

The seven-day verification window starts at successful email-code verification. Signing in with a password within that window does not extend it; after it expires, a new email code is required. Sessions expire no later than that verification deadline, including sessions on another device. Account activation requires its initial code. All codes go to Mailpit in the local version.

Provide password recovery using an email code. A password reset ends existing sessions. Preserve unsaved editor work in the open page if authentication expires, and allow the user to sign in before retrying save; do not discard their input or bypass post permissions.

### D9. Local service and storage design

The frontend follows the confirmed stack choices: Next.js with shadcn/ui and Tailwind CSS, and Zustand for client-side state management later.

The separate `frontend/` and `backend/` folders are a confirmed requirement. Plan for each to contain its own dependency manifest, application configuration, and Dockerfile, so either service can be built and deployed independently. A root `compose.yaml` coordinates local services; shared project documentation remains in `docs/`.

Use separate Compose services for the frontend, FastAPI API, PostgreSQL, Redis, and Mailpit. Give PostgreSQL, uploaded media, and the Mailpit test inbox persistent volumes. Redis holds rebuildable cache data.

PostgreSQL is the authoritative store for users, sessions, posts, access grants, blocks, canvas bounds, drafts, proposals, media metadata, and likes. Store structured text/media content separately from geometry. Give blocks stable identities so approving one block cannot replace another editor's work on an unrelated block.

Use browser-native text, links, and media elements with positioning/rotation transforms for the composition surface. This keeps posts interactive and their text available for later retrieval. Exact library versions will be verified and pinned during implementation; no WordPress installation is part of the stack.

### D10. Redis and permission changes

Cache approved public post lists, carousel candidates, and frequently used public metadata, initially for up to 15 seconds. Invalidate affected entries after publication, approval, unpublishing, deletion, or liking changes. Validate current publication/access state before serving cached results. Keep private drafts, review proposals, and permission decisions out of shared public caches.

A cache outage falls back to PostgreSQL for content reads. Session and permission enforcement remain authoritative even when the cache is unavailable.

### D11. Local operations and scope

Provide a documented Compose startup, migrations, and an explicit sample-data command for local testing. Include manual backup/restore instructions for the database and uploaded media. Ordinary container replacement preserves the volumes.

The first build contains the agreed blog, composer, collaboration, review, carousel, authentication, and language features. AI discovery and public deployment remain later work. No comments, followers, bookmarks, topic-tag system, or unrelated social features are added to this initial scope.

## 3. Initial pages

**Amendment, 2026-09-07:** The user requested a vertical category menu on the collection page. Implement Technology, Travel, General, and Anime, plus All posts. Store one category in reviewed post details, default existing posts to General, and filter approved public posts before pagination. This supersedes the earlier exclusion of category filtering from the local scope; free-form topic tags and RAG remain future work.

**Amendment, 2026-09-12:** The user completed and confirmed the search/RAG design interview. Implemented permission-aware PostgreSQL keyword and pgvector retrieval, Personal/Public groups, two-sided personal-content cloud consent, OpenAI embeddings and grounded Responses API explanations, transient Zustand search state, a durable indexing worker, filters, signed pagination, limits, fallbacks, bilingual retrieval gates, and privacy-safe operations. The canonical requirements are in [rag-design.md](rag-design.md), and delivery evidence is in [build-progress.md](build-progress.md). This supersedes every earlier statement that RAG, generated answers, or Zustand remained future work.

**Amendment, 2026-09-07:** The user requested a default local administrator account for immediate testing without initial email verification. Compose creates an explicitly configurable password-only test account after migrations. It has the same post permissions as a normal creator; the word administrator identifies the local test identity and does not grant cross-account access.

**Amendment, 2026-09-07:** Collection cards must constrain uploaded profile images and keep titles, summaries, and author actions in consistent rows. Covers use a fixed crop, avatars use a fixed circular crop, long titles and summaries are clamped, and author names truncate rather than moving the reading action outside the card.

**Amendment, 2026-09-07:** The page canvas itself is directly resizable like a content block. All four edges and four corners expose visible drag handles that update width and height, while the existing Adjust canvas bounds mode remains available to move the crop area. Resizing keeps blocks outside the visible bounds stored.

**Amendment, 2026-09-08:** Every block header includes a quick delete button. The control stops the header drag gesture, deletes only its own block from the private working copy, and remains reversible through Undo until the history is cleared by reload or submission.

**Amendment, 2026-09-08:** The composer no longer reserves a permanent right column for post and canvas controls. A bilingual settings dropdown floats at the canvas's upper-right and opens a bounded, scrollable inspector over the workspace. Closing it gives the canvas the full editor width while preserving post details, canvas bounds, selected-block geometry, layers, and draft actions in one place.

**Amendment, 2026-09-12:** Moving the canvas crop frame keeps it at the dropped workspace position. Frame movement and stored crop-origin movement use the same delta so blocks remain fixed in document space, and pressing the handle without moving does not create a geometry change.

**Amendment, 2026-09-12:** The composer supports pointer-centered Ctrl + wheel zoom from 25% to 300% in 10% steps. Zoom is transient editor state and does not alter saved canvas or block geometry; drawing, dragging, and resizing convert pointer movement through the active scale.

| Page | Main purpose |
| --- | --- |
| Public home / posts | Featured carousel and browseable public posts |
| Post reader | Approved freeform composition, author details, like action |
| Public profile | User biography and public posts |
| My workspace | Owned posts, posts shared with the user, and review requests |
| Post composer | Mixed-content canvas editing, drafts, submission, creator actions |
| Review | Compare block/layout/details proposals; approve or reject |
| Sharing | Creator-managed email lookup and per-post view/edit access |
| Account screens | Register, sign in, verify code, reset password, language/profile settings |
| Mailpit inbox | Local testing tool for captured verification emails |

## 4. Review example

An author shares a personal post with two registered editors. Each saves a different proposal for the same block; neither proposal changes what readers see. The author compares the current block and both proposals, approves one, and the competing proposal is rejected. Pending edits to other blocks remain pending.

An editor separately proposes shrinking the canvas. Until the author approves it, readers see the old bounds. After approval, content outside the new bounds is hidden but remains stored. The author can later expand the canvas to reveal it again.

## 5. Required validation before delivery

- Exercise registration and local email codes, username/email sign-in, expiry after seven days, and anonymous public reading.
- Verify author/viewer/editor permissions on API operations and uploaded media, including unregistered invitation rejection and revocation.
- Verify draft isolation, explicit submission, independent block approval, automatic rejection of a same-block competitor, separate canvas review, and preservation of unrelated proposals.
- Exercise mixed-content blocks, geometry, rotation, layers, internal scrolling, crop/uncrop retention, and phone-scale/zoom reading.
- Verify carousel eligibility and ordering from likes received within 14 days, image links, automatic advancement, manual controls, and reduced-motion behavior.
- Check English and Spanish in the main user flows.
- Verify persistence through container replacement and that public-cache behavior cannot expose unpublished/private content.
- Run appropriate backend checks and integrated browser checks; report any Docker or runtime limitation accurately.
- Review documentation for every project function and explanations of complex code and hard-coded business values; ensure the build log accurately records completed work and verification.

## 6. Confirmation

The user authorized implementation on 2026-09-07. Sections 2–5 supplied the working defaults, scope, and acceptance criteria for the delivered local version. Subsequent user requests are recorded as amendments, including collection categories.

# AI model rankings: product and editorial specification

Status: confirmed for first implementation on 2026-09-22.

This document records the decisions behind MAblog's public AI model ranking so future updates can distinguish confirmed product requirements from editorial judgments and deferred work. It complements `design-review.md`; it does not replace the source snapshots stored with the frontend ranking data.

## 1. Audience and purpose

The ranking serves both general users choosing an AI product and developers choosing a model or API. It ranks model families, not consumer applications, while naming the product, API, subscription, or open-weight release through which each family is accessible.

The page must help readers make a practical choice without implying that code, images, video, and music share one universal definition of quality. It therefore provides independent category rankings and a curated highlights area rather than a combined overall leaderboard.

## 2. First-edition categories

The first edition contains four stacked categories:

1. Coding, focused on production-level software engineering: repository understanding, implementation, bug fixing, tool and terminal use, and validated task completion. Competitive-programming and visual web-development scores are supporting evidence rather than the sole definition of coding.
2. Image creation, focused on text-to-image generation.
3. Video generation, focused on text-to-video generation and explicitly identifying whether native audio is part of the evaluated output.
4. Music generation, split into separate Top 5 Vocal and Top 5 Instrumental views because the source evaluates those modes independently.

Speech synthesis, voice cloning, sound effects, audio editing, image editing, image-to-video, and video editing are outside the first-edition ranking. They may become separate categories later rather than being mixed into a category with incompatible tasks.

## 3. Eligibility and family rules

A ranked model must be accessible on the snapshot date through at least one documented consumer product, subscription, API, or open-weight release. Announced demonstrations and inaccessible previews do not qualify. Region-limited or preview access may qualify only when the restriction is explicit.

Each category contains five model families. Only the highest eligible family from one provider appears in a category, and closely related variants remain one family entry. A provider-hosted post-training of another provider's model does not create a second family merely because it has a different endpoint. This diversity rule means MAblog's filtered Top 5 may differ from the first five rows of the source leaderboard; every section must disclose that fact.

A family that ranks in multiple categories has one permanent internal profile at `/ai-models/[slug]`. The profile aggregates every recorded placement rather than creating category-specific duplicate pages.

## 4. Evidence and ranking policy

MAblog preserves source-native measurements. It must not convert Elo, benchmark percentages, or composite indexes into a synthetic universal score out of 100.

Primary evidence sources for the first edition are:

- Artificial Analysis Coding Agent Index for end-to-end coding-agent performance.
- Arena Code and Artificial Analysis LiveCodeBench as supporting coding evidence.
- Artificial Analysis Text-to-Image Arena for image quality.
- Artificial Analysis Text-to-Video Arena for video quality.
- Artificial Analysis Music Arena Vocal and Instrumental leaderboards for music quality.

Official provider documentation is used for model identity, access mode, licensing, and availability. Provider self-claims may describe a documented capability but do not count as independent comparative proof. Affiliate listicles and unsourced promotional rankings are excluded.

Every recorded measurement includes its source URL, source-native metric name, value, confidence interval when published, sample or vote count when published, source rank range when published, and snapshot date. Missing evidence displays as “Not evaluated,” never as zero.

The visible order uses the applicable primary source after the accessibility, family, and provider-diversity filters. Supporting benchmarks explain strengths and limitations but do not silently replace the primary order. Ties are broken by capability evidence, then reliability, then accessibility. When confidence intervals or published rank ranges overlap materially, cards retain a readable editorial order but display a statistical-tie note.

## 5. Context, awards, and advice

Capability leads the ranking. Price and accessibility are smaller decision factors shown as contextual labels rather than invented scores. Every family can carry access labels for consumer product, free tier, subscription, API, or open weights.

Each card and profile contains separate short verdicts:

- Best for users: interface, learning curve, subscription access, and practical workflow.
- Best for developers: API availability, integration, control, licensing, and deployment.

The highlights area contains clearly labeled MAblog editorial picks rather than benchmark awards:

- Best for production coding.
- Best image creator.
- Best video creator.
- Best music creator.
- Best open-weight option.
- Best value.
- Best for beginners.

Each editorial pick cites the evidence or ranking entry that informed it and does not receive a separate numeric score.

## 6. Page structure and interaction

The ranking page begins with a concise methodology-led hero and a line of anchor links for Coding, Image, Video, and Music. The complete rankings remain server rendered and stacked in the document; selecting a category moves to its section instead of hiding other content in client state.

Each category forms one visual line on desktop with five clickable model cards. Tablet layouts use two columns, and phones use one column so important cards are not hidden behind horizontal scrolling. Music contains separate Vocal and Instrumental groups inside its category section.

Every card contains an editorial cover, display rank, model and provider names, source-native score, concise description, confidence and sample context, access labels, and a link to the internal family profile. Covers are original code-native compositions using the model name, provider name, a category icon, and an abstract color/pattern. They do not download, imitate, or imply endorsement by official provider logos.

The initial internal profile contains the cover, family and provider identity, category placements, source-native scores and snapshot dates, access modes, user and developer verdicts, evidence-based description, benchmark links, official access links, methodology warning, and a “Full analysis coming next” message. A later design phase will define deeper comparisons, examples, and long-form analysis.

## 7. Language and accessibility

Editorial copy, navigation, methodology, access labels, verdicts, and warnings support English and Spanish. Model names, provider names, benchmark names, URLs, and source-native metric names are not translated.

Cards use semantic links, visible keyboard focus, sequential headings, sufficient contrast, and decorative Lucide icons hidden from assistive technology. No category meaning relies on color alone. Touch targets meet the project's 44-pixel minimum, and responsive checks cover a 375-pixel phone without horizontal page overflow.

## 8. Freshness and maintenance

The dataset is a reviewed local snapshot, not a live scrape. The ranking page and each category display an evaluated date. The editorial target is a monthly review. After 45 days, the page displays a visible “Needs review” state without deleting the last reviewed evidence.

Ranking data lives in a versioned frontend data module with typed entries so a future backend or reviewed import can replace the source without restructuring the page. The page does not add automated refresh, user voting, search, score filters, or client-side sorting in the first edition.

Updates must preserve historical build-progress entries. A ranking refresh should record the old and new snapshot dates, changed families or scores, source changes, exclusions, verification performed, and any evidence limitations.

## 9. Deferred decisions

The following work is intentionally deferred:

- Complete long-form model profile design.
- Automated source ingestion and an administrator review workflow.
- Historical score charts and change notifications.
- Search, sorting, access filters, and user-specific recommendations.
- User voting or community reviews.
- Additional categories for speech, sound effects, image editing, video editing, and model reasoning.
- A legal review of commercial-use and training-data claims. Access and license labels are informational and not legal advice.

No deferred feature should be inferred as approved merely because the first-edition data structure can support it.

# AI-news research and model-file instructions

The master copy lives with the code that will follow it:
[`backend/app/services/ai_news/instructions/ai-news-instructions.md`](../backend/app/services/ai_news/instructions/ai-news-instructions.md).
Edit only that file.

It defines how an AI agent finds weekly AI model releases from official sources, across five categories: language models and agents, image, video, music, and voice and sound. It also defines the one-Markdown-file-per-release format (front matter, bilingual body sections, and evidence and quote rules) used for the weekly news post and the `/ai-models` page.

- **Serving:** `GET /api/ai-news/instructions` returns it to signed-in accounts as `text/markdown`.
- **Saving a copy:** on the profile page, choose a Markdown folder, then press **Save AI-news instructions** to write `ai-news-instructions.md` into it. Saving again replaces the older copy.
- **Design decisions:** recorded in the 2026-10-01 entries (I101 onward) of [`build-progress.md`](build-progress.md).

The work is staged.

- **Stage 1 (done):** this file, the endpoint, and the profile button.
- **Stage 2 (done, 2026-10-02):** 20 draft model files and `rankings.yaml` in `frontend/content/ai-models/`; `/ai-models` reads them and uses a file once it is marked reviewed (see [`ai-models-review-checklist.md`](ai-models-review-checklist.md)); the fixed newsletter cover is in `backend/app/services/ai_news/assets/`.
- **Stage 3 (pending):** connect the MABlog_IA newsroom. It will read the new sources, write draft files through a writable mount, and build the weekly roundup from them.

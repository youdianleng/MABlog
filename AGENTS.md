# MAblog development instructions

These project instructions record the user's requirements for implementation and progress reporting. Apply them to all work in this project, including both applications, migrations, scripts, and tests.

## Project layout and stack

- Keep Next.js application code in `frontend/` and FastAPI application code in `backend/` as separate top-level folders. Each application should have its own dependencies, configuration, and Dockerfile so it can be deployed independently.
- Use shadcn/ui and Tailwind CSS for frontend design. Zustand owns transient client-side feature state such as independent search requests and streamed explanations.
- Use PostgreSQL for durable application records, Redis for selected caches, and Docker Compose for local services. Store durable data and uploads in persistent volumes.
- Keep shared documentation in `docs/`. Use `docs/design-review.md` and `docs/design-interview.md` for product requirements; preserve their distinction between confirmed requirements and proposed defaults.
- Follow `docs/architecture.md`. Frontend page/component code belongs in feature folders, reusable effects belong in named hooks, shared primitives belong in `components/`, and API transport code belongs in `lib/api/`. Give every independently understandable component its own file; keep compatibility barrels free of implementation logic.
- Keep FastAPI `main.py` limited to application composition, middleware, and global exception handling. Put HTTP endpoints in focused `api/` routers, reusable domain behavior in `services/`, SQLAlchemy records in `models.py`, validation schemas in `schemas.py`, and environment configuration in `config.py`.

## Build progress reporting

- Maintain `docs/build-progress.md` throughout implementation. Update it after each meaningful completed step, change, or fix, and before handing work back to the user.
- Give each step a status and a short-to-medium description, usually two to four sentences explaining what changed, why it matters, and relevant limitations.
- Record the affected files or areas and the verification actually performed, including the command or check, its outcome, and anything not verified.
- Keep completed, in-progress, pending, and blocked work distinguishable. Mark a checkbox complete only when the described work is done and its appropriate verification has succeeded. If a check is unnecessary, record why; if a needed check cannot run, record that limitation instead of claiming the step passed.
- Split broad milestones into smaller entries as work is delivered. Include fixes, migrations, infrastructure, documentation, and tests, not just visible page features.
- Preserve completed history. If a later change supersedes earlier behavior, add a linked follow-up entry and update the current status instead of silently rewriting the historical result.

## Function documentation and code comments

- Document every project function when writing or changing it. Use Python docstrings in the backend and JSDoc/TSDoc or an adjacent explanatory comment in the frontend and scripts.
- This includes methods, API handlers, React components, hooks, helpers, event handlers, callbacks, migration functions, and test functions. For an inline anonymous callback, place a concise purpose comment immediately beside or above it.
- State the function's purpose. Explain meaningful inputs, return values, side effects, exceptions, and permission assumptions when relevant. A short function can have a short comment; complex functions need enough detail to be understood without reconstructing their design.
- Add nearby comments for difficult or non-obvious logic. Explain the reason, invariants, and edge cases, especially for permission checks, approval conflicts, transactions, session expiry, canvas coordinate transforms, carousel ranking, and cache invalidation.
- Explain hard-coded business values and assumptions, including their units and the reason they were chosen. Prefer named constants or configuration over unexplained literal values. Do not present a proposed default as a confirmed user requirement.
- Keep comments accurate whenever code changes. Use clear English and explain intent rather than merely repeating a statement's syntax.
- Review function documentation, complex-code comments, and fixed-value explanations as part of completing each coding step. Build outputs, dependency packages, and machine-generated artifacts are not to be edited solely to add comments; project-maintained functions, including checked-in shadcn/ui components, follow these rules.

# Local operations

## Services and durable data

The Compose project is named `mablog`. Its persistent volumes are `mablog_postgres_data`, `mablog_uploads`, and `mablog_mail_data`. PostgreSQL holds all domain and search records, including pgvector embeddings, durable indexing jobs, and the weekly AI-news state machine; the uploads volume holds image/video bytes. Mailpit captures local email and does not deliver to external mailboxes.

The backend applies the Alembic migration history before serving requests. Add new migration files for later schema changes; the initial migration contains fixed schema operations and does not import future model definitions.

## Consistent database and upload backup

From the project root in PowerShell:

```powershell
.\scripts\backup.ps1
```

The script briefly stops the frontend and backend, writes a PostgreSQL custom-format dump and an upload archive under `backups/<timestamp>/`, then starts the applications again. It writes `manifest.json` alongside `database.dump` and `uploads.tar.gz`. This keeps database references and media files at the same checkpoint.

Optional destination:

```powershell
.\scripts\backup.ps1 -Destination F:\AI_Roadmap_2026\MAblog\backups\manual-copy
```

The backup covers authoritative application records and uploaded files. Mailpit's development inbox remains in its own persistent volume; it is not included in this application backup. Redis is a rebuildable cache.

## Restore a chosen backup

Restoring replaces current database content with the selected checkpoint. Keep a fresh backup of the current state first. The commands below are a manual operation; ordinary startup does not run them.

```powershell
Set-Location F:\AI_Roadmap_2026\MAblog
$restoreDirectory = 'F:\AI_Roadmap_2026\MAblog\backups\YOUR-TIMESTAMP'
docker compose stop frontend backend worker news-worker
docker compose cp "$restoreDirectory\database.dump" db:/tmp/mablog-restore.dump
docker compose exec -T db pg_restore -U mablog --clean --if-exists -d mablog /tmp/mablog-restore.dump
docker compose run --rm --no-deps -v "${restoreDirectory}:/backup:ro" backend tar -xzf /backup/uploads.tar.gz -C /data/uploads
docker compose exec -T redis redis-cli FLUSHDB
docker compose start backend worker news-worker frontend
```

Upload extraction restores the checkpoint's files. Any newer orphaned files can remain inaccessible because their database records are absent; the restore procedure does not recursively delete directories. Use the schema-compatible application revision for a historical backup, then apply newer migrations deliberately.

## Search and RAG operations

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to an OpenAI Platform key to enable embeddings and streamed explanations. The secret belongs only to `backend` and `worker`; it must never use a `NEXT_PUBLIC_` name. Recreate these services after changing AI or search settings:

```powershell
docker compose up -d --build backend worker frontend
```

The migration switches PostgreSQL 17 to the pgvector image, adds the vector extension and search tables, and preserves existing records. The pre-rollout checkpoint created for this project is under `backups/pre-rag-pgvector-20260908/`. Normal backups now stop the worker with the API so an embedding write cannot overlap the database/media checkpoint.

Approved text becomes keyword-searchable during the same database transaction that applies or publishes it. The worker creates vectors later from durable jobs:

```powershell
# Recreate keyword passages and queue missing current vectors for every post.
docker compose run --rm backend python -m app.worker --prepare-only

# Process one currently due job for diagnosis.
docker compose run --rm backend python -m app.worker --once

# Return terminal failed jobs to the pending queue after fixing the provider problem.
docker compose run --rm backend python -m app.worker --retry-failed
```

The health endpoint returns `ai_configured` plus pending, processing, and failed job counts. A provider outage, exhausted allowance, or missing key leaves keyword search available. Jobs retry after approximately 1 minute, 5 minutes, 15 minutes, 1 hour, and 6 hours before showing **Indexing failed** to the creator.

Run the synthetic bilingual embedding gate after changing the embedding model:

```powershell
docker compose run --rm backend python -m app.evaluate_search
```

It requires at least 85% top-five success overall and 80% in the English-to-Spanish and Spanish-to-English subset. It does not write application data. The normal backend suite uses deterministic vectors to verify the same pipeline without cloud cost; the live command measures the configured provider model.

MAblog does not persist search questions, generated answers, or conversation history. Operational search logs contain request IDs, retrieval mode, result counts, duration, model/error categories, and never query text, post titles, passages, or generated prose. Responses API calls set `store: false`. Review the current [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint) before enabling approved personal content.

## Weekly AI-news operations

The `news-worker` container owns the PostgreSQL-backed Monday scheduler and resumes retained stages after restarts. Its database schedule starts disabled. Complete the private preview and activation checklist before enabling it. Provider readiness, failed-stage recovery, budget enforcement, source curation, administrator step-up, correction, unpublication, monitoring, and retention procedures are documented in [weekly AI-news local operations](ai-news-operations.md).

## Troubleshooting

- `docker compose ps` shows service state; `docker compose logs backend frontend` shows startup errors.
- Open `http://localhost:3000/api/health` to check database, Redis, AI configuration, and indexing queue state.
- Open `http://localhost:8025` for local verification codes. Codes are single-use and expire; request a new code after the resend cooldown if needed.
- If Docker's engine pipe is unavailable, finish starting Docker Desktop before running Compose.
- Upload format/size limits and code/cache durations are listed in `.env.example`. The frontend proxy accepts up to 110 MB; increase its build configuration too if the configured video limit is raised above 100 MB.
- `embedding_http_429` or `generation_http_429` means the configured OpenAI project has reached a provider quota or billing limit. A provider response of `insufficient_quota / credit_balance_exhausted` specifically requires adding credit or changing to an OpenAI project with available capacity. Keyword results continue working; pending jobs retry automatically, and terminal failed jobs can be returned with the failed-job retry command after capacity is restored.
- If a post stays in **Indexing**, inspect `docker compose logs worker` and the queue counts. Restarting the worker is safe because abandoned leases are reclaimed and revision hashes prevent stale writes.

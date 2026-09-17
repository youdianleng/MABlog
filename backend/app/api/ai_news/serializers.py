"""Bounded administrator-facing serializers for AI-news records."""

from ...models import AutomatedEdition, NewsAlert, NewsCandidate, NewsDocument, NewsJob, NewsRun, NewsSource, NewsSourceSuggestion


def run_summary(run: NewsRun) -> dict:
    """Serialize run progress, costs, warnings, and safe terminal metadata."""
    return {
        "id": run.id,
        "kind": run.kind,
        "status": run.status,
        "stage": run.stage,
        "progress": run.progress,
        "publication_intent": run.publication_intent,
        "historical": run.historical,
        "pinned": bool(run.result.get("pinned")),
        "window_start": run.window_start,
        "window_end": run.window_end,
        "openai_cost": run.openai_cost,
        "brave_queries": run.brave_queries,
        "warnings": run.warnings,
        "last_error": run.last_error,
        "created": run.created,
        "started": run.started,
        "completed": run.completed,
        "result": run.result,
    }


def job_summary(job: NewsJob) -> dict:
    """Serialize one stage without exposing provider request content."""
    return {"id": job.id, "stage": job.stage, "status": job.status, "attempts": job.attempts, "available_at": job.available_at, "checkpoint": job.checkpoint, "last_error": job.last_error, "updated": job.updated}


def candidate_summary(candidate: NewsCandidate) -> dict:
    """Serialize normalized release identity and curator-relevant classification."""
    return {"id": candidate.id, "provider": candidate.provider, "model_name": candidate.model_name, "model_version": candidate.model_version, "update_type": candidate.update_type, "title": candidate.title, "official_url": candidate.official_url, "published_at": candidate.published_at, "classification": candidate.classification, "reason": candidate.classification_reason, "status": candidate.status, "details": candidate.details}


def document_summary(document: NewsDocument, include_text: bool = False) -> dict:
    """Serialize permanent source metadata and optionally the still-retained private snapshot."""
    return {"id": document.id, "url": document.canonical_url, "mime": document.mime, "content_hash": document.content_hash, "official": document.official, "warnings": document.warnings, "fetched_at": document.fetched_at, "snapshot_expires": document.snapshot_expires, "text": document.extracted_text if include_text else ""}


def edition_summary(edition: AutomatedEdition) -> dict:
    """Serialize preview or publication state and its bilingual structured documents."""
    return {"id": edition.id, "run_id": edition.run_id, "post_id": edition.post_id, "status": edition.status, "documents": edition.documents, "verification": edition.verification, "source_count": edition.source_count, "verified_at": edition.verified_at, "correction_note": edition.correction_note, "created": edition.created, "updated": edition.updated}


def source_summary(source: NewsSource) -> dict:
    """Serialize one registry endpoint and its redacted validation state."""
    return {"id": source.id, "provider_key": source.provider_key, "provider_name": source.provider_name, "name": source.name, "url": source.url, "kind": source.kind, "active": source.active, "validation_status": source.validation_status, "validation": source.validation, "last_checked": source.last_checked, "updated": source.updated}


def suggestion_summary(suggestion: NewsSourceSuggestion) -> dict:
    """Serialize one inactive discovery suggestion for curator review."""
    return {"id": suggestion.id, "provider_name": suggestion.provider_name, "url": suggestion.url, "discovered_by": suggestion.discovered_by, "status": suggestion.status, "details": suggestion.details, "created": suggestion.created, "reviewed_at": suggestion.reviewed_at}


def alert_summary(alert: NewsAlert, read_at: float = 0) -> dict:
    """Serialize a deduplicated alert and the current administrator's read state."""
    return {"id": alert.id, "run_id": alert.run_id, "type": alert.alert_type, "severity": alert.severity, "title": alert.title, "message": alert.message, "email_status": alert.email_status, "created": alert.created, "resolved": alert.resolved, "read_at": read_at}



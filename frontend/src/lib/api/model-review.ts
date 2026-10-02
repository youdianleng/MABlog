import { api } from "./client";

/** One model file as stored: its name, version (SHA-256 of the text), and raw Markdown text. */
export type ModelReviewFile = { name: string; sha256: string; text: string };

/** Every model file plus the raw `rankings.yaml`, as returned to administrators. */
export type ModelReviewFolder = { files: ModelReviewFile[]; rankings: string };

/** Read all model files for review (administrators only; drafts are unpublished). */
export function fetchModelReviewFolder(): Promise<ModelReviewFolder> {
  return api<ModelReviewFolder>("/admin/ai-models");
}

/**
 * Approve a draft so it appears on `/ai-models`.
 *
 * Needs recent administrator verification. `sha256` must be the version the reviewer read; the
 * server answers 409 if the file changed meanwhile.
 */
export function approveModelFile(name: string, sha256: string, note: string) {
  return api<ModelReviewFile>(`/admin/ai-models/${encodeURIComponent(name)}/approve`, "POST", {
    sha256,
    acknowledged: true,
    note,
  });
}

/** Take a reviewed file off `/ai-models`; the reason is stored as a review note. */
export function returnModelFileToDraft(name: string, sha256: string, reason: string) {
  return api<ModelReviewFile>(
    `/admin/ai-models/${encodeURIComponent(name)}/return-to-draft`,
    "POST",
    { sha256, reason },
  );
}

import { api } from "@/lib/api";
import type { AdministratorAccount, NewsAlert, NewsEdition, NewsRunDetail, NewsRunSummary, NewsSource, NewsStatus, NewsSuggestion } from "./ai-news-types";

/** Fetch the compact administrator newsroom state. */
export function fetchNewsStatus() { return api<NewsStatus>("/admin/ai-news/status"); }
/** Fetch one run with its private evidence, jobs, and generated preview. */
export function fetchNewsRun(id: string) { return api<NewsRunDetail>(`/admin/ai-news/runs/${id}`); }
/** Start a no-publication run over the current or selected historical window. */
export function startNewsPreview(historicalDays: number | null = null) { return api<{ created: boolean; run: NewsRunSummary }>("/admin/ai-news/runs/preview", "POST", { historical_days: historicalDays }); }
/** Start the gated immediate generation and publication path. */
export function runAndPublishNews() { return api<{ created: boolean; run: NewsRunSummary }>("/admin/ai-news/runs/run-and-publish", "POST"); }
/** Publish a complete verified private preview after current-source rechecks. */
export function publishNewsPreview(id: string) { return api<{ post_id: string }>(`/admin/ai-news/runs/${id}/publish`, "POST"); }
/** Retry only the failed stage of a retained run. */
export function retryNewsRun(id: string) { return api<NewsRunSummary>(`/admin/ai-news/runs/${id}/retry`, "POST"); }
/** Change whether retention may remove a failed or private run. */
export function pinNewsRun(id: string, pinned: boolean) { return api<NewsRunSummary>(`/admin/ai-news/runs/${id}/pin`, "PATCH", { pinned }); }
/** Enable or disable future Monday starts. */
export function setNewsSchedule(enabled: boolean) { return api<{ enabled: boolean; next_run: number }>("/admin/ai-news/schedule", "PUT", { enabled }); }
/** Fetch the curator-managed official source registry. */
export function fetchNewsSources() { return api<NewsSource[]>("/admin/ai-news/sources"); }
/** Fetch untrusted discovery suggestions awaiting curator action. */
export function fetchNewsSuggestions() { return api<NewsSuggestion[]>("/admin/ai-news/suggestions"); }
/** Validate an official HTTPS source without changing the registry. */
export function testNewsSource(data: Omit<NewsSourceForm, "reason">) { return api<Record<string, unknown>>("/admin/ai-news/sources/test", "POST", { ...data, reason: "Validation test" }); }

export interface NewsSourceForm { provider_key: string; provider_name: string; name: string; url: string; kind: string; active: boolean; reason: string; }
/** Create one registry source after live safe-fetch validation. */
export function createNewsSource(data: NewsSourceForm) { return api<NewsSource>("/admin/ai-news/sources", "POST", data); }
/** Replace one registry record after a fresh live validation. */
export function updateNewsSource(id: string, data: NewsSourceForm) { return api<NewsSource>(`/admin/ai-news/sources/${id}`, "PUT", data); }
/** Approve or dismiss one untrusted web-discovery suggestion. */
export function reviewNewsSuggestion(id: string, data: { action: "approve" | "dismiss"; provider_key?: string; provider_name?: string; name?: string; kind?: string; reason: string }) { return api<unknown>(`/admin/ai-news/suggestions/${id}`, "POST", data); }
/** Fetch retained automated editions for correction or publication actions. */
export function fetchNewsEditions() { return api<NewsEdition[]>("/admin/ai-news/editions"); }
/** Remove an automated edition from public surfaces while retaining it. */
export function unpublishNewsEdition(id: string, reason: string) { return api<NewsEdition>(`/admin/ai-news/editions/${id}/unpublish`, "POST", { reason }); }
/** Republish an eligible verified edition. */
export function publishNewsEdition(id: string, reason: string) { return api<{ post_id: string }>(`/admin/ai-news/editions/${id}/publish`, "POST", { reason }); }
/** Ask the strong model to synchronize a curator-edited language. */
export function proposeNewsCorrection(id: string, language: "en" | "es", document: unknown) { return api<{ id: string; status: string; documents: NewsEdition["documents"] }>(`/admin/ai-news/editions/${id}/corrections`, "POST", { language, document }); }
/** Accept and verify both synchronized correction documents. */
export function acceptNewsCorrection(id: string, documents: NewsEdition["documents"], correctionNote: string) { return api<{ id: string; status: string; edition?: NewsEdition }>(`/admin/ai-news/revisions/${id}/accept`, "POST", { documents, correction_note: correctionNote }); }
/** Fetch mandatory in-app alerts and the current email preference. */
export function fetchNewsAlerts() { return api<{ email_enabled: boolean; items: NewsAlert[] }>("/admin/ai-news/notifications"); }
/** Mark one administrator alert as read. */
export function readNewsAlert(id: string) { return api<{ ok: boolean }>(`/admin/ai-news/notifications/${id}/read`, "POST"); }
/** Keep in-app notices while changing optional action-required email. */
export function setNewsEmail(enabled: boolean) { return api<{ enabled: boolean }>("/admin/ai-news/notifications/email", "PATCH", { enabled }); }
/** Read the current ten-minute high-impact authorization state. */
export function fetchStepUp() { return api<{ authorized: boolean; expires: number; local_bypass: boolean }>("/admin/step-up"); }
/** Confirm the password and request the administrator email code. */
export function requestStepUp(password: string) { return api<{ authorized?: boolean; local_bypass?: boolean; challenge_id?: string }>("/admin/step-up/request", "POST", { password }); }
/** Consume the administrator email code for the current session. */
export function verifyStepUp(challengeId: string, code: string) { return api<{ authorized: boolean; expires: number }>("/admin/step-up/verify", "POST", { challenge_id: challengeId, code }); }
/** List human accounts that can be promoted or removed as administrators. */
export function fetchAdministrators() { return api<AdministratorAccount[]>("/admin/administrators"); }
/** Change one database-backed administrator role with final-administrator protection. */
export function setAdministratorRole(id: string, isAdmin: boolean, reason: string) { return api<AdministratorAccount>(`/admin/administrators/${id}`, "PUT", { is_admin: isAdmin, reason }); }

import type { AiNewsDocument } from "@/lib/api";

export type NewsTab = "overview" | "sources" | "editions" | "alerts" | "providers" | "administrators";

export interface NewsProviderSettings {
  providers: Record<"openai" | "brave", { configured: boolean; source: "saved" | "environment" | "missing" }>;
  models: Record<"small" | "strong", { value: string; source: "saved" | "environment" }>;
}

export interface AdministratorAccount {
  id: string;
  username: string;
  display_name: string;
  email: string;
  active: boolean;
  is_admin: boolean;
  ai_news_email: boolean;
}

export interface NewsRunSummary {
  id: string;
  kind: string;
  status: string;
  stage: string;
  progress: number;
  publication_intent: boolean;
  historical: boolean;
  pinned: boolean;
  window_start: number;
  window_end: number;
  openai_cost: number;
  brave_queries: number;
  warnings: string[];
  last_error: string;
  created: number;
  started: number;
  completed: number;
  result: Record<string, unknown>;
}

export interface NewsReadiness {
  ready: boolean;
  master_enabled: boolean;
  openai: "ready" | "missing";
  brave: "ready" | "degraded";
  email: "ready" | "degraded";
  warnings: string[];
}

export interface NewsStatus {
  readiness: NewsReadiness;
  schedule: { enabled: boolean; timezone: string; weekday: number; hour: number; minute: number; next_run: number; activation_preview_run_id: string | null };
  budget: { run_limit: number; month_limit: number; brave_limit: number; month_spend: number };
  active_run: NewsRunSummary | null;
  recent_runs: NewsRunSummary[];
  unread_alerts: number;
}

export interface NewsJob {
  id: string;
  stage: string;
  status: string;
  attempts: number;
  available_at: number;
  checkpoint: Record<string, unknown>;
  last_error: string;
  updated: number;
}

export interface NewsCandidate {
  id: string;
  provider: string;
  model_name: string;
  model_version: string;
  update_type: string;
  title: string;
  official_url: string;
  published_at: number;
  status: string;
  reason: string;
}

export interface NewsEdition {
  id: string;
  run_id: string;
  post_id: string | null;
  status: string;
  documents: Record<"en" | "es", AiNewsDocument>;
  verification: Record<string, unknown>;
  source_count: number;
  verified_at: number;
  correction_note: string;
  created: number;
  updated: number;
}

export interface NewsRunDetail extends NewsRunSummary {
  jobs: NewsJob[];
  candidates: NewsCandidate[];
  documents: Array<{ id: string; url: string; mime: string; content_hash: string; official: boolean; warnings: string[]; text: string }>;
  claims: Array<{ id: string; claim_key: string; text_en: string; text_es: string; status: string; evidence: Array<{ url: string; quote: string }> }>;
  publication_conflicts?: Array<{ model_name: string; post_id: string | null }>;
  edition: NewsEdition | null;
}

export interface NewsSource {
  id: string;
  provider_key: string;
  provider_name: string;
  name: string;
  url: string;
  kind: string;
  active: boolean;
  validation_status: string;
  validation: Record<string, unknown>;
  last_checked: number;
  updated: number;
}

export interface NewsSuggestion {
  id: string;
  provider_name: string;
  url: string;
  discovered_by: string;
  status: string;
  details: Record<string, unknown>;
  created: number;
}

export interface NewsAlert {
  id: string;
  run_id: string | null;
  type: string;
  severity: string;
  title: string;
  message: string;
  email_status: string;
  created: number;
  resolved: number;
  read_at: number;
}

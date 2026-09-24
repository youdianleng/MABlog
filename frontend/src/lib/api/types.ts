import type { PostCategory } from "../categories";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar: string;
  email?: string;
  personal_cloud_processing?: boolean;
  is_admin?: boolean;
  ai_news_email?: boolean;
}
export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z: number;
  order: number;
  html: string;
}
export interface Composition {
  details: { title: string; summary: string; cover: string; category?: PostCategory };
  canvas: { x: number; y: number; width: number; height: number };
  blocks: Block[];
}
export interface Post {
  category: PostCategory;
  id: string;
  title: string;
  summary: string;
  cover: string;
  public: boolean;
  author: Profile;
  likes: number;
  liked: boolean;
  role: string;
  document: Composition;
  versions: Record<string, number>;
  pending_reviews?: number;
  search_status?: "ready" | "indexing" | "failed";
  kind?: "human" | "ai_news";
  ai_news_document?: AiNewsDocument | null;
  ai_news?: { source_count: number; verified_at: number; correction_note: string } | null;
}

/** One bounded public collection page returned with enough metadata to navigate it. */
export interface PublicPostPage {
  items: Post[];
  page: number;
  page_size: number;
  pages: number;
  total: number;
}

export interface AiNewsCitation {
  number: number;
  url: string;
  title: string;
  official: boolean;
}

export interface AiNewsParagraph {
  text: string;
  citations: number[];
  focus?: "change" | "developer" | "reader" | "limitations";
}

export interface AiNewsBlock {
  id: string;
  type: "overview" | "release" | "sources";
  release_id?: string;
  title?: string;
  paragraphs?: AiNewsParagraph[];
  benchmarks?: AiNewsParagraph[];
  source_numbers?: number[];
  citations?: AiNewsCitation[];
}

export interface AiNewsDocument {
  kind: "ai_news";
  editorial_version?: number;
  language: "en" | "es";
  details: { title: string; summary: string; cover: string; category: "technology" };
  edition_date: string;
  cover_alt: string;
  tags: string[];
  blocks: AiNewsBlock[];
}
export interface WorkingCopy {
  document: Composition;
  baseline: Composition;
  versions: Record<string, number>;
  role: string;
}
export interface Proposal {
  id: string;
  target: string;
  value: Block | Composition["canvas"] | Composition["details"] | null;
  status: string;
  current_version: number;
  base_version: number;
  editor: Profile;
}

export type SearchScope = "all" | "personal" | "public";
export type SearchMode = "hybrid" | "keyword";

export interface SearchPost extends Omit<Post, "document" | "versions"> {
  matched_block_id: string | null;
  snippet: string;
  score: number;
  search_status: "ready" | "indexing" | "failed";
}

export interface SearchGroup {
  items: SearchPost[];
  total: number;
  cursor: string | null;
}

export interface SearchResponse {
  request_id: string;
  mode: SearchMode;
  fallback_reason: string | null;
  personal_cloud_processing: boolean;
  explanation_available: boolean;
  explanation_token: string | null;
  personal: SearchGroup;
  public: SearchGroup;
}

export interface SearchCitation {
  number: number;
  title: string;
  url: string;
}

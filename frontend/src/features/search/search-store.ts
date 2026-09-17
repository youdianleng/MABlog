"use client";
import { create } from "zustand";
import type { PostCategory } from "@/lib/categories";
import type { SearchCitation, SearchResponse, SearchScope } from "@/lib/api";

export type ExplanationStatus = "idle" | "streaming" | "done" | "failed" | "unavailable";

export interface SearchState {
  query: string;
  category: PostCategory | null;
  scope: SearchScope;
  response: SearchResponse | null;
  explanation: string;
  citations: SearchCitation[];
  explanationStatus: ExplanationStatus;
  pending: boolean;
  error: string;
  loadingGroup: "personal" | "public" | null;
  queuedQuery: string;
  requestSequence: number;
}

/** Provide a fresh search-page state while keeping each query independent. */
function initialSearchState(): SearchState {
  return {
    query: "",
    category: null,
    scope: "all",
    response: null,
    explanation: "",
    citations: [],
    explanationStatus: "idle",
    pending: false,
    error: "",
    loadingGroup: null,
    queuedQuery: "",
    requestSequence: 0,
  };
}

export const useSearchStore = create<SearchState>(initialSearchState);

/** Queue a transient header question without exposing it in URLs, history, or access logs. */
export function queueHeaderSearch(query: string): void {
  const value = query.trim().slice(0, 500);
  useSearchStore.setState(
    /** Increment a sequence so identical consecutive header questions still run independently. */
    function queueRequest(state) {
    return {
      query: value,
      category: null,
      scope: "all",
      queuedQuery: value,
      requestSequence: state.requestSequence + 1,
    };
    },
  );
}

/** Clear transient query and answer data when leaving the dedicated search experience. */
export function resetSearchStore(): void {
  useSearchStore.setState(initialSearchState());
}

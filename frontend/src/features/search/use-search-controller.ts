"use client";
import { useCallback, useEffect, useRef } from "react";
import { loadSearchResults, searchPosts, streamExplanation, type SearchInput } from "@/lib/api";
import { resetSearchStore, useSearchStore } from "./search-store";

/** Coordinate retrieval, cancellable answer streaming, pagination, and transient Zustand state. */
export function useSearchController() {
  const abortRef = useRef<AbortController | null>(null);

  /** Cancel an obsolete answer stream without removing its already-visible ranked results. */
  const cancelExplanation = useCallback(function cancelExplanation() {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  /** Stream the explanation for a completed retrieval while accumulating trusted citation metadata. */
  const beginExplanation = useCallback(function beginExplanation(token: string) {
    cancelExplanation();
    const controller = new AbortController();
    abortRef.current = controller;
    useSearchStore.setState({ explanationStatus: "streaming", explanation: "", citations: [] });
    void streamExplanation(token, controller.signal, {
      /** Store server-issued citation titles and deep links before text tokens arrive. */
      citations(items) {
        useSearchStore.setState({ citations: items });
      },
      /** Append one provider text delta without replacing ranked result groups. */
      delta(text) {
        useSearchStore.setState(
          /** Append to the existing stream because Responses API deltas contain only new text. */
          function appendDelta(state) {
          return { explanation: state.explanation + text };
          },
        );
      },
      /** Mark a fully delivered explanation as stable and interactive. */
      done() {
        useSearchStore.setState({ explanationStatus: "done" });
      },
      /** Keep retrieval visible while replacing a failed answer with a clear status. */
      failed() {
        useSearchStore.setState({ explanationStatus: "failed" });
      },
    }).catch(
      /** Ignore deliberate cancellation and report every other stream failure above the results. */
      function explanationFailed(error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        useSearchStore.setState({ explanationStatus: "failed" });
      },
    );
  }, [cancelExplanation]);

  /** Run a fresh independent question and immediately display retrieval before streaming its answer. */
  const runSearch = useCallback(async function runSearch(input: SearchInput) {
    cancelExplanation();
    useSearchStore.setState({
      ...input,
      pending: true,
      error: "",
      response: null,
      explanation: "",
      citations: [],
      explanationStatus: "idle",
      loadingGroup: null,
    });
    try {
      const response = await searchPosts(input);
      useSearchStore.setState({
        response,
        pending: false,
        explanationStatus: response.explanation_available ? "streaming" : "unavailable",
      });
      if (response.explanation_token) beginExplanation(response.explanation_token);
    } catch (error) {
      useSearchStore.setState({ pending: false, error: error instanceof Error ? error.message : "Search failed" });
    }
  }, [beginExplanation, cancelExplanation]);

  /** Append one signed Personal or Public page while keeping the other group unchanged. */
  const loadMore = useCallback(async function loadMore(group: "personal" | "public") {
    const state = useSearchStore.getState();
    const cursor = state.response?.[group].cursor;
    if (!cursor || !state.response) return;
    useSearchStore.setState({ loadingGroup: group });
    try {
      const page = await loadSearchResults(cursor);
      const current = useSearchStore.getState().response;
      if (!current) return;
      useSearchStore.setState({
        response: {
          ...current,
          [group]: { ...current[group], items: [...current[group].items, ...page.items], cursor: page.cursor },
        },
        loadingGroup: null,
      });
    } catch (error) {
      useSearchStore.setState({ loadingGroup: null, error: error instanceof Error ? error.message : "Loading failed" });
    }
  }, []);

  useEffect(
    /** Cancel network work and clear query history when the search page unmounts. */
    function manageLifetime() {
      return function cleanupSearch() {
        cancelExplanation();
        resetSearchStore();
      };
    },
    [cancelExplanation],
  );

  return { runSearch, loadMore, cancelExplanation };
}

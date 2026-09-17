"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/** Fetch route data while preserving server-rendered input until a refresh is required. */
export function useData<T>(path: string, revision = 0, initialData?: T) {
  const [loadedData, setLoadedData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const useInitialData = revision === 0 && initialData !== undefined;

  useEffect(
    /** Skip an initial request when the server supplied data, otherwise ignore obsolete responses. */
    function loadRoute() {
      if (useInitialData) return;
      let live = true;
      setLoadedData(null);
      setError("");
      api<T>(path)
        .then(
          /** Store successfully loaded data only for the current view. */
          function loaded(value) {
            if (live) setLoadedData(value);
          },
        )
        .catch(
          /** Expose a request failure only for the current view. */
          function failed(requestError) {
            if (live) setError(requestError.message);
          },
        );
      return /** Prevent an obsolete request from updating this view. */ function cleanup() {
        live = false;
      };
    },
    [path, revision, useInitialData],
  );

  return { data: useInitialData ? initialData : loadedData, error };
}

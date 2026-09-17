"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchNewsStatus } from "./ai-news-api";
import type { NewsStatus } from "./ai-news-types";

/** Poll active runs while keeping idle newsroom requests quiet. */
export function useNewsStatus() {
  const [data, setData] = useState<NewsStatus | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(/** Refresh redacted status and preserve the previous result on a transient error. */ async function reload() {
    try { setData(await fetchNewsStatus()); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "News status unavailable"); }
  }, []);
  useEffect(/** Load once and poll only while durable work is active. */ function synchronize() {
    void reload();
    if (!data?.active_run) return;
    const timer = window.setInterval(reload, 3000);
    return /** Stop status polling when the run finishes or the page unmounts. */ function cleanup() { window.clearInterval(timer); };
  }, [data?.active_run, reload]);
  return { data, error, reload };
}


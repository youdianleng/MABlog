import { api, ApiError } from "./client";
import type { PostCategory } from "../categories";
import type { SearchCitation, SearchResponse, SearchScope, SearchPost } from "./types";

export interface SearchInput {
  query: string;
  category: PostCategory | null;
  scope: SearchScope;
}

export interface ExplanationHandlers {
  citations: (items: SearchCitation[]) => void;
  delta: (text: string) => void;
  done: () => void;
  failed: () => void;
}

/** Submit one independent permission-aware search question. */
export async function searchPosts(input: SearchInput): Promise<SearchResponse> {
  return api<SearchResponse>("/search", "POST", input);
}

/** Read another signed result page without repeating retrieval or cloud generation. */
export async function loadSearchResults(cursor: string): Promise<{ items: SearchPost[]; cursor: string | null }> {
  return api("/search/more", "POST", { cursor });
}

/** Parse a complete SSE event block and dispatch only the supported search events. */
function dispatchEvent(block: string, handlers: ExplanationHandlers): void {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7);
    if (line.startsWith("data: ")) dataLines.push(line.slice(6));
  }
  if (!dataLines.length) return;
  const payload = JSON.parse(dataLines.join("\n")) as { items?: SearchCitation[]; text?: string };
  if (event === "citations") handlers.citations(payload.items ?? []);
  else if (event === "delta") handlers.delta(payload.text ?? "");
  else if (event === "done") handlers.done();
  else if (event === "error") handlers.failed();
}

/** Stream one grounded explanation and preserve ranked results when generation fails. */
export async function streamExplanation(token: string, signal: AbortSignal, handlers: ExplanationHandlers): Promise<void> {
  const response = await fetch("/api/search/explanation", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "X-MAblog": "1", "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    signal,
  });
  if (!response.ok || !response.body) {
    let message = "The explanation is unavailable.";
    try {
      const payload = (await response.json()) as { detail?: string };
      message = payload.detail ?? message;
    } catch {
      // A non-JSON proxy failure uses the stable localized fallback below.
    }
    throw new ApiError(message, response.status);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      dispatchEvent(buffer.slice(0, boundary), handlers);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
}

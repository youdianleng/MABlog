import { beforeEach, describe, expect, it } from "vitest";
import { queueHeaderSearch, resetSearchStore, useSearchStore } from "./search-store";

/** Transient Zustand search state used by the header and search page. */
describe("search store", () => {
  // Start every case from a fresh store so sequence numbers are predictable.
  beforeEach(() => resetSearchStore());

  // Header searches are trimmed, capped at 500 characters, and reset filters.
  it("queues a normalized header query", () => {
    useSearchStore.setState({ category: "travel", scope: "public" });
    queueHeaderSearch(`  ${"a".repeat(600)}  `);
    const state = useSearchStore.getState();
    expect(state.queuedQuery).toHaveLength(500);
    expect(state.category).toBeNull();
    expect(state.scope).toBe("all");
  });

  // Identical consecutive questions still produce a new request sequence number.
  it("increments the request sequence for repeated queries", () => {
    queueHeaderSearch("moon");
    queueHeaderSearch("moon");
    expect(useSearchStore.getState().requestSequence).toBe(2);
  });
});

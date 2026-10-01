import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LEADERBOARDS, parseRankings } from "./ai-model-files";
import { rankedModels } from "./ai-model-rankings";

// The committed rankings file that `/ai-models` renders.
const rankingsText = readFileSync(
  new URL("../../../content/ai-models/rankings.yaml", import.meta.url),
  "utf8",
);

/** Integrity of the built-in snapshot and the committed rankings.yaml. */
describe("AI model rankings", () => {
  // Profile URLs are keyed by slug, so duplicates would make one profile unreachable.
  it("uses unique snapshot slugs", () => {
    const slugs = rankedModels.map(/** Read each profile slug. */ (model) => model.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  // Every ranked slug needs a snapshot placement on that leaderboard until its file is reviewed.
  it("ranks only models with a snapshot placement on that leaderboard", () => {
    const rankings = parseRankings(rankingsText);
    for (const leaderboard of LEADERBOARDS) {
      for (const entry of rankings.leaderboards[leaderboard]) {
        const model = rankedModels.find(/** Same slug. */ (item) => item.slug === entry.slug);
        expect(model, entry.slug).toBeDefined();
        expect(
          model!.placements.some(
            /** Placement on this leaderboard. */ (item) => item.category === leaderboard,
          ),
          `${entry.slug} on ${leaderboard}`,
        ).toBe(true);
      }
    }
  });

  // The editorial order must agree with the snapshot's recorded ranks.
  it("keeps the snapshot rank order", () => {
    const rankings = parseRankings(rankingsText);
    for (const leaderboard of LEADERBOARDS) {
      const ranks = rankings.leaderboards[leaderboard].map(
        /** Read the stored rank for this slug. */ (entry) =>
          rankedModels
            .find(/** Same slug. */ (model) => model.slug === entry.slug)!
            .placements.find(/** This leaderboard. */ (item) => item.category === leaderboard)!
            .rank,
      );
      expect(ranks).toEqual([1, 2, 3, 4, 5]);
    }
  });
});

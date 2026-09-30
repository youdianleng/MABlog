import { describe, expect, it } from "vitest";
import {
  type RankingCategory,
  getModelsForCategory,
  getPlacement,
  rankedModels,
  rankingOrder,
} from "./ai-model-rankings";

/** Integrity checks for the versioned AI model ranking snapshot. */
describe("AI model ranking snapshot", () => {
  // Profile URLs are keyed by slug, so duplicates would make one profile unreachable.
  it("uses unique model slugs", () => {
    const slugs = rankedModels.map(/** Read each profile slug. */ (model) => model.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  // Each category card list must resolve every slug and find that category's placement.
  it("resolves every ordered slug with a matching placement", () => {
    for (const category of Object.keys(rankingOrder) as RankingCategory[]) {
      const models = getModelsForCategory(category);
      expect(models.every(Boolean)).toBe(true);
      const ranks = models.map(
        /** Read the rank shown on this category card. */ (model) =>
          getPlacement(model, category)?.rank,
      );
      // Editorial order must agree with the placement ranks shown on each card.
      expect(ranks).toEqual(ranks.map(/** Expected one-based position. */ (_, index) => index + 1));
    }
  });
});

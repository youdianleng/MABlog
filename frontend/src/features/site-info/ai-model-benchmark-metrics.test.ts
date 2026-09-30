import { describe, expect, it } from "vitest";
import {
  blendTokenPrice,
  getPlacementContext,
  placementContext,
} from "./ai-model-benchmark-context";
import {
  eloWinRate,
  getBenchmarkEntries,
  priceLevel,
  recommendationLevel,
} from "./ai-model-benchmark-metrics";
import { type RankingCategory, type RankingPlacement, rankingOrder } from "./ai-model-rankings";

const categories = Object.keys(rankingOrder) as RankingCategory[];

/** Build a minimal placement for arithmetic tests. */
function placement(metric: string, score: string): RankingPlacement {
  return {
    category: "image",
    rank: 1,
    metric,
    score,
    sourceRank: "1",
    sourceLabel: "Test",
    sourceUrl: "https://example.test",
  };
}

/** Recommendation and price bar arithmetic for the benchmark cards. */
describe("benchmark metrics", () => {
  // Equal ratings split votes evenly; a 400-point gap is 10:1 odds.
  it("follows the Elo expected-score formula", () => {
    expect(eloWinRate(1200, 1200)).toBe(0.5);
    expect(eloWinRate(1200, 1600)).toBeCloseTo(1 / 11, 6);
  });

  // The leader fills the bar; Elo uses win rate against #1 and indexes use the score ratio.
  it("scales recommendation against the category leader", () => {
    const leader = placement("Arena Elo", "1197");
    expect(recommendationLevel(leader, leader).share).toBe(1);
    const second = recommendationLevel(placement("Arena Elo", "1154"), leader);
    expect(second.kind).toBe("elo");
    expect(second.winRateVsLeader).toBeCloseTo(0.4383, 3);
    const index = recommendationLevel(
      placement("Coding Agent Index v1.5", "56"),
      placement("Coding Agent Index v1.5", "62"),
    );
    expect(index).toEqual({ share: 56 / 62, kind: "index" });
  });

  // Prices scale to the most expensive entry, keep a visible minimum, and flag the extremes.
  it("scales prices within a category", () => {
    const make = /** Build a minimal per-minute price. */ (amount: number) => ({
      amount,
      unit: "usd-per-minute" as const,
      display: "",
      sourceLabel: "",
      sourceUrl: "",
    });
    const all = [make(1), make(10), make(100)];
    expect(priceLevel(all[2], all)).toEqual({ share: 1, cheapest: false, mostExpensive: true });
    expect(priceLevel(all[0], all)).toEqual({ share: 0.04, cheapest: true, mostExpensive: false });
    expect(priceLevel(undefined, all)).toBeNull();
  });

  // Coding prices use the 3:1 input:output blend.
  it("blends token prices 3:1", () => {
    expect(blendTokenPrice(10, 50)).toBe(20);
    expect(blendTokenPrice(1.4, 4.4)).toBeCloseTo(2.15, 6);
  });
});

/** Coverage of the benchmark context for every ranked placement. */
describe("benchmark context", () => {
  // Every ranked model needs a reason in both languages and a price or explained absence.
  it("covers every ranked placement", () => {
    for (const category of categories) {
      expect(Object.keys(placementContext[category]).sort()).toEqual(
        [...rankingOrder[category]].sort(),
      );
      for (const slug of rankingOrder[category]) {
        const context = getPlacementContext(category, slug);
        expect(context.rankReason.en.length).toBeGreaterThan(20);
        expect(context.rankReason.es.length).toBeGreaterThan(20);
        const price = context.price;
        if ("amount" in price) expect(price.amount).toBeGreaterThan(0);
        else expect(price.missing.en.length).toBeGreaterThan(20);
      }
    }
  });

  // Bars stay within 0–1, the leader is full, and recommendation never rises down the ranking.
  it("produces bounded bars in rank order", () => {
    for (const category of categories) {
      const entries = getBenchmarkEntries(category);
      expect(entries[0].recommendation.share).toBe(1);
      for (let index = 0; index < entries.length; index += 1) {
        const { recommendation, price } = entries[index];
        expect(recommendation.share).toBeGreaterThan(0);
        expect(recommendation.share).toBeLessThanOrEqual(1);
        if (price) expect(price.share).toBeLessThanOrEqual(1);
        if (index > 0)
          expect(recommendation.share).toBeLessThanOrEqual(entries[index - 1].recommendation.share);
      }
    }
  });
});

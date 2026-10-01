import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  blendTokenPrice,
  getPlacementPrice,
  type PublishedPrice,
} from "./ai-model-benchmark-context";
import {
  computeBars,
  eloWinRate,
  priceLevel,
  recommendationLevel,
} from "./ai-model-benchmark-metrics";
import { LEADERBOARDS, parseRankings } from "./ai-model-files";
import type { RankingPlacement } from "./ai-model-rankings";
import { buildAiModelsData } from "./ai-models-data";

// The committed rankings file that `/ai-models` renders.
const rankings = parseRankings(
  readFileSync(new URL("../../../content/ai-models/rankings.yaml", import.meta.url), "utf8"),
);

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

/** Build a minimal price in one unit. */
function price(amount: number, unit: PublishedPrice["unit"] = "usd-per-minute"): PublishedPrice {
  return { amount, unit, display: "", sourceLabel: "", sourceUrl: "" };
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
  it("scales prices within a leaderboard", () => {
    const all = [price(1), price(10), price(100)];
    expect(priceLevel(all[2], all)).toEqual({ share: 1, cheapest: false, mostExpensive: true });
    expect(priceLevel(all[0], all)).toEqual({ share: 0.04, cheapest: true, mostExpensive: false });
    expect(priceLevel(undefined, all)).toBeNull();
  });

  // Prices in different units are never compared with each other.
  it("compares only prices that share a unit", () => {
    const song = price(0.08, "usd-per-song");
    const all = [price(12), price(4.8), song];
    expect(priceLevel(song, all)).toEqual({ share: 1, cheapest: false, mostExpensive: false });
    expect(priceLevel(all[0], all)).toEqual({ share: 1, cheapest: false, mostExpensive: true });
  });

  // Coding prices use the 3:1 input:output blend.
  it("blends token prices 3:1", () => {
    expect(blendTokenPrice(10, 50)).toBe(20);
    expect(blendTokenPrice(1.4, 4.4)).toBeCloseTo(2.15, 6);
  });
});

/** Bars and prices for the committed rankings with no reviewed files (the current page). */
describe("current leaderboards", () => {
  const data = buildAiModelsData([], rankings);

  // Every ranked placement has a price or an explained absence from the 2026-10-01 check.
  it("has a price or a missing-price reason for every placement", () => {
    for (const leaderboard of LEADERBOARDS)
      for (const entry of rankings.leaderboards[leaderboard]) {
        const value = getPlacementPrice(leaderboard, entry.slug);
        if ("amount" in value) expect(value.amount).toBeGreaterThan(0);
        else expect(value.missing.en.length).toBeGreaterThan(20);
      }
  });

  // Bars stay within 0–1, the leader is full, and recommendation never rises down the ranking.
  it("produces bounded bars in rank order", () => {
    for (const leaderboard of LEADERBOARDS) {
      const bars = computeBars(data.leaderboards[leaderboard]);
      expect(bars[0].recommendation.share).toBe(1);
      for (let index = 0; index < bars.length; index += 1) {
        expect(bars[index].recommendation.share).toBeGreaterThan(0);
        expect(bars[index].recommendation.share).toBeLessThanOrEqual(1);
        if (bars[index].price) expect(bars[index].price!.share).toBeLessThanOrEqual(1);
        if (index > 0)
          expect(bars[index].recommendation.share).toBeLessThanOrEqual(
            bars[index - 1].recommendation.share,
          );
      }
    }
  });
});

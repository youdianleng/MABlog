import { isPublishedPrice, type PublishedPrice } from "./ai-model-benchmark-context";
import type { RankingPlacement } from "./ai-model-rankings";
import type { LeaderboardEntry } from "./ai-models-data";

/**
 * Bar values for the benchmark cards. Both bars compare a model only with the other four models
 * in the same category; nothing here converts scores across categories or into a universal grade.
 */

// Elo expected-score formula: a 400-point gap means 10:1 odds in a head-to-head vote.
const ELO_SCALE = 400;
// Keep a visible sliver for the cheapest price so a short bar still reads as "has a price".
const MINIMUM_VISIBLE_SHARE = 0.04;

/** Relative strength of one placement against its category leader. */
export type RecommendationLevel = {
  /** 0–1 bar fill; the category leader is 1. */
  share: number;
  /** For arena Elo: expected head-to-head win rate against #1 (0–1). Undefined for indexes. */
  winRateVsLeader?: number;
  kind: "elo" | "index";
};

/** Whether a source-native metric is an arena Elo rating rather than a benchmark index. */
export function isEloMetric(metric: string): boolean {
  return /\bElo\b/.test(metric);
}

/** Expected share of head-to-head preference votes a rating wins against another rating. */
export function eloWinRate(rating: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - rating) / ELO_SCALE));
}

/**
 * Compare a placement with the category leader using the metric's own meaning.
 *
 * Arena Elo is converted to the expected win rate against #1 (the leader against itself is 50%),
 * then doubled so the leader fills the bar. Benchmark indexes use the plain score ratio.
 */
export function recommendationLevel(
  placement: RankingPlacement,
  leader: RankingPlacement,
): RecommendationLevel {
  const score = Number(placement.score);
  const leaderScore = Number(leader.score);
  if (isEloMetric(placement.metric)) {
    const winRate = eloWinRate(score, leaderScore);
    return { share: Math.min(1, winRate * 2), winRateVsLeader: winRate, kind: "elo" };
  }
  return { share: Math.min(1, score / leaderScore), kind: "index" };
}

/** Price bar for one placement: its share of the most expensive published price in the category. */
export type PriceLevel = { share: number; cheapest: boolean; mostExpensive: boolean };

/**
 * Scale one published price against the other prices in its leaderboard that use the same unit.
 *
 * Prices in different units (for example per song and per minute) are never compared; an entry
 * whose unit has no other price still gets a full-width bar but no cheapest/most-expensive flag.
 * Returns null when this model has no published price.
 */
export function priceLevel(
  price: PublishedPrice | undefined,
  leaderboardPrices: PublishedPrice[],
): PriceLevel | null {
  if (!price) return null;
  const amounts = leaderboardPrices
    .filter(/** Compare like with like. */ (entry) => entry.unit === price.unit)
    .map(/** Read the comparable amount. */ (entry) => entry.amount);
  if (amounts.length === 0) return null;
  const highest = Math.max(...amounts);
  const lowest = Math.min(...amounts);
  return {
    share: Math.max(MINIMUM_VISIBLE_SHARE, price.amount / highest),
    cheapest: amounts.length > 1 && price.amount === lowest,
    mostExpensive: amounts.length > 1 && price.amount === highest,
  };
}

/** Bars for one leaderboard entry. */
export type BenchmarkBars = { recommendation: RecommendationLevel; price: PriceLevel | null };

/** Compute both bars for every entry of one leaderboard, in its displayed order. */
export function computeBars(entries: LeaderboardEntry[]): BenchmarkBars[] {
  const leader = entries[0].placement;
  const prices = entries.map(
    /** Keep only published prices; missing prices never count as zero. */ (entry) =>
      isPublishedPrice(entry.price) ? entry.price : undefined,
  );
  const published = prices.filter(
    /** Drop models without a published price from the scale. */ (price): price is PublishedPrice =>
      price !== undefined,
  );
  return entries.map(
    /** Pair each entry with its recommendation and price bars. */ (entry, index) => ({
      recommendation: recommendationLevel(entry.placement, leader),
      price: priceLevel(prices[index], published),
    }),
  );
}

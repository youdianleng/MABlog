import {
  isPublishedPrice,
  getPlacementContext,
  type PublishedPrice,
} from "./ai-model-benchmark-context";
import {
  getModelsForCategory,
  getPlacement,
  type RankingCategory,
  type RankingPlacement,
} from "./ai-model-rankings";

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

/** Scale published prices within one category; returns null when this model has no price. */
export function priceLevel(
  price: PublishedPrice | undefined,
  categoryPrices: PublishedPrice[],
): PriceLevel | null {
  if (!price || categoryPrices.length === 0) return null;
  const amounts = categoryPrices.map(
    /** Read the comparable amount; all entries in one category share a unit. */ (entry) =>
      entry.amount,
  );
  const highest = Math.max(...amounts);
  const lowest = Math.min(...amounts);
  return {
    share: Math.max(MINIMUM_VISIBLE_SHARE, price.amount / highest),
    cheapest: amounts.length > 1 && price.amount === lowest,
    mostExpensive: amounts.length > 1 && price.amount === highest,
  };
}

/** Everything a benchmark card needs for one ranked model. */
export type BenchmarkEntry = {
  slug: string;
  placement: RankingPlacement;
  recommendation: RecommendationLevel;
  price: PriceLevel | null;
};

/** Compute bar values for every model in a category, in editorial rank order. */
export function getBenchmarkEntries(category: RankingCategory): BenchmarkEntry[] {
  const models = getModelsForCategory(category);
  const placements = models.map(
    /** Read each model's placement for this category. */ (model) => getPlacement(model, category),
  );
  const leader = placements[0];
  const prices = models.map(
    /** Keep only published prices; missing prices never count as zero. */ (model) => {
      const price = getPlacementContext(category, model.slug).price;
      return isPublishedPrice(price) ? price : undefined;
    },
  );
  const published = prices.filter(
    /** Drop models without a published price from the scale. */ (price): price is PublishedPrice =>
      price !== undefined,
  );
  return models.map(
    /** Pair each model with its recommendation and price bars. */ (model, index) => ({
      slug: model.slug,
      placement: placements[index],
      recommendation: recommendationLevel(placements[index], leader),
      price: priceLevel(prices[index], published),
    }),
  );
}

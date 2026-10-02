import type { LocalizedText, RankingCategory } from "./ai-model-rankings";

/**
 * Built-in 2026-10-01 price check for the ranked placements. It is the fallback price on
 * `/ai-models` until a reviewed model file supplies one; rank reasons now live in
 * `frontend/content/ai-models/rankings.yaml`.
 *
 * Prices are copied from the cited page on `PRICE_CHECKED_DATE`; a missing price is shown as
 * "not published", never as zero.
 */

/** Date every price below was read from its cited source. */
export const PRICE_CHECKED_DATE = "2026-10-01";

/** Units differ by category, so price bars only compare models inside one category. */
export type PriceUnit =
  | "usd-per-1m-tokens-blended"
  | "usd-per-1k-images"
  | "usd-per-minute"
  | "usd-per-song"
  | "usd-per-1k-characters";

/** One published list price for a model family in a ranking category. */
export type PublishedPrice = {
  /** Comparable amount in `unit`; for tokens, a 3:1 input:output blend (see `blendTokenPrice`). */
  amount: number;
  unit: PriceUnit;
  /** Exact source figures shown to readers, e.g. "$10 in · $50 out per 1M tokens". */
  display: string;
  /** Variant or setting the price applies to, when the source distinguishes one. */
  variant?: string;
  sourceLabel: string;
  sourceUrl: string;
  /** True when no first-party price page was found and an independent tracker was used. */
  secondarySource?: boolean;
  /** Date the price was read; defaults to `PRICE_CHECKED_DATE` for the built-in check. */
  checkedAt?: string;
};

/** Why a price is absent, so the card can say more than "unknown". */
export type MissingPrice = { missing: LocalizedText };

export type PlacementContext = { price: PublishedPrice | MissingPrice };

// Artificial Analysis weights blended LLM prices 3 input : 1 output tokens; reused so coding
// prices stay comparable with the cited source's own convention.
const INPUT_TOKEN_WEIGHT = 3;
const OUTPUT_TOKEN_WEIGHT = 1;

/** Blend per-1M-token input and output list prices with the 3:1 convention. */
export function blendTokenPrice(inputUsd: number, outputUsd: number): number {
  return (
    (inputUsd * INPUT_TOKEN_WEIGHT + outputUsd * OUTPUT_TOKEN_WEIGHT) /
    (INPUT_TOKEN_WEIGHT + OUTPUT_TOKEN_WEIGHT)
  );
}

/** Build a coding price entry from exact per-1M-token list prices. */
function tokenPrice(
  inputUsd: number,
  outputUsd: number,
  source: Pick<PublishedPrice, "sourceLabel" | "sourceUrl" | "secondarySource">,
): PublishedPrice {
  return {
    amount: blendTokenPrice(inputUsd, outputUsd),
    unit: "usd-per-1m-tokens-blended",
    display: `$${inputUsd} in · $${outputUsd} out / 1M tokens`,
    ...source,
  };
}

const IMAGE_PRICE_SOURCE = {
  sourceLabel: "Artificial Analysis Text-to-Image Arena",
  sourceUrl: "https://artificialanalysis.ai/image/leaderboard/text-to-image",
  // The source prices 1,000 images at 1024×1024 with default settings on the creator's API.
  variant: "1024×1024, default settings",
};
const VIDEO_PRICE_SOURCE = {
  sourceLabel: "Artificial Analysis Text-to-Video Arena",
  sourceUrl: "https://artificialanalysis.ai/video/leaderboard/text-to-video",
};

/** Build an image price entry from the source's cost per 1,000 images. */
function imagePrice(usdPerThousand: number): PublishedPrice {
  return {
    amount: usdPerThousand,
    unit: "usd-per-1k-images",
    display: `$${usdPerThousand.toFixed(2)} / 1k images`,
    ...IMAGE_PRICE_SOURCE,
  };
}

/** Build a video price entry from the source's cost per generated minute. */
function videoPrice(usdPerMinute: number, variant: string): PublishedPrice {
  return {
    amount: usdPerMinute,
    unit: "usd-per-minute",
    display: `$${usdPerMinute.toFixed(2)} / min`,
    variant,
    ...VIDEO_PRICE_SOURCE,
  };
}

const MUSIC_PRICE_MISSING: MissingPrice = {
  missing: {
    en: "No comparable API price is published for music; several leaders are subscription-only.",
    es: "No hay un precio de API comparable publicado para música; varios líderes solo ofrecen suscripción.",
  },
};

/** Context for every ranked placement, keyed by category and then model slug. */
export const placementContext: Record<RankingCategory, Record<string, PlacementContext>> = {
  coding: {
    "claude-fable-5-1": {
      price: tokenPrice(10, 50, {
        sourceLabel: "Anthropic",
        sourceUrl: "https://www.anthropic.com/claude/fable",
      }),
    },
    "gpt-6-astra": {
      price: tokenPrice(10, 50, {
        sourceLabel: "OpenAI",
        sourceUrl: "https://developers.openai.com/api/docs/models/gpt-6-astra",
      }),
    },
    "grok-4-7": {
      price: tokenPrice(2, 6, {
        sourceLabel: "xAI",
        sourceUrl: "https://docs.x.ai/developers/grok-4-7",
      }),
    },
    "muse-spark-1-3": {
      price: tokenPrice(1.25, 4.25, {
        sourceLabel: "Independent price trackers (standard endpoint)",
        sourceUrl: "https://www.eesel.ai/blog/muse-spark-1-3-pricing",
        secondarySource: true,
      }),
    },
    "glm-5-3": {
      price: tokenPrice(1.4, 4.4, {
        sourceLabel: "Z.ai",
        sourceUrl: "https://docs.z.ai/guides/overview/pricing",
      }),
    },
  },
  image: {
    "gpt-image-2-5-sunburst": {
      price: imagePrice(210.7),
    },
    "grok-imagine-image-2": {
      price: imagePrice(60),
    },
    "mai-image-2-6": {
      price: imagePrice(38.9),
    },
    "nano-banana-2": {
      price: imagePrice(67),
    },
    "muse-image": {
      price: imagePrice(10),
    },
  },
  video: {
    "gemini-omni-flash": {
      price: {
        missing: {
          en: "The source lists a price only for the newer 1.1 release, not this ranked version.",
          es: "La fuente solo publica precio para la versión 1.1, no para esta versión clasificada.",
        },
      },
    },
    "wan-3": {
      price: videoPrice(12, "Wan 3.0"),
    },
    "minimax-h3": {
      price: videoPrice(4.8, "768p"),
    },
    "seedance-2": {
      price: videoPrice(22.45, "Seedance 2.0"),
    },
    "kling-3": {
      price: videoPrice(10.08, "1080p Pro"),
    },
  },
  "music-vocal": {
    "suno-v5-5": {
      price: MUSIC_PRICE_MISSING,
    },
    "mureka-v9": {
      price: MUSIC_PRICE_MISSING,
    },
    "stepaudio-3-music": {
      price: MUSIC_PRICE_MISSING,
    },
    "minimax-music": {
      price: MUSIC_PRICE_MISSING,
    },
    "lyria-3-pro": {
      price: MUSIC_PRICE_MISSING,
    },
  },
  "music-instrumental": {
    "mureka-v9": {
      price: MUSIC_PRICE_MISSING,
    },
    "suno-v5-5": {
      price: MUSIC_PRICE_MISSING,
    },
    "stepaudio-3-music": {
      price: MUSIC_PRICE_MISSING,
    },
    "lyria-3-pro": {
      price: MUSIC_PRICE_MISSING,
    },
    "minimax-music": {
      price: MUSIC_PRICE_MISSING,
    },
  },
};

/**
 * Return the 2026-10-01 price-check result for one built-in ranked placement.
 *
 * Used as the fallback until a reviewed model file supplies the price. Unknown pairs return a
 * missing price rather than throwing, so a newly ranked model without a check still renders.
 */
export function getPlacementPrice(
  category: RankingCategory,
  slug: string,
): PublishedPrice | MissingPrice {
  return (
    placementContext[category][slug]?.price ?? {
      missing: {
        en: "No price was recorded for this model in the 2026-10-01 price check.",
        es: "No se registró precio para este modelo en la comprobación del 2026-10-01.",
      },
    }
  );
}

/** Narrow a placement price to a published value. */
export function isPublishedPrice(price: PublishedPrice | MissingPrice): price is PublishedPrice {
  return "amount" in price;
}

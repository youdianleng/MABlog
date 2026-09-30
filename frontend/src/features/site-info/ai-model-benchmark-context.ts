import type { LocalizedText, RankingCategory } from "./ai-model-rankings";

/**
 * Benchmark-page context layered on top of the reviewed ranking snapshot: a short bilingual
 * explanation of each placement and the published price used by the card price bar.
 *
 * Reasons only restate evidence already stored in `ai-model-rankings.ts` (score, interval, source
 * rank, tie notes, filters). Prices are copied from the cited page on `PRICE_CHECKED_DATE`; a
 * missing price is shown as "not published", never as zero.
 */

/** Date every price below was read from its cited source. */
export const PRICE_CHECKED_DATE = "2026-10-01";

/** Units differ by category, so price bars only compare models inside one category. */
export type PriceUnit = "usd-per-1m-tokens-blended" | "usd-per-1k-images" | "usd-per-minute";

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
};

/** Why a price is absent, so the card can say more than "unknown". */
export type MissingPrice = { missing: LocalizedText };

export type PlacementContext = {
  rankReason: LocalizedText;
  price: PublishedPrice | MissingPrice;
};

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
      rankReason: {
        en: "Shares the top Coding Agent Index score (62) with GPT-6 Astra. The source ranks both 1–2, so first place is an editorial tie-break, not a measured lead.",
        es: "Comparte la mejor puntuación del Coding Agent Index (62) con GPT-6 Astra. La fuente sitúa a ambos en 1–2, así que el primer puesto es un desempate editorial, no una ventaja medida.",
      },
      price: tokenPrice(10, 50, {
        sourceLabel: "Anthropic",
        sourceUrl: "https://www.anthropic.com/claude/fable",
      }),
    },
    "gpt-6-astra": {
      rankReason: {
        en: "Statistically level with #1 at 62 points (source range 1–2). Choose between the two on tooling and workflow rather than score.",
        es: "Estadísticamente igualado con el n.º 1 con 62 puntos (rango fuente 1–2). Elige entre ambos por herramientas y flujo de trabajo, no por la puntuación.",
      },
      price: tokenPrice(10, 50, {
        sourceLabel: "OpenAI",
        sourceUrl: "https://developers.openai.com/api/docs/models/gpt-6-astra",
      }),
    },
    "grok-4-7": {
      rankReason: {
        en: "Alone at source rank 3 with 56 points: six behind the tied leaders and two clear of the pair below, at a fraction of their price.",
        es: "Solo en el puesto 3 de la fuente con 56 puntos: seis por detrás de los líderes empatados y dos por delante de la pareja siguiente, a una fracción de su precio.",
      },
      price: tokenPrice(2, 6, {
        sourceLabel: "xAI",
        sourceUrl: "https://docs.x.ai/developers/grok-4-7",
      }),
    },
    "muse-spark-1-3": {
      rankReason: {
        en: "Shares 54 points and source range 4–5 with GLM-5.3, so the two are interchangeable on this benchmark; it has the lowest token price in this list.",
        es: "Comparte 54 puntos y el rango fuente 4–5 con GLM-5.3, así que ambos son intercambiables en este benchmark; tiene el precio por token más bajo de la lista.",
      },
      price: tokenPrice(1.25, 4.25, {
        sourceLabel: "Independent price trackers (standard endpoint)",
        sourceUrl: "https://www.eesel.ai/blog/muse-spark-1-3-pricing",
        secondarySource: true,
      }),
    },
    "glm-5-3": {
      rankReason: {
        en: "Level with Muse Spark 1.3 at 54 points (source range 4–5); the strongest remaining family after the one-per-provider filter.",
        es: "Igualado con Muse Spark 1.3 con 54 puntos (rango fuente 4–5); la familia más fuerte que queda tras el filtro de una por proveedor.",
      },
      price: tokenPrice(1.4, 4.4, {
        sourceLabel: "Z.ai",
        sourceUrl: "https://docs.z.ai/guides/overview/pricing",
      }),
    },
  },
  image: {
    "gpt-image-2-5-sunburst": {
      rankReason: {
        en: "Highest arena Elo (1197 ±9) with a 43-point lead over #2, the widest gap at the top of any category here. It is also the most expensive.",
        es: "Mayor Elo de la arena (1197 ±9) con 43 puntos de ventaja sobre el n.º 2, la mayor diferencia en cabeza de todas las categorías. También es el más caro.",
      },
      price: imagePrice(210.7),
    },
    "grok-imagine-image-2": {
      rankReason: {
        en: "1154 ±12. Source rank 4–5 becomes #2 here because higher source entries were removed by the access and one-family-per-provider rules.",
        es: "1154 ±12. El rango fuente 4–5 pasa a n.º 2 porque las entradas superiores quedaron fuera por las reglas de acceso y de una familia por proveedor.",
      },
      price: imagePrice(60),
    },
    "mai-image-2-6": {
      rankReason: {
        en: "1147 ±10, inside #2's confidence interval: the 7-point difference is not meaningful, and it costs about a third less.",
        es: "1147 ±10, dentro del intervalo de confianza del n.º 2: la diferencia de 7 puntos no es significativa y cuesta alrededor de un tercio menos.",
      },
      price: imagePrice(38.9),
    },
    "nano-banana-2": {
      rankReason: {
        en: "1122 ±8 at source rank 6, a 25-point step below the #2–#3 pair; it is available free, by subscription, and through the API.",
        es: "1122 ±8 en el puesto 6 de la fuente, 25 puntos por debajo de la pareja n.º 2–3; está disponible gratis, por suscripción y por API.",
      },
      price: imagePrice(67),
    },
    "muse-image": {
      rankReason: {
        en: "1112 ±10, overlapping Nano Banana 2 (source range 6–9). It completes the list as by far the lowest-priced option.",
        es: "1112 ±10, solapado con Nano Banana 2 (rango fuente 6–9). Completa la lista como la opción con diferencia más barata.",
      },
      price: imagePrice(10),
    },
  },
  video: {
    "gemini-omni-flash": {
      rankReason: {
        en: "Top Elo with audio (1233 ±7), but only 4 points ahead of Wan 3.0; the top three share source range 1–3.",
        es: "Mejor Elo con audio (1233 ±7), pero solo 4 puntos por delante de Wan 3.0; los tres primeros comparten el rango fuente 1–3.",
      },
      price: {
        missing: {
          en: "The source lists a price only for the newer 1.1 release, not this ranked version.",
          es: "La fuente solo publica precio para la versión 1.1, no para esta versión clasificada.",
        },
      },
    },
    "wan-3": {
      rankReason: {
        en: "1229 ±9, statistically tied with #1, with open weights you can self-host.",
        es: "1229 ±9, estadísticamente empatado con el n.º 1 y con pesos abiertos que puedes alojar tú mismo.",
      },
      price: videoPrice(12, "Wan 3.0"),
    },
    "minimax-h3": {
      rankReason: {
        en: "1220 ±8 closes the overlapping top three (source 3–4) and has the lowest published per-minute price in this list.",
        es: "1220 ±8 cierra el trío superior solapado (fuente 3–4) y tiene el precio por minuto publicado más bajo de la lista.",
      },
      price: videoPrice(4.8, "768p"),
    },
    "seedance-2": {
      rankReason: {
        en: "1210 ±6 at source rank 5, 10 points behind MiniMax H3 with a tighter interval, but the highest price per minute.",
        es: "1210 ±6 en el puesto 5 de la fuente, 10 puntos por detrás de MiniMax H3 con un intervalo más estrecho, pero con el precio por minuto más alto.",
      },
      price: videoPrice(22.45, "Seedance 2.0"),
    },
    "kling-3": {
      rankReason: {
        en: "1095 ±6 after a large drop from #4 (source 10–13). Tied with SkyReels V4 on Elo, it takes the last slot on reliability evidence.",
        es: "1095 ±6 tras una gran caída desde el n.º 4 (fuente 10–13). Empatado en Elo con SkyReels V4, ocupa el último puesto por evidencia de fiabilidad.",
      },
      price: videoPrice(10.08, "1080p Pro"),
    },
  },
  "music-vocal": {
    "suno-v5-5": {
      rankReason: {
        en: "Clear leader at 1160 ±14 and the only family with an undisputed source rank of 1.",
        es: "Líder claro con 1160 ±14 y la única familia con el puesto 1 de la fuente sin discusión.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "mureka-v9": {
      rankReason: {
        en: "1136 ±16: 24 points behind Suno but 44 points clear of #3.",
        es: "1136 ±16: 24 puntos por detrás de Suno pero 44 por delante del n.º 3.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "stepaudio-3-music": {
      rankReason: {
        en: "1092 ±15, overlapping MiniMax Music (source 4–6 vs 4–7): a narrow edge rather than a clear gap.",
        es: "1092 ±15, solapado con MiniMax Music (fuente 4–6 frente a 4–7): una ligera ventaja más que una diferencia clara.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "minimax-music": {
      rankReason: {
        en: "1084 ±13, within the confidence intervals of both #3 and #5.",
        es: "1084 ±13, dentro de los intervalos de confianza del n.º 3 y del n.º 5.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "lyria-3-pro": {
      rankReason: {
        en: "1074 ±13 with the widest source range (5–10), so its placement is the least certain in this list.",
        es: "1074 ±13 con el rango fuente más amplio (5–10), por lo que su posición es la menos segura de la lista.",
      },
      price: MUSIC_PRICE_MISSING,
    },
  },
  "music-instrumental": {
    "mureka-v9": {
      rankReason: {
        en: "1177 ±17, 6 points ahead of Suno V5.5 with overlapping ranges (1–2): effectively a shared lead.",
        es: "1177 ±17, 6 puntos por delante de Suno V5.5 con rangos solapados (1–2): en la práctica, un liderazgo compartido.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "suno-v5-5": {
      rankReason: {
        en: "1171 ±15, statistically level with #1 in instrumental output.",
        es: "1171 ±15, estadísticamente igualado con el n.º 1 en música instrumental.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "stepaudio-3-music": {
      rankReason: {
        en: "1113 ±14; a 58-point gap separates it from the leading pair.",
        es: "1113 ±14; una diferencia de 58 puntos lo separa de la pareja líder.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "lyria-3-pro": {
      rankReason: {
        en: "1102 ±13, sharing source range 5–6 with StepAudio 3 Music.",
        es: "1102 ±13, comparte el rango fuente 5–6 con StepAudio 3 Music.",
      },
      price: MUSIC_PRICE_MISSING,
    },
    "minimax-music": {
      rankReason: {
        en: "1063 ±13 at source range 8–9, 39 points below #4.",
        es: "1063 ±13 en el rango fuente 8–9, 39 puntos por debajo del n.º 4.",
      },
      price: MUSIC_PRICE_MISSING,
    },
  },
};

/** Return the reason and price context for one placement; the unit test guarantees coverage. */
export function getPlacementContext(category: RankingCategory, slug: string): PlacementContext {
  return placementContext[category][slug];
}

/** Narrow a placement price to a published value. */
export function isPublishedPrice(price: PublishedPrice | MissingPrice): price is PublishedPrice {
  return "amount" in price;
}

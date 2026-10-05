import { eloWinRate, isEloMetric } from "./ai-model-benchmark-metrics";
import { BENCHMARK_AREAS, type BenchmarkArea, type ModelFile } from "./ai-model-files";
import type { LocalizedText, RankingCategory, RankingPlacement } from "./ai-model-rankings";
import type { AiModelsData, ModelView, ProfileView } from "./ai-models-data";

/**
 * Pure builders for the model profile page: the benchmark card rows, the evidence level, and the
 * related-model lists. They only rearrange recorded facts; nothing here estimates a score that a
 * source did not publish, and no results are averaged into an overall grade.
 */

type FileCategory = ModelFile["category"];

/** Bilingual row labels for every benchmark area. */
export const AREA_LABELS: Record<BenchmarkArea, LocalizedText> = {
  "agentic-coding": { en: "Agentic coding", es: "Código agéntico" },
  terminal: { en: "Terminal work", es: "Trabajo en terminal" },
  reasoning: { en: "Reasoning", es: "Razonamiento" },
  "knowledge-work": { en: "Knowledge work", es: "Trabajo de conocimiento" },
  multimodal: { en: "Multimodal", es: "Multimodal" },
  "text-to-image": { en: "Text-to-image quality", es: "Calidad texto a imagen" },
  editing: { en: "Image editing", es: "Edición de imagen" },
  "text-rendering": { en: "Text in images", es: "Texto en imágenes" },
  "video-audio": { en: "Video with audio", es: "Vídeo con audio" },
  "video-silent": { en: "Silent video", es: "Vídeo sin sonido" },
  "image-to-video": { en: "Image to video", es: "Imagen a vídeo" },
  vocal: { en: "Vocal songs", es: "Canciones vocales" },
  instrumental: { en: "Instrumental", es: "Instrumental" },
  "speech-quality": { en: "Speech quality", es: "Calidad de voz" },
  latency: { en: "Latency", es: "Latencia" },
  languages: { en: "Languages", es: "Idiomas" },
};

// Each leaderboard measures one area; snapshot-only models get their rows from placements.
const LEADERBOARD_AREA: Record<RankingCategory, BenchmarkArea> = {
  coding: "agentic-coding",
  image: "text-to-image",
  video: "video-audio",
  "music-vocal": "vocal",
  "music-instrumental": "instrumental",
};
const LEADERBOARD_CATEGORY: Record<RankingCategory, FileCategory> = {
  coding: "llm-agents",
  image: "image",
  video: "video",
  "music-vocal": "music",
  "music-instrumental": "music",
};

// Fallback when a file's benchmark has no `area`: match well-known benchmark names. Order matters:
// the first matching pattern wins.
const NAME_AREAS: [RegExp, BenchmarkArea][] = [
  [/terminal-bench/i, "terminal"],
  [/swe|frontiercode|cursorbench|coding agent/i, "agentic-coding"],
  [/humanity|hle|gpqa|matharena|reasoning/i, "reasoning"],
  [/gdpval|automationbench|knowledge/i, "knowledge-work"],
  [/mmmu|chartography|babyvision|multimodal|vision/i, "multimodal"],
  [/speech arena|tts|voice/i, "speech-quality"],
];

// Benchmarks whose plain "Score" is a percentage of tasks solved (0–100), so the bar can use it.
const PERCENT_BENCHMARKS =
  /terminal-bench|swe|hle|humanity|gpqa|osworld|automationbench|frontiercode|cursorbench/i;

/** Two-letter badge text for a provider ("Anthropic" → "An", "Z.ai" → "Za"). */
export function providerInitials(provider: string): string {
  const letters = provider.replace(/[^A-Za-z]/g, "");
  return letters.charAt(0).toUpperCase() + letters.charAt(1).toLowerCase();
}

/** The file category of a profile: from its reviewed file, else from its first placement. */
export function profileCategory(profile: ProfileView): FileCategory {
  return (
    profile.model.file?.category ??
    LEADERBOARD_CATEGORY[profile.placements[0]?.category ?? "coding"]
  );
}

/** Which benchmark-card row a recorded result belongs to, or null when no row fits. */
export function areaFor(
  benchmark: { name: string; area?: BenchmarkArea | null; ranking: RankingCategory | null },
  category: FileCategory,
): BenchmarkArea | null {
  const areas: readonly BenchmarkArea[] = BENCHMARK_AREAS[category];
  if (benchmark.area && areas.includes(benchmark.area)) return benchmark.area;
  if (benchmark.ranking) return LEADERBOARD_AREA[benchmark.ranking];
  const match = NAME_AREAS.find(
    /** First matching name. */ ([pattern]) => pattern.test(benchmark.name),
  );
  return match && areas.includes(match[1]) ? match[1] : null;
}

/** One measured result as shown in a benchmark-card row. */
export type BenchmarkResult = {
  benchmark: string;
  metric: string;
  score: string;
  kind: "independent" | "self-reported";
  sourceLabel: string;
  sourceUrl: string;
  measuredAt: string | null;
  /** 0–1 bar fill, or null when the score has no shared scale (the row then shows text only). */
  share: number | null;
};

/** One row of the benchmark card: an area and its best result, or "No public result yet". */
export type BenchmarkRow = {
  area: BenchmarkArea;
  label: LocalizedText;
  result: BenchmarkResult | null;
  /** Further results recorded for the same area (shown as "+N more"). */
  moreResults: number;
};

/** Evidence strength: ●●● independent only, ●●○ mixed, ●○○ self-reported only, ○○○ none. */
export type EvidenceLevel = "independent" | "mixed" | "self-reported" | "none";

export type BenchmarkCard = {
  evidence: EvidenceLevel;
  rows: BenchmarkRow[];
  resultCount: number;
  independentCount: number;
  /** The best leaderboard placement, shown as the card's headline; null when unranked. */
  headline: { placement: RankingPlacement; tie: boolean } | null;
};

/**
 * Bar fill for a score, using the score's own meaning.
 *
 * Arena Elo: twice the expected win rate against the leaderboard leader (the leader fills the bar).
 * Leaderboard index: ratio to the leader. Percentages (an explicit "%" or a benchmark known to be
 * scored in percent of tasks): the value itself. Anything else has no shared scale: null.
 */
export function scoreShare(
  score: string,
  metric: string,
  benchmark: string,
  leader: RankingPlacement | null,
): number | null {
  const value = Number.parseFloat(score);
  if (!Number.isFinite(value)) return null;
  if (leader) {
    const top = Number.parseFloat(leader.score);
    if (isEloMetric(metric)) return Math.min(1, eloWinRate(value, top) * 2);
    if (top > 0 && !score.trim().endsWith("%")) return Math.min(1, value / top);
  }
  const percent =
    score.trim().endsWith("%") || (PERCENT_BENCHMARKS.test(benchmark) && value <= 100);
  return percent && value >= 0 ? Math.min(1, value / 100) : null;
}

/** Rank results so a row shows the strongest evidence: independent first, then the longer bar. */
function better(a: BenchmarkResult, b: BenchmarkResult): number {
  if (a.kind !== b.kind) return a.kind === "independent" ? -1 : 1;
  return (b.share ?? -1) - (a.share ?? -1);
}

/**
 * Build the benchmark card for one profile.
 *
 * Results come from the reviewed file's benchmarks when there is a file, otherwise from the
 * snapshot's leaderboard placements (all independent). Every area of the profile's category gets
 * a row; areas without a result say so instead of showing an estimate.
 */
export function benchmarkCard(profile: ProfileView, data: AiModelsData): BenchmarkCard {
  const category = profileCategory(profile);
  const leaders = new Map<RankingCategory, RankingPlacement>(
    Object.entries(data.leaderboards).map(
      /** The #1 placement of each leaderboard. */ ([key, entries]) =>
        [key as RankingCategory, entries[0].placement] as const,
    ),
  );
  const placementByArea = new Map<BenchmarkArea, RankingPlacement>(
    profile.placements.map(
      /** Index placements by the area their leaderboard measures. */ (entry) =>
        [LEADERBOARD_AREA[entry.category], entry.placement] as const,
    ),
  );
  const results: { area: BenchmarkArea; result: BenchmarkResult }[] = [];
  const file = profile.model.file;
  if (file) {
    for (const item of file.benchmarks) {
      const area = areaFor(item, category);
      if (!area) continue;
      const leader = item.ranking ? (leaders.get(item.ranking) ?? null) : null;
      results.push({
        area,
        result: {
          benchmark: item.name,
          metric: item.metric,
          score: item.score,
          kind: item.kind,
          sourceLabel: item.source_label,
          sourceUrl: item.source_url,
          measuredAt: item.measured_at,
          share: scoreShare(item.score, item.metric, item.name, leader),
        },
      });
    }
  } else {
    for (const [area, placement] of placementByArea)
      results.push({
        area,
        result: {
          benchmark: placement.metric,
          metric: placement.metric,
          score: placement.score,
          kind: "independent",
          sourceLabel: placement.sourceLabel,
          sourceUrl: placement.sourceUrl,
          measuredAt: null,
          share: scoreShare(
            placement.score,
            placement.metric,
            placement.metric,
            leaders.get(placement.category) ?? null,
          ),
        },
      });
  }
  const rows = (BENCHMARK_AREAS[category] as readonly BenchmarkArea[]).map(
    /** Pick the strongest result for one area. */ (area) => {
      const found = results
        .filter(/** This area only. */ (entry) => entry.area === area)
        .map(/** Keep the result. */ (entry) => entry.result)
        .sort(better);
      return {
        area,
        label: AREA_LABELS[area],
        result: found[0] ?? null,
        moreResults: Math.max(0, found.length - 1),
      };
    },
  );
  const independentCount = results.filter(
    /** Count independent results. */ (entry) => entry.result.kind === "independent",
  ).length;
  const evidence: EvidenceLevel =
    results.length === 0
      ? "none"
      : independentCount === results.length
        ? "independent"
        : independentCount === 0
          ? "self-reported"
          : "mixed";
  const best = [...profile.placements].sort(
    /** Lowest rank first. */ (a, b) => a.placement.rank - b.placement.rank,
  )[0];
  return {
    evidence,
    rows,
    resultCount: results.length,
    independentCount,
    headline: best
      ? {
          placement: best.placement,
          tie: Boolean(best.placement.tieNote) || /–/.test(best.placement.sourceRank),
        }
      : null,
  };
}

/** How a related model connects to the profile's model. */
export type Relation = "newer" | "previous" | "same-family" | "other-line";
export type RelatedModel = { model: ModelView; relation: Relation };
export type RelatedModels = {
  sameProvider: RelatedModel[];
  /** The model line's releases, oldest first; empty unless the line has two or more profiles. */
  history: ModelView[];
  alternatives: ModelView[];
};

// Show at most this many cards per related-model list, so the section stays scannable.
const RELATED_LIMIT = 6;
const ALTERNATIVES_LIMIT = 3;
const RELATION_ORDER: Relation[] = ["newer", "previous", "same-family", "other-line"];

/** Newest release first; models without a release date (snapshot or undated) last. */
function newestFirst(a: ModelView, b: ModelView): number {
  return (
    (b.file?.releaseDate ?? "").localeCompare(a.file?.releaseDate ?? "") ||
    a.name.localeCompare(b.name)
  );
}

/**
 * Related models for one profile, built only from published profiles (reviewed files and the
 * ranked snapshot), so every card links to a page that exists.
 *
 * - Same provider: newer and previous versions first, then the same line, then other lines.
 * - History: every published release of the same `family`, oldest first.
 * - Alternatives: other providers' models in the same leaderboard (closest ranks first) or, for an
 *   unranked model, the newest reviewed models of the same category.
 */
export function relatedModels(profile: ProfileView, data: AiModelsData): RelatedModels {
  const self = profile.model;
  const provider = self.provider.toLowerCase();
  const others = Object.values(data.profiles).filter(
    /** Everyone but this model. */ (entry) => entry.model.slug !== self.slug,
  );
  /** Classify one same-provider model. */
  const relationTo = (other: ModelView): Relation => {
    if (self.file?.supersededBy === other.slug) return "newer";
    if (other.file?.supersededBy === self.slug) return "previous";
    if (self.file && other.file && self.file.family === other.file.family) return "same-family";
    return "other-line";
  };
  const sameProvider = others
    .filter(/** Same provider. */ (entry) => entry.model.provider.toLowerCase() === provider)
    .map(
      /** Attach the relation. */ (entry) => ({
        model: entry.model,
        relation: relationTo(entry.model),
      }),
    )
    .sort(
      /** Relation order, then newest first. */ (a, b) =>
        RELATION_ORDER.indexOf(a.relation) - RELATION_ORDER.indexOf(b.relation) ||
        newestFirst(a.model, b.model),
    )
    .slice(0, RELATED_LIMIT);

  const family = self.file?.family;
  const line = family
    ? Object.values(data.profiles)
        .map(/** Model views. */ (entry) => entry.model)
        .filter(/** Same line. */ (model) => model.file?.family === family)
        .sort(
          /** Oldest first, undated last. */ (a, b) =>
            (a.file?.releaseDate ?? "9999").localeCompare(b.file?.releaseDate ?? "9999"),
        )
    : [];

  let alternatives: ModelView[];
  const first = profile.placements[0];
  if (first) {
    alternatives = data.leaderboards[first.category]
      .filter(
        /** Other providers only. */ (entry) => entry.model.provider.toLowerCase() !== provider,
      )
      .sort(
        /** Closest rank first. */ (a, b) =>
          Math.abs(a.placement.rank - first.placement.rank) -
          Math.abs(b.placement.rank - first.placement.rank),
      )
      .map(/** Model views. */ (entry) => entry.model);
  } else {
    const category = profileCategory(profile);
    alternatives = others
      .filter(
        /** Reviewed, unranked, same category, other provider. */ (entry) =>
          entry.placements.length === 0 &&
          entry.model.file?.category === category &&
          entry.model.provider.toLowerCase() !== provider,
      )
      .map(/** Model views. */ (entry) => entry.model)
      .sort(newestFirst);
  }

  return {
    sameProvider,
    history: line.length >= 2 ? line : [],
    alternatives: alternatives.slice(0, ALTERNATIVES_LIMIT),
  };
}

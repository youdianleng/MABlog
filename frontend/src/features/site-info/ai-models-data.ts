import {
  blendTokenPrice,
  getPlacementPrice,
  type MissingPrice,
  PRICE_CHECKED_DATE,
  type PriceUnit,
  type PublishedPrice,
} from "./ai-model-benchmark-context";
import type {
  FileBenchmark,
  FilePlan,
  FilePrice,
  FileSections,
  ModelFile,
  Rankings,
} from "./ai-model-files";
import {
  type AccessMode,
  type LocalizedText,
  type RankedModel,
  type RankingCategory,
  type RankingPlacement,
  rankedModels,
} from "./ai-model-rankings";

/**
 * Merge the reviewed model files, the built-in 2026-09-22 snapshot, and `rankings.yaml` into the
 * serializable data the `/ai-models` page and profiles render.
 *
 * Rules (confirmed on 2026-10-02):
 * - Order, "Why #N" reasons, and tie notes always come from `rankings.yaml`.
 * - A model with a `reviewed` file uses that file's facts, its benchmark entry tagged with the
 *   leaderboard key, and its first pricing entry. Draft files are ignored.
 * - Otherwise the built-in snapshot and the 2026-10-01 price check are used, so the page looks the
 *   same until a person approves a file.
 * - Every reviewed file gets a profile, even when it is not ranked.
 */

/** Extra facts shown only when a reviewed file backs the model. */
export type FileFacts = {
  category: ModelFile["category"];
  supersededBy: string | null;
  title: LocalizedText;
  summary: LocalizedText;
  whatsNew: { en: string[]; es: string[] };
  capabilities: { en: string[]; es: string[] };
  limitations: { en: string[]; es: string[] };
  plans: FilePlan[];
  pricing: FilePrice[];
  releaseDate: string | null;
  status: ModelFile["status"];
  contextWindow: number | null;
  regions: string[] | null;
  checkedAt: string;
  officialSources: ModelFile["officialSources"];
  /** Version-free model line (instructions 5.0.1), for the version history and related models. */
  family: string;
  version: string | null;
  benchmarks: FileBenchmark[];
  commonUses: { en: FileSections["commonUses"]; es: FileSections["commonUses"] };
  history: { en: string[]; es: string[] };
};

export type ModelView = {
  slug: string;
  name: string;
  provider: string;
  accent: RankedModel["accent"];
  access: AccessMode[];
  officialUrl: string;
  description: LocalizedText;
  userVerdict: LocalizedText;
  developerVerdict: LocalizedText;
  /** Present only when a reviewed model file supplies this model's facts. */
  file: FileFacts | null;
};

export type LeaderboardEntry = {
  category: RankingCategory;
  model: ModelView;
  placement: RankingPlacement;
  rankReason: LocalizedText;
  price: PublishedPrice | MissingPrice;
};

export type ProfileView = { model: ModelView; placements: LeaderboardEntry[] };

export type AiModelsData = {
  scoresEvaluated: string;
  reviewAfterDays: number;
  leaderboards: Record<RankingCategory, LeaderboardEntry[]>;
  profiles: Record<string, ProfileView>;
};

const NO_FILE_PRICE: MissingPrice = {
  missing: {
    en: "No price is listed in this model's reviewed file.",
    es: "La ficha revisada de este modelo no incluye precio.",
  },
};

/** Build a page model from a reviewed file. */
function modelFromFile(file: ModelFile): ModelView {
  const { en, es } = file.sections;
  return {
    slug: file.slug,
    name: file.model,
    provider: file.provider,
    accent: file.accent,
    access: file.access,
    officialUrl: file.officialSources[0].url,
    description: { en: en.description || en.summary, es: es.description || es.summary },
    userVerdict: { en: en.users, es: es.users },
    developerVerdict: { en: en.developers, es: es.developers },
    file: {
      category: file.category,
      supersededBy: file.supersededBy,
      title: file.title,
      summary: { en: en.summary, es: es.summary },
      whatsNew: { en: en.whatsNew, es: es.whatsNew },
      capabilities: { en: en.capabilities, es: es.capabilities },
      limitations: { en: en.limitations, es: es.limitations },
      plans: file.plans,
      pricing: file.pricing,
      releaseDate: file.releaseDate,
      status: file.status,
      contextWindow: file.contextWindow,
      regions: file.regions,
      checkedAt: file.checkedAt,
      officialSources: file.officialSources,
      family: file.family,
      version: file.version,
      benchmarks: file.benchmarks,
      commonUses: { en: en.commonUses, es: es.commonUses },
      history: { en: en.history, es: es.history },
    },
  };
}

/** Build a page model from the built-in snapshot record. */
function modelFromSnapshot(model: RankedModel): ModelView {
  return {
    slug: model.slug,
    name: model.name,
    provider: model.provider,
    accent: model.accent,
    access: model.access,
    officialUrl: model.officialUrl,
    description: model.description,
    userVerdict: model.userVerdict,
    developerVerdict: model.developerVerdict,
    file: null,
  };
}

/** Format a number as US dollars without trailing ".00" noise for whole values. */
const dollars = (value: number) => `$${Number.isInteger(value) ? value : value.toFixed(2)}`;

/**
 * Convert a file's pricing entry into the comparable price the bars use.
 *
 * Units are normalised where the conversion is exact (per image to per 1,000 images, per second to
 * per minute). Unknown units have no comparable form and return null.
 */
export function comparablePrice(
  price: FilePrice,
  sourceLabel: string,
  secondarySource: boolean,
  checkedAt: string,
): PublishedPrice | null {
  const base = {
    variant: price.variant ?? undefined,
    sourceLabel,
    sourceUrl: price.source_url,
    secondarySource,
    checkedAt,
  };
  if (price.unit === "per-1m-tokens" && price.input !== null) {
    const output = price.output ?? price.input;
    return {
      ...base,
      // Variant notes such as "independent price tracker" are carried by `secondarySource`.
      variant: undefined,
      amount: blendTokenPrice(price.input, output),
      unit: "usd-per-1m-tokens-blended",
      display: `${dollars(price.input)} in · ${dollars(output)} out / 1M tokens`,
    };
  }
  if (price.amount === null) return null;
  // Exact conversions: 1,000 images per pack, 60 seconds per minute.
  const table: Partial<Record<FilePrice["unit"], [PriceUnit, number, string]>> = {
    "per-1k-images": ["usd-per-1k-images", 1, "/ 1k images"],
    "per-image": ["usd-per-1k-images", 1000, "/ 1k images"],
    "per-minute": ["usd-per-minute", 1, "/ min"],
    "per-second": ["usd-per-minute", 60, "/ min"],
    "per-song": ["usd-per-song", 1, "/ song"],
    "per-1k-characters": ["usd-per-1k-characters", 1, "/ 1k characters"],
  };
  const rule = table[price.unit];
  if (!rule) return null;
  const amount = price.amount * rule[1];
  return { ...base, amount, unit: rule[0], display: `$${amount.toFixed(2)} ${rule[2]}` };
}

/** Price for a ranked placement backed by a reviewed file. */
function priceFromFile(file: ModelFile, category: RankingCategory): PublishedPrice | MissingPrice {
  const first = file.pricing[0];
  if (!first) return NO_FILE_PRICE;
  // Migrated prices keep the 2026-10-01 source label and tracker flag from the built-in check.
  const snapshot = first.evidence ? getPlacementPrice(category, file.slug) : null;
  const fromSnapshot = snapshot && "amount" in snapshot ? snapshot : null;
  const label =
    fromSnapshot?.sourceLabel ??
    file.officialSources.find(
      /** Prefer a named official page. */ (source) => source.url === first.source_url,
    )?.label ??
    new URL(first.source_url).hostname;
  // Migrated prices were read in the 2026-10-01 check; newly quoted ones on the file's checked_at.
  const checkedAt = first.evidence ? PRICE_CHECKED_DATE : file.checkedAt;
  return (
    comparablePrice(first, label, Boolean(fromSnapshot?.secondarySource), checkedAt) ?? {
      missing: {
        en: "The listed price uses a unit that cannot be compared on this page.",
        es: "El precio indicado usa una unidad que no se puede comparar en esta página.",
      },
    }
  );
}

/**
 * Combine files, snapshot, and rankings into page data.
 *
 * @param files parsed model files; only `reviewed` ones are used
 * @throws Error when `rankings.yaml` lists a slug that has neither a reviewed file nor a snapshot
 * record, or when a ranked reviewed file lacks a benchmark entry for that leaderboard.
 */
export function buildAiModelsData(files: ModelFile[], rankings: Rankings): AiModelsData {
  const reviewed = new Map(
    files
      .filter(/** Drafts never reach the page. */ (file) => file.reviewed)
      .map(/** Index by slug. */ (file) => [file.slug, file] as const),
  );
  const snapshot = new Map(
    rankedModels.map(/** Index by slug. */ (model) => [model.slug, model] as const),
  );
  const profiles: Record<string, ProfileView> = {};
  /** Return (and remember) the page model for a slug. */
  const viewFor = (slug: string): ModelView => {
    if (profiles[slug]) return profiles[slug].model;
    const file = reviewed.get(slug);
    const record = snapshot.get(slug);
    if (!file && !record) throw new Error(`rankings.yaml lists unknown model "${slug}"`);
    const model = file ? modelFromFile(file) : modelFromSnapshot(record!);
    profiles[slug] = { model, placements: [] };
    return model;
  };

  const leaderboards = {} as Record<RankingCategory, LeaderboardEntry[]>;
  for (const [category, entries] of Object.entries(rankings.leaderboards) as [
    RankingCategory,
    Rankings["leaderboards"][RankingCategory],
  ][]) {
    leaderboards[category] = entries.map(
      /** Resolve one ranked slug into a full leaderboard entry. */ (entry, index) => {
        const model = viewFor(entry.slug);
        const file = reviewed.get(entry.slug);
        let placement: RankingPlacement;
        let price: PublishedPrice | MissingPrice;
        if (file) {
          const benchmark = file.benchmarks.find(
            /** This leaderboard's score. */ (item) => item.ranking === category,
          );
          if (!benchmark)
            throw new Error(`${file.fileName} has no benchmark with ranking: ${category}`);
          placement = {
            category,
            rank: index + 1,
            metric: benchmark.metric,
            score: benchmark.score,
            confidenceInterval: benchmark.confidence_interval ?? undefined,
            samples: benchmark.samples ?? undefined,
            sourceRank: benchmark.source_rank ?? "—",
            sourceLabel: benchmark.source_label,
            sourceUrl: benchmark.source_url,
          };
          price = priceFromFile(file, category);
        } else {
          const record = snapshot.get(entry.slug)!;
          const stored = record.placements.find(
            /** This leaderboard's score. */ (item) => item.category === category,
          );
          if (!stored) throw new Error(`Snapshot has no ${category} placement for "${entry.slug}"`);
          placement = { ...stored, rank: index + 1 };
          price = getPlacementPrice(category, entry.slug);
        }
        if (entry.tieNote) placement.tieNote = entry.tieNote;
        const leaderboardEntry = {
          category,
          model,
          placement,
          rankReason: entry.rankReason,
          price,
        };
        profiles[entry.slug].placements.push(leaderboardEntry);
        return leaderboardEntry;
      },
    );
  }
  // Reviewed files outside the rankings still get a profile ("Not ranked in this edition").
  for (const file of reviewed.values()) if (!profiles[file.slug]) viewFor(file.slug);

  return {
    scoresEvaluated: rankings.scoresEvaluated,
    reviewAfterDays: rankings.reviewAfterDays,
    leaderboards,
    profiles,
  };
}

/** One category section of the "Other models" page. */
export type OtherModelsGroup = { category: ModelFile["category"]; models: ModelView[] };

// Section order on the page, matching the five file categories of the instruction file.
const CATEGORY_ORDER: ModelFile["category"][] = [
  "llm-agents",
  "image",
  "video",
  "music",
  "voice-sound",
];

/**
 * Reviewed models that are not on any leaderboard, grouped by file category for the "Other
 * models" page.
 *
 * Ranked models are left out because the leaderboards already present them. Within a category,
 * current releases come first and releases with a newer version (`superseded_by`) last; each part
 * is ordered newest release first, with undated files after dated ones. Empty categories are
 * omitted.
 */
export function otherModels(data: AiModelsData): OtherModelsGroup[] {
  const models = Object.values(data.profiles)
    .filter(
      /** Reviewed and unranked only. */ (profile) =>
        profile.model.file !== null && profile.placements.length === 0,
    )
    .map(/** Keep the model view. */ (profile) => profile.model);
  return CATEGORY_ORDER.map(
    /** Collect and order one category. */ (category) => ({
      category,
      models: models
        .filter(/** This category only. */ (model) => model.file?.category === category)
        .sort(
          /** Current before superseded, then newest release first (undated last). */ (a, b) => {
            const superseded =
              Number(Boolean(a.file?.supersededBy)) - Number(Boolean(b.file?.supersededBy));
            if (superseded !== 0) return superseded;
            const dateA = a.file?.releaseDate ?? "";
            const dateB = b.file?.releaseDate ?? "";
            return dateB.localeCompare(dateA) || a.name.localeCompare(b.name);
          },
        ),
    }),
  ).filter(/** Drop empty sections. */ (group) => group.models.length > 0);
}

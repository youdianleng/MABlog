import { parse as parseYaml } from "yaml";
import type { AccessMode, LocalizedText, RankingCategory } from "./ai-model-rankings";

/**
 * Parser and validator for the Markdown model files and `rankings.yaml` in
 * `frontend/content/ai-models/`. The format is defined by the AI-news instruction file
 * (`backend/app/services/ai_news/instructions/ai-news-instructions.md`, sections 4–6).
 *
 * Pure functions only (no file system), so tests can feed text directly. Invalid input throws
 * `ModelFileError` naming the file and the problem; callers decide whether to skip or fail.
 */

export const LEADERBOARDS = [
  "coding",
  "image",
  "video",
  "music-vocal",
  "music-instrumental",
] as const;
const CATEGORIES = ["llm-agents", "image", "video", "music", "voice-sound"] as const;
const STATUSES = ["generally_available", "preview", "beta", "deprecated", "retired"] as const;
const ACCESS_MODES: AccessMode[] = [
  "Free access",
  "Subscription",
  "API",
  "Open weights",
  "Regional access",
];
const ACCENTS = ["crimson", "gold", "blue", "sage", "violet"] as const;
const PRICE_UNITS = [
  "per-1m-tokens",
  "per-image",
  "per-1k-images",
  "per-second",
  "per-minute",
  "per-song",
  "per-1k-characters",
  "other",
] as const;
// Migrated values may omit a quote only with one of these evidence labels (instructions 5.4).
const MIGRATION_EVIDENCE = ["snapshot-2026-09-22", "price-check-2026-10-01"] as const;

/** A file or rankings document that does not follow the agreed format. */
export class ModelFileError extends Error {
  /** Name the offending file so a reviewer can find it quickly. */
  constructor(
    public readonly fileName: string,
    message: string,
  ) {
    super(`${fileName}: ${message}`);
  }
}

export type FilePrice = {
  unit: (typeof PRICE_UNITS)[number];
  input: number | null;
  output: number | null;
  amount: number | null;
  currency: string;
  variant: string | null;
  source_url: string;
  quote: string | null;
  evidence: string | null;
};

export type FilePlan = {
  name: string;
  price_monthly: number | null;
  currency: string;
  includes: string[];
  limits: string | null;
  regions: string[] | null;
  source_url: string;
  quote: string;
};

export type FileBenchmark = {
  name: string;
  metric: string;
  score: string;
  confidence_interval: string | null;
  samples: string | null;
  source_rank: string | null;
  kind: "self-reported" | "independent";
  source_label: string;
  source_url: string;
  measured_at: string;
  quote: string | null;
  evidence: string | null;
  ranking: RankingCategory | null;
};

/** The body sections `/ai-models` reads, for one language. Missing sections are empty. */
export type FileSections = {
  summary: string;
  description: string;
  whatsNew: string[];
  capabilities: string[];
  limitations: string[];
  users: string;
  developers: string;
};

export type ModelFile = {
  fileName: string;
  reviewed: boolean;
  slug: string;
  title: LocalizedText;
  provider: string;
  providerKey: string;
  model: string;
  version: string | null;
  family: string;
  category: (typeof CATEGORIES)[number];
  releaseDate: string | null;
  status: (typeof STATUSES)[number];
  access: AccessMode[];
  regions: string[] | null;
  accent: (typeof ACCENTS)[number];
  contextWindow: number | null;
  officialSources: { url: string; label: string; published: string | null }[];
  checkedAt: string;
  pricing: FilePrice[];
  plans: FilePlan[];
  benchmarks: FileBenchmark[];
  reviewNotes: string[];
  sections: { en: FileSections; es: FileSections };
};

export type RankingEntry = {
  slug: string;
  rankReason: LocalizedText;
  tieNote: LocalizedText | null;
};
export type Rankings = {
  scoresEvaluated: string;
  reviewAfterDays: number;
  leaderboards: Record<RankingCategory, RankingEntry[]>;
};

type Check = (condition: unknown, message: string) => asserts condition;

/** Build an assertion helper bound to one file name. */
function checker(fileName: string): Check {
  return /** Throw a file-specific format error when a condition fails. */ function check(
    condition,
    message,
  ) {
    if (!condition) throw new ModelFileError(fileName, message);
  };
}

/** A plain YAML mapping (not a list or null). */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
/** Non-blank text. */
const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";
/** Non-blank text or null. */
const isNullableText = (value: unknown) => value === null || isText(value);
/** A finite number or null. */
const isNullableNumber = (value: unknown) =>
  value === null || (typeof value === "number" && Number.isFinite(value));
/** An https URL (sources must be fetchable over TLS). */
const isUrl = (value: unknown) => isText(value) && /^https:\/\//.test(value);
/** An ISO calendar date, YYYY-MM-DD. */
const isDate = (value: unknown) => isText(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
/** Text in both English and Spanish. */
const isLocalized = (value: unknown): value is LocalizedText =>
  isRecord(value) && isText(value.en) && isText(value.es);

/** Split a file into its YAML front matter and Markdown body. */
function splitFrontMatter(text: string, check: Check): { yaml: string; body: string } {
  const normalized = text.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  check(match, "missing front matter between --- lines");
  return { yaml: match[1], body: match[2] };
}

// Headings of the bilingual body, in template order (instructions section 6).
const HEADINGS = {
  en: {
    language: "English",
    summary: "Summary",
    description: "Description",
    whatsNew: "What's new compared with the previous version",
    capabilities: "Key capabilities",
    limitations: "Limitations and caveats",
    bestFor: "Best for users / best for developers",
    users: "Users",
    developers: "Developers",
  },
  es: {
    language: "Español",
    summary: "Resumen",
    description: "Descripción",
    whatsNew: "Novedades respecto a la versión anterior",
    capabilities: "Capacidades clave",
    limitations: "Limitaciones y advertencias",
    bestFor: "Ideal para usuarios / ideal para desarrolladores",
    users: "Usuarios",
    developers: "Desarrolladores",
  },
} as const;

/** Return the text of the `##` section with this heading, or an empty string. */
function section(body: string, heading: string): string {
  const lines = body.split("\n");
  const start = lines.findIndex(
    /** Find the exact heading line. */ (line) => line === `## ${heading}`,
  );
  if (start === -1) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(
    /** Stop at the next section or language. */ (line) => /^#{1,2} /.test(line),
  );
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

/** Read `- item` lines as plain strings. */
function bullets(text: string): string[] {
  return text
    .split("\n")
    .filter(/** Keep list items only. */ (line) => line.startsWith("- "))
    .map(/** Drop the list marker. */ (line) => line.slice(2).trim());
}

/** Extract the sections `/ai-models` uses for one language. */
function readSections(body: string, language: "en" | "es", check: Check): FileSections {
  const names = HEADINGS[language];
  const marker = `# ${names.language}`;
  const start = body.indexOf(`${marker}\n`);
  check(start !== -1, `missing "${marker}" body`);
  const other = body.indexOf(
    `# ${HEADINGS[language === "en" ? "es" : "en"].language}\n`,
    start + 1,
  );
  const part = body.slice(start, other > start ? other : undefined);
  const bestFor = section(part, names.bestFor);
  /** Read one "- **Label:** text" verdict line. */
  const verdict = (label: string) =>
    bestFor
      .split("\n")
      .find(/** Match the labelled line. */ (line) => line.startsWith(`- **${label}:**`))
      ?.slice(`- **${label}:**`.length)
      .trim() ?? "";
  const sections: FileSections = {
    summary: section(part, names.summary),
    description: section(part, names.description),
    whatsNew: bullets(section(part, names.whatsNew)),
    capabilities: bullets(section(part, names.capabilities)),
    limitations: bullets(section(part, names.limitations)),
    users: verdict(names.users),
    developers: verdict(names.developers),
  };
  check(sections.summary, `${language} Summary is empty`);
  check(sections.users && sections.developers, `${language} users/developers lines are missing`);
  return sections;
}

/** Validate one quoted or migrated value: it needs a quote, or a migration evidence label. */
function checkEvidence(entry: Record<string, unknown>, where: string, check: Check): void {
  check(isUrl(entry.source_url), `${where}: source_url must be an https URL`);
  check(
    isText(entry.quote) ||
      (entry.quote === null && (MIGRATION_EVIDENCE as readonly unknown[]).includes(entry.evidence)),
    `${where}: needs a quote, or quote: null with a migration evidence label`,
  );
}

/**
 * Parse and validate one model file.
 *
 * @throws ModelFileError when the front matter or required body sections break the format.
 */
export function parseModelFile(text: string, fileName: string): ModelFile {
  const check: Check = checker(fileName);
  const { yaml, body } = splitFrontMatter(text, check);
  let data: unknown;
  try {
    data = parseYaml(yaml);
  } catch (error) {
    throw new ModelFileError(fileName, `invalid YAML (${(error as Error).message})`);
  }
  check(isRecord(data), "front matter must be a mapping");
  check(data.schema === "mablog-ai-model/1", "schema must be mablog-ai-model/1");
  check(
    data.review_status === "draft" || data.review_status === "reviewed",
    "review_status must be draft or reviewed",
  );
  check(isText(data.slug) && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug), "slug must be kebab-case");
  check(fileName.endsWith(`_${data.slug}.md`), "file name must end with _<slug>.md");
  check(isText(data.title_en) && isText(data.title_es), "title_en and title_es are required");
  for (const key of ["provider", "provider_key", "model", "family"])
    check(isText(data[key]), `${key} is required`);
  check(isNullableText(data.version), "version must be text or null");
  check((CATEGORIES as readonly unknown[]).includes(data.category), "unknown category");
  check(
    data.release_date === null || isDate(data.release_date),
    "release_date must be YYYY-MM-DD or null",
  );
  check((STATUSES as readonly unknown[]).includes(data.status), "unknown status");
  check(
    Array.isArray(data.access) &&
      data.access.length > 0 &&
      data.access.every(/** Allowed access label. */ (item) => ACCESS_MODES.includes(item)),
    "access must list allowed access modes",
  );
  check(
    data.regions === null || (Array.isArray(data.regions) && data.regions.every(isText)),
    "regions must be a list or null",
  );
  check((ACCENTS as readonly unknown[]).includes(data.accent), "unknown accent");
  check(isNullableNumber(data.context_window), "context_window must be a number or null");
  check(isDate(data.checked_at), "checked_at must be YYYY-MM-DD");
  check(
    Array.isArray(data.official_sources) && data.official_sources.length > 0,
    "official_sources is required",
  );
  for (const [index, source] of (data.official_sources as unknown[]).entries())
    check(
      isRecord(source) &&
        isUrl(source.url) &&
        isText(source.label) &&
        (source.published === null || isDate(source.published)),
      `official_sources[${index}] needs url, label, and published`,
    );

  check(Array.isArray(data.pricing), "pricing must be a list");
  for (const [index, price] of (data.pricing as unknown[]).entries()) {
    const where = `pricing[${index}]`;
    check(isRecord(price), `${where} must be a mapping`);
    check((PRICE_UNITS as readonly unknown[]).includes(price.unit), `${where}: unknown unit`);
    for (const key of ["input", "output", "amount"])
      check(isNullableNumber(price[key]), `${where}: ${key} must be a number or null`);
    check(
      price.unit === "per-1m-tokens"
        ? typeof price.input === "number"
        : typeof price.amount === "number",
      `${where}: token prices need input; other units need amount`,
    );
    check(isText(price.currency), `${where}: currency is required`);
    checkEvidence(price, where, check);
  }

  check(Array.isArray(data.plans), "plans must be a list");
  for (const [index, plan] of (data.plans as unknown[]).entries()) {
    const where = `plans[${index}]`;
    check(isRecord(plan) && isText(plan.name), `${where}: name is required`);
    check(isNullableNumber(plan.price_monthly), `${where}: price_monthly must be a number or null`);
    check(
      Array.isArray(plan.includes) && plan.includes.every(isText),
      `${where}: includes must list names`,
    );
    check(isUrl(plan.source_url) && isText(plan.quote), `${where}: needs source_url and quote`);
  }

  check(Array.isArray(data.benchmarks), "benchmarks must be a list");
  const rankingKeys = new Set<unknown>();
  for (const [index, benchmark] of (data.benchmarks as unknown[]).entries()) {
    const where = `benchmarks[${index}]`;
    check(isRecord(benchmark), `${where} must be a mapping`);
    for (const key of ["name", "metric", "score", "source_label"])
      check(isText(benchmark[key]), `${where}: ${key} is required`);
    check(
      benchmark.kind === "self-reported" || benchmark.kind === "independent",
      `${where}: kind must be self-reported or independent`,
    );
    check(isDate(benchmark.measured_at), `${where}: measured_at must be YYYY-MM-DD`);
    check(
      benchmark.ranking === null ||
        (LEADERBOARDS as readonly unknown[]).includes(benchmark.ranking),
      `${where}: unknown ranking key`,
    );
    check(
      benchmark.ranking === null || !rankingKeys.has(benchmark.ranking),
      `${where}: ranking key used twice`,
    );
    rankingKeys.add(benchmark.ranking);
    checkEvidence(benchmark, where, check);
  }
  check(
    data.review_notes === undefined ||
      (Array.isArray(data.review_notes) && data.review_notes.every(isText)),
    "review_notes must be a list of text",
  );

  return {
    fileName,
    reviewed: data.review_status === "reviewed",
    slug: data.slug,
    title: { en: data.title_en, es: data.title_es },
    provider: data.provider as string,
    providerKey: data.provider_key as string,
    model: data.model as string,
    version: data.version as string | null,
    family: data.family as string,
    category: data.category as ModelFile["category"],
    releaseDate: data.release_date as string | null,
    status: data.status as ModelFile["status"],
    access: data.access as AccessMode[],
    regions: data.regions as string[] | null,
    accent: data.accent as ModelFile["accent"],
    contextWindow: data.context_window as number | null,
    officialSources: data.official_sources as ModelFile["officialSources"],
    checkedAt: data.checked_at as string,
    pricing: data.pricing as FilePrice[],
    plans: data.plans as FilePlan[],
    benchmarks: data.benchmarks as FileBenchmark[],
    reviewNotes: (data.review_notes as string[] | undefined) ?? [],
    sections: { en: readSections(body, "en", check), es: readSections(body, "es", check) },
  };
}

/**
 * Parse and validate `rankings.yaml`.
 *
 * @throws ModelFileError when a leaderboard is missing, does not list exactly five entries, or
 * an entry lacks its bilingual reason.
 */
export function parseRankings(text: string, fileName = "rankings.yaml"): Rankings {
  const check: Check = checker(fileName);
  let data: unknown;
  try {
    data = parseYaml(text);
  } catch (error) {
    throw new ModelFileError(fileName, `invalid YAML (${(error as Error).message})`);
  }
  check(
    isRecord(data) && data.schema === "mablog-ai-rankings/1",
    "schema must be mablog-ai-rankings/1",
  );
  check(isDate(data.scores_evaluated), "scores_evaluated must be YYYY-MM-DD");
  check(
    typeof data.review_after_days === "number" && data.review_after_days > 0,
    "review_after_days must be positive",
  );
  check(isRecord(data.leaderboards), "leaderboards is required");
  const leaderboards = {} as Record<RankingCategory, RankingEntry[]>;
  for (const key of LEADERBOARDS) {
    const entries = data.leaderboards[key];
    // Five cards per leaderboard is the confirmed page layout.
    check(Array.isArray(entries) && entries.length === 5, `${key} must list exactly five entries`);
    const seen = new Set<string>();
    leaderboards[key] = entries.map(
      /** Validate one ranked entry. */ (entry: unknown, index: number) => {
        check(isRecord(entry) && isText(entry.slug), `${key}[${index}]: slug is required`);
        check(!seen.has(entry.slug), `${key}: ${entry.slug} is listed twice`);
        seen.add(entry.slug);
        check(isLocalized(entry.rank_reason), `${key}[${index}]: rank_reason needs en and es`);
        check(
          entry.tie_note === null || isLocalized(entry.tie_note),
          `${key}[${index}]: tie_note must be null or en/es`,
        );
        return {
          slug: entry.slug,
          rankReason: entry.rank_reason,
          tieNote: entry.tie_note as LocalizedText | null,
        };
      },
    );
  }
  return {
    scoresEvaluated: data.scores_evaluated as string,
    reviewAfterDays: data.review_after_days as number,
    leaderboards,
  };
}

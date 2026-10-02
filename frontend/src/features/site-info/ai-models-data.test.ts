import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isModelFileName, parseModelFile, parseRankings } from "./ai-model-files";
import { buildAiModelsData, comparablePrice, otherModels } from "./ai-models-data";

const CONTENT = new URL("../../../content/ai-models/", import.meta.url);
/** Read one committed content file. */
const content = (name: string) => readFileSync(new URL(name, CONTENT), "utf8");
const rankings = parseRankings(content("rankings.yaml"));
const glmName = "2026-08-18_zai_glm-5-3.md";
const lyriaName = "undated_google_lyria-3-pro.md";

/** Parse a committed file, optionally marked reviewed. */
function file(name: string, reviewed: boolean) {
  const text = content(name);
  return parseModelFile(
    reviewed ? text.replace("review_status: draft", "review_status: reviewed") : text,
    name,
  );
}

/** Merge rules between reviewed files, the built-in snapshot, and rankings.yaml. */
describe("buildAiModelsData", () => {
  // Draft files never change the page; the snapshot is used instead.
  it("ignores draft files", () => {
    const withDraft = buildAiModelsData([file(glmName, false)], rankings);
    const plain = buildAiModelsData([], rankings);
    expect(withDraft).toEqual(plain);
    expect(plain.leaderboards.coding[4].model.file).toBeNull();
  });

  // A reviewed file supplies the model facts, its tagged score, and its first price.
  it("uses a reviewed file's facts, score, and price", () => {
    const data = buildAiModelsData([file(glmName, true)], rankings);
    const entry = data.leaderboards.coding[4];
    expect(entry.model.file?.plans[0].name).toBe("GLM Coding Plan");
    expect(entry.model.description.en).toMatch(/^GLM-5.3 targets long-horizon coding/);
    expect(entry.placement).toMatchObject({ rank: 5, score: "54", sourceRank: "4–5" });
    // The tie note and reason still come from rankings.yaml.
    expect(entry.placement.tieNote?.en).toMatch(/Muse Spark 1.3/);
    expect(entry.rankReason.en).toMatch(/^Level with Muse Spark 1.3/);
    expect(entry.price).toMatchObject({
      unit: "usd-per-1m-tokens-blended",
      checkedAt: "2026-10-01",
    });
    expect("amount" in entry.price && entry.price.amount).toBeCloseTo(2.15, 6);
  });

  // Music had no comparable prices; a reviewed Lyria file adds its quoted per-song price.
  it("adds a newly quoted price from a reviewed file", () => {
    const data = buildAiModelsData([file(lyriaName, true)], rankings);
    const entry = data.leaderboards["music-vocal"].find(
      /** Lyria entry. */ (item) => item.model.slug === "lyria-3-pro",
    )!;
    expect(entry.price).toMatchObject({
      amount: 0.08,
      unit: "usd-per-song",
      checkedAt: "2026-10-02",
    });
  });

  // A reviewed file outside the rankings still gets a profile, with no placements.
  it("gives unranked reviewed files a profile", () => {
    const text = content(glmName)
      .replaceAll("glm-5-3", "glm-5-9")
      .replace("ranking: coding", "ranking: null");
    const unranked = parseModelFile(
      text.replace("review_status: draft", "review_status: reviewed"),
      "2026-09-30_zai_glm-5-9.md",
    );
    const data = buildAiModelsData([unranked], rankings);
    expect(data.profiles["glm-5-9"].placements).toEqual([]);
    expect(data.profiles["glm-5-9"].model.file).not.toBeNull();
  });

  // The committed reviewed files (the 2026-10-02 sweep) add profiles but leave the rankings alone.
  it("builds the page from the committed files as reviewed by the site owner", () => {
    const files = readdirSync(CONTENT)
      .filter(isModelFileName)
      .map(
        /** Parse each committed file as written. */ (name) => parseModelFile(content(name), name),
      );
    const reviewed = new Set(
      files
        .filter(/** Reviewed files only. */ (entry) => entry.reviewed)
        .map(/** Their slugs. */ (entry) => entry.slug),
    );
    const data = buildAiModelsData(files, rankings);
    // Every reviewed file has a profile backed by its file, whether or not it is ranked.
    for (const slug of reviewed) expect(data.profiles[slug].model.file).not.toBeNull();
    // Approvals change facts, never the order: each leaderboard still follows rankings.yaml, and
    // a ranked model uses its file exactly when that file is reviewed.
    for (const [key, entries] of Object.entries(data.leaderboards)) {
      const order = rankings.leaderboards[key as keyof typeof rankings.leaderboards];
      expect(entries.map(/** Shown slug. */ (entry) => entry.model.slug)).toEqual(
        order.map(/** Ranked slug. */ (entry) => entry.slug),
      );
      for (const entry of entries)
        expect(entry.model.file !== null).toBe(reviewed.has(entry.model.slug));
    }
  });
});

/** The "Other models" page selection. */
describe("otherModels", () => {
  /** Parse a reviewed copy of GLM-5.3 with a new slug, release date, and optional newer version. */
  function unranked(slug: string, date: string | null, supersededBy: string | null = null) {
    const text = content(glmName)
      .replaceAll("glm-5-3", slug)
      .replace("ranking: coding", "ranking: null")
      .replace("release_date: 2026-08-18", `release_date: ${date ?? "null"}`)
      .replace("superseded_by: null", `superseded_by: ${supersededBy ?? "null"}`)
      .replace("review_status: draft", "review_status: reviewed");
    return parseModelFile(text, `x_zai_${slug}.md`);
  }

  // Ranked models stay on the leaderboards; only reviewed, unranked files are listed.
  it("lists reviewed unranked models only, current first and newest first", () => {
    const data = buildAiModelsData(
      [
        file(glmName, true),
        unranked("glm-old", "2026-09-01", "glm-new"),
        unranked("glm-new", "2026-09-20"),
        unranked("glm-undated", null),
        unranked("glm-mid", "2026-09-10"),
      ],
      rankings,
    );
    const groups = otherModels(data);
    expect(groups.map(/** Section ids. */ (group) => group.category)).toEqual(["llm-agents"]);
    expect(groups[0].models.map(/** Shown slugs. */ (model) => model.slug)).toEqual([
      "glm-new",
      "glm-mid",
      "glm-undated",
      "glm-old",
    ]);
  });

  // Nothing reviewed outside the rankings means no sections (the page shows its empty state).
  it("returns no sections without unranked reviewed files", () => {
    expect(otherModels(buildAiModelsData([file(glmName, true)], rankings))).toEqual([]);
  });
});

/** Unit conversions for comparable prices. */
describe("comparablePrice", () => {
  const base = {
    input: null,
    output: null,
    currency: "USD",
    variant: null,
    source_url: "https://example.test",
    quote: "q",
    evidence: null,
  };
  // Exact conversions only: per image to per 1,000 images, per second to per minute.
  it("normalises exact unit conversions", () => {
    expect(
      comparablePrice({ ...base, unit: "per-image", amount: 0.045 }, "Test", false, "2026-10-02"),
    ).toMatchObject({ unit: "usd-per-1k-images", amount: 45 });
    expect(
      comparablePrice({ ...base, unit: "per-second", amount: 0.2 }, "Test", false, "2026-10-02"),
    ).toMatchObject({ unit: "usd-per-minute", amount: 12 });
    expect(
      comparablePrice({ ...base, unit: "other", amount: 1 }, "Test", false, "2026-10-02"),
    ).toBeNull();
  });
});

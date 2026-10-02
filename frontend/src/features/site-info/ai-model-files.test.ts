import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isModelFileName, ModelFileError, parseModelFile, parseRankings } from "./ai-model-files";

const CONTENT = new URL("../../../content/ai-models/", import.meta.url);

/** Read one committed content file. */
function content(name: string): string {
  return readFileSync(new URL(name, CONTENT), "utf8");
}

const glmName = "2026-08-18_zai_glm-5-3.md";

/** Format checks for the committed model files and the parser's rejection rules. */
describe("model files", () => {
  // Every committed file must parse; a broken edit fails here before reaching the page.
  it("parses every committed model file", () => {
    const names = readdirSync(CONTENT).filter(isModelFileName);
    // 20 migrated files plus 12 from the 2026-10-02 freshness sweep.
    expect(names.length).toBe(32);
    for (const name of names) {
      const file = parseModelFile(content(name), name);
      expect(file.reviewed).toBe(false);
      expect(file.sections.en.summary.split(/\s+/).length).toBeGreaterThanOrEqual(100);
      expect(file.sections.es.summary.split(/\s+/).length).toBeLessThanOrEqual(200);
    }
  });

  // Run reports share the folder but must never be parsed as model files.
  it("skips underscore-prefixed notes such as run reports", () => {
    expect(isModelFileName("_run-report_2026-10-02.md")).toBe(false);
    expect(isModelFileName("rankings.yaml")).toBe(false);
    expect(isModelFileName(glmName)).toBe(true);
  });

  // A superseded release must point to a committed newer file of the same model line.
  it("links every superseded file to an existing newer release", () => {
    const files = readdirSync(CONTENT)
      .filter(isModelFileName)
      .map(/** Parse each committed file. */ (name) => parseModelFile(content(name), name));
    const bySlug = new Map(files.map(/** Index by slug. */ (file) => [file.slug, file]));
    for (const file of files) {
      if (file.supersededBy === null) continue;
      const newer = bySlug.get(file.supersededBy);
      expect(newer, `${file.slug} -> ${file.supersededBy}`).toBeDefined();
      expect(newer?.family).toBe(file.family);
    }
  });

  // Structured data and body sections come through intact.
  it("reads front matter and body sections", () => {
    const file = parseModelFile(content(glmName), glmName);
    expect(file.slug).toBe("glm-5-3");
    expect(file.family).toBe("glm");
    expect(file.contextWindow).toBe(1000000);
    expect(file.pricing[0]).toMatchObject({ unit: "per-1m-tokens", input: 1.4, output: 4.4 });
    expect(file.plans[0]).toMatchObject({ name: "GLM Coding Plan", price_monthly: 18 });
    expect(file.benchmarks[0].ranking).toBe("coding");
    expect(file.sections.en.whatsNew).toHaveLength(3);
    expect(file.sections.es.users).toMatch(/^Una alternativa/);
  });

  // A new value without a quote (and without a migration label) is rejected.
  it("rejects unquoted values without migration evidence", () => {
    const broken = content(glmName).replace(
      "    quote: GLM-5.3 $1.4 $0.26 Limited-time Free $4.4\n    evidence: null",
      "    quote: null\n    evidence: null",
    );
    expect(/** Parse the altered input. */ () => parseModelFile(broken, glmName)).toThrow(
      /needs a quote/,
    );
  });

  // The slug must match the file name so profile URLs and files cannot drift apart.
  it("rejects a file name that does not end with the slug", () => {
    expect(
      /** Parse the altered input. */ () =>
        parseModelFile(content(glmName), "2026-08-18_zai_other.md"),
    ).toThrow(ModelFileError);
  });

  // superseded_by is null while a release is the newest of its line, else another slug.
  it("reads and validates superseded_by", () => {
    expect(parseModelFile(content(glmName), glmName).supersededBy).toBeNull();
    const newer = content(glmName).replace("superseded_by: null", "superseded_by: glm-5-4");
    expect(parseModelFile(newer, glmName).supersededBy).toBe("glm-5-4");
    const self = content(glmName).replace("superseded_by: null", "superseded_by: glm-5-3");
    expect(/** Parse the altered input. */ () => parseModelFile(self, glmName)).toThrow(
      /superseded_by/,
    );
  });

  // Each leaderboard key may appear on only one benchmark entry per file.
  it("rejects a duplicated ranking key", () => {
    const text = content(glmName);
    const entry = text.slice(
      text.indexOf("  - name: Artificial Analysis"),
      text.indexOf("review_notes:"),
    );
    const doubled = text.replace("review_notes:", `${entry}review_notes:`);
    expect(/** Parse the altered input. */ () => parseModelFile(doubled, glmName)).toThrow(
      /ranking key used twice/,
    );
  });
});

/** Format checks for rankings.yaml. */
describe("rankings.yaml", () => {
  // The committed file lists five entries on each of the five leaderboards.
  it("parses the committed rankings", () => {
    const rankings = parseRankings(content("rankings.yaml"));
    expect(rankings.scoresEvaluated).toBe("2026-09-22");
    expect(rankings.leaderboards.coding.map(/** Slug order. */ (entry) => entry.slug)).toEqual([
      "claude-fable-5-1",
      "gpt-6-astra",
      "grok-4-7",
      "muse-spark-1-3",
      "glm-5-3",
    ]);
  });

  // A leaderboard with the wrong number of entries is rejected.
  it("rejects a leaderboard without exactly five entries", () => {
    const text = content("rankings.yaml");
    const start = text.indexOf("    - slug: glm-5-3");
    const end = text.indexOf("  image:");
    expect(
      /** Parse the altered input. */ () => parseRankings(text.slice(0, start) + text.slice(end)),
    ).toThrow(/exactly five/);
  });
});

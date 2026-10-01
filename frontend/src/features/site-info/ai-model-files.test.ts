import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ModelFileError, parseModelFile, parseRankings } from "./ai-model-files";

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
    const names = readdirSync(CONTENT).filter(
      /** Model files only. */ (name) => name.endsWith(".md"),
    );
    expect(names.length).toBe(20);
    for (const name of names) {
      const file = parseModelFile(content(name), name);
      expect(file.reviewed).toBe(false);
      expect(file.sections.en.summary.split(/\s+/).length).toBeGreaterThanOrEqual(100);
      expect(file.sections.es.summary.split(/\s+/).length).toBeLessThanOrEqual(200);
    }
  });

  // Structured data and body sections come through intact.
  it("reads front matter and body sections", () => {
    const file = parseModelFile(content(glmName), glmName);
    expect(file.slug).toBe("glm-5-3");
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

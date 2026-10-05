import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isModelFileName, parseModelFile, parseRankings } from "./ai-model-files";
import {
  areaFor,
  benchmarkCard,
  providerInitials,
  relatedModels,
  scoreShare,
} from "./ai-model-profile-data";
import { buildAiModelsData } from "./ai-models-data";

const CONTENT = new URL("../../../content/ai-models/", import.meta.url);
/** Read one committed content file. */
const content = (name: string) => readFileSync(new URL(name, CONTENT), "utf8");
const rankings = parseRankings(content("rankings.yaml"));

/** Page data from every committed file, with every file treated as reviewed. */
function allReviewed() {
  const files = readdirSync(CONTENT)
    .filter(isModelFileName)
    .map(
      /** Parse each file as reviewed so every profile exists. */ (name) =>
        parseModelFile(
          content(name).replace("review_status: draft", "review_status: reviewed"),
          name,
        ),
    );
  return buildAiModelsData(files, rankings);
}

/** Benchmark card, evidence, and related-model builders for the profile page. */
describe("model profile data", () => {
  const data = allReviewed();

  // Badges use letters only, so punctuation in provider names does not leak in.
  it("derives provider initials", () => {
    expect(providerInitials("Anthropic")).toBe("An");
    expect(providerInitials("Z.ai")).toBe("Za");
  });

  // Bars follow each score's own meaning and never invent a scale.
  it("scales scores by their meaning", () => {
    expect(scoreShare("66.4%", "Accuracy", "Terminal-Bench 4.0", null)).toBeCloseTo(0.664);
    expect(scoreShare("31.2", "Score", "Terminal-Bench 4.0", null)).toBeCloseTo(0.312);
    expect(scoreShare("3471", "Rating", "Codeforces", null)).toBeNull();
    const leader = { score: "62", metric: "Coding Agent Index v1.5" } as never;
    expect(scoreShare("31", "Coding Agent Index v1.5", "Artificial Analysis", leader)).toBeCloseTo(
      0.5,
    );
    const arena = { score: "1233", metric: "Arena Elo" } as never;
    expect(scoreShare("1233", "Arena Elo", "Video Arena", arena)).toBeCloseTo(1);
  });

  // Explicit areas win; otherwise leaderboard keys and benchmark names decide.
  it("assigns results to benchmark-card rows", () => {
    expect(areaFor({ name: "X", area: "reasoning", ranking: null }, "llm-agents")).toBe(
      "reasoning",
    );
    expect(areaFor({ name: "Artificial Analysis", ranking: "coding" }, "llm-agents")).toBe(
      "agentic-coding",
    );
    expect(areaFor({ name: "Terminal-Bench 4.0", ranking: null }, "llm-agents")).toBe("terminal");
    expect(areaFor({ name: "Unknown Bench", ranking: null }, "llm-agents")).toBeNull();
  });

  // Opus 5.5 has one self-reported Terminal-Bench result: one filled row, the rest marked empty.
  it("builds an honest card for a self-reported model", () => {
    const card = benchmarkCard(data.profiles["claude-opus-5-5"], data);
    expect(card.evidence).toBe("self-reported");
    expect(card.headline).toBeNull();
    const terminal = card.rows.find(/** Terminal row. */ (row) => row.area === "terminal")!;
    expect(terminal.result?.score).toBe("66.4%");
    expect(terminal.result?.share).toBeCloseTo(0.664);
    expect(
      card.rows
        .filter(/** Empty rows. */ (row) => row.result === null)
        .map(/** Areas. */ (row) => row.area),
    ).toEqual(["agentic-coding", "reasoning", "knowledge-work", "multimodal"]);
  });

  // A ranked model's card leads with its best placement and uses the leaderboard for the bar.
  it("headlines the best placement of a ranked model", () => {
    const card = benchmarkCard(data.profiles["claude-fable-5-1"], data);
    expect(card.headline?.placement.rank).toBe(1);
    const coding = card.rows.find(/** Coding row. */ (row) => row.area === "agentic-coding")!;
    expect(coding.result?.kind).toBe("independent");
    expect(coding.result?.share).toBeCloseTo(1);
  });

  // Same-provider lists put the newer release first; the line history is oldest first.
  it("relates versions and providers", () => {
    const sol = relatedModels(data.profiles["gpt-6-sol"], data);
    expect(sol.sameProvider[0]).toMatchObject({ relation: "newer" });
    expect(sol.sameProvider[0].model.slug).toBe("gpt-6-1-sol");
    expect(sol.history.map(/** Slugs. */ (model) => model.slug)).toEqual([
      "gpt-6-sol",
      "gpt-6-1-sol",
    ]);
    const newer = relatedModels(data.profiles["gpt-6-1-sol"], data);
    expect(newer.sameProvider[0]).toMatchObject({ relation: "previous" });
    for (const model of newer.alternatives) expect(model.provider).not.toBe("OpenAI");
    expect(newer.alternatives.length).toBeLessThanOrEqual(3);
  });
});

import { describe, expect, it } from "vitest";
import { categories, parsePostCategory } from "./categories";

/** URL category parameter validation against the shared taxonomy. */
describe("parsePostCategory", () => {
  // Every taxonomy key round-trips unchanged.
  it("accepts every known category key", () => {
    for (const category of categories)
      expect(parsePostCategory(category.value)).toBe(category.value);
  });

  // Unknown, differently cased, or missing values mean "no category filter".
  it("rejects unknown values", () => {
    expect(parsePostCategory("Travel")).toBe("");
    expect(parsePostCategory("cooking")).toBe("");
    expect(parsePostCategory(undefined)).toBe("");
    expect(parsePostCategory(["anime", "travel"])).toBe("anime");
  });
});

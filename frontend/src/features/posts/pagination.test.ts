import { describe, expect, it } from "vitest";
import { parsePublicPostPage } from "./pagination";

/** URL page parameter normalization for public collection pages. */
describe("parsePublicPostPage", () => {
  // Valid positive integers from the URL are kept as the one-based page number.
  it("accepts positive integer pages", () => {
    expect(parsePublicPostPage("3")).toBe(3);
    expect(parsePublicPostPage(["2", "9"])).toBe(2);
  });

  // Anything that is not a safe positive integer falls back to the first page.
  it("falls back to page one for invalid input", () => {
    for (const value of [undefined, "", "0", "-4", "1.5", "abc", "1e400", []]) {
      expect(parsePublicPostPage(value as string | string[] | undefined)).toBe(1);
    }
  });
});

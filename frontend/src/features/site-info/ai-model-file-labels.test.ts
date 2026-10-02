import { describe, expect, it } from "vitest";
import { filePriceText, titleTagline } from "./ai-model-file-labels";
import type { FilePrice } from "./ai-model-files";

/** Shared labels for reviewed-file facts. */
describe("ai model file labels", () => {
  // Card taglines drop the model name before the colon and read as a sentence.
  it("turns a file title into a capitalized tagline", () => {
    expect(titleTagline("GPT-6.1 Sol: near-Astra performance at one-fifth of the price")).toBe(
      "Near-Astra performance at one-fifth of the price",
    );
    expect(titleTagline("A title without a colon")).toBe("A title without a colon");
  });

  // Prices keep their own unit: tokens show input / output, other units one amount.
  it("describes token and per-unit prices", () => {
    const base: FilePrice = {
      unit: "per-1m-tokens",
      input: 2,
      output: 10,
      amount: null,
      currency: "USD",
      variant: null,
      source_url: "https://example.com",
      quote: "Price $2 • $10",
      evidence: null,
    };
    expect(filePriceText(base, false)).toBe("$2 / $10 per 1M tokens (input / output)");
    expect(
      filePriceText({ ...base, unit: "per-song", input: null, output: null, amount: 0.08 }, true),
    ).toBe("$0.08 por canción");
    expect(filePriceText({ ...base, input: 0.113, output: 0.382 }, false)).toBe(
      "$0.113 / $0.382 per 1M tokens (input / output)",
    );
    expect(filePriceText({ ...base, input: 0.1, output: 0.5 }, false)).toBe(
      "$0.10 / $0.50 per 1M tokens (input / output)",
    );
  });
});

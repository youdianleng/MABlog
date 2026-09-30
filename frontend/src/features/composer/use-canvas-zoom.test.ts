import { describe, expect, it } from "vitest";
import { nextCanvasZoom } from "./use-canvas-zoom";

/** Wheel-step zoom arithmetic used by the composer canvas. */
describe("nextCanvasZoom", () => {
  // Wheel up (negative deltaY) zooms in and wheel down zooms out by one 10% step.
  it("steps in the wheel direction", () => {
    expect(nextCanvasZoom(1, -100)).toBe(1.1);
    expect(nextCanvasZoom(1, 100)).toBe(0.9);
  });

  // Rounding to hundredths prevents floating-point drift after many steps.
  it("rounds to two decimal places", () => {
    let zoom = 1;
    for (let step = 0; step < 7; step += 1) zoom = nextCanvasZoom(zoom, -1);
    expect(zoom).toBe(1.7);
  });

  // The zoom never leaves the supported 25%–300% range.
  it("clamps to the supported range", () => {
    expect(nextCanvasZoom(0.25, 100)).toBe(0.25);
    expect(nextCanvasZoom(3, -100)).toBe(3);
  });
});

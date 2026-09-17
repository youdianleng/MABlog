import { expect, test } from "@playwright/test";

test("Discover cards rise and fade in from left to right", /** Verify the ordered reveal, final visual state, and route-specific scope. */ async function discoverReveal({
  page,
}) {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const firstReveal = page.locator(".post-card-reveal").first();
  await expect(firstReveal).toHaveAttribute("data-reveal-ready", "true");
  await expect(firstReveal).toHaveAttribute("data-reveal-visible", "false");
  expect(
    await page.locator(".post-card-reveal").evaluateAll(
      /** Read the first row's stagger delays in visual left-to-right order. */
      function revealDelays(cards) {
        return cards.slice(0, 3).map(
          /** Return the computed delay for one Discover card. */ function cardDelay(
            card,
          ) {
            const delay = getComputedStyle(card)
              .getPropertyValue("--post-reveal-delay")
              .trim();
            return Number.parseFloat(delay) * (delay.endsWith("ms") ? 1 : 1000);
          },
        );
      },
    ),
  ).toEqual([0, 90, 180]);
  await firstReveal.scrollIntoViewIfNeeded();
  await expect(firstReveal).toHaveAttribute("data-reveal-visible", "true");
  await expect
    .poll(
      /** Read the animated properties until the card reaches its settled position. */
      async function settledReveal() {
        return firstReveal.evaluate(
          /** Return the card's final opacity and transform without relying on a screenshot. */
          function readRevealStyle(element) {
            const style = getComputedStyle(element);
            return { opacity: style.opacity, transform: style.transform };
          },
        );
      },
    )
    .toEqual({ opacity: "1", transform: "matrix(1, 0, 0, 1, 0, 0)" });

  await page.goto("/public");
  await expect(page.locator(".post-card").first()).toBeVisible();
  await expect(page.locator(".post-card-reveal")).toHaveCount(0);
});

test("Discover cards skip motion when reduced motion is preferred", /** Keep every story immediately readable for motion-sensitive visitors. */ async function reducedReveal({
  page,
}) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const firstReveal = page.locator(".post-card-reveal").first();
  await expect(firstReveal).toHaveAttribute("data-reveal-visible", "true");
  expect(
    await firstReveal.evaluate(
      /** Read the reduced-motion card's rendered transform. */ function reducedTransform(
        element,
      ) {
        return getComputedStyle(element).transform;
      },
    ),
  ).toBe("none");
});

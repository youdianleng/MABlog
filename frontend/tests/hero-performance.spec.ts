import { expect, test } from "@playwright/test";

test("Discover hero avoids repaint-heavy effects and sleeps offscreen", /** Protect smooth scrolling through the layered homepage hero. */ async function optimizedHero({
  page,
}) {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const showcase = page.locator(".character-showcase");
  await expect(showcase).toBeVisible();
  expect(
    await showcase.evaluate(
      /** Read the styles that determine whether scrolling must repaint large filtered layers. */
      function performanceStyles(hero) {
        const character = hero.querySelector(".home-character-image.active")!;
        const control = hero.querySelector(".carousel-controls .icon-button")!;
        const orbit = hero.querySelector(".home-orbit")!;
        return {
          characterFilter: getComputedStyle(character).filter,
          controlBackdrop: getComputedStyle(control).backdropFilter,
          contentVisibility: getComputedStyle(hero).contentVisibility,
          orbitFilter: getComputedStyle(orbit).filter,
        };
      },
    ),
  ).toEqual({
    characterFilter: "none",
    controlBackdrop: "none",
    contentVisibility: "auto",
    orbitFilter: "none",
  });

  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await expect(showcase).not.toBeInViewport();
  const offscreenPair = await showcase.locator(".home-character-cycle").evaluate(
    /** Capture both character identities after the hero leaves the viewport. */
    function readPair(cycle) {
      return `${cycle.getAttribute("data-left-character")}:${cycle.getAttribute("data-right-character")}`;
    },
  );
  await page.waitForTimeout(3800);
  expect(
    await showcase.locator(".home-character-cycle").evaluate(
      /** Confirm the decorative rotation did not update while no pixels were visible. */
      function readSleepingPair(cycle) {
        return `${cycle.getAttribute("data-left-character")}:${cycle.getAttribute("data-right-character")}`;
      },
    ),
  ).toBe(offscreenPair);
});

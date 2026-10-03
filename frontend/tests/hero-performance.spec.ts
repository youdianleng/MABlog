import { expect, test } from "@playwright/test";

test("Discover hero avoids repaint-heavy effects", /** Protect smooth scrolling through the layered homepage hero. */ async function optimizedHero({
  page,
}) {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const showcase = page.locator(".home-showcase");
  await expect(showcase).toBeVisible();
  expect(
    await showcase.evaluate(
      /** Read the styles that determine whether scrolling must repaint large filtered layers. */
      function performanceStyles(hero) {
        const control = hero.querySelector(".carousel-controls .icon-button")!;
        const orbit = hero.querySelector(".home-orbit")!;
        return {
          controlBackdrop: getComputedStyle(control).backdropFilter,
          contentVisibility: getComputedStyle(hero).contentVisibility,
          orbitFilter: getComputedStyle(orbit).filter,
        };
      },
    ),
  ).toEqual({
    controlBackdrop: "none",
    contentVisibility: "auto",
    orbitFilter: "none",
  });
});

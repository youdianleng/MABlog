import { test, expect } from "@playwright/test";

test("other models page lists reviewed unranked models and links both ways", /** The rankings page links to the page, cards open profiles, and unranked profiles link back. */ async function otherModelsPage({
  page,
}) {
  await page.goto("/ai-models");
  await page.getByRole("link", { name: "See other models" }).click();
  await expect(page).toHaveURL(/\/ai-models\/other-models$/);
  await expect(page.getByRole("heading", { name: "Other models worth knowing." })).toBeVisible();

  // Ranked models stay on the leaderboards; reviewed new releases appear here, by category.
  const llms = page.locator("#llm-agents");
  await expect(llms.getByRole("heading", { name: "LLMs & agents" })).toBeVisible();
  await expect(llms.getByRole("link", { name: "Claude Opus 5.5", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "GPT Image 2.5 Sunburst", exact: true })).toHaveCount(
    0,
  );
  // A release with a newer version points to it.
  const sol = page.locator(".other-model-card", { hasText: "GPT-6 Sol" }).first();
  await expect(sol.getByRole("link", { name: "gpt-6-1-sol" })).toBeVisible();

  await llms.getByRole("link", { name: "Claude Opus 5.5", exact: true }).click();
  await expect(page).toHaveURL(/\/ai-models\/claude-opus-5-5$/);
  await page.getByRole("link", { name: "Other models", exact: true }).first().click();
  await expect(page).toHaveURL(/\/ai-models\/other-models$/);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      /** Detect horizontal page overflow on a phone. */ () =>
        document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

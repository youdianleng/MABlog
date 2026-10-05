import { test, expect } from "@playwright/test";

test("reviewed model profile shows evidence, versions, and related models", /** GPT-6 Sol has a newer release, no benchmark results yet, and same-provider models. */ async function reviewedProfile({
  page,
}) {
  await page.goto("/ai-models/gpt-6-sol");
  await expect(page.getByRole("heading", { level: 1, name: "GPT-6 Sol" })).toBeVisible();
  // The newer release is announced by name and linked.
  await expect(page.getByRole("note").getByRole("link", { name: "GPT-6.1 Sol" })).toHaveAttribute(
    "href",
    "/ai-models/gpt-6-1-sol",
  );
  // No results are recorded, so every row says so instead of showing a bar.
  await expect(page.getByText("Evidence: No benchmark results yet")).toBeVisible();
  await expect(page.locator(".mp-bench-missing")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "What it can do" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plans and pricing" })).toBeVisible();

  const related = page.locator(".mp-related");
  await expect(related.getByRole("heading", { name: "Version history" })).toBeVisible();
  await expect(related.locator(".mp-timeline li")).toHaveCount(2);
  const newer = related.locator(".mp-related-card", { hasText: "Newer version" });
  await expect(newer).toContainText("GPT-6.1 Sol");
  for (const card of await related
    .locator(".mp-related-group", { hasText: "Alternatives" })
    .locator(".mp-related-card")
    .all())
    await expect(card).not.toContainText("OpenAI");

  await page.locator(".mp-sources summary").click();
  await expect(page.getByRole("heading", { name: "Update history" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      /** Detect horizontal page overflow on a phone. */ () =>
        document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

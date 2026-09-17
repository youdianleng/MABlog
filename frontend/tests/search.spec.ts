import { test, expect } from "@playwright/test";

test("global search ranks public posts and deep-links to the matched block", /** Verify the explanation-first search page, filters, responsive layout, and reader highlighting. */ async function searchExperience({ page }) {
  const errors: string[] = [];
  page.on("pageerror", /** Retain browser exceptions so a visually successful search cannot hide runtime failures. */ function captureError(error) { errors.push(error.message); });
  await page.goto("/");
  await page.getByLabel("Search posts").fill("patient fox first step");
  await page.getByLabel("Search posts").press("Enter");
  await expect(page).toHaveURL(/\/search$/);
  await expect(page).not.toHaveURL(/patient%20fox/);
  await expect(page.getByRole("heading", { name: "Why these stories match" })).toBeVisible();
  const publicGroup = page.locator(".search-group").filter({ has: page.getByRole("heading", { name: "Public", exact: true }) });
  await expect(publicGroup.getByRole("heading", { name: "When the garden wakes", exact: true })).toBeVisible();
  await publicGroup.getByRole("heading", { name: "When the garden wakes", exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/[^?]+\?block=notes&highlight=search/);
  await expect(page.locator(".content-block.search-highlight")).toContainText("The fox waited at the first step");
  await page.goto("/search");
  await page.getByLabel("Search question").fill("mountain");
  const questionBox = await page.getByLabel("Search question").boundingBox();
  expect(questionBox!.height).toBeLessThanOrEqual(44);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Where the mountains remember", exact: true })).toBeVisible();
  await page.getByLabel("Language").selectOption("es");
  await expect(page.getByRole("heading", { name: "Encuentra la historia que permanece contigo" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Buscar publicaciones")).toBeVisible();
  expect(await page.evaluate(/** Confirm the search controls and grouped results do not widen the phone document. */ function searchFitsPhone() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
  expect(errors).toEqual([]);
});


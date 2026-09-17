import { test, expect } from "@playwright/test";
import { administratorLogin } from "./helpers";

test("administrator can inspect and unlock the weekly AI newsroom without publishing", /** Verify protected navigation, durable status, source registry, and responsive operations layout. */ async function aiNewsWorkspace({ page }) {
  const errors: string[] = [];
  page.on("pageerror", /** Capture runtime failures across the protected newsroom screens. */ function captureError(error) { errors.push(error.message); });
  await administratorLogin(page);
  await page.getByRole("link", { name: "AI newsroom", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/ai-news$/);
  await expect(page.getByRole("heading", { name: "Weekly AI newsroom" })).toBeVisible();
  await expect(page.getByText("Weekly publishing is off")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enable schedule" })).toBeVisible();
  await expect(page.getByText("Protected actions unlocked")).toBeVisible();
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Official registry" })).toBeVisible();
  await expect(page.getByText("OpenAI", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(/** Confirm the operations workspace does not widen a phone document. */ function newsroomFitsPhone() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
  expect(errors).toEqual([]);
});

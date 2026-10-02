import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { administratorLogin, demoLogin } from "./helpers";

// Compose bind-mounts this folder into the backend (writes) and frontend (reads), so a file written
// here is what the review page and /ai-models see.
const CONTENT = join(__dirname, "..", "content", "ai-models");
const TEST_FILE = "2026-10-02_zai_e2e-review-test.md";

/** Write a temporary draft (a copy of GLM-5.3 with its own slug and no ranking) for the test. */
function writeTestDraft() {
  const text = readFileSync(join(CONTENT, "2026-08-18_zai_glm-5-3.md"), "utf8")
    .replace(/\r\n/g, "\n")
    .replace("slug: glm-5-3", "slug: e2e-review-test")
    .replace("ranking: coding", "ranking: null");
  writeFileSync(join(CONTENT, TEST_FILE), text);
}

test("model review page is hidden from regular accounts", /** A signed-in non-administrator sees an access notice and the API refuses the drafts. */ async function regularAccount({
  page,
}) {
  await demoLogin(page, "mablog_demo");
  await page.goto("/admin/ai-models");
  await expect(page.getByRole("heading", { name: "Administrator access required" })).toBeVisible();
  const response = await page.request.get("/api/admin/ai-models", {
    headers: { "X-MAblog": "1" },
  });
  expect(response.status()).toBe(403);
});

test("administrator approves a draft and returns it to draft", /** Approve publishes the profile immediately; returning removes it and records the reason. */ async function approveFlow({
  page,
}) {
  writeTestDraft();
  try {
    await administratorLogin(page);
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("link", { name: "Model review" }).click();
    await expect(page).toHaveURL(/\/admin\/ai-models$/);
    await expect(page.getByRole("heading", { name: "AI model review" })).toBeVisible();

    // Two GLM-5.3 drafts exist (the real one and the copy); pick the copy by its file name.
    const rows = page.getByRole("list", { name: "Model files" }).getByRole("button", {
      name: /GLM-5\.3/,
    });
    for (const row of await rows.all()) {
      await row.click();
      if (await page.getByText(TEST_FILE, { exact: true }).isVisible()) break;
    }
    await expect(page.getByText(TEST_FILE, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open review notes" })).toBeVisible();

    const approve = page.getByRole("button", { name: "Approve", exact: true });
    await expect(approve).toBeDisabled();
    await page.getByLabel(/I checked the prices, plans, and benchmarks/).check();
    await approve.click();
    await expect(page.getByText("Approved. It now appears on /ai-models.")).toBeVisible();
    const approved = readFileSync(join(CONTENT, TEST_FILE), "utf8");
    expect(approved).toContain("review_status: reviewed");
    expect(approved).toContain("review_notes: []");
    expect(approved).toContain("Marked reviewed by mablog_admin on the admin review page.");
    const profile = await page.request.get("/ai-models/e2e-review-test");
    expect(await profile.text()).toContain("GLM-5.3");

    await page.getByLabel("Reason").fill("End-to-end test returns this copy to draft.");
    await page.getByRole("button", { name: "Return to draft", exact: true }).click();
    await expect(
      page.getByText("Returned to draft. It no longer appears on /ai-models."),
    ).toBeVisible();
    const returned = readFileSync(join(CONTENT, TEST_FILE), "utf8");
    expect(returned).toContain("review_status: draft");
    expect(returned).toContain("End-to-end test returns this copy to draft.");
  } finally {
    rmSync(join(CONTENT, TEST_FILE), { force: true });
  }
});

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
  const providerResponse = page.waitForResponse(/** Observe the redacted provider-status request. */ function isProviderStatus(response) { return response.url().endsWith("/api/admin/ai-news/providers"); });
  await page.getByRole("button", { name: "Providers & models" }).click();
  const providerPayload = await (await providerResponse).text();
  expect(providerPayload).not.toContain("api_key");
  expect(providerPayload).not.toContain("ciphertext");
  await expect(page.getByRole("heading", { name: "Newsletter models" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "OpenAI", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Brave Search" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(/** Confirm the operations workspace does not widen a phone document. */ function newsroomFitsPhone() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
  expect(errors).toEqual([]);
});

test("failed evidence preview offers a deliberate publication exception without submitting it", /** Verify the warning, written reason, acknowledgement, and phone layout without publishing. */ async function evidenceExceptionReview({ page }) {
  await administratorLogin(page);
  const run = {
    id: "fixture-evidence-run", kind: "preview", status: "failed", stage: "verify", progress: 60,
    publication_intent: false, historical: false, pinned: false, window_start: 1789920000, window_end: 1790006400,
    openai_cost: 0.12, brave_queries: 0, warnings: [], last_error: "verification_failed_after_repairs",
    created: 1790006400, started: 1790006400, completed: 1790006500, result: {},
  };
  const draftDocument = { details: { title: "Retained draft", summary: "Private preview" }, blocks: [] };
  await page.route("**/api/admin/ai-news/status", /** Supply a stable failed run without touching production news data. */ async function status(route) {
    await route.fulfill({ json: { readiness: { ready: true, master_enabled: true, openai: "ready", brave: "degraded", email: "ready", warnings: ["brave_not_configured"] }, schedule: { enabled: false, timezone: "Europe/Madrid", weekday: 0, hour: 9, minute: 0, next_run: 0, activation_preview_run_id: null }, budget: { run_limit: 2, month_limit: 10, brave_limit: 15, month_spend: 0 }, active_run: null, recent_runs: [run], unread_alerts: 0 } });
  });
  await page.route("**/api/admin/ai-news/runs/fixture-evidence-run", /** Return a complete retained failure for the drawer. */ async function detail(route) {
    await route.fulfill({ json: { ...run, jobs: [{ id: "verify", stage: "verify", status: "failed", attempts: 1, available_at: 0, checkpoint: {}, last_error: run.last_error, updated: run.completed }], candidates: [], documents: [], claims: [], edition: { id: "edition", run_id: run.id, post_id: null, status: "composed", documents: { en: draftDocument, es: draftDocument }, verification: { passed: false, issues: [{ release_id: "", language: "both", reason: "The citation does not establish the model name." }] }, source_count: 1, verified_at: 0, correction_note: "", created: run.created, updated: run.completed } } });
  });
  await page.goto("/admin/ai-news");
  await page.locator(".news-history .news-table-row").last().click();
  await expect(page.getByText("Fact-check could not approve this draft")).toBeVisible();
  await expect(page.getByText("The citation does not establish the model name.")).toBeVisible();
  await page.getByRole("button", { name: "Publish with exception" }).click();
  await expect(page.getByText(/An official page may have changed since the draft was captured/)).toBeVisible();
  const confirm = page.getByRole("button", { name: "Confirm public exception" });
  await expect(confirm).toBeDisabled();
  await page.getByLabel("Why are you approving this exception?").fill("I reviewed both languages and the source attribution.");
  await page.getByRole("checkbox", { name: /I reviewed both languages and accept the failed fact-check and possible source changes/ }).check();
  await expect(confirm).toBeEnabled();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(/** Confirm the expanded exception form fits a narrow viewport. */ function fitsPhone() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
});

test("ordinary administrator preview offers guarded publication without a fact-check claim", /** Keep manual approval and schedule-rehearsal paths visually distinct without a live publication. */ async function manualPreviewApproval({ page }) {
  await administratorLogin(page);
  const run = {
    id: "fixture-manual-run", kind: "preview", status: "preview", stage: "retention", progress: 100,
    publication_intent: false, historical: false, pinned: false, window_start: 1789920000, window_end: 1790006400,
    openai_cost: 0.08, brave_queries: 0, warnings: [], last_error: "",
    created: 1790006400, started: 1790006400, completed: 1790006500, result: {},
  };
  const draftDocument = { details: { title: "Manual draft", summary: "Private preview" }, blocks: [] };
  await page.route("**/api/admin/ai-news/status", /** Show a completed ordinary preview without an activation proof. */ async function status(route) {
    await route.fulfill({ json: { readiness: { ready: true, master_enabled: true, openai: "ready", brave: "degraded", email: "ready", warnings: [] }, schedule: { enabled: false, timezone: "Europe/Madrid", weekday: 0, hour: 9, minute: 0, next_run: 0, activation_preview_run_id: null }, budget: { run_limit: 2, month_limit: 10, brave_limit: 15, month_spend: 0 }, active_run: null, recent_runs: [run], unread_alerts: 0 } });
  });
  await page.route("**/api/admin/ai-news/runs/fixture-manual-run", /** Expose the private safety-cleared preview without fabricating verification. */ async function detail(route) {
    await route.fulfill({ json: { ...run, jobs: [{ id: "safety", stage: "safety", status: "done", attempts: 1, available_at: 0, checkpoint: { passed: true }, last_error: "", updated: run.completed }], candidates: [], documents: [], claims: [], edition: { id: "edition", run_id: run.id, post_id: null, status: "safety_cleared_preview", documents: { en: draftDocument, es: draftDocument }, verification: { fact_check_performed: false, safety: { passed: true } }, source_count: 1, verified_at: 0, correction_note: "", created: run.created, updated: run.completed } } });
  });
  await page.goto("/admin/ai-news");
  await expect(page.getByRole("button", { name: "Test weekly pipeline" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enable schedule" })).toBeDisabled();
  await page.locator(".news-history .news-table-row").last().click();
  await expect(page.getByText("Safety cleared · not fact-checked")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish preview" })).toHaveCount(0);
  await page.getByRole("button", { name: "Review and publish" }).click();
  await expect(page.getByText("Publish without a claim fact-check?")).toBeVisible();
  const confirm = page.getByRole("button", { name: "Confirm public publication" });
  await expect(confirm).toBeDisabled();
  await page.getByLabel("Why are you approving this preview?").fill("I reviewed both languages and the original links.");
  await page.getByRole("checkbox", { name: /I reviewed both languages and understand that claims were not fact-checked/ }).check();
  await expect(confirm).toBeEnabled();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(/** Confirm manual approval fits a narrow viewport. */ function fitsPhone() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
});

test("verified preview shows publish errors and links an already published release", /** Make a rejected publish action recoverable without creating any public post. */ async function verifiedPreviewFeedback({ page }) {
  await administratorLogin(page);
  const preview = {
    id: "fixture-verified", kind: "preview", status: "preview", stage: "retention", progress: 100,
    publication_intent: false, historical: false, pinned: false, window_start: 1789920000, window_end: 1790006400,
    openai_cost: 0.08, brave_queries: 0, warnings: [], last_error: "",
    created: 1790006400, started: 1790006400, completed: 1790006500, result: {},
  };
  const duplicate = { ...preview, id: "fixture-duplicate", created: preview.created - 60 };
  const document = { details: { title: "Verified draft", summary: "Private preview" }, blocks: [] };
  const edition = { id: "edition", run_id: preview.id, post_id: null, status: "verified_preview", documents: { en: document, es: document }, verification: { passed: true, safety: { passed: true } }, source_count: 1, verified_at: preview.created, correction_note: "", created: preview.created, updated: preview.completed };
  await page.route("**/api/admin/ai-news/status", /** List a publishable preview and one already covered release. */ async function status(route) {
    await route.fulfill({ json: { readiness: { ready: true, master_enabled: true, openai: "ready", brave: "degraded", email: "ready", warnings: [] }, schedule: { enabled: false, timezone: "Europe/Madrid", weekday: 0, hour: 9, minute: 0, next_run: 0, activation_preview_run_id: preview.id }, budget: { run_limit: 2, month_limit: 10, brave_limit: 15, month_spend: 0 }, active_run: null, recent_runs: [preview, duplicate], unread_alerts: 0 } });
  });
  await page.route("**/api/admin/ai-news/runs/fixture-verified", /** Return a unique verified preview. */ async function detail(route) {
    await route.fulfill({ json: { ...preview, jobs: [], candidates: [], documents: [], claims: [], publication_conflicts: [], edition } });
  });
  await page.route("**/api/admin/ai-news/runs/fixture-duplicate", /** Return a preview already represented by a public post. */ async function detail(route) {
    await route.fulfill({ json: { ...duplicate, jobs: [], candidates: [], documents: [], claims: [], publication_conflicts: [{ model_name: "Claude Opus 5.5", post_id: "existing-post" }], edition: { ...edition, run_id: duplicate.id } } });
  });
  await page.route("**/api/admin/ai-news/runs/fixture-verified/publish", /** Simulate a source-recheck rejection without posting anything. */ async function publish(route) {
    await route.fulfill({ status: 409, json: { detail: "An official source changed; run a new preview before publishing" } });
  });
  await page.goto("/admin/ai-news");
  await page.locator(".news-history .news-table-row").nth(1).click();
  await page.getByRole("button", { name: "Publish preview" }).click();
  await expect(page.locator(".news-run-drawer .notice.error")).toContainText("An official source changed");
  await page.getByRole("button", { name: "Close run details" }).click();
  await page.locator(".news-history .news-table-row").nth(2).click();
  await expect(page.getByText("Already covered in another edition")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish preview" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Open existing post" })).toHaveAttribute("href", "/posts/existing-post");
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(/** Keep the actionable duplicate notice within a narrow phone viewport. */ function fitsPhone() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
});

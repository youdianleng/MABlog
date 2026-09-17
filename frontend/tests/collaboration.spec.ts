import { test, expect } from "@playwright/test";
import { demoLogin } from "./helpers";

test("an invited editor submits block and canvas changes for separate creator review", /** Verify the review interface using two independently authenticated browsers. */ async function collaboration({ page, browser }) {
  // Give the collaborator a separate cookie jar so their login cannot replace the creator's session.
  const editorContext = await browser.newContext({ baseURL: "http://localhost:3000" });
  const editor = await editorContext.newPage();
  let id = "";
  try {
    await demoLogin(page, "mablog_demo");
    await demoLogin(editor, "mablog_demo_1");
    const headers = { "X-MAblog": "1" };
    id = (await (await page.request.post("/api/posts", { headers })).json()).id;
    const draft = await (await page.request.get(`/api/posts/${id}/draft`)).json();
    draft.document = { ...draft.document, details: { title: "Browser review story", summary: "", cover: "" }, blocks: [{ id: "shared-block", html: "<p>Current approved wording.</p>" }] };
    await page.request.put(`/api/posts/${id}/draft`, { headers, data: { document: draft.document, baseline: draft.baseline, versions: draft.versions } });
    await page.request.post(`/api/posts/${id}/submit`, { headers });
    await page.goto(`/sharing/${id}`);
    await page.getByLabel("Registered email").fill("mablog_demo_1@example.com");
    await page.getByLabel("Permission", { exact: true }).selectOption("editor");
    await page.getByRole("button", { name: "Grant access", exact: true }).click();
    await expect(page.getByText("mablog_demo_1@example.com · Editor")).toBeVisible();
    await editor.goto(`/compose/${id}`);
    await editor.getByText("Current approved wording.", { exact: true }).click();
    await editor.locator(".tiptap").fill("An editor's submitted wording.");
    await editor.locator(".editor-settings-menu summary").click();
    await editor.getByLabel("Width", { exact: true }).first().fill("800");
    await editor.getByRole("button", { name: "Submit for approval", exact: true }).click();
    await expect(editor.getByText("Changes submitted successfully.")).toBeVisible();
    await page.goto(`/posts/${id}`);
    const reviewLink = page.getByRole("link", { name: "Review, 2 reviews pending" });
    const reviewBadge = reviewLink.locator(".pending-review-badge");
    await expect(reviewBadge).toHaveText("2");
    expect(await reviewBadge.evaluate(
      /** Confirm the pending count uses the requested circular red treatment. */ function badgeStyle(
        badge,
      ) {
        const style = getComputedStyle(badge);
        return { background: style.backgroundColor, radius: style.borderRadius };
      },
    )).toEqual({ background: "rgb(166, 51, 56)", radius: "999px" });
    await reviewLink.click();
    const layout = page.locator("section").filter({ has: page.getByRole("heading", { name: "Canvas layout", exact: true }) });
    const block = page.locator("section").filter({ has: page.getByRole("heading", { name: "Block shared-b", exact: true }) });
    await expect(block.getByText("Current approved wording.")).toBeVisible();
    await expect(block.getByText("An editor's submitted wording.")).toBeVisible();
    await block.getByRole("button", { name: "Approve", exact: true }).click();
    await expect(block.getByText("Approved", { exact: true })).toBeVisible();
    await expect(layout.getByText("Pending", { exact: true })).toBeVisible();
    await page.goto(`/posts/${id}`);
    await expect(page.getByRole("link", { name: "Review, 1 review pending" }).locator(".pending-review-badge")).toHaveText("1");
    await page.getByRole("link", { name: "Review, 1 review pending" }).click();
    await layout.getByRole("button", { name: "Reject", exact: true }).click();
    await expect(layout.getByText("Rejected", { exact: true })).toBeVisible();
    await page.goto(`/posts/${id}`);
    await expect(page.getByRole("link", { name: "Review", exact: true }).locator(".pending-review-badge")).toHaveCount(0);
    const approved = await (await page.request.get(`/api/posts/${id}`)).json();
    expect(approved.document.canvas.width).toBe(1200);
    expect(approved.document.blocks[0].html).toContain("An editor's submitted wording.");
  } finally {
    if (id) await page.request.delete(`/api/posts/${id}`, { headers: { "X-MAblog": "1" } });
    await editorContext.close();
  }
});

test("a creator can share a post with the local administrator", /** Regress the special-use `.local` administrator address accepted by the registered-account workflow. */ async function shareWithAdministrator({
  page,
}) {
  await demoLogin(page, "mablog_demo");
  const headers = { "X-MAblog": "1" };
  const id = (await (await page.request.post("/api/posts", { headers })).json()).id;
  try {
    await page.goto(`/sharing/${id}`);
    await page.getByLabel("Registered email").fill("admin@mablog.local");
    await page.getByRole("button", { name: "Grant access", exact: true }).click();
    await expect(page.getByText("admin@mablog.local · Viewer")).toBeVisible();
    await expect(page.locator(".toast[role=alert]")).toHaveCount(0);
  } finally {
    await page.request.delete(`/api/posts/${id}`, { headers });
  }
});


import { expect, test } from "@playwright/test";
import { administratorLogin } from "./helpers";

// Playwright's bundled Chromium crashes the page when it reads a stored directory handle back from
// IndexedDB (observed with chromium-1243), while installed Google Chrome restores it correctly.
// The folder spec therefore runs in the real Chrome channel, which users of this feature have.
test.use({ channel: "chrome" });

test("profile lets a user choose, keep, and forget a Markdown folder", /** Verify the folder panel with a stand-in picker backed by a real origin-private directory handle. */ async function markdownFolder({
  page,
}) {
  // The native folder dialog cannot be automated, so return a real FileSystemDirectoryHandle from
  // the origin-private file system. It can be stored in IndexedDB and answers permission queries.
  await page.addInitScript(
    /** Replace the picker before page scripts run. */ function installPicker() {
      window.showDirectoryPicker = /** Return a writable test folder. */ async function picker() {
        const root = await navigator.storage.getDirectory();
        return root.getDirectoryHandle("mablog-notes", { create: true });
      };
    },
  );
  await administratorLogin(page);
  await page.goto("/profile");
  const panel = page.getByRole("region", { name: "Markdown folder" });
  await expect(panel).toBeVisible();
  // Start from a clean state if an earlier run left a folder saved for this account.
  const forgetButton = panel.getByRole("button", { name: "Forget folder" });
  if (await forgetButton.isVisible()) await forgetButton.click();
  await expect(panel.getByText("No folder selected.")).toBeVisible();

  await panel.getByRole("button", { name: "Choose folder" }).click();
  await expect(panel.locator(".markdown-folder-name")).toHaveText("mablog-notes");
  await expect(panel.getByText("ready to save files")).toBeVisible();

  await page.reload();
  await expect(panel.locator(".markdown-folder-name")).toHaveText("mablog-notes");
  await expect(panel.getByRole("button", { name: "Change folder" })).toBeVisible();

  await panel.getByRole("button", { name: "Save AI-news instructions" }).click();
  await expect(panel.getByText("Saved ai-news-instructions.md at", { exact: false })).toBeVisible();
  const saved = await page.evaluate(
    /** Read the written file back from the test folder. */ async function readSaved() {
      const root = await navigator.storage.getDirectory();
      const folder = await root.getDirectoryHandle("mablog-notes");
      const file = await (await folder.getFileHandle("ai-news-instructions.md")).getFile();
      return file.text();
    },
  );
  expect(saved).toContain("# MAblog AI news: research and model-file instructions");
  expect(saved).toContain("## 6. Body template");

  await panel.getByRole("button", { name: "Forget folder" }).click();
  await expect(panel.getByText("No folder selected.")).toBeVisible();
  await page.reload();
  await expect(panel.getByText("No folder selected.")).toBeVisible();
});

test("profile explains when the browser cannot choose folders", /** Verify the unsupported-browser message when the picker API is absent. */ async function noPicker({
  page,
}) {
  await page.addInitScript(
    /** Simulate Firefox or Safari, which lack the directory picker. */ function removePicker() {
      delete (window as { showDirectoryPicker?: unknown }).showDirectoryPicker;
    },
  );
  await administratorLogin(page);
  await page.goto("/profile");
  const panel = page.getByRole("region", { name: "Markdown folder" });
  await expect(
    panel.getByText("This browser cannot choose folders.", { exact: false }),
  ).toBeVisible();
  await expect(panel.getByRole("button", { name: "Choose folder" })).toHaveCount(0);
});

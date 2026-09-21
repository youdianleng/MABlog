import { test, expect } from "@playwright/test";
import { emailCode } from "./helpers";

test("registration, actual email verification, freeform draft, approval, publishing, and sharing error", /** Exercise email verification, editing, session recovery, publication, and sharing feedback. */ async function authoring({
  page,
}) {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Collect browser runtime errors so the test cannot silently pass with a broken UI. */ function capture(
      error,
    ) {
      errors.push(error.message);
    },
  );
  const name = `writer_${Date.now()}`,
    email = `${name}@example.com`;
  await page.goto("/account");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Username", { exact: true }).fill(name);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page
    .getByLabel("Password (at least 10 characters)")
    .fill("my-local-test-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByLabel("Verification code")).toBeVisible();
  await page.getByLabel("Verification code").fill(await emailCode(page, email));
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to your atelier" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Write", exact: true }).click();
  await page.waitForURL("**/compose/**");
  const id = page.url().split("/").pop();
  const settings = page.locator(".editor-settings-menu");
  await expect(settings.locator(".editor-sidebar")).not.toBeVisible();
  expect(
    await page.locator(".editor-viewport").evaluate(
      /** Measure the usable canvas viewport after removing the permanent sidebar column. */ function viewportWidth(element) {
        return element.getBoundingClientRect().width;
      },
    ),
  ).toBeGreaterThan(900);
  const geometryBeforeZoom = await (await page.request.get(`/api/posts/${id}/draft`)).json();
  const zoomViewport = await page.locator(".editor-viewport").boundingBox();
  const canvasBeforeZoom = await page.locator(".editor-canvas").boundingBox();
  const zoomPointerX = zoomViewport!.x + zoomViewport!.width / 2;
  const zoomPointerY = zoomViewport!.y + zoomViewport!.height / 2;
  const documentXBeforeZoom = zoomPointerX - canvasBeforeZoom!.x;
  const documentYBeforeZoom = zoomPointerY - canvasBeforeZoom!.y;
  await page.mouse.move(zoomPointerX, zoomPointerY);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Control");
  await expect(page.getByText(/Canvas zoom · 110%/)).toBeVisible();
  const canvasAfterZoom = await page.locator(".editor-canvas").boundingBox();
  expect(canvasAfterZoom!.width).toBeCloseTo(canvasBeforeZoom!.width * 1.1, 0);
  expect((zoomPointerX - canvasAfterZoom!.x) / 1.1).toBeCloseTo(documentXBeforeZoom, 0);
  expect((zoomPointerY - canvasAfterZoom!.y) / 1.1).toBeCloseTo(documentYBeforeZoom, 0);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, 100);
  await page.keyboard.up("Control");
  await expect(page.getByText(/Canvas zoom · 100%/)).toBeVisible();
  const geometryAfterZoom = await (await page.request.get(`/api/posts/${id}/draft`)).json();
  expect(geometryAfterZoom.document.canvas).toEqual(geometryBeforeZoom.document.canvas);
  await settings.locator("summary").click();
  await expect(settings.locator(".editor-sidebar")).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Browser-written story");
  await page.getByLabel("Category", { exact: true }).selectOption("technology");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("Created with the real visual composer.");
  await page
    .getByLabel("Cover image", { exact: true })
    .setInputFiles("../backend/seed-assets/shrine.png");
  await expect(page.getByAltText("Cover preview")).toBeVisible();
  await page.getByRole("button", { name: "Add block", exact: true }).click();
  await page.locator(".tiptap").fill("A real block, written in the browser.");
  const headingMenu = page.getByRole("button", { name: "Heading level H1" });
  await expect(headingMenu).toBeVisible();
  await headingMenu.click();
  await expect(page.getByRole("menuitem")).toHaveCount(6);
  await page.getByRole("menuitem", { name: "H4", exact: true }).click();
  await expect(page.locator(".tiptap h4")).toHaveText("A real block, written in the browser.");
  await expect(page.getByRole("button", { name: "Heading level H4" })).toBeVisible();
  await page.locator('.editor-block.selected input[type="file"]').setInputFiles("../backend/seed-assets/shrine.png");
  const insertedImage = page.locator(".editor-block.selected .resizable-image-node img");
  await expect(insertedImage).toBeVisible();
  const imageBeforeResize = await insertedImage.boundingBox();
  const imageResizeHandle = page.getByRole("button", { name: /Resize image/ });
  await imageResizeHandle.scrollIntoViewIfNeeded();
  const imageHandleBox = await imageResizeHandle.boundingBox();
  await page.mouse.move(imageHandleBox!.x + imageHandleBox!.width / 2, imageHandleBox!.y + imageHandleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(imageHandleBox!.x - 70, imageHandleBox!.y + imageHandleBox!.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect.poll(/** Wait for the pointer-up transaction to serialize the committed width. */ async function committedDragWidth() {
    return Number(await insertedImage.getAttribute("width"));
  }).toBeGreaterThan(0);
  const draggedWidth = Number(await insertedImage.getAttribute("width"));
  expect(draggedWidth).toBeLessThan(imageBeforeResize!.width);
  await imageResizeHandle.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(/** Wait for TipTap to serialize the keyboard resize transaction. */ async function resizedWidth() {
    return Number(await insertedImage.getAttribute("width"));
  }).toBe(draggedWidth + 10);
  await page.getByLabel("Rotation °").fill("12");
  await page.getByRole("button", { name: "Draw block", exact: true }).click();
  const surface = await page.locator(".editor-canvas").boundingBox();
  await page.mouse.move(surface!.x + 560, surface!.y + 80);
  await page.mouse.down();
  await page.mouse.move(surface!.x + 690, surface!.y + 220, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(".editor-block")).toHaveCount(2);
  await page.locator(".tiptap").fill("Drawn and moved in the browser.");
  const blockX = page.getByLabel(/^X$/), blockY = page.getByLabel(/^Y$/);
  const originalX = Number(await blockX.inputValue());
  const originalY = Number(await blockY.inputValue());
  const handle = page.locator(".editor-block.selected .drag-handle");
  await handle.scrollIntoViewIfNeeded();
  const handleBox = await handle.boundingBox();
  await page.mouse.move(handleBox!.x + 25, handleBox!.y + 12);
  await page.mouse.down();
  await page.mouse.move(handleBox!.x - 65, handleBox!.y + 62, { steps: 8 });
  await page.mouse.up();
  await expect(blockX).toHaveValue(String(originalX - 90));
  await expect(blockY).toHaveValue(String(originalY + 50));
  const resize = page.locator('.editor-block.selected').locator('..').locator('div[style*="cursor: se-resize"]');
  const resizeBox = await resize.boundingBox();
  const oldWidth = Number(await page.getByLabel("Width", { exact: true }).last().inputValue());
  await page.mouse.move(resizeBox!.x + 3, resizeBox!.y + 3);
  await page.mouse.down();
  await page.mouse.move(resizeBox!.x + 63, resizeBox!.y + 43, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByLabel("Width", { exact: true }).last()).toHaveValue(String(oldWidth + 60));
  await page.getByRole("button", { name: "Bring forward", exact: true }).click();
  await page.getByRole("button", { name: "Remove block 2", exact: true }).click();
  await expect(page.locator(".editor-block")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".editor-block")).toHaveCount(2);
  await expect(page.getByText("Drawn and moved in the browser.", { exact: true })).toBeVisible();
  // Pressing the crop drag bar without moving the pointer must not reposition the canvas.
  await page.getByRole("button", { name: "Adjust canvas bounds", exact: true }).click();
  const canvasBeforePress = await page.locator(".editor-canvas").boundingBox();
  const cropBar = await page.locator(".crop-handle").boundingBox();
  await page.mouse.move(cropBar!.x + 30, cropBar!.y + cropBar!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  const canvasDuringPress = await page.locator(".editor-canvas").boundingBox();
  expect(Math.abs(canvasDuringPress!.x - canvasBeforePress!.x)).toBeLessThan(1);
  expect(Math.abs(canvasDuringPress!.y - canvasBeforePress!.y)).toBeLessThan(1);
  await page.mouse.up();
  const canvasXField = page.getByLabel("x", { exact: true });
  const canvasYField = page.getByLabel("y", { exact: true });
  const canvasXBeforeMove = Number(await canvasXField.inputValue());
  const canvasYBeforeMove = Number(await canvasYField.inputValue());
  await page.mouse.move(cropBar!.x + 30, cropBar!.y + cropBar!.height / 2);
  await page.mouse.down();
  await page.mouse.move(cropBar!.x + 65, cropBar!.y + cropBar!.height / 2 + 25, { steps: 6 });
  await page.mouse.up();
  const canvasAfterMove = await page.locator(".editor-canvas").boundingBox();
  expect(canvasAfterMove!.x).toBeCloseTo(canvasBeforePress!.x + 35, 0);
  expect(canvasAfterMove!.y).toBeCloseTo(canvasBeforePress!.y + 25, 0);
  expect(Number(await canvasXField.inputValue())).toBeCloseTo(canvasXBeforeMove + 35, 3);
  expect(Number(await canvasYField.inputValue())).toBeCloseTo(canvasYBeforeMove + 25, 3);
  await page.getByRole("button", { name: "Adjust canvas bounds", exact: true }).click();
  // Resize the page directly from its corner without entering crop-move mode.
  const canvasWidth = page.getByLabel("Width", { exact: true }).first();
  const canvasHeight = page.getByLabel("Height", { exact: true }).first();
  const oldCanvasWidth = Number(await canvasWidth.inputValue());
  const oldCanvasHeight = Number(await canvasHeight.inputValue());
  const canvasCorner = page.locator(".canvas-resize-nw");
  const canvasCornerBox = await canvasCorner.boundingBox();
  const cornerX = canvasCornerBox!.x + canvasCornerBox!.width / 2;
  const cornerY = canvasCornerBox!.y + canvasCornerBox!.height / 2;
  await page.mouse.move(cornerX, cornerY);
  await page.mouse.down();
  await page.mouse.move(cornerX - 80, cornerY - 60, { steps: 8 });
  await page.mouse.up();
  await expect(canvasWidth).toHaveValue(String(oldCanvasWidth + 80));
  await expect(canvasHeight).toHaveValue(String(oldCanvasHeight + 60));
  // Crop and expand without deleting either block, then restore the initial reader viewport.
  await canvasWidth.fill("300");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Private draft saved.")).toBeVisible();
  const cropped = await (await page.request.get(`/api/posts/${id}/draft`)).json();
  expect(cropped.document.blocks).toHaveLength(2);
  expect(cropped.document.canvas.width).toBe(300);
  await canvasWidth.fill("1200");
  await canvasHeight.fill("900");
  // Select the original block before checking session recovery of its text.
  await page.locator(".layer-item").getByText("Block 1", { exact: false }).click();
  // Simulate session loss while preserving the open editor's unsaved input.
  await page.request.post("/api/auth/logout", { headers: { "X-MAblog": "1" } });
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Email or username").fill(name);
  await dialog
    .getByLabel("Password (at least 10 characters)")
    .fill("my-local-test-password");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".tiptap")).toContainText(
    "A real block, written in the browser.",
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Private draft saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Browser-written story",
  );
  await page
    .getByRole("button", { name: "Apply my changes", exact: true })
    .click();
  await expect(page.getByText("Changes submitted successfully.")).toBeVisible();
  await page.getByRole("link", { name: "Read approved version" }).click();
  await expect(
    page.getByRole("heading", { name: "Browser-written story", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("A real block, written in the browser."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Make personal", exact: true }),
  ).toBeVisible();
  await page.goto("/public");
  const categories = page.getByRole("navigation", { name: "Post categories" });
  const publishedCard = page.locator(".post-card").filter({ has: page.locator(`a[href="/posts/${id}"]`) });
  await categories.getByRole("button", { name: "Technology", exact: true }).click();
  await expect(publishedCard).toHaveCount(1);
  await categories.getByRole("button", { name: "Travel", exact: true }).click();
  await expect(publishedCard).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Language").selectOption("es");
  await expect(page.getByRole("navigation", { name: "Categorías de publicaciones" }).getByRole("button", { name: "Viajes", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(/** Verify the vertical menu fits a phone viewport. */ function categoryFits() { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
  await page.getByLabel("Idioma").selectOption("en");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`/posts/${id}`);
  await page.getByRole("link", { name: "Sharing", exact: true }).click();
  await page.getByLabel("Registered email").fill("not-registered@example.com");
  await page.getByRole("button", { name: "Grant access", exact: true }).click();
  await expect(page.locator(".toast[role=alert]")).toContainText(
    "Email not found",
  );
  expect(errors).toEqual([]);
  // Remove this test-created post explicitly so browser checks do not pollute the sample collection.
  await page.request.delete(`/api/posts/${id}`, {
    headers: { "X-MAblog": "1" },
  });
});


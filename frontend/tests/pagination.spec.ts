import { expect, test } from "@playwright/test";

test("public collection appends three posts near the scroll boundary", /** Verify true network pagination, visible progress, and stable existing cards. */ async function lazyCollection({ page }) {
  await page.route(
    "**/api/posts?*",
    /** Keep the second page pending briefly so loading feedback can be observed reliably. */
    async function delaySecondPage(route) {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.searchParams.get("offset") === "3") {
        await new Promise<void>(
          /** Resolve the controlled test delay without changing application timing. */
          function finishDelay(resolve) {
            setTimeout(resolve, 450);
          },
        );
      }
      await route.continue();
    },
  );
  await page.goto("/public");
  const cards = page.locator(".post-card");
  await expect(cards).toHaveCount(3);
  const firstTitle = await cards.first().getByRole("heading").innerText();
  await page.locator(".post-feed-sentinel").scrollIntoViewIfNeeded();
  await expect(page.locator('[role="status"]')).toHaveText("Loading more posts…");
  await expect(cards).toHaveCount(6);
  await expect(cards.first().getByRole("heading")).toHaveText(firstTitle);
});

test("lazy collection remains bounded on a phone", /** Ensure incremental cards and their loading boundary do not create horizontal overflow. */ async function lazyCollectionPhone({ page }) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/public");
  await expect(page.locator(".post-card")).toHaveCount(3);
  expect(
    await page.evaluate(
      /** Compare the document and phone viewport widths before more posts are appended. */ function fitsViewport() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
});

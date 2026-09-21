import { expect, test } from "@playwright/test";

test("public collection navigates through fifteen-post pages", /** Verify bounded cards, URL state, and accessible previous/current/next controls. */ async function paginatedCollection({ page }) {
  await page.goto("/public");
  const cards = page.locator(".post-card");
  await expect(cards).toHaveCount(15);
  const firstTitle = await cards.first().getByRole("heading").innerText();
  const pagination = page.getByRole("navigation", { name: "Post pages" });
  await expect(pagination.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  await expect(pagination.getByRole("button", { name: "Previous" })).toBeDisabled();
  await page.evaluate(
    /** Record the URL active whenever application code scrolls the collection into view. */
    function traceCollectionScroll() {
      const nativeScrollIntoView = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = /** Preserve native scrolling while recording its route timing. */ function recordedScrollIntoView(options) {
        document.documentElement.dataset.collectionScrollUrl = window.location.href;
        nativeScrollIntoView.call(this, options);
      };
    },
  );
  await pagination.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/public\?page=2$/);
  await expect(cards).toHaveCount(1);
  await expect(cards.first().getByRole("heading")).not.toHaveText(firstTitle);
  await expect(page.getByRole("heading", { name: "Stories worth wandering into" })).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-collection-scroll-url", /\/public\?page=2$/);
  await expect(pagination.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  await expect(pagination.getByRole("button", { name: "Next" })).toBeDisabled();
  await pagination.getByRole("button", { name: "Previous" }).click();
  await expect(page).toHaveURL(/\/public$/);
  await expect(cards).toHaveCount(15);
});

test("Discover navigates through fifteen-post pages", /** Apply the same bounded navigation while preserving Discover card reveals. */ async function paginatedDiscover({ page }) {
  await page.goto("/");
  const cards = page.locator(".post-card");
  const pagination = page.getByRole("navigation", { name: "Post pages" });
  await expect(cards).toHaveCount(15);
  await pagination.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/?page=2$/);
  await expect(cards).toHaveCount(1);
  await expect(page.locator(".post-card-reveal")).toHaveCount(1);
  await expect(pagination.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
});

test("paginated collection remains bounded on a phone", /** Ensure fifteen cards and their navigation do not create horizontal overflow. */ async function paginatedCollectionPhone({ page }) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/public");
  await expect(page.locator(".post-card")).toHaveCount(15);
  await expect(page.getByRole("navigation", { name: "Post pages" })).toBeVisible();
  expect(
    await page.evaluate(
      /** Compare the complete paginated document width with the phone viewport. */ function fitsViewport() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
});

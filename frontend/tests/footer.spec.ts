import { expect, test } from "@playwright/test";

test("footer links reach complete public information pages", /** Verify the adapted footer has no placeholder destinations and keeps a valid heading structure. */ async function footerLinks({
  page,
  request,
}) {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("heading", { name: "Find a story worth carrying with you." })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Enter the collection" })).toHaveAttribute("href", "/public");

  const pages = [
    ["/about", "Stories deserve a thoughtful home."],
    ["/help", "From first line to shared story."],
    ["/guidelines", "Make room for brave work—and for one another."],
    ["/privacy", "Your drafts are not a public promise."],
    ["/terms", "Clear roles make better collaborations."],
  ] as const;
  for (const [path, title] of pages) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  }
});

test("footer reflows without horizontal overflow", /** Protect the dense desktop footer hierarchy at a small phone viewport. */ async function footerMobile({ page }) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(page.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();
  expect(
    await page.evaluate(
      /** Compare the document width with the viewport after the footer is painted. */ function fitsViewport() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
});

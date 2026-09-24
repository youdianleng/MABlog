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
    ["/about", "A home for stories that refuse to stay ordinary."],
    ["/help", "From first line to shared story."],
    ["/ai-models", "Five models. Four crafts. No invented score."],
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

test("AI Models page presents evidence-based responsive rankings", /** Verify ranking counts, category navigation, evidence context, profile links, and phone containment. */ async function aiModelsPage({ page }) {
  await page.goto("/ai-models");
  await expect(page.getByRole("heading", { level: 1, name: "Five models. Four crafts. No invented score." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Ranking categories" })).toBeVisible();
  await expect(page.locator(".models-ranking-section")).toHaveCount(5);
  await expect(page.locator(".models-rank-card")).toHaveCount(25);
  await expect(page.locator(".models-awards-grid a")).toHaveCount(7);
  await expect(page.getByText("Coding Agent Index v1.5", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "A ranking is a dated decision aid—not a permanent verdict." })).toBeVisible();
  await expect(page.locator('.models-rank-card[href="/ai-models/claude-fable-5-1"]')).toHaveCount(1);
  await expect(page.getByRole("link", { name: "AI Models", exact: true }).first()).toHaveAttribute("href", "/ai-models");
  await expect(page.getByRole("heading", { name: "Find a story worth carrying with you." })).not.toBeVisible();

  await page.setViewportSize({ width: 1900, height: 900 });
  await page.reload();
  expect(
    await page.evaluate(
      /** Ensure short and wrapped labels reserve the same provider and score positions in every desktop ranking row. */ function rankingCardRowsAlign() {
        for (const grid of document.querySelectorAll(".models-card-grid")) {
          let firstOffsets: number[] | undefined;
          for (const card of grid.querySelectorAll(".models-rank-card")) {
            const body = card.querySelector(".models-rank-card-body");
            const provider = card.querySelector(".models-provider");
            const score = card.querySelector(".models-score");
            if (!body || !provider || !score) return false;
            const bodyTop = body.getBoundingClientRect().top;
            const offsets = [provider, score].map(
              /** Round subpixel font rendering so only visible row shifts fail the assertion. */ (element) => Math.round(element.getBoundingClientRect().top - bodyTop),
            );
            if (firstOffsets && (offsets[0] !== firstOffsets[0] || offsets[1] !== firstOffsets[1])) return false;
            firstOffsets = offsets;
          }
        }
        return true;
      },
    ),
  ).toBe(true);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.locator(".models-rank-card").first()).toBeVisible();
  expect(
    await page.evaluate(
      /** Confirm ranking cards, editorial awards, and bilingual labels stay inside a phone viewport. */ function aiModelsFitsPhone() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);

  await page.setViewportSize({ width: 812, height: 375 });
  expect(
    await page.evaluate(
      /** Confirm the ranking remains bounded when a small device rotates to landscape. */ function aiModelsFitsLandscape() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
});

test("AI model profile preserves access and evidence links", /** Verify a permanent family profile aggregates scores and exposes official and benchmark sources. */ async function aiModelProfile({ page }) {
  await page.goto("/ai-models/mureka-v9");
  await expect(page.getByRole("heading", { level: 1, name: "Mureka V9" })).toBeVisible();
  await expect(page.locator(".model-score-grid article")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Full analysis coming next." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Official access/ })).toHaveAttribute("href", "https://www.mureka.ai/");
  await expect(page.getByRole("link", { name: /Artificial Analysis Music Arena/ })).toHaveCount(2);
});

test("About page presents MAblog's complete story", /** Verify the dedicated mission page, truthful principles, actions, and responsive composition. */ async function aboutPage({ page }) {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "A home for stories that refuse to stay ordinary." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Inside MAblog" })).toBeVisible();
  await expect(page.locator(".about-content-card")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "AI news, checked against the source." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Technology through a human lens." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Readers' hobbies, turned into stories." })).toBeVisible();
  await expect(page.locator(".about-principle-list article")).toHaveCount(3);
  await expect(page.locator(".about-journey li")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Open my atelier" })).toHaveAttribute("href", "/workspace");
  await expect(page.getByRole("heading", { name: "Find a story worth carrying with you." })).not.toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.locator(".about-content-card").first()).toBeVisible();
  expect(
    await page.evaluate(
      /** Confirm the complete editorial composition stays within a phone viewport. */ function aboutFitsPhone() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
});

test("Help center presents streamlined support paths", /** Verify the dedicated help composition, useful destinations, removed guide grid, and narrow-screen containment. */ async function helpPage({ page }) {
  await page.goto("/help");
  await expect(page.getByRole("heading", { level: 1, name: "From first line to shared story." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Four paths cover most questions." })).not.toBeVisible();
  await expect(page.getByRole("navigation", { name: "Help topics" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open my atelier" })).toHaveAttribute("href", "/workspace");
  await expect(page.getByRole("link", { name: "Search help" })).toHaveAttribute("href", "/search");
  await expect(page.getByRole("heading", { name: "Find a story worth carrying with you." })).not.toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.locator(".help-workflow-panel")).toBeVisible();
  expect(
    await page.evaluate(
      /** Confirm the help frame and topic strip never widen the phone document. */ function helpFitsPhone() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
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

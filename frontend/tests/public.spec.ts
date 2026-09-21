import { test, expect } from "@playwright/test";

test("anonymous homepage, language switch, and narrow-screen layout", /** Exercise public reading, persistent language selection, and phone-width layout. */ async function home({
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
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Every story opens another world." }),
  ).toBeVisible();
  await page.getByLabel("Language").selectOption("es");
  await expect(
    page.getByRole("heading", { name: "Cada historia abre otro mundo." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Cada historia abre otro mundo." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      /** Check that the page does not overflow the mobile viewport horizontally. */ function fits() {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("navbar routes keep the shared shell anchored", /** Prevent scrollbar and active-border changes from moving shared content during navigation. */ async function stableNavigation({ page }) {
  await page.setViewportSize({ width: 1280, height: 720 });
  const measurements: { brandLeft: number; pageLeft: number; navTop: number }[] = [];
  for (const path of ["/", "/public", "/workspace"]) {
    await page.goto(path);
    measurements.push(await page.locator(".shell").evaluate(
      /** Measure stable shell anchors after each top-level route renders. */ function measureShell() {
        const brand = document.querySelector(".brand")!.getBoundingClientRect();
        const content = document.querySelector(".page")!.getBoundingClientRect();
        const firstNavItem = document.querySelector(".nav a")!.getBoundingClientRect();
        return { brandLeft: brand.left, pageLeft: content.left, navTop: firstNavItem.top };
      },
    ));
  }
  for (const key of ["brandLeft", "pageLeft", "navTop"] as const) {
    const values = measurements.map(
      /** Read one coordinate across every navigation destination. */ function coordinate(item) { return item[key]; },
    );
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(0.5);
  }
});

test("default local administrator signs in without email verification", /** Verify the Compose bootstrap account reaches the workspace using only its password. */ async function localAdmin({ page }) {
  await page.goto("/account");
  await page.getByLabel("Email or username").fill("mablog_admin");
  await page.getByLabel("Password (at least 10 characters)").fill("mablog-admin-local-2026");
  const login = page.waitForResponse(/** Match the password login request without accepting a verification flow. */ function loginResponse(response) { return response.url().endsWith("/api/auth/login"); });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect(await (await login).json()).toEqual({ ok: true });
  await expect(page.getByRole("heading", { name: "Welcome to your atelier" })).toBeVisible();
  await expect(page.getByLabel("Verification code")).not.toBeVisible();
  await page.goto("/public");
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Welcome to your atelier" })).toBeVisible();
  await expect(page.getByLabel("Email or username")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Open my workspace" })).toHaveAttribute("href", "/workspace");
});

test("liking a story updates in place without refreshing the reader", /** Prevent the Discover shell from flashing while the like count is reconciled. */ async function stableLike({ page }) {
  await page.goto("/account");
  await page.getByLabel("Email or username").fill("mablog_admin");
  await page.getByLabel("Password (at least 10 characters)").fill("mablog-admin-local-2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome to your atelier" })).toBeVisible();
  await page.goto("/public");
  await page.locator(".post-card:not(:has(.ai-card-label)) .cover").first().click();
  const composition = page.locator(".composition");
  await expect(composition).toBeVisible();
  const originalComposition = await composition.elementHandle();
  const likeButton = page.locator(".reader-like-button");
  const initiallyLiked = await likeButton.getAttribute("aria-pressed") === "true";
  const initialCount = Number((await likeButton.textContent())?.trim());
  let readerRefreshes = 0;
  const postApiPath = `/api/posts/${new URL(page.url()).pathname.split("/").pop()}`;
  page.on("request", /** Count post-detail GET requests made after the initial reader has loaded. */ function countReaderRefresh(request) {
    if (request.method() === "GET" && new URL(request.url()).pathname === postApiPath) readerRefreshes += 1;
  });
  const toggle = page.waitForResponse(/** Match the like mutation rather than a reader-data refresh. */ function likeResponse(response) {
    return response.request().method() === "POST" && response.url().endsWith("/like");
  });
  await likeButton.click();
  await toggle;
  await expect(likeButton).toHaveAttribute("aria-pressed", String(!initiallyLiked));
  await expect(likeButton).toContainText(String(initialCount + (initiallyLiked ? -1 : 1)));
  expect(await originalComposition!.evaluate(/** Confirm React kept the original reader composition mounted. */ function remainsMounted(element) { return element.isConnected; })).toBe(true);
  expect(readerRefreshes).toBe(0);
  await likeButton.click();
  await expect(likeButton).toHaveAttribute("aria-pressed", String(initiallyLiked));
  await expect(likeButton).toContainText(String(initialCount));
});

test("collection cards constrain uploaded avatars and align text rows", /** Prevent cover-image rules or variable copy from breaking the card grid. */ async function cardLayout({ page }) {
  await page.setViewportSize({ width: 1700, height: 900 });
  await page.goto("/public");
  const cards = page.locator(".post-card");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  await cards.locator(".avatar").first().evaluate(/** Exercise the uploaded-image variant even when sample profiles use initials. */ function ensureImage(element) {
    if (element instanceof HTMLImageElement) return;
    const image = document.createElement("img");
    image.className = "avatar";
    image.alt = "";
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='180'%3E%3Crect width='400' height='180' fill='%23993c3d'/%3E%3C/svg%3E";
    element.replaceWith(image);
  });
  const uploadedAvatar = cards.locator("img.avatar").first();
  await expect(uploadedAvatar).toBeVisible();
  const avatarBox = await uploadedAvatar.boundingBox();
  expect(Math.round(avatarBox!.width)).toBe(32);
  expect(Math.round(avatarBox!.height)).toBe(32);
  const rows = await cards.evaluateAll(/** Measure the first visual row after fonts and images have rendered. */ function aligned(items) {
    return items.slice(0, 3).map(/** Record title, summary, and footer positions for one card. */ function cardRows(item) {
      const title = item.querySelector(".post-title")!.getBoundingClientRect();
      const summary = item.querySelector(".post-summary")!.getBoundingClientRect();
      const footer = item.querySelector(".post-footer")!.getBoundingClientRect();
      return [title.top, summary.top, footer.top];
    });
  });
  for (let column = 0; column < 3; column += 1) {
    const positions = rows.map(/** Select one measured row from every card. */ function row(values) { return values[column]; });
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(2);
  }
});

test("five-card carousel advances, pauses, navigates, and respects reduced motion", /** Verify carousel autoplay, explicit pause, navigation, and reduced-motion behavior. */ async function featured({
  page,
}) {
  await page.goto("/");
  const celestialBackground = page.locator(".home-celestial-background");
  await expect(celestialBackground).toBeVisible();
  const celestialLayers = await page.locator(".character-showcase").evaluate(
    /** Confirm the full-bleed dark scene stacks rings, characters, and carousel in the approved order. */ function readCelestialLayers(showcase) {
      const background = showcase.querySelector(".home-celestial-background");
      const characters = showcase.querySelector(".home-character-cycle");
      const carousel = showcase.querySelector(".carousel");
      const bounds = showcase.getBoundingClientRect();
      return {
        backgroundImage: getComputedStyle(showcase).backgroundImage,
        backgroundLayer: Number(getComputedStyle(background!).zIndex),
        characterLayer: Number(getComputedStyle(characters!).zIndex),
        carouselLayer: Number(getComputedStyle(carousel!).zIndex),
        width: bounds.width,
      };
    },
  );
  expect(celestialLayers.backgroundImage).toContain("linear-gradient");
  expect(celestialLayers.backgroundLayer).toBeLessThan(celestialLayers.characterLayer);
  expect(celestialLayers.characterLayer).toBeLessThan(celestialLayers.carouselLayer);
  expect(celestialLayers.width).toBeGreaterThanOrEqual(1279);
  const characterCycle = page.locator(".home-character-cycle");
  await expect(characterCycle).toHaveAttribute("data-left-character", "catgirl");
  await expect(characterCycle).toHaveAttribute("data-right-character", "robot");
  const initialCharacterHeights = await characterCycle.locator(".home-character-image.active").evaluateAll(
    /** Measure the two visible layers so differing source ratios cannot change their displayed height. */ function measureCharacters(characters) {
      return characters.map(
        /** Read one active character's rendered height. */ function characterHeight(character) {
          return character.getBoundingClientRect().height;
        },
      );
    },
  );
  expect(initialCharacterHeights).toHaveLength(2);
  expect(Math.abs(initialCharacterHeights[0] - initialCharacterHeights[1])).toBeLessThan(1);
  const initialCharacterProximity = await characterCycle.evaluate(
    /** Measure both carousel-facing image edges to prevent narrow artwork from sitting farther away. */ function measureCharacterProximity(cycle) {
      const left = cycle.querySelector(".home-character-slot-left .home-character-image.active")!.getBoundingClientRect();
      const right = cycle.querySelector(".home-character-slot-right .home-character-image.active")!.getBoundingClientRect();
      const center = cycle.getBoundingClientRect().left + cycle.getBoundingClientRect().width / 2;
      return { leftGap: center - left.right, rightGap: right.left - center };
    },
  );
  expect(Math.abs(initialCharacterProximity.leftGap - initialCharacterProximity.rightGap)).toBeLessThan(1);
  await expect.poll(
    /** Read the pair attributes while waiting for the approved second rotation step. */ async function currentCharacterPair() {
      return `${await characterCycle.getAttribute("data-left-character")}:${await characterCycle.getAttribute("data-right-character")}`;
    },
    { timeout: 5000 },
  ).toBe("robot:reader");
  await expect(page.locator(".carousel-card")).toHaveCount(5);
  const first = await page
    .locator(".carousel-card[aria-current=true]")
    .getAttribute("href");
  await expect
    .poll(
      /** Read the active carousel destination while waiting for automatic advancement. */ async function activeCard() {
        return page
          .locator(".carousel-card[aria-current=true]")
          .getAttribute("href");
      },
      { timeout: 8000 },
    )
    .not.toBe(first);
  await page
    .getByRole("button", { name: "Pause carousel", exact: true })
    .click();
  const paused = await page
    .locator(".carousel-card[aria-current=true]")
    .getAttribute("href");
  await page.waitForTimeout(5500);
  await expect(
    page.locator(".carousel-card[aria-current=true]"),
  ).toHaveAttribute("href", paused!);
  await page.getByRole("button", { name: "Next story", exact: true }).click();
  await expect(
    page.locator(".carousel-card[aria-current=true]"),
  ).not.toHaveAttribute("href", paused!);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(characterCycle).toHaveAttribute("data-left-character", "catgirl");
  await expect(characterCycle).toHaveAttribute("data-right-character", "robot");
  const reduced = await page
    .locator(".carousel-card[aria-current=true]")
    .getAttribute("href");
  await page.waitForTimeout(5500);
  await expect(characterCycle).toHaveAttribute("data-left-character", "catgirl");
  await expect(characterCycle).toHaveAttribute("data-right-character", "robot");
  await expect(
    page.locator(".carousel-card[aria-current=true]"),
  ).toHaveAttribute("href", reduced!);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(
    /** Ensure the full-bleed celestial scene does not create phone-width horizontal overflow. */ function celestialFitsPhone() {
      return document.documentElement.scrollWidth <= innerWidth;
    },
  )).toBe(true);
  await page.locator(".carousel-card[aria-current=true]").click();
  await expect(page).toHaveURL(new RegExp(reduced!));
  await expect(page.locator(".composition")).toBeVisible();
});


test("public content is server rendered and unknown routes return 404", /** Verify App Router HTML and route boundaries without relying on hydration. */ async function routeDocuments({ request }) {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  expect(await home.text()).toContain("Where the mountains remember");
  const missing = await request.get("/path-that-does-not-exist");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("Story path not found");
});

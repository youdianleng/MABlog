import { expect, type Page } from "@playwright/test";

/** Sign a seeded account in through the real UI, verifying its email when required. */
export async function demoLogin(page: Page, username: string) {
  await page.goto("http://localhost:3000/account");
  await page.getByLabel("Email or username").fill(username);
  await page.getByLabel("Password (at least 10 characters)").fill("mablog-local-2026");
  const response = page.waitForResponse(/** Match the login request triggered by this form. */ function loginResponse(response) { return response.url().endsWith("/api/auth/login"); });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  if ((await (await response).json()).verification_required) {
    await page.getByLabel("Verification code").fill(await emailCode(page, `${username}@example.com`));
    await page.getByRole("button", { name: "Verify email", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Welcome to your atelier" })).toBeVisible();
}

/** Sign in through the long-lived local administrator account without email verification. */
export async function administratorLogin(page: Page) {
  await page.goto("/account");
  await page.getByLabel("Email or username").fill("mablog_admin");
  await page.getByLabel("Password (at least 10 characters)").fill("mablog-admin-local-2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome to your atelier" })).toBeVisible();
}

/** Find a newly delivered verification code in the real local Mailpit inbox. */
export async function emailCode(page: Page, address: string) {
  let code = "";
  await expect
    .poll(
      /** Poll the local inbox for the test account's actual verification message. */ async function findDelivery() {
        const response = await page.request.get(
          "http://localhost:8025/api/v1/messages",
        );
        const messages = (await response.json()).messages || [];
        const message = messages.find(
          /** Find the verification message addressed to this test account. */ function recipient(item: {
            To: { Address: string }[];
          }) {
            return item.To.some(
              /** Match a Mailpit recipient to the test account email. */ function matches(
                to,
              ) {
                return to.Address === address;
              },
            );
          },
        );
        if (!message) return "";
        const detail = await (
          await page.request.get(
            `http://localhost:8025/api/v1/message/${message.ID}`,
          )
        ).json();
        code = detail.Text.match(/\b\d{6}\b/)?.[0] || "";
        return code;
      },
    )
    .toMatch(/^\d{6}$/);
  return code;
}

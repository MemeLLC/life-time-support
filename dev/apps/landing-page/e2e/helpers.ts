import type { Page } from "@playwright/test";

const TURNSTILE_SCRIPT_URL = "**/turnstile/v0/api.js*";

/**
 * Intercept the Turnstile script and inject a mock that immediately succeeds.
 *
 * The mock also sets `window.__turnstileRendered` when `render()` is called.
 * Because `render()` is invoked from a React `useEffect`, the flag signals
 * that the Astro island has finished hydrating and the form is interactive.
 */
export async function mockTurnstile(page: Page) {
  await page.route(TURNSTILE_SCRIPT_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        window.turnstile = {
          render(container, options) {
            window.__turnstileRendered = true;
            if (options.callback) options.callback("mock-token");
            return "mock-widget-id";
          },
          remove() {},
          reset() {},
          getResponse() { return "mock-token"; },
          isExpired() { return false; },
        };
        if (window.onTurnstileLoad) window.onTurnstileLoad();
      `,
    }),
  );
}

/** Wait for the React island to hydrate (Turnstile useEffect has fired). */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as Record<string, unknown>).__turnstileRendered === true,
    {
      timeout: 10_000,
    },
  );
}

/** Contact data used to seed sessionStorage for the details page. */
export const CONTACT_DATA = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "test@example.com",
  subject: "資料請求",
};

/** Seed sessionStorage with contact data before page scripts run. */
export async function seedContactData(page: Page, data: Record<string, string> = CONTACT_DATA) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value);
    },
    { key: "contactFormData", value: JSON.stringify(data) },
  );
}

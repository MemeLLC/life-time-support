import { test, expect } from "@playwright/test";
import { mockTurnstile, waitForHydration } from "./helpers";

/**
 * Fill the contact form with valid data.
 *
 * react-hook-form `mode:"onTouched"` only triggers the resolver on blur.
 * The Radix Select calls `field.onChange` but never `field.onBlur`, so the
 * subject field is never "touched" and no re-validation fires after it is set.
 *
 * To work around this we select the subject BEFORE filling the last text
 * field. When that field blurs the resolver re-runs with all five fields
 * populated and `isValid` flips to `true`.
 */
async function fillValidForm(page: import("@playwright/test").Page) {
  const name = page.getByLabel("お名前");
  await name.fill("山田 太郎");
  await name.blur();

  const kana = page.getByLabel("ふりがな");
  await kana.fill("やまだ たろう");
  await kana.blur();

  const phone = page.getByLabel("電話番号");
  await phone.fill("090-1234-5678");
  await phone.blur();

  // Select subject BEFORE the last text field so that when email blurs
  // the resolver re-validates all fields (including the now-set subject).
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "資料請求" }).click();

  const email = page.getByLabel("メールアドレス");
  await email.fill("test@example.com");
  await email.blur();
}

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test("renders all fields and submit button", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByRole("heading", { name: "お問い合わせ" })).toBeVisible();
    await expect(page.getByLabel("お名前")).toBeVisible();
    await expect(page.getByLabel("ふりがな")).toBeVisible();
    await expect(page.getByLabel("電話番号")).toBeVisible();
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByRole("button", { name: "送信する" })).toBeVisible();
  });

  test("submits valid form and navigates to /contact/details", async ({ page }) => {
    const apiRequest = page.waitForRequest("**/api/contact*");
    await page.route("**/api/contact*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.goto("/contact");
    await waitForHydration(page);

    await fillValidForm(page);

    const submitButton = page.getByRole("button", { name: "送信する" });
    await expect(submitButton).toBeEnabled({ timeout: 5_000 });
    await submitButton.click();

    const request = await apiRequest;
    expect(request.method()).toBe("POST");

    await expect(page).toHaveURL(/\/contact\/details/);
  });
});

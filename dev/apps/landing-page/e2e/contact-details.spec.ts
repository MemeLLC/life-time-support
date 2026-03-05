import { test, expect } from "@playwright/test";
import { mockTurnstile, waitForHydration, seedContactData, CONTACT_DATA } from "./helpers";

test.describe("Contact details form", () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test("shows fallback when no contact data in sessionStorage", async ({ page }) => {
    await page.goto("/contact/details");

    // No Turnstile rendered in fallback, so wait for text directly.
    await expect(page.getByText("お問い合わせ情報が見つかりません")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("お問い合わせフォームへ")).toBeVisible();
  });

  test("renders form fields with seeded contact data", async ({ page }) => {
    await seedContactData(page);
    await page.goto("/contact/details");
    await waitForHydration(page);

    await expect(
      page.getByText(`${CONTACT_DATA.name}様、お問い合わせありがとうございます`),
    ).toBeVisible();

    // Common fields always visible
    await expect(page.getByText("施工先物件")).toBeVisible();
    await expect(page.getByText("施工先マンション名")).toBeVisible();
    await expect(page.getByText("入居予定時期（年）")).toBeVisible();
    await expect(page.getByText("入居予定時期（月）")).toBeVisible();
    await expect(page.getByText("内覧会時期（年）")).toBeVisible();
    await expect(page.getByText("内覧会時期（月）")).toBeVisible();
    await expect(page.getByText("鍵引き渡し日")).toBeVisible();
    await expect(page.getByText("間取り図")).toBeVisible();
    await expect(page.getByText("ご紹介者名")).toBeVisible();
    await expect(page.getByText("紹介コード")).toBeVisible();
    await expect(page.getByRole("button", { name: "送信する" })).toBeVisible();

    // 資料請求-specific: considering checkboxes
    await expect(page.getByText("検討中の内容（複数選択可）")).toBeVisible();
  });

  test("submits form and navigates to /thanks", async ({ page }) => {
    await seedContactData(page);

    const apiRequest = page.waitForRequest("**/api/contact/details*");
    await page.route("**/api/contact/details*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );

    await page.goto("/contact/details");
    await waitForHydration(page);

    await expect(
      page.getByRole("heading", { name: "お問い合わせありがとうございます" }),
    ).toBeVisible();

    // Fill at least one field so the submit button becomes enabled.
    await page.getByLabel("施工先マンション名").fill("テストマンション");

    const submitButton = page.getByRole("button", { name: "送信する" });
    await expect(submitButton).toBeEnabled({ timeout: 5_000 });
    await submitButton.click();

    const request = await apiRequest;
    expect(request.method()).toBe("POST");

    await page.waitForURL("**/thanks");
  });
});

import { describe, it, expect, vi } from "vitest";
import type { Contact } from "@life-time-support/types/contact";

// Only mock the external Cloudflare Turnstile API call
vi.mock("../lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue({ success: true, hostname: "localhost" }),
}));

// Real app with all middleware (CORS, Turnstile, Resend init)
const { default: app } = await import("../index");

const env = {
  RESEND_API_KEY: "re_test_key",
  EMAIL_ADMIN: "admin@test.com",
  EMAIL_NOTIFICATION: "notifications@test.com",
  EMAIL_NOREPLY: "noreply@test.com",
  TURNSTILE_SECRET_KEY: "test-secret",
  ENVIRONMENT: "development", // → dryRun enabled
};

const validBody: Contact = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "09012345678",
  email: "taro@example.com",
  subject: "資料請求",
};

function post(body: unknown, opts?: { headers?: Record<string, string>; query?: string }) {
  return app.request(
    `/api/contact${opts?.query ?? ""}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cf-turnstile-response": "test-token",
        ...opts?.headers,
      },
      body: JSON.stringify(body),
    },
    env,
  );
}

describe("POST /api/contact (integration)", () => {
  it("returns 200 with dry-run id for valid contact data", async () => {
    const res = await post(validBody);

    expect(res.status).toBe(200);
    const json: { id: string } = await res.json();
    expect(json.id).toMatch(/^dry-run-\d+$/);
  });

  it("processes source query parameter through the full pipeline", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    const res = await post(validBody, { query: "?source=landing-page" });

    expect(res.status).toBe(200);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("DRY RUN"),
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: expect.arrayContaining([{ name: "source", value: "landing-page" }]),
      }),
    );

    consoleSpy.mockRestore();
  });

  it("returns 422 when required fields are missing", async () => {
    const res = await post({ name: "テスト" });

    expect(res.status).toBe(422);
    const json: { title: string } = await res.json();
    expect(json.title).toBe("Validation Failed");
  });

  it("returns 422 for invalid phone number", async () => {
    const res = await post({ ...validBody, phone: "invalid" });

    expect(res.status).toBe(422);
    const json: { title: string } = await res.json();
    expect(json.title).toBe("Validation Failed");
  });

  it("returns 400 for malformed JSON body", async () => {
    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "test-token",
        },
        body: "not json",
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it("returns 403 when Turnstile token is missing", async () => {
    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      },
      env,
    );

    expect(res.status).toBe(403);
    const json: { detail: string } = await res.json();
    expect(json.detail).toBe("Missing Turnstile token");
  });
});

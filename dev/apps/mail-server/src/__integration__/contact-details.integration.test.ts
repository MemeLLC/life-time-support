import { describe, it, expect, vi } from "vitest";
import type { Contact } from "@life-time-support/types/contact";
import type { ContactDetails } from "@life-time-support/types/contact-details";

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

const validContact: Contact = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "09012345678",
  email: "taro@example.com",
  subject: "資料請求",
};

const validDetails: ContactDetails = {
  propertyType: "新築マンション",
  condoName: "パークタワー東京",
  considering: ["フロアコーティング", "エコカラット"],
  message: "詳細を教えてください。",
};

/** PNG magic bytes */
const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function post(
  contact: unknown,
  details: unknown,
  opts?: { floorPlan?: File; omitContact?: boolean; omitDetails?: boolean },
) {
  const formData = new FormData();
  if (!opts?.omitContact) formData.append("contact", JSON.stringify(contact));
  if (!opts?.omitDetails) formData.append("details", JSON.stringify(details));
  if (opts?.floorPlan) formData.append("floorPlan", opts.floorPlan);
  return app.request(
    "/api/contact/details",
    {
      method: "POST",
      headers: { "cf-turnstile-response": "test-token" },
      body: formData,
    },
    env,
  );
}

describe("POST /api/contact/details (integration)", () => {
  it("returns 200 with dry-run id for valid FormData", async () => {
    const res = await post(validContact, validDetails);

    expect(res.status).toBe(200);
    const json: { id: string } = await res.json();
    expect(json.id).toMatch(/^dry-run-\d+$/);
  });

  it("returns 200 with floor plan PNG attachment", async () => {
    const file = new File([PNG_MAGIC], "plan.png", { type: "image/png" });
    const res = await post(validContact, validDetails, { floorPlan: file });

    expect(res.status).toBe(200);
    const json: { id: string } = await res.json();
    expect(json.id).toMatch(/^dry-run-\d+$/);
  });

  it("returns 400 when contact field is missing", async () => {
    const res = await post(null, validDetails, { omitContact: true });

    expect(res.status).toBe(400);
    const json: { detail: string } = await res.json();
    expect(json.detail).toBe("Missing contact field");
  });

  it("returns 400 when details JSON is invalid", async () => {
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    formData.append("details", "not json");
    const res = await app.request(
      "/api/contact/details",
      {
        method: "POST",
        headers: { "cf-turnstile-response": "test-token" },
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(400);
    const json: { detail: string } = await res.json();
    expect(json.detail).toBe("Invalid details JSON");
  });

  it("returns 422 when floor plan exceeds 5MB", async () => {
    const oversized = new Uint8Array(5 * 1024 * 1024 + 1);
    // Set PNG magic bytes at the start so it passes MIME check first
    oversized.set(PNG_MAGIC);
    const file = new File([oversized], "large.png", { type: "image/png" });
    const res = await post(validContact, validDetails, { floorPlan: file });

    expect(res.status).toBe(422);
    const json: { detail: string } = await res.json();
    expect(json.detail).toBe("Floor plan must be 5MB or less");
  });

  it("returns 422 when floor plan has disallowed MIME type", async () => {
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "plan.pdf", {
      type: "application/pdf",
    });
    const res = await post(validContact, validDetails, { floorPlan: file });

    expect(res.status).toBe(422);
    const json: { detail: string } = await res.json();
    expect(json.detail).toBe("Floor plan must be PNG, JPEG, or WebP");
  });
});

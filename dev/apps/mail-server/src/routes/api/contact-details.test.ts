import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { HttpProblem } from "@life-time-support/types";
import type { Contact } from "@life-time-support/types/contact";
import type { ContactDetails } from "@life-time-support/types/contact-details";
import type { Env } from "../../index";

vi.mock("../../lib/email", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../../emails/render", () => ({
  renderContactDetailsNotification: vi.fn(),
}));

vi.mock("../../lib/idempotency-key", () => ({
  buildIdempotencyKey: vi.fn((prefix: string) => `${prefix}:mocked-hash`),
}));

vi.mock("../../lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue({ success: true }),
}));

const { sendEmail } = await import("../../lib/email");
const { renderContactDetailsNotification } = await import("../../emails/render");
const { contactDetails } = await import("./contact-details");

const mockSendEmail = vi.mocked(sendEmail);
const mockRender = vi.mocked(renderContactDetailsNotification);

const env: Env["Bindings"] = {
  RESEND_API_KEY: "re_test_key",
  EMAIL_ADMIN: "admin@example.com",
  EMAIL_NOTIFICATION: "notifications@example.com",
  EMAIL_NOREPLY: "noreply@example.com",
  TURNSTILE_SECRET_KEY: "test-secret-key",
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

function createApp() {
  const app = new Hono<Env>();
  app.use("/api/*", async (c, next) => {
    c.set("resend", {} as Env["Variables"]["resend"]);
    await next();
  });
  app.route("/api/contact/details", contactDetails);
  app.onError((err, c) => {
    if (err instanceof HttpProblem) return err.toResponse();
    return c.json({ error: "unexpected" }, 500);
  });
  return app;
}

function post(app: Hono<Env>, contact: unknown, details: unknown, floorPlan?: File) {
  const formData = new FormData();
  formData.append("contact", JSON.stringify(contact));
  formData.append("details", JSON.stringify(details));
  if (floorPlan) {
    formData.append("floorPlan", floorPlan);
  }
  return app.request("/api/contact/details", { method: "POST", body: formData }, env);
}

describe("POST /api/contact/details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockResolvedValue("<html>details-notification</html>");
    mockSendEmail.mockResolvedValue({ id: "email_456" });
  });

  // --- Payload size ---

  it("returns 413 when Content-Length exceeds limit", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    formData.append("details", JSON.stringify(validDetails));
    const res = await app.request(
      "/api/contact/details",
      {
        method: "POST",
        headers: { "Content-Length": String(7 * 1024 * 1024) },
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(413);
    const body: { title: string } = await res.json();
    expect(body.title).toBe("Payload Too Large");
  });

  // --- Success ---

  it("returns 200 with email id on success", async () => {
    const app = createApp();
    const res = await post(app, validContact, validDetails);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "email_456" });
  });

  it("renders template with details and source", async () => {
    const app = createApp();
    await post(app, validContact, validDetails);

    expect(mockRender).toHaveBeenCalledWith({
      ...validDetails,
      contact: validContact,
      source: "unknown",
      floorPlanSrc: undefined,
    });
  });

  it("sends notification to admin with idempotencyKey", async () => {
    const app = createApp();
    await post(app, validContact, validDetails);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: env.EMAIL_NOTIFICATION,
        to: env.EMAIL_ADMIN,
        subject: "【お問い合わせ詳細】山田 太郎様 - 追加情報",
        html: "<html>details-notification</html>",
        replyTo: "taro@example.com",
        attachments: undefined,
        idempotencyKey: "contact-details:mocked-hash",
        tags: [
          { name: "env", value: "production" },
          { name: "category", value: "contact-details" },
          { name: "source", value: "unknown" },
        ],
      }),
    );
  });

  it("uses source query parameter", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    formData.append("details", JSON.stringify(validDetails));
    await app.request(
      "/api/contact/details?source=landing-page",
      { method: "POST", body: formData },
      env,
    );

    expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({ source: "landing-page" }));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: expect.arrayContaining([{ name: "source", value: "landing-page" }]),
      }),
    );
  });

  it("falls back source to 'unknown' for invalid characters", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    formData.append("details", JSON.stringify(validDetails));
    await app.request(
      "/api/contact/details?source=%3Cscript%3E",
      { method: "POST", body: formData },
      env,
    );

    expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({ source: "unknown" }));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: expect.arrayContaining([{ name: "source", value: "unknown" }]),
      }),
    );
  });

  it("accepts empty details (all fields optional)", async () => {
    const app = createApp();
    const res = await post(app, validContact, {});

    expect(res.status).toBe(200);
  });

  // --- Floor plan attachment ---

  it("includes floor plan as inline CID attachment", async () => {
    const app = createApp();
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "plan.png", {
      type: "image/png",
    });
    await post(app, validContact, validDetails, file);

    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({ floorPlanSrc: "cid:floorPlan" }),
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          {
            filename: "floor-plan.png",
            content: btoa(String.fromCharCode(0x89, 0x50, 0x4e, 0x47)),
            contentType: "image/png",
            contentId: "floorPlan",
          },
        ],
      }),
    );
  });

  it("rejects floor plan with invalid MIME type", async () => {
    const app = createApp();
    const file = new File([new Uint8Array([0x00])], "plan.pdf", { type: "application/pdf" });
    const res = await post(app, validContact, validDetails, file);

    expect(res.status).toBe(422);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Floor plan must be PNG, JPEG, or WebP");
  });

  it("rejects floor plan exceeding 5MB", async () => {
    const app = createApp();
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
      type: "image/png",
    });
    const res = await post(app, validContact, validDetails, file);

    expect(res.status).toBe(422);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Floor plan must be 5MB or less");
  });

  it("rejects file with valid MIME header but invalid magic bytes", async () => {
    const app = createApp();
    const file = new File([new Uint8Array([0x00, 0x01, 0x02, 0x03])], "fake.png", {
      type: "image/png",
    });
    const res = await post(app, validContact, validDetails, file);

    expect(res.status).toBe(422);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Floor plan must be PNG, JPEG, or WebP");
  });

  it("accepts valid WebP file with RIFF+WEBP magic bytes", async () => {
    const app = createApp();
    // RIFF(0-3) + size(4-7) + WEBP(8-11)
    const webpBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const file = new File([webpBytes], "plan.webp", { type: "image/webp" });
    await post(app, validContact, validDetails, file);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [expect.objectContaining({ contentType: "image/webp" })],
      }),
    );
  });

  it("rejects RIFF file that is not WebP (e.g. AVI)", async () => {
    const app = createApp();
    // RIFF header but AVI instead of WEBP at offset 8-11
    const aviBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20,
    ]);
    const file = new File([aviBytes], "video.webp", { type: "image/webp" });
    const res = await post(app, validContact, validDetails, file);

    expect(res.status).toBe(422);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Floor plan must be PNG, JPEG, or WebP");
  });

  it("uses detected MIME type from magic bytes for contentType", async () => {
    const app = createApp();
    // JPEG magic bytes but declared as image/png
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "photo.jpg", {
      type: "image/png",
    });
    await post(app, validContact, validDetails, file);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [expect.objectContaining({ contentType: "image/jpeg" })],
      }),
    );
  });

  it("skips attachment for empty file", async () => {
    const app = createApp();
    const file = new File([], "empty.png", { type: "image/png" });
    await post(app, validContact, validDetails, file);

    expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({ floorPlanSrc: undefined }));
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ attachments: undefined }));
  });

  it("sanitizes malicious filename to safe default", async () => {
    const app = createApp();
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "../../etc/passwd", {
      type: "image/png",
    });
    await post(app, validContact, validDetails, file);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [expect.objectContaining({ filename: "floor-plan.png" })],
      }),
    );
  });

  it("preserves valid extension in sanitized filename", async () => {
    const app = createApp();
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "my-plan.jpeg", {
      type: "image/jpeg",
    });
    await post(app, validContact, validDetails, file);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [expect.objectContaining({ filename: "floor-plan.jpeg" })],
      }),
    );
  });

  // --- Validation: FormData ---

  it("returns 400 when FormData cannot be parsed", async () => {
    const app = createApp();
    const res = await app.request(
      "/api/contact/details",
      {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data; boundary=invalid" },
        body: "not valid multipart data",
      },
      env,
    );

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Invalid FormData");
  });

  // --- Validation: contact ---

  it("returns 400 when contact field is missing", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("details", JSON.stringify(validDetails));
    const res = await app.request("/api/contact/details", { method: "POST", body: formData }, env);

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Missing contact field");
  });

  it("returns 400 for invalid contact JSON", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", "not json");
    formData.append("details", JSON.stringify(validDetails));
    const res = await app.request("/api/contact/details", { method: "POST", body: formData }, env);

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Invalid contact JSON");
  });

  it("returns 422 for invalid contact data", async () => {
    const app = createApp();
    const res = await post(app, { name: "テスト" }, validDetails);

    expect(res.status).toBe(422);
    const body: { title: string } = await res.json();
    expect(body.title).toBe("Validation Failed");
  });

  // --- Validation: details ---

  it("returns 400 when details field is missing", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    const res = await app.request("/api/contact/details", { method: "POST", body: formData }, env);

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Missing details field");
  });

  it("returns 400 for invalid details JSON", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    formData.append("details", "not json");
    const res = await app.request("/api/contact/details", { method: "POST", body: formData }, env);

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Invalid details JSON");
  });

  it("returns 422 for invalid details data", async () => {
    const app = createApp();
    const res = await post(app, validContact, { propertyType: "invalid" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid considering enum value", async () => {
    const app = createApp();
    const res = await post(app, validContact, { considering: ["存在しないサービス"] });

    expect(res.status).toBe(422);
  });

  it("returns 400 when contact field is a File instead of string", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", new File(["data"], "contact.txt", { type: "text/plain" }));
    formData.append("details", JSON.stringify(validDetails));
    const res = await app.request("/api/contact/details", { method: "POST", body: formData }, env);

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Missing contact field");
  });

  it("returns 400 when details field is a File instead of string", async () => {
    const app = createApp();
    const formData = new FormData();
    formData.append("contact", JSON.stringify(validContact));
    formData.append("details", new File(["data"], "details.txt", { type: "text/plain" }));
    const res = await app.request("/api/contact/details", { method: "POST", body: formData }, env);

    expect(res.status).toBe(400);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Missing details field");
  });

  // --- Email failure ---

  it("propagates HttpProblem when sendEmail fails", async () => {
    mockSendEmail.mockRejectedValue(
      new HttpProblem({ status: 502, title: "Email Delivery Failed" }),
    );

    const app = createApp();
    const res = await post(app, validContact, validDetails);

    expect(res.status).toBe(502);
    const body: { title: string } = await res.json();
    expect(body.title).toBe("Email Delivery Failed");
  });
});

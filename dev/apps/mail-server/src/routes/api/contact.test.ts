import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { HttpProblem } from "@life-time-support/types";
import type { Contact } from "@life-time-support/types/contact";
import type { Env } from "../../index";

vi.mock("../../lib/email", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../../emails/render", () => ({
  renderContactNotification: vi.fn(),
  renderContactAutoReply: vi.fn(),
}));

vi.mock("../../lib/idempotency-key", () => ({
  buildIdempotencyKey: vi.fn((prefix: string) => `${prefix}:mocked-hash`),
}));

vi.mock("../../lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue({ success: true }),
}));

// Must import after vi.mock declarations
const { sendEmail } = await import("../../lib/email");
const { renderContactNotification, renderContactAutoReply } = await import("../../emails/render");
const { contact } = await import("./contact");

const mockSendEmail = vi.mocked(sendEmail);
const mockRenderNotification = vi.mocked(renderContactNotification);
const mockRenderAutoReply = vi.mocked(renderContactAutoReply);

const env: Env["Bindings"] = {
  RESEND_API_KEY: "re_test_key",
  EMAIL_ADMIN: "admin@example.com",
  EMAIL_NOTIFICATION: "notifications@example.com",
  EMAIL_NOREPLY: "noreply@example.com",
  TURNSTILE_SECRET_KEY: "test-secret-key",
};

const validBody: Contact = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "09012345678",
  email: "taro@example.com",
  subject: "資料請求",
};

function createApp() {
  const app = new Hono<Env>();
  app.use("/api/*", async (c, next) => {
    c.set("resend", {} as Env["Variables"]["resend"]);
    await next();
  });
  app.route("/api/contact", contact);
  app.onError((err, c) => {
    if (err instanceof HttpProblem) return err.toResponse();
    if (err instanceof HTTPException) {
      return new HttpProblem({
        status: err.status,
        title: err.message,
        instance: c.req.path,
      }).toResponse();
    }
    return c.json({ error: "unexpected" }, 500);
  });
  return app;
}

function post(app: Hono<Env>, body: unknown) {
  return app.request(
    "/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    env,
  );
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRenderNotification.mockResolvedValue("<html>notification</html>");
    mockRenderAutoReply.mockResolvedValue("<html>auto-reply</html>");
    mockSendEmail.mockResolvedValue({ id: "email_123" });
  });

  // --- Success ---

  it("returns 200 with email id on success", async () => {
    const app = createApp();
    const res = await post(app, validBody);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "email_123" });
  });

  it("renders both templates with parsed data", async () => {
    const app = createApp();
    await post(app, validBody);

    expect(mockRenderNotification).toHaveBeenCalledWith({ ...validBody, source: "unknown" });
    expect(mockRenderAutoReply).toHaveBeenCalledWith(validBody);
  });

  it("sends notification to admin with idempotencyKey", async () => {
    const app = createApp();
    await post(app, validBody);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: env.EMAIL_NOTIFICATION,
        to: env.EMAIL_ADMIN,
        subject: "【お問い合わせ】山田 太郎様 - 資料請求",
        html: "<html>notification</html>",
        replyTo: "taro@example.com",
        idempotencyKey: "contact:notification:mocked-hash",
        tags: [
          { name: "env", value: "production" },
          { name: "category", value: "contact" },
          { name: "source", value: "unknown" },
        ],
      }),
    );
  });

  it("sends auto-reply to customer with idempotencyKey", async () => {
    const app = createApp();
    await post(app, validBody);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: env.EMAIL_NOREPLY,
        to: "taro@example.com",
        subject: "【ライフタイムサポート】お問い合わせありがとうございます",
        html: "<html>auto-reply</html>",
        idempotencyKey: "contact:auto-reply:mocked-hash",
        tags: [
          { name: "env", value: "production" },
          { name: "category", value: "contact-auto-reply" },
          { name: "source", value: "unknown" },
        ],
      }),
    );
  });

  it("sends both emails in parallel", async () => {
    const app = createApp();
    await post(app, validBody);

    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });

  it("uses source query parameter in render and tags", async () => {
    const app = createApp();
    await app.request(
      "/api/contact?source=landing-page",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      },
      env,
    );

    expect(mockRenderNotification).toHaveBeenCalledWith({ ...validBody, source: "landing-page" });
    expect(mockRenderAutoReply).toHaveBeenCalledWith(validBody);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: expect.arrayContaining([{ name: "source", value: "landing-page" }]),
      }),
    );
  });

  it("uses ENVIRONMENT value in email tags", async () => {
    const app = createApp();
    await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      },
      { ...env, ENVIRONMENT: "development" },
    );

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: expect.arrayContaining([{ name: "env", value: "development" }]),
      }),
    );
  });

  it("falls back source to 'unknown' for invalid characters", async () => {
    const app = createApp();
    await app.request(
      "/api/contact?source=%3Cscript%3E",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      },
      env,
    );

    expect(mockRenderNotification).toHaveBeenCalledWith({ ...validBody, source: "unknown" });
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags: expect.arrayContaining([{ name: "source", value: "unknown" }]),
      }),
    );
  });

  // --- Validation ---

  it("returns 400 for malformed JSON", async () => {
    const app = createApp();
    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      },
      env,
    );

    expect(res.status).toBe(400);
    const body: { title: string } = await res.json();
    expect(body.title).toBe("Malformed JSON in request body");
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 422 when body is empty", async () => {
    const app = createApp();
    const res = await post(app, {});

    expect(res.status).toBe(422);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns 422 when required fields are missing", async () => {
    const app = createApp();
    const res = await post(app, { name: "テスト" });

    expect(res.status).toBe(422);
  });

  it("returns 422 with validation detail message", async () => {
    const app = createApp();
    const res = await post(app, {});
    const body: { title: string; detail: string } = await res.json();

    expect(body.title).toBe("Validation Failed");
    expect(body.detail).toBeTruthy();
  });

  it("returns 422 for name with only spaces", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, name: "  \u3000 " });

    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid phone number", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, phone: "invalid" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid email", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, email: "not-an-email" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid nameKana (non-hiragana)", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, nameKana: "ヤマダ タロウ" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for nameKana with only half-width spaces", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, nameKana: "   " });

    expect(res.status).toBe(422);
  });

  it("returns 422 for nameKana with only full-width spaces", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, nameKana: "\u3000\u3000" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for name containing newline characters", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, name: "山田\r\n太郎" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for name containing null byte", async () => {
    const app = createApp();
    const res = await post(app, { ...validBody, name: "山田\0太郎" });

    expect(res.status).toBe(422);
  });

  // --- Email failure ---

  it("propagates HttpProblem when notification fails", async () => {
    mockSendEmail.mockRejectedValue(
      new HttpProblem({ status: 502, title: "Email Delivery Failed" }),
    );

    const app = createApp();
    const res = await post(app, validBody);

    expect(res.status).toBe(502);
    const body: { title: string } = await res.json();
    expect(body.title).toBe("Email Delivery Failed");
  });

  it("returns 200 even when auto-reply fails", async () => {
    mockSendEmail
      .mockResolvedValueOnce({ id: "email_123" })
      .mockRejectedValueOnce(new Error("auto-reply failed"));

    const app = createApp();
    const res = await post(app, validBody);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "email_123" });
  });
});

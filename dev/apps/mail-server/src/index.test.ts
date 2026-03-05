import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TurnstileResult } from "./lib/turnstile";
import type { Env } from "./index";

vi.mock("./lib/turnstile", () => ({
  verifyTurnstile: vi.fn(),
}));

const { verifyTurnstile } = await import("./lib/turnstile");
const app = (await import("./index")).default;

const mockVerify = vi.mocked(verifyTurnstile);

const turnstileSuccess: TurnstileResult = {
  success: true,
  challenge_ts: "2026-02-20T00:00:00.000Z",
  hostname: "lp.life-time-support.com",
  "error-codes": [],
  action: "",
  cdata: "",
  messages: [],
  metadata: { ephemeral_id: "" },
};

const turnstileFailure: TurnstileResult = {
  success: false,
  "error-codes": ["invalid-input-response"],
  messages: [],
};

const env: Env["Bindings"] = {
  RESEND_API_KEY: "re_test_key",
  EMAIL_ADMIN: "admin@example.com",
  EMAIL_NOTIFICATION: "notifications@example.com",
  EMAIL_NOREPLY: "noreply@example.com",
  TURNSTILE_SECRET_KEY: "test-secret-key",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockVerify.mockResolvedValue(turnstileSuccess);
});

function get(origin: string, overrides?: Partial<Env["Bindings"]>) {
  return app.request(
    "/api/contact",
    {
      headers: {
        Origin: origin,
        "cf-turnstile-response": "test-token",
      },
    },
    { ...env, ...overrides },
  );
}

function preflight(origin: string, overrides?: Partial<Env["Bindings"]>) {
  return app.request(
    "/api/contact",
    {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "cf-turnstile-response",
      },
    },
    { ...env, ...overrides },
  );
}

describe("CORS", () => {
  it.each(["https://lp.life-time-support.com", "https://life-time-support.com"])(
    "allows %s",
    async (origin) => {
      const res = await get(origin);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(origin);
    },
  );

  it("blocks unknown origin", async () => {
    const res = await get("https://evil.example.com");
    expect(res.headers.get("Access-Control-Allow-Origin")).not.toBe("https://evil.example.com");
  });

  it("allows any origin in development", async () => {
    const origin = "http://localhost:4321";
    const res = await get(origin, { ENVIRONMENT: "development" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  });

  it("responds to preflight with allowed origin", async () => {
    const origin = "https://lp.life-time-support.com";
    const res = await preflight(origin);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  });

  it("includes cf-turnstile-response in allowed headers", async () => {
    const origin = "https://lp.life-time-support.com";
    const res = await preflight(origin);
    const allowHeaders = res.headers.get("Access-Control-Allow-Headers") ?? "";
    expect(allowHeaders.toLowerCase()).toContain("cf-turnstile-response");
  });

  it("does not reflect origin in preflight for unknown origin", async () => {
    const res = await preflight("https://evil.example.com");
    expect(res.headers.get("Access-Control-Allow-Origin")).not.toBe("https://evil.example.com");
  });
});

describe("Turnstile middleware", () => {
  it("returns 403 when cf-turnstile-response header is missing", async () => {
    const res = await app.request(
      "/api/contact",
      { method: "POST", headers: { "Content-Type": "application/json" } },
      env,
    );

    expect(res.status).toBe(403);
    const body: { title: string; detail: string } = await res.json();
    expect(body.title).toBe("Forbidden");
    expect(body.detail).toBe("Missing Turnstile token");
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("returns 403 when Turnstile verification fails", async () => {
    mockVerify.mockResolvedValue(turnstileFailure);

    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "bad-token",
        },
      },
      env,
    );

    expect(res.status).toBe(403);
    const body: { title: string; detail: string } = await res.json();
    expect(body.title).toBe("Forbidden");
    expect(body.detail).toBe("Turnstile verification failed");
  });

  it("passes request through when Turnstile verification succeeds", async () => {
    mockVerify.mockResolvedValue(turnstileSuccess);

    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "valid-token",
        },
        body: JSON.stringify({}),
      },
      env,
    );

    // Route is reached (422 = validation error from route, not 403 from middleware)
    expect(res.status).not.toBe(403);
    expect(mockVerify).toHaveBeenCalledWith("valid-token", "test-secret-key", undefined);
  });

  it("accepts Turnstile hostname life-time-support.com", async () => {
    mockVerify.mockResolvedValue({
      ...turnstileSuccess,
      hostname: "life-time-support.com",
    });

    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "valid-token",
        },
        body: JSON.stringify({}),
      },
      env,
    );

    expect(res.status).not.toBe(403);
  });

  it("returns 403 when Turnstile hostname does not match allowed hosts", async () => {
    mockVerify.mockResolvedValue({
      ...turnstileSuccess,
      hostname: "evil.example.com",
    });

    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "valid-token",
        },
        body: JSON.stringify({}),
      },
      env,
    );

    expect(res.status).toBe(403);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Turnstile hostname mismatch");
  });

  it("skips hostname check in development", async () => {
    mockVerify.mockResolvedValue({
      ...turnstileSuccess,
      hostname: "localhost",
    });

    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "valid-token",
        },
        body: JSON.stringify({}),
      },
      { ...env, ENVIRONMENT: "development" },
    );

    expect(res.status).not.toBe(403);
  });

  it("does not apply to health check endpoint", async () => {
    const res = await app.request("/health", {}, env);

    expect(res.status).toBe(200);
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("applies to /api/contact/details", async () => {
    const res = await app.request(
      "/api/contact/details",
      { method: "POST", headers: { "Content-Type": "application/json" } },
      env,
    );

    expect(res.status).toBe(403);
    const body: { detail: string } = await res.json();
    expect(body.detail).toBe("Missing Turnstile token");
  });

  it("reaches /api/contact/details handler through Turnstile", async () => {
    const formData = new FormData();
    formData.append("contact", JSON.stringify({}));
    formData.append("details", JSON.stringify({}));

    const res = await app.request(
      "/api/contact/details",
      {
        method: "POST",
        headers: { "cf-turnstile-response": "valid-token" },
        body: formData,
      },
      env,
    );

    // Route is reached (422 = validation error from handler, not 403 from middleware)
    expect(res.status).toBe(422);
    expect(mockVerify).toHaveBeenCalled();
  });
});

describe("OpenAPI", () => {
  const devEnv = { ...env, ENVIRONMENT: "development" };

  it("returns OpenAPI spec at /doc in development", async () => {
    const res = await app.request("/doc", {}, devEnv);
    expect(res.status).toBe(200);
    const body: { openapi: string; info: { title: string } } = await res.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("ライフタイムサポート メールAPI");
  });

  it("returns Swagger UI at /ui in development", async () => {
    const res = await app.request("/ui", {}, devEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("returns 404 for /doc in production", async () => {
    const res = await app.request("/doc", {}, env);
    expect(res.status).toBe(404);
  });

  it("returns 404 for /ui in production", async () => {
    const res = await app.request("/ui", {}, env);
    expect(res.status).toBe(404);
  });
});

describe("Global error handler", () => {
  it("returns 500 for unexpected errors that are not HttpProblem or HTTPException", async () => {
    // Force a raw Error (not HttpProblem/HTTPException) to propagate to onError
    mockVerify.mockRejectedValue(new Error("unexpected crash"));

    const res = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": "valid-token",
        },
        body: JSON.stringify({}),
      },
      env,
    );

    expect(res.status).toBe(500);
    const body: { title: string } = await res.json();
    expect(body.title).toBe("Internal Server Error");
  });
});

describe("Not Found", () => {
  it("returns 404 with RFC 9457 problem for unknown path", async () => {
    const res = await app.request("/unknown", {}, env);
    expect(res.status).toBe(404);
    const body: { title: string; instance: string } = await res.json();
    expect(body.title).toBe("Not Found");
    expect(body.instance).toBe("/unknown");
  });
});

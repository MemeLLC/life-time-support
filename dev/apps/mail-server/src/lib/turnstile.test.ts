import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpProblem } from "@life-time-support/types";
import { verifyTurnstile } from "./turnstile";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch");
});

const mockFetch = () => vi.mocked(globalThis.fetch);

const successResponse = {
  success: true as const,
  challenge_ts: "2026-02-20T00:00:00.000Z",
  hostname: "lp.life-time-support.com",
  "error-codes": [] as string[],
  action: "",
  cdata: "",
  messages: [] as string[],
  metadata: { ephemeral_id: "" },
};

const failureResponse = {
  success: false as const,
  "error-codes": ["invalid-input-response"],
  messages: [] as string[],
};

function siteverifyOk(body: Record<string, unknown>) {
  return Response.json(body);
}

describe("verifyTurnstile", () => {
  it("returns success when token is valid", async () => {
    mockFetch().mockResolvedValue(siteverifyOk(successResponse));

    const result = await verifyTurnstile("valid-token", "secret-key");

    expect(result).toEqual(successResponse);
    expect(mockFetch()).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
        body: new URLSearchParams({ secret: "secret-key", response: "valid-token" }),
      }),
    );
  });

  it("passes remoteip when ip is provided", async () => {
    mockFetch().mockResolvedValue(siteverifyOk(successResponse));

    await verifyTurnstile("token", "secret", "1.2.3.4");

    expect(mockFetch()).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: new URLSearchParams({ secret: "secret", response: "token", remoteip: "1.2.3.4" }),
      }),
    );
  });

  it("returns failure with error codes when token is invalid", async () => {
    mockFetch().mockResolvedValue(siteverifyOk(failureResponse));

    const result = await verifyTurnstile("bad-token", "secret-key");

    expect(result).toEqual(failureResponse);
  });

  it("throws HttpProblem 502 when siteverify returns non-OK status", async () => {
    mockFetch().mockImplementation(() =>
      Promise.resolve(new Response("Service Unavailable", { status: 503 })),
    );

    await expect(verifyTurnstile("token", "secret")).rejects.toThrow(HttpProblem);
    await expect(verifyTurnstile("token", "secret")).rejects.toMatchObject({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  });

  it("throws HttpProblem 502 when response body is not valid JSON", async () => {
    mockFetch().mockImplementation(() =>
      Promise.resolve(new Response("not json at all", { status: 200 })),
    );

    await expect(verifyTurnstile("token", "secret")).rejects.toThrow(HttpProblem);
    await expect(verifyTurnstile("token", "secret")).rejects.toMatchObject({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  });

  it("throws HttpProblem 502 when response body is not valid JSON object", async () => {
    mockFetch().mockImplementation(() =>
      Promise.resolve(
        new Response('"not-an-object"', {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(verifyTurnstile("token", "secret")).rejects.toThrow(HttpProblem);
    await expect(verifyTurnstile("token", "secret")).rejects.toMatchObject({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  });

  it("throws HttpProblem 502 when response body lacks success field", async () => {
    mockFetch().mockImplementation(() => Promise.resolve(siteverifyOk({ unexpected: true })));

    await expect(verifyTurnstile("token", "secret")).rejects.toThrow(HttpProblem);
    await expect(verifyTurnstile("token", "secret")).rejects.toMatchObject({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  });

  it("throws HttpProblem 502 on network error", async () => {
    mockFetch().mockRejectedValue(new TypeError("fetch failed"));

    await expect(verifyTurnstile("token", "secret")).rejects.toThrow(HttpProblem);
    await expect(verifyTurnstile("token", "secret")).rejects.toMatchObject({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  });
});

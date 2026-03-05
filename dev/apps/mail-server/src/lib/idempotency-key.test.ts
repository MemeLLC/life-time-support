import { describe, it, expect } from "vitest";
import { buildIdempotencyKey } from "./idempotency-key";

describe("buildIdempotencyKey", () => {
  it("returns prefix:hex format", async () => {
    const key = await buildIdempotencyKey("contact:notification", "token-123");

    expect(key).toMatch(/^contact:notification:[0-9a-f]{64}$/);
  });

  it("produces deterministic output for same input", async () => {
    const a = await buildIdempotencyKey("prefix", "same-token");
    const b = await buildIdempotencyKey("prefix", "same-token");

    expect(a).toBe(b);
  });

  it("produces different output for different tokens", async () => {
    const a = await buildIdempotencyKey("prefix", "token-a");
    const b = await buildIdempotencyKey("prefix", "token-b");

    expect(a).not.toBe(b);
  });

  it("produces different output for different prefixes", async () => {
    const a = await buildIdempotencyKey("contact:notification", "token");
    const b = await buildIdempotencyKey("contact:auto-reply", "token");

    expect(a).not.toBe(b);
  });

  it("handles empty token", async () => {
    const key = await buildIdempotencyKey("prefix", "");

    expect(key).toMatch(/^prefix:[0-9a-f]{64}$/);
  });
});

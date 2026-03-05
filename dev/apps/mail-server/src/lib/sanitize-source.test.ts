import { describe, it, expect } from "vitest";
import { sanitizeSource } from "./sanitize-source";

describe("sanitizeSource", () => {
  it("returns valid alphanumeric source as-is", () => {
    expect(sanitizeSource("landing-page")).toBe("landing-page");
  });

  it("allows underscores and hyphens", () => {
    expect(sanitizeSource("my_source-v2")).toBe("my_source-v2");
  });

  it("returns 'unknown' for undefined", () => {
    expect(sanitizeSource(undefined)).toBe("unknown");
  });

  it("returns 'unknown' for empty string", () => {
    expect(sanitizeSource("")).toBe("unknown");
  });

  it("returns 'unknown' for script injection", () => {
    expect(sanitizeSource("<script>")).toBe("unknown");
  });

  it("returns 'unknown' for strings with spaces", () => {
    expect(sanitizeSource("has space")).toBe("unknown");
  });

  it("returns 'unknown' for strings exceeding 256 characters", () => {
    expect(sanitizeSource("a".repeat(257))).toBe("unknown");
  });

  it("allows strings up to 256 characters", () => {
    const long = "a".repeat(256);
    expect(sanitizeSource(long)).toBe(long);
  });
});

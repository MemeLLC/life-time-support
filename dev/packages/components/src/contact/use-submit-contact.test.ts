import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubmitContact } from "./use-submit-contact";
import type { Contact } from "@life-time-support/types/contact";

const BASE_URL = "https://forms.life-time-support.com";

const validContact: Contact = {
  name: "田中太郎",
  nameKana: "たなかたろう",
  phone: "09012345678",
  email: "test@example.com",
  subject: "資料請求",
};

const TURNSTILE_TOKEN = "test-turnstile-token";

describe("useSubmitContact", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initial status is idle with no error", () => {
    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("returns true and sets status to success on successful submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    expect(success!).toBe(true);
    expect(result.current.status).toBe("success");
    expect(result.current.error).toBeNull();
  });

  it("calls fetch with correct URL, headers, and body", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() =>
      useSubmitContact({ baseUrl: BASE_URL, source: "landing-page" }),
    );

    await act(async () => {
      await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    const [url, init] = fetchSpy.mock.calls[0] as [
      URL,
      { method: string; headers: Record<string, string>; body: string },
    ];
    expect(url.href).toBe("https://forms.life-time-support.com/api/contact?source=landing-page");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["cf-turnstile-response"]).toBe(TURNSTILE_TOKEN);
    expect(init.body).toBe(JSON.stringify(validContact));
  });

  it("omits query parameter when source is not provided", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    await act(async () => {
      await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    const [url] = fetchSpy.mock.calls[0] as [URL];
    expect(url.href).toBe("https://forms.life-time-support.com/api/contact");
  });

  it("sets ProblemDetail error and returns false on HTTP error", async () => {
    const problem = {
      type: "about:blank",
      status: 422,
      title: "Validation Failed",
      detail: "メールアドレスが無効です",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(problem), {
        status: 422,
        headers: { "Content-Type": "application/problem+json" },
      }),
    );

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    expect(success!).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toEqual(problem);
  });

  it("falls back to status/statusText on non-JSON error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html>Forbidden</html>", {
        status: 403,
        statusText: "Forbidden",
        headers: { "Content-Type": "text/html" },
      }),
    );

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    expect(success!).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toEqual({
      type: "about:blank",
      status: 403,
      title: "Forbidden",
    });
  });

  it("sets generic ProblemDetail and returns false on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    expect(success!).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toEqual({
      type: "about:blank",
      status: 0,
      title: "Network Error",
      detail: "サーバーに接続できませんでした。ネットワーク接続を確認してください。",
    });
  });

  it("resets status and error to initial state", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    await act(async () => {
      await result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    expect(result.current.status).toBe("error");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("sets status to pending while submitting", async () => {
    let resolveFetch!: (value: Response) => void;
    vi.spyOn(globalThis, "fetch").mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const { result } = renderHook(() => useSubmitContact({ baseUrl: BASE_URL }));

    let submitPromise: Promise<boolean>;
    act(() => {
      submitPromise = result.current.submit(validContact, TURNSTILE_TOKEN);
    });

    expect(result.current.status).toBe("pending");

    await act(async () => {
      resolveFetch(new Response(null, { status: 200 }));
      await submitPromise!;
    });

    expect(result.current.status).toBe("success");
  });
});

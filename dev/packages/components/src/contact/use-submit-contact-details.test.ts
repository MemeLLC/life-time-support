import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubmitContactDetails } from "./use-submit-contact-details";
import type { Contact } from "@life-time-support/types/contact";
import type { ContactDetails } from "@life-time-support/types/contact-details";

const BASE_URL = "https://forms.life-time-support.com";

const validContact: Contact = {
  name: "田中太郎",
  nameKana: "たなかたろう",
  phone: "09012345678",
  email: "test@example.com",
  subject: "資料請求",
};

const validDetails: ContactDetails = {
  propertyType: "新築マンション",
  condoName: "テストマンション",
  considering: ["フロアコーティング", "エコカラット"],
  message: "テストメッセージ",
};

const TURNSTILE_TOKEN = "test-turnstile-token";

describe("useSubmitContactDetails", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initial status is idle with no error", () => {
    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("returns true and sets status to success on successful submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
    });

    expect(success!).toBe(true);
    expect(result.current.status).toBe("success");
    expect(result.current.error).toBeNull();
  });

  it("includes contact and details as JSON strings in FormData", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() =>
      useSubmitContactDetails({ baseUrl: BASE_URL, source: "landing-page" }),
    );

    await act(async () => {
      await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
    });

    const [url, init] = fetchSpy.mock.calls[0] as [
      URL,
      { method: string; headers: Record<string, string>; body: FormData },
    ];
    expect(url.href).toBe(
      "https://forms.life-time-support.com/api/contact/details?source=landing-page",
    );
    expect(init.method).toBe("POST");
    expect(init.headers["cf-turnstile-response"]).toBe(TURNSTILE_TOKEN);
    // Content-Type should NOT be set (browser sets multipart boundary automatically)
    expect(init.headers["Content-Type"]).toBeUndefined();

    expect(init.body.get("contact")).toBe(JSON.stringify(validContact));
    expect(init.body.get("details")).toBe(JSON.stringify(validDetails));
    expect(init.body.get("floorPlan")).toBeNull();
  });

  it("appends floorPlan to FormData when provided", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const floorPlan = new File(["dummy"], "floor.png", { type: "image/png" });

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    await act(async () => {
      await result.current.submit(
        { contact: validContact, details: validDetails, floorPlan },
        TURNSTILE_TOKEN,
      );
    });

    const body = fetchSpy.mock.calls[0][1]!.body as FormData;
    expect(body.get("floorPlan")).toBeInstanceOf(File);
    expect((body.get("floorPlan") as File).name).toBe("floor.png");
  });

  it("omits query parameter when source is not provided", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    await act(async () => {
      await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
    });

    const [url] = fetchSpy.mock.calls[0] as [URL];
    expect(url.href).toBe("https://forms.life-time-support.com/api/contact/details");
  });

  it("sets ProblemDetail error and returns false on HTTP error", async () => {
    const problem = {
      type: "about:blank",
      status: 422,
      title: "Validation Failed",
      detail: "バリデーションエラー",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(problem), {
        status: 422,
        headers: { "Content-Type": "application/problem+json" },
      }),
    );

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
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

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
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

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    let success: boolean;
    await act(async () => {
      success = await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
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

    const { result } = renderHook(() => useSubmitContactDetails({ baseUrl: BASE_URL }));

    await act(async () => {
      await result.current.submit(
        { contact: validContact, details: validDetails },
        TURNSTILE_TOKEN,
      );
    });

    expect(result.current.status).toBe("error");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });
});

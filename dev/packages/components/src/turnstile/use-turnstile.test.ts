import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTurnstile } from "./use-turnstile";

describe("useTurnstile", () => {
  it("初期状態で token が null", () => {
    const { result } = renderHook(() => useTurnstile("site-key"));

    expect(result.current.token).toBeNull();
  });

  it("siteKey に渡した値がそのまま返る", () => {
    const { result } = renderHook(() => useTurnstile("my-site-key"));

    expect(result.current.siteKey).toBe("my-site-key");
  });

  it("onSuccess でトークンがセットされる", () => {
    const { result } = renderHook(() => useTurnstile("site-key"));

    act(() => {
      result.current.onSuccess("test-token-123");
    });

    expect(result.current.token).toBe("test-token-123");
  });

  it("onExpire でトークンが null にリセットされる", () => {
    const { result } = renderHook(() => useTurnstile("site-key"));

    act(() => {
      result.current.onSuccess("test-token-123");
    });
    expect(result.current.token).toBe("test-token-123");

    act(() => {
      result.current.onExpire();
    });
    expect(result.current.token).toBeNull();
  });

  it("siteKey が変わると返り値も更新される", () => {
    const { result, rerender } = renderHook(({ key }) => useTurnstile(key), {
      initialProps: { key: "key-1" },
    });

    expect(result.current.siteKey).toBe("key-1");

    rerender({ key: "key-2" });

    expect(result.current.siteKey).toBe("key-2");
  });
});

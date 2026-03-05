import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionStorage } from "./use-session-storage";

const KEY = "test-key";

describe("useSessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null when no value is stored", () => {
    const { result } = renderHook(() => useSessionStorage<string>(KEY));

    expect(result.current.get()).toBeNull();
  });

  it("stores and retrieves a value", () => {
    const { result } = renderHook(() => useSessionStorage<{ name: string }>(KEY));

    act(() => {
      result.current.set({ name: "太郎" });
    });

    expect(result.current.get()).toEqual({ name: "太郎" });
  });

  it("removes a stored value", () => {
    const { result } = renderHook(() => useSessionStorage<string>(KEY));

    act(() => {
      result.current.set("hello");
    });

    expect(result.current.get()).toBe("hello");

    act(() => {
      result.current.remove();
    });

    expect(result.current.get()).toBeNull();
  });

  it("overwrites an existing value", () => {
    const { result } = renderHook(() => useSessionStorage<number>(KEY));

    act(() => {
      result.current.set(1);
    });

    act(() => {
      result.current.set(2);
    });

    expect(result.current.get()).toBe(2);
  });

  it("returns null and removes the item when stored value is invalid JSON", () => {
    sessionStorage.setItem(KEY, "not-valid-json{");

    const { result } = renderHook(() => useSessionStorage<string>(KEY));

    expect(result.current.get()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it("isolates values by key", () => {
    const { result: a } = renderHook(() => useSessionStorage<string>("key-a"));
    const { result: b } = renderHook(() => useSessionStorage<string>("key-b"));

    act(() => {
      a.current.set("alpha");
      b.current.set("beta");
    });

    expect(a.current.get()).toBe("alpha");
    expect(b.current.get()).toBe("beta");
  });

  it("set does not throw when sessionStorage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    const { result } = renderHook(() => useSessionStorage<string>(KEY));

    expect(() => {
      act(() => {
        result.current.set("value");
      });
    }).not.toThrow();

    vi.restoreAllMocks();
  });

  it("get returns null when sessionStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });

    const { result } = renderHook(() => useSessionStorage<string>(KEY));

    expect(result.current.get()).toBeNull();

    vi.restoreAllMocks();
  });

  it("remove does not throw when sessionStorage throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });

    const { result } = renderHook(() => useSessionStorage<string>(KEY));

    expect(() => {
      act(() => {
        result.current.remove();
      });
    }).not.toThrow();

    vi.restoreAllMocks();
  });
});

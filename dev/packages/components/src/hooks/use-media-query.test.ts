import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMediaQuery } from "./use-media-query";

describe("useMediaQuery", () => {
  let listeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;
  let matchesMap: Map<string, boolean>;

  beforeEach(() => {
    listeners = new Map();
    matchesMap = new Map();

    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => {
        if (!listeners.has(query)) {
          listeners.set(query, new Set());
        }

        return {
          matches: matchesMap.get(query) ?? false,
          media: query,
          addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
            listeners.get(query)!.add(handler);
          },
          removeEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
            listeners.get(query)!.delete(handler);
          },
        };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when query does not match", async () => {
    matchesMap.set("(min-width: 768px)", false);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("returns true when query matches", async () => {
    matchesMap.set("(min-width: 768px)", true);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("updates when media query changes", async () => {
    matchesMap.set("(min-width: 768px)", false);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    act(() => {
      matchesMap.set("(min-width: 768px)", true);
      listeners.get("(min-width: 768px)")?.forEach((handler) => {
        handler({ matches: true } as MediaQueryListEvent);
      });
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("cleans up listener on unmount", async () => {
    matchesMap.set("(min-width: 768px)", false);

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    await waitFor(() => {
      expect(listeners.get("(min-width: 768px)")?.size).toBe(1);
    });

    unmount();

    await waitFor(() => {
      expect(listeners.get("(min-width: 768px)")?.size).toBe(0);
    });
  });

  it("returns false when matchMedia is unavailable", () => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "matchMedia", { value: undefined, writable: true });

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);
  });

  it("moves listeners when the query changes", async () => {
    matchesMap.set("(min-width: 768px)", false);
    matchesMap.set("(min-width: 1024px)", true);

    const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: "(min-width: 768px)" },
    });

    await waitFor(() => {
      expect(listeners.get("(min-width: 768px)")?.size).toBe(1);
    });

    rerender({ query: "(min-width: 1024px)" });

    await waitFor(() => {
      expect(listeners.get("(min-width: 768px)")?.size).toBe(0);
      expect(listeners.get("(min-width: 1024px)")?.size).toBe(1);
    });
  });
});

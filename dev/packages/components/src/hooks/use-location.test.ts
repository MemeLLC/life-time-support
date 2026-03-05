import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocation } from "./use-location";

describe("useLocation", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("returns the current pathname", async () => {
    window.history.pushState({}, "", "/pricing");

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current).toBe("/pricing");
    });
  });

  it("updates when a popstate event fires", async () => {
    const { result } = renderHook(() => useLocation());

    act(() => {
      window.history.pushState({}, "", "/about");
      const popEvent =
        typeof PopStateEvent === "undefined"
          ? new Event("popstate")
          : new PopStateEvent("popstate");
      window.dispatchEvent(popEvent);
    });

    await waitFor(() => {
      expect(result.current).toBe("/about");
    });
  });

  it("registers and cleans up listeners", async () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith("hashchange", expect.any(Function));
    });

    const popstateHandler = addSpy.mock.calls.find(
      ([event]: [string, ...unknown[]]) => event === "popstate",
    )?.[1] as EventListener;
    const hashchangeHandler = addSpy.mock.calls.find(
      ([event]: [string, ...unknown[]]) => event === "hashchange",
    )?.[1] as EventListener;

    unmount();

    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalledWith("popstate", popstateHandler);
      expect(removeSpy).toHaveBeenCalledWith("hashchange", hashchangeHandler);
    });

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

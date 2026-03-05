import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOnMount } from "./use-on-mount";

describe("useOnMount", () => {
  it("calls the callback on mount", async () => {
    const callback = vi.fn();

    renderHook(() => useOnMount(callback));

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call the callback on re-render", async () => {
    const callback = vi.fn();

    const { rerender } = renderHook(() => useOnMount(callback));

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1);
    });

    rerender();
    rerender();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls cleanup function on unmount", async () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);

    const { unmount } = renderHook(() => useOnMount(callback));

    expect(cleanup).not.toHaveBeenCalled();

    unmount();

    await waitFor(() => {
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });
});

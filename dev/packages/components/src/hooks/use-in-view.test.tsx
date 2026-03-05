import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";

import { useInView, type InViewOptions } from "./use-in-view";

interface ObserverEntry {
  isIntersecting: boolean;
  target: Element;
}

type ObserverCallback = (entries: ObserverEntry[], observer?: unknown) => void;

function TestComponent({ options, show = true }: { options?: InViewOptions; show?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(options);

  return (
    <div>
      {show && <div ref={ref} data-testid="target" />}
      <span data-testid="state">{String(inView)}</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as Record<string, any>;

describe("useInView", () => {
  let observerCallback: ObserverCallback | null = null;
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let originalIntersectionObserver: unknown;

  beforeEach(() => {
    observerCallback = null;
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();
    originalIntersectionObserver = globalAny.IntersectionObserver;

    class MockIntersectionObserver {
      constructor(callback: ObserverCallback) {
        observerCallback = callback;
      }
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      takeRecords = vi.fn(() => []);
    }

    globalAny.IntersectionObserver = MockIntersectionObserver;
  });

  afterEach(() => {
    if (originalIntersectionObserver) {
      globalAny.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete globalAny.IntersectionObserver;
    }
  });

  it("sets inView true when the element intersects", async () => {
    render(<TestComponent />);

    expect(screen.getByTestId("state").textContent).toBe("false");

    act(() => {
      observerCallback?.(
        [
          {
            isIntersecting: true,
            target: screen.getByTestId("target"),
          },
        ],
        {},
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("true");
    });

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it("toggles inView when triggerOnce is false", async () => {
    const { unmount } = render(<TestComponent options={{ triggerOnce: false }} />);

    act(() => {
      observerCallback?.(
        [
          {
            isIntersecting: true,
            target: screen.getByTestId("target"),
          },
        ],
        {},
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("true");
    });

    act(() => {
      observerCallback?.(
        [
          {
            isIntersecting: false,
            target: screen.getByTestId("target"),
          },
        ],
        {},
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("false");
    });

    expect(disconnectSpy).toHaveBeenCalledTimes(0);

    unmount();
    await waitFor(() => {
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("starts observing when target mounts after initial render", async () => {
    const { rerender } = render(<TestComponent show={false} />);

    expect(screen.getByTestId("state").textContent).toBe("false");
    expect(observeSpy).not.toHaveBeenCalled();

    rerender(<TestComponent show={true} />);

    expect(observeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      observerCallback?.(
        [
          {
            isIntersecting: true,
            target: screen.getByTestId("target"),
          },
        ],
        {},
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("true");
    });
  });

  it("defaults to inView when IntersectionObserver is unavailable", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const savedObserver = globalAny.IntersectionObserver;
    delete (globalAny as Partial<typeof globalAny>).IntersectionObserver;

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("true");
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    globalAny.IntersectionObserver = savedObserver;
  });
});

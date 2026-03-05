import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { InfiniteMarquee, InfiniteMarqueeRow } from "./InfiniteMarquee";

describe("InfiniteMarquee", () => {
  it("renders items and clones", () => {
    render(
      <InfiniteMarquee gap={16}>
        <InfiniteMarqueeRow>
          <span>企業A</span>
          <span>企業B</span>
          <span>企業C</span>
        </InfiniteMarqueeRow>
      </InfiniteMarquee>,
    );

    const items = document.querySelectorAll("[data-marquee-item]");
    expect(items.length).toBe(6);

    const hiddenClone = document.querySelector(
      '[data-slot="infinite-marquee"] [aria-hidden="true"]',
    );
    expect(hiddenClone).not.toBeNull();
  });

  it("applies gap and padding to the row", () => {
    const { container } = render(
      <InfiniteMarquee gap={20}>
        <InfiniteMarqueeRow>
          <span>要素1</span>
          <span>要素2</span>
        </InfiniteMarqueeRow>
      </InfiniteMarquee>,
    );

    const row = container.querySelector<HTMLElement>(
      '[data-slot="infinite-marquee"] .infinite-marquee-track > div',
    );

    expect(row).not.toBeNull();
    expect(row?.style.gap).toBe("20px");
    expect(row?.style.paddingRight).toBe("20px");
  });

  it("sets animation direction and duration", () => {
    const { container } = render(
      <InfiniteMarquee direction="right" durationSeconds={12}>
        <InfiniteMarqueeRow>
          <span>右向き</span>
        </InfiniteMarqueeRow>
      </InfiniteMarquee>,
    );

    const track = container.querySelector<HTMLElement>(
      '[data-slot="infinite-marquee"] .infinite-marquee-track',
    );

    expect(track).not.toBeNull();
    expect(track?.style.animationDirection).toBe("reverse");
    expect(track?.style.animationDuration).toBe("12s");
  });

  it("returns null when no children", () => {
    const { container } = render(<InfiniteMarquee />);
    expect(container.firstChild).toBeNull();
  });

  it("throws if InfiniteMarqueeRow is used outside", () => {
    expect(() =>
      render(
        <InfiniteMarqueeRow>
          <span>単体</span>
        </InfiniteMarqueeRow>,
      ),
    ).toThrow("InfiniteMarqueeRow must be used within InfiniteMarquee");
  });
});

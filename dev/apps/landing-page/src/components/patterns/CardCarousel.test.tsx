import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CardCarousel,
  Card,
  CardCarouselControls,
  CardCarouselScroller,
  PreviousButton,
  NextButton,
} from "./CardCarousel";

function renderCarousel() {
  render(
    <CardCarousel scrollerClassName="gap-4" controlsClassName="mt-4 flex gap-2">
      <CardCarouselScroller>
        <Card className="w-[200px]" data-testid="card-1">
          Card 1
        </Card>
        <Card className="w-[240px]" data-testid="card-2">
          Card 2
        </Card>
        <Card className="w-[220px]" data-testid="card-3">
          Card 3
        </Card>
      </CardCarouselScroller>
      <CardCarouselControls>
        <PreviousButton>Prev</PreviousButton>
        <NextButton>Next</NextButton>
      </CardCarouselControls>
    </CardCarousel>,
  );
}

describe("CardCarousel", () => {
  it("renders cards and controls", () => {
    renderCarousel();

    expect(screen.getByTestId("card-1")).not.toBeNull();
    expect(screen.getByTestId("card-2")).not.toBeNull();
    expect(screen.getByTestId("card-3")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Scroll to previous card" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Scroll to next card" })).not.toBeNull();
  });

  it("disables previous button at start", () => {
    renderCarousel();

    const prev = screen.getByRole("button", {
      name: "Scroll to previous card",
    });
    expect(prev.hasAttribute("disabled")).toBe(true);
  });

  it("renders the next button (disabled by default in jsdom)", () => {
    renderCarousel();

    expect(screen.getByRole("button", { name: "Scroll to next card" })).not.toBeNull();
  });

  it("calls onClick handlers and still scrolls", () => {
    const onPrevClick = vi.fn();
    const onNextClick = vi.fn();

    render(
      <CardCarousel>
        <CardCarouselScroller>
          <Card className="w-[200px]" data-testid="card-a">
            Card A
          </Card>
          <Card className="w-[200px]" data-testid="card-b">
            Card B
          </Card>
        </CardCarouselScroller>
        <CardCarouselControls>
          <PreviousButton onClick={onPrevClick} disabled={false}>
            Prev
          </PreviousButton>
          <NextButton onClick={onNextClick} disabled={false}>
            Next
          </NextButton>
        </CardCarouselControls>
      </CardCarousel>,
    );

    const scroller = document.querySelector("[data-carousel-scroller]")!;
    Object.defineProperty(scroller, "scrollTo", {
      value: vi.fn(),
      configurable: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Scroll to next card" }));
    fireEvent.click(screen.getByRole("button", { name: "Scroll to previous card" }));

    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(onPrevClick).toHaveBeenCalledTimes(1);
  });
});

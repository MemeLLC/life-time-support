import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface CarouselContextValue {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  scrollerClassName?: string;
  controlsClassName?: string;
  activeIndex: number;
  totalItems: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollToIndex: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export interface CardCarouselProps {
  className?: string;
  scrollerClassName?: string;
  controlsClassName?: string;
  children?: ReactNode;
}

const SCROLL_DURATION_MS = 400;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function CardCarousel({
  className,
  scrollerClassName,
  controlsClassName,
  children,
}: CardCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isAnimating = useRef(false);
  const animationFrame = useRef<number | null>(null);

  const updateScrollBounds = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    setCanScrollPrev(scroller.scrollLeft > 0);
    setCanScrollNext(scroller.scrollLeft < maxScroll - 1);
  }, []);

  const scrollToPosition = useCallback(
    (target: number) => {
      const scroller = scrollerRef.current;
      if (!scroller || !step || totalItems === 0) return;
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      isAnimating.current = true;
      const previousSnap = scroller.style.scrollSnapType;
      const previousBehavior = scroller.style.scrollBehavior;
      scroller.style.scrollSnapType = "none";
      scroller.style.scrollBehavior = "auto";

      const startLeft = scroller.scrollLeft;
      const distance = target - startLeft;
      const clampedIndex = clamp(Math.round(target / step), 0, totalItems - 1);
      setActiveIndex(clampedIndex);

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const duration = prefersReducedMotion ? 0 : SCROLL_DURATION_MS;

      const finish = () => {
        isAnimating.current = false;
        scroller.style.scrollSnapType = previousSnap;
        scroller.style.scrollBehavior = previousBehavior;
        updateScrollBounds();
      };

      if (!distance || duration === 0) {
        scroller.scrollLeft = target;
        finish();
        return;
      }

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeInOutCubic(progress);
        scroller.scrollLeft = startLeft + distance * eased;
        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(tick);
        } else {
          animationFrame.current = null;
          finish();
        }
      };

      animationFrame.current = requestAnimationFrame(tick);
    },
    [step, totalItems, updateScrollBounds],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const measure = () => {
      const cards = Array.from(scroller.querySelectorAll<HTMLElement>("[data-carousel-card]"));
      const firstCard = cards[0];
      const nextTotal = cards.length;
      setTotalItems(nextTotal);

      if (!firstCard) {
        setStep(0);
        setActiveIndex(0);
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }

      const styles = getComputedStyle(scroller);
      const toPixels = (value: string) => {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      };
      const paddingLeft = styles.paddingLeft;
      const paddingRight = styles.paddingRight;
      const scrollPaddingLeft = toPixels(styles.scrollPaddingLeft);
      const scrollPaddingRight = toPixels(styles.scrollPaddingRight);
      const paddingLeftValue = toPixels(paddingLeft);
      const paddingRightValue = toPixels(paddingRight);

      if (paddingLeftValue > 0 && scrollPaddingLeft === 0) {
        scroller.style.scrollPaddingLeft = paddingLeft;
      }
      if (paddingRightValue > 0 && scrollPaddingRight === 0) {
        scroller.style.scrollPaddingRight = paddingRight;
      }

      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      const nextStep = firstCard.getBoundingClientRect().width + gap;
      setStep(nextStep);
      setActiveIndex(clamp(Math.round(scroller.scrollLeft / (nextStep || 1)), 0, nextTotal - 1));
      updateScrollBounds();
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    const firstCard = scroller.querySelector<HTMLElement>("[data-carousel-card]");
    if (firstCard) observer.observe(firstCard);
    return () => observer.disconnect();
  }, [children, updateScrollBounds]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !step) return;

    const handleScroll = () => {
      if (isAnimating.current) return;
      const index = Math.round(scroller.scrollLeft / step);
      setActiveIndex(clamp(index, 0, totalItems - 1));
      updateScrollBounds();
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [step, totalItems, updateScrollBounds]);

  useEffect(() => {
    updateScrollBounds();
  }, [totalItems, updateScrollBounds]);

  useEffect(() => {
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const scrollToIndex = useCallback(
    (nextIndex: number) => {
      const scroller = scrollerRef.current;
      if (!scroller || !step || totalItems === 0) return;
      const clampedIndex = clamp(nextIndex, 0, totalItems - 1);
      scrollToPosition(clampedIndex * step);
    },
    [step, totalItems, scrollToPosition],
  );

  const getNearestIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !step || totalItems === 0) return 0;
    return clamp(Math.round(scroller.scrollLeft / step), 0, totalItems - 1);
  }, [step, totalItems]);

  const contextValue = useMemo(
    () => ({
      scrollerRef,
      scrollerClassName,
      controlsClassName,
      activeIndex,
      totalItems,
      canScrollPrev,
      canScrollNext,
      scrollPrev: () => {
        const scroller = scrollerRef.current;
        if (!scroller || !step) return;
        const currentIndex = getNearestIndex();
        const targetIndex = clamp(currentIndex - 1, 0, totalItems - 1);
        scrollToPosition(targetIndex * step);
      },
      scrollNext: () => {
        const scroller = scrollerRef.current;
        if (!scroller || !step) return;
        const currentIndex = getNearestIndex();
        const targetIndex = clamp(currentIndex + 1, 0, totalItems - 1);
        scrollToPosition(targetIndex * step);
      },
      scrollToIndex,
    }),
    [
      activeIndex,
      totalItems,
      canScrollPrev,
      canScrollNext,
      scrollToIndex,
      scrollToPosition,
      scrollerClassName,
      controlsClassName,
      getNearestIndex,
      step,
    ],
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <section className={className}>{children}</section>
    </CarouselContext.Provider>
  );
}

export type CardCarouselScrollerProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardCarouselScroller({ className, children, ...rest }: CardCarouselScrollerProps) {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("CardCarouselScroller must be used within CardCarousel");
  }

  const classes = [
    "flex snap-x snap-mandatory overflow-x-auto scroll-smooth",
    context.scrollerClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={context.scrollerRef}
      className={classes}
      data-carousel-scroller=""
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export type CardCarouselControlsProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardCarouselControls({ className, children, ...rest }: CardCarouselControlsProps) {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("CardCarouselControls must be used within CardCarousel");
  }

  const classes = [context.controlsClassName, className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      data-carousel-card=""
      className={`shrink-0 snap-start ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export function PreviousButton({ onClick, children, disabled, ...rest }: ButtonProps) {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("PreviousButton must be used within CardCarousel");
  }

  return (
    <button
      type="button"
      aria-label="Scroll to previous card"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.scrollPrev();
      }}
      disabled={disabled ?? !context.canScrollPrev}
      {...rest}
    >
      {children ?? "<"}
    </button>
  );
}

export function NextButton({ onClick, children, disabled, ...rest }: ButtonProps) {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("NextButton must be used within CardCarousel");
  }

  return (
    <button
      type="button"
      aria-label="Scroll to next card"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.scrollNext();
      }}
      disabled={disabled ?? !context.canScrollNext}
      {...rest}
    >
      {children ?? ">"}
    </button>
  );
}

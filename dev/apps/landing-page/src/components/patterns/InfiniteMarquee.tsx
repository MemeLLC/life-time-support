import {
  Children,
  createContext,
  Fragment,
  useContext,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type Direction = "left" | "right";

export interface InfiniteMarqueeProps {
  className?: string;
  direction?: Direction;
  durationSeconds?: number;
  gap?: number | string;
  children?: ReactNode;
}

interface MarqueeContextValue {
  gapValue?: string;
}

const MarqueeContext = createContext<MarqueeContextValue | null>(null);

export function InfiniteMarquee({
  className,
  direction = "left",
  durationSeconds = 24,
  gap,
  children,
}: InfiniteMarqueeProps) {
  const items = useMemo(() => Children.toArray(children).filter(Boolean), [children]);
  const gapValue = typeof gap === "number" ? `${gap}px` : gap;
  const clonedItems = useMemo(
    () => items.map((child, index) => <Fragment key={`clone-${index}`}>{child}</Fragment>),
    [items],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <MarqueeContext.Provider value={{ gapValue }}>
      <div className={`overflow-hidden ${className ?? ""}`.trim()} data-slot="infinite-marquee">
        <div
          className="infinite-marquee-track flex w-max"
          style={{
            animationDuration: `${durationSeconds}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDirection: direction === "right" ? "reverse" : "normal",
          }}
        >
          {items}
          <div aria-hidden="true">{clonedItems}</div>
        </div>
      </div>
    </MarqueeContext.Provider>
  );
}

export type InfiniteMarqueeRowProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function InfiniteMarqueeRow({ className, children, ...rest }: InfiniteMarqueeRowProps) {
  const context = useContext(MarqueeContext);
  if (!context) {
    throw new Error("InfiniteMarqueeRow must be used within InfiniteMarquee");
  }

  const classes = ["flex items-center w-max", className].filter(Boolean).join(" ");
  const style = context.gapValue
    ? { gap: context.gapValue, paddingRight: context.gapValue }
    : undefined;

  return (
    <div className={classes} style={style} {...rest}>
      {Children.map(children, (child, index) => (
        <div key={`marquee-item-${index}`} data-marquee-item="">
          {child}
        </div>
      ))}
    </div>
  );
}

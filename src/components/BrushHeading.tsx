import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "blush" | "ice";

const toneFill: Record<Tone, string> = {
  blush: "fill-blush",
  ice: "fill-ice-blue",
};

/** Ragged, hand-painted brush stroke behind a heading (paint colour from design tokens). */
const BrushHeading = ({
  as = "h2",
  tone,
  children,
  className,
  textClassName,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  tone: Tone;
  children: ReactNode;
  className?: string;
  textClassName?: string;
}) => (
  <div className={cn("relative inline-block px-8 py-3 md:px-12 md:py-4", className)}>
    <svg
      aria-hidden="true"
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      className={cn("absolute inset-0 h-full w-full", toneFill[tone])}
    >
      <path d="M6 9 L18 6 L22 9 L40 4 L64 7 L90 3 L120 6 L150 2 L182 6 L210 3 L246 5 L276 2 L306 6 L338 3 L362 6 L380 4 L392 8 L388 13 L396 18 L390 24 L397 31 L391 37 L398 44 L389 50 L394 55 L374 57 L350 54 L322 58 L292 55 L262 58 L232 54 L200 57 L170 54 L140 58 L110 55 L80 58 L52 54 L30 57 L12 54 L4 50 L9 44 L2 38 L8 31 L1 25 L7 19 L2 13 Z" />
      <path d="M380 10 L399 12 L386 16 Z M2 46 L-1 50 L10 49 Z M120 1 L134 0 L128 3 Z M260 59 L274 60 L268 57 Z" />
    </svg>
    {createElement(
      as,
      { className: cn("relative font-bold leading-normal text-blush-foreground text-3xl md:text-4xl", textClassName) },
      children,
    )}
  </div>
);

export default BrushHeading;

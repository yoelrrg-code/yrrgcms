"use client";

import React from "react";
import { useInView } from "@/hooks/use-in-view";

type RevealAnimation = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "fade";

interface RevealProps {
  children: React.ReactNode;
  /** Animation direction variant. Default: "fade-up" */
  animation?: RevealAnimation;
  /**
   * Stagger delay in ms — applied as CSS transitionDelay.
   * Use index * 120 for natural per-card stagger.
   */
  delay?: number;
  /** Extra className forwarded to the wrapper div */
  className?: string;
  /** HTML tag to use as wrapper. Default: "div" */
  as?: React.ElementType;
  /** Fraction of element visible to trigger. Default: 0.1 */
  threshold?: number;
  /** Fire only once — default false */
  once?: boolean;
}

/**
 * Wraps children in a div that transitions in/out as it enters/leaves the viewport.
 * Uses CSS transitions (not keyframe animations) so it never conflicts with
 * hover effects that also manipulate transform or opacity.
 */
export function Reveal({
  children,
  animation = "fade-up",
  delay,
  className = "",
  as: Tag = "div",
  threshold = 0.05,
  once = false,
}: RevealProps) {
  const { ref, inView } = useInView({ threshold, rootMargin: "0px 0px 0px 0px", once });

  const baseClass = `reveal-${animation}`;
  const visibleClass = inView ? "reveal-visible" : "";

  return (
    <Tag ref={ref} className={className.trim()}>
      <div
        className={`${baseClass} ${visibleClass}`.trim()}
        style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      >
        {children}
      </div>
    </Tag>
  );
}

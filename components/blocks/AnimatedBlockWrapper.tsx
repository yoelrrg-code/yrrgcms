"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedBlockWrapperProps {
  children: React.ReactNode;
  index?: number;
  animation?: "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";
  className?: string;
}

export function AnimatedBlockWrapper({
  children,
  index = 0,
  animation = "fade-up",
  className = "",
}: AnimatedBlockWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const delay = Math.min(index * 120, 480);

  return (
    <div
      ref={ref}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 translate-x-0"
          : animation === "fade-up"
          ? "opacity-0 translate-y-12"
          : animation === "scale-up"
          ? "opacity-0 scale-95"
          : animation === "slide-left"
          ? "opacity-0 -translate-x-12"
          : animation === "slide-right"
          ? "opacity-0 translate-x-12"
          : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

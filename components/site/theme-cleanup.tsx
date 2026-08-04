"use client";

import { useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeCleanup() {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return null;
}

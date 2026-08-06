"use client";

import { useLayoutEffect, useEffect } from "react";
import { useTheme } from "next-themes";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeCleanup() {
  const { setTheme } = useTheme();

  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    try {
      setTheme("light");
    } catch {}
  }, [setTheme]);

  return null;
}

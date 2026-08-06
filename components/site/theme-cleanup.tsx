"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function ThemeCleanup() {
  const { theme, setTheme } = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (theme !== "light") {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        try {
          setTheme("light");
        } catch {}
      }
    }
  }, [theme, setTheme]);

  return null;
}

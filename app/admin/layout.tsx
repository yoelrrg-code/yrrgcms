"use client";

import { useLayoutEffect, useEffect } from "react";
import { useTheme } from "next-themes";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function AdminThemeInitializer() {
  const { setTheme } = useTheme();

  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    try {
      setTheme("dark");
    } catch {}
  }, [setTheme]);

  return null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminThemeInitializer />
      {children}
    </>
  );
}

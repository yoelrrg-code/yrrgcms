"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

function AdminThemeInitializer() {
  const { theme, setTheme } = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (theme !== "dark") {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        try {
          setTheme("dark");
        } catch {}
      }
    }
  }, [theme, setTheme]);

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

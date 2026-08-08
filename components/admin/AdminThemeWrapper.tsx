"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminThemeContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("yrrg_admin_theme") as "dark" | "light" | null;
    const initialTheme = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark", "admin-theme-dark");
      root.classList.remove("light", "admin-theme-light");
    } else {
      root.classList.add("light", "admin-theme-light");
      root.classList.remove("dark", "admin-theme-dark");
    }

    return () => {
      root.classList.remove("admin-theme-dark", "admin-theme-light");
    };
  }, [theme, mounted]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("yrrg_admin_theme", nextTheme);
  };

  const activeTheme = mounted ? theme : "dark";

  return (
    <AdminThemeContext.Provider value={{ theme: activeTheme, toggleTheme }}>
      <div
        className={`admin-dashboard flex w-full min-h-screen transition-colors duration-200 ${
          activeTheme === "dark"
            ? "dark bg-slate-950 text-slate-100"
            : "light bg-slate-100 text-slate-900"
        }`}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

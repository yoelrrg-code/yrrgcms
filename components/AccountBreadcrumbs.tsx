"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronRight, Home, LogOut } from "lucide-react";

interface AccountBreadcrumbsProps {
  customItems?: Array<{ label: string; href?: string }>;
}

export function AccountBreadcrumbs({ customItems }: AccountBreadcrumbsProps) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  
  const segmentsMap: Record<string, string> = {
    "my-account": "My Account",
    "courses": "My Courses",
    "orders": "My Orders & Downloads",
  };

  const breadcrumbs = customItems || pathSegments.map((segment, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    const label = segmentsMap[segment] || segment.replace(/-/g, " ");
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: idx === pathSegments.length - 1 ? undefined : href,
    };
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium">
        <Link
          href="/"
          className="transition flex items-center gap-1 font-medium hover:opacity-70"
          style={{ color: "var(--theme-link, var(--theme-primary, var(--theme-text, inherit)))" }}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        
        {breadcrumbs.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3 w-3 opacity-40 shrink-0" style={{ color: "var(--theme-text, inherit)" }} />
            {item.href ? (
              <Link
                href={item.href}
                className="font-medium transition capitalize hover:opacity-70"
                style={{ color: "var(--theme-link, var(--theme-primary, var(--theme-text, inherit)))" }}
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-bold capitalize" style={{ color: "var(--theme-text, inherit)" }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Log Out</span>
      </button>
    </div>
  );
}

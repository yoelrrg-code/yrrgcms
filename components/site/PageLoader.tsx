"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);

  // Trigger loading screen on initial load & navigation changes
  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept click on internal links to activate loading immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        anchor.target !== "_blank" &&
        href !== pathname
      ) {
        setVisible(true);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`page-loader ${!visible ? "page-loader-hidden" : ""}`}
    >
      {/* Full Screen Loading Animation & Ring */}
      <div className="page-loader-spinner">
        <div className="page-loader-ring" />
        <div className="page-loader-dot" />
      </div>
    </div>
  );
}

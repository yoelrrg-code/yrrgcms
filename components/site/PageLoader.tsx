"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Wait for window.load (all resources including images) to hide the loader
    const hide = () => setVisible(false);

    if (document.readyState === "complete") {
      // Already fully loaded (e.g. hot-reload in dev)
      hide();
    } else {
      window.addEventListener("load", hide);
      return () => window.removeEventListener("load", hide);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="page-loader"
    >
      {/* Spinner */}
      <div className="page-loader-spinner">
        <div className="page-loader-ring" />
        <div className="page-loader-dot" />
      </div>
    </div>
  );
}

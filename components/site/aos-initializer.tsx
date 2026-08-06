"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export function AosInitializer() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: "ease-out-cubic",
      offset: 60,
    });

    AOS.refresh();

    const timer = setTimeout(() => {
      AOS.refreshHard();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

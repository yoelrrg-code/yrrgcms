"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export function AosInitializer() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false, // Set to false so animations can re-trigger on slide changes or scroll up/down
      easing: "ease-out-quad",
    });
  }, []);

  return null;
}

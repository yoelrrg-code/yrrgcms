import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Fraction of the element that must be visible to trigger (0–1). Default: 0.1 */
  threshold?: number;
  /** Extra margin around the root viewport. Default: "0px 0px -40px 0px" */
  rootMargin?: string;
  /** Fire only once — element stays revealed after first intersection. Default: false */
  once?: boolean;
}

/**
 * Returns a ref and a boolean indicating whether the element is in the viewport.
 * Uses the native IntersectionObserver — zero dependencies.
 */
export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  once = false,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

import { useState, useEffect, useRef } from "react";

/**
 * Hook to trigger element visibility and reveal animations when scrolled into viewport.
 *
 * @param {Object} options - IntersectionObserverInit options
 * @param {number} [options.threshold=0.15] - Percentage of target visible before triggering
 * @param {string} [options.rootMargin="0px 0px -40px 0px"] - Margin offset for trigger
 * @param {boolean} [options.triggerOnce=true] - Whether to unobserve after first reveal
 * @returns {[React.RefObject, boolean]} - Ref to attach to element and isVisible state
 */
export function useScrollReveal({
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
  triggerOnce = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback if IntersectionObserver is not supported
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

/**
 * Hook to track scroll progress (0 to 100%) for reading indicator bar.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

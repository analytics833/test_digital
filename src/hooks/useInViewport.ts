"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether an element is within (or near) the viewport, so scroll-driven
 * WebGL render loops can pause entirely once their section is scrolled away.
 * `rootMargin` defaults to a generous pre/post buffer so the scene is already
 * live by the time the section reaches the sticky stage.
 */
export function useInViewport<T extends HTMLElement>(
  ref: RefObject<T | null>,
  rootMargin = "50% 0px 50% 0px",
) {
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isInViewport;
}

/**
 * One-way latch: flips to true the first time the element comes within
 * `rootMargin` of the viewport and stays true. Used to defer mounting heavy
 * WebGL scenes (and their model / texture downloads) until they're needed.
 */
export function useHasBeenNearViewport<T extends HTMLElement>(
  ref: RefObject<T | null>,
  rootMargin = "100% 0px 100% 0px",
) {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isNear) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, isNear]);

  return isNear;
}

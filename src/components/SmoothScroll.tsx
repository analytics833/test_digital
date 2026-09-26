"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isSiteReady, onSiteReady } from "@/lib/siteReady";

/**
 * Bridges Lenis' RAF-driven smooth scroll with GSAP's ScrollTrigger so
 * scrubbed timelines stay in sync with the (non-native) scroll position.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Hold scrolling until the preloader reveals the site.
    if (!isSiteReady()) lenis.stop();
    const stopWaiting = onSiteReady(() => lenis.start());

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      stopWaiting();
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, []);

  return <>{children}</>;
}

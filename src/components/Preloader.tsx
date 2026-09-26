'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { markSiteReady, useLoadProgress, useSiteReady } from '@/lib/siteReady';

// Last-resort reveal if the 3D stage never reports ready (e.g. WebGL fails).
const SAFETY_TIMEOUT_MS = 25000;
const FADE_MS = 700;

/**
 * Full-screen loading screen shown while the shared 3D stage downloads its
 * assets and warms up every scene, so the site is revealed with nothing left
 * to load or compile. Rendered on the server too, so it is the first paint.
 */
export default function Preloader() {
  const progress = useLoadProgress();
  const ready = useSiteReady();
  const [shown, setShown] = useState(0);
  const [isRemoved, setIsRemoved] = useState(false);
  const shownRef = useRef(0);

  // Ease the displayed number toward the real progress. Time-based (not a
  // fixed step per frame) so it keeps pace on slow devices where frames are
  // long while the stage warms up.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const target = ready ? 1 : progress;
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      shownRef.current += (target - shownRef.current) * (1 - Math.exp(-dt * 10));
      if (target - shownRef.current < 0.005) shownRef.current = target;
      setShown(shownRef.current);
      if (shownRef.current < target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, ready]);

  // Lock page scroll while loading.
  useEffect(() => {
    if (ready) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previous;
    };
  }, [ready]);

  useEffect(() => {
    const timer = setTimeout(markSiteReady, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Fade out as soon as the site is ready (the counter jumps to 100), then unmount.
  const isDone = ready;
  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(() => setIsRemoved(true), FADE_MS);
    return () => clearTimeout(timer);
  }, [isDone]);

  if (isRemoved) return null;

  const percent = ready ? 100 : Math.round(shown * 100);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black text-white transition-opacity ease-out"
      style={{ opacity: isDone ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: isDone ? 'none' : 'auto' }}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <Image src="/logoden.svg" alt="Digital Den" width={150} height={30} priority className="opacity-90" />
      <div className="mt-10 font-[family-name:var(--font-space-mono)] text-sm tracking-[0.3em] text-white/70 tabular-nums">
        {String(percent).padStart(3, '0')}
      </div>
      <div className="mt-4 h-px w-40 overflow-hidden bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-teal-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

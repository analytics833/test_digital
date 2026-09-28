'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Calendar, MapPin, Building2, Sparkles } from 'lucide-react';
import { stageSlots, useStageSlot } from '@/components/stage/stageSlots';

interface GatewayVideoSectionProps {
  containerHeight?: string; // e.g. "h-[600vh]"
  onOpenAction?: () => void;
  children?: () => React.ReactNode;
}

/**
 * The "gateway" section: the underwater sequence full-bleed behind the page
 * content, scaling down into a rounded card with the upcoming-event details.
 *
 * The sequence itself is a scroll-scrubbed video on a screen in the shared 3D
 * world (components/stage/videoWorld.ts); the camera docks to this section's
 * card box, so everything here — card scale, radius, border, overlay and
 * content — stays plain HTML layered exactly over it.
 */
export default function GatewayVideoSection({
  containerHeight = 'h-[500vh]',
  onOpenAction,
  children,
}: GatewayVideoSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  useStageSlot('video', cardRef, containerRef);

  useEffect(() => {
    const computeScrollState = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;
      if (totalScrollableHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollableHeight));
      setScrollProgress(progress);
      // The whole sequence plays across 0% to 80% of the section.
      stageSlots.video.progress.current = Math.min(1, progress / 0.8);
    };

    // Coalesce bursts of scroll/resize events into one rect read per frame.
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        computeScrollState();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    computeScrollState();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Dynamic scale-down transition: full-bleed from 0 to 0.78, scales down smoothly into a
  // rounded card from 0.78 to 0.86.
  const scaleProgress = Math.max(0, Math.min(1, (scrollProgress - 0.78) / 0.08));
  const cardScale = 1 - scaleProgress * 0.12;
  const cardRadius = scaleProgress * 36;
  const overlayOpacity = scaleProgress * 0.75;
  const paddingClass = scaleProgress > 0.2 ? 'p-4 sm:p-8' : 'p-0';

  // The video screen's corners follow the card's rendered radius.
  useEffect(() => {
    stageSlots.video.radius.current = cardRadius * cardScale;
  }, [cardRadius, cardScale]);

  // Card content fades in between 0.83 and 0.88, staying fully pinned and readable until 0.99
  const cardTextOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.83) / 0.06));

  // Position mode: fixed while in the section, absolute bottom-0 only when reaching 0.99
  const isPastSequence = scrollProgress >= 0.99;
  const positionClass = isPastSequence ? 'absolute bottom-0 left-0 w-full h-screen' : 'fixed top-0 left-0 w-full h-screen';

  // The page sections rendered here are heavy and don't depend on scroll, so
  // they render once rather than on every scroll-driven re-render.
  const renderedChildren = useMemo(() => children?.(), [children]);

  return (
    <div ref={containerRef} className={`relative w-full ${containerHeight}`}>
      {/* Card frame (100% full-bleed, scales down into a rounded card, scrolls up naturally when the
          section ends). Transparent: the shared stage canvas docks the video screen to the card box. */}
      <div
        className={`${positionClass} overflow-hidden z-0 flex items-center justify-center pointer-events-none transition-all duration-300 ease-out ${paddingClass}`}
      >
        <div
          ref={cardRef}
          className="w-full h-full relative overflow-hidden transition-all duration-300 ease-out"
          style={{
            transform: `scale(${cardScale})`,
            borderRadius: `${cardRadius}px`,
            border: scaleProgress > 0.6 ? '1.5px solid rgba(255, 255, 255, 0.2)' : 'none',
            boxShadow: scaleProgress > 0.6 ? '0 30px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
          }}
        >
          {/* Dark shade overlay over video frame when scaled into card mode */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85 pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />

          {/* Pinned Card Content: Fades in in-place ONLY after FourPillars cards fully exit and video scaling completes */}
          <div
            className="absolute inset-0 z-20 flex flex-col justify-between items-center text-center p-6 sm:p-10 lg:p-12 transition-opacity duration-500 max-w-5xl mx-auto"
            style={{
              opacity: cardTextOpacity,
              pointerEvents: scaleProgress > 0.8 ? 'auto' : 'none',
            }}
          >
            {/* Top & Center Content */}
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4 my-auto pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-xs uppercase tracking-widest text-purple-300">
                  Upcoming Opportunity
                </span>
              </div>

              <h2
                className="font-['Inter',sans-serif] font-medium text-2xl sm:text-4xl lg:text-[46px] leading-[115%] tracking-tight text-center drop-shadow-2xl max-w-3xl"
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 30%, #F3E8FF 45%, #D8B4FE 60%, #C084FC 75%, #A855F7 88%, #7E22CE 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FinTech Innovation Loop Montenegro
              </h2>

              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-xs sm:text-base leading-[24px] text-white/85 max-w-2xl text-center mx-auto drop-shadow-md">
                A sector-focused initiative connecting startups, financial institutions, investors and ecosystem partners around real fintech challenges, pilot opportunities and strategic partnerships.
              </p>

              <div className="pt-2">
                <button
                  onClick={onOpenAction}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 group cursor-pointer border border-purple-400/40"
                >
                  <span>Explore FinTech Opportunities</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Bottom Metadata Specs Row (4 Items matching reference image) */}
            <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/15 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Date</p>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-xs sm:text-sm text-white mt-0.5">23 June 2026</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Location</p>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-xs sm:text-sm text-white mt-0.5">Podgorica, Montenegro</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Ecosystem</p>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-xs sm:text-sm text-white mt-0.5">Banks & Institutions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Target Access</p>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-xs sm:text-sm text-white mt-0.5">Seed & Scaleup Pilots</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Page content sections, scrolling over the video */}
      <div className="relative z-10 w-full">
        {renderedChildren}
      </div>
    </div>
  );
}

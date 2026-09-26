"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useHasBeenNearViewport } from "@/hooks/useInViewport";

const CreativeTransitionScene = dynamic(() => import("./CreativeTransitionScene"), { ssr: false });

export default function CreativeTransitionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const scrollProgress = useRef(0);
  const shouldMountScene = useHasBeenNearViewport(sectionRef);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePos.current = { x, y };
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative z-[25] w-full min-h-[220vh] bg-black select-none -mt-[8.5vw] overflow-visible"
      style={{
        clipPath: "polygon(0 8.5vw, 100% 0, 100% 100%, 0 100%)",
        WebkitClipPath: "polygon(0 8.5vw, 100% 0, 100% 100%, 0 100%)",
      }}
    >
      {/* ─── Pinned 100vh Full Viewport Stage (Clean 100vh inside viewport) ─── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        {/* 3D WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          {shouldMountScene && (
            <CreativeTransitionScene
              sectionRef={sectionRef}
              mousePos={mousePos}
              scrollProgress={scrollProgress}
            />
          )}
        </div>

        {/* ─── Right-Side Information Column (Vertically Centered) ─── */}
        <div className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none">
          <div className="mr-[5vw] sm:mr-[7vw] md:mr-[8vw] max-w-[280px] sm:max-w-xs md:max-w-sm space-y-7 text-neutral-300 font-mono text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider leading-[1.7] drop-shadow-lg">
            <div>
              <p className="text-white font-semibold tracking-widest">
                FOUNDED IN 2012
              </p>
            </div>
            <div>
              <p>
                WE BLEND STORY, ART &amp; TECHNOLOGY AS AN IN-HOUSE TEAM OF PASSIONATE MAKERS
              </p>
            </div>
            <div>
              <p>
                OUR INDUSTRY-LEADING WEB TOOLSET CONSISTENTLY DELIVERS AWARD-WINNING WORK THROUGH QUALITY &amp; PERFORMANCE
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


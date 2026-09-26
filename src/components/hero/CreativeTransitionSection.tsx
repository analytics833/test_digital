"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { stageSlots, useStageSlot } from "@/components/stage/stageSlots";

export default function CreativeTransitionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // The 3D scene is drawn by the shared stage canvas (components/stage) into
  // this section's pinned stage; the section only supplies scroll progress and
  // pointer position.
  useStageSlot("creative", stageRef, sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.0,
      },
      onUpdate: () => {
        stageSlots.creative.progress.current = progress.value;
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    stageSlots.creative.mouse.current = { x, y };
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative z-[25] w-full min-h-[220vh] select-none -mt-[8.5vw] overflow-visible"
      style={{
        clipPath: "polygon(0 8.5vw, 100% 0, 100% 100%, 0 100%)",
        WebkitClipPath: "polygon(0 8.5vw, 100% 0, 100% 100%, 0 100%)",
      }}
    >
      {/* ─── Pinned 100vh Full Viewport Stage (transparent: the shared stage
          canvas behind the page draws the 3D scene here, with the same slant) ─── */}
      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
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


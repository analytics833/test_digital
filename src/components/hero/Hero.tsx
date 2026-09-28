"use client";

import { useRef } from "react";
import { useStageSlot } from "@/components/stage/stageSlots";

/**
 * The 3D emblem hero: the first station of the shared stage world
 * (components/stage/SharedStage), seen through this section's transparent
 * pinned stage. This component only provides the scroll range.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useStageSlot("hero", stageRef, sectionRef);

  return (
    <section ref={sectionRef} className="relative h-[300vh] w-full">
      <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden" />
    </section>
  );
}

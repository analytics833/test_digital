"use client";

import { useEffect } from "react";

/**
 * Parts of the stage that must finish loading before the site is revealed.
 * Each Suspense boundary (and the spine model) marks its part ready when its
 * content has resolved; the stage then warms up all scenes and reveals.
 */
export const STAGE_PARTS = [
  "hero-emblem",
  "hero-env",
  "creative-emblem",
  "creative-text",
  "creative-env",
  "spine",
] as const;

export type StagePart = (typeof STAGE_PARTS)[number];

const readyParts = new Set<StagePart>();

export function markPartReady(part: StagePart) {
  readyParts.add(part);
}

export function readyPartCount() {
  return readyParts.size;
}

/** Place inside a Suspense boundary, after its content, to mark `part` ready. */
export function ReadyMarker({ part }: { part: StagePart }) {
  useEffect(() => {
    markPartReady(part);
  }, [part]);
  return null;
}

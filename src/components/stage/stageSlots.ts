"use client";

import { useLayoutEffect, useSyncExternalStore, type RefObject } from "react";

/**
 * Links the page's DOM sections to the 3D world drawn by the shared stage
 * canvas. Each section registers its section element (whose scroll position
 * drives the camera flight) and its stage element, and shares the live values
 * its station reads (scroll progress, pointer, video card geometry). Values
 * are plain mutable refs so per-frame updates never cause React renders.
 */
type ElementRef = { current: HTMLElement | null };

export const stageSlots = {
  hero: {
    stage: { current: null } as ElementRef,
    section: { current: null } as ElementRef,
  },
  creative: {
    stage: { current: null } as ElementRef,
    section: { current: null } as ElementRef,
    /** Pointer position over the section, in [-1, 1]. */
    mouse: { current: { x: 0, y: 0 } },
    /** Section scroll progress in [0, 1] (scrubbed). */
    progress: { current: 0 },
  },
  spine: {
    stage: { current: null } as ElementRef,
    section: { current: null } as ElementRef,
    /** Smoothed carousel position (float card index). */
    progress: { current: 0 },
  },
  video: {
    /** The (scaling, rounded) card box the video screen is docked to. */
    stage: { current: null } as ElementRef,
    section: { current: null } as ElementRef,
    /** Playback position in [0, 1] (scroll-scrubbed). */
    progress: { current: 0 },
    /** Rendered corner radius of the card, in CSS px. */
    radius: { current: 0 },
  },
};

export type StageSlotId = keyof typeof stageSlots;

let version = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Registers a section's stage and section elements for the shared canvas. */
export function useStageSlot(
  id: StageSlotId,
  stageRef: RefObject<HTMLElement | null>,
  sectionRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const slot = stageSlots[id];
    slot.stage.current = stageRef.current;
    slot.section.current = sectionRef.current;
    version++;
    listeners.forEach((listener) => listener());
    return () => {
      slot.stage.current = null;
      slot.section.current = null;
      version++;
      listeners.forEach((listener) => listener());
    };
  }, [id, stageRef, sectionRef]);
}

/** True once every listed slot has its elements registered. */
export function useSlotsRegistered(ids: StageSlotId[]) {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return ids.every((id) => stageSlots[id].stage.current && stageSlots[id].section.current);
}

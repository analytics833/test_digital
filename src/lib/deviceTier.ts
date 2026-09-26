"use client";

import { useSyncExternalStore } from "react";

/**
 * Rough device capability tier, used to scale the heavy WebGL / media work
 * (pixel ratio, particle counts, post-processing, frame resolution, blur
 * layers) so the site stays usable on low-spec phones and laptops.
 *
 * - "low":  software WebGL, Data Saver / 2G, reduced motion, <=2 cores or
 *           <=2GB RAM, or a small touch device with <=4 cores / <=4GB RAM
 * - "mid":  <=4 cores or <=4GB RAM, or any small touch device
 * - "high": everything else
 *
 * Append `?tier=low|mid|high` to the URL to force a tier while testing.
 */
export type DeviceTier = "low" | "mid" | "high";

let cached: DeviceTier | null = null;

function isSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software/i.test(renderer);
  } catch {
    return true;
  }
}

export function getDeviceTier(): DeviceTier {
  if (cached) return cached;
  if (typeof window === "undefined") return "high";

  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "low" || forced === "mid" || forced === "high") {
    cached = forced;
    return cached;
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;
  const slowNetwork = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallTouch =
    window.matchMedia("(pointer: coarse)").matches &&
    Math.min(window.screen.width, window.screen.height) < 768;

  if (
    saveData ||
    slowNetwork ||
    reducedMotion ||
    cores <= 2 ||
    memory <= 2 ||
    (smallTouch && (cores <= 4 || memory <= 4)) ||
    isSoftwareRenderer()
  ) {
    cached = "low";
  } else if (cores <= 4 || memory <= 4 || smallTouch) {
    cached = "mid";
  } else {
    cached = "high";
  }
  return cached;
}

const noopSubscribe = () => () => {};

/**
 * Hook form for components that render differently per tier. Renders as
 * "high" on the server and during hydration, then switches to the real tier.
 */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(noopSubscribe, getDeviceTier, () => "high");
}

/** Max canvas pixel ratio per tier (full-screen WebGL cost scales with its square). */
export const TIER_MAX_DPR: Record<DeviceTier, number> = { low: 1, mid: 1.25, high: 1.5 };

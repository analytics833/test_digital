"use client";

import { useSyncExternalStore } from "react";

/**
 * Global "site ready" signal plus preload progress. The shared 3D stage
 * reports progress while it downloads assets and warms up its scenes, then
 * marks the site ready; the preloader, the smooth-scroll lock and the hero
 * intro animation all key off this.
 */
let ready = false;
let progress = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isSiteReady() {
  return ready;
}

export function markSiteReady() {
  if (ready) return;
  ready = true;
  progress = 1;
  notify();
}

/** Reports preload progress in [0, 1]; it never moves backwards. */
export function setLoadProgress(value: number) {
  const next = Math.min(1, Math.max(progress, value));
  if (next === progress) return;
  progress = next;
  notify();
}

/** Calls `callback` once the site is ready (immediately if it already is). */
export function onSiteReady(callback: () => void) {
  if (ready) {
    callback();
    return () => {};
  }
  const listener = () => {
    if (!ready) return;
    listeners.delete(listener);
    callback();
  };
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSiteReady() {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}

export function useLoadProgress() {
  return useSyncExternalStore(subscribe, () => progress, () => 0);
}

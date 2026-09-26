"use client";

import { createContext, useContext } from "react";

/**
 * Whether the stage layer a component lives in is currently being drawn. All
 * layers share one render loop, so per-frame work (particle simulation, video
 * texture updates, transmission passes) checks this to skip off-screen scenes.
 * `activeRef` is for useFrame callbacks; `active` is state for render props.
 */
export type LayerState = {
  activeRef: { current: boolean };
  active: boolean;
};

const alwaysActive: LayerState = { activeRef: { current: true }, active: true };

export const LayerContext = createContext<LayerState>(alwaysActive);

export function useLayer() {
  return useContext(LayerContext);
}

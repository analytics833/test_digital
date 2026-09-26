"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { BloomEffect, CopyPass, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { getDeviceTier, TIER_MAX_DPR } from "@/lib/deviceTier";
import { markSiteReady, setLoadProgress } from "@/lib/siteReady";
import { LayerContext } from "./layerContext";
import { markPartReady, readyPartCount, STAGE_PARTS } from "./readiness";
import { stageSlots, useSlotsRegistered, type StageSlotId } from "./stageSlots";
import { createSpineWorld } from "./spineWorld";
import { SceneRig } from "@/components/hero/SceneRig";
import { CreativeWorld } from "@/components/hero/CreativeTransitionScene";

/**
 * One WebGL canvas for the whole page (instead of one per section).
 *
 * Each 3D section (hero, creative transition, spine carousel) is a "layer":
 * its own THREE.Scene + camera rendered into its own render target, then
 * composited into the on-screen rect of that section's stage element, with the
 * section's clip shape (the creative section's slanted top edge, the carousel's
 * curtain reveal). Layers share the renderer, compiled shaders and uploaded
 * assets (the emblem model, glow video and HDR are processed once), and only
 * visible layers render.
 *
 * Before the site is revealed everything is loaded and each layer is rendered
 * a few times (compiling every shader variant) behind the preloader, so nothing
 * loads or compiles while scrolling.
 */

const tier = getDeviceTier();

type MaskKind = "none" | "slant" | "curtain";

type LayerHandle = {
  id: StageSlotId;
  order: number;
  mask: MaskKind;
  /** 0 = none (linear -> sRGB only), 1 = ACES filmic */
  toneMapping: 0 | 1;
  exposure: number;
  target: THREE.WebGLRenderTarget;
  render: (gl: THREE.WebGLRenderer, time: number) => void;
  resize: (width: number, height: number, bufferWidth: number, bufferHeight: number) => void;
  setActive: (active: boolean) => void;
};

type Director = {
  register: (layer: LayerHandle) => () => void;
};

const DirectorContext = createContext<Director | null>(null);

// Slant of the creative section's top edge: clip-path polygon(0 8.5vw, 100% 0, ...)
const CREATIVE_SLANT_VW = 0.085;
// Give up waiting for assets after this long and reveal anyway.
const PRELOAD_TIMEOUT_MS = 20000;
// Frames rendered for every layer during warm-up (compiles all shader variants,
// including the transmission and bloom passes, and uploads all textures).
const WARMUP_FRAMES = 3;

const compositeVertex = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const compositeFragment = /* glsl */ `
uniform sampler2D uTexture;
uniform vec4 uRect;       // stage rect in buffer px: x, y (from top), width, height
uniform vec2 uBuffer;     // drawing buffer size in px
uniform float uClipTop;   // buffer px from top; nothing above this is drawn
uniform vec3 uSlant;      // top edge y at the left / right (buffer px from top), enabled
uniform int uToneMapping;
uniform float uExposure;

vec3 RRTAndODTFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}

// ACES filmic, as in three.js' ACESFilmicToneMapping
vec3 acesFilmic(vec3 color) {
  const mat3 inputMat = mat3(
    vec3(0.59719, 0.07600, 0.02840),
    vec3(0.35458, 0.90834, 0.13383),
    vec3(0.04823, 0.01566, 0.83777)
  );
  const mat3 outputMat = mat3(
    vec3( 1.60475, -0.10208, -0.00327),
    vec3(-0.53108,  1.10813, -0.07276),
    vec3(-0.07367, -0.00605,  1.07602)
  );
  color *= 1.0 / 0.6;
  color = inputMat * color;
  color = RRTAndODTFit(color);
  color = outputMat * color;
  return clamp(color, 0.0, 1.0);
}

vec3 linearToSRGB(vec3 c) {
  return mix(c * 12.92, pow(c, vec3(0.41666)) * 1.055 - 0.055, step(0.0031308, c));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uBuffer.y - gl_FragCoord.y);
  vec2 uv = (p - uRect.xy) / uRect.zw;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
  if (p.y < uClipTop) discard;
  if (uSlant.z > 0.5 && p.y < mix(uSlant.x, uSlant.y, p.x / uBuffer.x)) discard;

  vec3 color = texture2D(uTexture, vec2(uv.x, 1.0 - uv.y)).rgb * uExposure;
  if (uToneMapping == 1) color = acesFilmic(color);
  gl_FragColor = vec4(linearToSRGB(clamp(color, 0.0, 1.0)), 1.0);
}
`;

/** Fullscreen quad that composites one layer's target into the canvas. */
function createComposite() {
  const material = new THREE.ShaderMaterial({
    vertexShader: compositeVertex,
    fragmentShader: compositeFragment,
    uniforms: {
      uTexture: { value: null },
      uRect: { value: new THREE.Vector4() },
      uBuffer: { value: new THREE.Vector2() },
      uClipTop: { value: 0 },
      uSlant: { value: new THREE.Vector3() },
      uToneMapping: { value: 0 },
      uExposure: { value: 1 },
    },
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return { scene, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), material, mesh };
}

function createLayerTarget() {
  return new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  });
}

/** Tracks whether the React state flag changed, so setActive only re-renders on change. */
function useActiveState() {
  const activeRef = useRef(false);
  const [active, setActiveState] = useState(false);
  const setActive = useCallback((next: boolean) => {
    if (activeRef.current === next) return;
    activeRef.current = next;
    setActiveState(next);
  }, []);
  return { activeRef, active, setActive };
}

/**
 * A layer whose content is React Three Fiber children, portalled into the
 * layer's own scene and camera (so useThree/useFrame inside see them).
 */
function PortalLayer({
  id,
  order,
  mask,
  fov,
  position,
  bloom,
  children,
}: {
  id: StageSlotId;
  order: number;
  mask: MaskKind;
  fov: number;
  position: [number, number, number];
  bloom?: { intensity: number; luminanceThreshold: number; luminanceSmoothing: number };
  children: ReactNode;
}) {
  const gl = useThree((state) => state.gl);
  const director = useContext(DirectorContext)!;
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    cam.position.set(...position);
    return cam;
    // Camera settings are fixed for the lifetime of the layer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { activeRef, active, setActive } = useActiveState();

  useLayoutEffect(() => {
    const target = createLayerTarget();
    let composer: EffectComposer | null = null;
    if (bloom) {
      composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
      composer.autoRenderToScreen = false;
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new EffectPass(camera, new BloomEffect({ ...bloom, mipmapBlur: true })));
      composer.addPass(new CopyPass(target, false));
    }

    const unregister = director.register({
      id,
      order,
      mask,
      toneMapping: 0,
      exposure: 1,
      target,
      render: (renderer) => {
        if (composer) {
          composer.render();
        } else {
          renderer.setRenderTarget(target);
          renderer.clear();
          renderer.render(scene, camera);
        }
      },
      resize: (width, height, bufferWidth, bufferHeight) => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        target.setSize(bufferWidth, bufferHeight);
        // width/height are the canvas' own CSS size, so this only resizes the
        // composer's buffers (it would resize the canvas for any other size).
        composer?.setSize(width, height);
      },
      setActive,
    });

    return () => {
      unregister();
      composer?.dispose();
      target.dispose();
    };
    // The layer's pipeline is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <LayerContext.Provider value={{ activeRef, active }}>{children}</LayerContext.Provider>,
    scene,
    { camera },
  );
}

/** The spine carousel background: a plain three.js world (see spineWorld.ts). */
function SpineLayer({ order }: { order: number }) {
  const director = useContext(DirectorContext)!;
  const size = useThree((state) => state.size);
  const { setActive } = useActiveState();

  useLayoutEffect(() => {
    const target = createLayerTarget();
    const world = createSpineWorld({
      progressRef: stageSlots.spine.progress,
      width: size.width,
      height: size.height,
      onReady: () => markPartReady("spine"),
    });

    const unregister = director.register({
      id: "spine",
      order,
      mask: "curtain",
      toneMapping: 1,
      exposure: 1.05,
      target,
      render: (renderer, time) => {
        world.update(time);
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.render(world.scene, world.camera);
      },
      resize: (width, height, bufferWidth, bufferHeight) => {
        world.setSize(width, height);
        target.setSize(bufferWidth, bufferHeight);
      },
      setActive,
    });

    return () => {
      unregister();
      world.dispose();
      target.dispose();
    };
    // Built once; later size changes arrive through resize().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

type Phase = "loading" | "warming" | "running";

function DirectorProvider({ children }: { children: ReactNode }) {
  const layersRef = useRef<LayerHandle[]>([]);
  const gl = useThree((state) => state.gl);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const phaseRef = useRef<Phase>("loading");
  const warmFramesRef = useRef(0);
  const startedAtRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, bufferWidth: 0, bufferHeight: 0 });
  const drewLastFrameRef = useRef(false);
  const idleRef = useRef(false);
  const assets = useProgress();

  const director = useMemo<Director>(
    () => ({
      register: (layer) => {
        layersRef.current = [...layersRef.current, layer].sort((a, b) => a.order - b.order);
        // Force a resize for the new layer on the next frame.
        sizeRef.current = { width: 0, height: 0, bufferWidth: 0, bufferHeight: 0 };
        return () => {
          layersRef.current = layersRef.current.filter((l) => l !== layer);
        };
      },
    }),
    [],
  );

  const compositeRef = useRef<ReturnType<typeof createComposite> | null>(null);

  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    startedAtRef.current = performance.now();
    const composite = createComposite();
    compositeRef.current = composite;
    return () => {
      compositeRef.current = null;
      composite.material.dispose();
      composite.mesh.geometry.dispose();
    };
  }, [gl]);

  // Loading progress for the preloader: asset downloads + resolved scene parts.
  useEffect(() => {
    if (phaseRef.current !== "loading") return;
    const assetShare = assets.total > 0 ? assets.loaded / assets.total : 0;
    const partShare = readyPartCount() / STAGE_PARTS.length;
    setLoadProgress(0.9 * (0.5 * assetShare + 0.5 * partShare));
  }, [assets.loaded, assets.total]);

  // Wake the (idle) render loop whenever a stage element nears the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && idleRef.current) {
        idleRef.current = false;
        setFrameloop("always");
      }
    });
    (["hero", "creative", "spine"] as const).forEach((id) => {
      const el = stageSlots[id].stage.current;
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [setFrameloop]);

  useFrame((state) => {
    const gl = state.gl;
    const composite = compositeRef.current;
    if (!composite) return;
    const layers = layersRef.current;
    const dpr = gl.getPixelRatio();
    const width = state.size.width;
    const height = state.size.height;
    const bufferWidth = Math.round(width * dpr);
    const bufferHeight = Math.round(height * dpr);

    // Resize layer targets / cameras when the canvas size changes.
    const size = sizeRef.current;
    if (size.width !== width || size.height !== height || size.bufferWidth !== bufferWidth) {
      sizeRef.current = { width, height, bufferWidth, bufferHeight };
      layers.forEach((layer) => layer.resize(width, height, bufferWidth, bufferHeight));
    }

    // ── Preload state machine ──
    if (phaseRef.current === "loading") {
      const partsReady = readyPartCount() >= STAGE_PARTS.length;
      const assetsDone = !assets.active && assets.loaded >= assets.total;
      const timedOut = performance.now() - startedAtRef.current > PRELOAD_TIMEOUT_MS;
      if ((partsReady && assetsDone && layers.length === 3) || timedOut) {
        phaseRef.current = "warming";
        warmFramesRef.current = 0;
      }
    }
    const warming = phaseRef.current === "warming";

    // ── Per-layer visibility and clip ──
    const vw = window.innerWidth;
    type Draw = { layer: LayerHandle; rect: DOMRect; clipTop: number; slant: [number, number] | null };
    const draws: Draw[] = [];
    let anyStageOnScreen = false;
    for (const layer of layers) {
      const slot = stageSlots[layer.id];
      const stage = slot.stage.current;
      if (!stage) {
        layer.setActive(false);
        continue;
      }
      const rect = stage.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < height) anyStageOnScreen = true;
      let clipTop = rect.top;
      let slant: [number, number] | null = null;

      if (layer.mask === "curtain") {
        const raw = stageSlots.spine.curtain.current;
        const p = raw >= 0.998 ? 1 : raw <= 0.002 ? 0 : raw;
        clipTop = rect.top + (1 - p) * rect.height;
      } else if (layer.mask === "slant") {
        const sectionTop = slot.section.current?.getBoundingClientRect().top ?? rect.top;
        slant = [sectionTop + CREATIVE_SLANT_VW * vw, sectionTop];
        clipTop = Math.max(clipTop, sectionTop);
      }

      const visibleTop = Math.max(clipTop, 0);
      const visibleBottom = Math.min(rect.bottom, height);
      const visible = visibleBottom > visibleTop && rect.right > 0 && rect.left < width;
      layer.setActive(visible || warming);
      if (visible || warming) draws.push({ layer, rect, clipTop, slant });
    }

    // ── Render layers into their targets ──
    const time = state.clock.elapsedTime;
    for (const { layer } of draws) layer.render(gl, time);

    // ── Composite into the canvas ──
    gl.setRenderTarget(null);
    const autoClear = gl.autoClear;
    gl.autoClear = false;
    gl.setClearColor(0x000000, 0);
    gl.clear();
    const u = composite.material.uniforms;
    u.uBuffer.value.set(bufferWidth, bufferHeight);
    for (const { layer, rect, clipTop, slant } of warming ? [] : draws) {
      u.uTexture.value = layer.target.texture;
      u.uRect.value.set(rect.left * dpr, rect.top * dpr, rect.width * dpr, rect.height * dpr);
      u.uClipTop.value = clipTop * dpr;
      if (slant) u.uSlant.value.set(slant[0] * dpr, slant[1] * dpr, 1);
      else u.uSlant.value.set(0, 0, 0);
      u.uToneMapping.value = layer.toneMapping;
      u.uExposure.value = layer.exposure;
      gl.render(composite.scene, composite.camera);
    }
    gl.autoClear = autoClear;

    if (warming) {
      warmFramesRef.current++;
      setLoadProgress(0.9 + (0.1 * warmFramesRef.current) / WARMUP_FRAMES);
      if (warmFramesRef.current >= WARMUP_FRAMES) {
        phaseRef.current = "running";
        markSiteReady();
      }
      return;
    }

    // ── Idle once no stage is on screen (the observer above wakes the loop).
    // A stage can be on screen with nothing to draw yet (the carousel before
    // its curtain rises), so this checks the stage rects, not the draw list.
    // The frame after the last draw has already cleared the canvas.
    if (!anyStageOnScreen && !drewLastFrameRef.current && phaseRef.current === "running") {
      idleRef.current = true;
      setFrameloop("never");
    }
    drewLastFrameRef.current = draws.length > 0;
  }, 1);

  return <DirectorContext.Provider value={director}>{children}</DirectorContext.Provider>;
}

export default function SharedStage() {
  const registered = useSlotsRegistered(["hero", "creative", "spine"]);

  return (
    <div className="fixed inset-0 z-[5] pointer-events-none" aria-hidden="true">
      {registered && (
        <Canvas
          dpr={[1, TIER_MAX_DPR[tier]]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop="always"
        >
          <DirectorProvider>
            <PortalLayer id="hero" order={0} mask="none" fov={32} position={[0, 0.3, 8.5]}
              bloom={tier === "low" ? undefined : { intensity: 0.9, luminanceThreshold: 0.25, luminanceSmoothing: 0.4 }}
            >
              <color attach="background" args={["#000000"]} />
              <SceneRig triggerRef={stageSlots.hero.section} />
            </PortalLayer>
            <PortalLayer id="creative" order={1} mask="slant" fov={38} position={[0, 0, 4.4]}
              bloom={tier === "low" ? undefined : { intensity: 0.4, luminanceThreshold: 0.98, luminanceSmoothing: 0.2 }}
            >
              <CreativeWorld />
            </PortalLayer>
            <SpineLayer order={2} />
          </DirectorProvider>
        </Canvas>
      )}
    </div>
  );
}

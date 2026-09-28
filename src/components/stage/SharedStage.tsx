"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { markSiteReady, onSiteReady, setLoadProgress } from "@/lib/siteReady";
import { LayerContext } from "./layerContext";
import { markPartReady, readyPartCount, STAGE_PARTS } from "./readiness";
import { stageSlots, useSlotsRegistered } from "./stageSlots";
import { createSpineWorld } from "./spineWorld";
import { createVideoWorld } from "./videoWorld";
import {
  createPose,
  dockedPose,
  flightPose,
  offsetPose,
  staticPose,
  STATIONS,
  type Pose,
} from "./cameraPath";
import { SceneRig } from "@/components/hero/SceneRig";
import { CreativeWorld } from "@/components/hero/CreativeTransitionScene";

/**
 * One WebGL canvas and one camera for the whole page's 3D world.
 *
 * The world has four stations — hero emblem, creative scene, spine carousel,
 * video screen — and scrolling flies a single camera between them (see
 * cameraPath.ts). Each station is its own scene ("layer") so it keeps its own
 * lights, fog and environment; every visible layer renders with the shared
 * camera into its own render target, and the targets are composited
 * (premultiplied alpha) into the canvas. Layers share the renderer, compiled
 * shaders and uploaded assets, only visible layers render, and the loop idles
 * when the world is off screen (behind the HTML sections further down).
 *
 * Before the site is revealed everything is loaded and the camera visits
 * every station for a few frames (compiling every shader variant) behind the
 * preloader, so nothing loads or compiles while scrolling. The gateway video
 * itself downloads in the background once the visitor reaches the carousel.
 */

const tier = getDeviceTier();

type LayerId = "hero" | "creative" | "spine" | "video";

/** How the compositor outputs a layer: 0 = linear -> sRGB, 1 = ACES + sRGB, 2 = passthrough. */
type OutputMode = 0 | 1 | 2;

type LayerHandle = {
  id: LayerId;
  order: number;
  outputMode: OutputMode;
  exposure: number;
  target: THREE.WebGLRenderTarget;
  /** Per-frame work before the camera pose is computed (active layers only). */
  update?: (time: number) => void;
  /** For stations that animate their own camera (the spine). */
  stationCamera?: THREE.PerspectiveCamera;
  render: (gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) => void;
  resize: (width: number, height: number, bufferWidth: number, bufferHeight: number) => void;
  setActive: (active: boolean) => void;
};

/** The shared flying camera is the canvas' own (R3F root) camera. */
type Director = {
  register: (layer: LayerHandle) => () => void;
};

const DirectorContext = createContext<Director | null>(null);

const LAYER_COUNT = 4;
// Give up waiting for assets after this long and reveal anyway.
const PRELOAD_TIMEOUT_MS = 20000;
// Warm-up frames: the camera cycles through the stations (twice), rendering
// every layer each frame, so all shader variants — including the glass
// transmission and bloom passes — compile and all textures upload.
const WARMUP_STATIONS: LayerId[] = ["hero", "creative", "spine", "video"];
const WARMUP_FRAMES = WARMUP_STATIONS.length * 2;

const compositeVertex = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const compositeFragment = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uBuffer;
uniform int uOutputMode;
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
  vec4 texel = texture2D(uTexture, gl_FragCoord.xy / uBuffer);
  vec3 color = texel.rgb;
  if (uOutputMode != 2) {
    color *= uExposure;
    if (uOutputMode == 1) color = acesFilmic(color);
    color = linearToSRGB(clamp(color, 0.0, 1.0));
  }
  // Premultiplied: solid pixels (alpha 1) cover what's below, glow in empty
  // pixels (alpha 0, e.g. bloom) adds on top.
  gl_FragColor = vec4(color, clamp(texel.a, 0.0, 1.0));
}
`;

/** Fullscreen quad that composites one layer's target into the canvas. */
function createComposite() {
  const material = new THREE.ShaderMaterial({
    vertexShader: compositeVertex,
    fragmentShader: compositeFragment,
    uniforms: {
      uTexture: { value: null },
      uBuffer: { value: new THREE.Vector2() },
      uOutputMode: { value: 0 },
      uExposure: { value: 1 },
    },
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
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
 * A station whose content is React Three Fiber children, portalled into the
 * layer's own scene (placed at the station's world offset) with the shared
 * camera, so useThree/useFrame inside see both.
 */
function PortalLayer({
  id,
  order,
  station,
  bloom,
  children,
}: {
  id: LayerId;
  order: number;
  station: THREE.Vector3;
  bloom?: { intensity: number; luminanceThreshold: number; luminanceSmoothing: number };
  children: ReactNode;
}) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const director = useContext(DirectorContext)!;
  const scene = useMemo(() => {
    const s = new THREE.Scene();
    s.position.copy(station);
    return s;
    // The station offset is fixed for the lifetime of the layer.
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
      outputMode: 0,
      exposure: 1,
      target,
      render: (renderer, cam) => {
        if (composer) {
          composer.render();
        } else {
          renderer.setRenderTarget(target);
          renderer.clear();
          renderer.render(scene, cam);
        }
      },
      resize: (width, height, bufferWidth, bufferHeight) => {
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

/** The spine station: a plain three.js world (see spineWorld.ts). */
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
    world.scene.position.copy(STATIONS.spine);

    const unregister = director.register({
      id: "spine",
      order,
      outputMode: 1,
      exposure: 1.05,
      target,
      stationCamera: world.camera,
      update: (time) => world.update(time),
      render: (renderer, camera) => {
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.render(world.scene, camera);
      },
      resize: (width, height, bufferWidth, bufferHeight) => {
        target.setSize(bufferWidth, bufferHeight);
      },
      setActive,
    });

    return () => {
      unregister();
      world.dispose();
      target.dispose();
    };
    // Built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/** The gateway station: the scroll-scrubbed video screen (see videoWorld.ts). */
function VideoLayer({ order }: { order: number }) {
  const director = useContext(DirectorContext)!;
  const { setActive } = useActiveState();

  useLayoutEffect(() => {
    const target = createLayerTarget();
    const world = createVideoWorld({ lowRes: tier === "low" });
    world.scene.position.copy(STATIONS.video);
    // Download the video once the visitor reaches the spine carousel (after the
    // reveal): its ~900vh of scroll leaves plenty of time, and visitors who
    // never get that far don't pay for it.
    let observer: IntersectionObserver | null = null;
    const stopWaiting = onSiteReady(() => {
      const spineSection = stageSlots.spine.section.current;
      if (!spineSection) {
        world.load();
        return;
      }
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer?.disconnect();
        world.load();
      });
      observer.observe(spineSection);
    });

    const unregister = director.register({
      id: "video",
      order,
      outputMode: 2,
      exposure: 1,
      target,
      update: () => {
        world.setProgress(stageSlots.video.progress.current);
        const card = stageSlots.video.stage.current;
        if (card) {
          const rect = card.getBoundingClientRect();
          const height = Math.max(rect.height, 1);
          world.layout(rect.width / height, stageSlots.video.radius.current / height);
        }
      },
      render: (renderer, camera) => {
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.render(world.scene, camera);
      },
      resize: (_width, _height, bufferWidth, bufferHeight) => {
        target.setSize(bufferWidth, bufferHeight);
      },
      setActive,
    });

    return () => {
      stopWaiting();
      observer?.disconnect();
      unregister();
      world.dispose();
      target.dispose();
    };
    // Built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

type Phase = "loading" | "warming" | "running";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function DirectorProvider({ children }: { children: ReactNode }) {
  const layersRef = useRef<LayerHandle[]>([]);
  const gl = useThree((state) => state.gl);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const phaseRef = useRef<Phase>("loading");
  const warmFramesRef = useRef(0);
  const startedAtRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, bufferWidth: 0 });
  const drewLastFrameRef = useRef(false);
  const idleRef = useRef(false);
  const compositeRef = useRef<ReturnType<typeof createComposite> | null>(null);
  const posesRef = useRef({ from: createPose(), to: createPose(), out: createPose() });
  // Layers the rig marked visible this frame; the compositor renders these.
  const activeIdsRef = useRef(new Set<LayerId>());
  const assets = useProgress();

  const director = useMemo<Director>(
    () => ({
      register: (layer) => {
        layersRef.current = [...layersRef.current, layer].sort((a, b) => a.order - b.order);
        // Force a resize for the new layer on the next frame.
        sizeRef.current = { width: 0, height: 0, bufferWidth: 0 };
        return () => {
          layersRef.current = layersRef.current.filter((l) => l !== layer);
        };
      },
    }),
    [],
  );

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

  // Wake the (idle) render loop whenever a world section nears the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && idleRef.current) {
        idleRef.current = false;
        setFrameloop("always");
      }
    });
    (["hero", "creative", "spine", "video"] as const).forEach((id) => {
      const el = stageSlots[id].section.current;
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [setFrameloop]);

  /** Camera pose at a station (for warm-up and flight endpoints). */
  const stationPose = (id: LayerId, width: number, height: number, out: Pose): Pose => {
    switch (id) {
      case "hero":
        return staticPose(STATIONS.hero, [0, 0.3, 8.5], 32, out);
      case "creative":
        return staticPose(STATIONS.creative, [0, 0, 4.4], 38, out);
      case "spine": {
        const cam = layersRef.current.find((l) => l.id === "spine")?.stationCamera;
        return cam ? offsetPose(STATIONS.spine, cam, out) : staticPose(STATIONS.spine, [0, 0, 26], 45, out);
      }
      case "video": {
        const card = stageSlots.video.stage.current;
        const rect = card ? card.getBoundingClientRect() : new DOMRect(0, 0, width, height);
        return dockedPose(rect, width, height, out);
      }
    }
  };

  const applyPose = (camera: THREE.PerspectiveCamera, pose: Pose, aspect: number) => {
    camera.position.copy(pose.position);
    camera.quaternion.copy(pose.quaternion);
    if (camera.fov !== pose.fov || camera.aspect !== aspect) {
      camera.fov = pose.fov;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  };

  // ── Camera rig: runs before the stations' own frame callbacks (priority -1),
  // so particle simulation and glass transmission passes see this frame's camera.
  useFrame((state) => {
    const layers = layersRef.current;
    const { width, height } = state.size;
    const aspect = width / height;
    const time = state.clock.elapsedTime;
    const poses = posesRef.current;
    const camera = state.camera as THREE.PerspectiveCamera;

    // ── Preload state machine ──
    if (phaseRef.current === "loading") {
      const partsReady = readyPartCount() >= STAGE_PARTS.length;
      const assetsDone = !assets.active && assets.loaded >= assets.total;
      const timedOut = performance.now() - startedAtRef.current > PRELOAD_TIMEOUT_MS;
      if ((partsReady && assetsDone && layers.length === LAYER_COUNT) || timedOut) {
        phaseRef.current = "warming";
        warmFramesRef.current = 0;
      }
    }

    if (phaseRef.current === "warming") {
      layers.forEach((layer) => {
        layer.setActive(true);
        layer.update?.(time);
      });
      const station = WARMUP_STATIONS[warmFramesRef.current % WARMUP_STATIONS.length];
      applyPose(camera, stationPose(station, width, height, poses.out), aspect);
      return;
    }

    // ── Flight progress from the sections' scroll positions ──
    const creative = stageSlots.creative.section.current?.getBoundingClientRect();
    const spine = stageSlots.spine.section.current?.getBoundingClientRect();
    const video = stageSlots.video.section.current?.getBoundingClientRect();
    if (!creative || !spine || !video) return;

    // hero → creative while the creative section rises into view,
    // creative → spine over the first screen of the carousel section,
    // spine → video while the video section rises into view.
    const toCreative = clamp01((height - creative.top) / height);
    const toSpine = clamp01(-spine.top / height);
    const toVideo = clamp01((height - video.top) / height);

    const active: Record<LayerId, boolean> = {
      hero: toCreative < 1,
      creative: toCreative > 0 && toSpine < 1,
      spine: toSpine > 0 && toVideo < 1,
      video: toVideo > 0 && video.bottom > 0,
    };
    activeIdsRef.current.clear();
    for (const layer of layers) {
      layer.setActive(active[layer.id]);
      if (active[layer.id]) {
        activeIdsRef.current.add(layer.id);
        layer.update?.(time);
      }
    }

    let pose: Pose;
    if (toCreative < 1) {
      pose = flightPose(
        stationPose("hero", width, height, poses.from),
        stationPose("creative", width, height, poses.to),
        toCreative,
        poses.out,
      );
    } else if (toSpine <= 0) {
      pose = stationPose("creative", width, height, poses.out);
    } else if (toSpine < 1) {
      pose = flightPose(
        stationPose("creative", width, height, poses.from),
        stationPose("spine", width, height, poses.to),
        toSpine,
        poses.out,
      );
    } else if (toVideo <= 0) {
      pose = stationPose("spine", width, height, poses.out);
    } else if (toVideo < 1) {
      pose = flightPose(
        stationPose("spine", width, height, poses.from),
        stationPose("video", width, height, poses.to),
        toVideo,
        poses.out,
      );
    } else {
      pose = stationPose("video", width, height, poses.out);
    }
    applyPose(camera, pose, aspect);
  }, -1);

  // ── Render active layers and composite them (priority 1: takes over rendering) ──
  useFrame((state) => {
    const composite = compositeRef.current;
    if (!composite) return;
    const renderer = state.gl;
    const layers = layersRef.current;
    const dpr = renderer.getPixelRatio();
    const { width, height } = state.size;
    const bufferWidth = Math.round(width * dpr);
    const bufferHeight = Math.round(height * dpr);

    const size = sizeRef.current;
    if (size.width !== width || size.height !== height || size.bufferWidth !== bufferWidth) {
      sizeRef.current = { width, height, bufferWidth };
      layers.forEach((layer) => layer.resize(width, height, bufferWidth, bufferHeight));
    }

    const warming = phaseRef.current === "warming";
    const drawn = layers.filter((layer) => warming || activeIdsRef.current.has(layer.id));
    for (const layer of drawn) layer.render(renderer, state.camera as THREE.PerspectiveCamera);

    renderer.setRenderTarget(null);
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    const u = composite.material.uniforms;
    u.uBuffer.value.set(bufferWidth, bufferHeight);
    if (!warming) {
      for (const layer of drawn) {
        u.uTexture.value = layer.target.texture;
        u.uOutputMode.value = layer.outputMode;
        u.uExposure.value = layer.exposure;
        renderer.render(composite.scene, composite.camera);
      }
    }
    renderer.autoClear = autoClear;

    if (warming) {
      warmFramesRef.current++;
      setLoadProgress(0.9 + (0.1 * warmFramesRef.current) / WARMUP_FRAMES);
      if (warmFramesRef.current >= WARMUP_FRAMES) {
        phaseRef.current = "running";
        markSiteReady();
      }
      return;
    }

    // ── Idle once the world is off screen (the observer above wakes the loop).
    // The frame after the last draw has already cleared the canvas.
    if (drawn.length === 0 && !drewLastFrameRef.current && phaseRef.current === "running") {
      idleRef.current = true;
      setFrameloop("never");
    }
    drewLastFrameRef.current = drawn.length > 0;
  }, 1);

  return <DirectorContext.Provider value={director}>{children}</DirectorContext.Provider>;
}

export default function SharedStage() {
  const registered = useSlotsRegistered(["hero", "creative", "spine", "video"]);

  return (
    <div className="fixed inset-0 z-[5] pointer-events-none" aria-hidden="true">
      {registered && (
        <Canvas
          dpr={[1, TIER_MAX_DPR[tier]]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 32, near: 0.1, far: 400, position: [0, 0.3, 8.5] }}
          frameloop="always"
        >
          <DirectorProvider>
            <PortalLayer id="hero" order={0} station={STATIONS.hero}
              bloom={tier === "low" ? undefined : { intensity: 0.9, luminanceThreshold: 0.25, luminanceSmoothing: 0.4 }}
            >
              <SceneRig triggerRef={stageSlots.hero.section} />
            </PortalLayer>
            <PortalLayer id="creative" order={1} station={STATIONS.creative}
              bloom={tier === "low" ? undefined : { intensity: 0.4, luminanceThreshold: 0.98, luminanceSmoothing: 0.2 }}
            >
              <CreativeWorld />
            </PortalLayer>
            <SpineLayer order={2} />
            <VideoLayer order={3} />
          </DirectorProvider>
        </Canvas>
      )}
    </div>
  );
}

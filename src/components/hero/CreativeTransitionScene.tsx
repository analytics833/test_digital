"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text, MeshTransmissionMaterial, Environment, useGLTF } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { useEmblemGlowTexture } from "@/hooks/useEmblemGlowTexture";
import { getDeviceTier } from "@/lib/deviceTier";
import { useLayer } from "@/components/stage/layerContext";
import { ReadyMarker } from "@/components/stage/readiness";
import { stageSlots } from "@/components/stage/stageSlots";
import { ModelErrorBoundary } from "./ModelErrorBoundary";

// Transmission (glass) re-renders the scene into an offscreen buffer every
// frame; its buffer size and sample count are the main GPU cost here.
const tier = getDeviceTier();
const TRANSMISSION_QUALITY = {
  low: { samples: 3, resolution: 128, backside: false },
  mid: { samples: 4, resolution: 256, backside: true },
  high: { samples: 6, resolution: 256, backside: true },
}[tier];

/**
 * Computes planar UV projection mapped onto the XY bounds of the geometry
 * so the glow texture displays seamlessly without stretching.
 */
function applyPlanarUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;

  const sizeX = Math.max(box.max.x - box.min.x, 0.001);
  const sizeY = Math.max(box.max.y - box.min.y, 0.001);
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs[i * 2] = (x - box.min.x) / sizeX;
    uvs[i * 2 + 1] = (y - box.min.y) / sizeY;
  }

  const uvAttribute = new THREE.BufferAttribute(uvs, 2);
  uvAttribute.needsUpdate = true;
  geometry.setAttribute("uv", uvAttribute);
}

/**
 * Builds the emblem geometry (outer ring + inner "a" glyph)
 */
function buildEmblemGeometry() {
  const bowlOuterR = 0.5;
  const bowlInnerR = 0.27;
  const bowlCenterX = -0.06;
  const bowlCenterY = -0.05;

  const bowl = new THREE.Shape();
  bowl.absarc(bowlCenterX, bowlCenterY, bowlOuterR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(bowlCenterX, bowlCenterY, bowlInnerR, 0, Math.PI * 2, true);
  bowl.holes.push(hole);

  const stemWidth = 0.17;
  const stemLeft = bowlCenterX + bowlOuterR - stemWidth * 1.1;
  const stemBottom = bowlCenterY - bowlOuterR + 0.06;
  const stemTop = bowlCenterY + bowlOuterR + 0.3;
  const stem = new THREE.Shape();
  stem.moveTo(stemLeft, stemBottom);
  stem.lineTo(stemLeft + stemWidth, stemBottom);
  stem.lineTo(stemLeft + stemWidth, stemTop);
  stem.lineTo(stemLeft, stemTop);
  stem.closePath();

  const letterGeometry = new THREE.ExtrudeGeometry([bowl, stem], {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 64,
  });
  letterGeometry.center();
  applyPlanarUVs(letterGeometry);

  // Outer Torus Ring
  const ringGeometry = new THREE.TorusGeometry(1.48, 0.115, 48, 140);

  return { ringGeometry, letterGeometry };
}

/**
 * Volumetric Light Beam behind the 3D text and emblem
 */
function VolumetricStreak() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = Math.sin(t * 0.4) * 0.04;
  });

  return (
    <mesh ref={meshRef} position={[-0.4, 0.08, -1.1]} rotation={[0, 0, 0.06]}>
      <planeGeometry args={[14, 4.8]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            float yDist = abs(vUv.y - 0.5) * 2.0;
            float streak = exp(-yDist * 2.8);
            float xFade = smoothstep(0.0, 0.28, vUv.x) * smoothstep(1.0, 0.55, vUv.x);
            vec3 color = mix(vec3(0.06, 0.28, 0.24), vec3(0.6, 0.9, 0.85), vUv.x * 0.7);
            float alpha = streak * xFade * 0.28;
            gl_FragColor = vec4(color * 1.6, alpha);
          }
        `}
      />
    </mesh>
  );
}

export const EMBLEM_MODEL_PATH = "/models/emblem-opt.glb";

/**
 * Big Emblem loaded directly from the real emblem.glb 3D asset
 */
function GLBBigEmblem({ glowTex }: { glowTex: THREE.Texture | null }) {
  const { scene } = useGLTF(EMBLEM_MODEL_PATH, "/draco/");
  // Invisible while the layer is off screen, which also skips the glass
  // material's extra transmission passes.
  const { active } = useLayer();

  const geometry = useMemo(() => {
    let geo: THREE.BufferGeometry | null = null;
    scene.traverse((child) => {
      if (!geo && (child as THREE.Mesh).isMesh) {
        geo = (child as THREE.Mesh).geometry.clone();
        applyPlanarUVs(geo);
        geo.computeVertexNormals();
      }
    });
    return geo;
  }, [scene]);

  if (!geometry) return null;

  return (
    // frustumCulled={false}: the emblem starts above the frame (it swoops in on
    // scroll), and a culled mesh never gets drawn during the stage's warm-up
    // frames, so its render-target shader variants would only compile on entry.
    <mesh geometry={geometry} castShadow={false} receiveShadow={false} frustumCulled={false}>
      <MeshTransmissionMaterial
        {...TRANSMISSION_QUALITY}
        visible={active}
        thickness={0.52}
        roughness={0.04}
        transmission={1.0}
        ior={1.38}
        chromaticAberration={0.16}
        anisotropy={0.5}
        distortion={0.14}
        distortionScale={0.4}
        temporalDistortion={0.08}
        color="#dfeeff"
        side={THREE.DoubleSide}
        emissive="#ffffff"
        emissiveIntensity={1.0}
        emissiveMap={glowTex || undefined}
        toneMapped={true}
      />
    </mesh>
  );
}

useGLTF.preload(EMBLEM_MODEL_PATH, "/draco/");

/**
 * Procedural Fallback Emblem if the GLB is loading or missing
 */
function ProceduralBigEmblem({ glowTex }: { glowTex: THREE.Texture | null }) {
  const { ringGeometry, letterGeometry } = useMemo(() => buildEmblemGeometry(), []);

  return (
    <>
      {/* 1. Outer Chromatic Glass Ring */}
      <mesh geometry={ringGeometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <MeshTransmissionMaterial
          thickness={0.52}
          roughness={0.04}
          transmission={1.0}
          ior={1.38}
          chromaticAberration={0.16}
          anisotropy={0.5}
          distortion={0.14}
          distortionScale={0.4}
          temporalDistortion={0.08}
          color="#dfeeff"
          {...TRANSMISSION_QUALITY}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Inner "a" Glyph Mesh with Emissive Cyberpunk Video Mapping */}
      <mesh geometry={letterGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#04060c"
          metalness={0.9}
          roughness={0.12}
          emissive="#ffffff"
          emissiveIntensity={1.0}
          emissiveMap={glowTex || undefined}
          toneMapped={true}
        />
      </mesh>

      {/* 3. Outer Glass Lens Casing over the "a" for extra chromatic refraction */}
      <mesh geometry={letterGeometry} scale={[1.025, 1.025, 1.05]}>
        <MeshTransmissionMaterial
          thickness={0.25}
          roughness={0.05}
          transmission={0.92}
          ior={1.32}
          chromaticAberration={0.12}
          color="#ebf5ff"
          {...TRANSMISSION_QUALITY}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

/**
 * Large 3D Emblem with exact angle, transmissive outer glass ring,
 * and emissive inner "a" glyph. Enters from the top rotating 360 degrees
 * as you scroll into the section.
 */
function BigEmblem({
  mousePos,
  scrollProgress,
}: {
  mousePos: React.RefObject<{ x: number; y: number }>;
  scrollProgress: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowTex = useEmblemGlowTexture();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const p = scrollProgress.current ?? 0;

    // Entrance range: from section entering viewport (0.0) until fully centered (0.40)
    const entryT = Math.min(Math.max(p / 0.40, 0), 1.0);
    // Smooth cubic ease-out curve for gentle deceleration
    const entryEase = 1 - Math.pow(1 - entryT, 2.5);

    // 1. Position Y: swoops down from above top frame (+7.2) into resting Y (0.0)
    const entryY = (1 - entryEase) * 7.2;

    // 2. Continuous dynamic 3D rotation driven by scroll progress throughout the section
    const scrollRotY = -0.78 + p * (Math.PI * 2.5);
    const scrollRotX = -0.06 + Math.sin(p * Math.PI) * 0.25;

    // 3. Smooth zoom from 1.30 scale down into resting scale 0.88
    const entryScale = THREE.MathUtils.lerp(1.30, 0.88, entryEase);

    // Mouse parallax + subtle idle float
    const targetRotX = scrollRotX + ((mousePos.current?.y || 0) * 0.15 + Math.sin(t * 0.7) * 0.02);
    const targetRotY = scrollRotY + ((mousePos.current?.x || 0) * 0.22 + Math.cos(t * 0.5) * 0.03);
    const targetRotZ = 0.04 + Math.sin(p * Math.PI * 2) * 0.06;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
    groupRef.current.rotation.z = targetRotZ;

    const idleY = Math.sin(t * 0.6) * 0.03;
    groupRef.current.position.y = entryY + idleY;
    groupRef.current.position.x = THREE.MathUtils.lerp(0.0, 0.16, entryEase);
    groupRef.current.scale.setScalar(entryScale);
  });

  return (
    <group ref={groupRef} position={[0, 7.2, 0]} scale={1.30} rotation={[0.5, Math.PI * 2 - 0.78, 0.04]}>
      <ModelErrorBoundary
        fallback={
          <>
            <ProceduralBigEmblem glowTex={glowTex} />
            <ReadyMarker part="creative-emblem" />
          </>
        }
      >
        {/* No placeholder while the GLB resolves: it's already cached by the
            hero, and the procedural stand-in would compile two extra glass
            shaders just to be thrown away. */}
        <Suspense fallback={null}>
          <GLBBigEmblem glowTex={glowTex} />
          <ReadyMarker part="creative-emblem" />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

/**
 * The creative section's 3D scene (headline, big emblem, lights, environment),
 * drawn as a layer of the shared stage canvas. Scroll progress and pointer
 * position come from the section via stageSlots.creative.
 */
export function CreativeWorld() {
  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);

  return (
    <>
      <color attach="background" args={["#000000"]} />

      {/* ─── Curated Multi-Shade Purple & Lavender Lighting Rig on the Big Emblem ─── */}
      <ambientLight intensity={0.2} color="#181028" />

      {/* Top-Left Signature Lavender Key Light */}
      <directionalLight position={[-4, 4.0, 2.5]} intensity={2.4} color="#BB9DEE" />

      {/* Top-Right Light Pastel Violet Key Light */}
      <directionalLight position={[4, 3.5, 2.5]} intensity={2.2} color="#E0D4FC" />

      {/* Bottom-Left Deep Royal Amethyst Fill Light */}
      <directionalLight position={[-3.5, -3.5, 1.5]} intensity={1.8} color="#7C3AED" />

      {/* Bottom-Right Electric Orchid Purple Accent Light */}
      <pointLight position={[3.8, -2.5, 2.2]} intensity={2.4} color="#A855F7" distance={12} />

      {/* Direct Back Ultraviolet Silhouette Light */}
      <pointLight position={[0, 1.0, -3.5]} intensity={2.2} color="#9333EA" distance={12} />

      {/* ─── 3D Clean Text (Left-aligned, passing directly behind the glass ring, vertically centered) ─── */}
      {/* Own boundary: the font loads/lays out separately from the emblem */}
      <Suspense fallback={null}>
        <Text
          font="/fonts/roboto-400.woff"
          position={[-2.65, 0.0, -0.45]}
          fontSize={0.30}
          maxWidth={3.0}
          lineHeight={1.08}
          letterSpacing={0.04}
          anchorX="left"
          anchorY="middle"
          textAlign="left"
        >
          {"CREATIVE\nDIGITAL\nEXPERIENCES"}
          <meshBasicMaterial color="#e4e4e7" toneMapped={true} />
        </Text>
        <ReadyMarker part="creative-text" />
      </Suspense>

      {/* ─── Big 3D Emblem with 360-degree top entrance transition ─── */}
      <BigEmblem mousePos={stageSlots.creative.mouse} scrollProgress={stageSlots.creative.progress} />

      {/* Own boundary: the emblem renders (lit by the scene lights) while the
          HDR environment is still loading */}
      <Suspense fallback={null}>
        <Environment files="/hdri/studio_small_03_512.hdr" environmentIntensity={0.7} />
        <ReadyMarker part="creative-env" />
      </Suspense>
    </>
  );
}

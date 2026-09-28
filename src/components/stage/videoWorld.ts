import * as THREE from "three";

/**
 * The "gateway" station: a screen in the world showing the underwater
 * sequence (formerly 600 image frames drawn on a separate canvas) as one
 * scroll-scrubbed video. The camera docks to it so it lines up with the HTML
 * card box around it (see cameraPath.dockedPose).
 *
 * The videos are encoded for scrubbing: a keyframe every 6 frames and no
 * B-frames, so any seek decodes at most a few frames.
 */
export type VideoWorld = {
  scene: THREE.Scene;
  /** Starts downloading the video (as a blob, so seeks never wait on the network). */
  load: () => void;
  /** Playback position in [0, 1]. */
  setProgress: (progress: number) => void;
  /** Screen aspect (width / height) and corner radius as a fraction of its height. */
  layout: (aspect: number, radiusFraction: number) => void;
  dispose: () => void;
};

/** World-space height of the screen; the docked camera distance derives from it. */
export const SCREEN_HEIGHT = 10;

const VIDEO_ASPECT = 16 / 9;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Cover-fits the video into the screen and rounds its corners. Colors are
// passed through untouched (the compositor skips tone mapping and encoding
// for this layer), so the video looks exactly like the source.
const fragmentShader = /* glsl */ `
uniform sampler2D uVideo;
uniform sampler2D uPoster;
uniform float uHasVideo;
uniform float uAspect;
uniform float uRadius;
varying vec2 vUv;

void main() {
  vec2 size = vec2(uAspect, 1.0);
  vec2 p = (vUv - 0.5) * size;
  vec2 q = abs(p) - (size * 0.5 - uRadius);
  float outside = length(max(q, 0.0)) - uRadius;
  if (outside > 0.0) discard;

  vec2 uv = vUv;
  float videoAspect = ${VIDEO_ASPECT.toFixed(6)};
  if (uAspect > videoAspect) {
    uv.y = (uv.y - 0.5) * (videoAspect / uAspect) + 0.5;
  } else {
    uv.x = (uv.x - 0.5) * (uAspect / videoAspect) + 0.5;
  }
  vec3 color = uHasVideo > 0.5 ? texture2D(uVideo, uv).rgb : texture2D(uPoster, uv).rgb;
  gl_FragColor = vec4(color, 1.0);
}
`;

export function createVideoWorld({ lowRes }: { lowRes: boolean }): VideoWorld {
  const src = lowRes ? "/videos/gateway-360.mp4" : "/videos/gateway-720.mp4";
  const scene = new THREE.Scene();

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";

  const videoTexture = new THREE.Texture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.generateMipmaps = false;

  // First frame, shown until the video can seek. Loaded through the default
  // loading manager, so it counts toward the preloader.
  const poster = new THREE.TextureLoader().load("/videos/gateway-poster.webp");
  poster.minFilter = THREE.LinearFilter;
  poster.generateMipmaps = false;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uVideo: { value: videoTexture },
      uPoster: { value: poster },
      uHasVideo: { value: 0 },
      uAspect: { value: VIDEO_ASPECT },
      uRadius: { value: 0 },
    },
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  screen.frustumCulled = false;
  scene.add(screen);

  let isReady = false;
  let isSeeking = false;
  let duration = 20;
  let targetTime = 0;
  let objectUrl: string | null = null;
  let disposed = false;

  const seekTo = (time: number) => {
    isSeeking = true;
    video.currentTime = time;
  };

  const onLoadedData = () => {
    duration = video.duration || duration;
    // Some browsers (iOS Safari) only paint seeked frames after the video has
    // played once; a muted play/pause primes it.
    video
      .play()
      .then(() => video.pause())
      .catch(() => {})
      .finally(() => {
        isReady = true;
        seekTo(targetTime);
      });
  };

  // One seek in flight at a time; when it lands, upload the frame and chase
  // the latest scroll target if it moved meanwhile.
  const onSeeked = () => {
    isSeeking = false;
    videoTexture.needsUpdate = true;
    material.uniforms.uHasVideo.value = 1;
    if (Math.abs(video.currentTime - targetTime) > 1 / 60) seekTo(targetTime);
  };

  video.addEventListener("loadeddata", onLoadedData);
  video.addEventListener("seeked", onSeeked);

  return {
    scene,
    load: () => {
      if (video.src) return;
      fetch(src)
        .then((response) => {
          if (!response.ok) throw new Error(String(response.status));
          return response.blob();
        })
        .then((blob) => {
          if (disposed) return;
          objectUrl = URL.createObjectURL(blob);
          video.src = objectUrl;
        })
        .catch(() => {
          if (!disposed) video.src = src;
        });
    },
    setProgress: (progress) => {
      const clamped = Math.min(1, Math.max(0, progress));
      targetTime = clamped * Math.max(0, duration - 1 / 30);
      if (isReady && !isSeeking && Math.abs(video.currentTime - targetTime) > 1 / 60) {
        seekTo(targetTime);
      }
    },
    layout: (aspect, radiusFraction) => {
      screen.scale.set(SCREEN_HEIGHT * aspect, SCREEN_HEIGHT, 1);
      material.uniforms.uAspect.value = aspect;
      material.uniforms.uRadius.value = Math.min(radiusFraction, 0.5);
    },
    dispose: () => {
      disposed = true;
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      videoTexture.dispose();
      poster.dispose();
      material.dispose();
      screen.geometry.dispose();
    },
  };
}

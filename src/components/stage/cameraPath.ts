import * as THREE from "three";
import { SCREEN_HEIGHT } from "./videoWorld";

/**
 * One camera flies through the world's stations as the page scrolls:
 *
 *   A hero emblem  →  B creative scene  →  C spine carousel  →  D video screen
 *
 * Each station is its own scene (so it keeps its own lights, fog and
 * environment) placed at a world offset below the previous one; the camera
 * dives between them with a slight nose-down pitch. Offsets are chosen so the
 * next station rises into frame as the previous one leaves it — and so the
 * creative emblem, which starts its swoop 7.2 units above its station, is
 * still out of the hero's frame when that layer switches on.
 */
export const STATIONS = {
  hero: new THREE.Vector3(0, 0, 0),
  creative: new THREE.Vector3(0, -16, 0),
  spine: new THREE.Vector3(0, -44, 0),
  video: new THREE.Vector3(0, -95, 0),
} as const;

export type Pose = { position: THREE.Vector3; quaternion: THREE.Quaternion; fov: number };

export function createPose(): Pose {
  return { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), fov: 45 };
}

/** Camera framing at the hero and creative stations (unchanged from their old canvases). */
export function staticPose(station: THREE.Vector3, local: [number, number, number], fov: number, out: Pose) {
  out.position.set(station.x + local[0], station.y + local[1], station.z + local[2]);
  out.quaternion.identity();
  out.fov = fov;
  return out;
}

/** The spine world animates its own camera in local space; offset it to the station. */
export function offsetPose(station: THREE.Vector3, camera: THREE.PerspectiveCamera, out: Pose) {
  out.position.copy(camera.position).add(station);
  out.quaternion.copy(camera.quaternion);
  out.fov = camera.fov;
  return out;
}

export const VIDEO_FOV = 45;

/**
 * Places the camera so the video screen projects exactly onto `rect` (the
 * HTML card box, in viewport px) — it follows the card as it scales into a
 * rounded card and scrolls away.
 */
export function dockedPose(rect: DOMRect, viewportWidth: number, viewportHeight: number, out: Pose) {
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(VIDEO_FOV) / 2);
  const height = Math.max(rect.height, 1);
  const distance = (SCREEN_HEIGHT * viewportHeight) / (2 * tanHalf * height);
  const worldPerPx = (2 * distance * tanHalf) / viewportHeight;
  const offsetX = rect.left + rect.width / 2 - viewportWidth / 2;
  const offsetY = rect.top + rect.height / 2 - viewportHeight / 2;
  const station = STATIONS.video;
  out.position.set(station.x - offsetX * worldPerPx, station.y + offsetY * worldPerPx, station.z + distance);
  out.quaternion.identity();
  out.fov = VIDEO_FOV;
  return out;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const MAX_DIVE_PITCH = 0.32; // radians, at the middle of a flight
const pitch = new THREE.Quaternion();
const xAxis = new THREE.Vector3(1, 0, 0);

/** Camera pose `t` of the way (0..1, by scroll) through the flight from `from` to `to`. */
export function flightPose(from: Pose, to: Pose, t: number, out: Pose) {
  const e = easeInOutCubic(THREE.MathUtils.clamp(t, 0, 1));
  out.position.lerpVectors(from.position, to.position, e);
  out.quaternion.slerpQuaternions(from.quaternion, to.quaternion, e);
  pitch.setFromAxisAngle(xAxis, -Math.sin(Math.PI * e) * MAX_DIVE_PITCH);
  out.quaternion.multiply(pitch);
  out.fov = THREE.MathUtils.lerp(from.fov, to.fov, e);
  return out;
}

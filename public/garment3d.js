import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "/vendor/three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "/vendor/three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "/vendor/three/addons/environments/RoomEnvironment.js";

// Flayfind's floating 3D garments (lib/garment3d.ts there), as plain JavaScript.
// Loaded on demand from main.js so three.js stays out of the first load.
// bundle. One transparent WebGL canvas per garment, placed around the hero
// title. Pieces float and sway gently on their own (each out of phase) and
// lean a little towards the mouse anywhere on the page; hovering one turns it
// further towards the pointer and lifts it with a springy bounce (a tap does
// the same on touch).
//
// Canvases are pointer-events:none so the title/copy underneath stay
// selectable; hover is decided by a pixel hit test (alpha of the rendered
// frame under the pointer) from shared window listeners below. The idle
// motion renders at ~30fps and only while the canvas is on screen; with
// prefers-reduced-motion there is no idle motion and frames are only rendered
// while something is moving.
//
// The .glb files are Tripo exports run through gltf-transform (meshopt +
// webp textures), so the loader needs MeshoptDecoder (inline wasm).

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

// ---- shared input: one set of window listeners for every garment ----
const garments = new Set();
let hovered = null;
let queued = false;
let px = 0;
let py = 0;
/** Mouse position over the whole window, -1..1 (0 = centre); drives the idle lean. */
const follow = { x: 0, y: 0 };

function updateHover() {
  queued = false;
  // stay on the hovered piece while the pointer is anywhere in its box, so
  // gaps between e.g. the pant legs don't make it flicker
  if (hovered) {
    const l = hovered.local(px, py);
    if (l) return hovered.hover(l.u, l.v);
    hovered.leave();
    hovered = null;
  }
  for (const g of garments) {
    if (!g.hitTest(px, py)) continue;
    const l = g.local(px, py);
    hovered = g;
    g.hover(l.u, l.v);
    return;
  }
}

function onPointerMove(e) {
  if (e.pointerType === "touch") return;
  px = e.clientX;
  py = e.clientY;
  follow.x = MathUtils.clamp((px / window.innerWidth) * 2 - 1, -1, 1);
  follow.y = MathUtils.clamp((py / window.innerHeight) * 2 - 1, -1, 1);
  if (!queued) {
    queued = true;
    requestAnimationFrame(updateHover);
  }
}

function onPointerLeaveWindow() {
  hovered?.leave();
  hovered = null;
  follow.x = 0;
  follow.y = 0;
}

// touch has no hover: a tap on a piece plays the same little move
let pokeTimer = 0;
function onPointerDown(e) {
  if (e.pointerType !== "touch") return;
  for (const g of garments) {
    if (!g.hitTest(e.clientX, e.clientY)) continue;
    const l = g.local(e.clientX, e.clientY);
    if (hovered && hovered !== g) hovered.leave();
    hovered = g;
    g.hover(l.u, l.v);
    clearTimeout(pokeTimer);
    pokeTimer = window.setTimeout(() => {
      g.leave();
      if (hovered === g) hovered = null;
    }, 650);
    return;
  }
}

function register(g) {
  if (garments.size === 0) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeaveWindow);
  }
  garments.add(g);
}

function unregister(g) {
  garments.delete(g);
  if (hovered === g) hovered = null;
  if (garments.size === 0) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    document.documentElement.removeEventListener("pointerleave", onPointerLeaveWindow);
  }
}

const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

/** Slightly underdamped spring: eases to the target with a small overshoot. */
function stepSpring(s, target, dt, stiffness, damping) {
  s.v += (target - s.x) * stiffness * dt;
  s.v *= Math.exp(-damping * dt);
  s.x += s.v * dt;
}
const settled = (s, target, eps) => Math.abs(target - s.x) < eps && Math.abs(s.v) < eps;

// idle motion amounts
const FLOAT_PX = 0.03; // bob height, as a fraction of the canvas height
const SWAY_YAW = 0.12; // radians
const SWAY_PITCH = 0.035;
const FOLLOW_YAW = 0.2; // lean towards the mouse
const FOLLOW_PITCH = 0.07;
const IDLE_FRAME_MS = 1000 / 30 - 4; // a little slack so 60Hz rAF lands every other frame

export function mountGarment(canvas, opts) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: true, // lets hitTest read the last frame's alpha
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const gl = renderer.getContext();
  const pixel = new Uint8Array(4);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.add(new HemisphereLight(0xffffff, 0xd8d4cc, 0.6));
  const key = new DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 3, 4);
  scene.add(key);

  const camera = new PerspectiveCamera(30, 1, 0.01, 100);
  const pivot = new Group();
  scene.add(pivot);

  // Fit: centered, framed by its spin "cylinder" (widest XZ radius + height)
  // so the hover turn never clips the canvas.
  let radius = 0.5;
  let halfHeight = 0.5;

  const baseYaw = opts.yaw ?? 0;
  const basePitch = opts.pitch ?? 0;
  const tiltRad = MathUtils.degToRad(opts.tilt ?? 0);
  const phase = opts.phase ?? 0;
  const idle = !reduceMotion;
  // hover motion: targets, and springs that chase them
  let hovering = false;
  let tYaw = 0;
  let tPitch = 0;
  let tLift = 0;
  const yaw = { x: 0, v: 0 };
  const pitch = { x: 0, v: 0 };
  const lift = { x: 0, v: 0 };
  let appear = 0;
  let lastRender = 0;
  let loaded = false;
  let visible = true;
  let raf = 0;
  let disposed = false;
  let prev = performance.now();

  function fitCamera() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vFov = MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const pad = 1.09; // room for the hover lift and the idle sway
    const distV = (halfHeight * pad) / Math.tan(vFov / 2) + radius * 0.35;
    const distH = (radius * pad) / Math.tan(hFov / 2) + radius * 0.35;
    camera.position.set(0, 0, Math.max(distV, distH));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    wake();
  }

  loader.load(
    opts.url,
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const box = new Box3().setFromObject(model);
      model.position.sub(box.getCenter(new Vector3()));
      // XZ radius from world-space vertices (meshes are quantized, so raw
      // attribute values carry a node transform), sampled for speed
      model.updateMatrixWorld(true);
      const v = new Vector3();
      let r = 0;
      model.traverse((o) => {
        const mesh = o;
        const pos = mesh.isMesh ? mesh.geometry.attributes.position : undefined;
        if (!pos) return;
        const step = Math.max(1, Math.floor(pos.count / 4000));
        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
          r = Math.max(r, Math.hypot(v.x, v.z));
        }
      });
      const size = box.getSize(new Vector3());
      radius = r || Math.max(size.x, size.z) / 2;
      halfHeight = size.y / 2;
      const holder = new Group();
      holder.add(model);
      if (opts.mirror) holder.scale.x = -1;
      pivot.add(holder);
      fitCamera();
      loaded = true;
      opts.onLoad?.();
      wake();
    },
    undefined,
    (err) => opts.onError?.(err),
  );

  const self = {
    local(x, y) {
      // undo the slot's CSS rotation, which is about the box center (the
      // bounding rect's center preserves it)
      const r = canvas.getBoundingClientRect();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const c = Math.cos(-tiltRad);
      const s = Math.sin(-tiltRad);
      const lx = dx * c - dy * s + w / 2;
      const ly = dx * s + dy * c + h / 2;
      if (lx < 0 || ly < 0 || lx >= w || ly >= h) return null;
      return { u: lx / w, v: ly / h };
    },
    hitTest(x, y) {
      if (!loaded || appear < 0.5) return false;
      const l = self.local(x, y);
      if (!l) return false;
      const bx = Math.floor(l.u * gl.drawingBufferWidth);
      const by = gl.drawingBufferHeight - 1 - Math.floor(l.v * gl.drawingBufferHeight);
      gl.readPixels(bx, by, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      return pixel[3] > 24;
    },
    hover(u, v) {
      const k = reduceMotion ? 0.4 : 1;
      hovering = true;
      tYaw = (u - 0.5) * 1.1 * k; // turns towards the pointer
      tPitch = (v - 0.5) * 0.32 * k;
      tLift = 1;
      wake();
    },
    leave() {
      hovering = false;
      tYaw = 0;
      tPitch = 0;
      tLift = 0;
      wake();
    },
  };
  register(self);

  const ro = new ResizeObserver(() => fitCamera());
  ro.observe(canvas);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    wake();
  });
  io.observe(canvas);

  function wake() {
    if (!raf && !disposed && visible) {
      prev = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;

    let moving = !loaded;
    let transitioning = !loaded;
    if (loaded) {
      // not hovered: lean a little towards the mouse wherever it is
      const yawTarget = hovering || !idle ? tYaw : follow.x * FOLLOW_YAW;
      const pitchTarget = hovering || !idle ? tPitch : follow.y * FOLLOW_PITCH;
      // reduced motion: critically damped (no overshoot)
      stepSpring(yaw, yawTarget, dt, 60, idle ? 9 : 15.5);
      stepSpring(pitch, pitchTarget, dt, 60, idle ? 9 : 15.5);
      stepSpring(lift, tLift, dt, 110, idle ? 11 : 21);
      appear += (1 - appear) * damp(4.5, dt);

      const t = now / 1000;
      const bob = idle ? Math.sin(t * 1.25 + phase) : 0;
      const swayYaw = idle ? Math.sin(t * 0.6 + phase * 1.7) * SWAY_YAW : 0;
      const swayPitch = idle ? Math.sin(t * 0.85 + phase * 0.6) * SWAY_PITCH : 0;
      const floatPx = bob * FLOAT_PX * (canvas.clientHeight || 0);

      pivot.rotation.set(basePitch + pitch.x + swayPitch, baseYaw + yaw.x + swayYaw, 0);
      canvas.style.transform = `translateY(${((1 - appear) * 12 - lift.x * 8 - floatPx).toFixed(2)}px) scale(${(0.94 + 0.06 * appear + lift.x * 0.07).toFixed(4)})`;
      canvas.style.opacity = Math.min(1, appear).toFixed(3);
      transitioning =
        !settled(yaw, yawTarget, 1e-4) ||
        !settled(pitch, pitchTarget, 1e-4) ||
        !settled(lift, tLift, 1e-3) ||
        1 - appear > 1e-3;
      if (!transitioning) canvas.style.opacity = "1";
      moving = transitioning || idle;
    }

    // the idle float alone doesn't need 60fps
    if (transitioning || now - lastRender >= IDLE_FRAME_MS) {
      renderer.render(scene, camera);
      lastRender = now;
    }
    // keep going only while something is moving and the canvas is on screen
    if (moving && visible) raf = requestAnimationFrame(tick);
  }
  wake();

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      unregister(self);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const mesh = o;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          for (const val of Object.values(mat)) {
            if (val && typeof val === "object" && "isTexture" in val) val.dispose();
          }
          mat.dispose();
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

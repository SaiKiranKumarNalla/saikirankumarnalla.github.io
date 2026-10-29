// The Village: a walkable low-poly dōjō village. Every building is a section of the site.
// Everything is procedural (no model downloads) so the scene stays small and fast.
import * as THREE from 'three';
import { BUILDINGS } from './buildings.js';
import { makeBuilding, makeTreeInstances, makeLanterns, makePlayer, makePetals } from './props.js';

const canvas = document.getElementById('world');
const isTouch = matchMedia('(hover: none)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = isTouch || (navigator.hardwareConcurrency || 8) <= 4;

// ── Renderer (fall back to the classic site if WebGL is unavailable) ──
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' });
} catch (e) {
  location.replace('index.html');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.5 : 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = !lowPower;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 260);

// ── Day / night palettes (night = dark theme, day = light theme) ──
const PALETTES = {
  dark:  { sky: 0x0b0a10, fog: 0x0b0a10, ground: 0x1d1a24, path: 0x3a3442, hemiSky: 0x5a63a8, hemiGround: 0x2a1616, hemi: 1.25, sun: 0xb4c4ff, sunI: 1.7, exposure: 1.35, lanternI: 1.0 },
  light: { sky: 0xe9dccb, fog: 0xe9dccb, ground: 0xcdbfa8, path: 0xb3a48c, hemiSky: 0xfff1dc, hemiGround: 0x8a6f55, hemi: 0.95, sun: 0xffe2b8, sunI: 2.2, exposure: 1.05, lanternI: 0.25 },
};
const theme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

const hemi = new THREE.HemisphereLight();
scene.add(hemi);
const sun = new THREE.DirectionalLight();
sun.position.set(-30, 50, 20);
sun.castShadow = !lowPower;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 140 });
scene.add(sun);
scene.fog = new THREE.Fog(0, 55, 140);

// ── Ground: plaza, ring path and spokes to each building ──
const groundMat = new THREE.MeshStandardMaterial({ roughness: 1 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 64), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = 'ground';
scene.add(ground);

const pathMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
const plaza = new THREE.Mesh(new THREE.CircleGeometry(7, 48), pathMat);
plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.02; plaza.receiveShadow = true;
scene.add(plaza);
const ring = new THREE.Mesh(new THREE.RingGeometry(16, 18.2, 96), pathMat);
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.015; ring.receiveShadow = true;
scene.add(ring);

// Central emblem: a slowly turning blood-red disc, echoing the site logo.
const emblem = new THREE.Mesh(
  new THREE.TorusGeometry(2.2, 0.12, 12, 64),
  new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0x8b1a1a, emissiveIntensity: 0.9 })
);
emblem.rotation.x = -Math.PI / 2; emblem.position.y = 0.08;
scene.add(emblem);

// ── Buildings ──
const RADIUS = 25;
const buildings = BUILDINGS.map((b, i) => {
  const angle = (i / BUILDINGS.length) * Math.PI * 2 + Math.PI / 2;
  const group = makeBuilding(b, { lowPower });
  group.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
  group.lookAt(0, 0, 0); // doors face the plaza
  group.userData.building = b;
  scene.add(group);

  const spoke = new THREE.Mesh(new THREE.PlaneGeometry(3, RADIUS - 9), pathMat);
  spoke.rotation.x = -Math.PI / 2;
  spoke.rotation.z = -angle + Math.PI / 2;
  spoke.position.set(Math.cos(angle) * (RADIUS / 2 + 1.5), 0.012, Math.sin(angle) * (RADIUS / 2 + 1.5));
  spoke.receiveShadow = true;
  scene.add(spoke);

  // Door spot: where the player stands to enter.
  const door = new THREE.Vector3(Math.cos(angle) * (RADIUS - b.footprint - 2), 0, Math.sin(angle) * (RADIUS - b.footprint - 2));
  return { def: b, group, angle, door, labelY: b.height + 2.2 };
});

scene.add(makeTreeInstances({ count: lowPower ? 46 : 80, inner: 34, outer: 72, avoid: buildings.map((b) => b.group.position) }));
const lanterns = makeLanterns({ count: 12, radius: 19.6 });
scene.add(lanterns.group);

const player = makePlayer();
player.position.set(0, 0, 9);
scene.add(player);

const petals = reduceMotion ? null : makePetals({ count: lowPower ? 220 : 450, spread: 70 });
if (petals) scene.add(petals.points);

function applyTheme() {
  const p = PALETTES[theme()];
  scene.background = new THREE.Color(p.sky);
  scene.fog.color.set(p.fog);
  groundMat.color.set(p.ground);
  pathMat.color.set(p.path);
  hemi.color.set(p.hemiSky); hemi.groundColor.set(p.hemiGround); hemi.intensity = p.hemi;
  sun.color.set(p.sun); sun.intensity = p.sunI;
  renderer.toneMappingExposure = p.exposure;
  lanterns.setIntensity(p.lanternI);
  buildings.forEach((b) => b.group.userData.setGlow?.(p.lanternI));
  document.getElementById('wTheme').textContent = theme() === 'light' ? '☀' : '☾';
}
document.getElementById('wTheme').addEventListener('click', () => {
  const next = theme() === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('sai-theme', next); } catch (e) {}
  applyTheme();
});
applyTheme();

// ── Labels (HTML, so text stays crisp) and the accessible building list ──
const labelsEl = document.getElementById('wLabels');
const listEl = document.getElementById('wList');
buildings.forEach((b) => {
  const el = document.createElement('div');
  el.className = 'w-label';
  el.innerHTML = `<div class="w-label-jp">${b.def.jp}</div><div class="w-label-en">${b.def.en}</div>`;
  labelsEl.appendChild(el);
  b.labelEl = el;
  const a = document.createElement('a');
  a.href = b.def.href || '#';
  a.textContent = `${b.def.en}: ${b.def.sub}`;
  if (b.def.external) { a.target = '_blank'; a.rel = 'noopener'; }
  listEl.appendChild(a);
});

// ── Input ──
const keys = new Set();
addEventListener('keydown', (e) => {
  if (e.target.closest?.('input,textarea')) return;
  const k = e.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); walkTarget = null; e.preventDefault(); }
  if ((k === 'e' || k === 'enter') && near) enter(near);
});
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let walkTarget = null;
let downAt = null;
canvas.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hitB = raycaster.intersectObjects(buildings.map((b) => b.group), true)[0];
  if (hitB) {
    const b = buildings.find((x) => x.group === findRoot(hitB.object));
    if (b) { walkTarget = b.door.clone(); pendingEnter = isTouch ? b : null; return; }
  }
  const hit = raycaster.intersectObject(ground)[0];
  if (hit) { walkTarget = hit.point.setY(0); pendingEnter = null; }
});
canvas.addEventListener('pointermove', (e) => {
  if (isTouch) return;
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(buildings.map((b) => b.group), true)[0];
  canvas.style.cursor = hit ? 'pointer' : 'default';
  buildings.forEach((b) => b.group.userData.setHover?.(hit && findRoot(hit.object) === b.group));
});
let pendingEnter = null;
function findRoot(o) { while (o.parent && o.parent !== scene) o = o.parent; return o; }

// ── Enter prompt ──
const promptEl = document.getElementById('wPrompt');
const goEl = document.getElementById('wPromptGo');
let near = null;
function showPrompt(b) {
  if (near === b) return;
  near = b;
  if (!b) { promptEl.hidden = true; return; }
  document.getElementById('wPromptJp').textContent = b.def.jp;
  document.getElementById('wPromptTitle').textContent = b.def.en;
  document.getElementById('wPromptSub').textContent = b.def.sub;
  goEl.href = b.def.href || '#';
  goEl.innerHTML = b.def.href ? `${b.def.cta || 'Enter'} <kbd>E</kbd>` : 'Opening soon';
  goEl.target = b.def.external ? '_blank' : '';
  promptEl.hidden = false;
}
goEl.addEventListener('click', (e) => { if (near) { e.preventDefault(); enter(near); } });
function enter(b) {
  if (!b.def.href) return;
  if (b.def.external) { open(b.def.href, '_blank', 'noopener'); return; }
  document.getElementById('wLoader').classList.remove('done');
  setTimeout(() => (location.href = b.def.href), 350);
}

// ── Loop ──
const clock = new THREE.Clock();
const camOffset = new THREE.Vector3(0, 20, 25);
const camTarget = new THREE.Vector3();
const tmp = new THREE.Vector3();
const SPEED = 9;
let helpFaded = false;

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Pull the camera back on tall phone screens so buildings stay in view.
  camOffset.set(0, w < h ? 30 : 20, w < h ? 34 : 25);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

function step() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // Movement: keys are camera-relative (camera always looks along -Z).
  const move = new THREE.Vector3(
    (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0),
    0,
    (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0)
  );
  if (!move.lengthSq() && walkTarget) {
    tmp.subVectors(walkTarget, player.position);
    if (tmp.length() < 0.4) {
      walkTarget = null;
      if (pendingEnter) { const b = pendingEnter; pendingEnter = null; showPrompt(b); }
    } else move.copy(tmp);
  }
  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize().multiplyScalar(SPEED * dt);
    player.position.add(move);
    const yaw = Math.atan2(move.x, move.z);
    player.rotation.y += (((yaw - player.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 12);
    if (!helpFaded) { helpFaded = true; setTimeout(() => document.getElementById('wHelp').classList.add('fade'), 2500); }
  }
  player.userData.animate(t, moving);

  // Keep inside the village and outside buildings.
  const r = Math.hypot(player.position.x, player.position.z);
  if (r > 60) player.position.multiplyScalar(60 / r);
  let closest = null, closestD = Infinity;
  for (const b of buildings) {
    tmp.subVectors(player.position, b.group.position).setY(0);
    const d = tmp.length();
    const min = b.def.footprint + 0.9;
    if (d < min) player.position.add(tmp.normalize().multiplyScalar(min - d));
    const dd = player.position.distanceTo(b.door);
    if (dd < closestD) { closestD = dd; closest = b; }
  }
  if (!pendingEnter) showPrompt(closestD < 4.5 ? closest : null);

  // Camera follows smoothly.
  camTarget.copy(player.position).add(camOffset);
  camera.position.lerp(camTarget, 1 - Math.exp(-dt * 4));
  camera.lookAt(player.position.x, 1, player.position.z - 6);
  sun.target.position.copy(player.position);
  sun.position.set(player.position.x - 30, 50, player.position.z + 20);
  sun.target.updateMatrixWorld();

  if (!reduceMotion) {
    emblem.rotation.z = t * 0.15;
    buildings.forEach((b) => b.group.userData.animate?.(t));
    petals?.update(dt, player.position);
  }
  lanterns.flicker(t);

  // Project labels to the screen.
  for (const b of buildings) {
    tmp.copy(b.group.position).setY(b.labelY).project(camera);
    const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.2 && Math.abs(tmp.y) < 1.2;
    b.labelEl.style.opacity = visible ? (near === b ? 1 : 0.85) : 0;
    if (visible) b.labelEl.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -100%)`;
  }

  renderer.render(scene, camera);
  if (++frames === 2) { document.getElementById('wLoader').classList.add('done'); }
}
let frames = 0;

renderer.compile(scene, camera);
renderer.setAnimationLoop(step);

addEventListener('pageshow', (e) => { if (e.persisted) document.getElementById('wLoader').classList.add('done'); });

// The Village: a walkable low-poly dōjō village. Every building is a section of the site.
// Kage (the site's samurai) is the visitor's avatar: click a building or a dock button and he walks there.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BUILDINGS } from './buildings.js';
import { makeBuilding, makeTreeInstances, makeLanterns, makePetals } from './props.js';
import { makeKageCharacter } from './character.js';
import { makeSky, makeMoon, makeStars, makeMountains, makeFireflies, makePond, makeBamboo, makeBanner, makeRocks } from './atmosphere.js';
import { makeSpeech, IDLE_LINES } from './companion.js';

const $ = (id) => document.getElementById(id);
const canvas = $('world');
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
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 520);

// Glow (bloom) on desktop: lanterns, the moon and windows bleed light softly.
let composer = null, bloom = null;
if (!lowPower) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.55, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
}

// ── Day / night. Night is the blood-moon village; day is a warm afternoon. ──
const PALETTES = {
  dark: {
    sky: [0x07040a, 0x3a0d14, 0x0d0508], fog: 0x1a0a10, ground: 0x1c1418, path: 0x3a2c34,
    hemiSky: 0x7a4a6a, hemiGround: 0x2a1212, hemi: 1.1, moon: 0xff7a66, moonI: 1.9, exposure: 1.3,
    lantern: 1.0, bloom: 0.75, mountains: [0x2a1018, 0x1a0a12], night: true,
  },
  light: {
    sky: [0xbfd3e6, 0xf3dcc0, 0xe9dccb], fog: 0xead9c4, ground: 0xcdbfa8, path: 0xb3a48c,
    hemiSky: 0xfff1dc, hemiGround: 0x8a6f55, hemi: 1.0, moon: 0xffe2b8, moonI: 2.3, exposure: 1.05,
    lantern: 0.25, bloom: 0.25, mountains: [0x9c8f9c, 0xb7aab4], night: false,
  },
};
const theme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

const sky = makeSky();
scene.add(sky.mesh);
const moon = makeMoon();
scene.add(moon.group);
const stars = makeStars(lowPower ? 450 : 900);
scene.add(stars);
const mountains = makeMountains();
scene.add(mountains);

const hemi = new THREE.HemisphereLight();
scene.add(hemi);
const moonLight = new THREE.DirectionalLight();
moonLight.castShadow = !lowPower;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.bias = -0.0005;
Object.assign(moonLight.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 200 });
scene.add(moonLight, moonLight.target);
scene.fog = new THREE.Fog(0, 60, 175);

// ── Ground: plaza, ring path and spokes ──
const groundMat = new THREE.MeshStandardMaterial({ roughness: 1 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(200, 64), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const pathMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
const flatOnGround = (geo, y) => { const m = new THREE.Mesh(geo, pathMat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m; };
flatOnGround(new THREE.CircleGeometry(7, 48), 0.02);
flatOnGround(new THREE.RingGeometry(16, 18.2, 96), 0.015);

const emblem = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.12, 12, 64), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0xc23b3b, emissiveIntensity: 1.2 }));
emblem.rotation.x = -Math.PI / 2; emblem.position.y = 0.08;
scene.add(emblem);

// ── Buildings ──
const RADIUS = 25;
const buildings = BUILDINGS.map((b, i) => {
  const angle = (i / BUILDINGS.length) * Math.PI * 2 + Math.PI / 2;
  const group = makeBuilding(b, { lowPower });
  group.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
  group.lookAt(0, 0, 0);
  scene.add(group);
  const spoke = flatOnGround(new THREE.PlaneGeometry(3, RADIUS - 9), 0.012);
  spoke.rotation.z = -angle + Math.PI / 2;
  spoke.position.set(Math.cos(angle) * (RADIUS / 2 + 1.5), 0.012, Math.sin(angle) * (RADIUS / 2 + 1.5));
  const doorR = RADIUS - b.footprint - 2;
  return { def: b, group, angle, door: new THREE.Vector3(Math.cos(angle) * doorR, 0, Math.sin(angle) * doorR), labelY: b.height + 2.2 };
});

// ── Ambience props (obstacles are circles the walker avoids) ──
const obstacles = buildings.map((b) => ({ p: b.group.position, r: b.def.footprint + 0.9 }));
const animated = [];
const mid = (i, r) => { const a = ((i + 0.5) / BUILDINGS.length) * Math.PI * 2 + Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r, a]; };
{
  const [px, pz, pa] = mid(6, 27);
  const pond = makePond(px, pz, -pa);
  scene.add(pond); animated.push(pond);
  obstacles.push({ p: pond.position, r: 5 });
}
[1, 3, 5].forEach((i) => { const [x, z] = mid(i, 31); const b = makeBamboo(x, z, lowPower ? 6 : 10); scene.add(b); obstacles.push({ p: b.position, r: 2.4 }); });
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
  const ban = makeBanner(Math.cos(a) * 8.6, Math.sin(a) * 8.6, i % 2 ? 0x8b1a1a : 0x1d1b24);
  ban.lookAt(0, 0, 0);
  scene.add(ban); animated.push(ban);
}
scene.add(makeRocks(lowPower ? 22 : 40, 33, 70));
scene.add(makeTreeInstances({ count: lowPower ? 46 : 90, inner: 36, outer: 80, avoid: obstacles.map((o) => o.p) }));
const lanterns = makeLanterns({ count: 12, radius: 19.6 });
scene.add(lanterns.group);
const petals = reduceMotion ? null : makePetals({ count: lowPower ? 220 : 450, spread: 70 });
if (petals) scene.add(petals.points);
const fireflies = reduceMotion ? null : makeFireflies(lowPower ? 35 : 80);
if (fireflies) scene.add(fireflies.points);

// ── Kage: the avatar ──
const kage = makeKageCharacter();
kage.position.set(0, 0, 10);
kage.rotation.y = Math.PI;
scene.add(kage);
// Warm key light that travels with Kage so he reads clearly against the dark village.
const kageLight = new THREE.PointLight(0xffc89a, 18, 9, 1.6);
scene.add(kageLight);

function applyTheme() {
  const p = PALETTES[theme()];
  sky.set(...p.sky);
  scene.fog.color.set(p.fog);
  groundMat.color.set(p.ground);
  pathMat.color.set(p.path);
  hemi.color.set(p.hemiSky); hemi.groundColor.set(p.hemiGround); hemi.intensity = p.hemi;
  moonLight.color.set(p.moon); moonLight.intensity = p.moonI;
  mountains.userData.mats.forEach((m, i) => m.color.set(p.mountains[i]));
  moon.setNight(p.night);
  stars.visible = p.night;
  fireflies?.setVisible(p.night);
  renderer.toneMappingExposure = p.exposure;
  if (bloom) bloom.strength = p.bloom;
  lanterns.setIntensity(p.lantern);
  buildings.forEach((b) => b.group.userData.setGlow?.(p.lantern));
  $('wTheme').textContent = p.night ? '☾' : '☀';
}
$('wTheme').addEventListener('click', () => {
  const next = theme() === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('sai-theme', next); } catch (e) {}
  applyTheme();
});
applyTheme();

// ── Labels, dock and accessible list ──
const labelsEl = $('wLabels');
const dockEl = $('wDock');
buildings.forEach((b) => {
  const el = document.createElement('div');
  el.className = 'w-label';
  el.innerHTML = `<div class="w-label-name">${b.def.label}</div><div class="w-label-sub">${b.def.jp} · ${b.def.en}</div>`;
  labelsEl.appendChild(el);
  b.labelEl = el;
  const btn = document.createElement('button');
  btn.className = 'w-dock-btn';
  btn.innerHTML = `<span class="w-dock-jp">${b.def.jp}</span><span class="w-dock-en">${b.def.label}</span>`;
  btn.setAttribute('aria-label', `Walk to ${b.def.label}: ${b.def.sub}`);
  btn.addEventListener('click', () => walkTo(b));
  dockEl.appendChild(btn);
  b.dockBtn = btn;
});

// ── Walking: a waypoint queue that routes around the plaza instead of through buildings ──
let route = [];
let arriving = null;
const tmp = new THREE.Vector3();
function ringPoint(angle, r = 12) { return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r); }
function planRoute(target, targetAngle) {
  const r = Math.hypot(kage.position.x, kage.position.z);
  const pts = [];
  if (r > 13) {
    const a0 = Math.atan2(kage.position.z, kage.position.x);
    let d = targetAngle - a0;
    d = ((d + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    if (Math.abs(d) > 0.35) {
      pts.push(ringPoint(a0));
      const steps = Math.ceil(Math.abs(d) / (Math.PI / 6));
      for (let i = 1; i <= steps; i++) pts.push(ringPoint(a0 + (d * i) / steps));
    }
  }
  pts.push(target);
  return pts;
}
function walkTo(b) {
  route = planRoute(b.door.clone(), b.angle);
  arriving = b;
  hidePrompt();
}
function walkToPoint(p) {
  route = [p];
  arriving = null;
  hidePrompt();
}

// Keyboard is optional extra control.
const keys = new Set();
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (intro.active) return;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); route = []; arriving = null; e.preventDefault(); }
  if ((k === 'e' || k === 'enter') && near && document.activeElement === document.body) enter(near);
  if (k === 'escape') hidePrompt();
});
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downAt = null;
const buildingFromHit = (o) => { while (o.parent && o.parent !== scene) o = o.parent; return buildings.find((b) => b.group === o); };
canvas.addEventListener('pointerdown', (e) => {
  downAt = { x: e.clientX, y: e.clientY };
  drag = { x: e.clientX, y: e.clientY, yaw: camYaw, pitch: camPitch };
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointerup', (e) => {
  drag = null;
  if (intro.active) return;
  if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hitB = raycaster.intersectObjects(buildings.map((b) => b.group), true)[0];
  const b = hitB && buildingFromHit(hitB.object);
  if (b) return walkTo(b);
  const hit = raycaster.intersectObject(ground)[0];
  if (hit) walkToPoint(hit.point.setY(0));
});
let drag = null, camYaw = 0, camPitch = 0.5, camDist = 1;
const pinch = new Map();
canvas.addEventListener('pointermove', (e) => {
  if (drag && !intro.active && pinch.size < 2) {
    camYaw = drag.yaw - (e.clientX - drag.x) * 0.006;
    camPitch = Math.max(0.18, Math.min(1.25, drag.pitch + (e.clientY - drag.y) * 0.004));
  }
  if (isTouch) return;
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(buildings.map((b) => b.group), true)[0];
  const hb = hit && buildingFromHit(hit.object);
  canvas.style.cursor = hb ? 'pointer' : 'default';
  buildings.forEach((b) => { b.group.userData.setHover?.(b === hb); b.labelEl.classList.toggle('hover', b === hb); });
});

// ── Enter prompt ──
const promptEl = $('wPrompt');
const goEl = $('wPromptGo');
let near = null;
function showPrompt(b) {
  near = b;
  $('wPromptJp').textContent = b.def.jp;
  $('wPromptTitle').textContent = b.def.label;
  $('wPromptJp').textContent = `${b.def.jp} · ${b.def.en}`;
  $('wPromptSub').textContent = b.def.sub;
  goEl.href = b.def.href || '#';
  goEl.innerHTML = b.def.href ? `${b.def.cta || 'Enter'}${isTouch ? '' : ' <kbd>E</kbd>'}` : 'Opening soon';
  goEl.classList.toggle('disabled', !b.def.href);
  promptEl.hidden = false;
  buildings.forEach((x) => x.dockBtn.classList.toggle('active', x === b));
}
function hidePrompt() {
  near = null;
  promptEl.hidden = true;
  buildings.forEach((x) => x.dockBtn.classList.remove('active'));
}
$('wPromptClose').addEventListener('click', hidePrompt);
goEl.addEventListener('click', (e) => { e.preventDefault(); if (near) enter(near); });
function enter(b) {
  if (!b.def.href) return;
  if (b.def.external) { open(b.def.href, '_blank', 'noopener'); return; }
  $('wLoader').classList.remove('done');
  setTimeout(() => (location.href = b.def.href), 350);
}

// ── Kage's voice ──
const kageEl = $('wKage');
const speech = makeSpeech(kageEl);
let idleFor = 0, idleIdx = 0;
const say = (text, ms) => { speech.say(text, clock.elapsedTime, ms); };

// ── Flyover intro ──
const introEl = $('wIntro');
const intro = { active: !reduceMotion, t: 0 };
if (!intro.active) { introEl.classList.add('gone'); document.body.classList.add('in-village'); }
function endIntro() {
  if (!intro.active) return;
  intro.active = false;
  introEl.classList.add('gone');
  document.body.classList.add('in-village');
  setTimeout(() => say("Welcome to the village. I'm Kage. Pick a place in the bar below, or click a building, and I'll walk you there. Drag to look around.", 7000), 700);
}
$('wSkip').addEventListener('click', endIntro);
// The village fades in slowly on first load.
setTimeout(() => introEl.classList.add('ready'), 600);

// ── Loop ──
const clock = new THREE.Clock();
const camOffset = new THREE.Vector3(0, 20, 25);
const camTarget = new THREE.Vector3();
const lookAt = new THREE.Vector3();
const SPEED = 10;

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer?.setSize(w, h);
  camera.aspect = w / h;
  camOffset.set(0, w < h ? 17 : 9.5, w < h ? 26 : 17);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
canvas.addEventListener('wheel', (e) => { e.preventDefault(); camDist = Math.max(0.55, Math.min(1.8, camDist * (1 + e.deltaY * 0.001))); }, { passive: false });
canvas.addEventListener('pointerdown', (e) => pinch.set(e.pointerId, e));
canvas.addEventListener('pointermove', (e) => {
  if (!pinch.has(e.pointerId)) return;
  const prev = [...pinch.values()];
  pinch.set(e.pointerId, e);
  if (pinch.size === 2) {
    const [a, b] = prev, [c, d] = [...pinch.values()];
    const before = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), after = Math.hypot(c.clientX - d.clientX, c.clientY - d.clientY);
    if (before > 0) camDist = Math.max(0.55, Math.min(1.8, camDist * before / after));
  }
});
['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, (e) => pinch.delete(e.pointerId)));

let frames = 0;
function step() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // Movement: keyboard (camera-relative) or the click route.
  const move = new THREE.Vector3(
    (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0), 0,
    (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0)
  );
  if (move.lengthSq()) move.applyAxisAngle(THREE.Object3D.DEFAULT_UP, camYaw);
  if (!move.lengthSq() && route.length) {
    tmp.subVectors(route[0], kage.position).setY(0);
    if (tmp.length() < 0.5) {
      route.shift();
      if (!route.length && arriving) {
        const b = arriving; arriving = null;
        kage.rotation.y = Math.atan2(b.group.position.x - kage.position.x, b.group.position.z - kage.position.z);
        showPrompt(b);
        say(b.def.kage, 6500);
      }
    } else move.copy(tmp);
  }
  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize().multiplyScalar(SPEED * dt);
    kage.position.add(move);
    const yaw = Math.atan2(move.x, move.z);
    kage.rotation.y += (((yaw - kage.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 10);
    idleFor = 0;
  }
  kage.userData.setTalking(speech.visible);
  kage.userData.animate(t, moving, dt);

  // Stay inside the village and out of buildings/props.
  const r = Math.hypot(kage.position.x, kage.position.z);
  if (r > 60) kage.position.multiplyScalar(60 / r);
  for (const o of obstacles) {
    tmp.subVectors(kage.position, o.p).setY(0);
    const d = tmp.length();
    if (d < o.r) kage.position.add(tmp.normalize().multiplyScalar(o.r - d));
  }
  // Keyboard walkers get the prompt when they reach a door.
  if (keys.size) {
    let best = null, bestD = 4.5;
    for (const b of buildings) { const d = kage.position.distanceTo(b.door); if (d < bestD) { bestD = d; best = b; } }
    if (best && best !== near) { showPrompt(best); say(best.def.kage, 6500); }
    if (!best && near) hidePrompt();
  }
  if (!intro.active && !moving && !speech.visible) {
    idleFor += dt;
    if (idleFor > 18) { idleFor = 0; say(IDLE_LINES[idleIdx++ % IDLE_LINES.length]); }
  }
  speech.tick(t);

  // Camera: flyover during the intro, then a smooth follow.
  if (intro.active) {
    intro.t += dt;
    const a = intro.t * 0.09 + 0.6; // slow, continuous orbit until the visitor chooses
    camera.position.set(Math.cos(a) * 55, 30 + Math.sin(intro.t * 0.2) * 3, Math.sin(a) * 55);
    camera.lookAt(0, 3, 0);
  } else {
    const dist = camOffset.length() * camDist;
    camTarget.set(Math.sin(camYaw) * Math.cos(camPitch) * dist, Math.sin(camPitch) * dist + 1.5, Math.cos(camYaw) * Math.cos(camPitch) * dist).add(kage.position);
    camera.position.lerp(camTarget, 1 - Math.exp(-dt * 2.6));
    lookAt.lerp(tmp.set(kage.position.x, 2, kage.position.z), 1 - Math.exp(-dt * 5));
    camera.lookAt(lookAt);
  }
  kageLight.position.set(kage.position.x + 1.5, 4.2, kage.position.z + 2.5);
  moonLight.position.set(kage.position.x - 45, 60, kage.position.z - 70);
  moonLight.target.position.copy(kage.position);

  if (!reduceMotion) {
    emblem.rotation.z = t * 0.15;
    buildings.forEach((b) => b.group.userData.animate?.(t));
    animated.forEach((o) => o.userData.animate(t));
    petals?.update(dt, kage.position);
    fireflies?.update(t);
  }
  lanterns.flicker(t);

  // Screen-space UI: building labels and Kage's speech bubble.
  for (const b of buildings) {
    tmp.copy(b.group.position).setY(b.labelY).project(camera);
    const visible = !intro.active && tmp.z < 1 && Math.abs(tmp.x) < 1.2 && Math.abs(tmp.y) < 1.2;
    b.labelEl.style.opacity = visible ? 1 : 0;
    if (visible) b.labelEl.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -100%)`;
  }
  if (speech.visible) {
    tmp.copy(kage.position).setY(3.6).project(camera);
    const x = (tmp.x * 0.5 + 0.5) * innerWidth, y = (-tmp.y * 0.5 + 0.5) * innerHeight;
    const w = kageEl.offsetWidth, h = kageEl.offsetHeight;
    kageEl.style.transform = `translate(${Math.max(12, Math.min(innerWidth - w - 12, x - 28))}px, ${Math.max(64, y - h - 10)}px)`;
  }

  if (composer) composer.render(); else renderer.render(scene, camera);
  if (++frames === 2) $('wLoader').classList.add('done');
}

renderer.compile(scene, camera);
renderer.setAnimationLoop(step);
addEventListener('pageshow', (e) => { if (e.persisted) $('wLoader').classList.add('done'); });

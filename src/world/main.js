// 3D home: a calm dōjō village as the backdrop and navigation for the portfolio.
// Menu items and buildings fly the camera to a building and open a content panel beside it.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BUILDINGS, MENU } from './buildings.js';
import { PANELS } from './panels.js';
import { makeBuilding, makeTreeInstances, makeLanterns } from './props.js';
import { currentSeason, SEASONS, wind, makeWeather } from './seasons.js';
import { makeGodRays, makeWindTrail, makeEagle } from './flair.js';
import { makeKageCharacter } from './character.js';
import { makeSky, makeMoon, makeStars, makeMountains, makeFireflies, makePond, makeBamboo, makeBanner, makeRocks } from './atmosphere.js';
import { makeSpeech } from './companion.js';
import { thesisDropdown, wireDropdown } from '../page3d/nav.js';

const $ = (id) => document.getElementById(id);
const canvas = $('world');
const isTouch = matchMedia('(hover: none)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = isTouch || (navigator.hardwareConcurrency || 8) <= 4;
const narrow = () => innerWidth < 860;

// ── Renderer (without WebGL the panels still work over a plain background) ──
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' });
} catch (e) {
  document.body.classList.add('no-webgl');
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 520);
let composer = null, bloom = null;

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!lowPower) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.5, 0.8);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }
}

// ── Palettes: a restrained crimson night, and a warm afternoon ──
const PALETTES = {
  dark: {
    sky: [0x0b0912, 0x34121c, 0x120a10], fog: 0x1c1218, ground: 0x2a2228, path: 0x4a3c42,
    hemiSky: 0x9a88b4, hemiGround: 0x3a2a2a, hemi: 1.9, moon: 0xffc0a8, moonI: 2.6, exposure: 1.5,
    lantern: 0.9, bloom: 0.5, mountains: [0x22121a, 0x170c12], night: true,
  },
  light: {
    sky: [0xb9d4ea, 0xf6e3d6, 0xeee4dc], fog: 0xe6e6da, ground: 0x93a77a, path: 0xc8b89a,
    hemiSky: 0xfff4e6, hemiGround: 0x5f7448, hemi: 1.0, moon: 0xffe2b8, moonI: 2.3, exposure: 1.05,
    lantern: 0.25, bloom: 0.2, mountains: [0x8a9a8c, 0xaab5ad], night: false,
  },
};
const theme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

const sky = makeSky(); scene.add(sky.mesh);
const moon = makeMoon(); scene.add(moon.group);
const stars = makeStars(lowPower ? 400 : 800); scene.add(stars);
const mountains = makeMountains(); scene.add(mountains);
const hemi = new THREE.HemisphereLight(); scene.add(hemi);
const moonLight = new THREE.DirectionalLight();
moonLight.position.set(-45, 60, -70);
moonLight.castShadow = !lowPower;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.bias = -0.0005;
Object.assign(moonLight.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 });
scene.add(moonLight, moonLight.target);
scene.fog = new THREE.Fog(0, 70, 190);

// ── Ground ──
const groundMat = new THREE.MeshStandardMaterial({ roughness: 1 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(200, 64), groundMat);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const pathMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
const flat = (geo, y) => { const m = new THREE.Mesh(geo, pathMat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m; };
flat(new THREE.CircleGeometry(7, 48), 0.02);
flat(new THREE.RingGeometry(16, 18.2, 96), 0.015);
const emblem = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.12, 12, 64), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0xc23b3b, emissiveIntensity: 1 }));
emblem.rotation.x = -Math.PI / 2; emblem.position.y = 0.08; scene.add(emblem);

// ── Buildings ──
const RADIUS = 25;
const buildings = BUILDINGS.map((b, i) => {
  const angle = (i / BUILDINGS.length) * Math.PI * 2 + Math.PI / 2;
  const group = makeBuilding(b, { lowPower });
  group.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
  group.lookAt(0, 0, 0);
  scene.add(group);
  const spoke = flat(new THREE.PlaneGeometry(3, RADIUS - 9), 0.012);
  spoke.rotation.z = -angle + Math.PI / 2;
  spoke.position.set(Math.cos(angle) * (RADIUS / 2 + 1.5), 0.012, Math.sin(angle) * (RADIUS / 2 + 1.5));
  return { def: b, group, angle, labelY: b.height + 2.2 };
});
const byPanel = Object.fromEntries(buildings.map((b) => [b.def.panel, b]));

// ── Ambience ──
const animated = [];
const mid = (i, r) => { const a = ((i + 0.5) / BUILDINGS.length) * Math.PI * 2 + Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r, a]; };
{ const [x, z, a] = mid(4, 27); const pond = makePond(x, z, -a); scene.add(pond); animated.push(pond); }
const avoid = buildings.map((b) => b.group.position);
[0, 2].forEach((i) => { const [x, z] = mid(i, 31); const b = makeBamboo(x, z, lowPower ? 6 : 10); scene.add(b); avoid.push(b.position); });
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
  const ban = makeBanner(Math.cos(a) * 8.6, Math.sin(a) * 8.6, i % 2 ? 0x8b1a1a : 0x1d1b24);
  ban.lookAt(0, 0, 0); scene.add(ban); animated.push(ban);
}
scene.add(makeRocks(lowPower ? 22 : 40, 33, 70));
const season = currentSeason();
document.documentElement.dataset.season = season;
scene.add(makeTreeInstances({ count: lowPower ? 90 : 190, inner: 33, outer: 85, avoid }));

const lanterns = makeLanterns({ count: 12, radius: 19.6 }); scene.add(lanterns.group);
const weather = reduceMotion ? null : makeWeather(season, { lowPower });
if (weather) scene.add(weather.group);
const rays = makeGodRays({ count: lowPower ? 5 : 9, radius: 38 }); scene.add(rays.group);
const trail = makeWindTrail(); scene.add(trail.object);
const eagle = makeEagle(); scene.add(eagle.object);
const fireflies = reduceMotion ? null : makeFireflies(lowPower ? 30 : 60);
if (fireflies) scene.add(fireflies.points);

// ── Kage, the guide: waits in the plaza and walks to whichever building is opened ──
const kage = makeKageCharacter();
const KAGE_HOME = new THREE.Vector3(0, 0, 0); // centre of the red ring
kage.position.copy(KAGE_HOME);
scene.add(kage);
const kageLight = new THREE.PointLight(0xffc89a, 14, 9, 1.6);
scene.add(kageLight);
let kageYawTarget = 0;
let route = []; // waypoints; walks around the plaza ring rather than through buildings
function routeTo(target, targetAngle) {
  const pts = [];
  const r = Math.hypot(kage.position.x, kage.position.z);
  const a0 = Math.atan2(kage.position.z, kage.position.x);
  let d = targetAngle - a0;
  d = ((d + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  if (r > 11 && Math.abs(d) > 0.3) {
    const steps = Math.ceil(Math.abs(d) / (Math.PI / 6));
    for (let i = 0; i <= steps; i++) pts.push(new THREE.Vector3(Math.cos(a0 + (d * i) / steps) * 11.5, 0, Math.sin(a0 + (d * i) / steps) * 11.5));
  }
  pts.push(target.clone());
  route = pts;
}
const doorOf = (b) => new THREE.Vector3(Math.cos(b.angle), 0, Math.sin(b.angle)).multiplyScalar(RADIUS - b.def.footprint - 2.2);

function applyTheme() {
  let p = PALETTES[theme()];
  // Fall afternoons glow: a low golden-hour sun, amber haze and warm light.
  if (!p.night && season === 'fall') p = { ...p, sky: [0xf2b46a, 0xf7d29a, 0xf4e2c4], fog: 0xf0d2a4, hemiSky: 0xffd9a0, moon: 0xffb050, moonI: 2.8, mountains: [0xc08a68, 0xd8ae88] };
  rays?.setStyle(p.night ? 0x9fb4ff : season === 'fall' ? 0xffc070 : 0xfff0c8, p.night ? 0.05 : season === 'rainy' ? 0.04 : 0.13);
  sky.set(...p.sky);
  scene.fog.color.set(p.fog);
  groundMat.color.set(theme() === 'light' ? SEASONS[season].ground : p.ground); pathMat.color.set(p.path);
  hemi.color.set(p.hemiSky); hemi.groundColor.set(p.hemiGround); hemi.intensity = p.hemi;
  moonLight.color.set(p.moon); moonLight.intensity = p.moonI;
  mountains.userData.mats.forEach((m, i) => m.color.set(p.mountains[i]));
  moon.setNight(p.night); stars.visible = p.night; fireflies?.setVisible(p.night);
  if (renderer) renderer.toneMappingExposure = p.exposure;
  if (bloom) bloom.strength = p.bloom;
  lanterns.setIntensity(p.lantern);
  buildings.forEach((b) => b.group.userData.setGlow?.(p.lantern));
  $('wTheme').textContent = p.night ? '☾' : '☀';
}
$('wTheme').addEventListener('click', () => {
  const next = theme() === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { sessionStorage.setItem('sai-theme', next); } catch (e) {}
  applyTheme();
});
applyTheme();

// ── Menu, labels ──
const menuEl = $('wMenu');
const menuBtns = {};
MENU.forEach((id) => {
  if (id === 'research') {
    // Thesis dropdown: PhD opens its panel here; Master's and Bachelor's go to their pages.
    menuEl.insertAdjacentHTML('beforeend', thesisDropdown());
    const dd = menuEl.lastElementChild;
    dd.querySelector('[data-thesis="research"]').addEventListener('click', (e) => { e.preventDefault(); openPanel('research'); closeMenu(); dd.classList.remove('open'); });
    menuBtns[id] = dd.querySelector('.w-dd-btn');
    return;
  }
  const a = document.createElement('a');
  a.href = `#${id}`;
  a.textContent = PANELS[id].title;
  a.addEventListener('click', (e) => { e.preventDefault(); openPanel(id); closeMenu(); });
  menuEl.appendChild(a);
  menuBtns[id] = a;
});
wireDropdown(menuEl);
const burger = $('wBurger');
function closeMenu() { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }
burger.addEventListener('click', () => {
  const open = !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
});
buildings.forEach((b) => {
  const el = document.createElement('div');
  el.className = 'w-label';
  el.innerHTML = `<div class="w-label-name">${b.def.label}</div><div class="w-label-sub"><span lang="ja">${b.def.jp}</span> · ${b.def.en}</div>`;
  $('wLabels').appendChild(el);
  b.labelEl = el;
});

// ── Panels ──
const panelEl = $('wPanel');
let focus = null; // building currently in focus
let presentPending = null; // time a panel was requested; it opens when Kage arrives
function openPanel(id, { push = true } = {}) {
  const def = PANELS[id];
  if (!def) return;
  hideHero();
  $('wPanelKicker').textContent = def.kicker;
  $('wPanelTitle').textContent = def.title;
  $('wPanelBody').innerHTML = def.html();
  $('wPanelBody').scrollTop = 0;
  panelEl.hidden = false;
  panelEl.classList.remove('open');
  presentPending = clock.elapsedTime; // the panel unfolds from Kage's hand once he arrives
  Object.entries(menuBtns).forEach(([k, a]) => a.classList.toggle('active', k === id));
  if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  document.title = `${def.title} | Sai Kiran Kumar Nalla, PhD`;
  focus = byPanel[id] || null;
  if (focus) {
    routeTo(doorOf(focus), focus.angle);
    kage.userData.setPresenting(false);
  } else presentPending = clock.elapsedTime - 9; // menu items without a building open at once
  $('wPanelTitle').focus({ preventScroll: true });
}
function closePanel({ push = true } = {}) {
  panelEl.classList.remove('open');
  setTimeout(() => { if (!panelEl.classList.contains('open')) panelEl.hidden = true; }, 400);
  Object.values(menuBtns).forEach((a) => a.classList.remove('active'));
  focus = null;
  presentPending = null;
  kage.userData.setPresenting(false);
  routeTo(KAGE_HOME, Math.atan2(KAGE_HOME.z, KAGE_HOME.x));
  if (push && location.hash) history.pushState(null, '', location.pathname);
  document.title = 'Sai Kiran Kumar Nalla, PhD | Medical Imaging Scientist & AI Builder';
}
$('wPanelClose').addEventListener('click', () => closePanel());
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePanel(); closeMenu(); } });

// ── Walk Kage with the keyboard: WASD / arrows to walk, Enter at a door to go in ──
const KEYS = { w: [0, 1], arrowup: [0, 1], s: [0, -1], arrowdown: [0, -1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
const held = new Set();
const typing = (e) => /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
const nearDoor = () => buildings.find((b) => doorOf(b).distanceTo(kage.position) < 4.5);
const keyOf = (e) => { const c = (e.code || '').toLowerCase(); return KEYS[c] ? c : c.startsWith('key') && KEYS[c.slice(3)] ? c.slice(3) : e.key.toLowerCase(); };
let autoDoor = null; // the door Kage last walked into, so it opens once, not every frame
addEventListener('keydown', (e) => {
  if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = keyOf(e);
  if (KEYS[k]) {
    e.preventDefault();
    held.add(k);
    if (focus) closePanel();
    route = [];
    hideHero();
  } else if (k === 'enter' && !focus) {
    const b = nearDoor();
    if (b) { e.preventDefault(); openPanel(b.def.panel); }
  }
});
addEventListener('keyup', (e) => held.delete(keyOf(e)));
addEventListener('blur', () => held.clear());
addEventListener('popstate', () => { const id = location.hash.slice(1); if (PANELS[id]) openPanel(id, { push: false }); else closePanel({ push: false }); });

// ── Hero ──
const heroEl = $('wHero');
function hideHero() { heroEl.classList.add('gone'); document.body.classList.add('exploring'); }
// Kage greets once, the first time the visitor drags around the village with no panel open.
let greeted = false;
$('wViewWork').addEventListener('click', () => { hideHero(); greeted = true; speech.say("Welcome. Walk me with the arrow keys, or click any building.", clock.elapsedTime, 5000); });
$('wHome').addEventListener('click', (e) => { e.preventDefault(); closePanel(); heroEl.classList.remove('gone'); document.body.classList.remove('exploring'); });
const GREETINGS = [['ようこそ', 'ja'], ['Welcome', 'en'], ['నమస్కారం', 'te'], ['नमस्ते', 'hi'], ['Bonjour', 'fr']];
let greetIdx = 0;
// "I am a …": each role fades out and the next one fades in.
const ROLES = ['a researcher', 'a medical imaging scientist', 'an engineer', 'an agentic AI builder', 'a venture explorer', 'a writer', 'a jack of all trades'];
let roleIdx = 0;
setInterval(() => {
  if (heroEl.classList.contains('gone')) return;
  const w = $('wWord');
  w.classList.add('swap');
  setTimeout(() => { w.textContent = ROLES[++roleIdx % ROLES.length]; w.classList.remove('swap'); }, 350);
}, 2200);
setInterval(() => {
  if (heroEl.classList.contains('gone')) return;
  const g = $('wGreet');
  g.classList.add('swap');
  setTimeout(() => { const [w, l] = GREETINGS[++greetIdx % GREETINGS.length]; g.innerHTML = `<span lang="${l}">${w}</span>`; g.classList.remove('swap'); }, 400);
}, 2600);

// ── Kage's voice ──
const kageEl = $('wKage');
const speech = makeSpeech(kageEl);

// ── Pointer: drag to look around, click a building to open it ──
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let drag = null, yawOffset = 0, downAt = null;
const buildingFromHit = (o) => { while (o.parent && o.parent !== scene) o = o.parent; return buildings.find((b) => b.group === o); };
function pick(e) {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(buildings.map((b) => b.group), true)[0];
  return hit && buildingFromHit(hit.object);
}
canvas.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; drag = { x: e.clientX, yaw: yawOffset }; canvas.setPointerCapture?.(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (drag) yawOffset = drag.yaw - (e.clientX - drag.x) * 0.005;
  if (drag && !greeted && !focus && Math.abs(e.clientX - drag.x) > 40) { greeted = true; hideHero(); speech.say("I'm Kage, Sai's guide. Pick a section from the menu, or click any building.", clock.elapsedTime, 5500); }
  if (!isTouch && !drag) {
    const hb = pick(e);
    canvas.style.cursor = hb ? 'pointer' : 'grab';
    buildings.forEach((b) => { b.hovered = b === hb; b.group.userData.setHover?.(b === hb); b.labelEl.classList.toggle('hover', b === hb); });
  }
});
canvas.addEventListener('pointerup', (e) => {
  drag = null;
  if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return;
  const b = pick(e);
  if (b) openPanel(b.def.panel);
});

// ── Camera: slow overview orbit, or a framed view of the focused building ──
const clock = new THREE.Clock();
const camPos = new THREE.Vector3(48, 30, 30);
const camLook = new THREE.Vector3(0, 3, 0);
const wantPos = new THREE.Vector3(), wantLook = new THREE.Vector3(), tmp = new THREE.Vector3(), right = new THREE.Vector3();
camera.position.copy(camPos);

function resize() {
  const w = innerWidth, h = innerHeight;
  if (renderer) renderer.setSize(w, h, false);
  composer?.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w < h ? 55 : 40;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

let frames = 0;
function step() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (focus) {
    // Kage stands at the door, centred in the free space, with his building behind him.
    const a = focus.angle + yawOffset * 0.35;
    const door = doorOf(focus);
    const back = narrow() ? 20 : 16;
    wantPos.set(door.x - Math.cos(a) * back, 5.5 + focus.def.height * 0.25, door.z - Math.sin(a) * back);
    wantLook.set(door.x, 2.6, door.z);
    right.subVectors(wantLook, wantPos).cross(THREE.Object3D.DEFAULT_UP).normalize();
    if (!narrow()) wantLook.addScaledVector(right, 3.6); // Kage sits in the middle of the area left of the panel
    else wantLook.y -= 2.5; // Kage sits above the bottom sheet
  } else {
    const a = (reduceMotion ? 0.6 : t * 0.03 + 0.6) + yawOffset;
    const r = narrow() ? 62 : 52;
    wantPos.set(Math.cos(a) * r, narrow() ? 38 : 30, Math.sin(a) * r);
    wantLook.set(0, 3, 0);
  }
  const k = 1 - Math.exp(-dt * (focus ? 1.8 : 1.2));
  camPos.lerp(wantPos, k);
  camLook.lerp(wantLook, k);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  // Kage walks his route; when he arrives he faces the open building (or the camera at home).
  let walking = false;
  if (route.length) {
    tmp.subVectors(route[0], kage.position).setY(0);
    const dist = tmp.length();
    if (dist < 0.3) route.shift();
    else {
      walking = true;
      kage.position.addScaledVector(tmp.normalize(), Math.min(dist, (reduceMotion ? 40 : 19) * dt));
      kageYawTarget = Math.atan2(tmp.x, tmp.z);
    }
  }
  if (held.size) {
    // Move relative to the camera: up walks away from the viewer.
    let fx = 0, fz = 0;
    held.forEach((k) => { fx += KEYS[k][0]; fz += KEYS[k][1]; });
    const fwd = tmp.subVectors(camLook, camPos).setY(0).normalize();
    const mx = fwd.x * fz - fwd.z * fx, mz = fwd.z * fz + fwd.x * fx;
    const len = Math.hypot(mx, mz);
    if (len) {
      walking = true;
      kage.position.x += (mx / len) * 16 * dt;
      kage.position.z += (mz / len) * 16 * dt;
      kageYawTarget = Math.atan2(mx, mz);
      // Stay in the village and out of the buildings.
      const r = Math.hypot(kage.position.x, kage.position.z);
      if (r > 34) kage.position.multiplyScalar(34 / r);
      buildings.forEach((b) => {
        const d = tmp.subVectors(kage.position, b.group.position).setY(0);
        const min = b.def.footprint + 1;
        if (d.length() < min) kage.position.copy(b.group.position).addScaledVector(d.normalize(), min).setY(0);
      });
    }
    // Walking up to a building's door opens it.
    const door = buildings.find((b) => tmp.subVectors(kage.position, b.group.position).setY(0).length() < b.def.footprint + 2.6);
    if (door && door !== autoDoor && !focus) { autoDoor = door; held.clear(); openPanel(door.def.panel); }
    else if (!door) autoDoor = null;
    $('wHint').textContent = 'Arrow keys or WASD to walk · walk to a door to open it';
  }
  if (!walking) kageYawTarget = Math.atan2(camera.position.x - kage.position.x, camera.position.z - kage.position.z);
  // Kage has arrived (or is taking too long): present the panel from his hand.
  if (presentPending !== null && (!walking || clock.elapsedTime - presentPending > 2.4)) {
    presentPending = null;
    if (focus) kage.userData.setPresenting(true);
    kage.userData.handWorld(tmp).project(camera);
    const r = panelEl.getBoundingClientRect();
    const hx = (tmp.x * 0.5 + 0.5) * innerWidth, hy = (-tmp.y * 0.5 + 0.5) * innerHeight;
    panelEl.style.transformOrigin = focus ? `${hx - r.left}px ${hy - r.top}px` : '';
    panelEl.classList.add('open');
  }
  kage.rotation.y += (((kageYawTarget - kage.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * (walking ? 8 : 3));
  kage.userData.setTalking(speech.visible && !walking);
  kage.userData.animate(t, walking, dt);
  kageLight.position.set(kage.position.x + 1.5, 4.2, kage.position.z + 2.5);
  speech.tick(t);

  if (!reduceMotion) {
    emblem.rotation.z = t * 0.1;
    buildings.forEach((b) => b.group.userData.animate?.(t));
    animated.forEach((o) => o.userData.animate(t));
    const w = wind(t);
    weather?.update(dt, t, w, kage.position);
    rays.update(t);
    eagle.update(t);
    const hb = !focus && buildings.find((b) => b.hovered);
    trail.point(kage.position, hb ? doorOf(hb) : null);
    trail.update(t, dt);
    fireflies?.update(t);
  }
  lanterns.flicker(t);

  // Labels follow their buildings; hidden behind the hero.
  const showLabels = document.body.classList.contains('exploring');
  for (const b of buildings) {
    // Hover: the building rises and swells slightly so it reads as clickable.
    b.hoverT = (b.hoverT || 0) + ((b.hovered ? 1 : 0) - (b.hoverT || 0)) * Math.min(1, dt * 10);
    b.group.scale.setScalar(1 + 0.07 * b.hoverT);
    b.group.position.y = 0.5 * b.hoverT;
    tmp.copy(b.group.position).setY(b.labelY).project(camera);
    const vis = showLabels && tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
    b.labelEl.style.opacity = vis ? (focus && focus !== b ? 0.35 : 1) : 0;
    if (vis) b.labelEl.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -100%)`;
  }
  if (speech.visible) {
    tmp.copy(kage.position).setY(3.7).project(camera);
    const x = (tmp.x * 0.5 + 0.5) * innerWidth, y = (-tmp.y * 0.5 + 0.5) * innerHeight;
    const onScreen = tmp.z < 1 && x > 0 && x < innerWidth && y > 0 && y < innerHeight;
    kageEl.style.opacity = onScreen ? '' : '0';
    const maxX = (focus && !narrow() ? panelEl.getBoundingClientRect().left : innerWidth) - kageEl.offsetWidth - 12;
    kageEl.style.transform = `translate(${Math.max(12, Math.min(maxX, x - 28))}px, ${Math.max(70, y - kageEl.offsetHeight - 10)}px)`;
  }

  if (composer) composer.render(); else renderer.render(scene, camera);
  if (++frames === 2) $('wLoader').classList.add('done');
}

if (renderer) {
  renderer.compile(scene, camera);
  renderer.setAnimationLoop(step);
} else {
  $('wLoader').classList.add('done');
}
addEventListener('pageshow', (e) => { if (e.persisted) $('wLoader').classList.add('done'); });
import('../kage/widget.js').then((m) => m.mountKage());

// Deep links: /#publications opens straight to that panel.
const initial = location.hash.slice(1);
if (PANELS[initial]) openPanel(initial, { push: false });


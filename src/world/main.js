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
import { makeWindTrail, makeKites, makeBlossomShrubs, makeStream } from './flair.js';
import { makeVillageLife } from './village.js';
import { makeKoi, makeSkyLanterns, makeClouds, makeShootingStars, makeButterflies } from './extras.js';
import { makeKage } from './kageModel.js';
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
    sky: [0x06050a, 0x2a0c14, 0x0a0508], fog: 0x120a10, ground: 0x1a1418, path: 0x342a30,
    hemiSky: 0x6a5070, hemiGround: 0x221414, hemi: 1.15, moon: 0xffa08a, moonI: 1.6, exposure: 1.25,
    lantern: 0.9, bloom: 0.5, mountains: [0x22121a, 0x170c12], night: true,
  },
  light: {
    sky: [0xbfd3e6, 0xf3dcc0, 0xe9dccb], fog: 0xead9c4, ground: 0xcdbfa8, path: 0xb3a48c,
    hemiSky: 0xfff1dc, hemiGround: 0x8a6f55, hemi: 1.0, moon: 0xffe2b8, moonI: 2.3, exposure: 1.05,
    lantern: 0.25, bloom: 0.2, mountains: [0x9c8f9c, 0xb7aab4], night: false,
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
const POND = mid(6, 27);
const pondObj = (() => { const [x, z, a] = POND; const pond = makePond(x, z, -a); scene.add(pond); animated.push(pond); return pond; })();
const koi = reduceMotion ? null : makeKoi(POND[0], POND[1], { count: lowPower ? 4 : 7 });
if (koi) scene.add(koi.group);
const avoid = buildings.map((b) => b.group.position);
const groves = [1, 3, 5].map((i) => { const [x, z] = mid(i, 31); const b = makeBamboo(x, z, lowPower ? 6 : 10); scene.add(b); avoid.push(b.position); return b.position; });
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
  const ban = makeBanner(Math.cos(a) * 8.6, Math.sin(a) * 8.6, i % 2 ? 0x8b1a1a : 0x1d1b24);
  ban.lookAt(0, 0, 0); scene.add(ban); animated.push(ban);
}
scene.add(makeRocks(lowPower ? 22 : 40, 33, 70));
// A stream winds in from the forest and feeds the pond.
const stream = (() => {
  const a = POND[2];
  const pts = [30.5, 38, 48, 58, 70, 88].map((r, i) => { const w = a + Math.sin(i * 1.7) * 0.12; return [Math.cos(w) * r, Math.sin(w) * r]; });
  pts.forEach(([x, z]) => avoid.push(new THREE.Vector3(x, 0, z)));
  return makeStream(pts);
})();
scene.add(stream.mesh);
// Village life: forge smoke, a waterwheel and a small bridge on the stream, stone lanterns lit at dusk.
const forge = buildings.find((b) => b.def.style === 'forge');
if (forge) forge.group.updateMatrixWorld(true);
const village = makeVillageLife({ stream, lowPower, forgeChimney: forge && forge.group.localToWorld(new THREE.Vector3(2.6, 8.1, -1.4)) });
scene.add(village.group);
avoid.push(...village.footprints);
scene.add(makeBlossomShrubs({ count: lowPower ? 15 : 30, inner: 32, outer: 50, avoid: [...avoid, ...buildings.map((b) => new THREE.Vector3(Math.cos(b.angle), 0, Math.sin(b.angle)).multiplyScalar(RADIUS - b.def.footprint - 2.2))] }));
const season = currentSeason();
document.documentElement.dataset.season = season;
scene.add(makeTreeInstances({ count: lowPower ? 90 : 190, inner: 33, outer: 85, avoid }));

const lanterns = makeLanterns({ count: 12, radius: 19.6 }); scene.add(lanterns.group);
const weather = reduceMotion ? null : makeWeather(season, { lowPower });
if (weather) scene.add(weather.group);
const trail = makeWindTrail(); scene.add(trail.object);
const kites = makeKites({ count: lowPower ? 1 : 2 }); scene.add(kites.group);
const fireflies = reduceMotion ? null : makeFireflies(lowPower ? 30 : 60);
if (fireflies) scene.add(fireflies.points);
// Night: sky lanterns and shooting stars. Day: drifting clouds and butterflies.
const skyLanterns = reduceMotion ? null : makeSkyLanterns({ count: lowPower ? 10 : 18 });
if (skyLanterns) scene.add(skyLanterns.group);
const shooting = reduceMotion ? null : makeShootingStars();
if (shooting) scene.add(shooting.object);
const clouds = makeClouds({ count: lowPower ? 4 : 7 }); scene.add(clouds.group);
const butterflies = reduceMotion ? null : makeButterflies({ count: lowPower ? 8 : 14 });
if (butterflies) scene.add(butterflies.group);

// ── Kage, the guide: waits in the plaza and walks to whichever building is opened ──
const kage = makeKage();
const KAGE_HOME = new THREE.Vector3(0, 0, 0); // centre of the red ring
kage.position.copy(KAGE_HOME);
scene.add(kage);
const kageLight = new THREE.PointLight(0xffc89a, 14, 9, 1.6);
scene.add(kageLight);
let kageYawTarget = 0;
const KAGE_SPEED = 6.5; // a relaxed jog, units per second (Kage is 3 units tall)
let kageSpeed = 0;
let route = []; // waypoints: the most direct line, bending only around what is in the way
// Things Kage must not walk through: buildings, the pond and its bridge, bamboo, lanterns, banners.
const obstacles = [];
const blocked = (a, b, skip) => {
  // First obstacle the segment a→b passes through (ignoring ones that contain either end).
  let best = null, bestT = Infinity;
  const dx = b.x - a.x, dz = b.z - a.z, len2 = dx * dx + dz * dz || 1;
  for (const o of obstacles) {
    if (o === skip) continue;
    if (Math.hypot(a.x - o.x, a.z - o.z) < o.r || Math.hypot(b.x - o.x, b.z - o.z) < o.r) continue;
    const t = Math.max(0, Math.min(1, ((o.x - a.x) * dx + (o.z - a.z) * dz) / len2));
    const cx = a.x + dx * t, cz = a.z + dz * t;
    if (Math.hypot(cx - o.x, cz - o.z) < o.r && t < bestT) { best = { o, cx, cz }; bestT = t; }
  }
  return best;
};
function plan(a, b, depth = 0) {
  const hit = depth < 6 && blocked(a, b);
  if (!hit) return [b];
  // Step around the obstacle on the side the straight line already passes (the shorter way round).
  const { o, cx, cz } = hit;
  let nx = cx - o.x, nz = cz - o.z, n = Math.hypot(nx, nz);
  if (n < 1e-3) { nx = -(b.z - a.z); nz = b.x - a.x; n = Math.hypot(nx, nz) || 1; }
  const p = new THREE.Vector3(o.x + (nx / n) * (o.r + 0.9), 0, o.z + (nz / n) * (o.r + 0.9));
  return [...plan(a, p, depth + 1), ...plan(p, b, depth + 1)];
}
function routeTo(target) {
  const from = kage.position.clone().setY(0);
  const pts = [from, ...plan(from, target.clone().setY(0))];
  // Pull the string tight: skip any waypoint that has a clear line past it.
  const out = [];
  for (let i = 0; i < pts.length - 1;) {
    let j = pts.length - 1;
    while (j > i + 1 && blocked(pts[i], pts[j])) j--;
    out.push(pts[j]);
    i = j;
  }
  route = out;
}
buildings.forEach((b) => obstacles.push({ x: b.group.position.x, z: b.group.position.z, r: b.def.footprint + 1.1 }));
obstacles.push({ x: POND[0], z: POND[1], r: 5.9 }); // pond, stone rim and bridge ends
groves.forEach((g) => obstacles.push({ x: g.x, z: g.z, r: 2.8 }));
for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + Math.PI / 12; obstacles.push({ x: Math.cos(a) * 19.6, z: Math.sin(a) * 19.6, r: 0.9 }); }
for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; obstacles.push({ x: Math.cos(a) * 8.6, z: Math.sin(a) * 8.6, r: 0.7 }); }
const doorOf = (b) => new THREE.Vector3(Math.cos(b.angle), 0, Math.sin(b.angle)).multiplyScalar(RADIUS - b.def.footprint - 2.2);

const goldenNow = () => { const d = new Date(); return location.search.includes('golden') || d.getMinutes() === 0 && d.getSeconds() < 20; };
let golden = goldenNow();
setInterval(() => { const g = goldenNow(); if (g !== golden) { golden = g; applyTheme(); } }, 1000);
function applyTheme() {
  let p = PALETTES[theme()];
  // Golden hour: for the first 20 seconds of every hour the village glows amber.
  if (goldenNow()) p = p.night
    ? { ...p, sky: [0x2a1408, 0x8a4a18, 0x3a1a0a], fog: 0x3a2010, hemiSky: 0xffb070, moon: 0xffa040, moonI: 3.2 }
    : { ...p, sky: [0xf2b46a, 0xf7d29a, 0xf4e2c4], fog: 0xf0d2a4, hemiSky: 0xffd9a0, moon: 0xffb050, moonI: 2.8, mountains: [0xc08a68, 0xd8ae88] };
  sky.set(...p.sky);
  scene.fog.color.set(p.fog);
  groundMat.color.set(theme() === 'light' ? SEASONS[season].ground : p.ground); pathMat.color.set(p.path);
  hemi.color.set(p.hemiSky); hemi.groundColor.set(p.hemiGround); hemi.intensity = p.hemi;
  moonLight.color.set(p.moon); moonLight.intensity = p.moonI;
  mountains.userData.mats.forEach((m, i) => m.color.set(p.mountains[i]));
  stream.setNight(p.night); village.setNight(p.night); pondObj.userData.setNight?.(p.night); moon.setNight(p.night); stars.visible = p.night; fireflies?.setVisible(p.night);
  skyLanterns?.setVisible(p.night); shooting?.setVisible(p.night); clouds.setVisible(!p.night); butterflies?.setVisible(!p.night);
  if (renderer) renderer.toneMappingExposure = p.exposure;
  if (bloom) bloom.strength = p.bloom;
  lanterns.setIntensity(p.lantern);
  buildings.forEach((b) => b.group.userData.setGlow?.(p.lantern));
  $('wTheme').textContent = p.night ? '☾' : '☀';
}
$('wTheme').addEventListener('click', () => {
  const next = theme() === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('sai-theme', next); } catch (e) {} // a manual choice sticks
  applyTheme();
});
// Without a manual choice the village follows the visitor's clock: day 07:00-19:00, night otherwise.
const storedTheme = () => { try { return localStorage.getItem('sai-theme'); } catch (e) { return null; } };
const clockTheme = () => { const h = new Date().getHours(); return h >= 7 && h < 19 ? 'light' : 'dark'; };
if (!storedTheme()) document.documentElement.dataset.theme = clockTheme();
setInterval(() => {
  if (storedTheme() || theme() === clockTheme()) return;
  document.documentElement.dataset.theme = clockTheme();
  applyTheme();
}, 60000);
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
  // Sections without a village panel (Skills) link straight to their page.
  if (!PANELS[id]) {
    menuEl.insertAdjacentHTML('beforeend', `<a href="/sections/${id}.html">${id[0].toUpperCase() + id.slice(1)}</a>`);
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
    routeTo(doorOf(focus));
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
  routeTo(KAGE_HOME);
  if (push && location.hash) history.pushState(null, '', location.pathname);
  document.title = 'Sai Kiran Kumar Nalla, PhD | Medical Imaging Scientist & AI Builder';
}
$('wPanelClose').addEventListener('click', () => closePanel());
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePanel(); closeMenu(); } });

// ── Keyboard access: arrows / WASD also walk Kage, Enter at a door goes in (not advertised) ──
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
$('wViewWork').addEventListener('click', () => { hideHero(); greeted = true; speech.say("Welcome to the village. Click any building, or pick a section from the menu.", clock.elapsedTime, 5000); });
$('wHome').addEventListener('click', (e) => { e.preventDefault(); closePanel(); heroEl.classList.remove('gone'); document.body.classList.remove('exploring'); });
const GREETINGS = [['ようこそ', 'ja'], ['Welcome', 'en'], ['నమస్కారం', 'te'], ['नमस्ते', 'hi'], ['Bonjour', 'fr']];
let greetIdx = 0;
// "I am a …": each role fades out and the next one fades in.
const ROLES = ['a researcher', 'a medical imaging scientist', 'an engineer', 'an agentic AI builder', 'a game maker', 'a writer', 'a jack of all trades'];
let roleIdx = 0;
setInterval(() => {
  if (heroEl.classList.contains('gone')) return;
  const w = $('wWord');
  if (!w) return;
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
// The overview camera leans gently toward the cursor (a small parallax, desktop only).
const lean = { x: 0, y: 0, tx: 0, ty: 0 };
if (!isTouch && !reduceMotion) addEventListener('pointermove', (e) => { lean.tx = (e.clientX / innerWidth) * 2 - 1; lean.ty = (e.clientY / innerHeight) * 2 - 1; });
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
let debugCam = null; // dev only: window.__village.view(pos, look)
function step(fixedDt) {
  let dt;
  if (typeof fixedDt === 'number') { clock.elapsedTime += fixedDt; dt = fixedDt; } else dt = Math.min(clock.getDelta(), 0.05);
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
    lean.x += (lean.tx - lean.x) * Math.min(1, dt * 2); lean.y += (lean.ty - lean.y) * Math.min(1, dt * 2);
    wantPos.set(Math.cos(a + lean.x * 0.06) * r, (narrow() ? 38 : 30) - lean.y * 4, Math.sin(a + lean.x * 0.06) * r);
    wantLook.set(0, 3, 0);
  }
  const k = 1 - Math.exp(-dt * (focus ? 1.8 : 1.2));
  camPos.lerp(wantPos, k);
  camLook.lerp(wantLook, k);
  camera.position.copy(camPos);
  camera.lookAt(camLook);
  if (import.meta.env.DEV && debugCam) { camera.position.copy(debugCam[0]); camera.lookAt(debugCam[1]); }

  // Kage walks his route; when he arrives he faces the open building (or the camera at home).
  // He eases in and out, and his gait is driven by the distance he actually covers.
  let walking = false, moved = 0;
  const cruise = reduceMotion ? 14 : KAGE_SPEED;
  if (route.length) {
    tmp.subVectors(route[0], kage.position).setY(0);
    let dist = tmp.length();
    // Corner-cut: switch to the next waypoint a little early so turns are smooth arcs.
    if (route.length > 1 && dist < 1.4) { route.shift(); tmp.subVectors(route[0], kage.position).setY(0); dist = tmp.length(); }
    if (route.length === 1 && dist < 0.05) { route.shift(); kageSpeed = 0; }
    else {
      let left = dist;
      for (let i = 1; i < route.length; i++) left += route[i].distanceTo(route[i - 1]);
      const want = Math.min(cruise, Math.sqrt(2 * 9 * left) + 0.6); // brake smoothly before the door
      kageSpeed += (want - kageSpeed) * Math.min(1, dt * (want < kageSpeed ? 10 : 3.5));
      moved = Math.min(dist, kageSpeed * dt);
      kage.position.addScaledVector(tmp.normalize(), moved);
      walking = true;
      kageYawTarget = Math.atan2(tmp.x, tmp.z);
    }
  } else kageSpeed = 0;
  if (held.size) {
    // Move relative to the camera: up walks away from the viewer.
    let fx = 0, fz = 0;
    held.forEach((k) => { fx += KEYS[k][0]; fz += KEYS[k][1]; });
    const fwd = tmp.subVectors(camLook, camPos).setY(0).normalize();
    const mx = fwd.x * fz - fwd.z * fx, mz = fwd.z * fz + fwd.x * fx;
    const len = Math.hypot(mx, mz);
    if (len) {
      walking = true;
      moved = KAGE_SPEED * dt;
      kage.position.x += (mx / len) * moved;
      kage.position.z += (mz / len) * moved;
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
  }
  if (!walking) kageYawTarget = Math.atan2(camera.position.x - kage.position.x, camera.position.z - kage.position.z);
  // Kage has arrived (or is taking too long): present the panel from his hand.
  if (presentPending !== null && (!walking || clock.elapsedTime - presentPending > 6)) {
    presentPending = null;
    if (focus) kage.userData.setPresenting(true);
    kage.userData.handWorld(tmp).project(camera);
    const r = panelEl.getBoundingClientRect();
    const hx = (tmp.x * 0.5 + 0.5) * innerWidth, hy = (-tmp.y * 0.5 + 0.5) * innerHeight;
    panelEl.style.transformOrigin = focus ? `${hx - r.left}px ${hy - r.top}px` : '';
    panelEl.classList.add('open');
  }
  kage.rotation.y += (((kageYawTarget - kage.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * (walking ? 9 : 3));
  kage.userData.setTalking(speech.visible && !walking);
  kage.userData.animate(t, walking && moved > 0, dt, dt > 0 ? moved / dt : 0);
  kageLight.position.set(kage.position.x + 1.5, 4.2, kage.position.z + 2.5);
  speech.tick(t);

  if (!reduceMotion) {
    emblem.rotation.z = t * 0.1;
    buildings.forEach((b) => b.group.userData.animate?.(t));
    animated.forEach((o) => o.userData.animate(t));
    const w = wind(t);
    weather?.update(dt, t, w, kage.position);
    stream.update(t);
    kites.update(t, dt);
    village.update(t, dt, w);
    const hb = !focus && buildings.find((b) => b.hovered);
    trail.point(kage.position, hb ? doorOf(hb) : null);
    trail.update(t, dt);
    koi?.update(t, dt);
    skyLanterns?.update(t, dt, w);
    shooting?.update(t, dt, camera);
    clouds.update(dt, w);
    butterflies?.update(t);
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
  renderer.setAnimationLoop(() => step());
} else {
  $('wLoader').classList.add('done');
}
addEventListener('pageshow', (e) => { if (e.persisted) $('wLoader').classList.add('done'); });
import('../kage/widget.js').then((m) => m.mountKage());
if (import.meta.env.DEV) window.__village = { kage, buildings, openPanel, closePanel, get route() { return route; }, camera, scene, kites, village, view: (p, l) => { debugCam = p ? [new THREE.Vector3(...p), new THREE.Vector3(...l)] : null; }, pond: POND, tick: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) step(dt); } };

// Deep links: /#publications opens straight to that panel.
const initial = location.hash.slice(1);
if (PANELS[initial]) openPanel(initial, { push: false });


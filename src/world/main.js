// 3D home: a calm dōjō village as the backdrop and navigation for the portfolio.
// Menu items and buildings fly the camera to a building and open a content panel beside it.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BUILDINGS, MENU } from './buildings.js';
import { PANELS } from './panels.js';
import { makeBuilding, makeTreeInstances, makeLanterns, makePetals } from './props.js';
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
{ const [x, z, a] = mid(6, 27); const pond = makePond(x, z, -a); scene.add(pond); animated.push(pond); }
const avoid = buildings.map((b) => b.group.position);
[1, 3, 5].forEach((i) => { const [x, z] = mid(i, 31); const b = makeBamboo(x, z, lowPower ? 6 : 10); scene.add(b); avoid.push(b.position); });
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
  const ban = makeBanner(Math.cos(a) * 8.6, Math.sin(a) * 8.6, i % 2 ? 0x8b1a1a : 0x1d1b24);
  ban.lookAt(0, 0, 0); scene.add(ban); animated.push(ban);
}
scene.add(makeRocks(lowPower ? 22 : 40, 33, 70));
scene.add(makeTreeInstances({ count: lowPower ? 46 : 90, inner: 36, outer: 80, avoid }));
const lanterns = makeLanterns({ count: 12, radius: 19.6 }); scene.add(lanterns.group);
const petals = reduceMotion ? null : makePetals({ count: lowPower ? 90 : 160, spread: 80 });
if (petals) scene.add(petals.points);
const fireflies = reduceMotion ? null : makeFireflies(lowPower ? 30 : 60);
if (fireflies) scene.add(fireflies.points);

// ── Kage, the guide, stands in the plaza ──
const kage = makeKageCharacter();
kage.position.set(0, 0, 5);
scene.add(kage);
const kageLight = new THREE.PointLight(0xffc89a, 14, 9, 1.6);
kageLight.position.set(1.5, 4.2, 7.5);
scene.add(kageLight);
let kageYawTarget = 0;

function applyTheme() {
  const p = PALETTES[theme()];
  sky.set(...p.sky);
  scene.fog.color.set(p.fog);
  groundMat.color.set(p.ground); pathMat.color.set(p.path);
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
  try { localStorage.setItem('sai-theme', next); } catch (e) {}
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
function openPanel(id, { push = true } = {}) {
  const def = PANELS[id];
  if (!def) return;
  hideHero();
  $('wPanelKicker').textContent = def.kicker;
  $('wPanelTitle').textContent = def.title;
  $('wPanelBody').innerHTML = def.html();
  $('wPanelBody').scrollTop = 0;
  panelEl.hidden = false;
  requestAnimationFrame(() => panelEl.classList.add('open'));
  Object.entries(menuBtns).forEach(([k, a]) => a.classList.toggle('active', k === id));
  if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  document.title = `${def.title} | Sai Kiran Kumar Nalla, PhD`;
  focus = byPanel[id] || null;
  if (focus) {
    kageYawTarget = Math.atan2(focus.group.position.x - kage.position.x, focus.group.position.z - kage.position.z);
    speech.say(focus.def.kage, clock.elapsedTime, 5000);
  }
  $('wPanelTitle').focus({ preventScroll: true });
}
function closePanel({ push = true } = {}) {
  panelEl.classList.remove('open');
  setTimeout(() => { if (!panelEl.classList.contains('open')) panelEl.hidden = true; }, 400);
  Object.values(menuBtns).forEach((a) => a.classList.remove('active'));
  focus = null;
  kageYawTarget = Math.atan2(camera.position.x - kage.position.x, camera.position.z - kage.position.z);
  if (push && location.hash) history.pushState(null, '', location.pathname);
  document.title = 'Sai Kiran Kumar Nalla, PhD | Medical Imaging Scientist & AI Builder';
}
$('wPanelClose').addEventListener('click', () => closePanel());
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePanel(); closeMenu(); } });
addEventListener('popstate', () => { const id = location.hash.slice(1); if (PANELS[id]) openPanel(id, { push: false }); else closePanel({ push: false }); });

// ── Hero ──
const heroEl = $('wHero');
function hideHero() { heroEl.classList.add('gone'); document.body.classList.add('exploring'); }
// Kage greets once, the first time the visitor drags around the village with no panel open.
let greeted = false;
$('wViewWork').addEventListener('click', () => openPanel('projects'));
$('wHome').addEventListener('click', (e) => { e.preventDefault(); closePanel(); heroEl.classList.remove('gone'); document.body.classList.remove('exploring'); });
const GREETINGS = [['ようこそ', 'ja'], ['Welcome', 'en'], ['నమస్కారం', 'te'], ['नमस्ते', 'hi'], ['Bonjour', 'fr']];
let greetIdx = 0;
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
    buildings.forEach((b) => { b.group.userData.setHover?.(b === hb); b.labelEl.classList.toggle('hover', b === hb); });
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
    // Stand in front of the building, slightly to one side, so the panel doesn't cover it.
    const a = focus.angle + yawOffset * 0.35;
    const dist = narrow() ? 30 : 22;
    wantPos.set(Math.cos(a) * (RADIUS - dist), focus.def.height + 5, Math.sin(a) * (RADIUS - dist));
    wantLook.copy(focus.group.position).setY(focus.def.height * 0.45);
    right.subVectors(wantLook, wantPos).cross(THREE.Object3D.DEFAULT_UP).normalize();
    if (!narrow()) wantLook.addScaledVector(right, 7); // building sits left of centre
    else wantLook.y -= 5; // building sits above the bottom sheet
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

  // Kage turns toward what you're looking at and gestures while talking.
  if (!focus) kageYawTarget = Math.atan2(camera.position.x - kage.position.x, camera.position.z - kage.position.z);
  kage.rotation.y += (((kageYawTarget - kage.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 3);
  kage.userData.setTalking(speech.visible);
  kage.userData.animate(t, false, dt);
  speech.tick(t);

  if (!reduceMotion) {
    emblem.rotation.z = t * 0.1;
    buildings.forEach((b) => b.group.userData.animate?.(t));
    animated.forEach((o) => o.userData.animate(t));
    petals?.update(dt * 0.6, kage.position);
    fireflies?.update(t);
  }
  lanterns.flicker(t);

  // Labels follow their buildings; hidden behind the hero.
  const showLabels = document.body.classList.contains('exploring');
  for (const b of buildings) {
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

// Deep links: /#publications opens straight to that panel.
const initial = location.hash.slice(1);
if (PANELS[initial]) openPanel(initial, { push: false });


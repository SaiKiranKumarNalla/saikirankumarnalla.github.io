// Scroll-driven 3D section pages. Text scrolls in a column on the left; a 3D centrepiece on the right
// is framed by camera keyframes, one per text step. No game controls: scrolling is the only input.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeSky, makeStars } from '../world/atmosphere.js';
import { renderNav } from './nav.js';

const PALETTES = {
  dark: { sky: [0x07060b, 0x1d0a10, 0x07060b], fog: 0x0c080c, hemiSky: 0x7a6a88, hemiGround: 0x1a1012, hemi: 0.9, key: 0xffe2cc, keyI: 2.0, rim: 0xd24a4a, rimI: 3.2, exposure: 1.15, bloom: 0.55, night: true },
  light: { sky: [0xdfe6ee, 0xf3e6d6, 0xefe6da], fog: 0xefe6da, hemiSky: 0xffffff, hemiGround: 0xb9a68e, hemi: 1.1, key: 0xfff1e0, keyI: 2.4, rim: 0xc23b3b, rimI: 1.4, exposure: 1.0, bloom: 0.18, night: false },
};
const theme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
const smooth = (x) => x * x * (3 - 2 * x);

export function runPage({ active, build }) {
  renderNav(active);
  const canvas = document.getElementById('stage');
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || matchMedia('(hover: none)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    document.body.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0, 30, 120);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
  const sky = makeSky(); scene.add(sky.mesh);
  const stars = makeStars(lowPower ? 300 : 600); scene.add(stars);
  const hemi = new THREE.HemisphereLight(); scene.add(hemi);
  const key = new THREE.DirectionalLight(); key.position.set(8, 12, 10); scene.add(key);
  const rim = new THREE.DirectionalLight(); rim.position.set(-10, 4, -8); scene.add(rim);

  let composer = null, bloom = null;
  if (!lowPower) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.5, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // Labels: HTML pinned to 3D points, so text stays crisp and selectable-looking.
  const labelLayer = document.getElementById('labels');
  const labels = [];
  const stage = {
    THREE, scene, camera, renderer, reduceMotion, lowPower,
    label(html, getPos, cls = '') {
      const el = document.createElement('div');
      el.className = `s-label ${cls}`;
      el.innerHTML = html;
      labelLayer.appendChild(el);
      const l = { el, getPos, visible: true };
      labels.push(l);
      return l;
    },
  };

  const page = build(stage);
  const steps = [...document.querySelectorAll('.s-step')];
  const frames = page.keyframes.map((k) => ({ pos: new THREE.Vector3(...k.pos), look: new THREE.Vector3(...k.look) }));

  function applyTheme() {
    const p = PALETTES[theme()];
    sky.set(...p.sky);
    scene.fog.color.set(p.fog);
    hemi.color.set(p.hemiSky); hemi.groundColor.set(p.hemiGround); hemi.intensity = p.hemi;
    key.color.set(p.key); key.intensity = p.keyI;
    rim.color.set(p.rim); rim.intensity = p.rimI;
    stars.visible = p.night;
    renderer.toneMappingExposure = p.exposure;
    if (bloom) bloom.strength = p.bloom;
    page.onTheme?.(p);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = p.night ? '☾' : '☀';
  }
  document.getElementById('themeBtn')?.addEventListener('click', () => {
    const next = theme() === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('sai-theme', next); } catch (e) {}
    applyTheme();
  });
  applyTheme();

  // Progress dots on the right edge.
  const dots = document.getElementById('dots');
  steps.forEach((s, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Go to: ${s.dataset.title || s.querySelector('h2,h1')?.textContent || i + 1}`);
    b.title = s.dataset.title || '';
    b.addEventListener('click', () => s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }));
    dots.appendChild(b);
  });

  // Scroll → continuous step index (0 … steps-1).
  let target = 0, progress = 0;
  function measure() {
    const anchor = scrollY + innerHeight * 0.5;
    const centers = steps.map((s) => s.offsetTop + s.offsetHeight / 2);
    if (anchor <= centers[0]) return 0;
    for (let i = 0; i < centers.length - 1; i++) {
      if (anchor < centers[i + 1]) return i + (anchor - centers[i]) / (centers[i + 1] - centers[i]);
    }
    return centers.length - 1;
  }
  addEventListener('scroll', () => { target = measure(); }, { passive: true });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    target = measure();
  }
  addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), tmp = new THREE.Vector3();
  let currentStep = -1;
  progress = target;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    progress += (target - progress) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 4));
    const i = Math.min(frames.length - 2, Math.floor(progress));
    const f = smooth(Math.max(0, Math.min(1, progress - i)));
    const a = frames[Math.max(0, i)], b = frames[Math.min(frames.length - 1, i + 1)];
    pos.lerpVectors(a.pos, b.pos, f);
    look.lerpVectors(a.look, b.look, f);
    if (!reduceMotion) pos.x += Math.sin(t * 0.25) * 0.25, pos.y += Math.sin(t * 0.33) * 0.15; // gentle drift
    camera.position.copy(pos);
    camera.lookAt(look);

    const step = Math.round(progress);
    if (step !== currentStep) {
      currentStep = step;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === step));
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k === step));
    }
    page.update?.(t, progress, dt);

    for (const l of labels) {
      if (!l.visible) { l.el.style.opacity = 0; continue; }
      tmp.copy(l.getPos()).project(camera);
      const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
      l.el.style.opacity = vis ? '' : 0;
      if (vis) l.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px)`;
    }

    if (composer) composer.render(); else renderer.render(scene, camera);
  });
  document.body.classList.add('ready');
}

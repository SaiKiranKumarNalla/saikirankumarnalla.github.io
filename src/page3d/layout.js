// Layout kit for the section pages: page-wide layouts (hero, splits, bands, grids, journeys) with 3D
// "stages" placed inside the layout, instead of one fixed canvas behind a column of cards.
//
// ── How to use it ────────────────────────────────────────────────────────────────────────────────
// sections/<name>.html: link /src/page3d/layout.css; body = <header id="nav"></header>
//   <main class="lk-main" id="main"></main><footer class="lk-footer">…</footer> + the page module.
//   No #stage canvas, no #labels, no #dots (those belong to engine.js).
// src/page3d/<name>.js:
//   import { mountPage, hero, split, band, sec, head, stage, ... } from './layout.js';
//   mountPage({ active: '<nav id>', html: hero(…) + split(…) + …, stages: { id: builder, … } });
//
// Markup helpers (all return HTML strings; plain-text arguments are escaped, `html` arguments are not):
//   hero({ stage, html, cls })                  full-bleed section; stage fills it, copy sits on a scrim
//   sec(html, { cls, id, wide })                plain section with a centred wrapper (.lk-wrap)
//   split({ text, media, flip, cls, id })       text beside media (a stage or figures); flip = media left
//   band({ stage, over, below, cls, id })       wide stage with an overlay caption on a readable panel
//   head({ kicker, title, lede, level, cls })   section heading block
//   stage(id, { focus, focusM, cls })           a 3D window; focus = "l t r b" fractions where the
//                                               subject is framed (focusM on phones); cls lk-bleed|lk-tall|lk-short
//   fig(f, group) / gallery(figs, group, cls)   zoomable figures ({ src, caption, kicker? }); same group pages
//                                               together in the lightbox
//   grid(cards, cls) / card({ kicker, title, text, html })     card grid (auto-fit columns)
//   stats(items)                                stat strip: [{ value, unit?, label }]
//   bars({ title, unit, items, note })          horizontal bar chart: items [{ label, value, display?, mark? }]
//   steps(items, { id })                        horizontal steps / pipeline band: [{ title, text? }]; vertical on phones
//   timeline(items)                             horizontal timeline: [{ when, title, text }]; vertical on phones
//   tabs(id, items, { variant, aside })         tabs: [{ label, sub?, html }]; variant 'journey' draws the
//                                               tab list as a numbered timeline; aside = HTML beside the panels
//   acc(items)                                  accordion: [{ title, sub?, html, open? }]
//   quote(text, cite) / callout(html, cls)      pull quote / highlighted note
//   cta({ kicker, title, text, links })         closing band; links [{ href, label, ghost?, ext? }]
//   table(t)                                    { head: [], rows: [[]] }, scrolls sideways on phones
//   list(items), chips(items), btn(link), esc(s)
// Reveal on scroll: add class lk-rv (one element) or lk-rv-g (its children, staggered). Helpers already do.
//
// Stage builders: stages[id] = (ctx) => ({ update(t, dt, s), theme(pal) }) — called lazily when the stage
//   first comes near the viewport. ctx = { THREE, scene, camera, el, lowPower, reduceMotion, pal,
//   view, tag(html, getPos, cls), invalidate() }.
//   - Build objects into ctx.scene (lights are provided and follow the theme).
//   - Camera: set ctx.view = { c: Vector3, w, h, dir: Vector3 } and the kit frames that w × h box around c,
//     seen from dir, inside the stage's focus rectangle (and drifts it gently). Set ctx.view = null to drive
//     ctx.camera yourself.
//   - update(t, dt, s): s = { progress 0→1 as the stage crosses the viewport, w, h, narrow }. t is frozen
//     (0) with prefers-reduced-motion, and frames are then drawn only on scroll, resize, theme or invalidate().
//   - tag(): an HTML label pinned to a 3D point (getPos returns a Vector3); set tag.show = false to hide.
//   - pal: { night, ink, accent, hot, … } for the current theme; theme(pal) is called when it changes.
// Events: tabs dispatch 'lk-tab' on document ({ id, index }); steps dispatch 'lk-step' ({ id, index });
//   activeStep(id, index) highlights a step from code; onTab(id, fn) is a shortcut listener.
//
// Rendering: one shared WebGLRenderer draws off-screen and copies each visible stage into that stage's own
// 2D canvas, so the 3D lives in the page flow (never behind text) and only visible stages are drawn. The
// loop stops when no stage is on screen or the tab is hidden. lowPower (phones, ≤4 cores): no antialias,
// pixel ratio ≤1.25, 30 fps. No WebGL: stages keep their CSS backdrop (class lk-nogl).
import * as THREE from 'three';
import { renderNav, wireTheme } from './nav.js';

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || matchMedia('(hover: none)').matches;
const narrowQ = matchMedia('(max-width: 860px)');

// ── Markup helpers ─────────────────────────────────────────────────────────────────────────────
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const list = (items, cls = 'lk-list') => `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
export const chips = (items) => `<div class="lk-chips">${items.map((i) => `<span>${esc(i)}</span>`).join('')}</div>`;
export const btn = (l) => `<a class="lk-btn${l.ghost ? ' lk-btn-g' : ''}" href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`;

export const head = ({ kicker, title, lede, level = 2, cls = '' }) => `<header class="lk-sh lk-rv ${cls}">
    ${kicker ? `<p class="lk-k">${esc(kicker)}</p>` : ''}<h${level}>${esc(title)}</h${level}>${lede ? `<p class="lk-lede">${esc(lede)}</p>` : ''}</header>`;

export const stage = (id, { focus = '0.06 0.06 0.94 0.94', focusM = focus, cls = '' } = {}) =>
  `<div class="lk-stage ${cls}" data-stage="${esc(id)}" data-focus="${focus}" data-focus-m="${focusM}" aria-hidden="true"><canvas></canvas><div class="lk-tags"></div></div>`;

export const hero = ({ stage: st, html, cls = '' }) => `<section class="lk-hero ${cls}">${st}<div class="lk-hero-in"><div class="lk-hero-copy lk-rv">${html}</div></div><p class="lk-cue" aria-hidden="true">Scroll</p></section>`;
export const sec = (html, { cls = '', id = '', wide = false } = {}) => `<section class="lk-sec ${cls}"${id ? ` id="${id}"` : ''}><div class="lk-wrap${wide ? ' lk-wide' : ''}">${html}</div></section>`;
export const split = ({ text, media, flip = false, cls = '', id = '' }) => `<section class="lk-sec lk-split${flip ? ' lk-flip' : ''} ${cls}"${id ? ` id="${id}"` : ''}>
    <div class="lk-split-t lk-rv">${text}</div><div class="lk-split-m">${media}</div></section>`;
export const band = ({ stage: st, over, below = '', cls = '', id = '' }) => `<section class="lk-sec lk-band-sec ${cls}"${id ? ` id="${id}"` : ''}>
    <div class="lk-band">${st}${over ? `<div class="lk-over lk-rv">${over}</div>` : ''}</div>${below ? `<div class="lk-wrap lk-below">${below}</div>` : ''}</section>`;

export const fig = (f, group = 'page', cls = '') => `<figure class="lk-fig ${cls}"><button type="button" class="lk-zoom" data-src="${esc(f.src)}" data-cap="${esc(f.caption)}" data-group="${esc(group)}" aria-label="Enlarge figure: ${esc(f.caption)}">
    <img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy" decoding="async"></button><figcaption>${f.kicker ? `<span>${esc(f.kicker)}</span>` : ''}${esc(f.caption)}</figcaption></figure>`;
export const gallery = (figs, group = 'page', cls = '') => `<div class="lk-gallery lk-rv-g ${cls}">${figs.map((f) => fig(f, group)).join('')}</div>`;

export const card = ({ kicker, title, text, html = '', cls = '' }) => `<article class="lk-card ${cls}">${kicker ? `<span class="lk-card-k">${esc(kicker)}</span>` : ''}${title ? `<h3>${esc(title)}</h3>` : ''}${text ? `<p>${esc(text)}</p>` : ''}${html}</article>`;
export const grid = (cards, cls = '') => `<div class="lk-grid lk-rv-g ${cls}">${cards.join('')}</div>`;

export const stats = (items, cls = '') => `<div class="lk-stats lk-rv-g ${cls}">${items.map((s) => `<div class="lk-stat"><b>${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ''}</b><span>${esc(s.label)}</span></div>`).join('')}</div>`;
export const bars = ({ title, unit = '', items, note = '', cls = '' }) => {
  const max = Math.max(...items.map((i) => i.value));
  return `<figure class="lk-bars lk-rv ${cls}">${title ? `<figcaption>${esc(title)}</figcaption>` : ''}<ul>${items.map((i) => `<li${i.mark ? ' class="lk-mark"' : ''}><span>${esc(i.label)}</span><i data-v="${(i.value / max).toFixed(4)}"></i><b>${esc(i.display ?? `${i.value}${unit ? ` ${unit}` : ''}`)}</b></li>`).join('')}</ul>${note ? `<p class="lk-bars-n">${esc(note)}</p>` : ''}</figure>`;
};
export const steps = (items, { id = '', cls = '' } = {}) => `<ol class="lk-steps lk-rv-g ${cls}"${id ? ` data-steps="${esc(id)}"` : ''}>${items.map((s, i) => `<li><button type="button" class="lk-step" data-i="${i}"${id ? '' : ' tabindex="-1"'}><span class="lk-step-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(s.title)}</b>${s.text ? `<span class="lk-step-t">${esc(s.text)}</span>` : ''}</button></li>`).join('')}</ol>`;
export const timeline = (items, cls = '') => `<ol class="lk-tl lk-rv-g ${cls}">${items.map((s) => `<li><span class="lk-tl-dot" aria-hidden="true"></span><time>${esc(s.when)}</time><b>${esc(s.title)}</b>${s.text ? `<p>${esc(s.text)}</p>` : ''}</li>`).join('')}</ol>`;
export const tabs = (id, items, { variant = '', aside = '', cls = '' } = {}) => `<div class="lk-tabs${variant ? ` lk-tabs-${variant}` : ''} ${cls}" data-tabs="${esc(id)}">
    <div class="lk-tablist lk-rv-g" role="tablist">${items.map((t, i) => `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}"><span class="lk-tab-n" aria-hidden="true">${i + 1}</span><b>${esc(t.label)}</b>${t.sub ? `<span class="lk-tab-s">${esc(t.sub)}</span>` : ''}</button>`).join('')}</div>
    <div class="lk-tabs-body${aside ? ' lk-has-aside' : ''}"><div class="lk-panels">${items.map((t, i) => `<div class="lk-panel" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"${i ? ' hidden' : ''}>${t.html}</div>`).join('')}</div>${aside ? `<div class="lk-aside">${aside}</div>` : ''}</div></div>`;
export const acc = (items, cls = '') => `<div class="lk-acc ${cls}">${items.map((i) => `<details class="lk-d"${i.open ? ' open' : ''}><summary>${esc(i.title)}${i.sub ? ` <span>${esc(i.sub)}</span>` : ''}</summary><div class="lk-d-b">${i.html}</div></details>`).join('')}</div>`;
export const quote = (text, cite = '', cls = '') => `<blockquote class="lk-quote lk-rv ${cls}"><p>${esc(text)}</p>${cite ? `<cite>${esc(cite)}</cite>` : ''}</blockquote>`;
export const callout = (html, cls = '') => `<aside class="lk-callout lk-rv ${cls}">${html}</aside>`;
export const cta = ({ kicker, title, text, links = [], cls = '' }) => `<section class="lk-sec lk-cta ${cls}"><div class="lk-wrap lk-rv">
    ${kicker ? `<p class="lk-k">${esc(kicker)}</p>` : ''}<h2>${esc(title)}</h2>${text ? `<p class="lk-lede">${esc(text)}</p>` : ''}<div class="lk-btns">${links.map(btn).join('')}</div></div></section>`;
export const table = (t) => `<div class="lk-table"><table><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c, j) => (j ? `<td>${esc(c)}</td>` : `<td><b>${esc(c)}</b></td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;

// ── Events ─────────────────────────────────────────────────────────────────────────────────────
export const onTab = (id, fn) => document.addEventListener('lk-tab', (e) => { if (e.detail.id === id) fn(e.detail.index); });
export function activeStep(id, index) {
  document.querySelectorAll(`.lk-steps[data-steps="${CSS.escape(id)}"] .lk-step`).forEach((b, i) => b.classList.toggle('on', i === index));
}

// ── Page ───────────────────────────────────────────────────────────────────────────────────────
export function mountPage({ active, html, stages = {}, kage = true }) {
  renderNav(active);
  wireTheme();
  document.documentElement.classList.add('lk');
  document.getElementById('main').innerHTML = html;
  initReveal();
  initBars();
  initLightbox();
  initTabs();
  initSteps();
  initStages(stages);
  document.body.classList.add('ready');
  if (kage) import('../kage/widget.js').then((m) => m.mountKage());
}

function initReveal() {
  document.querySelectorAll('.lk-rv-g').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 8))));
  const els = [...document.querySelectorAll('.lk-rv, .lk-rv-g')];
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  els.forEach((el) => io.observe(el));
}

function initBars() {
  document.querySelectorAll('.lk-bars i[data-v]').forEach((i) => i.style.setProperty('--v', i.dataset.v));
}

function initLightbox() {
  const root = document.documentElement;
  const lb = document.createElement('dialog');
  lb.className = 'lk-lb';
  lb.setAttribute('aria-label', 'Figure');
  lb.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lk-x" aria-label="Close">×</button>
    <button type="button" class="lk-lb-p" aria-label="Previous figure">←</button><button type="button" class="lk-lb-n" aria-label="Next figure">→</button>
    <p class="lk-lb-c" aria-live="polite"></p>`;
  document.body.appendChild(lb);
  const img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), count = lb.querySelector('.lk-lb-c');
  let group = [], gi = 0;
  const show = (i) => {
    gi = (i + group.length) % group.length;
    const b = group[gi];
    img.src = b.dataset.src; img.alt = b.dataset.cap; cap.textContent = b.dataset.cap;
    count.textContent = group.length > 1 ? `${gi + 1} / ${group.length}` : '';
    lb.classList.toggle('lk-single', group.length < 2);
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.lk-zoom');
    if (!b) return;
    group = [...document.querySelectorAll(`.lk-zoom[data-group="${CSS.escape(b.dataset.group)}"]`)];
    show(group.indexOf(b));
    root.classList.add('lk-lock');
    lb.showModal();
  });
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => root.classList.remove('lk-lock'));
  lb.querySelector('.lk-x').addEventListener('click', () => lb.close());
  lb.querySelector('.lk-lb-p').addEventListener('click', () => show(gi - 1));
  lb.querySelector('.lk-lb-n').addEventListener('click', () => show(gi + 1));
  lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(gi - 1); if (e.key === 'ArrowRight') show(gi + 1); });
}

function initTabs() {
  document.querySelectorAll('.lk-tabs').forEach((t) => {
    const id = t.dataset.tabs;
    const btns = [...t.querySelector('.lk-tablist').children];
    const panels = [...t.querySelector('.lk-panels').children];
    const select = (i, focus = false) => {
      btns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => { p.hidden = k !== i; });
      if (focus) btns[i].focus();
      t.dataset.at = i;
      document.dispatchEvent(new CustomEvent('lk-tab', { detail: { id, index: i } }));
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => select(i));
      b.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (d) { e.preventDefault(); select((i + d + btns.length) % btns.length, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(btns.length - 1, true); }
      });
    });
    t.dataset.at = 0;
  });
}

function initSteps() {
  document.querySelectorAll('.lk-steps[data-steps]').forEach((s) => s.addEventListener('click', (e) => {
    const b = e.target.closest('.lk-step');
    if (!b) return;
    activeStep(s.dataset.steps, +b.dataset.i);
    document.dispatchEvent(new CustomEvent('lk-step', { detail: { id: s.dataset.steps, index: +b.dataset.i } }));
  }));
}

// ── Stages ─────────────────────────────────────────────────────────────────────────────────────
const PAL = {
  dark: { night: true, hemiSky: 0x7a6a88, hemiGround: 0x1a1012, hemi: 0.9, key: 0xffe2cc, keyI: 2.0, rim: 0xd24a4a, rimI: 3.2, exposure: 1.15,
    ink: 0xf2ece4, inkSoft: 0xd9cfbf, accent: 0xd24a4a, hot: 0xff5a3c, warm: 0xffc46b, deep: 0x1e1216, solid: 0x3a3038, glow: THREE.AdditiveBlending },
  light: { night: false, hemiSky: 0xffffff, hemiGround: 0xb9a68e, hemi: 1.15, key: 0xfff1e0, keyI: 2.4, rim: 0xc23b3b, rimI: 1.2, exposure: 1.0,
    ink: 0x2a2226, inkSoft: 0x5a4e4a, accent: 0xa32424, hot: 0xd8401f, warm: 0xd68a1c, deep: 0x2a1a1e, solid: 0x6a5c60, glow: THREE.NormalBlending },
};
const themeName = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function initStages(builders) {
  const els = [...document.querySelectorAll('.lk-stage[data-stage]')].filter((el) => builders[el.dataset.stage]);
  if (!els.length) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: lowPower ? 'low-power' : 'high-performance' });
  } catch (e) {
    els.forEach((el) => el.classList.add('lk-nogl'));
    return;
  }
  const DPR = Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75);
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);
  const src = renderer.domElement;
  let RW = 0, RH = 0; // renderer size in CSS px; grows to fit the largest stage drawn
  let pal = PAL[themeName()];

  const S = els.map((el) => {
    const nums = (k) => el.dataset[k].split(' ').map(Number);
    return { el, id: el.dataset.stage, canvas: el.querySelector('canvas'), tags: el.querySelector('.lk-tags'), focus: nums('focus'), focusM: nums('focusM'), built: false, on: false, ctx: null, api: null, list: [] };
  });

  function lights(s) {
    const { hemi, key, rim } = s.lights;
    hemi.color.set(pal.hemiSky); hemi.groundColor.set(pal.hemiGround); hemi.intensity = pal.hemi;
    key.color.set(pal.key); key.intensity = pal.keyI;
    rim.color.set(pal.rim); rim.intensity = pal.rimI;
  }
  function build(s) {
    if (s.built) return;
    s.built = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
    const hemi = new THREE.HemisphereLight(); const key = new THREE.DirectionalLight(); const rim = new THREE.DirectionalLight();
    key.position.set(8, 12, 10); rim.position.set(-10, 4, -8);
    scene.add(hemi, key, rim);
    s.lights = { hemi, key, rim };
    lights(s);
    s.g = s.canvas.getContext('2d');
    const ctx = {
      THREE, scene, camera, el: s.el, lowPower, reduceMotion, view: null, drift: true,
      get pal() { return pal; },
      invalidate() { dirty = true; kick(); },
      tag(html, getPos, cls = '') {
        const el = document.createElement('div');
        el.className = `lk-tag ${cls}`;
        el.innerHTML = html;
        s.tags.appendChild(el);
        const t = { el, getPos, show: true, op: -1 };
        s.list.push(t);
        return t;
      },
    };
    s.ctx = ctx;
    s.api = builders[s.id](ctx) || {};
    s.api.theme?.(pal);
  }

  // Near the viewport: build. In the viewport: draw.
  const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) build(S.find((s) => s.el === e.target)); }), { rootMargin: '400px 0px' });
  const seen = new IntersectionObserver((es) => {
    es.forEach((e) => { const s = S.find((x) => x.el === e.target); s.on = e.isIntersecting; if (s.on) build(s); });
    dirty = true; kick();
  }, { threshold: 0 });
  S.forEach((s) => { near.observe(s.el); seen.observe(s.el); });

  new MutationObserver(() => {
    pal = PAL[themeName()];
    S.forEach((s) => { if (s.built) { lights(s); s.api.theme?.(pal); } });
    dirty = true; kick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let dirty = true, raf = 0, last = 0, clock = 0;
  const kickR = () => { dirty = true; kick(); };
  addEventListener('scroll', () => { if (reduceMotion) kickR(); }, { passive: true });
  addEventListener('resize', kickR);
  document.addEventListener('lk-tab', kickR);
  document.addEventListener('lk-step', kickR);
  document.addEventListener('visibilitychange', kick);
  function kick() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  const tmp = new THREE.Vector3();
  const TAN = Math.tan((35 * Math.PI) / 360);
  function frameView(s, w, h, t) {
    const v = s.ctx.view, cam = s.ctx.camera;
    cam.aspect = w / h;
    if (!v) { cam.clearViewOffset(); cam.updateProjectionMatrix(); return; }
    const [l, tp, r, b] = narrowQ.matches ? s.focusM : s.focus;
    const Rx = w * l, Ry = h * tp, Rw = Math.max(40, w * (r - l)), Rh = Math.max(40, h * (b - tp));
    const dist = Math.max(v.w / ((Rw / w) * 2 * TAN * cam.aspect), v.h / ((Rh / h) * 2 * TAN));
    cam.setViewOffset(w, h, w / 2 - (Rx + Rw / 2), h / 2 - (Ry + Rh / 2), w, h);
    tmp.copy(v.dir).normalize();
    cam.position.copy(v.c).addScaledVector(tmp, dist);
    if (s.ctx.drift && !reduceMotion) { cam.position.x += Math.sin(t * 0.21) * 0.012 * dist; cam.position.y += Math.sin(t * 0.29) * 0.008 * dist; }
    cam.near = Math.max(0.05, dist * 0.02); cam.far = dist * 20 + 50;
    cam.updateProjectionMatrix();
    cam.lookAt(v.c);
  }

  function draw(s, t, dt) {
    const r = s.el.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w < 2 || h < 2) return;
    const cw = Math.round(w * DPR), ch = Math.round(h * DPR);
    if (s.canvas.width !== cw || s.canvas.height !== ch) { s.canvas.width = cw; s.canvas.height = ch; }
    if (w > RW || h > RH) { RW = Math.max(RW, w); RH = Math.max(RH, h); renderer.setSize(RW, RH, false); }
    const H = innerHeight;
    s.api.update?.(t, dt, { progress: clamp01((H - r.top) / (H + r.height)), w, h, narrow: narrowQ.matches });
    frameView(s, w, h, t);
    renderer.toneMappingExposure = pal.exposure;
    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    renderer.clear();
    renderer.render(s.ctx.scene, s.ctx.camera);
    s.g.clearRect(0, 0, cw, ch);
    s.g.drawImage(src, 0, Math.max(0, src.height - ch), cw, ch, 0, 0, cw, ch);
    // Pinned labels.
    s.ctx.scene.updateMatrixWorld();
    for (const tg of s.list) {
      let op = 0;
      if (tg.show) {
        tmp.copy(tg.getPos()).project(s.ctx.camera);
        if (tmp.z < 1 && Math.abs(tmp.x) < 1.02 && Math.abs(tmp.y) < 1.02) {
          op = 1;
          tg.el.style.transform = `translate3d(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px,0)`;
        }
      }
      if (op !== tg.op) { tg.el.classList.toggle('on', op > 0); tg.op = op; }
    }
  }

  function frame(now) {
    raf = 0;
    const live = S.filter((s) => s.on && s.built);
    if (!live.length || document.hidden) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); // rAF can report a time just before `last`
    if (lowPower && !reduceMotion && dt < 1 / 32) { raf = requestAnimationFrame(frame); return; } // ~30 fps
    last = now;
    clock += dt;
    if (!reduceMotion || dirty) {
      dirty = false;
      const t = reduceMotion ? 0 : clock;
      for (const s of live) draw(s, t, reduceMotion ? 0.016 : dt);
    }
    if (!reduceMotion) raf = requestAnimationFrame(frame);
  }
  kick();
}

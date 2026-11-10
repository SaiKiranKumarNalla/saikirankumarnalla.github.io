// VeriTomiX: a physics-based test bench for medical imaging, with CASSOULET as its simulation engine.
// Organisation-style page: full-bleed hero, alternating split sections, wide bands, a case-study grid with a
// study viewer, a horizontal timeline and a closing band. One 3D scene drives every "stage" on the page:
// each section carries a .vx-stage window; the scene is composed into whichever window is in view and the
// canvas is clipped to it, so the 3D never sits behind body text.
//   0 Hero        the scanner model and the CASSOULET abdominal phantom waiting on the couch.
//   1 Why         lesions of known size and uptake appear inside the phantom (the answer key).
//   2 CASSOULET   the phantom slides into the gantry; photon pairs fire on the detector ring.
//   3 Scanners    emulated, research-based Discovery MI 5-ring and Omni Legend 32 models (tabs).
//   4 Phantoms    the abdominal phantom and its lesions, or the NEMA IEC phantom (picker).
//   5 Pipeline    data leave the scanner: sinogram -> reconstructed slice -> evaluation dataset.
//   6 Validation  the NEMA IEC phantom takes the phantom's place (physical validation case studies).
//   7 Simulation  reconstruction and dataset (simulation case studies).
//   8 Timeline    one 2D slice (MATLAB) against the full 3D volume (Python, GPU).
//   9 Goals       the dataset grid is scored against truth (gauge).
//  10 Team        scanner and phantom become a glowing physics-informed digital twin (future goal).
// The real phantom mesh loads lazily; a light procedural stand-in is shown until it arrives.
// Reduced motion shows one still, fully labelled frame per stage; low-power devices get fewer effects,
// and the scene is not drawn at all while no stage is on screen.
import vtx from '../../content/veritomix.json';
import { runPage } from './engine.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SCANNERS, buildScanner } from './veritomix-scanners.js';
import { loadAbdominalPhantom, buildNema } from './veritomix-phantom.js';
import { initUI } from './veritomix-ui.js';
import './veritomix.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (a, cls = 'vx-list') => `<ul class="${cls}">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
const chips = (a) => `<div class="vx-chips">${a.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;
// A figure that opens large in the lightbox; figures with the same group page through together.
const zoom = (f, group, cls = '') => `<figure class="vx-f ${cls}"><button type="button" class="vx-zoom" data-src="${esc(f.src)}" data-cap="${esc(f.caption)}" data-group="${esc(group)}" aria-label="Enlarge figure: ${esc(f.caption)}">
    <img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy" decoding="async"><span class="vx-zoom-i" aria-hidden="true"></span></button><figcaption>${esc(f.caption)}</figcaption></figure>`;
const C5 = vtx.cassoulet, SC = vtx.scanners, PHS = vtx.phantoms, TL = vtx.timeline;
const WN = C5.whatsNew;
const feat = (f) => `<article class="vx-feat${f.fig ? ' vx-feat-im' : ''}">${f.fig ? zoom(f.fig, 'new') : ''}<div class="vx-feat-b"><span>${esc(f.kicker)}</span><b>${esc(f.name)}</b><p>${esc(f.text)}</p></div></article>`;
const logo = (cls) => `<span class="${cls}" role="img" aria-label="VeriTomiX">
    <img class="vx-logo-d" src="/media/veritomix/veritomix-logo-ondark.webp" alt="" width="960" height="326">
    <img class="vx-logo-l" src="/media/veritomix/veritomix-logo-onlight.webp" alt="" width="960" height="326"></span>`;
// stage(step, focus, focusPhone): focus = "left top right bottom" fractions of the window where the subject is composed.
const stage = (step, focus = '0.04 0.06 0.96 0.94', focusM = focus, cls = '') => `<div class="vx-stage ${cls}" data-step="${step}" data-focus="${focus}" data-focus-m="${focusM}" aria-hidden="true"></div>`;
const head = (kicker, title, lede, cls = '') => `<header class="vx-sh ${cls} vx-rv">
    <p class="vx-k">${kicker}</p><h2>${title}</h2>${lede ? `<p class="vx-lede">${esc(lede)}</p>` : ''}</header>`;

// Pipeline icons (simple line drawings, theme-coloured through currentColor).
const ICON = [
  '<path d="M9 3h6l1.5 4-1 5 1 9h-9l1-9-1-5z"/><path d="M10 9h4"/>',
  '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M5 7l3 2M19 17l-3-2"/>',
  '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><circle cx="14" cy="10" r="2.5"/><path d="M3.5 16l5-4 4 3 3-2 5 4"/>',
  '<path d="M12 3l8.5 4.2L12 11.4 3.5 7.2z"/><path d="M3.5 12l8.5 4.2 8.5-4.2"/><path d="M3.5 16.6l8.5 4.2 8.5-4.2"/>',
];
const svg = (d) => `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

// Case-study cards (grid) and their full view (opened in the study viewer).
const CASES = ['validation', 'simulation'].flatMap((k) => vtx.cases[k].items.map((c, i) => ({ ...c, id: `${k[0]}${i}`, set: k })));
const caseImg = (c) => c.fig || c.figs?.[0] || null;
const caseCard = (c) => {
  const im = caseImg(c);
  return `<article class="vx-cc">
    <div class="vx-cc-im${im ? '' : ' vx-cc-none'}">${im ? `<img src="${esc(im.src)}" alt="" loading="lazy" decoding="async">` : `<span>${esc(c.chips[0] || c.kicker)}</span>`}</div>
    <div class="vx-cc-b">
      <p class="vx-cc-k">${esc(c.kicker)}</p><h3>${esc(c.name)}</h3>
      ${c.gsr ? `<p class="vx-cc-g"><b>Goal</b> ${esc(c.gsr.goal)}</p>` : `<p class="vx-cc-g">${esc(c.lede)}</p>`}
      ${chips(c.chips.slice(0, 3))}
      <button type="button" class="vx-cc-open" data-case="${c.id}">Open the study<span aria-hidden="true">→</span></button>
    </div></article>`;
};
const TOOL = { matlab: ['/media/logos/tools/matlab.webp', 'MATLAB'], python: ['/media/logos/tools/python.svg', 'Python'], gpu: ['/media/logos/tools/cuda.svg', 'Python + GPU'], paper: ['', 'Preprint'], next: ['', 'Next'] };
const tlItem = (t, i) => {
  const [lg, label] = TOOL[t.tool] || ['', ''];
  const g = `tl${i}`;
  return `<li class="vx-tl-i vx-tl-${t.tool}">
    <div class="vx-tl-dot" aria-hidden="true">${lg ? `<img src="${lg}" alt="" width="18" height="18" loading="lazy">` : ''}</div>
    <p class="vx-tl-date">${esc(t.date)}${t.approx ? ' <em>approx.</em>' : ''}<span>${esc(label)}</span></p>
    <h3>${esc(t.name)}</h3><p>${esc(t.text)}</p>
    ${t.img ? zoom(t.img, g, 'vx-tl-f') : ''}
    ${t.more ? `<div class="vx-tl-more">${t.more.map((f) => zoom(f, g, 'vx-thumb')).join('')}</div>` : ''}</li>`;
};

// ── Standalone organisation header (the shared portfolio nav is hidden on this page).
document.documentElement.classList.add('vx');
document.getElementById('vxHead').innerHTML = `
  <a class="vx-brand" href="#mission" aria-label="VeriTomiX, top of page">
    <img class="vx-logo-d" src="/media/veritomix/veritomix-logo-ondark.webp" alt="" width="960" height="326">
    <img class="vx-logo-l" src="/media/veritomix/veritomix-logo-onlight.webp" alt="" width="960" height="326">
  </a>
  <nav class="vx-anchors" aria-label="VeriTomiX sections">${vtx.nav.map(([id, n]) => `<a href="#${id}">${esc(n)}</a>`).join('')}</nav>
  <div class="vx-head-r">
    <button class="vx-theme" id="vxTheme" type="button" aria-label="Toggle light and dark"></button>
    <a class="vx-back" href="/">← Sai's portfolio</a>
  </div>`;

const VAL = vtx.cases.validation, SIM = vtx.cases.simulation;
const caseTitle = (k) => esc(vtx.cases[k].title.replace('Case studies: ', '').replace(/^./, (c) => c.toUpperCase()));

document.getElementById('main').innerHTML = `
  <section class="vx-sec vx-hero" id="mission" data-nav="mission">
    ${stage(0, '0.30 0.10 1 0.80', '0 0.16 1 0.56', 'vx-bleed')}
    <div class="vx-hero-in">
      <div class="vx-hero-l vx-rv">
        <p class="vx-k">${esc(vtx.status)}</p>
        <h1 class="vx-h1">${logo('vx-logo')}</h1>
      </div>
      <div class="vx-hero-r vx-rv">
        <p class="vx-lede">${esc(vtx.mission)}</p>
        <p class="vx-team-line">${vtx.team.map((t) => esc(t.name)).join(' &amp; ')}</p>
        <div class="vx-cta"><a class="vx-btn" href="#cassoulet">Inside the test bench</a><a class="vx-btn vx-btn-g" href="#cases">Case studies</a></div>
      </div>
    </div>
    <p class="vx-cue" aria-hidden="true">Scroll</p>
  </section>

  <section class="vx-sec vx-split" id="why" data-nav="mission">
    <div class="vx-split-t vx-rv">
      <p class="vx-k">The problem</p><h2>${esc(vtx.why.title)}</h2>
      <p class="vx-lede">${esc(vtx.why.lede)}</p>
      <ul class="vx-compare vx-rv-g">${vtx.why.compare.map((c) => `<li><b>${esc(c.name)}</b><span>${esc(c.good)}</span><em>${esc(c.gap)}</em></li>`).join('')}</ul>
      <p>${esc(vtx.why.answer)}</p>
    </div>
    <div class="vx-split-s">${stage(1, '0.06 0.08 0.94 0.84')}<p class="vx-cap">The CASSOULET abdominal phantom, with lesions of known size and uptake in the liver, a para-aortic node and the lung.</p></div>
  </section>

  <section class="vx-sec vx-band-sec" id="cassoulet" data-nav="cassoulet">
    <div class="vx-band">
      ${stage(2, '0.44 0.08 0.98 0.92', '0 0.04 1 0.96')}
      <div class="vx-over vx-rv">
        <p class="vx-k">The engine inside VeriTomiX</p>
        <h2 class="vx-cass-h"><img class="vx-cass-logo" src="/media/cassoulet-logo.webp" alt="CASSOULET" width="1600" height="419" loading="lazy"></h2>
        <p class="vx-meta">${esc(C5.expansion)}</p>
        <p class="vx-motto">${esc(C5.motto)}</p>
        <p>${esc(C5.lede)}</p>
      </div>
    </div>
    <div class="vx-wrap">
      <div class="vx-tests vx-rv-g">${C5.twoTests.map((t, i) => `<div><span>Test ${i + 1}</span><b>${esc(t.name)}</b><p>${esc(t.steps)}</p></div>`).join('<i aria-hidden="true">+</i>')}</div>
      <p class="vx-note vx-rv">${esc(C5.compare)}</p>
      <h3 class="vx-h3 vx-rv">Four modules, one session</h3>
      <div class="vx-modules vx-rv-g">${C5.modules.map((m, i) => `<div><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(m.name)}</b><p>${esc(m.text)}</p></div>`).join('')}</div>
      <p class="vx-note vx-rv">${esc(C5.session)}</p>
      <div class="vx-lib vx-rv"><h3 class="vx-h3">Lesion library</h3>${chips(C5.library)}</div>
      <h3 class="vx-h3 vx-rv">Inside the desktop app</h3>
      <div class="vx-gallery vx-rv-g">${C5.app.map((f) => zoom(f, 'app')).join('')}</div>
      <div class="vx-new vx-rv"><p class="vx-k">New</p><h3 class="vx-h3">${esc(WN.title)}</h3><p class="vx-note">${esc(WN.lede)}</p></div>
      <div class="vx-feats vx-feats-top vx-rv-g">${WN.items.filter((f) => f.fig).map(feat).join('')}</div>
      <div class="vx-feats vx-rv-g">${WN.items.filter((f) => !f.fig).map(feat).join('')}</div>
      <div class="vx-acc vx-rv">
        <details class="vx-d"><summary>Physics in the data model<span>what is simulated</span></summary>${list(C5.physics)}</details>
        <details class="vx-d"><summary>MuPET<span>the multiphysics route</span></summary><p>${esc(C5.mupet.text)}</p>
          <div class="vx-gallery vx-g2">${C5.mupet.figs.map((f) => zoom(f, 'mupet')).join('')}</div>
          <a class="vx-more" href="/sections/publications.html">MuPET preprint on the Publications page →</a></details>
        <details class="vx-d"><summary>Name and method<span>why "cassoulet"</span></summary><p>${esc(C5.name)}</p><p>${esc(C5.ai)}</p></details>
      </div>
    </div>
  </section>

  <section class="vx-sec vx-scan" id="scanners" data-nav="scanners">
    ${head(esc(SC.title), `Two scanners, one method <span class="vx-badge">${esc(SC.badge)}</span>`, SC.lede, 'vx-c')}
    <div class="vx-tabs vx-toggle vx-rv" role="group" aria-label="Scanner model in the 3D view">
      ${SC.models.map((m, i) => `<button type="button" data-scanner="${m.id}" aria-pressed="${i === 0}"><span>Model ${String.fromCharCode(65 + i)}</span><b>${esc(m.name)}</b></button>`).join('')}
    </div>
    <div class="vx-scanners" hidden>${SC.models.map((m) => `<div data-model="${m.id}"></div>`).join('')}</div>
    <div class="vx-wide">${stage(3, '0.08 0.06 0.92 0.94')}</div>
    <div class="vx-wrap vx-cols">
      <div class="vx-rv"><h3 class="vx-h3">Published, derived, assumed</h3><p class="vx-meta">How the models are built</p>${list(SC.notes)}</div>
      <div class="vx-gallery vx-g2 vx-rv-g">${SC.figures.map((f) => zoom(f, 'scan')).join('')}</div>
    </div>
  </section>

  <section class="vx-sec vx-split vx-flip vx-phan" id="phantoms" data-nav="phantoms">
    <div class="vx-split-s">${stage(4, '0.06 0.08 0.94 0.92')}</div>
    <div class="vx-split-t vx-rv">
      <p class="vx-k">${esc(PHS.title)}</p><h2>Objects with known truth</h2>
      <p class="vx-lede">${esc(PHS.lede)}</p>
      <div class="vx-ptabs" role="tablist" aria-label="Phantoms">${PHS.items.map((it, i) => `<button type="button" role="tab" id="vxPt${i}" aria-controls="vxPp${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-phantom="${i}">${esc(it.name)}</button>`).join('')}</div>
      ${PHS.items.map((it, i) => `<div class="vx-ppanel" role="tabpanel" id="vxPp${i}" aria-labelledby="vxPt${i}"${i ? ' hidden' : ''}>
        <p>${esc(it.text)}</p>
        <div class="vx-gallery ${it.figs.length ? 'vx-g2' : 'vx-g1'}">${[it.fig, ...it.figs].map((f) => zoom(f, `ph${i}`)).join('')}</div></div>`).join('')}
    </div>
  </section>

  <section class="vx-sec vx-pipe-sec" id="pipeline" data-nav="cassoulet">
    ${head('The method', esc(vtx.pipeline.title), vtx.pipeline.lede, 'vx-c')}
    <div class="vx-wide vx-wide-s">${stage(5, '0.02 0.08 0.98 0.92', '0.02 0.06 0.98 0.94')}</div>
    <ol class="vx-pipe vx-rv-g">${vtx.pipeline.steps.map((s, i) => `<li><span class="vx-pipe-ic">${svg(ICON[i])}</span><span class="vx-pipe-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(s.name)}</b><p>${esc(s.text)}</p></li>`).join('')}</ol>
  </section>

  <section class="vx-sec vx-cases" id="cases" data-nav="cases">
    <div class="vx-split vx-flip vx-inner">
      <div class="vx-split-s">${stage(6, '0.06 0.1 0.94 0.9')}</div>
      <div class="vx-split-t vx-rv"><p class="vx-k">Case studies</p><h2>${caseTitle('validation')}</h2><p class="vx-lede">${esc(VAL.lede)}</p>
        <p class="vx-meta">${VAL.items.length} studies · open any card for the goal, the simulation, the results and every figure.</p></div>
    </div>
    <div class="vx-grid vx-rv-g">${CASES.filter((c) => c.set === 'validation').map(caseCard).join('')}</div>
  </section>

  <section class="vx-sec vx-cases" id="simulation" data-nav="cases">
    <div class="vx-split vx-inner">
      <div class="vx-split-t vx-rv"><p class="vx-k">Case studies</p><h2>${caseTitle('simulation')}</h2><p class="vx-lede">${esc(SIM.lede)}</p>
        <p class="vx-meta">${SIM.items.length} studies</p></div>
      <div class="vx-split-s">${stage(7, '0.04 0.1 0.96 0.9')}</div>
    </div>
    <div class="vx-grid vx-rv-g">${CASES.filter((c) => c.set === 'simulation').map(caseCard).join('')}</div>
  </section>

  <section class="vx-sec vx-tl-sec" id="timeline" data-nav="timeline">
    <div class="vx-split vx-inner">
      <div class="vx-split-t vx-rv"><p class="vx-k">Development timeline</p><h2>${esc(TL.title)}</h2><p class="vx-lede">${esc(TL.lede)}</p>
        <p class="vx-cap vx-cap-l">In the 3D: the ring alternates between one 2D slice, as in the MATLAB version, and the full 3D volume of the Python GPU engine.</p></div>
      <div class="vx-split-s vx-short">${stage(8, '0.06 0.1 0.94 0.9')}</div>
    </div>
    <div class="vx-tl-wrap">
      <div class="vx-tl-nav"><button type="button" class="vx-tl-btn" data-dir="-1" aria-label="Earlier">←</button><button type="button" class="vx-tl-btn" data-dir="1" aria-label="Later">→</button></div>
      <ol class="vx-tl" tabindex="0" aria-label="Timeline, scroll sideways">${TL.items.map(tlItem).join('')}</ol>
    </div>
  </section>

  <section class="vx-sec vx-goals-sec" id="goals" data-nav="team">
    ${head('What it is for', 'Three goals', '', 'vx-c')}
    <div class="vx-wide vx-wide-g">${stage(9, '0.1 0.04 0.9 0.74', '0.04 0.04 0.96 0.96')}</div>
    <div class="vx-goals vx-rv-g">${vtx.goals.map((g) => `<div><span>${esc(g.kicker)}</span><b>${esc(g.name)}</b><p>${esc(g.text)}</p></div>`).join('')}</div>
  </section>

  <section class="vx-sec vx-close" id="team" data-nav="team">
    <div class="vx-band vx-band-c">
      ${stage(10, '0.36 0.06 0.98 0.94', '0 0.04 1 0.96')}
      <div class="vx-over vx-over-c vx-rv">
        <p class="vx-k">Team &amp; status</p><h2>Who is behind it</h2>
        <p class="vx-status"><span></span>${esc(vtx.status)}</p>
        <p class="vx-cap vx-cap-l">The future goal: a physics-informed digital twin of the scanner and the phantom.</p>
      </div>
    </div>
    <div class="vx-closing vx-rv-g">
      <ul class="vx-team">${vtx.team.map((t) => `<li><b>${esc(t.name)}</b><span>${esc(t.role)}</span></li>`).join('')}</ul>
      <p>${esc(vtx.closing)}</p>
      <div class="vx-links">
        <a href="/sections/projects.html#cassoulet">CASSOULET on Projects</a>
        <a href="/sections/research.html">PhD thesis</a>
        <a href="/sections/builder.html">VeriTomiX Office (Agentic AI)</a>
        <a href="/sections/contact.html">Contact</a>
      </div>
    </div>
  </section>`;

initUI({ cases: CASES, esc, zoom, list, chips });

// Theme toggle in the VeriTomiX header drives the engine's (hidden) portfolio toggle.
{
  const btn = document.getElementById('vxTheme');
  const sync = () => { btn.textContent = document.documentElement.dataset.theme === 'light' ? '☀' : '☾'; };
  btn.addEventListener('click', () => { document.getElementById('themeBtn')?.click(); sync(); });
  sync();
}

const NSTEPS = 11;
const ST = { hero: 0, why: 1, cass: 2, scan: 3, phant: 4, pipe: 5, valid: 6, sim: 7, tl: 8, goals: 9, team: 10 };

// Scene colours per theme, in the VeriTomiX navy/blue/teal brand. Image plates stay dark in both themes.
const PAL = {
  dark: {
    sky: [0x040912, 0x0a1a31, 0x040912], fog: 0x060d19, rim: 0x2f8fe0, key: 0xe9f1ff,
    shell: 0xdfe8f2, liver: 0x9c4a3f, spleen: 0x7d3f62, kidney: 0xb0604e, lung: 0x8fa3b8, heart: 0xa8443f, stomach: 0xc9a27a, bladder: 0xd8c48a, bone: 0xe6e0d4, vessel: 0xd2453f,
    bowel: 0xc9a27a, gland: 0xc7a35b, muscle: 0x9a5a5a, artery: 0xd2453f, vein: 0x3d6fd6, skin: 0xdfe8f2, nemaShell: 0xdfe8f2, nemaEdge: 0x8fd8f0,
    lesion: 0xffb24a, ring: 0xffd08a, housing: 0x52668a, face: 0x62779c, lining: 0xdfe8f2, trim: 0x2fb6e0, girder: 0x1b2a40, sipm: 0x1167d8, det: 0x6f8db8, hit: 0x8ff0ff,
    bed: 0x33435a, base: 0x223047, lor: 0x6fd6ff, twin: 0x3fe0c5, plate: 0x050a12, frame: 0x2a3a52, track: 0xe8eef6, ok: 0x5fd3a0, miss: 0xff6b6b, off: 0x2a3a52, floor: 0x1167d8,
  },
  light: {
    sky: [0xd9e6f3, 0xeef3f9, 0xe6edf5], fog: 0xe6edf5, rim: 0x1167d8, key: 0xffffff,
    shell: 0x6b7d93, liver: 0xb35a4a, spleen: 0x9a4d68, kidney: 0xc2705a, lung: 0x93a6bb, heart: 0xb24b44, stomach: 0xd4b08a, bladder: 0xd8c084, bone: 0xf1ece2, vessel: 0xc53a35,
    bowel: 0xcfa57c, gland: 0xc99f50, muscle: 0xb07070, artery: 0xc53a35, vein: 0x3a66c6, skin: 0x7c8ea5, nemaShell: 0x7c8ea5, nemaEdge: 0x2b5a8a,
    lesion: 0xe0701a, ring: 0xc2410c, housing: 0xf4f7fb, face: 0xe3e9f1, lining: 0x7a8ca3, trim: 0x0d63c9, girder: 0x9fb0c6, sipm: 0x1167d8, det: 0x5d7496, hit: 0x00a3d9,
    bed: 0xcdd6e2, base: 0xbcc7d6, lor: 0x0b6fd0, twin: 0x0a9d94, plate: 0x0a1220, frame: 0xc5d0de, track: 0x0b1a2e, ok: 0x1f8a5b, miss: 0xc62f3a, off: 0xd5dde8, floor: 0x5c7fa8,
  },
};
const SKIP_ROLES = new Set(['sky', 'fog', 'rim', 'key']);

runPage({
  active: 'veritomix',
  build({ THREE, scene, camera, reduceMotion, lowPower }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const seg = (t, a, b) => clamp01((t - a) / (b - a));
    const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const eout = (x) => 1 - Math.pow(1 - x, 3);
    const eback = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2));
    const smooth = (x) => x * x * (3 - 2 * x);
    const band = (p, a, b, w = 0.35) => seg(p, a - w, a) * (1 - seg(p, b, b + w)); // 1 inside [a,b], eased edges
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const K = 1 / 490; // millimetres -> scene units (the gantry is 2 units in radius)

    // ── Palette and theme-aware materials. Every material keeps its base opacity for fading.
    const C = {};
    const reg = [];
    let P;
    const setPal = (p) => { P = p; for (const key in p) if (!SKIP_ROLES.has(key)) (C[key] ||= new THREE.Color()).set(p[key]); reg.forEach((r) => r.m.color.set(P[r.role])); };
    setPal(PAL[document.documentElement.dataset.theme === 'light' ? 'light' : 'dark']);
    const std = (role, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: P[role], roughness: 0.45, metalness: 0.08, transparent: true, ...o }); m.userData.base = m.opacity; reg.push({ m, role }); return m; };
    const basic = (role, o = {}) => { const m = new THREE.MeshBasicMaterial({ color: P[role], transparent: true, ...o }); m.userData.base = m.opacity; reg.push({ m, role }); return m; };
    const lineMat = (role, o = {}) => { const m = new THREE.LineBasicMaterial({ color: P[role], transparent: true, ...o }); m.userData.base = m.opacity; reg.push({ m, role }); return m; };
    const fade = (mats, a) => { for (const m of mats) { m.opacity = m.userData.base * a; m.visible = m.opacity > 0.004; } };
    const glowMats = []; // additive at night; normal blending by day (additive vanishes on a light sky)
    const glow = (m) => { glowMats.push(m); return m; };
    const rbox = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, lowPower ? 2 : 3, r);
    const ctx = { THREE, k: K, std, basic, lineMat, rbox, lowPower };

    // ── Labels: own layer, so they follow the phone band (engine labels assume a full-screen canvas).
    const layer = document.createElement('div');
    layer.className = 'vx-labels';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const labels = [];
    function tag(html, getPos, vis, cls = 'vx-up', tagCls = '') {
      const el = document.createElement('div');
      el.className = `vx-label ${cls}`;
      el.innerHTML = `<div class="vx-tag ${tagCls}">${html}</div>`;
      layer.appendChild(el);
      const l = { el, getPos, vis, op: -1 };
      labels.push(l);
      return l;
    }
    const nm = (b, i) => `<div><b>${esc(b)}</b>${i ? `<i>${esc(i)}</i>` : ''}</div>`;
    const ico = (src) => `<span class="vx-ico" aria-hidden="true"><img src="${src}" alt="" width="14" height="14"></span>`;
    const tmpL = V(0, 0, 0);
    const wp = (obj, off) => () => obj.localToWorld(tmpL.copy(off));

    // ── Floor glow
    const floorTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), basic('floor', { map: floorTex, opacity: 0.22, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.scale.set(26, 9, 1); floor.position.set(2, -2.33, 0);
    scene.add(floor);

    // ════════ Scanners: emulated, research-based models (Discovery MI 5-ring and Omni Legend 32)
    // The detector modules in the sector facing the camera window are cut away, so the phantom inside stays visible.
    const CUT = [0.1 * Math.PI, 0.42 * Math.PI];
    const scanners = [buildScanner(ctx, SCANNERS.dmi, CUT), buildScanner(ctx, SCANNERS.omni, CUT)];
    scanners.forEach((s) => scene.add(s.group));
    let scanSel = 0, scanMix = 0, userPicked = false; // 0 = DMI, 1 = Omni
    const toggleBtns = [...document.querySelectorAll('.vx-toggle button')];
    const modelCards = [...document.querySelectorAll('.vx-scanners [data-model]')];
    const showSel = () => {
      toggleBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === scanSel)));
      modelCards.forEach((c, i) => c.classList.toggle('on', i === scanSel));
    };
    toggleBtns.forEach((b, i) => b.addEventListener('click', () => { scanSel = i; userPicked = true; showSel(); }));
    showSel();
    const detColor = new THREE.Color();
    // Timeline: one 2D slice (MATLAB V1) against the full 3D volume (Python, GPU).
    const sliceM = basic('twin', { opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
    const sliceEdgeM = basic('twin', { opacity: 0.85 });
    const slice = new THREE.Mesh(new THREE.CircleGeometry(0.72, 64), sliceM);
    const sliceEdge = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.004, 6, 96), sliceEdgeM);
    slice.rotation.y = sliceEdge.rotation.y = Math.PI / 2;
    scene.add(slice, sliceEdge);
    const pedestal = new THREE.Mesh(rbox(1.3, 1.85, 0.75, 0.06), std('base'));
    pedestal.position.set(-3.05, -1.4, 0); scene.add(pedestal);

    // ════════ Couch top + phantoms, sliding along +x into the bore
    const carriage = new THREE.Group();
    scene.add(carriage);
    const bedTop = new THREE.Mesh(rbox(3.6, 0.06, 0.95, 0.025), std('bed'));
    bedTop.position.set(-0.8, -0.4, 0); carriage.add(bedTop);
    const solidCommon = [pedestal.material, bedTop.material];
    const abd = new THREE.Group(); // the abdominal phantom (stand-in now, real mesh when loaded)
    carriage.add(abd);

    // Stand-in: a light procedural torso at the real phantom's size, until the mesh arrives.
    const standIn = new THREE.Group();
    abd.add(standIn);
    const standMats = [];
    {
      const PROFILE = [[0, -1.2], [0.74, -1.18], [0.9, -0.95], [0.88, -0.5], [0.8, 0], [0.86, 0.5], [0.95, 0.9], [0.84, 1.12], [0.4, 1.22], [0, 1.23]];
      const prof = new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(28).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));
      const g = new THREE.LatheGeometry(prof, 32); g.rotateZ(-Math.PI / 2);
      g.scale(1.08 / 2.45, 0.73 / 0.92, 0.89 / 1.9);
      const m = std('skin', { opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, roughness: 0.2 });
      standIn.add(new THREE.Mesh(g, m)); standMats.push(m);
      [['liver', [0.26, 0.02, -0.13], [0.2, 0.2, 0.18]], ['kidney', [0.06, -0.08, 0.16], [0.09, 0.07, 0.05]], ['kidney', [0.06, -0.08, -0.16], [0.09, 0.07, 0.05]],
        ['spleen', [0.2, -0.03, 0.2], [0.1, 0.08, 0.06]], ['lung', [0.4, 0, 0.14], [0.14, 0.17, 0.12]], ['lung', [0.4, 0, -0.14], [0.14, 0.17, 0.12]], ['bladder', [-0.4, 0, 0], [0.07, 0.06, 0.07]]]
        .forEach(([role, p, s]) => { const om = std(role, { opacity: 0.85 }); const o = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), om); o.position.set(...p); o.scale.set(...s); standIn.add(o); standMats.push(om); });
    }
    let realA = 0, realReady = false;
    const realMats = [], skinMats = [];
    let realPhantom = null;
    const twinFieldGeo = new THREE.BufferGeometry();
    const startLoad = () => {
      loadAbdominalPhantom(ctx, '/media/veritomix/abdominal-phantom.glb').then(({ group, byCat }) => {
        const cats = {
          skin: { role: 'skin', o: { opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, roughness: 0.25 } },
          liver: { role: 'liver' }, kidney: { role: 'kidney' }, spleen: { role: 'spleen' }, lung: { role: 'lung', o: { opacity: 0.55 } },
          heart: { role: 'heart' }, bowel: { role: 'bowel', o: { opacity: 0.9 } }, bladder: { role: 'bladder' }, gland: { role: 'gland' },
          bone: { role: 'bone', o: { roughness: 0.6 } }, muscle: { role: 'muscle', o: { opacity: 0.55 } }, artery: { role: 'artery' }, vein: { role: 'vein' },
        };
        for (const cat in byCat) {
          if (cat === 'fat' || !cats[cat]) { byCat[cat].forEach((m) => { m.visible = false; }); continue; }
          const m = std(cats[cat].role, { roughness: 0.5, side: THREE.DoubleSide, ...(cats[cat].o || {}) });
          (cat === 'skin' ? skinMats : realMats).push(m);
          byCat[cat].forEach((mesh) => { mesh.material = m; mesh.renderOrder = cat === 'skin' ? 2 : 0; });
        }
        fade(realMats, 0); fade(skinMats, 0);
        abd.add(group);
        realPhantom = group;
        // Digital-twin overlays: a wireframe of the body surface and a point cloud sampled from the organs.
        group.updateMatrixWorld(true);
        const skin = byCat.skin?.[0];
        if (skin) {
          const wire = new THREE.LineSegments(new THREE.WireframeGeometry(skin.geometry), twinPhMat);
          skin.add(wire);
        }
        const pts = [], v = V(0, 0, 0), inv = new THREE.Matrix4().copy(abd.matrixWorld).invert();
        ['liver', 'kidney', 'spleen', 'heart', 'lung', 'bladder'].forEach((cat) => (byCat[cat] || []).forEach((mesh) => {
          const pos = mesh.geometry.attributes.position, step = Math.max(1, Math.floor(pos.count / (lowPower ? 60 : 140)));
          for (let i = 0; i < pos.count; i += step) { v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(inv); pts.push(v.x, v.y, v.z); }
        }));
        twinFieldGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        realReady = true;
      }).catch(() => { /* keep the stand-in if the mesh cannot load */ });
    };
    // Load after first paint, when the browser is idle.
    setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(startLoad, { timeout: 1500 }) : startLoad()), 400);

    // Inserted lesions with target rings (the designed truth), at anatomical sites of the phantom.
    const LES = [
      { p: [0.282, 0.037, -0.169], r: 0.03, name: 'Liver lesion', side: 'vx-left' },
      { p: [0.057, -0.065, 0.055], r: 0.018, name: 'Para-aortic node', side: 'vx-down' },
      { p: [0.404, -0.02, -0.19], r: 0.018, name: 'Lung nodule', side: 'vx-right' },
    ];
    const lesions = LES.map((L, i) => {
      const m = std('lesion', { emissive: P.lesion, emissiveIntensity: 0.9, roughness: 0.3, opacity: 1 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(L.r, 20, 14), m);
      mesh.position.set(...L.p); mesh.renderOrder = 4; abd.add(mesh);
      const rm = basic('ring', { opacity: 0.85, depthWrite: false, depthTest: false });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(L.r * 2.2, 0.004, 6, 40), rm);
      ring.position.copy(mesh.position); ring.renderOrder = 5; abd.add(ring);
      return { ...L, i, mesh, m, ring, rm, world: V(0, 0, 0) };
    });
    // NEMA IEC body phantom (validation case studies) on the same couch.
    const nema = buildNema(ctx);
    nema.group.position.y = -0.37 - nema.bottom;
    carriage.add(nema.group);
    nema.spheres.forEach((s) => { s.m.emissive.set(P.lesion); s.world = V(0, 0, 0); });

    // ════════ Annihilation photon pairs (lines of response) on the active detector ring
    const lorGroup = new THREE.Group();
    scene.add(lorGroup);
    const NLOR = reduceMotion ? 9 : lowPower ? 8 : 16;
    const lorGeo = new THREE.CylinderGeometry(0.006, 0.006, 1, 5, 1, true);
    const dotGeo = new THREE.SphereGeometry(0.014, 10, 8);
    const UP = V(0, 1, 0);
    const lors = [...Array(NLOR)].map(() => {
      const m = glow(new THREE.MeshBasicMaterial({ color: C.lor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      const line = new THREE.Mesh(lorGeo, m);
      const dm = glow(new THREE.MeshBasicMaterial({ color: C.lor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      const dot = new THREE.Mesh(dotGeo, dm);
      line.visible = dot.visible = false;
      lorGroup.add(line, dot);
      return { line, dot, m, dm, t0: -10, life: 0.55, k: [0, 0], s: 0 };
    });
    const tmpA = V(0, 0, 0), tmpD = V(0, 0, 0), endA = V(0, 0, 0), endB = V(0, 0, 0);
    let nemaA = 0, tlA = 0, mode2D = false, sliceA = 0;
    function fireLor(L, now) {
      if (carriage.position.x < -0.6) return false;
      const S = scanners[scanSel];
      const src = nemaA > 0.5 ? nema.spheres : lesions;
      if (rand() < 0.5) tmpA.copy(src[Math.floor(rand() * src.length)].world);
      else tmpA.set(carriage.position.x + (rand() - 0.5) * 0.9, (rand() - 0.5) * 0.45, (rand() - 0.5) * 0.6);
      tmpA.x = mode2D ? 0 : Math.max(-S.afov / 2, Math.min(S.afov / 2, tmpA.x)); // the axial field of view (or one slice in 2D mode)
      const phi = rand() * Math.PI;
      tmpD.set(0, Math.cos(phi), Math.sin(phi));
      const b = tmpA.y * tmpD.y + tmpA.z * tmpD.z, c = tmpA.y * tmpA.y + tmpA.z * tmpA.z - S.rDet * S.rDet;
      const sq = Math.sqrt(Math.max(0, b * b - c));
      endA.copy(tmpA).addScaledVector(tmpD, -b + sq);
      endB.copy(tmpA).addScaledVector(tmpD, -b - sq);
      L.line.position.copy(endA).add(endB).multiplyScalar(0.5);
      L.line.quaternion.setFromUnitVectors(UP, tmpD);
      L.line.scale.set(1, endA.distanceTo(endB), 1);
      L.dot.position.copy(tmpA);
      const ring = S.ringOf(tmpA.x);
      L.k = [ring * S.spec.modules + S.moduleOf(endA.y, endA.z), ring * S.spec.modules + S.moduleOf(endB.y, endB.z)];
      L.s = scanSel;
      L.t0 = now;
      L.life = 0.45 + rand() * 0.3;
      return true;
    }
    let nextLor = 0;

    // ════════ Data products: sinogram, reconstruction, dataset grid, score gauge
    const stations = new THREE.Group();
    scene.add(stations);
    const stationMats = [], chainMats = [];
    const heatRGB = (t) => [clamp01(t * 2.2), clamp01((t - 0.36) * 1.9), clamp01((t - 0.76) * 4.2)];
    function activity(N, les = [{ x: 0.22, y: -0.12, r: 0.07, a: 1 }], noise = 0) {
      const A = new Float32Array(N * N);
      const E = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * 2 - 1, y = (j / (N - 1)) * 2 - 1;
        let v = 0;
        if (E(x, y, 0, 0, 0.86, 0.62)) v = 0.22;
        if (E(x, y, 0.28, -0.06, 0.4, 0.36)) v = 0.4;
        if (E(x, y, -0.5, 0.04, 0.16, 0.2)) v = 0.36;
        if (E(x, y, -0.12, -0.18, 0.18, 0.12)) v = 0.3;
        if (E(x, y, 0.3, 0.34, 0.11, 0.08) || E(x, y, -0.3, 0.34, 0.11, 0.08)) v = 0.62;
        if (E(x, y, 0.02, 0.24, 0.05, 0.05)) v = 0.34;
        if (E(x, y, 0, 0.44, 0.1, 0.09)) v = 0.04;
        for (const L of les) if (E(x, y, L.x, L.y, L.r, L.r)) v = L.a;
        A[j * N + i] = v + (noise ? (rand() - 0.5) * noise * (v > 0 ? 1 : 0.2) : 0);
      }
      return A;
    }
    function blur(A, N, r, passes = 2) {
      let a = A, b = new Float32Array(N * N);
      for (let p = 0; p < passes; p++) for (const horiz of [true, false]) {
        for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
          let s = 0, n = 0;
          for (let q = -r; q <= r; q++) {
            const ii = horiz ? i + q : i, jj = horiz ? j : j + q;
            if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue;
            s += a[jj * N + ii]; n++;
          }
          b[j * N + i] = s / n;
        }
        [a, b] = [b, a];
      }
      return a;
    }
    const toImage = (cx, A, N, ox = 0, oy = 0, gain = 1) => {
      const img = cx.createImageData(N, N);
      for (let q = 0; q < N * N; q++) { const [r, g, b] = heatRGB(clamp01(A[q] * gain)); img.data[q * 4] = r * 255; img.data[q * 4 + 1] = g * 255; img.data[q * 4 + 2] = b * 255; img.data[q * 4 + 3] = 255; }
      cx.putImageData(img, ox, oy);
    };
    const canvasTex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    const NS = 112;
    const truth = activity(NS);
    const sinoCanvas = document.createElement('canvas'); sinoCanvas.width = sinoCanvas.height = NS;
    const sinoCtx = sinoCanvas.getContext('2d');
    const sinoImg = sinoCtx.createImageData(NS, NS);
    {
      const S = new Float32Array(NS * NS);
      let mx = 0;
      for (let a = 0; a < NS; a++) {
        const th = (a / NS) * Math.PI, c = Math.cos(th), s = Math.sin(th);
        for (let d = 0; d < NS; d++) {
          const t = (d / (NS - 1)) * 2 - 1;
          let sum = 0;
          for (let u = 0; u < NS; u++) {
            const w = (u / (NS - 1)) * 2 - 1;
            const x = t * c - w * s, y = t * s + w * c;
            const i = Math.round(((x + 1) / 2) * (NS - 1)), j = Math.round(((y + 1) / 2) * (NS - 1));
            if (i >= 0 && j >= 0 && i < NS && j < NS) sum += truth[j * NS + i];
          }
          S[d * NS + a] = sum; mx = Math.max(mx, sum);
        }
      }
      for (let q = 0; q < NS * NS; q++) {
        const v = clamp01((S[q] / mx) * (0.92 + rand() * 0.16));
        const [r, g, b] = heatRGB(v * 0.95);
        sinoImg.data.set([r * 255, g * 255, b * 255, 255], q * 4);
      }
      sinoCtx.fillStyle = '#000'; sinoCtx.fillRect(0, 0, NS, NS);
    }
    const sinoTex = canvasTex(sinoCanvas);
    let sinoCols = -1;
    const drawSino = (f) => {
      const cols = Math.round(f * NS);
      if (cols === sinoCols) return;
      sinoCols = cols;
      sinoCtx.fillStyle = '#000'; sinoCtx.fillRect(0, 0, NS, NS);
      if (cols > 0) sinoCtx.putImageData(sinoImg, 0, 0, 0, 0, cols, NS);
      sinoTex.needsUpdate = true;
    };
    const reconTex = (r, noise, gain) => {
      const c = document.createElement('canvas'); c.width = c.height = NS;
      toImage(c.getContext('2d'), blur(activity(NS, undefined, noise), NS, r), NS, 0, 0, gain);
      return canvasTex(c);
    };
    const reconEarly = reconTex(7, 0.5, 1.5), reconFinal = reconTex(1, 0.22, 1.25);
    const NT = 56, atlas = document.createElement('canvas'); atlas.width = atlas.height = NT * 4;
    const tiles = [];
    {
      const cx = atlas.getContext('2d');
      for (let q = 0; q < 16; q++) {
        const r = 0.035 + rand() * 0.07, a = 0.45 + rand() * 0.55;
        toImage(cx, blur(activity(NT, [{ x: (rand() - 0.5) * 0.9, y: (rand() - 0.5) * 0.6, r, a }], 0.3), NT, 1), NT, (q % 4) * NT, Math.floor(q / 4) * NT, 1.25);
        tiles.push({ miss: r < 0.05 && a < 0.75 });
      }
    }
    const atlasTex = canvasTex(atlas);
    let stA = 0, chainA = 0, gA = 0;
    const panel = (x, y, w, h, tex, title, sub, vis = () => chainA) => {
      const g = new THREE.Group(); g.position.set(x, y, 0);
      const back = new THREE.Mesh(rbox(w + 0.12, h + 0.12, 0.06, 0.04), std('frame', { roughness: 0.4 }));
      back.position.z = -0.04; g.add(back);
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic('plate'));
      g.add(plate);
      stationMats.push(back.material, plate.material); chainMats.push(back.material, plate.material);
      const mats = [];
      [].concat(tex).forEach((t, i) => {
        const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 1, toneMapped: false });
        m.userData.base = 1;
        const img = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.94), m);
        img.position.z = 0.005 + i * 0.002; g.add(img); mats.push(m);
      });
      stations.add(g);
      tag(nm(title, sub), () => g.localToWorld(tmpL.set(0, h / 2 + 0.16, 0)), vis, 'vx-up');
      return { g, mats };
    };
    const sinoP = panel(3.5, 0.5, 1.5, 1.5, sinoTex, 'Sinogram', 'counts per line of response', () => band(prog, 5, 5, 0.5));
    const reconP = panel(5.6, 0.5, 1.5, 1.5, [reconEarly, reconFinal], 'Reconstruction', 'iterative, clinical-style');
    sinoP.g.rotation.y = 0.12; reconP.g.rotation.y = 0.05;
    const grid = new THREE.Group(); grid.position.set(8.3, 0.5, 0); grid.rotation.y = -0.08; stations.add(grid);
    const TS = 0.4, TG = 0.07;
    const tileObjs = tiles.map((t, q) => {
      const gx = q % 4, gy = Math.floor(q / 4);
      const geo = new THREE.PlaneGeometry(TS, TS);
      const uv = geo.attributes.uv;
      for (let v = 0; v < uv.count; v++) uv.setXY(v, (gx + uv.getX(v)) / 4, 1 - (gy + 1 - uv.getY(v)) / 4);
      const m = new THREE.MeshBasicMaterial({ map: atlasTex, transparent: true, toneMapped: false }); m.userData.base = 1;
      const mesh = new THREE.Mesh(geo, m);
      const o = new THREE.Group(); o.position.set((gx - 1.5) * (TS + TG), (1.5 - gy) * (TS + TG), 0);
      const fm = basic(t.miss ? 'miss' : 'ok', { opacity: 0.9 });
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(TS + 0.035, TS + 0.035), fm);
      frame.position.z = -0.004;
      o.add(frame, mesh); grid.add(o);
      return { o, m, fm, q };
    });
    const gridBack = new THREE.Mesh(rbox(4 * TS + 3 * TG + 0.2, 4 * TS + 3 * TG + 0.2, 0.05, 0.05), std('frame'));
    gridBack.position.z = -0.04; grid.add(gridBack); stationMats.push(gridBack.material);
    tag(nm('Dataset', 'image + truth mask + settings'), () => grid.localToWorld(tmpL.set(0, 1.08, 0)), () => stA, 'vx-up');
    tag('<div class="vx-key"><span class="ok"></span>found<span class="miss"></span>missed</div>', () => grid.localToWorld(tmpL.set(0, -1.05, 0)), () => gA, 'vx-down', 'vx-plain');
    const gauge = new THREE.Group(); gauge.position.set(8.3, -1.75, 0.1); stations.add(gauge);
    const NG = 30, GA = Math.PI * 1.2, GR = 0.55;
    const gSegs = [...Array(NG)].map((_, i) => {
      const a = Math.PI / 2 + GA / 2 - (i / (NG - 1)) * GA;
      const m = new THREE.MeshBasicMaterial({ color: C.off, transparent: true, toneMapped: false }); m.userData.base = 1;
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.02), m);
      s.position.set(Math.cos(a) * GR, Math.sin(a) * GR, 0); s.rotation.z = a - Math.PI / 2;
      gauge.add(s);
      return { s, m };
    });
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.025, GR * 0.85, 0.02), basic('track'));
    needle.geometry.translate(0, GR * 0.42, 0); gauge.add(needle);
    const hub = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), basic('track')); hub.position.z = 0.012; gauge.add(hub);
    tag(nm('Score vs known truth', 'illustrative'), () => gauge.localToWorld(tmpL.set(0, -0.2, 0)), () => gA, 'vx-down');
    const path = new THREE.CatmullRomCurve3([V(1.1, 0.2, 0.2), V(2.0, 0.5, 0.25), V(2.75, 0.5, 0.1), V(4.25, 0.5, 0.1), V(4.85, 0.5, 0.1), V(6.35, 0.5, 0.1), V(7.0, 0.5, 0.1)], false, 'centripetal');
    const trackMesh = new THREE.Mesh(new THREE.TubeGeometry(path, 80, 0.012, 6, false), basic('track', { opacity: 0.22, depthWrite: false }));
    stations.add(trackMesh); chainMats.push(trackMesh.material);
    const packets = [...Array(lowPower ? 2 : 3)].map(() => {
      const m = glow(new THREE.MeshBasicMaterial({ color: C.lor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), m); stations.add(s);
      return { s, m };
    });
    // The five pipeline cards under the stage light up in step with the packets travelling through the chain.
    const stepItems = [...document.querySelectorAll('.vx-pipe li')];
    let stepCur = -2;
    const setStep = (idx) => { if (idx === stepCur) return; stepCur = idx; stepItems.forEach((li, i) => { li.classList.toggle('on', i === idx); li.classList.toggle('done', i < idx); }); };

    // ════════ Digital twin overlays (phantom wireframe and activity field; scanner wireframes live in each model)
    const twinPhMat = glow(lineMat('twin', { opacity: 0.85, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    const fieldMat = glow(new THREE.PointsMaterial({ color: C.twin, size: 0.016, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    fieldMat.userData.base = 0.9; reg.push({ m: fieldMat, role: 'twin' });
    abd.add(new THREE.Points(twinFieldGeo, fieldMat));
    const twinMats = [twinPhMat, fieldMat, ...scanners.map((s) => glow(s.twinM))];

    // ── Labels on the scanners and phantoms
    scanners.forEach((s, i) => {
      tag(nm(s.spec.name, 'emulated, research-based model'), wp(s.group, V(0, s.rOut + 0.22, 0)), () => (i ? scanMix : 1 - scanMix) * (band(prog, 0, 0.2) + band(prog, 3, 3.2)), 'vx-up');
    });
    tag(nm('Abdominal phantom', 'CT-derived · organs, vessels, bones'), wp(abd, V(0, 0.42, 0)), () => band(prog, 0, 1.15), 'vx-up');
    tag(`${ico('/media/cassoulet-icon.webp')}${nm('CASSOULET', 'simulates the acquisition')}`, wp(scanners[0].group, V(0.4, -0.95, 0.9)), () => band(prog, 2, 2.2), 'vx-down');
    tag(nm('Detector ring', 'photon pairs land here'), () => tmpL.set(0.05, Math.sin(0.62) * 0.78, Math.cos(0.62) * 0.78 + 0.04), () => band(prog, 2, 2.2), 'vx-right', 'vx-sm');
    lesions.forEach((L, i) => tag(nm(L.name, 'known size and uptake'), () => L.world.clone().add(V(0, 0.03, 0)), () => (band(prog, 1, 1.15) + band(prog, 4, 4.2) * (1 - nemaA)) * seg(prog, 0.7 + i * 0.08, 0.95 + i * 0.08), L.side, 'vx-sm'));
    tag(nm('NEMA IEC body phantom', 'six hot spheres, lung insert'), wp(nema.group, V(0, 0.36, 0)), () => nemaA * (band(prog, 6, 6.15) + band(prog, 4, 4.15)), 'vx-up');
    tag(nm('2D · one slice', 'MATLAB V1: Radon + 2.5D OSEM'), () => tmpL.set(0, 0.82, 0), () => tlA * (mode2D ? 1 : 0), 'vx-up');
    tag(nm('3D · full volume', 'Python + GPU: every line of response'), () => tmpL.set(0, 0.82, 0), () => tlA * (mode2D ? 0 : 1), 'vx-up');
    tag(nm('Digital twin', 'physics-informed · future'), wp(abd, V(0.1, 0.42, 0)), () => seg(prog, 9.6, 10), 'vx-up');
    tag(nm('Scanner physics', 'geometry, detectors, noise'), wp(scanners[0].group, V(0, 2.2, 0)), () => seg(prog, 9.6, 10), 'vx-up', 'vx-sm');

    // ── Camera: framed per step and fitted to the free area beside (desktop) or above (phone) the cards.
    const FR = [
      { c: [-2.6, -0.3, 0], dir: [0.42, 0.3, 1], w: 9.0, h: 4.9 }, // hero
      { c: [-3.5, -0.08, 0], dir: [0.15, 0.95, 0.75], w: 1.9, h: 1.35 }, // why: phantom from above
      { c: [0.1, -0.05, 0], dir: [0.85, 0.34, 0.75], w: 3.4, h: 3.1 }, // CASSOULET: through the window, from the rear
      { c: [0.1, 0, 0], dir: [0.8, 0.45, 0.72], w: 2.3, h: 2.1 }, // scanners: detector ring close-up
      { c: [0.08, -0.05, 0], dir: [0.12, 0.74, 0.66], w: 2.3, h: 1.75 }, // phantoms: the abdominal phantom and its lesions
      { c: [2.2, -0.15, 0], dir: [0.03, 0.24, 1], w: 14.6, h: 4.9 }, // pipeline: the whole chain
      { c: [0, -0.04, 0], dir: [0.95, 0.2, 0.24], w: 1.75, h: 1.45 }, // validation: NEMA phantom along the bore
      { c: [7.0, 0.1, 0], dir: [0.02, 0.18, 1], w: 4.9, h: 3.3 }, // simulation studies: reconstruction and dataset
      { c: [0.05, -0.02, 0], dir: [0.9, 0.3, 0.55], w: 2.4, h: 2.2 }, // timeline: 2D slice vs 3D volume
      { c: [8.3, -0.45, 0], dir: [-0.18, 0.12, 1], w: 3.6, h: 4.6 }, // goals: dataset and score
      { c: [-0.6, -0.1, 0], dir: [-0.48, 0.36, 1], w: 6.4, h: 4.7 }, // twin
    ].map((f) => ({ c: V(...f.c), dir: V(...f.dir).normalize(), w: f.w, h: f.h }));
    // Phone stages are narrow: the pipeline and simulation frames close in on the data products.
    const FRP = FR.map((f, i) => (i === ST.pipe || i === ST.sim ? { c: V(5.55, 0.05, 0), dir: f.dir, w: 7.8, h: 3.9 } : f));
    const narrow = matchMedia('(max-width: 860px)');
    const headEl = document.getElementById('vxHead');
    const canvas = document.getElementById('stage');

    // ── Stages: windows in the page that the scene is composed into. Only the one in view is drawn;
    //    the canvas and the label layer are clipped to it.
    const stages = [...document.querySelectorAll('.vx-stage')].map((el) => {
      const f = (k) => (el.dataset[k] || '0 0 1 1').split(' ').map(Number);
      return { el, step: +el.dataset.step, focus: f('focus'), focusM: f('focusM'), bleed: el.classList.contains('vx-bleed'), r: null };
    }).sort((x, y) => x.step - y.step);
    let live = null, clipKey = '';
    const R = { x: 0, y: 0, w: 1, h: 1 };
    function measureStages() {
      const H = innerHeight;
      let best = null, bestA = 0;
      for (const s of stages) {
        s.r = s.el.getBoundingClientRect();
        const vis = Math.max(0, Math.min(H, s.r.bottom) - Math.max(0, s.r.top));
        if (vis > bestA + 1) { bestA = vis; best = s; }
      }
      return best;
    }
    // Scroll position -> continuous stage index: a plateau while a stage is in view, an eased hand-over between.
    function readProgress() {
      const H = innerHeight, a = H * 0.5;
      const cs = stages.map((s) => (s.r ? s.r.top + s.r.height / 2 : 0));
      if (a <= cs[0]) return 0;
      for (let i = 0; i < cs.length - 1; i++) {
        if (a >= cs[i + 1]) continue;
        // Stage centres move up as the page scrolls: cs[i] < a < cs[i + 1].
        const span = cs[i + 1] - cs[i], plateau = Math.min(H * 0.3, span * 0.3);
        return i + clamp01((a - cs[i] - plateau) / Math.max(1, span - 2 * plateau));
      }
      return cs.length - 1;
    }
    const fc = V(0, 0, 0), fd = V(0, 0, 0), look = V(0, 0, 0);
    const TAN = Math.tan((camera.fov * Math.PI) / 360);
    function frameCamera(p, t) {
      const F = narrow.matches ? FRP : FR;
      const i = Math.min(F.length - 2, Math.max(0, Math.floor(p)));
      const f = smooth(clamp01(p - i));
      const A = F[i], B = F[i + 1];
      fc.lerpVectors(A.c, B.c, f);
      fd.lerpVectors(A.dir, B.dir, f).normalize();
      // Interpolate the frame size in log space, so close-ups and wide shots hand over evenly.
      const w = Math.exp(Math.log(A.w) + (Math.log(B.w) - Math.log(A.w)) * f), h = Math.exp(Math.log(A.h) + (Math.log(B.h) - Math.log(A.h)) * f);
      const W = innerWidth, H = innerHeight, aspect = W / H;
      camera.aspect = aspect;
      // Fit the frame into the stage's focus area, and shift the projection so it is centred there.
      const dist = Math.max(w / ((R.w / W) * 2 * TAN * aspect), h / ((R.h / H) * 2 * TAN));
      camera.setViewOffset(W, H, W / 2 - (R.x + R.w / 2), H / 2 - (R.y + R.h / 2), W, H);
      look.copy(fc);
      camera.position.copy(look).addScaledVector(fd, dist);
      if (!reduceMotion) { camera.position.x += Math.sin(t * 0.21) * 0.12 * (dist / 10); camera.position.y += Math.sin(t * 0.29) * 0.08 * (dist / 10); }
      camera.near = Math.max(0.02, dist * 0.02);
      camera.updateProjectionMatrix();
      camera.lookAt(look);
      camera.updateMatrixWorld();
    }
    // Focus rectangle (viewport px) of the live stage; the hero keeps clear of the fixed header.
    function focusRect(s) {
      const r = s.r, [l, t, rr, b] = narrow.matches ? s.focusM : s.focus;
      let y0 = r.top + r.height * t;
      if (s.bleed) y0 = Math.max(y0, r.top + (headEl.offsetHeight || 64) + 8);
      R.x = r.left + r.width * l; R.w = Math.max(40, r.width * (rr - l));
      R.y = y0; R.h = Math.max(40, r.top + r.height * b - y0);
    }
    function clipTo(s) {
      let key;
      if (!s) key = 'inset(50% 50% 50% 50%)';
      else {
        const r = s.r, W = innerWidth, H = innerHeight, rad = s.bleed ? 0 : narrow.matches ? 14 : 20;
        key = `inset(${Math.max(0, r.top).toFixed(0)}px ${Math.max(0, W - r.right).toFixed(0)}px ${Math.max(0, H - r.bottom).toFixed(0)}px ${Math.max(0, r.left).toFixed(0)}px round ${rad}px)`;
      }
      if (key === clipKey) return;
      clipKey = key;
      canvas.style.clipPath = key; canvas.style.webkitClipPath = key;
      layer.style.clipPath = key; layer.style.webkitClipPath = key;
    }
    measureStages();
    let prog = readProgress();
    let phPick = 0; // phantom picker in the Phantoms section: 0 abdominal, 1 NEMA IEC
    document.addEventListener('vx-phantom', (e) => { phPick = e.detail; });

    const tmp = V(0, 0, 0);
    const place = (el, pos, op, prev, W, H) => {
      if (op < 0.01) { if (prev !== 0) el.style.opacity = 0; return 0; }
      tmp.copy(pos).project(camera);
      if (tmp.z > 1 || Math.abs(tmp.x) > 1.1 || Math.abs(tmp.y) > 1.1) { if (prev !== 0) el.style.opacity = 0; return 0; }
      el.style.transform = `translate3d(${((tmp.x * 0.5 + 0.5) * W).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * H).toFixed(1)}px,0)`;
      const o = Math.round(op * 50) / 50;
      if (o !== prev) el.style.opacity = o;
      return o;
    };

    // Sky, fog and lights in the VeriTomiX palette (the engine sets its own first, then calls onTheme).
    const sky = scene.children.find((o) => o.material?.uniforms?.horizon);
    const lights = { rim: null, key: null };
    scene.children.filter((o) => o.isDirectionalLight).forEach((l) => { if (l.position.x < 0) lights.rim = l; else lights.key = l; });
    let reducedFired = false;
    let scanAuto = 0, pickA = 0;

    return {
      keyframes: [...Array(NSTEPS)].map(() => ({ pos: [0, 1, 20], look: [0, 0, 0] })),
      onTheme(p) {
        const pal = PAL[p.night ? 'dark' : 'light'];
        setPal(pal);
        if (sky) { sky.material.uniforms.top.value.set(pal.sky[0]); sky.material.uniforms.horizon.value.set(pal.sky[1]); sky.material.uniforms.bottom.value.set(pal.sky[2]); }
        scene.fog?.color.set(pal.fog);
        lights.rim?.color.set(pal.rim);
        lights.key?.color.set(pal.key);
        floor.material.userData.base = p.night ? 0.2 : 0.26;
        lesions.forEach((L) => L.m.emissive.set(P.lesion));
        nema.spheres.forEach((s) => s.m.emissive.set(P.lesion));
        lors.forEach((L) => { L.m.color.copy(C.lor); L.dm.color.copy(C.lor); });
        packets.forEach((q) => q.m.color.copy(C.lor));
        fieldMat.color.copy(C.twin);
        glowMats.forEach((m) => { m.blending = p.night ? THREE.AdditiveBlending : THREE.NormalBlending; m.needsUpdate = true; });
        scanners.forEach((s) => s.heat.fill(-1)); // force the detector colours to refresh
      },
      update(t, _p, dt = 0.016) {
        const was = live;
        live = measureStages();
        if (was !== live) { was?.el.classList.remove('live'); live?.el.classList.add('live'); }
        clipTo(live);
        scene.visible = !!live; // nothing on screen to draw into: skip the scene entirely
        const target = readProgress();
        prog += (target - prog) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 4.5));
        const p = Math.abs(target - prog) < 1e-4 ? target : prog;
        if (live) focusRect(live);
        frameCamera(p, t);
        const time = reduceMotion ? 0 : t;

        // Scanner choice: the toggle wins; otherwise the scanner step alternates the two models.
        if (!userPicked && !reduceMotion && band(p, 3, 3, 0.2) > 0.5) {
          scanAuto += dt;
          if (scanAuto > 6) { scanAuto = 0; scanSel = 1 - scanSel; showSel(); }
        }
        scanMix += ((scanSel ? 1 : 0) - scanMix) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 5));
        const twinA = eio(seg(p, 9.35, 9.95));
        const solidK = 1 - 0.8 * twinA;
        scanners.forEach((s, i) => {
          const a = (i ? scanMix : 1 - scanMix);
          s.group.visible = a > 0.01;
          s.group.scale.setScalar(0.94 + 0.06 * eout(a));
          fade(s.solid, a * solidK);
        });
        fade(solidCommon, solidK);
        fade(twinMats, twinA * (reduceMotion ? 1 : 0.8 + 0.2 * Math.sin(time * 2.2)));
        scanners.forEach((s, i) => { s.twinM.opacity *= i ? scanMix : 1 - scanMix; });
        fieldMat.size = 0.016 * (reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(time * 3.1));
        floor.material.opacity = floor.material.userData.base;

        // Couch slides into the bore between "Why" and "CASSOULET"; NEMA swaps in for the validation step.
        carriage.position.x = -3.5 + 3.5 * eio(seg(p, 1.3, 2.15));
        pickA += ((phPick === 1 ? 1 : 0) - pickA) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 5));
        nemaA = Math.max(eio(seg(p, 5.55, 5.95)) * (1 - eio(seg(p, 6.05, 6.45))), pickA * band(p, 4, 4, 0.4));
        const abdA = 1 - nemaA;
        abd.visible = abdA > 0.01; nema.group.visible = nemaA > 0.01;
        fade(nema.mats, nemaA * solidK);
        realA += ((realReady ? 1 : 0) - realA) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 3));
        fade(standMats, (1 - realA) * abdA * solidK);
        standIn.visible = realA < 0.99;
        const shellCut = 1 - 0.45 * (band(p, 1, 1.1) + band(p, 4, 4.1)); // a thinner skin when looking at lesions
        fade(skinMats, realA * abdA * solidK * shellCut);
        fade(realMats, realA * abdA * (1 - 0.7 * twinA));

        // Lesions appear (staggered) while the "Why" card is read; rings mark the designed truth.
        scene.updateMatrixWorld();
        lesions.forEach((L, i) => {
          const q = eback(seg(p, 0.45 + i * 0.1, 0.95 + i * 0.1));
          L.mesh.scale.setScalar(Math.max(0.001, q));
          L.mesh.visible = q > 0.01 && abdA > 0.01;
          const pulse = reduceMotion ? 0 : 0.5 + 0.5 * Math.sin(time * 3 + i);
          L.m.emissiveIntensity = 0.6 + 0.8 * pulse * (1 - twinA);
          L.m.opacity = abdA;
          const ringA = q * (band(p, 1, 1.15) + band(p, 4, 4.15) + 0.35 * band(p, 5, 5.2)) * (1 - twinA) * abdA;
          L.rm.opacity = 0.85 * clamp01(ringA); L.ring.visible = L.rm.opacity > 0.01;
          L.ring.scale.setScalar(1 + (reduceMotion ? 0 : 0.15 * Math.sin(time * 2.4 + i)));
          L.ring.quaternion.copy(camera.quaternion);
          L.mesh.getWorldPosition(L.world);
        });
        nema.spheres.forEach((s, i) => { s.mesh.getWorldPosition(s.world); s.m.emissiveIntensity = 0.7 + (reduceMotion ? 0.3 : 0.5 * Math.sin(time * 3 + i)); });

        // Lines of response: phantom in the bore during CASSOULET to pipeline, NEMA and lesion studies, a little in the twin.
        const lorA = clamp01(seg(p, 1.75, 2.1) * (1 - seg(p, 5.4, 5.8)) + band(p, 6, 6) + band(p, 8, 8) + 0.25 * band(p, 10, 10));
        tlA = band(p, 8, 8);
        mode2D = tlA > 0.5 && (reduceMotion || (time % 8) < 4);
        if (reduceMotion && !reducedFired && carriage.position.x > -0.6) { reducedFired = true; lors.forEach((L) => fireLor(L, 0)); }
        if (!reduceMotion && lorA > 0.01) {
          nextLor += dt * (lowPower ? 7 : 14) * lorA;
          while (nextLor >= 1) { nextLor -= 1; const L = lors.find((x) => time - x.t0 > x.life); if (L) fireLor(L, time); }
        }
        for (const L of lors) {
          const age = reduceMotion ? 0.2 : (time - L.t0) / L.life;
          const a = reduceMotion ? lorA * 0.9 : age < 0 || age > 1 ? 0 : (1 - age) * (age < 0.1 ? age / 0.1 : 1) * lorA;
          L.m.opacity = a * 0.95; L.dm.opacity = a; L.line.visible = L.dot.visible = a > 0.01;
          if (a > 0.3) for (const q of L.k) scanners[L.s].heat[q] = Math.max(scanners[L.s].heat[q], a);
        }
        // Detector blocks glow where photons land, then cool down.
        scanners.forEach((s) => {
          if (!s.group.visible) return;
          let dirty = false;
          for (let q = 0; q < s.heat.length; q++) {
            const h = s.heat[q];
            if (h === 0) continue;
            s.det.setColorAt(q, detColor.copy(C.det).lerp(C.hit, Math.max(0, h)));
            s.heat[q] = h < 0 ? 0 : Math.max(0, h - dt * 2.5);
            dirty = true;
          }
          if (dirty) s.det.instanceColor.needsUpdate = true;
        });

        sliceA += ((tlA * (mode2D ? 1 : 0)) - sliceA) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 6));
        fade([sliceM, sliceEdgeM], sliceA);
        // Data products: built during the pipeline step; the dataset and score return for the goals.
        const pipeB = band(p, 5, 5, 0.5), simB = band(p, 7, 7, 0.5);
        chainA = Math.max(pipeB, simB);
        gA = band(p, 9, 9, 0.5);
        stA = Math.max(chainA, gA);
        stations.visible = stA > 0.003;
        if (stations.visible) {
          stations.position.y = (1 - eout(stA)) * -0.5;
          fade(stationMats, stA);
          fade(chainMats, chainA);
          reconP.g.visible = chainA > 0.01; sinoP.g.visible = trackMesh.visible = pipeB > 0.01;
          fade([trackMesh.material], pipeB);
          drawSino(reduceMotion ? (p > 4.5 ? 1 : 0) : seg(p, 4.4, 4.75));
          reconP.mats[0].opacity = chainA * seg(p, 4.55, 4.75);
          reconP.mats[1].opacity = chainA * (reduceMotion ? (p > 4.5 ? 1 : 0) : seg(p, 4.68, 4.95));
          sinoP.mats[0].opacity = pipeB;
          tileObjs.forEach((o) => {
            const q = reduceMotion ? (p > 4.5 ? 1 : 0) : eout(seg(p, 4.72 + o.q * 0.014, 4.92 + o.q * 0.014));
            o.m.opacity = stA * q; o.o.scale.setScalar(0.6 + 0.4 * q);
            o.fm.opacity = 0.9 * stA * q * gA;
          });
          const score = 0.72 * (reduceMotion ? 1 : eio(seg(p, 8.55, 8.95)));
          gauge.visible = gA > 0.01;
          gSegs.forEach((s, i) => { s.m.color.copy(i / (NG - 1) <= score ? (i / (NG - 1) < 0.3 ? C.miss : C.ok) : C.off); s.m.opacity = gA; });
          needle.material.opacity = hub.material.opacity = gA;
          needle.rotation.z = GA / 2 - score * GA + (reduceMotion ? 0 : Math.sin(time * 1.7) * 0.015);
          const pipeA = band(p, 5, 5.15);
          const LOOP = 9;
          const u = reduceMotion ? 0.86 : (time % LOOP) / LOOP;
          packets.forEach((q, i) => {
            const r = u * 1.25 - i * 0.12;
            const vis = r > 0.42 && r < 1 ? pipeA : 0;
            q.m.opacity = vis * 0.95; q.s.visible = vis > 0.01;
            if (vis) q.s.position.copy(path.getPointAt(clamp01((r - 0.42) / 0.58)));
          });
          setStep(u < 0.14 ? 0 : u < 0.3 ? 1 : u < 0.46 ? 2 : u < 0.72 ? 3 : 4);
        } else setStep(-1);

        scene.updateMatrixWorld();
        const W = innerWidth, H = innerHeight;
        for (const l of labels) l.op = place(l.el, l.getPos(), clamp01(l.vis()), l.op, W, H);
      },
    };
  },
});

// Projects gallery: a filterable grid of project cards and a full-width detail view per project
// (#id deep links). The per-project 3D explainer is shown in a framed window inside the detail hero;
// the window is the only part of the page left transparent, so the 3D never sits behind text.
import repos from '../../content/repos.json';
import { runPage } from './engine.js';
import './projects.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byId = Object.fromEntries(repos.map((r) => [r.id, r]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow = () => innerWidth <= 860;

const DOMAINS = {
  imaging: { label: 'Imaging & simulation', icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>' },
  devices: { label: 'Biomedical devices', icon: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 12h2l1.5-3 2 6 1.5-3H17"/>' },
  fluids: { label: 'Fluids & biomechanics', icon: '<path d="M12 3C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-11z"/>' },
};
const icon = (k) => `<svg class="pj-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DOMAINS[k].icon}</svg>`;

const TOOL_LOGOS = {
  MATLAB: 'matlab.webp', Python: 'python.svg', COMSOL: 'comsol.webp', CUDA: 'cuda.svg',
  PyTomography: 'pytomography.webp', parallelproj: 'parallelproj.webp', 'Autodesk Meshmixer': 'autodesk.svg',
};
const toolMark = (name) => (TOOL_LOGOS[name]
  ? `<img src="/media/logos/tools/${TOOL_LOGOS[name]}" alt="" width="16" height="16" loading="lazy">`
  : `<span class="pj-mono">${esc(name.slice(0, 2))}</span>`);
const toolPill = (name) => `<li><span class="pj-logo" aria-hidden="true">${toolMark(name)}</span>${esc(name)}</li>`;
const toolIcons = (r) => (r.tools?.length
  ? `<ul class="pj-tico" aria-label="Tools">${r.tools.map((t) => `<li title="${esc(t)}"><span class="pj-logo">${toolMark(t)}</span><span class="pj-sr">${esc(t)}</span></li>`).join('')}</ul>`
  : `<ul class="pj-tags" aria-label="Methods">${(r.stack || []).slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`);

const allTools = (() => {
  const n = {};
  repos.forEach((r) => (r.tools || []).forEach((t) => { n[t] = (n[t] || 0) + 1; }));
  return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b));
})();

// ── Grid view
const card = (r) => `<a class="pj-card" href="#${esc(r.id)}" data-id="${esc(r.id)}" data-domain="${r.domain}" data-tools="${esc((r.tools || []).join('|'))}">
  <span class="pj-cover"><img src="${esc(r.cover)}" alt="" width="800" height="500" loading="lazy">
    <span class="pj-badge">${icon(r.domain)}${DOMAINS[r.domain].label}</span>
    ${r.cardStat ? `<span class="pj-key"><b>${esc(r.cardStat.value)}</b><span>${esc(r.cardStat.label)}</span></span>` : ''}
  </span>
  <span class="pj-card-body">
    <span class="pj-meta">${esc(r.kind)} · ${esc(r.years)}</span>
    <h3>${esc(r.name)}</h3>
    <p>${esc(r.headline || r.eli5)}</p>
    ${toolIcons(r)}
    <span class="pj-open">View project <span aria-hidden="true">→</span></span>
  </span></a>`;

const foot = '<footer class="pj-foot"><span>© 2026 Sai Kiran Kumar Nalla</span><a href="/">Back to the village</a></footer>';
const gridHTML = () => `<div class="pj-wrap">
  <header class="pj-head"><p class="s-kicker">Projects &amp; repos</p><h1>Things I've built</h1>
  <p class="pj-lede">PET/CT simulation, cardiovascular CFD, a surgical bench and wearable electrodes. Open one for the problem, what I built and the result.</p></header>
  <div class="pj-filters" role="group" aria-label="Filter projects">
    <div class="pj-chiprow" data-group="domain"><span class="pj-flabel">Domain</span>
      <button class="pj-chip on" data-val="">All</button>${Object.entries(DOMAINS).map(([k, d]) => `<button class="pj-chip" data-val="${k}" data-domain="${k}">${icon(k)}${d.label}</button>`).join('')}</div>
    <div class="pj-chiprow" data-group="tool"><span class="pj-flabel">Tool</span>
      <button class="pj-chip on" data-val="">Any</button>${allTools.map((t) => `<button class="pj-chip" data-val="${esc(t)}"><span class="pj-logo" aria-hidden="true">${toolMark(t)}</span>${esc(t)}</button>`).join('')}</div>
    <p class="pj-count" id="pjCount" aria-live="polite"></p>
  </div>
  <div class="pj-grid" id="pjGrid">${repos.map(card).join('')}</div>
  <p class="pj-empty" id="pjEmpty" hidden>No project matches both filters.</p>
  <p class="pj-note">AI agent systems live on the <a href="/sections/builder.html">Agentic AI</a> page.</p>
  ${foot}</div>`;

// ── Detail view
const fmtLink = (l) => {
  if (!l.href) return `<span class="pj-link soon">${esc(l.label)} · coming soon</span>`;
  const ext = /^https?:/.test(l.href);
  return `<a class="pj-link${ext ? '' : ' primary'}" href="${esc(l.href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)} <span aria-hidden="true">${ext ? '↗' : '→'}</span></a>`;
};
const imagesOf = (r) => [{ src: r.cover, caption: r.name }, ...(r.figures || []).filter((f) => f.src !== r.cover)];
const para = (t) => String(t).split(/\n\s*\n/).map((x) => `<p>${esc(x.trim())}</p>`).join('');

function detailHTML(r, mode) {
  const i = repos.indexOf(r), prev = repos[(i + repos.length - 1) % repos.length], next = repos[(i + 1) % repos.length];
  const m = r.more;
  const methods = (r.stack || []).filter((x) => !(r.tools || []).some((t) => x.toLowerCase().startsWith(t.toLowerCase())));
  const figs = (r.figures || []).filter((f) => f.src !== r.cover);
  const imgs = imagesOf(r);
  const nav = (p, dir) => `<a class="pj-pn ${dir}" href="#${p.id}" data-domain="${p.domain}"><img src="${esc(p.cover)}" alt="" width="160" height="100" loading="lazy"><span><em>${dir === 'prev' ? 'Previous project' : 'Next project'}</em><b>${esc(p.name)}</b></span></a>`;
  return `<div class="pj-bar"><div class="pj-bar-in">
      <button class="pj-back" data-back><span aria-hidden="true">←</span> All projects</button>
      <span class="pj-count2">${i + 1} / ${repos.length}</span>
      <span class="pj-steps"><a class="pj-step-btn" href="#${prev.id}" aria-label="Previous project: ${esc(prev.name)}">←</a><a class="pj-step-btn" href="#${next.id}" aria-label="Next project: ${esc(next.name)}">→</a></span>
    </div></div>
    <section class="pj-hero" data-domain="${r.domain}">
      <div class="pj-hero-text">
        <span class="pj-badge flat">${icon(r.domain)}${DOMAINS[r.domain].label}</span>
        <p class="pj-meta">${esc(r.kind)} · ${esc(r.years)} · ${esc(r.context)}</p>
        <h2 id="pjTitle" tabindex="-1">${esc(r.name)}</h2>
        <p class="pj-hl">${esc(r.headline || r.eli5)}</p>
        ${r.team ? `<p class="pj-team"><b>Team</b> ${esc(r.team)}</p>` : ''}
        ${r.stats?.length ? `<div class="pj-stats">${r.stats.map((x) => `<div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>` : ''}
        ${r.links?.length ? `<div class="pj-links">${r.links.map(fmtLink).join('')}</div>` : ''}
      </div>
      <div class="pj-hero-media">
        <div class="pj-tabs" role="tablist" aria-label="Project visual">
          <button role="tab" data-mode="fig" aria-selected="${mode === 'fig'}">Figure</button>
          <button role="tab" data-mode="3d" aria-selected="${mode === '3d'}">3D explainer</button>
        </div>
        <button class="pj-hero-img" data-lb="0" aria-label="Enlarge image"><img src="${esc(r.cover)}" alt="${esc(r.name)}" width="800" height="500"></button>
        <div class="pj-stage" id="pjStage" role="img" aria-label="Animated 3D explainer of ${esc(r.name)}"></div>
      </div>
    </section>
    <section class="pj-sec"><div class="pj-wrap">
      ${r.brief ? `<div class="pj-brief">${[['Problem', r.brief.problem], ['What I built', r.brief.built], ['Result', r.brief.result]].filter(([, v]) => v)
        .map(([k, v], n) => `<div class="pj-bcard"><span>0${n + 1}</span><h3>${k}</h3><p>${esc(v)}</p></div>`).join('')}</div>` : `<p class="pj-plain">${esc(r.summary)}</p>`}
      ${r.role ? `<div class="pj-role"><h3>What I did</h3><p>${esc(r.role)}</p></div>` : ''}
      ${r.tools?.length ? `<h3 class="pj-h">Tools</h3><ul class="pj-tools">${r.tools.map(toolPill).join('')}</ul>` : ''}
      ${methods.length ? `<h3 class="pj-h">Methods</h3><ul class="pj-tags big">${methods.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    </div></section>
    ${figs.length ? `<section class="pj-sec alt"><div class="pj-wrap"><h3 class="pj-h first">Figures</h3><div class="pj-figs">${figs.map((f) => `<figure><button data-lb="${imgs.findIndex((x) => x.src === f.src)}" aria-label="Enlarge: ${esc(f.caption)}"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"></button><figcaption>${esc(f.caption)}</figcaption></figure>`).join('')}</div></div></section>` : ''}
    ${(m && r.knowMore !== false) || r.abstract ? `<section class="pj-sec"><div class="pj-wrap pj-read">
      ${m && r.knowMore !== false ? `<details class="pj-know"><summary>Know more <span>method details</span></summary>${r.brief ? '' : `<h4>The problem</h4><p>${esc(m.problem)}</p>`}<h4>How</h4><ul>${m.approach.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${r.brief ? '' : `<h4>Outcome</h4><ul>${m.outcome.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`}</details>` : ''}
      ${r.abstract ? `<details class="pj-know"><summary>Abstract</summary>${para(r.abstract)}</details>` : ''}
    </div></section>` : ''}
    <section class="pj-sec alt"><div class="pj-wrap pj-pns">${nav(prev, 'prev')}${nav(next, 'next')}</div></section>
    <section class="pj-sec pj-last"><div class="pj-wrap">${foot}</div></section>`;
}

document.documentElement.classList.add('pj-lock', 'pj-grid-mode');
const main = document.getElementById('main');
main.innerHTML = `<section class="pj-view pj-gridview" id="gridView">${gridHTML()}</section><article class="pj-view pj-detail" id="detailView" hidden aria-live="polite"></article>`;
const gridView = document.getElementById('gridView'), detailView = document.getElementById('detailView');

// Lightbox
const lb = document.createElement('div');
lb.className = 'pj-lb'; lb.hidden = true;
lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
lb.innerHTML = '<button class="pj-lb-x" aria-label="Close">×</button><button class="pj-lb-n prev" aria-label="Previous image">←</button><figure><img alt=""><figcaption></figcaption></figure><button class="pj-lb-n next" aria-label="Next image">→</button>';
document.body.appendChild(lb);
let lbItems = [], lbIdx = 0, lbFrom = null;
const lbShow = () => { const it = lbItems[lbIdx]; lb.querySelector('img').src = it.src; lb.querySelector('img').alt = it.caption; lb.querySelector('figcaption').textContent = it.caption; lb.classList.toggle('single', lbItems.length < 2); };
const lbOpen = (items, i, from) => { lbItems = items; lbIdx = i; lbFrom = from; lbShow(); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('on')); lb.querySelector('.pj-lb-x').focus(); };
const lbClose = () => { lb.classList.remove('on'); setTimeout(() => { lb.hidden = true; }, reduceMotion ? 0 : 200); lbFrom?.focus(); };
lb.addEventListener('click', (e) => {
  if (e.target.closest('.pj-lb-x') || e.target === lb) lbClose();
  else if (e.target.closest('.next')) { lbIdx = (lbIdx + 1) % lbItems.length; lbShow(); }
  else if (e.target.closest('.prev')) { lbIdx = (lbIdx + lbItems.length - 1) % lbItems.length; lbShow(); }
});

// Filters
const filt = { domain: '', tool: '' };
function applyFilters(animate = true) {
  let n = 0;
  gridView.querySelectorAll('.pj-card').forEach((c) => {
    const ok = (!filt.domain || c.dataset.domain === filt.domain) && (!filt.tool || c.dataset.tools.split('|').includes(filt.tool));
    c.hidden = !ok;
    if (ok) { n += 1; if (animate) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } }
  });
  document.getElementById('pjCount').textContent = `Showing ${n} of ${repos.length} projects`;
  document.getElementById('pjEmpty').hidden = n > 0;
}
gridView.addEventListener('click', (e) => {
  const chip = e.target.closest('.pj-chip');
  if (!chip) return;
  const row = chip.parentElement;
  filt[row.dataset.group] = chip.dataset.val;
  row.querySelectorAll('.pj-chip').forEach((c) => c.classList.toggle('on', c === chip));
  applyFilters();
});
applyFilters(false);

// Routing
let view = null, mode = 'fig', gridTop = 0, swapTimer = 0, current = null;
const setTitle = (r) => { document.title = `${r ? r.name : 'Projects'} | Sai Kiran Kumar Nalla, PhD`; };
const goto = (id) => {
  if (id) location.hash = id;
  else { history.pushState(null, '', location.pathname); route(); }
};
function replay(el) { el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in'); }
function route() {
  const r = byId[location.hash.slice(1)] || null;
  clearTimeout(swapTimer);
  setTitle(r);
  const first = view === null, quick = first || reduceMotion;
  if (r) {
    if (view === 'grid') gridTop = gridView.scrollTop;
    current = r.id;
    detailView.innerHTML = detailHTML(r, mode);
    detailView.dataset.domain = r.domain;
    detailView.hidden = false;
    detailView.scrollTop = 0;
    document.documentElement.classList.remove('pj-grid-mode');
    replay(detailView);
    gridView.classList.add('is-out');
    swapTimer = setTimeout(() => { gridView.hidden = true; }, quick ? 0 : 260);
    if (quick) gridView.hidden = true;
    detailView.querySelector('#pjTitle')?.focus({ preventScroll: true });
    view = 'detail';
  } else {
    const was = current;
    current = null;
    gridView.hidden = false;
    document.documentElement.classList.add('pj-grid-mode');
    void gridView.offsetWidth;
    gridView.classList.remove('is-out');
    gridView.scrollTop = first ? 0 : gridTop;
    detailView.classList.remove('is-in');
    swapTimer = setTimeout(() => { detailView.hidden = true; }, quick ? 0 : 260);
    if (quick) detailView.hidden = true;
    if (view === 'detail' && was) gridView.querySelector(`[data-id="${was}"]`)?.focus({ preventScroll: true });
    view = 'grid';
  }
  setMode(mode);
}
function setMode(m) {
  mode = m;
  detailView.dataset.mode = m;
  detailView.querySelectorAll('.pj-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
}
detailView.addEventListener('click', (e) => {
  if (e.target.closest('[data-back]')) { goto(null); return; }
  const tab = e.target.closest('.pj-tabs button');
  if (tab) { setMode(tab.dataset.mode); return; }
  const b = e.target.closest('[data-lb]');
  if (b && current) lbOpen(imagesOf(byId[current]), +b.dataset.lb, b);
});
addEventListener('hashchange', route);
addEventListener('popstate', route);
addEventListener('keydown', (e) => {
  if (!lb.hidden) {
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowRight') lb.querySelector('.next').click();
    else if (e.key === 'ArrowLeft') lb.querySelector('.prev').click();
    return;
  }
  if (e.key === 'Escape' && current) goto(null);
});

runPage({
  active: 'projects',
  build({ THREE, scene, camera, renderer, lowPower }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o });
    const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, transparent: true, ...o });
    const explainers = {};
    const stage = new THREE.Group();
    scene.add(stage);
    const make = (id, build) => { const g = new THREE.Group(); g.visible = false; stage.add(g); explainers[id] = { g, tick: build(g), s: 0 }; };

    make('cassoulet', (g) => { // three scanner models with lines of response firing
      const lines = [];
      [[1.0, -3], [1.6, 0], [3.2, 3.4]].forEach(([len, x]) => {
        const s = new THREE.Group(); s.position.x = x;
        const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, len, 48, 1, true), std(0xe4ded6, { side: THREE.DoubleSide }));
        shell.rotation.z = Math.PI / 2; s.add(shell);
        [-1, 1].forEach((sd) => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 8, 64), glow(0xff6a4a, { opacity: 0.6 })); r.rotation.y = Math.PI / 2; r.position.x = (sd * len) / 2; s.add(r); });
        for (let i = 0; i < 10; i++) { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0)]), new THREE.LineBasicMaterial({ color: 0xffb36b, transparent: true })); s.add(l); lines.push({ l, len, ph: Math.random() * 10 }); }
        g.add(s);
      });
      g.rotation.y = 0.55; g.scale.setScalar(0.8);
      return (t) => lines.forEach((L) => {
        const k = (t * 2 + L.ph) % 1;
        if (k < 0.05) { const a = Math.random() * 6.28, b = a + Math.PI + (Math.random() - 0.5) * 0.8, x = (Math.random() - 0.5) * L.len * 0.9; L.l.geometry.setFromPoints([V(x, Math.cos(a), Math.sin(a)), V(x, Math.cos(b), Math.sin(b))]); }
        L.l.material.opacity = 1 - k;
      });
    });

    make('mupet', (g) => { // a tracer front spreading from a vessel through a voxel grid
      const N = 14, cubes = [];
      const geo = new THREE.BoxGeometry(0.34, 0.34, 0.34);
      for (let x = 0; x < N; x++) for (let y = 0; y < 8; y++) {
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x2a1a20, transparent: true, opacity: 0.85 }));
        m.position.set((x - N / 2) * 0.38, (y - 4) * 0.38, 0); g.add(m); cubes.push({ m, x, y });
      }
      const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.6, 20), std(0xc23b3b, { emissive: 0x8b1a1a, emissiveIntensity: 0.6 }));
      vessel.position.set(-N * 0.19 - 0.4, 0, 0); g.add(vessel);
      const c = new THREE.Color(), hot = new THREE.Color(0xff6a4a), cold = new THREE.Color(0x2a1a20), warm = new THREE.Color(0xffc46b);
      g.rotation.set(0.3, -0.4, 0);
      return (t) => {
        const front = ((t * 0.25) % 1.3) * N;
        cubes.forEach(({ m, x, y }) => {
          const conc = Math.max(0, Math.min(1, -(x - front + Math.sin(y * 1.3 + x * 0.4) * 1.2) / 4));
          m.material.color.copy(c.copy(cold).lerp(conc > 0.6 ? warm : hot, Math.min(1, conc * 1.4)));
        });
      };
    });

    make('ppvi', (g) => { // a printed outflow tract on a bench: contrast flow and a balloon in the landing zone
      const boxGeo = new THREE.BoxGeometry(7, 3, 3);
      g.add(new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.06, depthWrite: false })));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.3 })));
      const curve = new THREE.CatmullRomCurve3([V(-3.2, -0.6, 0), V(-1.6, -0.2, 0.3), V(0, 0.4, 0), V(1.4, 0.7, -0.3), V(2.4, 1.1, 0.2), V(3.3, 0.6, 0.6)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.55, 24), new THREE.MeshStandardMaterial({ color: 0xe8b8a8, transparent: true, opacity: 0.35, roughness: 0.4, side: THREE.DoubleSide, depthWrite: false })));
      [0, 1].forEach((e) => { const cn = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.4, 24), std(0x3a3440)); const p = curve.getPoint(e); cn.position.copy(p); cn.lookAt(p.clone().add(curve.getTangent(e))); cn.rotateX(Math.PI / 2); g.add(cn); });
      const balloon = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.9, 8, 16), glow(0xffc46b, { opacity: 0.8 }));
      const lz = curve.getPoint(0.55); balloon.position.copy(lz); balloon.lookAt(lz.clone().add(curve.getTangent(0.55))); balloon.rotateX(Math.PI / 2);
      g.add(balloon);
      const dots = [...Array(50)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glow(0x9fd0ff)); m.userData.u = i / 50; g.add(m); return m; });
      g.rotation.set(0.25, -0.35, 0); g.scale.setScalar(0.85);
      return (t) => {
        dots.forEach((m) => { const u = (m.userData.u + t * 0.12) % 1; m.position.copy(curve.getPointAt(u)).add(V(0, Math.sin(u * 40) * 0.2, Math.cos(u * 33) * 0.2)); });
        const k = (Math.sin(t * 0.8) + 1) / 2;
        balloon.scale.set(0.6 + k * 1.1, 1, 0.6 + k * 1.1);
      };
    });

    make('ladhyx', (g) => { // soft gel particles squeezing through a constriction, with tracking trails
      const halfGap = (x) => 1.3 - 0.75 * Math.exp(-x * x);
      [1, -1].forEach((s) => {
        const pts = []; for (let i = 0; i <= 60; i++) { const x = -4 + (i / 60) * 8; pts.push(V(x, s * halfGap(x), 0)); }
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.6 })));
      });
      g.add(new THREE.Mesh(new THREE.PlaneGeometry(8, 2.6), new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })));
      const parts = [...Array(9)].map((_, i) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), std(0x7ccf98, { emissive: 0x2e7a49, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 }));
        const tl = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.7 }));
        m.userData = { ph: i / 9, y: Math.sin(i * 2.3) * 0.5, trail: [], tl };
        g.add(m, tl);
        return m;
      });
      g.rotation.set(0.2, -0.3, 0);
      return (t) => parts.forEach((m) => {
        const u = (t * 0.1 + m.userData.ph) % 1, x = -4 + u * 8, squeeze = 1 - 0.75 * Math.exp(-x * x);
        m.position.set(x, m.userData.y * halfGap(x) * 0.8, 0.1);
        m.scale.set(1 / Math.sqrt(squeeze), squeeze, 1);
        const tr = m.userData.trail;
        if (u < 0.01) tr.length = 0;
        tr.push(m.position.clone()); if (tr.length > 30) tr.shift();
        m.userData.tl.geometry.setFromPoints(tr);
      });
    });

    make('electrodes', (g) => { // a flexible pin electrode on skin, with a live ECG trace above
      const skin = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 5, 48, 1, true, -0.9, 1.8), std(0xd9b48f, { side: THREE.DoubleSide, roughness: 0.8 }));
      skin.rotation.z = Math.PI / 2; skin.position.y = -2.6; g.add(skin);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.15, 40), std(0x2b2d3f, { metalness: 0.2 }));
      pad.position.y = -0.35; g.add(pad);
      for (let i = 0; i < 37; i++) { const a = i * 2.4, r = 0.75 * Math.sqrt(i / 37); const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.25, 8), std(0xc9c9cf, { metalness: 0.7 })); pin.position.set(Math.cos(a) * r, -0.5, Math.sin(a) * r); g.add(pin); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, -0.3, 0), V(0.4, 0.4, 0), V(1.4, 0.9, 0)]), 20, 0.04, 6), std(0x8b1a1a)));
      const N = 200, pos = new Float32Array(N * 3), geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const ecg = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xff6a4a })); ecg.position.y = 1.6; g.add(ecg);
      const beat = (x) => { const p = ((x % 1) + 1) % 1; return p > 0.42 && p < 0.46 ? (p - 0.42) * 30 : p > 0.46 && p < 0.5 ? (0.5 - p) * 30 - 0.4 : p > 0.62 && p < 0.75 ? Math.sin(((p - 0.62) / 0.13) * Math.PI) * 0.25 : 0; };
      g.rotation.set(0.35, -0.3, 0);
      return (t) => { for (let i = 0; i < N; i++) pos.set([(i / N) * 5 - 2.5, beat((i / N) * 3 - t * 1.2), 0], i * 3); geo.attributes.position.needsUpdate = true; };
    });

    make('rbc', (g) => { // red blood cells in shear flow; particles slip inside as pores open
      const prof = [];
      for (let i = 0; i <= 20; i++) { const r = (i / 20) * 0.5; prof.push(new THREE.Vector2(r, 0.12 + 0.3 * Math.pow(r / 0.5, 2) * (1 - Math.pow(r / 0.5, 6)))); }
      for (let i = 20; i >= 0; i--) prof.push(new THREE.Vector2(prof[i].x, -prof[i].y));
      const cellGeo = new THREE.LatheGeometry(prof, 32);
      const cells = [...Array(10)].map((_, i) => { const m = new THREE.Mesh(cellGeo, std(0xc23b3b, { emissive: 0x5a0e0e, emissiveIntensity: 0.4, side: THREE.DoubleSide })); m.userData = { ph: i / 10, y: Math.sin(i * 1.9) * 1.1 }; g.add(m); return m; });
      const dots = [...Array(60)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), glow(0xffc46b)); m.userData = { cell: i % 10, a: Math.random() * 6.28, r: 0.7 + Math.random() * 0.4 }; g.add(m); return m; });
      [1.7, -1.7].forEach((y) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.04), glow(0xf2ece4, { opacity: 0.4 })); w.position.y = y; g.add(w); });
      g.rotation.set(0.15, -0.3, 0);
      return (t) => {
        cells.forEach((m) => { const u = (t * 0.07 + m.userData.ph) % 1; m.position.set(-4.5 + u * 9, m.userData.y, 0); m.rotation.set(t * (0.4 + m.userData.y * 0.3), 0, m.userData.y * 0.5 + t * 0.3); });
        dots.forEach((d) => { const c = cells[d.userData.cell], inside = (Math.sin(t * 0.6 + d.userData.cell) + 1) / 2, rr = d.userData.r * (1 - inside * 0.8); d.position.copy(c.position).add(V(Math.cos(d.userData.a + t) * rr, Math.sin(d.userData.a + t) * rr * 0.6, 0.2)); });
      };
    });

    make('carotid', (g) => { // a carotid bifurcation with pulsatile flow and a gas bubble travelling through it
      const cca = new THREE.CatmullRomCurve3([V(-3.5, -1, 0), V(-1.5, -0.6, 0), V(0, 0, 0)]);
      const ica = new THREE.CatmullRomCurve3([V(0, 0, 0), V(1.2, 0.7, 0.2), V(2.4, 1.6, 0.1), V(3.6, 2.2, 0)]);
      const eca = new THREE.CatmullRomCurve3([V(0, 0, 0), V(1.2, -0.2, -0.2), V(2.4, -0.4, -0.1), V(3.6, -0.5, 0)]);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xc23b3b, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
      [[cca, 0.55], [ica, 0.42], [eca, 0.36]].forEach(([c, r]) => g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, r, 24), wallMat)));
      const sinus = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), wallMat); sinus.position.copy(ica.getPoint(0.12)); g.add(sinus);
      const paths = [cca, ica, eca];
      const flow = [...Array(90)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), glow(0xff8a6a)); m.userData = { p: i % 3, u: Math.random(), off: V((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4) }; g.add(m); return m; });
      const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.05, metalness: 0.3 }));
      bubble.scale.set(1.2, 0.9, 0.9);
      g.add(bubble);
      g.rotation.set(0.2, -0.3, 0); g.scale.setScalar(0.9);
      let ph = 0;
      return (t, dt) => {
        ph += dt * 0.12 * (1 + 0.9 * Math.sin(t * 5)); // pulsatile
        flow.forEach((m) => m.position.copy(paths[m.userData.p].getPointAt((m.userData.u + ph) % 1)).add(m.userData.off));
        const bu = (t * 0.08) % 1;
        bubble.position.copy(bu < 0.5 ? cca.getPointAt(bu * 2) : ica.getPointAt((bu - 0.5) * 2));
      };
    });
    Object.values(explainers).forEach((ex) => { ex.base = ex.g.scale.x; });

    // The page starts on the 3D explainer where the machine can afford it.
    if (!lowPower && !reduceMotion && !isNarrow()) { mode = '3d'; if (view === 'detail') setMode('3d'); }

    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = V(0, 0, 0);
    const DIST = 13;
    const baseRatio = Math.min(devicePixelRatio, lowPower ? 1.5 : 1.75);
    let lowRes = false;
    return {
      keyframes: [{ pos: [0, 0, DIST], look: [0, 0, 0] }],
      update(t, p, dt) {
        const time = reduceMotion ? 0 : t, k = reduceMotion ? 1 : Math.min(1, dt * 4);
        // Cheap rendering while the grid is showing; the canvas is hidden then.
        const wantLow = view !== 'detail';
        if (wantLow !== lowRes) { lowRes = wantLow; renderer.setPixelRatio(wantLow ? 0.25 : baseRatio); }
        camera.position.set(0, 0, DIST); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
        const el = document.getElementById('pjStage');
        let live = view === 'detail' && mode === '3d' && !isNarrow() && el;
        if (live) {
          const rc = el.getBoundingClientRect();
          live = rc.width > 40 && rc.height > 40 && rc.bottom > 0 && rc.top < innerHeight;
          if (live) {
            ray.setFromCamera({ x: ((rc.left + rc.width / 2) / innerWidth) * 2 - 1, y: -(((rc.top + rc.height / 2) / innerHeight) * 2 - 1) }, camera);
            if (ray.ray.intersectPlane(plane, hit)) stage.position.copy(hit);
            const upp = (2 * Math.tan((camera.fov * Math.PI) / 360) * DIST) / innerHeight;
            stage.scale.setScalar(Math.min((rc.width * upp) / 11, (rc.height * upp) / 6.2));
          }
        }
        for (const [id, ex] of Object.entries(explainers)) {
          ex.s += ((live && id === current ? 1 : 0) - ex.s) * k;
          ex.g.visible = ex.s > 0.01;
          if (ex.g.visible) { ex.g.scale.setScalar(ex.s * ex.base); ex.tick(time, dt); }
        }
      },
    };
  },
});

route();

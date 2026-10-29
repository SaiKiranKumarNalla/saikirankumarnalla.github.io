import builder from '../content/ai-builder.json';
import projects from '../content/projects.json';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

// Agent roles from the Virtual PET framework (PROJECT_OVERVIEW §4), plus the coordinator.
const ROLES = [
  { name: 'Coordinator', job: 'keeps versions, dispatches work' },
  { name: 'Inventory', job: 'finds files, checks scanner and coverage' },
  { name: 'Segmentation', job: 'draws organs from CT' },
  { name: 'QC / correction', job: 'fixes marked regions in 3D' },
  { name: 'Activity map', job: 'measures uptake per region' },
  { name: 'Simulation', job: 'runs the virtual scanner' },
  { name: 'Validation', job: 'compares, reports, flags failures' },
];

function renderOrbit() {
  const g = $('orbitAgents');
  const ns = 'http://www.w3.org/2000/svg';
  ROLES.forEach((r, i) => {
    const a = (i / ROLES.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * 190, y = Math.sin(a) * 190;
    const grp = document.createElementNS(ns, 'g');
    grp.setAttribute('class', 'b-agent');
    grp.style.setProperty('--i', i);
    grp.innerHTML = `
      <line x1="0" y1="0" x2="${x}" y2="${y}" class="b-spoke"/>
      <circle cx="0" cy="0" r="4" class="b-packet" style="offset-path:path('M0,0 L${x.toFixed(1)},${y.toFixed(1)}')"/>
      <circle cx="${x}" cy="${y}" r="15" class="b-node"/>
      <text x="${x}" y="${y + (y >= 0 ? 34 : -24)}" class="b-node-label">${esc(r.name)}</text>`;
    const t = document.createElementNS(ns, 'title');
    t.textContent = `${r.name}: ${r.job}`;
    grp.appendChild(t);
    g.appendChild(grp);
  });
}

function renderPrinciples() {
  const wrap = $('bPrinciples');
  builder.principles.forEach((p, i) => {
    const c = el('article', 'b-card stagger-item');
    c.innerHTML = `<span class="b-card-n mono">0${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`;
    wrap.appendChild(c);
  });
}

function renderPipeline() {
  const steps = [
    ['Scan in', 'PET/CT plus metadata'],
    ['Inventory', 'Is the data usable?'],
    ['Anatomy', 'Organs drawn, human checks'],
    ['Activity', 'Uptake per region, human checks'],
    ['Simulate', 'CASSOULET virtual scanner'],
    ['Validate', 'Simulated vs measured report'],
    ['Learn', 'Surrogate & synthesis models (next)'],
  ];
  const ol = $('bPipeline');
  steps.forEach(([t, d], i) => {
    const li = el('li', 'b-step' + (i === steps.length - 1 ? ' is-future' : ''));
    li.style.setProperty('--i', i);
    li.innerHTML = `<span class="b-step-dot"></span><strong>${esc(t)}</strong><span>${esc(d)}</span>`;
    ol.appendChild(li);
  });
  const vp = byId.virtualpet;
  $('bNowFacts').innerHTML = (vp?.facts || []).map((f) => `<span class="b-chip">${esc(f)}</span>`).join('');
}

function renderBuilds() {
  const media = {
    'veritomix-office': '/media/veritomix-office-icon.webp',
    cassoulet: '/media/cassoulet-icon.webp',
    virtualpet: '/media/atlas-arteries.thumb.webp',
  };
  const wrap = $('bBuilds');
  builder.builds.forEach((id) => {
    const p = byId[id];
    if (!p) return; // e.g. "kage" lives on its own page
    const badge = p.status === 'coming-soon' ? '<span class="b-badge">Public soon</span>' : '';
    const img = media[id] ? `<img src="${media[id]}" alt="" loading="lazy" decoding="async">` : '';
    const c = el('article', 'b-build stagger-item');
    c.innerHTML = `
      <div class="b-build-media">${img}</div>
      <div class="b-build-body">
        <div class="b-build-kind mono">${esc(p.kind)} ${badge}</div>
        <h3>${esc(p.name)}</h3>
        <p class="b-build-eli5">“${esc(p.eli5 || '')}”</p>
        <p>${esc(p.summary)}</p>
        ${p.stack ? `<div class="b-build-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      </div>`;
    wrap.appendChild(c);
  });
}

function renderStack() {
  $('bStack').innerHTML = builder.stack.map((s) => `<span class="b-chip">${esc(s)}</span>`).join('');
  $('bRoadmap').innerHTML = builder.roadmap.map((r) => `<li>${esc(r)}</li>`).join('');
}

function animateOnView() {
  const items = document.querySelectorAll('.b-orbit-wrap, .b-pipeline, .stagger-item');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach((n) => n.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.2 });
  items.forEach((n) => io.observe(n));
}

renderOrbit();
renderPrinciples();
renderPipeline();
renderBuilds();
renderStack();
animateOnView();

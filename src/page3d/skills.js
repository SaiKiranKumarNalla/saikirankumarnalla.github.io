// Skills & Tools: a timeline of how the toolkit grew, then a 3D network. Six domains sit on a ring.
// Tools are logo discs, competencies are cut gems tinted by domain. A ring around each shows its state:
// solid = learnt, turning arc = learning, dashed = next. Threads tie skills to the projects that used them.
// Scrolling the cards flies the camera to each domain; hovering a node or a row shows its evidence.
import data from '../../content/skills.json';
import { runPage } from './engine.js';
import { iconUrl, DOMAIN_HUE } from './skills-emblems.js';
import { mountTimeline } from './skills-timeline.js';
import './skills.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ORDER = { learnt: 0, learning: 1, next: 2 };
const NOW = data.now;
const workById = Object.fromEntries(data.works.map((w) => [w.id, w]));
const domName = Object.fromEntries(data.domains.map((d) => [d.id, d.name]));
const sortSk = (a, b) => ORDER[a.state] - ORDER[b.state] || b.uses.length - a.uses.length;
const skillsOf = (d) => data.skills.filter((s) => s.domain === d).sort(sortSk);
const count = (f) => data.skills.filter(f).length;

// Years shown come from the first-use year (and the last-use year when a skill has gone quiet), never stored.
const yrs = (s) => {
  if (s.state === 'next') return 'Planned';
  if (s.state === 'learning') return `Started ${s.since}`;
  if (s.until) return s.until === s.since ? `${s.since}` : `${s.since}–${s.until}`;
  const n = NOW - s.since;
  return n <= 0 ? 'Under 1 yr' : `${n} yr${n === 1 ? '' : 's'}`;
};
const usesTxt = (s) => `${s.uses.length} project${s.uses.length === 1 ? '' : 's'}`;
const ico = (s) => `<span class="sk-ico sk-ico-${s.kind}" aria-hidden="true"><img src="${esc(iconUrl(s))}" alt="" loading="lazy" decoding="async"></span>`;
const stateMark = (s) => `<span class="sk-st sk-${s.state}" title="${esc(data.states[s.state].name)}">${s.state === 'learnt' ? '<i></i>' : esc(data.states[s.state].name)}</span>`;
const TYPE = { project: 'Projects', thesis: 'Theses', paper: 'Papers & posters' };
const detail = (s) => `<p>${esc(s.evidence)}</p>${['project', 'thesis', 'paper'].map((t) => {
  const ws = s.uses.map((u) => workById[u]).filter((w) => w.type === t);
  return ws.length ? `<div class="sk-uses"><span>${TYPE[t]}</span>${ws.map((w) => `<a href="${esc(w.href)}">${esc(w.name)}</a>`).join('')}</div>` : '';
}).join('')}`;

const row = (s, showDomain = false) => `<li class="sk-row" data-skill="${s.id}" data-state="${s.state}" data-kind="${s.kind}">
    <button type="button" class="sk-rowbtn" aria-expanded="false">
      ${ico(s)}
      <span class="sk-nm"><b>${esc(s.name)}</b><small>${showDomain ? `${esc(domName[s.domain])} · ` : ''}${esc(yrs(s))} · ${usesTxt(s)}</small></span>
      ${stateMark(s)}<span class="sk-chev" aria-hidden="true"></span>
    </button>
    <div class="sk-detail" hidden>${detail(s)}</div>
  </li>`;

const SHOW = 4; // rows visible per group before "Show all"
const group = (kind, list, showDomain) => list.length ? `<div class="sk-group" data-kind="${kind}">
    <div class="sk-ghead"><span class="sk-shape sk-shape-${kind}" aria-hidden="true"></span>${esc(data.kinds[kind].name)}<em>${list.length}</em></div>
    <ul class="sk-list">${list.map((s, i) => { const x = list.length > SHOW + 1 && i >= SHOW; return row(s, showDomain).replace('<li class="sk-row"', `<li class="sk-row${x ? ' sk-extra' : ''}"${x ? ' hidden' : ''}`); }).join('')}</ul>
    ${list.length > SHOW + 1 ? `<button type="button" class="sk-more" aria-expanded="false" data-n="${list.length}">Show all ${list.length}</button>` : ''}</div>` : '';
const groups = (list, showDomain = false) => group('competency', list.filter((s) => s.kind === 'competency'), showDomain) + group('tool', list.filter((s) => s.kind === 'tool'), showDomain);

const ringSvg = {
  learnt: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  learning: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  next: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.6 2.6"/></svg>',
};

const D0 = 2; // index of the first domain step
const STEPS = [
  { title: 'Skills & Tools', html: `<p class="s-kicker">Competencies &amp; tools</p>
      <h1>Skills &amp; tools</h1>
      <p class="s-lede">${esc(data.intro)}</p>
      <div class="s-stat"><div><b>${count((s) => s.kind === 'competency')}</b><span>Competencies</span></div><div><b>${count((s) => s.kind === 'tool')}</b><span>Tools</span></div><div><b>${count((s) => s.state !== 'learnt')}</b><span>Learning &amp; next</span></div></div>
      <ul class="sk-states">${['learnt', 'learning', 'next'].map((st) => `<li class="sk-${st}" title="${esc(data.states[st].text)}">${ringSvg[st]}${esc(data.states[st].name)}</li>`).join('')}</ul>
      <div class="sk-jump">${data.domains.map((d, i) => `<button type="button" data-jump="${i + D0}" data-domain="${d.id}">${esc(d.name)}</button>`).join('')}</div>
      <p class="s-scroll">Scroll for the timeline and the six domains</p>` },
  { title: 'Over the years', timeline: true, wide: true, html: `<p class="s-kicker">2016 to ${NOW}</p><h2>How the toolkit grew</h2>
      <p class="sk-short">Each bar starts the year a skill was first used. Dotted: not used since.</p>
      <div class="sk-tl" id="skTimeline"></div>` },
  ...data.domains.map((d, k) => ({ title: d.name, domain: d.id, html: `<p class="s-kicker">${k + 1} / ${data.domains.length} · ${esc(d.kicker)}</p>
      <h2>${esc(d.name)}</h2><p class="sk-short">${esc(d.text)}</p>
      ${groups(skillsOf(d.id))}` })),
  { title: 'Learning and next', focus: 'growing', html: `<p class="s-kicker">Right now</p><h2>Learning and next</h2>
      <p class="sk-short">Generative and surrogate models trained on CASSOULET, run by agent teams with human gates.</p>
      ${groups(data.skills.filter((s) => s.state !== 'learnt').sort(sortSk), true)}
      <a class="s-more" href="/sections/builder.html">How the agent teams work</a>` },
];

const main = document.getElementById('main');
main.innerHTML = `<div class="sk-bar" role="toolbar" aria-label="Show tools or competencies">
    ${[['all', 'All'], ['tool', 'Tools'], ['competency', 'Competencies']].map(([v, n]) => `<button type="button" data-filter="${v}" aria-pressed="${v === 'all'}">${v === 'all' ? '' : `<span class="sk-shape sk-shape-${v}" aria-hidden="true"></span>`}${n}</button>`).join('')}
  </div>
  ${STEPS.map((s, i) => `<section class="sk-step${i === 0 ? ' s-hero' : ''}${s.wide ? ' sk-wide' : ''}" data-title="${esc(s.title)}" id="step-${i}"><div class="s-card">${s.html}</div></section>`).join('')}
  <p class="sk-foot s-meta">© 2026 Sai Kiran Kumar Nalla · <a href="/">Back to the village</a></p>`;

// Rows expand to show evidence and links.
const expandGroup = (g, open) => {
  g.querySelectorAll('.sk-extra').forEach((r) => { r.hidden = !open; });
  const m = g.querySelector('.sk-more');
  if (m) { m.setAttribute('aria-expanded', String(open)); m.textContent = open ? 'Show fewer' : `Show all ${m.dataset.n}`; }
};
main.addEventListener('click', (e) => {
  const m = e.target.closest('.sk-more');
  if (m) { expandGroup(m.closest('.sk-group'), m.getAttribute('aria-expanded') !== 'true'); return; }
  const b = e.target.closest('.sk-rowbtn'); if (!b) return;
  const open = b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', String(open));
  b.nextElementSibling.hidden = !open;
});

// Hooks the 3D scene fills in, so the DOM parts work even without WebGL.
const hooks = { hover: () => {}, filter: () => {} };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const timeline = mountTimeline(document.getElementById('skTimeline'), {
  skills: data.skills, domains: data.domains, milestones: data.milestones, now: NOW, iconUrl, reduceMotion: reduce,
  onHover: (s, e, tap) => hooks.hover(s, e, tap),
});

let filter = 'all';
main.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
  filter = b.dataset.filter;
  main.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  document.documentElement.dataset.skKind = filter;
  timeline.setKind(filter);
  hooks.filter();
}));

runPage({
  active: 'skills',
  build({ THREE, scene, camera, renderer, reduceMotion, lowPower, label }) {
    const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
    const root = new THREE.Group();
    scene.add(root);

    // ---------- Textures (drawn once on canvases) ----------
    const tex = (draw, size = 128) => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d'); draw(g, size);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return { t, c, g };
    };
    const ring = (dash, arc) => tex((g, n) => {
      g.strokeStyle = '#fff'; g.lineCap = 'round';
      if (arc) {
        for (let k = 0; k < 40; k++) {
          const a0 = -Math.PI / 2 + (k / 40) * Math.PI * 1.45;
          g.globalAlpha = 0.08 + 0.92 * (k / 40); g.lineWidth = 6;
          g.beginPath(); g.arc(n / 2, n / 2, n * 0.42, a0, a0 + Math.PI * 1.45 / 40 + 0.02); g.stroke();
        }
      } else {
        g.lineWidth = dash ? 4 : 5.5; if (dash) g.setLineDash([9, 9]);
        g.beginPath(); g.arc(n / 2, n / 2, n * 0.42, 0, Math.PI * 2); g.stroke();
      }
    });
    const RING = { learnt: ring(false, false).t, learning: ring(false, true).t, next: ring(true, false).t };
    const glowTex = tex((g, n) => {
      const r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(0.45, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, n, n);
    }).t;
    // A tool's face: white disc, thin rim, its logo or emblem (aspect kept, so wide logos fit).
    const disc = (s) => {
      const { t, g } = tex((g2, n) => {
        g2.fillStyle = '#fff'; g2.beginPath(); g2.arc(n / 2, n / 2, n * 0.34, 0, Math.PI * 2); g2.fill();
        g2.strokeStyle = 'rgba(0,0,0,.12)'; g2.lineWidth = 2; g2.stroke();
      });
      const img = new Image();
      img.onload = () => {
        const n = 128, w = 46, iw0 = img.naturalWidth || w, ih0 = img.naturalHeight || w, k = Math.min(w / iw0, w / ih0);
        g.drawImage(img, n / 2 - (iw0 * k) / 2, n / 2 - (ih0 * k) / 2, iw0 * k, ih0 * k); t.needsUpdate = true;
      };
      img.src = iconUrl(s);
      return t;
    };
    // A competency: a cut gem (pavilion, girdle, crown, table) with flat facets, tinted by its domain.
    const gemGeo = new THREE.LatheGeometry([[0, -0.52], [0.44, 0.06], [0.46, 0.12], [0.3, 0.3], [0, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)), 8);

    // ---------- Layout ----------
    const R = 9.5;
    const domains = data.domains.map((d, i) => {
      const a = (i / data.domains.length) * Math.PI * 2 - Math.PI / 2 - Math.PI / 6;
      const center = V(Math.cos(a) * R, (i % 2 ? 0.9 : -0.9), Math.sin(a) * R);
      const out = V(Math.cos(a), 0, Math.sin(a)).add(V(0, 22, 36).sub(center).normalize()).normalize();
      const side = V(0, 1, 0).cross(out).normalize();
      const up = out.clone().cross(side).normalize();
      const pts = []; for (let k = 0; k <= 64; k++) { const t = (k / 64) * Math.PI * 2; pts.push(center.clone().addScaledVector(side, Math.cos(t) * 4.3).addScaledVector(up, Math.sin(t) * 4.3)); }
      const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.18, depthWrite: false }));
      root.add(orbit);
      const lbl = label(`<b>${esc(d.name)}</b><span>${skillsOf(d.id).length} skills</span>`, () => center.clone().add(V(0, 4.6, 0)), 's-pin sk-dlabel');
      return { ...d, i, center, out, side, up, orbit, lbl };
    });

    const golden = Math.PI * (3 - Math.sqrt(5));
    const nodes = [];
    domains.forEach((d) => {
      skillsOf(d.id).forEach((s, k) => {
        const r = 1.0 * Math.sqrt(k + 0.4), th = k * golden;
        const pos = d.center.clone().addScaledVector(d.side, Math.cos(th) * r).addScaledVector(d.up, Math.sin(th) * r).addScaledVector(d.out, Math.sin(k * 2.3) * 0.35);
        const size = s.state === 'learnt' ? 0.92 : s.state === 'learning' ? 0.84 : 0.74;
        const gem = s.kind === 'competency';
        const face = gem
          ? new THREE.Mesh(gemGeo, new THREE.MeshStandardMaterial({ color: DOMAIN_HUE[s.domain], flatShading: true, roughness: 0.28, metalness: 0.35, transparent: true }))
          : new THREE.Sprite(new THREE.SpriteMaterial({ map: disc(s), transparent: true, depthWrite: false }));
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: RING[s.state], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        face.renderOrder = 3; halo.renderOrder = 2; glow.renderOrder = 1;
        [glow, halo, face].forEach((m) => { m.position.copy(pos); root.add(m); });
        face.userData.node = nodes.length;
        const name = label(`<b>${esc(s.name)}</b>`, () => face.position, 's-pin sk-slabel');
        name.visible = false;
        nodes.push({ s, d, pos, size, gem, face, halo, glow, name, em: 1, show: 0, tl: 1, lines: [], seed: nodes.length * 0.73 });
      });
    });
    const nodeById = Object.fromEntries(nodes.map((n) => [n.s.id, n]));

    // Projects and theses (papers are counted on the cards, not drawn): small diamonds near their skills.
    const projGeo = new THREE.OctahedronGeometry(0.2, 0);
    const projects = data.works.filter((w) => w.type !== 'paper').map((p) => {
      const used = nodes.filter((n) => n.s.uses.includes(p.id));
      const c = V(); used.forEach((n) => c.add(n.pos)); c.divideScalar(Math.max(1, used.length));
      const pos = c.multiplyScalar(used.length > 1 && new Set(used.map((n) => n.d.id)).size > 1 ? 0.42 : 0.68);
      pos.y -= 1.6;
      return { ...p, pos, used };
    }).filter((p) => p.used.length).map((p) => {
      const mesh = new THREE.Mesh(projGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, roughness: 0.4, metalness: 0.1, transparent: true }));
      mesh.position.copy(p.pos); root.add(mesh);
      const lbl = label(`<b>${esc(p.name)}</b>`, () => p.pos, 's-pin sk-plabel');
      lbl.visible = false;
      return { ...p, mesh, lbl, em: 0.3 };
    });
    const projMap = Object.fromEntries(projects.map((p) => [p.id, p]));

    const links = [];
    nodes.forEach((n) => n.s.uses.forEach((pid) => {
      const p = projMap[pid]; if (!p) return;
      const mid = n.pos.clone().lerp(p.pos, 0.5).add(V(0, 0.6, 0));
      const curve = new THREE.QuadraticBezierCurve3(n.pos, mid, p.pos);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(lowPower ? 8 : 16)), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.06, depthWrite: false }));
      root.add(line);
      const l = { n, p, line, o: 0.06 };
      links.push(l); n.lines.push(l);
    }));

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.5 }));
    root.add(core);
    const spokes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(domains.flatMap((d) => [V(), d.center])), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.08, depthWrite: false }));
    root.add(spokes);

    // ---------- Theme ----------
    const COL = {
      dark: { learnt: [1.0, 0.32, 0.3], learning: [1.0, 0.7, 0.3], next: [0.55, 0.53, 0.62], face: 0.8, gemE: 0.32, line: 0xe8b0a8, core: 0xd24a4a, proj: 0xf2ece4, projE: 0x6a1a1a },
      light: { learnt: [0.64, 0.14, 0.14], learning: [0.8, 0.46, 0.0], next: [0.42, 0.4, 0.46], face: 1.0, gemE: 0.06, line: 0x8b1a1a, core: 0xa32424, proj: 0xb04a3c, projE: 0x000000 },
    };
    let pal = COL.dark, night = true;
    function onTheme(p) {
      night = p.night; pal = night ? COL.dark : COL.light;
      nodes.forEach((n) => {
        n.halo.material.color.setRGB(...pal[n.s.state]);
        n.glow.material.color.setRGB(...pal[n.s.state]).multiplyScalar(night ? 0.22 : 0);
        n.halo.material.blending = night ? THREE.AdditiveBlending : THREE.NormalBlending;
        if (n.gem) n.face.material.emissive.set(DOMAIN_HUE[n.s.domain]).multiplyScalar(pal.gemE);
        else n.face.material.color.setScalar(pal.face);
        n.halo.material.needsUpdate = true;
      });
      links.forEach((l) => l.line.material.color.set(pal.line));
      domains.forEach((d) => d.orbit.material.color.set(pal.line));
      spokes.material.color.set(pal.line);
      core.material.color.set(pal.core);
      projects.forEach((p) => { p.mesh.material.color.set(pal.proj); p.mesh.material.emissive.set(pal.projE); });
    }

    // ---------- Interaction ----------
    const tip = document.getElementById('skTip');
    let hoverNode = null, rowNode = null, pinned = false;
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const faces = nodes.map((n) => n.face);
    const canvas = renderer.domElement;
    const passes = (n) => filter === 'all' || n.s.kind === filter;
    const pick = (x, y) => {
      pointer.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(faces).find((h) => { const n = nodes[h.object.userData.node]; return n.show * n.tl > 0.5 && passes(n); });
      return hit ? nodes[hit.object.userData.node] : null;
    };
    function showTip(n, x, y) {
      if (!n) { tip.hidden = true; return; }
      const s = n.s;
      const names = s.uses.map((u) => workById[u].name);
      tip.innerHTML = `<div class="sk-tip-head">${ico(s)}<div><b>${esc(s.name)}</b>
        <span>${esc(data.kinds[s.kind].one)} · ${s.until ? `${s.since}–${s.until} · ` : s.since ? `since ${s.since} · ` : ''}${esc(data.states[s.state].name)}</span></div></div>
        <p>${esc(s.evidence)}</p><span class="sk-tip-uses">${usesTxt(s)}: ${esc(names.slice(0, 5).join(', '))}${names.length > 5 ? ` and ${names.length - 5} more` : ''}</span>`;
      tip.hidden = false;
      const w = tip.offsetWidth, h = tip.offsetHeight;
      const maxY = innerWidth <= 860 ? innerHeight * 0.42 : innerHeight - 12;
      tip.style.left = `${Math.max(12, Math.min(innerWidth - w - 12, x + 18))}px`;
      tip.style.top = `${Math.max(64, Math.min(maxY - h, y - h / 2))}px`;
    }
    canvas.style.touchAction = 'pan-y';
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || pinned) return;
      if (e.target !== canvas) { if (hoverNode) { hoverNode = null; showTip(null); canvas.style.cursor = ''; } return; }
      const n = pick(e.clientX, e.clientY);
      if (n !== hoverNode) { hoverNode = n; canvas.style.cursor = n ? 'pointer' : ''; }
      showTip(n, e.clientX, e.clientY);
    }, { passive: true });
    canvas.addEventListener('click', (e) => {
      const n = pick(e.clientX, e.clientY);
      hoverNode = n; pinned = !!n && e.pointerType === 'touch';
      showTip(n, e.clientX, e.clientY);
      if (!n) { pinned = false; return; }
      const stepIdx = data.domains.findIndex((d) => d.id === n.d.id) + D0;
      if (Math.round(progress) !== stepIdx) goTo(stepIdx);
      const r = document.querySelector(`#step-${stepIdx} [data-skill="${n.s.id}"]`);
      if (r?.hidden) expandGroup(r.closest('.sk-group'), true);
      if (r) { r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); }
    });
    main.addEventListener('pointerover', (e) => { const r = e.target.closest('.sk-row'); if (r) rowNode = nodeById[r.dataset.skill]; else if (!e.target.closest('.sk-lane')) rowNode = null; });
    main.addEventListener('pointerleave', () => { rowNode = null; });
    main.addEventListener('focusin', (e) => { const r = e.target.closest('.sk-row'); rowNode = r ? nodeById[r.dataset.skill] : null; });
    main.addEventListener('focusout', () => { rowNode = null; });
    // Timeline lanes light their node and show the same card.
    hooks.hover = (s, e) => {
      rowNode = s ? nodeById[s.id] : null;
      if (s && e) showTip(rowNode, e.clientX, e.clientY); else showTip(null);
    };
    hooks.filter = () => { if (hoverNode && !passes(hoverNode)) { hoverNode = null; showTip(null); } };

    // ---------- Scroll steps (the column scrolls the window on desktop, itself on phones) ----------
    const steps = [...main.querySelectorAll('.sk-step')];
    const narrow = () => innerWidth <= 860;
    function measure() {
      const box = narrow() ? main.getBoundingClientRect() : { top: 0, height: innerHeight };
      const anchor = box.top + box.height * (narrow() ? 0.35 : 0.5);
      const centers = steps.map((s) => { const r = s.getBoundingClientRect(); return r.top + Math.min(r.height, box.height) / 2; });
      if (anchor <= centers[0]) return 0;
      for (let i = 0; i < centers.length - 1; i++) if (anchor < centers[i + 1]) return i + (anchor - centers[i]) / (centers[i + 1] - centers[i]);
      return centers.length - 1;
    }
    let target = 0, progress = 0;
    const onScroll = () => { target = measure(); };
    addEventListener('scroll', onScroll, { passive: true });
    main.addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    const goTo = (i) => {
      const el = steps[i]; if (!el) return;
      if (narrow()) main.scrollTo({ top: el.offsetTop - 8, behavior: reduceMotion ? 'auto' : 'smooth' });
      else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };
    main.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.jump)));
    const dots = document.getElementById('dots');
    steps.forEach((s, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Go to: ${s.dataset.title}`); b.title = s.dataset.title;
      b.addEventListener('click', () => goTo(i));
      dots.appendChild(b);
    });
    const deep = /^#step-(\d+)$/.exec(location.hash);
    if (deep && steps[+deep[1]]) requestAnimationFrame(() => { goTo(+deep[1]); });
    requestAnimationFrame(() => { target = progress = measure(); });

    // Camera frames: overview, a lower view for the timeline, one per domain, and a high view for "learning".
    const frames = [
      { pos: V(0, 25, 40), look: V(0, -1.5, 0), sh: 1 },
      { pos: V(4, 13, 38), look: V(0, -0.5, 0), sh: 1 },
      ...domains.map((d) => ({ pos: d.center.clone().addScaledVector(d.out, 19.5).addScaledVector(d.side, -0.6).addScaledVector(d.up, 1.2), look: d.center.clone().addScaledVector(d.up, -0.3), sh: 0 })),
      { pos: V(-7, 24, 25), look: V(0, -2, 0), sh: 1 },
    ];
    const smooth = (x) => x * x * (3 - 2 * x);
    const camPos = frames[0].pos.clone(), camLook = frames[0].look.clone(), wantPos = V(), wantLook = V();
    let wasNarrow = null, currentStep = -1, introT = 0;
    const tiny = (v) => Math.max(0.0001, v);

    return {
      keyframes: [{ pos: [0, 11, 30], look: [0, 0, 0] }],
      onTheme,
      update(t, _p, dt) {
        const time = reduceMotion ? 0 : t;
        const nar = narrow();
        if (nar !== wasNarrow) { wasNarrow = nar; camera.fov = nar ? 48 : 35; }
        if (nar) camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * 0.25, innerWidth, innerHeight);
        else camera.updateProjectionMatrix();

        progress += (target - progress) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2));
        const i = Math.min(frames.length - 2, Math.max(0, Math.floor(progress)));
        const f = smooth(Math.max(0, Math.min(1, progress - i)));
        wantPos.lerpVectors(frames[i].pos, frames[i + 1].pos, f);
        wantLook.lerpVectors(frames[i].look, frames[i + 1].look, f);
        const sh = frames[i].sh + (frames[i + 1].sh - frames[i].sh) * f;
        if (nar) wantPos.sub(wantLook).multiplyScalar(sh ? 1.3 : 1.45).add(wantLook);
        else { wantPos.x -= 1.5 * sh; wantLook.x -= 1.5 * sh; }
        camPos.copy(wantPos); camLook.copy(wantLook);
        if (!reduceMotion) camPos.x += Math.sin(t * 0.21) * 0.35, camPos.y += Math.sin(t * 0.29) * 0.2;
        camera.position.copy(camPos); camera.lookAt(camLook);
        camera.updateMatrixWorld();

        const step = Math.round(progress);
        if (step !== currentStep) {
          currentStep = step;
          steps.forEach((s, k) => s.classList.toggle('on', k === step));
          [...dots.children].forEach((d, k) => d.classList.toggle('on', k === step));
        }
        const stepDef = STEPS[Math.max(0, Math.min(STEPS.length - 1, step))];
        document.documentElement.classList.toggle('sk-tl-on', !!stepDef.timeline);
        const activeDom = stepDef.domain, growing = stepDef.focus === 'growing';
        // In the timeline step the network grows with the playhead.
        const tlYear = stepDef.timeline ? timeline.year : Infinity;
        const focus = hoverNode || rowNode;

        introT = reduceMotion ? 10 : t;
        const k = 1 - Math.exp(-dt * 7);
        nodes.forEach((n, idx) => {
          let em = 1;
          if (activeDom && n.d.id !== activeDom) em = 0.07;
          if (growing && n.s.state === 'learnt') em = 0.2;
          if (focus) em = n === focus ? 1.25 : Math.min(em, 0.35);
          if (!passes(n)) em = 0.05;
          n.em += (em - n.em) * k;
          const born = (n.s.state === 'next' ? timeline.end - 0.02 : n.s.since) <= tlYear ? 1 : 0;
          n.tl += (born - n.tl) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 9));
          n.show = reduceMotion ? 1 : smooth(Math.max(0, Math.min(1, (introT - 0.25 - idx * 0.028) / 0.7)));
          const pulse = n.s.state === 'learning' && !reduceMotion ? 1 + Math.sin(time * 2.4 + n.seed) * 0.07 : 1;
          const sz = n.size * n.show * n.tl * (n === focus ? 1.18 : 1) * (growing && n.s.state !== 'learnt' ? 1.4 : 1);
          const bob = reduceMotion ? 0 : Math.sin(time * 0.8 + n.seed) * 0.06;
          [n.face, n.halo, n.glow].forEach((m) => { m.position.set(n.pos.x, n.pos.y + bob, n.pos.z); });
          if (n.gem) { n.face.scale.setScalar(tiny(sz * 0.95)); n.face.rotation.set(0.42, time * 0.5 + n.seed, 0); }
          else n.face.scale.setScalar(tiny(sz));
          n.halo.scale.setScalar(tiny(sz * 1.45 * pulse));
          n.glow.scale.setScalar(tiny(sz * (n.s.state === 'learnt' ? 3.0 : n.s.state === 'learning' ? 2.6 * pulse : 1.6)));
          if (n.s.state === 'learning' && !reduceMotion) n.halo.material.rotation = -time * 1.1 - n.seed;
          const a = Math.min(1, n.em);
          n.face.material.opacity = a * (n.s.state === 'next' ? 0.72 : 1);
          n.halo.material.opacity = a * (n.s.state === 'next' ? 0.7 : 1);
          n.name.visible = n.show * n.tl > 0.9 && passes(n) && focus === n;
          n.glow.material.opacity = a * (n.s.state === 'learning' ? 0.75 + 0.25 * Math.sin(time * 2.4 + n.seed) : 0.8);
        });

        const lit = new Set();
        links.forEach((l) => {
          let o = lowPower ? 0.05 : 0.07;
          if (activeDom && l.n.d.id === activeDom && passes(l.n)) o = 0.3;
          if (growing && l.n.s.state !== 'learnt' && passes(l.n)) o = 0.3;
          if (!passes(l.n) || (activeDom && l.n.d.id !== activeDom)) o = 0.025;
          if (focus) o = l.n === focus ? 0.9 : 0.02;
          if (o >= 0.3) lit.add(l.p.id);
          l.o += (o - l.o) * k;
          l.line.material.opacity = l.o * (night ? 1 : 0.9) * Math.min(1, l.n.show * l.n.tl * 1.5);
        });
        projects.forEach((p) => {
          const on = lit.has(p.id);
          p.em += ((on ? 1 : focus ? 0.15 : 0.45) - p.em) * k;
          p.mesh.material.opacity = p.em;
          p.mesh.rotation.y = time * 0.6; p.mesh.rotation.x = 0.4;
          p.mesh.scale.setScalar((0.8 + p.em * 0.6) * Math.min(1, introT / 1.4));
          p.lbl.visible = on && !!focus;
        });
        domains.forEach((d) => {
          d.lbl.visible = !focus && !activeDom && !nar && !stepDef.timeline;
          d.orbit.material.opacity = (activeDom === d.id ? 0.32 : 0.12) * (night ? 1 : 0.8);
        });
        core.rotation.y = time * 0.15; core.rotation.x = time * 0.07;
        core.material.opacity = activeDom ? 0.15 : 0.45;
        spokes.material.opacity = activeDom ? 0.03 : 0.08;
      },
    };
  },
});

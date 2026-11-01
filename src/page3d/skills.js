// Skills & Tools: a 3D constellation. Six domains sit on a ring; each skill is a star with its logo.
// Learnt skills are solid lit rings, Learning skills have a turning, pulsing arc, Next skills are dashed.
// Faint threads tie every skill to the projects that used it. Scrolling the cards flies the camera to
// each domain; hovering a star (or a card row) shows its evidence and lights up its projects.
import data from '../../content/skills.json';
import { runPage } from './engine.js';
import './skills.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ORDER = { learnt: 0, learning: 1, next: 2 };
const projById = Object.fromEntries(data.projects.map((p) => [p.id, p]));
const skillsOf = (d) => data.skills.filter((s) => s.domain === d).sort((a, b) => ORDER[a.state] - ORDER[b.state]);
const count = (st) => data.skills.filter((s) => s.state === st).length;

// ---------- Text column ----------
// Methods and lab skills have no brand logo: they get a small line icon for their domain instead
// (scanner ring, wave, brackets, agent graph, cube, flask), always shown with the full skill name.
const GLYPH = {
  imaging: '<circle cx="12" cy="11" r="7.5"/><circle cx="12" cy="11" r="3"/><path d="M3 20h18"/>',
  sim: '<path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3.5-4 5-2"/><path d="M2 20h20"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
  agents: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2l-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9"/>',
  creative: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>',
  lab: '<path d="M9 2h6M10 2v6L4 19a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L14 8V2"/><path d="M7 15h10"/>',
};
const glyphSvg = (d) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8b1a1a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${GLYPH[d]}</svg>`;
const icon = (s) => s.logo || `data:image/svg+xml,${encodeURIComponent(glyphSvg(s.domain))}`;
const mark = (s) => `<img src="${esc(icon(s))}" alt="" width="18" height="18" loading="lazy" decoding="async">`;
const badge = (st) => `<span class="sk-badge sk-${st}">${esc(data.states[st].name)}</span>`;
const row = (s, i, showDomain = false) => `<li class="sk-row" data-skill="${s.id}" data-state="${s.state}" tabindex="0" style="--i:${i}">
    <span class="sk-logo" aria-hidden="true">${mark(s)}</span>
    <div class="sk-body">
      <div class="sk-head"><b>${esc(s.name)}</b>${badge(s.state)}</div>
      <p>${esc(s.evidence)}</p>
      <span class="sk-used">${showDomain ? `${esc(data.domains.find((d) => d.id === s.domain).name)} · ` : ''}${s.projects.map((p) => `<a href="${esc(projById[p].href)}">${esc(projById[p].name)}</a>`).join(', ')}</span>
    </div>
  </li>`;
// Small legend glyphs that match the 3D rings.
const glyph = (st) => ({
  learnt: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  learning: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  next: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.6 2.6"/></svg>',
}[st]);

const STEPS = [
  { title: 'Skills & Tools', domain: null, html: `<p class="s-kicker">Skills &amp; Tools</p>
      <h1>What I know, and what I am learning</h1>
      <p class="s-lede">${esc(data.intro)}</p>
      <div class="s-stat">${['learnt', 'learning', 'next'].map((st) => `<div><b>${count(st)}</b><span>${esc(data.states[st].name)}</span></div>`).join('')}</div>
      <ul class="sk-legend">${['learnt', 'learning', 'next'].map((st) => `<li class="sk-${st}">${glyph(st)}<div><b>${esc(data.states[st].name)}</b><span>${esc(data.states[st].text)}</span></div></li>`).join('')}</ul>
      <span class="pj-label">Jump to a domain</span>
      <div class="sk-jump">${data.domains.map((d, i) => `<button type="button" data-jump="${i + 1}">${esc(d.name)}</button>`).join('')}</div>
      <p class="s-meta sk-hint">Hover or tap a star to see where the skill was used.</p>
      <p class="s-scroll">Scroll through the six domains</p>` },
  ...data.domains.map((d, k) => ({ title: d.name, domain: d.id, html: `<p class="s-kicker">${k + 1} / ${data.domains.length} · ${esc(d.kicker)}</p>
      <h2>${esc(d.name)}</h2><p>${esc(d.text)}</p>
      <ul class="sk-list">${skillsOf(d.id).map((s, i) => row(s, i)).join('')}</ul>` })),
  { title: 'In progress', domain: null, focus: 'growing', html: `<p class="s-kicker">Right now</p><h2>Learning and next</h2>
      <p>The direction: from simulating PET/CT to learning it. Small generative and surrogate models trained on CASSOULET, run by agent teams with human gates.</p>
      <ul class="sk-list">${data.skills.filter((s) => s.state !== 'learnt').sort((a, b) => ORDER[a.state] - ORDER[b.state]).map((s, i) => row(s, i, true)).join('')}</ul>
      <a class="s-more" href="/sections/builder.html">How the agent teams work</a>` },
];

const main = document.getElementById('main');
main.innerHTML = `<div class="sk-bar" role="toolbar" aria-label="Filter skills by state">
    ${[['all', 'All'], ['learnt', 'Learnt'], ['learning', 'Learning'], ['next', 'Next']].map(([v, n]) => `<button type="button" data-filter="${v}" aria-pressed="${v === 'all'}">${v === 'all' ? '' : `<i class="sk-dot sk-${v}"></i>`}${n}</button>`).join('')}
  </div>
  ${STEPS.map((s, i) => `<section class="sk-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}" id="step-${i}"><div class="s-card">${s.html}</div></section>`).join('')}
  <p class="sk-foot s-meta">© 2026 Sai Kiran Kumar Nalla · <a href="/">Back to the village</a></p>`;

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
        // A comet arc: bright head, fading tail.
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
    // The star's face: white disc, thin rim, the brand logo (or the domain's line icon).
    const disc = (s) => {
      const { t, g } = tex((g2, n) => {
        g2.fillStyle = '#fff'; g2.beginPath(); g2.arc(n / 2, n / 2, n * 0.34, 0, Math.PI * 2); g2.fill();
        g2.strokeStyle = 'rgba(0,0,0,.12)'; g2.lineWidth = 2; g2.stroke();
      });
      const img = new Image();
      img.onload = () => { const n = 128, w = 42; g.drawImage(img, n / 2 - w / 2, n / 2 - w / 2, w, w); t.needsUpdate = true; };
      img.src = icon(s);
      return t;
    };

    // ---------- Layout ----------
    const R = 9.5;
    const domains = data.domains.map((d, i) => {
      const a = (i / data.domains.length) * Math.PI * 2 - Math.PI / 2 - Math.PI / 6;
      const center = V(Math.cos(a) * R, (i % 2 ? 0.9 : -0.9), Math.sin(a) * R);
      // Each cluster is a disc whose face turns halfway between 'outward' and the overview camera,
      // so no domain is seen edge-on from the overview and each has a clean front for its close-up.
      const out = V(Math.cos(a), 0, Math.sin(a)).add(V(0, 22, 36).sub(center).normalize()).normalize();
      const side = V(0, 1, 0).cross(out).normalize();
      const up = out.clone().cross(side).normalize();
      // Faint orbit around the cluster, facing outward.
      const pts = []; for (let k = 0; k <= 64; k++) { const t = (k / 64) * Math.PI * 2; pts.push(center.clone().addScaledVector(side, Math.cos(t) * 4.3).addScaledVector(up, Math.sin(t) * 4.3)); }
      const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.18, depthWrite: false }));
      root.add(orbit);
      const lbl = label(`<b>${esc(d.name)}</b><span>${skillsOf(d.id).length} skills</span>`, () => center.clone().add(V(0, 4.6, 0)), 's-pin sk-dlabel');
      return { ...d, i, center, out, side, up, orbit, lbl };
    });
    const domById = Object.fromEntries(domains.map((d) => [d.id, d]));

    const golden = Math.PI * (3 - Math.sqrt(5));
    const nodes = [];
    domains.forEach((d) => {
      skillsOf(d.id).forEach((s, k) => {
        // Phyllotaxis disc in the plane facing out from the ring, with a little depth.
        const r = 1.0 * Math.sqrt(k + 0.4), th = k * golden;
        const pos = d.center.clone().addScaledVector(d.side, Math.cos(th) * r).addScaledVector(d.up, Math.sin(th) * r).addScaledVector(d.out, Math.sin(k * 2.3) * 0.35);
        const size = s.state === 'learnt' ? 0.92 : s.state === 'learning' ? 0.84 : 0.74;
        const face = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc(s), transparent: true, depthWrite: false }));
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: RING[s.state], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        face.renderOrder = 3; halo.renderOrder = 2; glow.renderOrder = 1;
        [glow, halo, face].forEach((m) => { m.position.copy(pos); root.add(m); });
        face.userData.node = nodes.length;
        const name = label(`<b>${esc(s.name)}</b>`, () => face.position, 's-pin sk-slabel');
        name.visible = false;
        nodes.push({ s, d, pos, size, face, halo, glow, name, em: 1, show: 0, lines: [], seed: nodes.length * 0.73 });
      });
    });
    const nodeById = Object.fromEntries(nodes.map((n) => [n.s.id, n]));

    // Projects: small diamonds pulled toward the centre of the skills that used them.
    const projGeo = new THREE.OctahedronGeometry(0.2, 0);
    const projects = data.projects.map((p) => {
      const used = nodes.filter((n) => n.s.projects.includes(p.id));
      const c = V(); used.forEach((n) => c.add(n.pos)); c.divideScalar(Math.max(1, used.length));
      const pos = c.multiplyScalar(used.length > 1 && new Set(used.map((n) => n.d.id)).size > 1 ? 0.42 : 0.68);
      pos.y -= 1.6;
      const mesh = new THREE.Mesh(projGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, roughness: 0.4, metalness: 0.1, transparent: true }));
      mesh.position.copy(pos); root.add(mesh);
      const lbl = label(`<b>${esc(p.name)}</b>`, () => pos, 's-pin sk-plabel');
      lbl.visible = false;
      return { ...p, pos, mesh, used, lbl, em: 0.3 };
    });
    const projByIdMap = Object.fromEntries(projects.map((p) => [p.id, p]));

    // Threads: one line per skill-project link, so each can fade on its own.
    const links = [];
    nodes.forEach((n) => n.s.projects.forEach((pid) => {
      const p = projByIdMap[pid];
      const mid = n.pos.clone().lerp(p.pos, 0.5).add(V(0, 0.6, 0));
      const curve = new THREE.QuadraticBezierCurve3(n.pos, mid, p.pos);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(lowPower ? 8 : 16)), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.06, depthWrite: false }));
      root.add(line);
      const l = { n, p, line, o: 0.06 };
      links.push(l); n.lines.push(l);
    }));

    // Centre: a quiet wireframe core with spokes to each domain.
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.5 }));
    root.add(core);
    const spokes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(domains.flatMap((d) => [V(), d.center])), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.08, depthWrite: false }));
    root.add(spokes);

    // ---------- Theme ----------
    const COL = {
      dark: { learnt: [1.0, 0.32, 0.3], learning: [1.0, 0.7, 0.3], next: [0.55, 0.53, 0.62], face: 0.8, line: 0xe8b0a8, core: 0xd24a4a, proj: 0xf2ece4, projE: 0x6a1a1a },
      light: { learnt: [0.64, 0.14, 0.14], learning: [0.8, 0.46, 0.0], next: [0.42, 0.4, 0.46], face: 1.0, line: 0x8b1a1a, core: 0xa32424, proj: 0xb04a3c, projE: 0x000000 },
    };
    let pal = COL.dark, night = true;
    function onTheme(p) {
      night = p.night; pal = night ? COL.dark : COL.light;
      nodes.forEach((n) => {
        n.halo.material.color.setRGB(...pal[n.s.state]);
        n.glow.material.color.setRGB(...pal[n.s.state]).multiplyScalar(night ? 0.22 : 0);
        n.halo.material.blending = night ? THREE.AdditiveBlending : THREE.NormalBlending;
        n.face.material.color.setScalar(pal.face);
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
    let hoverNode = null, rowNode = null, filter = 'all', pinned = false;
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const faces = nodes.map((n) => n.face);
    const canvas = renderer.domElement;
    const pick = (x, y) => {
      pointer.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(faces).find((h) => nodes[h.object.userData.node].show > 0.5 && passes(nodes[h.object.userData.node]));
      return hit ? nodes[hit.object.userData.node] : null;
    };
    const passes = (n) => filter === 'all' || n.s.state === filter;
    function showTip(n, x, y) {
      if (!n) { tip.hidden = true; return; }
      const s = n.s;
      tip.innerHTML = `<div class="sk-tip-head"><span class="sk-logo" aria-hidden="true">${mark(s)}</span><div><b>${esc(s.name)}</b>${badge(s.state)}</div></div>
        <p>${esc(s.evidence)}</p><span class="sk-used">${esc(n.d.name)} · ${s.projects.map((p) => esc(projById[p].name)).join(', ')}</span>`;
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
      // Bring the matching card row into view and flash it.
      const stepIdx = data.domains.findIndex((d) => d.id === n.d.id) + 1;
      if (Math.round(progress) !== stepIdx) goTo(stepIdx);
      const r = document.querySelector(`#step-${stepIdx} [data-skill="${n.s.id}"]`);
      if (r) { r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); }
    });
    // Card rows light up their star.
    main.addEventListener('pointerover', (e) => { const r = e.target.closest('.sk-row'); rowNode = r ? nodeById[r.dataset.skill] : null; });
    main.addEventListener('pointerleave', () => { rowNode = null; });
    main.addEventListener('focusin', (e) => { const r = e.target.closest('.sk-row'); rowNode = r ? nodeById[r.dataset.skill] : null; });
    main.addEventListener('focusout', () => { rowNode = null; });

    // State filter.
    main.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.filter;
      main.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      document.documentElement.dataset.skFilter = filter;
      if (hoverNode && !passes(hoverNode)) { hoverNode = null; showTip(null); }
    }));

    // ---------- Scroll steps (own measure: the column scrolls the window on desktop, itself on phones) ----------
    const steps = [...main.querySelectorAll('.sk-step')];
    const narrow = () => innerWidth <= 860;
    const scroller = () => (narrow() ? main : window);
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
      else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
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

    // Camera frames: an overview, one per domain (from outside the ring), and a high view for "in progress".
    const frames = [
      { pos: V(0, 25, 40), look: V(0, -1.5, 0), sh: 1 },
      ...domains.map((d) => ({ pos: d.center.clone().addScaledVector(d.out, 19.5).addScaledVector(d.side, -0.6).addScaledVector(d.up, 1.2), look: d.center.clone().addScaledVector(d.up, -0.3), sh: 0 })),
      { pos: V(-7, 24, 25), look: V(0, -2, 0), sh: 1 },
    ];
    const smooth = (x) => x * x * (3 - 2 * x);
    const camPos = frames[0].pos.clone(), camLook = frames[0].look.clone(), wantPos = V(), wantLook = V();
    let wasNarrow = null, currentStep = -1, introT = 0;

    return {
      keyframes: [{ pos: [0, 11, 30], look: [0, 0, 0] }],
      onTheme,
      update(t, _p, dt) {
        const time = reduceMotion ? 0 : t;
        const nar = narrow();
        // Phones: the cards fill the lower part of the screen, so the scene is framed in the band above.
        if (nar !== wasNarrow) { wasNarrow = nar; camera.fov = nar ? 48 : 35; }
        if (nar) camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * 0.25, innerWidth, innerHeight);
        else camera.updateProjectionMatrix();

        progress += (target - progress) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2));
        const i = Math.min(frames.length - 2, Math.max(0, Math.floor(progress)));
        const f = smooth(Math.max(0, Math.min(1, progress - i)));
        wantPos.lerpVectors(frames[i].pos, frames[i + 1].pos, f);
        wantLook.lerpVectors(frames[i].look, frames[i + 1].look, f);
        // Overviews sit right of the text column on desktop; phones frame them centred and farther back.
        const sh = frames[i].sh + (frames[i + 1].sh - frames[i].sh) * f;
        if (nar) wantPos.sub(wantLook).multiplyScalar(sh ? 1.3 : 1.45).add(wantLook);
        else { wantPos.x -= 1.5 * sh; wantLook.x -= 1.5 * sh; }
        camPos.copy(wantPos); camLook.copy(wantLook);
        if (!reduceMotion) camPos.x += Math.sin(t * 0.21) * 0.35, camPos.y += Math.sin(t * 0.29) * 0.2;
        camera.position.copy(camPos); camera.lookAt(camLook);
        camera.updateMatrixWorld(); // the engine projects the 3D labels right after this; keep them in sync

        const step = Math.round(progress);
        if (step !== currentStep) {
          currentStep = step;
          steps.forEach((s, k) => s.classList.toggle('on', k === step));
          [...dots.children].forEach((d, k) => d.classList.toggle('on', k === step));
        }
        const stepDef = STEPS[Math.max(0, Math.min(STEPS.length - 1, step))];
        const activeDom = stepDef.domain, growing = stepDef.focus === 'growing';
        const focus = hoverNode || rowNode;

        // Emphasis per star: filter > hover > step.
        introT = reduceMotion ? 10 : t; // wall-clock, so slow frames do not stall the reveal
        const k = 1 - Math.exp(-dt * 7);
        nodes.forEach((n, idx) => {
          let em = 1;
          if (activeDom && n.d.id !== activeDom) em = 0.07;
          if (growing && n.s.state === 'learnt') em = 0.2;
          if (focus) em = n === focus ? 1.25 : Math.min(em, 0.35);
          if (!passes(n)) em = 0.05;
          n.em += (em - n.em) * k;
          n.show = reduceMotion ? 1 : smooth(Math.max(0, Math.min(1, (introT - 0.25 - idx * 0.028) / 0.7)));
          const pulse = n.s.state === 'learning' && !reduceMotion ? 1 + Math.sin(time * 2.4 + n.seed) * 0.07 : 1;
          const sz = n.size * n.show * (n === focus ? 1.18 : 1) * (growing && n.s.state !== 'learnt' ? 1.4 : 1);
          const bob = reduceMotion ? 0 : Math.sin(time * 0.8 + n.seed) * 0.06;
          [n.face, n.halo, n.glow].forEach((m) => { m.position.set(n.pos.x, n.pos.y + bob, n.pos.z); });
          n.face.scale.setScalar(sz);
          n.halo.scale.setScalar(sz * 1.45 * pulse);
          n.glow.scale.setScalar(sz * (n.s.state === 'learnt' ? 3.0 : n.s.state === 'learning' ? 2.6 * pulse : 1.6));
          if (n.s.state === 'learning' && !reduceMotion) n.halo.material.rotation = -time * 1.1 - n.seed;
          const a = Math.min(1, n.em);
          n.face.material.opacity = a * (n.s.state === 'next' ? 0.72 : 1);
          n.halo.material.opacity = a * (n.s.state === 'next' ? 0.7 : 1);
          n.name.visible = n.show > 0.9 && passes(n) && !focus && (activeDom === n.d.id || (growing && n.s.state !== 'learnt'));
          n.glow.material.opacity = a * (n.s.state === 'learning' ? 0.75 + 0.25 * Math.sin(time * 2.4 + n.seed) : 0.8);
        });

        // Threads and projects follow their stars.
        const lit = new Set();
        links.forEach((l) => {
          let o = lowPower ? 0.05 : 0.07;
          if (activeDom && l.n.d.id === activeDom && passes(l.n)) o = 0.3;
          if (growing && l.n.s.state !== 'learnt' && passes(l.n)) o = 0.3;
          if (!passes(l.n) || (activeDom && l.n.d.id !== activeDom)) o = 0.025;
          if (focus) o = l.n === focus ? 0.9 : 0.02;
          if (o >= 0.3) lit.add(l.p.id);
          l.o += (o - l.o) * k;
          l.line.material.opacity = l.o * (night ? 1 : 0.9) * Math.min(1, l.n.show * 1.5);
        });
        projects.forEach((p) => {
          const on = lit.has(p.id);
          p.em += ((on ? 1 : focus ? 0.15 : 0.45) - p.em) * k;
          p.mesh.material.opacity = p.em;
          p.mesh.rotation.y = time * 0.6; p.mesh.rotation.x = 0.4;
          p.mesh.scale.setScalar((0.8 + p.em * 0.6) * Math.min(1, introT / 1.4));
          p.lbl.visible = on && !!focus; // only for the star being looked at, to keep the scene quiet
        });
        domains.forEach((d) => {
          d.lbl.visible = !focus && !activeDom && !nar; // in a domain step the card names it
          d.orbit.material.opacity = (activeDom === d.id ? 0.32 : 0.12) * (night ? 1 : 0.8);
        });
        core.rotation.y = time * 0.15; core.rotation.x = time * 0.07;
        core.material.opacity = activeDom ? 0.15 : 0.45;
        spokes.material.opacity = activeDom ? 0.03 : 0.08;
      },
    };
  },
});

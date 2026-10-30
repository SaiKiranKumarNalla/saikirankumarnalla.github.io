// Projects & Repos: a 3D wall of project tiles. Choosing one brings up its own 3D explainer and
// swaps the side card for its details. No long scroll; each project has a #id deep link.
import repos from '../../content/repos.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const chips = (a) => (a?.length ? `<div class="s-chips">${a.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : '');
const paras = (t) => String(t).split(/\n\s*\n/).map((x) => `<p>${esc(x.trim())}</p>`).join('');
const fig = (f) => `<figure class="s-fig"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"><figcaption>${esc(f.caption)}</figcaption></figure>`;

const intro = () => `<p class="s-kicker">Projects &amp; repos</p><h1>Things I've built</h1>
  <p class="s-lede">Simulators, benches and models, from undergrad CFD to PET simulation. Pick a tile, or a name below.</p>
  <div class="s-pick">${repos.map((r) => `<button data-id="${r.id}"><b>${esc(r.name)}</b><span>${esc(r.kind)} · ${esc(r.years)}</span></button>`).join('')}</div>
  <p class="s-meta">AI agent systems live on the <a href="/sections/builder.html">Agentic AI</a> page.</p>`;

function detail(r) {
  const links = (r.links || []).map((l) => (l.href
    ? `<a class="s-link" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`
    : `<span class="s-link soon">${esc(l.label)} · coming soon</span>`)).join('');
  const m = r.more;
  return `<button class="s-back" data-back>← All projects</button>
    <p class="s-kicker">${esc(r.kind)} · ${esc(r.years)} · ${esc(r.context)}</p>
    <h2>${esc(r.name)}</h2>
    <p class="s-lede">${esc(r.eli5)}</p><p>${esc(r.summary)}</p>
    ${links ? `<div class="s-links">${links}</div>` : ''}
    ${r.figures?.[0] ? fig(r.figures[0]) : ''}
    ${m ? `<details class="s-know"><summary>Know more <span class="s-meta">problem, approach, outcome</span></summary>
      <h3>The problem</h3><p>${esc(m.problem)}</p><h3>How</h3>${list(m.approach)}<h3>Outcome</h3>${list(m.outcome)}
      ${(r.figures || []).slice(1).map(fig).join('')}
    </details>` : ''}
    ${r.abstract ? `<details class="s-know"><summary>Abstract</summary>${paras(r.abstract)}</details>` : ''}
    ${r.stack ? `<h3>Built with</h3>${chips(r.stack)}` : ''}`;
}

document.documentElement.classList.add('s-gallery');
document.getElementById('main').innerHTML = `<section class="s-step s-hero" data-title="Projects"><div class="s-card" id="card">${intro()}</div></section>`;
const card = document.getElementById('card');

let select = () => {};
card.addEventListener('click', (e) => {
  const pick = e.target.closest('[data-id]');
  if (pick) select(pick.dataset.id);
  if (e.target.closest('[data-back]')) select(null);
});

runPage({
  active: 'projects',
  build({ THREE, scene, camera, reduceMotion }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o });
    const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, transparent: true, ...o });

    // ── The wall of tiles.
    function tileTexture(r) {
      const c = document.createElement('canvas');
      c.width = 640; c.height = 400;
      const g = c.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 640, 400);
      grd.addColorStop(0, '#26161c'); grd.addColorStop(1, '#0e0a0e');
      g.fillStyle = grd; g.fillRect(0, 0, 640, 400);
      g.strokeStyle = 'rgba(210,74,74,0.75)'; g.lineWidth = 4; g.strokeRect(8, 8, 624, 384);
      g.fillStyle = '#d24a4a'; g.font = '600 24px "DM Sans", sans-serif'; g.fillText(r.kind.toUpperCase(), 40, 70);
      g.fillStyle = '#f2ece4'; g.font = '46px "Zen Antique", serif';
      let line = '', y = 140;
      for (const w of r.name.split(' ')) { if (g.measureText(line + w).width > 560) { g.fillText(line, 40, y); line = ''; y += 54; } line += w + ' '; }
      g.fillText(line, 40, y);
      g.fillStyle = 'rgba(242,236,228,0.6)'; g.font = '24px "DM Sans", sans-serif';
      g.fillText(`${r.years} · ${r.context}`.slice(0, 46), 40, 350);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return t;
    }
    const wall = new THREE.Group();
    scene.add(wall);
    // Three columns; the last row is centred.
    const COLS = 3, rows = Math.ceil(repos.length / COLS);
    const tiles = repos.map((r, i) => {
      const row = Math.floor(i / COLS), col = i % COLS, n = Math.min(COLS, repos.length - row * COLS);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.625), new THREE.MeshBasicMaterial({ map: tileTexture(r), transparent: true }));
      const x = (col - (n - 1) / 2) * 2.85 + 1.1;
      m.userData = { id: r.id, home: V(x, ((rows - 1) / 2 - row) * 1.85, -Math.abs(x - 1.1) * 0.15) };
      m.position.copy(m.userData.home);
      m.rotation.y = -(x - 1.1) * 0.05;
      wall.add(m);
      return m;
    });
    document.fonts?.ready.then(() => tiles.forEach((m, i) => { m.material.map = tileTexture(repos[i]); }));

    // ── One explainer per project; only the selected one is shown.
    const explainers = {};
    // Explainers share one stage to the right of the card.
    const stage = new THREE.Group();
    stage.position.set(1.4, 0, 0);
    stage.scale.setScalar(0.72);
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

    // ── Selection, hover and deep links.
    let current = null, hover = null;
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const canvas = document.getElementById('stage');
    const pickTile = (e) => { pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(tiles)[0]?.object || null; };
    canvas.addEventListener('pointermove', (e) => { if (current) return; hover = pickTile(e); canvas.style.cursor = hover ? 'pointer' : 'default'; });
    canvas.addEventListener('click', (e) => { if (current) return; const tl = pickTile(e); if (tl) select(tl.userData.id); });
    select = (id) => {
      current = id && explainers[id] ? id : null;
      hover = null;
      const r = repos.find((x) => x.id === current);
      card.innerHTML = r ? detail(r) : intro();
      card.scrollTop = 0;
      document.title = `${r ? r.name : 'Projects'} | Sai Kiran Kumar Nalla, PhD`;
      if ((location.hash.slice(1) || null) !== current) history.pushState(null, '', current ? `#${current}` : location.pathname);
    };
    addEventListener('popstate', () => select(location.hash.slice(1) || null));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) select(null); });
    if (location.hash.length > 1) select(location.hash.slice(1));

    const camPos = V(0, 0.4, 17), want = V();
    return {
      keyframes: [{ pos: [0, 0.4, 17], look: [0, 0, 0] }],
      update(t, p, dt) {
        const time = reduceMotion ? 0 : t, k = Math.min(1, dt * 3);
        tiles.forEach((m) => {
          const tgt = current ? m.userData.home.clone().multiplyScalar(1.1).add(V(0, 0, -7)) : m.userData.home.clone().add(V(0, 0, m === hover ? 0.4 : 0));
          m.position.lerp(tgt, k);
          m.material.opacity += ((current ? 0.04 : m === hover ? 1 : 0.9) - m.material.opacity) * k;
        });
        for (const [id, ex] of Object.entries(explainers)) {
          ex.s += ((id === current ? 1 : 0) - ex.s) * k;
          ex.g.visible = ex.s > 0.01;
          if (ex.g.visible) { ex.g.scale.setScalar(ex.s * ex.base); ex.tick(time, dt); }
        }
        // The page drives its own camera: a gentle drift, a little closer in the detail view.
        want.set(Math.sin(time * 0.1) * 0.6, 0.4 + Math.sin(time * 0.13) * 0.2, current ? 13 : 17);
        camPos.lerp(want, k);
        camera.position.copy(camPos);
        camera.lookAt(0, 0, 0);
      },
    };
  },
});

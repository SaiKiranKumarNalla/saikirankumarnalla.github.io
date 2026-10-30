// Projects: one step per project, each with its own small 3D explainer and a "Know more" dropdown.
// Thesis studies live on the PhD page; this page is about the tools and systems built around them.
import projects from '../../content/projects.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const chips = (a) => (a?.length ? `<div class="s-chips">${a.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : '');
const STATUS = { active: 'Active', concept: 'Concept', 'coming-soon': 'Public soon', done: 'Completed', 'published-preprint': 'Preprint' };
const FEATURED = ['virtualpet', 'cassoulet', 'veritomix-office', 'animus', 'veritomix', 'flowlab', 'digitaltwin'];
const featured = FEATURED.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const earlier = projects.filter((p) => !FEATURED.includes(p.id));

const step = (p) => `<p class="s-kicker">${esc(p.kind)} · ${p.year} · ${STATUS[p.status] || ''}</p>
  <h2>${esc(p.name)}</h2><p class="s-lede">${esc(p.eli5 || '')}</p><p>${esc(p.summary)}</p>
  ${chips(p.facts)}
  ${p.more ? `<details class="s-know"><summary>Know more <span class="s-meta">problem, approach, status</span></summary>
    <h3>The problem</h3><p>${esc(p.more.problem)}</p>
    <h3>How it works</h3>${list(p.more.approach)}
    <h3>Status</h3>${list(p.more.status)}
    ${p.stack ? `<h3>Built with</h3>${chips(p.stack)}` : ''}
    ${p.note ? `<p class="s-meta">${esc(p.note)}</p>` : ''}
  </details>` : ''}`;

const STEPS = [
  { title: 'Projects', html: `<p class="s-kicker">Projects</p><h1>Things I've built</h1>
      <p class="s-lede">Simulators, agent systems and ventures: the tools that grew around the PhD.</p>
      <p>Each project has a short explainer; open <b>Know more</b> for the problem, the approach and where it stands.</p>
      <p class="s-scroll">Scroll through ${featured.length} projects</p>` },
  ...featured.map((p) => ({ title: p.name, html: step(p) })),
  { title: 'Earlier', html: `<p class="s-kicker">Earlier work</p><h2>Before and alongside</h2>
      ${earlier.map((p) => `<div class="s-role"><b>${esc(p.name)}</b> <span class="s-meta">${esc(p.kind)} · ${p.year}</span><p>${esc(p.summary)}</p></div>`).join('')}
      <a class="s-more" href="/sections/research.html">The PhD thesis, in a nutshell →</a>` },
];
document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: 'projects',
  build({ THREE, scene, reduceMotion }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...o });
    const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, transparent: true, ...o });
    const root = new THREE.Group();
    root.position.set(2.8, 0, 0);
    scene.add(root);
    const scenes = [];
    const add = (g, update) => { g.visible = false; root.add(g); scenes.push({ g, update, base: g.scale.x }); };

    // 1. Virtual PET patients: CT slices stack into a body, organs appear, a review ring checks the result.
    {
      const g = new THREE.Group();
      const slices = [...Array(14)].map((_, i) => {
        const w = 1.2 + Math.sin((i / 13) * Math.PI) * 0.9;
        const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), glow(0xd9cfbf, { opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
        m.scale.set(w, w * 0.62, 1); m.rotation.x = -Math.PI / 2;
        m.userData.y = -2.6 + i * 0.4;
        g.add(m);
        return m;
      });
      const organs = [[0x9a4a3a, [-0.35, 0.1, 0], [0.7, 0.35, 0.45]], [0xd27a7a, [0.45, 1.2, 0], [0.4, 0.6, 0.35]], [0xd27a7a, [-0.45, 1.2, 0], [0.4, 0.6, 0.35]],
        [0xc23b3b, [0.05, 1.0, 0.1], [0.3, 0.3, 0.3]], [0x8b1a1a, [0.5, -0.4, -0.1], [0.2, 0.3, 0.2]], [0x8b1a1a, [-0.5, -0.4, -0.1], [0.2, 0.3, 0.2]], [0xffc46b, [0, -1.9, 0.2], [0.35, 0.25, 0.3]]]
        .map(([c, p, s]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), std(c, { emissive: c, emissiveIntensity: 0.35, transparent: true })); m.position.set(...p); m.scale.set(...s); g.add(m); return m; });
      const gate = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.03, 8, 96), glow(0xff6a4a, { opacity: 0.8 }));
      gate.rotation.x = Math.PI / 2;
      g.add(gate);
      add(g, (t) => {
        const c = (t * 0.25) % 1;
        slices.forEach((m, i) => { m.position.y = m.userData.y * Math.min(1, c * 3 + 0.2); });
        organs.forEach((m, i) => { const v = Math.max(0, Math.min(1, (c - 0.3 - i * 0.05) * 6)); m.material.opacity = v; m.visible = v > 0.01; });
        gate.position.y = -2.6 + Math.max(0, c - 0.65) * 15;
        gate.material.opacity = c > 0.65 ? 0.8 : 0;
        g.rotation.y = t * 0.2;
      });
    }

    // 2. CASSOULET: three scanner models of different axial length, with lines of response firing.
    {
      const g = new THREE.Group();
      const specs = [['GE DMI 5R', 1.0, -3], ['GE OMNI', 1.6, 0], ['Siemens Quadra', 3.2, 3.4]];
      const lines = [];
      specs.forEach(([, len, x]) => {
        const s = new THREE.Group();
        s.position.x = x;
        const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, len, 48, 1, true), std(0xe4ded6, { side: THREE.DoubleSide }));
        shell.rotation.z = Math.PI / 2;
        s.add(shell);
        [-1, 1].forEach((sd) => { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 8, 64), glow(0xff6a4a, { opacity: 0.6 })); r.rotation.y = Math.PI / 2; r.position.x = (sd * len) / 2; s.add(r); });
        for (let i = 0; i < 10; i++) {
          const geo = new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0)]);
          const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffb36b, transparent: true, opacity: 0 }));
          s.add(l);
          lines.push({ l, len, phase: Math.random() * 10 });
        }
        g.add(s);
      });
      g.rotation.y = 0.55;
      g.scale.setScalar(0.72);
      g.position.x = -0.6;
      add(g, (t) => {
        lines.forEach((L) => {
          const k = (t * 2 + L.phase) % 1;
          if (k < 0.05) {
            const a = Math.random() * Math.PI * 2, b = a + Math.PI + (Math.random() - 0.5) * 0.8, x = (Math.random() - 0.5) * L.len * 0.9;
            L.l.geometry.setFromPoints([V(x, Math.cos(a), Math.sin(a)), V(x + (Math.random() - 0.5) * 0.3, Math.cos(b), Math.sin(b))]);
          }
          L.l.material.opacity = 1 - k;
        });
      });
    }

    // 3. VeriTomiX Office: eight AI department heads around a table, the founder at the head.
    {
      const g = new THREE.Group();
      const table = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.15, 48), std(0x3a2620));
      table.position.y = -0.6;
      g.add(table);
      const colors = [0xff6a4a, 0xffc46b, 0x7ccf98, 0xa9a9e8, 0xd9b46a, 0xe06060, 0x9fd0ff, 0xd9cfbf];
      const seats = colors.map((c, i) => {
        const a = (i / 8) * Math.PI * 2;
        const a1 = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 6, 12), std(0x2b2d3f));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), std(c, { emissive: c, emissiveIntensity: 0.4 }));
        head.position.y = 0.55;
        a1.add(body, head);
        a1.position.set(Math.cos(a) * 2.6, -0.3, Math.sin(a) * 2.6);
        g.add(a1);
        return a1.position.clone().setY(0.3);
      });
      const founder = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), std(0x8b1a1a, { emissive: 0xd24a4a, emissiveIntensity: 0.6 }));
      founder.position.y = 0.6;
      g.add(founder);
      const pulses = seats.map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glow(0xffb36b)); g.add(m); return m; });
      add(g, (t) => {
        founder.rotation.y = t;
        pulses.forEach((m, i) => { const k = (t * 0.4 + i / 8) % 1; const back = k > 0.5; m.position.lerpVectors(seats[i], V(0, 0.6, 0), back ? 2 - k * 2 : k * 2); m.material.color.set(back ? 0xf2ece4 : 0xffb36b); });
        g.rotation.set(0.45, t * 0.1, 0);
      });
    }

    // 4. ANIMUS Jobs: a deck of opportunity cards swiping left, right and up over a radar sweep.
    {
      const g = new THREE.Group();
      const radar = new THREE.Mesh(new THREE.RingGeometry(0.2, 3, 64, 1, 0, 0.6), glow(0xff6a4a, { opacity: 0.25, side: THREE.DoubleSide }));
      radar.rotation.x = -Math.PI / 2; radar.position.y = -1.6;
      [1, 2, 3].forEach((r) => { const c = new THREE.Mesh(new THREE.RingGeometry(r - 0.01, r + 0.01, 64), glow(0xf2ece4, { opacity: 0.15, side: THREE.DoubleSide })); c.rotation.x = -Math.PI / 2; c.position.y = -1.6; g.add(c); });
      g.add(radar);
      const tiers = [0xd9cfbf, 0x7ccf98, 0xa9a9e8, 0xffc46b, 0xd9cfbf];
      const cards = tiers.map((c, i) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.05), std(0x1d1b24));
        const band = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.35), glow(c, { opacity: 0.9 }));
        band.position.set(0, 1.02, 0.03);
        m.add(band);
        for (let l = 0; l < 4; l++) { const line = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.06), glow(0x6a6068)); line.position.set(0, 0.4 - l * 0.3, 0.03); m.add(line); }
        g.add(m);
        return m;
      });
      const DIRS = [V(-4, 0.5, 0), V(4, 0.5, 0), V(0, 4, 0)];
      add(g, (t) => {
        radar.rotation.z = -t * 1.5;
        const cycle = t * 0.5, top = Math.floor(cycle) % cards.length, f = cycle % 1;
        cards.forEach((m, i) => {
          const order = (i - top + cards.length) % cards.length;
          const base = V(0, -order * 0.05, -order * 0.25);
          if (order === 0 && f > 0.6) {
            const d = DIRS[Math.floor(cycle) % 3], k = (f - 0.6) / 0.4;
            m.position.copy(base).addScaledVector(d, k * k);
            m.rotation.z = -d.x * 0.08 * k;
          } else { m.position.copy(base); m.rotation.z = 0; }
        });
      });
    }

    // 5. VeriTomiX: a reference phantom in the middle; AI models are scored against it.
    {
      const g = new THREE.Group();
      const ref = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), std(0xd9cfbf, { transparent: true, opacity: 0.35 }));
      ref.add(new THREE.LineSegments(new THREE.EdgesGeometry(ref.geometry), new THREE.LineBasicMaterial({ color: 0xff6a4a })));
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 14), glow(0xff5a3c));
      ref.add(core);
      g.add(ref);
      const bars = [0.92, 0.71, 0.84, 0.58, 0.95].map((score, i) => {
        const a = (i / 5) * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1, 0.35), std(score > 0.9 ? 0x7ccf98 : 0x8b1a1a, { emissive: score > 0.9 ? 0x2e7a49 : 0x3a0808, emissiveIntensity: 0.5 }));
        b.position.set(Math.cos(a) * 2.8, -1.4, Math.sin(a) * 2.8);
        b.userData.score = score;
        g.add(b);
        const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(Math.cos(a) * 2.8, -0.6, Math.sin(a) * 2.8)]), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.2 }));
        g.add(ray);
        return b;
      });
      add(g, (t) => {
        const k = (t * 0.3) % 1;
        bars.forEach((b) => { const h = Math.max(0.05, Math.min(1, k * 1.6) * b.userData.score * 2.6); b.scale.y = h; b.position.y = -1.6 + h / 2; });
        ref.rotation.y = t * 0.3; ref.rotation.x = 0.3;
        g.rotation.y = t * 0.08;
      });
    }

    // 6. Flow Lab: pulsatile tracer flowing round a loop and filling an exchanging sphere.
    {
      const g = new THREE.Group();
      const curve = new THREE.CatmullRomCurve3([V(-2.5, 0, 0), V(-1.5, 1.6, 0.5), V(1.5, 1.6, -0.5), V(2.5, 0, 0), V(1.5, -1.6, 0.5), V(-1.5, -1.6, -0.5)], true);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.22, 16, true), new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.12, depthWrite: false })));
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 24), new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.15, depthWrite: false }));
      sphere.position.set(2.5, 0, 0);
      const fill = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 24), glow(0xff6a4a, { opacity: 0.7 }));
      sphere.add(fill);
      g.add(sphere);
      const N = 90;
      const dots = [...Array(N)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glow(0xff8a5a)); m.userData.u = i / N; g.add(m); return m; });
      let u = 0;
      add(g, (t, dt) => {
        const pulse = 1 + 0.9 * Math.sin(t * 4); // pulsatile flow
        u = (u + dt * 0.06 * pulse) % 1;
        dots.forEach((m) => m.position.copy(curve.getPointAt((m.userData.u + u) % 1)));
        const f = (Math.sin(t * 0.5) + 1) / 2;
        fill.scale.setScalar(Math.max(0.05, f));
      });
    }

    // 7. Human digital twin: a body outline with an arterial tree; tracer flows down and collects in the kidneys.
    {
      const g = new THREE.Group();
      const profile = [[0, -3], [1, -3], [1.25, -2.2], [1.15, -1], [1.05, 0], [1.2, 1], [1.45, 1.7], [1.25, 2.2], [0.45, 2.55], [0.4, 2.9], [0, 2.95]].map(([r, y]) => new THREE.Vector2(r, y));
      const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
      body.scale.z = 0.6;
      g.add(body);
      const vessels = [
        [V(0, 1.6, 0), V(0, 0.5, -0.1), V(0, -1.2, -0.1), V(0, -2.2, 0)],
        [V(0, -1.6, -0.1), V(-0.45, -2.3, 0), V(-0.55, -3, 0)],
        [V(0, -1.6, -0.1), V(0.45, -2.3, 0), V(0.55, -3, 0)],
        [V(0, -0.4, -0.1), V(-0.35, -0.45, 0), V(-0.55, -0.5, 0)],
        [V(0, -0.4, -0.1), V(0.35, -0.45, 0), V(0.55, -0.5, 0)],
        [V(0, 1.6, 0), V(-0.5, 2, 0), V(-1.2, 1.7, 0)],
        [V(0, 1.6, 0), V(0.5, 2, 0), V(1.2, 1.7, 0)],
      ].map((pts) => new THREE.CatmullRomCurve3(pts));
      vessels.forEach((c, i) => g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, i ? 0.05 : 0.09, 8), std(0xc23b3b, { emissive: 0x8b1a1a, emissiveIntensity: 0.5 }))));
      const kidneys = [-0.7, 0.7].map((x) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), std(0x8b1a1a, { emissive: 0xff5a3c, emissiveIntensity: 0.2 })); k.scale.set(0.7, 1, 0.6); k.position.set(x, -0.5, 0); g.add(k); return k; });
      const heart = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), std(0xc23b3b, { emissive: 0xff5a3c, emissiveIntensity: 0.5 }));
      heart.position.set(0.1, 1.6, 0.1);
      g.add(heart);
      const tracer = [...Array(40)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), glow(0xffc46b)); m.userData = { c: vessels[i % vessels.length], u: i / 40 }; g.add(m); return m; });
      add(g, (t) => {
        tracer.forEach((m) => m.position.copy(m.userData.c.getPointAt((m.userData.u + t * 0.15) % 1)));
        heart.scale.setScalar(1 + Math.max(0, Math.sin(t * 6)) * 0.15);
        const f = (Math.sin(t * 0.4) + 1) / 2;
        kidneys.forEach((k) => (k.material.emissiveIntensity = 0.2 + f * 0.9));
        g.rotation.y = Math.sin(t * 0.3) * 0.5;
      });
    }

    const vis = (p, a, w) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / w));
    return {
      keyframes: STEPS.map(() => ({ pos: [1.2, 1.2, 15], look: [1.6, 0, 0] })),
      update(t, p, dt) {
        scenes.forEach((s, i) => {
          // The intro previews the first project; the closing step shows the twin again.
          const v = Math.max(vis(p, i + 1, 0.6), i === 0 ? vis(p, 0, 1) * 0.8 : 0, i === scenes.length - 1 ? vis(p, scenes.length + 1, 1) * 0.7 : 0);
          s.g.visible = v > 0.01;
          s.g.scale.setScalar(Math.max(0.001, v) * s.base);
          if (s.g.visible) s.update(reduceMotion ? 0 : t, dt);
        });
      },
    };
  },
});

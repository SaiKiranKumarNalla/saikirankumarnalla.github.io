// The skill network, as layout-kit stages (layout.js stage builders). Six domains sit on a ring. Tools are
// logo discs, competencies are cut gems tinted by domain. A ring around each shows its state: solid = learnt,
// turning arc = learning, dashed = next. Threads tie skills to the projects that used them.
//   networkStage('hero')     the whole ring, a slow sway, domain names pinned.
//   networkStage('domains')  the camera flies to the domain picked in the tabs ('dom'); the others fade back.
//   networkStage('growing')  the whole ring with what is being learnt and what comes next brought forward.
// The canvas ignores the pointer, so the hover lives in the HTML: a row or card calls net.hover(id) and the
// matching node lights up with its name pinned.
import data from '../../content/skills.json';
import { iconUrl, DOMAIN_HUE } from './skills-emblems.js';
import { onTab } from './layout.js';

const ORDER = { learnt: 0, learning: 1, next: 2 };
export const sortSk = (a, b) => ORDER[a.state] - ORDER[b.state] || b.uses.length - a.uses.length;
export const skillsOf = (d) => data.skills.filter((s) => s.domain === d).sort(sortSk);
const SHORT = { imaging: 'Imaging', sim: 'Simulation', code: 'Code & ML', agents: 'Agentic AI', creative: '3D & creative', lab: 'Lab' };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => x * x * (3 - 2 * x);
const tiny = (v) => Math.max(0.0001, v);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// State shared by every network stage on the page; each stage registers a redraw.
const state = { kind: 'all', hl: null, dom: 0 };
const live = new Set();
const poke = () => live.forEach((f) => f());
export const net = {
  kind(k) { state.kind = k; poke(); },
  hover(id) { if (state.hl !== id) { state.hl = id; poke(); } },
  domain(i) { state.dom = i; poke(); },
};
onTab('dom', (i) => net.domain(i));

// Textures drawn once and shared by every stage (one WebGL context).
let shared = null;
function textures(THREE) {
  if (shared) return shared;
  const tex = (draw, size = 128) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); draw(g, size);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return { t, g };
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
  }).t;
  const glow = tex((g, n) => {
    const r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(0.45, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, n, n);
  }).t;
  const discs = {};
  // A tool's face: white disc, thin rim, its logo or emblem (aspect kept, so wide logos fit).
  const disc = (s) => discs[s.id] || (discs[s.id] = (() => {
    const { t, g } = tex((g2, n) => {
      g2.fillStyle = '#fff'; g2.beginPath(); g2.arc(n / 2, n / 2, n * 0.34, 0, Math.PI * 2); g2.fill();
      g2.strokeStyle = 'rgba(0,0,0,.12)'; g2.lineWidth = 2; g2.stroke();
    });
    const img = new Image();
    img.onload = () => {
      const n = 128, w = 46, iw = img.naturalWidth || w, ih = img.naturalHeight || w, k = Math.min(w / iw, w / ih);
      g.drawImage(img, n / 2 - (iw * k) / 2, n / 2 - (ih * k) / 2, iw * k, ih * k); t.needsUpdate = true;
      live.forEach((f) => f());
    };
    img.src = iconUrl(s);
    return t;
  })());
  // A competency: a cut gem (pavilion, girdle, crown, table) with flat facets, tinted by its domain.
  const gem = new THREE.LatheGeometry([[0, -0.52], [0.44, 0.06], [0.46, 0.12], [0.3, 0.3], [0, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)), 8);
  shared = { RING: { learnt: ring(false, false), learning: ring(false, true), next: ring(true, false) }, glow, disc, gem };
  return shared;
}

export const networkStage = (mode) => (ctx) => {
  const { THREE, scene, reduceMotion, lowPower, tag } = ctx;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const tx = textures(THREE);
  const root = new THREE.Group();
  scene.add(root);
  const world = V();
  const at = (local) => () => root.localToWorld(world.copy(local()));

  // ── Layout: six domains on a ring, skills on a golden-angle disc facing out and up.
  const R = 9.5;
  const domains = data.domains.map((d, i) => {
    const a = (i / data.domains.length) * Math.PI * 2 - Math.PI / 2 - Math.PI / 6;
    const center = V(Math.cos(a) * R, i % 2 ? 0.9 : -0.9, Math.sin(a) * R);
    const out = V(Math.cos(a), 0, Math.sin(a)).add(V(0, 22, 36).sub(center).normalize()).normalize();
    const side = V(0, 1, 0).cross(out).normalize();
    const up = out.clone().cross(side).normalize();
    const pts = [];
    for (let k = 0; k <= 64; k++) { const t = (k / 64) * Math.PI * 2; pts.push(center.clone().addScaledVector(side, Math.cos(t) * 4.3).addScaledVector(up, Math.sin(t) * 4.3)); }
    const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.18, depthWrite: false }));
    root.add(orbit);
    const tg = tag(`<b>${esc(SHORT[d.id] || d.name)}</b>`, at(() => center.clone().add(V(0, 4.8, 0))));
    tg.show = false;
    return { ...d, i, center, out, side, up, orbit, tg };
  });

  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];
  domains.forEach((d) => {
    skillsOf(d.id).forEach((s, k) => {
      const r = Math.sqrt(k + 0.4), th = k * golden;
      const pos = d.center.clone().addScaledVector(d.side, Math.cos(th) * r).addScaledVector(d.up, Math.sin(th) * r).addScaledVector(d.out, Math.sin(k * 2.3) * 0.35);
      const size = s.state === 'learnt' ? 0.92 : s.state === 'learning' ? 0.84 : 0.74;
      const gem = s.kind === 'competency';
      const face = gem
        ? new THREE.Mesh(tx.gem, new THREE.MeshStandardMaterial({ color: DOMAIN_HUE[s.domain], flatShading: true, roughness: 0.28, metalness: 0.35, transparent: true }))
        : new THREE.Sprite(new THREE.SpriteMaterial({ map: tx.disc(s), transparent: true, depthWrite: false }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx.RING[s.state], transparent: true, depthWrite: false }));
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      face.renderOrder = 3; halo.renderOrder = 2; glow.renderOrder = 1;
      [glow, halo, face].forEach((m) => { m.position.copy(pos); root.add(m); });
      const tg = tag(`<b>${esc(s.name)}</b>`, at(() => face.position), 'lk-tag-chip');
      tg.show = false;
      nodes.push({ s, d, pos, size, gem, face, halo, glow, tg, em: 1, show: 0, lines: [], seed: nodes.length * 0.73 });
    });
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.s.id, n]));

  // Projects and theses (papers are counted on the cards, not drawn): small diamonds near their skills.
  const projGeo = new THREE.OctahedronGeometry(0.2, 0);
  const projects = data.works.filter((w) => w.type !== 'paper').map((p) => {
    const used = nodes.filter((n) => n.s.uses.includes(p.id));
    const c = V(); used.forEach((n) => c.add(n.pos)); c.divideScalar(Math.max(1, used.length));
    const pos = c.multiplyScalar(used.length > 1 && new Set(used.map((n) => n.d.id)).size > 1 ? 0.42 : 0.68);
    pos.y -= 1.6;
    return { ...p, pos, used };
  }).filter((p) => p.used.length).map((p) => {
    const mesh = new THREE.Mesh(projGeo, new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1, transparent: true }));
    mesh.position.copy(p.pos); root.add(mesh);
    const tg = tag(`<b>${esc(p.name)}</b>`, at(() => p.pos));
    tg.show = false;
    return { ...p, mesh, tg, em: 0.3 };
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
  const spokes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(domains.flatMap((d) => [V(), d.center])), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.08, depthWrite: false }));
  root.add(core, spokes);

  // ── Theme: states take the theme's accent, warm and soft ink.
  let night = true;
  const STATE_KEY = { learnt: 'accent', learning: 'warm', next: 'inkSoft' };
  function theme(p) {
    night = p.night;
    nodes.forEach((n) => {
      n.halo.material.color.set(p[STATE_KEY[n.s.state]]);
      n.glow.material.color.set(p[STATE_KEY[n.s.state]]).multiplyScalar(night ? 0.22 : 0);
      n.halo.material.blending = p.glow;
      if (n.gem) n.face.material.emissive.set(DOMAIN_HUE[n.s.domain]).multiplyScalar(night ? 0.32 : 0.06);
      else n.face.material.color.setScalar(night ? 0.8 : 1);
      n.halo.material.needsUpdate = true;
    });
    links.forEach((l) => l.line.material.color.set(p.accent));
    domains.forEach((d) => d.orbit.material.color.set(p.accent));
    spokes.material.color.set(p.accent);
    core.material.color.set(p.accent);
    projects.forEach((q) => { q.mesh.material.color.set(p.ink); q.mesh.material.emissive.set(night ? 0x401010 : 0x000000); });
  }

  // ── Camera: the kit frames view.w × view.h around view.c; it is eased toward the target here.
  const OVER = { c: V(0, -0.8, 0), w: 30, h: 17.5, dir: mode === 'growing' ? V(-0.2, 0.78, 1) : V(0, 0.62, 1) };
  const view = { c: OVER.c.clone(), w: OVER.w, h: OVER.h, dir: OVER.dir.clone() };
  ctx.view = view;
  const target = { c: V(), w: 0, h: 0, dir: V() };
  const passes = (n) => state.kind === 'all' || n.s.kind === state.kind;
  let t0 = -1;
  const redraw = () => ctx.invalidate();
  live.add(redraw);

  return {
    theme,
    update(t, dt) {
      if (t0 < 0) t0 = t;
      const time = reduceMotion ? 0 : t;
      const intro = reduceMotion ? 10 : t - t0;
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 7);
      const kv = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2);
      const activeDom = mode === 'domains' ? domains[state.dom]?.id : null;
      const growing = mode === 'growing';
      const focusN = byId[state.hl] && passes(byId[state.hl]) && (mode !== 'domains' || byId[state.hl].d.id === activeDom) ? byId[state.hl] : null;

      if (mode === 'domains') {
        const d = domains[state.dom] || domains[0];
        target.c.copy(d.center).addScaledVector(d.up, -0.3); target.w = 10.5; target.h = 10.5;
        target.dir.copy(d.out).addScaledVector(d.up, 0.06);
      } else { target.c.copy(OVER.c); target.w = OVER.w; target.h = OVER.h; target.dir.copy(OVER.dir); }
      view.c.lerp(target.c, kv); view.dir.lerp(target.dir, kv);
      view.w += (target.w - view.w) * kv; view.h += (target.h - view.h) * kv;
      root.rotation.y = mode === 'hero' && !reduceMotion ? Math.sin(time * 0.13) * 0.2 : 0;

      nodes.forEach((n, idx) => {
        let em = 1;
        if (activeDom && n.d.id !== activeDom) em = 0.07;
        if (growing && n.s.state === 'learnt') em = 0.2;
        if (focusN) em = n === focusN ? 1.25 : Math.min(em, 0.35);
        if (!passes(n)) em = 0.05;
        n.em += (em - n.em) * k;
        n.show = reduceMotion ? 1 : smooth(clamp01((intro - 0.25 - idx * 0.028) / 0.7));
        const pulse = n.s.state === 'learning' && !reduceMotion ? 1 + Math.sin(time * 2.4 + n.seed) * 0.07 : 1;
        const sz = n.size * n.show * (n === focusN ? 1.18 : 1) * (growing && n.s.state !== 'learnt' ? 1.4 : 1);
        const bob = reduceMotion ? 0 : Math.sin(time * 0.8 + n.seed) * 0.06;
        [n.face, n.halo, n.glow].forEach((m) => m.position.set(n.pos.x, n.pos.y + bob, n.pos.z));
        if (n.gem) { n.face.scale.setScalar(tiny(sz * 0.95)); n.face.rotation.set(0.42, time * 0.5 + n.seed, 0); } else n.face.scale.setScalar(tiny(sz));
        n.halo.scale.setScalar(tiny(sz * 1.45 * pulse));
        n.glow.scale.setScalar(tiny(sz * (n.s.state === 'learnt' ? 3.0 : n.s.state === 'learning' ? 2.6 * pulse : 1.6)));
        if (n.s.state === 'learning' && !reduceMotion) n.halo.material.rotation = -time * 1.1 - n.seed;
        const a = Math.min(1, n.em);
        n.face.material.opacity = a * (n.s.state === 'next' ? 0.72 : 1);
        n.halo.material.opacity = a * (n.s.state === 'next' ? 0.7 : 1);
        n.glow.material.opacity = a * (n.s.state === 'learning' ? 0.75 + 0.25 * Math.sin(time * 2.4 + n.seed) : 0.8);
        n.tg.show = n === focusN && n.show > 0.9;
      });

      const lit = new Set();
      links.forEach((l) => {
        let o = lowPower ? 0.05 : 0.07;
        if (activeDom && l.n.d.id === activeDom && passes(l.n)) o = 0.3;
        if (growing && l.n.s.state !== 'learnt' && passes(l.n)) o = 0.3;
        if (!passes(l.n) || (activeDom && l.n.d.id !== activeDom)) o = 0.025;
        if (focusN) o = l.n === focusN ? 0.9 : 0.02;
        if (o >= 0.3) lit.add(l.p.id);
        l.o += (o - l.o) * k;
        l.line.material.opacity = l.o * (night ? 1 : 0.9) * Math.min(1, l.n.show * 1.5);
      });
      projects.forEach((p) => {
        const on = lit.has(p.id);
        p.em += ((on ? 1 : focusN ? 0.15 : activeDom ? 0.1 : 0.45) - p.em) * k;
        p.mesh.material.opacity = p.em;
        p.mesh.rotation.y = time * 0.6; p.mesh.rotation.x = 0.4;
        p.mesh.scale.setScalar((0.8 + p.em * 0.6) * Math.min(1, intro / 1.4));
        p.tg.show = !!focusN && focusN.s.uses.includes(p.id);
      });
      domains.forEach((d) => {
        d.tg.show = mode === 'hero' && !focusN && intro > 1.2;
        d.orbit.material.opacity = (activeDom === d.id ? 0.32 : 0.12) * (night ? 1 : 0.8);
      });
      core.rotation.y = time * 0.15; core.rotation.x = time * 0.07;
      core.material.opacity = activeDom ? 0.15 : 0.45;
      spokes.material.opacity = activeDom ? 0.03 : 0.08;
    },
  };
};

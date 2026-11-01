// Agentic AI: one step per agent system, each with a 3D explainer that plays the system's loop.
//   Intro / toolbelt: the loop every system shares (rules, agents propose, evidence, human gate).
//   Kage game crew:   a task is queued, built in a git worktree, peer-reviewed, merged by a human.
//   VeriTomiX Office: founder -> Atlas -> 7 department heads (+ local specialists) -> approval gate.
//   ANIMUS Jobs:      sources -> router (classifies into lanes) -> verifier -> board or archive.
// Scroll moves between systems (staggered reveal, eased camera); time plays each loop.
// Reduced motion shows one still, fully labelled frame per system.
import builder from '../../content/ai-builder.json';
import projects from '../../content/projects.json';
import { runPage } from './engine.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import './builder.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
const fig = (f) => `<figure class="s-fig"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"><figcaption>${esc(f.caption)}</figcaption></figure>`;
const LOGO = { claude: '/media/logos/claude.svg', codex: '/media/logos/codex.svg', antigravity: '/media/logos/antigravity.svg', meshy: '/media/logos/meshy.svg', blender: '/media/logos/blender.svg' };
const logo = (k) => `<span class="bd-logo" aria-hidden="true"><img src="${LOGO[k]}" alt="" width="12" height="12"></span>`;

const builds = builder.builds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const explain = builder.explainers || {};

function buildCard(p, i) {
  const a = p.architecture;
  const ex = explain[p.id];
  const figs = a?.figures || [];
  return `<p class="s-kicker">System ${i + 1} of ${builds.length} · ${esc(p.kind)}</p><h2>${esc(p.name)}</h2>
    <p class="s-lede">${esc(p.eli5 || '')}</p><p>${esc(p.summary)}</p>
    ${ex ? `<p class="bd-watch"><span>In the diagram</span>${esc(ex.watch)}</p>` : ''}
    ${p.id === 'kage-game' ? `<ul class="bd-agents" aria-label="Agents and tools">
        <li>${logo('claude')}Claude Code</li><li>${logo('codex')}Codex CLI</li><li>${logo('antigravity')}Antigravity</li>
        <li>${logo('meshy')}Meshy AI</li><li>${logo('blender')}Blender</li></ul>` : ''}
    ${p.facts ? `<div class="s-chips">${p.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
    ${p.id === 'kage-game' ? `<a class="bd-gamelink" href="/sections/game.html"><div><span>Kage, the game</span><b>Gameplay, the world and footage</b></div><em aria-hidden="true">→</em></a>` : ''}
    ${figs[0] ? fig(figs[0]) : ''}
    ${a ? `<details class="s-know"><summary>How it's built <span class="s-meta">hierarchy, models, deployment</span></summary>
      <h3>Hierarchy</h3>
      <ol class="s-tiers">${a.hierarchy.map((h) => `<li><span>${esc(h.level)}</span><b>${esc(h.who)}</b><p>${esc(h.does)}</p>${h.model ? `<em>${esc(h.model)}</em>` : ''}</li>`).join('')}</ol>
      <h3>Deployment</h3>${list(a.deployment)}
      ${figs.slice(1).map(fig).join('')}
      <h3>Safeguards</h3>${list(a.safeguards)}
    </details>` : ''}
    ${p.more ? `<details class="s-know"><summary>Know more <span class="s-meta">problem, approach, status</span></summary>
      <h3>The problem</h3><p>${esc(p.more.problem)}</p><h3>How it works</h3>${list(p.more.approach)}<h3>Status</h3>${list(p.more.status)}
      ${p.stack ? `<h3>Built with</h3><div class="s-chips">${p.stack.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      ${p.note ? `<p class="s-meta">${esc(p.note)}</p>` : ''}
    </details>` : ''}`;
}

document.getElementById('main').innerHTML = `
  <section class="s-step s-hero" data-title="Agentic AI"><div class="s-card">
    <p class="s-kicker">Agentic AI</p><h1>${esc(builder.headline)}</h1>
    <p class="s-lede">Agents do the work; I hold the gates. Every system here runs the same loop: written rules, agents that propose, evidence that is logged, and a person who accepts or sends the work back.</p>
    <p class="s-scroll">Scroll to see three systems at work</p>
  </div></section>
  ${builds.map((p, i) => `<section class="s-step" data-title="${esc(p.name)}"><div class="s-card">${buildCard(p, i)}</div></section>`).join('')}
  <section class="s-step" data-title="Toolbelt"><div class="s-card"><h2>Toolbelt &amp; next</h2>
    <div class="s-chips">${builder.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
    <h3>Next on the bench</h3>${list(builder.roadmap)}
    <div class="s-cert"><span>Certifications</span><b>Anthropic certifications</b><p>Coming soon</p></div>
  </div></section>`;

const NSTEPS = 2 + builds.length;
const stepOf = (id) => { const i = builds.findIndex((b) => b.id === id); return i < 0 ? -1 : 1 + i; };

// Diagram colours per theme. Roles are recoloured on theme change; animated parts read C every frame.
const PAL = {
  dark: { body: 0x4a3b43, track: 0xf2ece4, idle: 0x75666d, cream: 0xf2ece4, amber: 0xffb36b, accent: 0xff5c5c, ok: 0x84dba5, gate: 0xd24a4a, lane0: 0xffb36b, lane1: 0xff6b6b, lane2: 0xdccfbe, floor: 0xd24a4a },
  light: { body: 0xfdf9f3, track: 0x1b1715, idle: 0xc4b6a7, cream: 0x6b5a4e, amber: 0xc46f12, accent: 0xb3262b, ok: 0x2f8f5b, gate: 0xa32424, lane0: 0xc46f12, lane1: 0xb3262b, lane2: 0x4f6b86, floor: 0x8b6f55 },
};

runPage({
  active: 'builder',
  build({ THREE, scene, camera, reduceMotion, lowPower }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const seg = (t, a, b) => clamp01((t - a) / (b - a));
    const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const eout = (x) => 1 - Math.pow(1 - x, 3);
    const eback = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2));
    const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
    const smooth = (x) => x * x * (3 - 2 * x);
    const rnd = (j, s) => { const x = Math.sin(j * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

    // ── Palette and theme-aware materials
    const C = {};
    const reg = [];
    let P;
    const setPal = (p) => { P = p; for (const k in p) (C[k] ||= new THREE.Color()).set(p[k]); reg.forEach((r) => r.m.color.set(P[r.role])); };
    setPal(PAL[document.documentElement.dataset.theme === 'light' ? 'light' : 'dark']);
    const std = (role, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: P[role], roughness: 0.38, metalness: 0.1, transparent: true, ...o }); reg.push({ m, role }); return m; };
    const basic = (role, o = {}) => { const m = new THREE.MeshBasicMaterial({ color: P[role], transparent: true, ...o }); reg.push({ m, role }); return m; };
    const dyn = (o = {}) => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, ...o });

    const geoCache = new Map();
    const rbox = (w, h, d, r = 0.08) => {
      const k = `${w}|${h}|${d}|${r}`;
      if (!geoCache.has(k)) geoCache.set(k, new RoundedBoxGeometry(w, h, d, lowPower ? 2 : 3, r));
      return geoCache.get(k);
    };
    const vec = (p) => (p.isVector3 ? p : V(...p));
    const curve = (...pts) => new THREE.CatmullRomCurve3(pts.map(vec), false, 'centripetal');
    const lineC = (a, b) => new THREE.LineCurve3(vec(a), vec(b));

    // ── Labels: own layer so they can follow the phone band (engine labels assume a full-screen canvas).
    const layer = document.createElement('div');
    layer.className = 'bd-labels';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const labels = [];
    const tmp = V(0, 0, 0);

    // ── Systems: a group whose elements reveal in order (staggered), with labels that follow them.
    const systems = [];
    function makeSystem(steps) {
      const g = new THREE.Group();
      scene.add(g);
      const s = { g, els: [], a: 0, steps: null, cur: -2 };
      if (steps) {
        const el = document.createElement('div');
        el.className = 'bd-label bd-mid';
        el.innerHTML = `<ol class="bd-steps">${steps.map((x, i) => `<li data-n="${i + 1}">${esc(x)}</li>`).join('')}</ol>`;
        layer.appendChild(el);
        s.steps = { el, items: [...el.querySelectorAll('li')], anchor: V(0, 0, 0), op: -1 };
      }
      systems.push(s);
      return s;
    }
    function add(s, obj, order, o = {}) {
      const mats = [];
      obj.traverse((m) => { if (m.material) mats.push({ m: m.material, base: m.material.opacity }); });
      const e = { obj, mats, order, home: obj.position.clone(), s0: obj.scale.x, k: 0, alpha: 1, dyn: !!o.dyn };
      s.els.push(e);
      s.g.add(obj);
      return e;
    }
    // A label pinned at an element's resting position plus an offset (in the system's space).
    function tag(s, e, html, off, cls = 'bd-up', tagCls = '') {
      const el = document.createElement('div');
      el.className = `bd-label ${cls}`;
      el.innerHTML = `<div class="bd-tag ${tagCls}">${html}</div>`;
      layer.appendChild(el);
      const l = { el, s, e, off: vec(off), op: -1, tagEl: el.firstChild };
      labels.push(l);
      return l;
    }
    const name = (b, i, lg) => `${lg ? logo(lg) : ''}<div><b>${esc(b)}</b>${i ? `<i>${esc(i)}</i>` : ''}</div>`;
    const elOf = (s, obj) => s.els.find((e) => e.obj === obj);

    function setStep(s, idx) {
      if (!s.steps || s.cur === idx) return;
      s.cur = idx;
      s.steps.items.forEach((li, i) => { li.classList.toggle('on', i === idx); li.classList.toggle('done', i < idx); });
    }

    // ── Building blocks
    function pod(w, h, d = 0.28) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(rbox(w, h, d, Math.min(0.1, h * 0.3)), std('body'));
      const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.05, 0.02), dyn());
      strip.position.set(0, -h * 0.5 + 0.1, d * 0.5 + 0.012);
      strip.material.color.copy(C.idle);
      grp.add(body, strip);
      return { grp, body, strip };
    }
    const track = (c, r = 0.02, op = 0.22) => new THREE.Mesh(new THREE.TubeGeometry(c, 64, r, 6, false), basic('track', { opacity: op, depthWrite: false }));
    const gateRing = (r = 0.42) => new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 10, 48), std('gate', { emissive: P.gate, emissiveIntensity: 0.2, roughness: 0.3, metalness: 0.3 }));
    const checkPath = new THREE.CurvePath();
    checkPath.add(lineC([-0.17, 0.01, 0], [-0.05, -0.11, 0]));
    checkPath.add(lineC([-0.05, -0.11, 0], [0.19, 0.15, 0]));
    const checkGeo = new THREE.TubeGeometry(checkPath, 16, 0.035, 6, false);
    const check = () => new THREE.Mesh(checkGeo, dyn());
    function cross() {
      const g = new THREE.Group();
      const mat = dyn();
      [1, -1].forEach((sg) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.055, 0.055), mat); b.rotation.z = (sg * Math.PI) / 4; g.add(b); });
      g.userData.mat = mat;
      return g;
    }
    const mix = (out, a, b, t) => out.copy(a).lerp(b, clamp01(t));

    // A glowing work item with a short trail.
    function packet(s, { w = 0.3, h = 0.2, d = 0.07, round = true, order = 0.95 } = {}) {
      const geo = round ? new THREE.SphereGeometry(h * 0.5, 16, 12) : rbox(w, h, d, 0.03);
      const mat = dyn();
      const core = new THREE.Mesh(geo, mat);
      const grp = new THREE.Group();
      grp.add(core);
      const e = add(s, grp, order, { dyn: true });
      const n = reduceMotion ? 0 : lowPower ? 2 : 4;
      const trail = [...Array(n)].map((_, i) => {
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
        m.visible = false;
        s.g.add(m);
        return { m, sc: 0.78 - i * 0.14, op: 0.34 - i * 0.07 };
      });
      const hist = [];
      const cap = n * 3 + 1;
      return {
        grp, e,
        set(pos, col, alpha = 1, scale = 1) {
          grp.position.copy(pos);
          core.scale.setScalar(Math.max(0.001, scale));
          mat.color.copy(col);
          e.alpha = alpha;
          if (!n) return;
          if (hist[0] && hist[0].distanceToSquared(pos) > 1.2) hist.length = 0;
          const v = hist.length >= cap ? hist.pop() : V(0, 0, 0);
          hist.unshift(v.copy(pos));
          trail.forEach((t, i) => {
            const hp = hist[Math.min(hist.length - 1, (i + 1) * 3)];
            t.m.visible = s.g.visible && hp.distanceToSquared(pos) > 4e-4 && alpha * e.k > 0.02;
            if (!t.m.visible) return;
            t.m.position.copy(hp);
            t.m.material.color.copy(col);
            t.m.material.opacity = t.op * alpha * e.k;
            t.m.scale.setScalar(scale * t.sc);
          });
        },
      };
    }
    // A ring that fills like a progress bar.
    function progressRing(r = 0.3) {
      const segs = 48;
      const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.045, r, segs, 1, 0, Math.PI * 2), dyn({ side: THREE.DoubleSide }));
      m.rotation.z = Math.PI / 2;
      m.scale.x = -1; // fill clockwise from the top
      m.userData.segs = segs;
      return m;
    }
    const setRing = (m, f) => m.geometry.setDrawRange(0, Math.round(clamp01(f) * m.userData.segs) * 6);

    // Soft ground glow shared by every diagram, and a warm fill light.
    const floorTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), basic('floor', { map: floorTex, opacity: 0.22, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.3;
    scene.add(floor);
    const fill = new THREE.PointLight(0xffe6d2, 6, 30, 1.6);
    fill.position.set(-2, 4, 6);
    scene.add(fill);

    // ════════ Intro / toolbelt: the loop every system shares ════════
    const hero = makeSystem(null);
    const ell = new THREE.CatmullRomCurve3([...Array(64)].map((_, i) => { const a = (i / 64) * Math.PI * 2; return V(Math.cos(a) * 3.5, 0, Math.sin(a) * 1.75); }), true);
    add(hero, track(ell, 0.02, 0.18), 0);
    const HS = [['AGENTS.md', 'rules every agent follows'], ['Agents', 'propose in dated sessions'], ['Evidence', 'hashes, logs, reports'], ['You', 'accept or send back']];
    const HU0 = 0.375;
    const heroSt = HS.map(([n, d], i) => {
      const p = pod(1.3, 0.5);
      p.grp.position.copy(ell.getPointAt((HU0 + i * 0.25) % 1)).add(V(0, 0.3, 0));
      const e = add(hero, p.grp, 0.15 + i * 0.15);
      tag(hero, e, name(n, d), [0, 0.42, 0]);
      return p;
    });
    const hgU = 0.07;
    const heroGate = gateRing(0.36);
    heroGate.position.copy(ell.getPointAt(hgU));
    heroGate.lookAt(heroGate.position.clone().add(ell.getTangentAt(hgU)));
    add(hero, heroGate, 0.8);
    const heroPk = packet(hero, { h: 0.24 });
    const HERO_T = 7.2;

    function updateHero(time) {
      const u = reduceMotion ? 0.86 : (time / HERO_T) % 1;
      const q = Math.floor(u * 4), f = u * 4 - q;
      const pu = (HU0 + (q + eio(seg(f, 0, 0.62))) * 0.25) % 1;
      heroPk.set(ell.getPointAt(pu).add(V(0, 0.08, 0)), [C.cream, C.amber, C.amber, C.ok][q], 1, 1);
      const at = (q + 1) % 4;
      heroSt.forEach((p, i) => mix(p.strip.material.color, C.idle, i === 3 ? C.ok : C.amber, f > 0.62 && i === at ? eout(seg(f, 0.62, 0.72)) : 0));
      const gd = ell.getPointAt(hgU).distanceTo(heroPk.grp.position);
      heroGate.material.emissive.copy(C.ok);
      heroGate.material.emissiveIntensity = 0.15 + 1.6 * clamp01(1 - gd / 0.9);
    }

    // ════════ Kage game crew: queue -> build in a worktree -> peer review -> human merge ════════
    const kage = makeSystem(explain['kage-game']?.steps || ['Queue', 'Build', 'Peer review', 'Merge']);
    const KB = V(-3.9, 0.35, 0), KA = V(-1.25, 1.55, -0.35), KC = V(-1.25, -0.7, 0.45), KR = V(1.2, 0.42, 0), KG = V(2.7, 0.42, 0), KM = V(3.65, -1.95, 0);
    const kLanes = [
      [curve(KB, [-2.7, 1.35, -0.2], KA), curve(KA, [0.05, 1.35, -0.2], KR)],
      [curve(KB, [-2.7, -0.55, 0.25], KC), curve(KC, [0.05, -0.45, 0.25], KR)],
    ];
    const kRG = lineC(KR, KG), kGM = curve(KG, [3.5, -0.2, 0], KM);
    const kLaneE = kLanes.map(([a, b], i) => { const e = add(kage, track(a), 0.3 + i * 0.05); add(kage, track(b), 0.45 + i * 0.05); return e; });
    add(kage, track(kRG), 0.55);
    add(kage, track(kGM), 0.6);
    const kMainE = add(kage, track(lineC([-4.6, -1.95, 0], [4.6, -1.95, 0]), 0.045, 0.4), 0.05);
    tag(kage, kMainE, '<b>main</b>', [-4.3, -1.78, 0], 'bd-up', 'bd-plain');
    tag(kage, kLaneE[0], '<b>worktree · feat/engine</b>', [-2.75, 1.62, -0.25], 'bd-up', 'bd-plain');
    tag(kage, kLaneE[1], '<b>worktree · feat/combat</b>', [-2.75, -0.8, 0.3], 'bd-down', 'bd-plain');
    const kBoard = pod(1.2, 0.6); kBoard.grp.position.copy(KB);
    tag(kage, add(kage, kBoard.grp, 0.1), name('./crew', 'task board'), [0, 0.45, 0]);
    const kBuild = [[KA, 'Claude Code', 'engine, shaders', 'claude'], [KC, 'Codex', 'gameplay, physics', 'codex']].map(([p, n, d, lg], i) => {
      const b = pod(1.45, 0.55); b.grp.position.copy(p);
      tag(kage, add(kage, b.grp, 0.25 + i * 0.1), name(n, d, lg), [0, 0.42, 0]);
      return b;
    });
    const kRev = pod(1.45, 0.55); kRev.grp.position.copy(KR);
    tag(kage, add(kage, kRev.grp, 0.5), name('Antigravity', 'peer review, tests', 'antigravity'), [0, 0.42, 0]);
    const kGate = gateRing(0.4); kGate.position.copy(KG); kGate.rotation.y = Math.PI / 2;
    tag(kage, add(kage, kGate, 0.65), name('You', 'merge gate'), [0, -0.55, 0], 'bd-down');
    const kCheck = check(); kCheck.position.set(KG.x + 0.62, KG.y + 0.02, 0.1); add(kage, kCheck, 1, { dyn: true });
    const kRing = progressRing(0.3); add(kage, kRing, 1, { dyn: true });
    const kScan = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 40), dyn()); kScan.rotation.x = Math.PI / 2; add(kage, kScan, 1, { dyn: true });
    const kItem = packet(kage, { round: false, w: 0.34, h: 0.24, d: 0.08 });
    const KCOMMITS = 11, KSP = 0.78;
    const kCommits = [...Array(KCOMMITS)].map(() => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20), dyn());
      m.rotation.x = Math.PI / 2;
      return { m, e: add(kage, m, 0.15, { dyn: true }) };
    });
    kage.steps.anchor.set(0, -2.75, 0);
    const KAGE_T = 9;
    const front = V(0, 0, 0.3), kCol = new THREE.Color();

    function updateKage(time) {
      const u = reduceMotion ? 0.83 : (time / KAGE_T) % 1;
      const lane = reduceMotion ? 0 : Math.floor(time / KAGE_T) % 2;
      const [c1, c2] = kLanes[lane];
      const bpos = lane ? KC : KA;
      let pos, col = C.amber, sc = 1, alpha = 1;
      if (u < 0.12) { pos = KB.clone().add(front); sc = eback(seg(u, 0, 0.1)); col = mix(kCol, C.cream, C.amber, seg(u, 0.04, 0.12)); }
      else if (u < 0.28) pos = c1.getPoint(eio(seg(u, 0.12, 0.28)));
      else if (u < 0.46) pos = bpos.clone().add(front);
      else if (u < 0.58) pos = c2.getPoint(eio(seg(u, 0.46, 0.58)));
      else if (u < 0.7) { pos = KR.clone().add(front); col = mix(kCol, C.amber, C.ok, seg(u, 0.64, 0.7)); }
      else if (u < 0.8) { pos = kRG.getPoint(eio(seg(u, 0.7, 0.8))); col = C.ok; }
      else if (u < 0.86) { pos = KG.clone(); col = C.ok; }
      else { const f = eio(seg(u, 0.86, 0.95)); pos = kGM.getPoint(f); col = C.ok; sc = 1 - 0.6 * f; alpha = 1 - seg(u, 0.93, 0.96); }
      kItem.set(pos, col, alpha, sc);

      // Builder: a ring fills while it works in its worktree, then its status turns green.
      kRing.position.copy(bpos).add(V(0, 0, 0.3));
      kRing.material.color.copy(C.amber);
      setRing(kRing, seg(u, 0.3, 0.45));
      kRing.visible = u > 0.29 && u < 0.47 && kage.a > 0.01;
      kBuild.forEach((b, i) => {
        const c = b.strip.material.color;
        if (i !== lane) mix(c, C.idle, C.idle, 0);
        else if (u < 0.28) mix(c, C.idle, C.amber, seg(u, 0.22, 0.28));
        else if (u < 0.45) c.copy(C.amber).multiplyScalar(0.85 + 0.15 * Math.sin(time * 9));
        else mix(c, C.ok, C.idle, seg(u, 0.9, 1));
      });
      // Reviewer: a different agent scans the change, then approves it.
      const scan = seg(u, 0.59, 0.69);
      kScan.position.copy(KR).add(V(0, 0.35 - 0.7 * eio(scan), 0.3));
      kScan.material.color.copy(C.ok);
      kScan.visible = scan > 0 && scan < 1 && kage.a > 0.01;
      const rc = kRev.strip.material.color;
      if (u < 0.58) rc.copy(C.idle);
      else if (u < 0.69) rc.copy(C.amber).multiplyScalar(0.85 + 0.15 * Math.sin(time * 9));
      else mix(rc, C.ok, C.idle, seg(u, 0.9, 1));
      // The human merge gate lights and shows a check.
      kGate.material.emissive.copy(u > 0.79 ? C.ok : C.gate);
      kGate.material.emissiveIntensity = 0.2 + 1.8 * (reduceMotion ? 1 : bump(u, 0.76, 0.94));
      const ck = eback(seg(u, 0.8, 0.85)) * (1 - seg(u, 0.93, 0.98));
      kCheck.scale.setScalar(Math.max(0.001, ck));
      kCheck.material.color.copy(C.ok);
      kCheck.visible = ck > 0.01 && kage.a > 0.01;
      // Commits slide left along main as each merge lands.
      const sh = eio(seg(u, 0.88, 0.97));
      kCommits.forEach(({ m, e }, k) => {
        const x = KM.x - KSP * (k - 1 + sh);
        m.position.set(x, KM.y, 0);
        e.alpha = k === 0 ? sh : clamp01((x + 4.4) / 0.8);
        m.material.color.copy(k <= 1 ? C.ok : C.idle);
      });
      setStep(kage, u < 0.12 ? 0 : u < 0.46 ? 1 : u < 0.7 ? 2 : 3);
    }

    // ════════ VeriTomiX Office: founder -> Atlas -> heads (+ specialists) -> approval gate ════════
    const office = makeSystem(explain['veritomix-office']?.steps || ['Request', 'Dispatch', 'Work', 'Report', 'Approve']);
    const OF = V(0, 3.25, 0), OA = V(0, 1.3, 0), OG = V(1.5, 2.3, 0), OL = V(2.75, 3.25, 0);
    const oF = pod(1.35, 0.5); oF.grp.position.copy(OF);
    tag(office, add(office, oF.grp, 0), name('Founder', 'sets priorities, approves'), [-0.8, 0, 0], 'bd-left');
    const oGate = gateRing(0.36); oGate.position.copy(OG); oGate.rotation.x = Math.PI / 2;
    tag(office, add(office, oGate, 0.12), name('Approval gate', 'nothing ships unsigned'), [0.5, 0, 0], 'bd-right');
    const oA = pod(1.55, 0.56); oA.grp.position.copy(OA);
    tag(office, add(office, oA.grp, 0.22), name('Atlas', 'coordinator', 'codex'), [-0.9, 0, 0], 'bd-left');
    const oL = pod(1.0, 0.42); oL.grp.position.copy(OL);
    tag(office, add(office, oL.grp, 0.95), name('Audit ledger', 'every action logged'), [0, 0.34, 0], 'bd-up');
    const oReq = curve(OF.clone().add(V(-0.45, -0.25, 0)), [-1.0, 2.3, 0], OA.clone().add(V(-0.45, 0.28, 0)));
    const oRet = curve(OA.clone().add(V(0.55, 0.28, 0)), [1.35, 1.7, 0], OG, [1.3, 2.95, 0], OF.clone().add(V(0.55, -0.1, 0)));
    add(office, track(oReq), 0.18);
    add(office, track(oRet), 0.2);
    const HEADS = [['Mira', 'R&D'], ['Noah', 'Phantoms'], ['Ada', 'Product'], ['Lina', 'Clinical'], ['Leo', 'Partners'], ['Iris', 'IP & Ops'], ['Finn', 'Finance']];
    const oHeads = HEADS.map(([n, d], i) => {
      const hp = V((i - 3) * 1.3, -0.85, 0.35 - 0.11 * (i - 3) * (i - 3));
      const h = pod(0.98, 0.42, 0.24); h.grp.position.copy(hp);
      tag(office, add(office, h.grp, 0.35 + i * 0.05), name(n, d), [0, 0.32, 0], 'bd-up', 'bd-sm');
      const sp = V(hp.x, -2.2, hp.z);
      const spec = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), std('body', { emissive: P.ok, emissiveIntensity: 0.25 }));
      spec.position.copy(sp);
      add(office, spec, 0.7 + i * 0.03);
      add(office, track(lineC(hp.clone().add(V(0, -0.22, 0)), sp), 0.012, 0.18), 0.7 + i * 0.03);
      const disp = curve(OA.clone().add(V(0, -0.3, 0)), [hp.x * 0.5, 0.35, hp.z * 0.5], hp.clone().add(V(0, 0.22, 0)));
      add(office, track(disp, 0.016, 0.18), 0.32 + i * 0.04);
      const pk = packet(office, { h: 0.17 });
      const ping = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), dyn());
      const pe = add(office, ping, 1, { dyn: true });
      return { h, hp, sp, disp, pk, ping, pe, spec };
    });
    tag(office, elOf(office, oHeads[3].spec), '<b>Local specialists · Llama 3.2</b>', [0, -0.3, 0], 'bd-down', 'bd-plain');
    tag(office, elOf(office, oA.grp), '<b>7 department heads</b><i>Gemini CLI · Codex for R&amp;D</i>', [0.95, -0.05, 0], 'bd-right', 'bd-plain');
    const oPk = packet(office, { h: 0.24 });
    const oCheck = check(); oCheck.position.copy(OG).add(V(0.62, 0.0, 0.1)); add(office, oCheck, 1, { dyn: true });
    office.steps.anchor.set(0, -3.6, 0);
    const OFF_T = 10;
    const atlasOut = OA.clone().add(V(0, 0.05, 0.32)), headOff = V(0, -0.22, 0), hb = V(0, 0, 0);

    function updateOffice(time) {
      const u = reduceMotion ? 0.83 : (time / OFF_T) % 1;
      // The request goes down to Atlas; the merged result goes up through the gate.
      if (u < 0.12) oPk.set(oReq.getPoint(eio(seg(u, 0.01, 0.12))), C.cream, seg(u, 0, 0.03), 1);
      else if (u < 0.68) oPk.set(atlasOut, C.amber, 1 - seg(u, 0.12, 0.16) + seg(u, 0.64, 0.68), 0.8);
      else if (u < 0.8) oPk.set(oRet.getPoint(eio(seg(u, 0.68, 0.8)) * 0.5), C.ok, 1, 1);
      else if (u < 0.86) oPk.set(OG, C.ok, 1, 1);
      else oPk.set(oRet.getPoint(0.5 + 0.5 * eio(seg(u, 0.86, 0.95))), C.ok, 1 - seg(u, 0.95, 0.99), 1);
      // Tasks fan out to the seven heads (staggered); results return in the same order.
      oHeads.forEach((o, i) => {
        const st = i * 0.012;
        let pp, col = C.amber, al = 1;
        if (reduceMotion) { pp = o.disp.getPoint(0.55); col = C.ok; }
        else if (u < 0.12 + st) { pp = o.disp.getPoint(0); al = 0; }
        else if (u < 0.28 + st) pp = o.disp.getPoint(eio(seg(u, 0.12 + st, 0.28 + st)));
        else if (u < 0.52 + st) { pp = o.disp.getPoint(1); al = 1 - seg(u, 0.28 + st, 0.31 + st); }
        else if (u < 0.66 + st) { pp = o.disp.getPoint(1 - eio(seg(u, 0.52 + st, 0.66 + st))); col = C.ok; al = seg(u, 0.52 + st, 0.54 + st); }
        else { pp = o.disp.getPoint(0); col = C.ok; al = 1 - seg(u, 0.66 + st, 0.69 + st); }
        o.pk.set(pp, col, al, 1);
        // Each head hands a small job to its local specialist and gets it back.
        const w = seg(u, 0.31 + st, 0.5 + st);
        const k = w < 0.5 ? eio(w * 2) : 1 - eio((w - 0.5) * 2);
        o.ping.position.lerpVectors(hb.copy(o.hp).add(headOff), o.sp, k);
        o.ping.material.color.copy(C.ok);
        o.pe.alpha = !reduceMotion && w > 0 && w < 1 ? 1 : 0;
        o.spec.material.emissiveIntensity = 0.25 + 1.2 * (reduceMotion ? 0.5 : bump(u, 0.36 + st, 0.46 + st));
        const c = o.h.strip.material.color;
        if (reduceMotion) c.copy(C.ok);
        else if (u < 0.27 + st) c.copy(C.idle);
        else if (u < 0.52 + st) c.copy(C.amber).multiplyScalar(0.85 + 0.15 * Math.sin(time * 8 + i));
        else mix(c, C.ok, C.idle, seg(u, 0.9, 1));
      });
      // Atlas is busy while splitting and merging; the gate approves; the ledger records it.
      mix(oA.strip.material.color, C.idle, C.amber, bump(u, 0.1, 0.3) + bump(u, 0.64, 0.8));
      if (u < 0.2) mix(oF.strip.material.color, C.idle, C.cream, bump(u, 0, 0.14));
      else mix(oF.strip.material.color, C.idle, C.ok, seg(u, 0.9, 0.95) * (1 - seg(u, 0.97, 1)));
      oGate.material.emissive.copy(u > 0.79 ? C.ok : C.gate);
      oGate.material.emissiveIntensity = 0.2 + 1.8 * (reduceMotion ? 1 : bump(u, 0.76, 0.92));
      const ck = eback(seg(u, 0.8, 0.85)) * (1 - seg(u, 0.9, 0.94));
      oCheck.scale.setScalar(Math.max(0.001, ck));
      oCheck.material.color.copy(C.ok);
      oCheck.visible = ck > 0.01 && office.a > 0.01;
      mix(oL.strip.material.color, C.idle, C.ok, reduceMotion ? 1 : bump(u, 0.82, 0.96));
      setStep(office, u < 0.12 ? 0 : u < 0.3 ? 1 : u < 0.52 ? 2 : u < 0.68 ? 3 : 4);
    }

    // ════════ ANIMUS Jobs: sources -> router -> lanes -> verifier -> board or archive ════════
    const animus = makeSystem(explain.animus?.steps || ['Discover', 'Classify', 'Verify', 'Board']);
    const SRC = [['Job APIs, boards', 1.35], ['EU calls, OpenAlex', 0], ['Web radar, alerts', -1.35]];
    const aSrc = SRC.map(([n, y], i) => {
      const p = pod(1.35, 0.44); p.grp.position.set(-4.0, y, 0);
      tag(animus, add(animus, p.grp, i * 0.06), `<b>${esc(n)}</b>`, [0, 0.32, 0]);
      return p;
    });
    const AR = V(-1.45, 0, 0);
    const router = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.95, 6), std('body', { flatShading: true }));
    router.position.copy(AR);
    tag(animus, add(animus, router, 0.2), name('Router', 'sorts by type'), [0, -0.72, 0], 'bd-down');
    const rRing = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.035, 8, 48), std('gate', { emissive: P.gate, emissiveIntensity: 0.3 }));
    rRing.position.copy(AR); rRing.rotation.x = Math.PI / 2;
    add(animus, rRing, 0.22);
    const LANES = [['Industry', 1.35, 'lane0'], ['Academic', 0, 'lane1'], ['Fellowships', -1.35, 'lane2']];
    const AV = 1.3, ABX = 3.75;
    const aIn = aSrc.map((p) => curve(p.grp.position.clone().add(V(0.7, 0, 0)), [-2.5, p.grp.position.y * 0.45, 0], AR.clone().add(V(-0.5, 0, 0))));
    aIn.forEach((c, i) => add(animus, track(c, 0.016, 0.18), 0.12 + i * 0.03));
    const aLane = LANES.map(([n, y, key], i) => {
      const a = curve(AR.clone().add(V(0.5, 0, 0)), [-0.35, y * 0.75, 0], [0.4, y, 0], [AV, y, 0]);
      const b = lineC([AV, y, 0], [ABX - 0.5, y, 0]);
      add(animus, track(a, 0.018, 0.24), 0.3 + i * 0.05);
      add(animus, track(b, 0.018, 0.24), 0.5 + i * 0.05);
      const g = gateRing(0.3); g.position.set(AV, y, 0); g.rotation.y = Math.PI / 2;
      const ge = add(animus, g, 0.45 + i * 0.05);
      tag(animus, ge, `<b>${esc(n)}</b>`, [-0.95, 0.18, 0], 'bd-up', 'bd-plain');
      const ok = check(); ok.position.set(AV + 0.55, y + 0.05, 0.1); add(animus, ok, 1, { dyn: true });
      const no = cross(); no.position.set(AV + 0.55, y + 0.05, 0.1); add(animus, no, 1, { dyn: true });
      const drop = curve([AV, y, 0], [AV + 0.35, y - 0.55, 0.15], [AV + 0.4, -2.55, 0.1]);
      return { y, key, a, b, g, ok, no, drop };
    });
    tag(animus, elOf(animus, aLane[0].g), name('Verifier', 'Claude or Codex opens each link'), [0, 0.4, 0], 'bd-up');
    const aBoard = pod(0.9, 3.9, 0.3); aBoard.grp.position.set(ABX, 0, 0);
    tag(animus, add(animus, aBoard.grp, 0.7), name('Your board', 'swipe to triage'), [0, 2.1, 0], 'bd-up');
    const aBin = new THREE.Mesh(rbox(1.2, 0.36, 0.6, 0.08), std('body'));
    aBin.position.set(AV + 0.4, -2.75, 0);
    tag(animus, add(animus, aBin, 0.8), name('Archive', 'dead, duplicate, expired'), [0.7, 0, 0], 'bd-right');
    // Model route with fallback: one family is active; on a limit the route falls through to the next.
    const MODELS = ['Claude', 'Codex', 'Gemini', 'API'];
    const chipX = (i) => -3.2 + i * 1.3;
    const aChips = MODELS.map((n, i) => {
      const p = pod(0.86, 0.3, 0.16); p.grp.position.set(chipX(i), 2.75, 0);
      const l = tag(animus, add(animus, p.grp, 0.85 + i * 0.03), `<b>${esc(n)}</b>`, [0, 0, 0.1], 'bd-mid', 'bd-chip');
      return { p, l, on: false };
    });
    tag(animus, elOf(animus, aChips[0].p.grp), '<b>Model route · falls through on limits</b>', [-0.43, 0.3, 0], 'bd-upr', 'bd-plain');
    const aMarker = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), dyn());
    add(animus, aMarker, 0.95, { dyn: true });
    add(animus, track(curve([-1.5, 2.55, 0], [-1.45, 1.3, 0], AR.clone().add(V(0, 0.5, 0))), 0.012, 0.16), 0.9);
    const AS = 0.85, AL = 6.4, AN = Math.ceil(AL / AS) + 1;
    const aItems = [...Array(AN)].map(() => packet(animus, { round: false, w: 0.3, h: 0.2, d: 0.06 }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 6, 32), dyn());
    const haloE = add(animus, halo, 1, { dyn: true });
    animus.steps.anchor.set(0, -3.3, 0);
    const laneCol = (k) => C[LANES[k][2]];
    const aCol = new THREE.Color();

    function animusItem(j, tau, out = {}) {
      const u = tau / AL;
      const lane = Math.floor(rnd(j, 1) * 3), src = Math.floor(rnd(j, 2) * 3), fail = rnd(j, 3) < 0.28;
      const L = aLane[lane];
      let pos, col = C.cream, al = 1;
      if (u < 0.24) { pos = aIn[src].getPoint(eio(seg(u, 0, 0.24))); al = seg(u, 0, 0.04); }
      else if (u < 0.32) { pos = AR.clone(); col = mix(aCol, C.cream, laneCol(lane), seg(u, 0.26, 0.31)); al = 0.85; }
      else if (u < 0.55) { pos = L.a.getPoint(eio(seg(u, 0.32, 0.55))); col = laneCol(lane); }
      else if (u < 0.65) { pos = V(AV, L.y, 0); col = laneCol(lane); }
      else if (!fail) { pos = L.b.getPoint(eio(seg(u, 0.65, 0.88))); col = mix(aCol, laneCol(lane), C.ok, seg(u, 0.6, 0.7)); al = 1 - seg(u, 0.88, 0.98); }
      else { pos = L.drop.getPoint(eio(seg(u, 0.65, 0.86))); col = C.idle; al = 1 - seg(u, 0.84, 0.95); }
      return Object.assign(out, { pos, col, al, lane, fail, u });
    }
    const gateState = [0, 1, 2].map(() => ({ v: 0, fail: false, u: 0 }));
    const it = {};

    function updateAnimus(time) {
      const tt = reduceMotion ? 20.3 : time + 30;
      const jNow = Math.floor(tt / AS);
      gateState.forEach((g) => { g.v = 0; });
      let routerFlash = 0, routerLane = 0;
      for (let n = 0; n < AN; n++) {
        const j = jNow - n;
        animusItem(j, tt - j * AS, it);
        const pk = aItems[((j % AN) + AN) % AN];
        if (it.u > 1) { pk.set(it.pos, C.cream, 0, 1); continue; }
        pk.set(it.pos, it.col, it.al, 1);
        const vw = bump(it.u, 0.55, 0.7);
        const g = gateState[it.lane];
        if (vw > g.v) { g.v = vw; g.fail = it.fail; g.u = it.u; }
        const rf = bump(it.u, 0.24, 0.34);
        if (rf > routerFlash) { routerFlash = rf; routerLane = it.lane; }
      }
      aLane.forEach((L, k) => {
        const g = gateState[k];
        L.g.material.emissive.copy(g.fail ? C.accent : C.ok);
        L.g.material.emissiveIntensity = 0.2 + 1.6 * g.v;
        const pop = g.v > 0 ? eback(seg(g.u, 0.57, 0.62)) * (1 - seg(g.u, 0.68, 0.72)) : 0;
        L.ok.scale.setScalar(Math.max(0.001, pop));
        L.ok.visible = !g.fail && pop > 0.01 && animus.a > 0.01;
        L.ok.material.color.copy(C.ok);
        L.no.scale.setScalar(Math.max(0.001, pop));
        L.no.visible = g.fail && pop > 0.01 && animus.a > 0.01;
        L.no.userData.mat.color.copy(C.accent);
      });
      rRing.material.emissive.copy(routerFlash > 0.05 ? laneCol(routerLane) : C.gate);
      rRing.material.emissiveIntensity = 0.3 + 1.4 * routerFlash;
      if (!reduceMotion) router.rotation.y = time * 0.25;
      // Follow one listing at a time (every 6th) so the stepper can narrate it.
      const jf = Math.floor(tt / (AS * 6)) * 6;
      const fi = animusItem(jf, tt - jf * AS);
      if (fi.u <= 1) {
        halo.position.copy(fi.pos);
        halo.material.color.copy(C.accent);
        haloE.alpha = fi.al;
        setStep(animus, fi.u < 0.24 ? 0 : fi.u < 0.55 ? 1 : fi.u < 0.68 || fi.fail ? 2 : 3);
      } else haloE.alpha = 0;
      mix(aBoard.strip.material.color, C.idle, C.ok, Math.max(0, Math.sin(tt * 1.4)) * 0.7);
      // Model route: the active family; every few seconds a limit hits and the route falls through.
      const MT = 4.5;
      const mi = reduceMotion ? 0 : Math.floor(tt / MT) % 4;
      const mf = reduceMotion ? 1 : (tt / MT) % 1;
      const from = (mi + 3) % 4;
      aMarker.position.set(chipX(from) + (chipX(mi) - chipX(from)) * eio(seg(mf, 0.05, 0.25)), 2.55, 0.12);
      aMarker.material.color.copy(C.accent);
      aChips.forEach((c, i) => {
        const col = c.p.strip.material.color;
        if (i === mi) mix(col, C.idle, C.ok, seg(mf, 0.15, 0.3));
        else if (i === from) mix(col, C.accent, C.idle, seg(mf, 0, 0.3));
        else col.copy(C.idle);
        const on = i === mi;
        if (on !== c.on) { c.on = on; c.l.tagEl.classList.toggle('on', on); }
      });
    }

    // ── Scroll: which system shows, and how far through its staggered reveal.
    const SYS = [
      { s: hero, step: 0, alt: NSTEPS - 1, update: updateHero },
      { s: kage, step: stepOf('kage-game'), update: updateKage },
      { s: office, step: stepOf('veritomix-office'), update: updateOffice },
      { s: animus, step: stepOf('animus'), update: updateAnimus },
    ];
    SYS.forEach((x) => { if (x.step < 0) x.s.g.visible = false; });

    function reveal(sys, d) {
      const s = sys.s;
      const a = clamp01((0.52 - Math.abs(d)) / 0.3);
      s.a = a;
      s.g.visible = a > 0.001;
      // Outgoing systems drift up and turn away; incoming ones rise from below.
      s.g.position.y = Math.sign(d) * eio(clamp01(Math.abs(d) / 0.6)) * 3.2;
      s.g.rotation.y = -d * 0.35;
      if (!s.g.visible) return;
      for (const e of s.els) {
        const k = a >= 1 ? 1 : eout(clamp01((a - e.order * 0.4) / 0.6));
        e.k = k;
        if (!e.dyn) {
          e.obj.position.set(e.home.x, e.home.y - (1 - k) * 0.45, e.home.z);
          e.obj.scale.setScalar(e.s0 * (0.82 + 0.18 * k));
        }
        const op = k * e.alpha;
        e.obj.visible = op > 0.004;
        for (const m of e.mats) m.m.opacity = m.base * op;
      }
    }

    // ── Camera: framed per system and fitted to the free area beside (desktop) or above (phone) the cards.
    const FR = {
      hero: { c: [0, 0.1, 0], dir: [0.05, 0.42, 1], w: 9.4, h: 4.4 },
      'kage-game': { c: [0, -0.15, 0], dir: [-0.2, 0.16, 1], w: 10.4, h: 5.6 },
      'veritomix-office': { c: [0, 0.1, 0], dir: [0.08, 0.26, 1], w: 10.2, h: 7.6 },
      animus: { c: [0, 0, 0], dir: [-0.14, 0.1, 1], w: 10.4, h: 7.2 },
      tools: { c: [0, 0.1, 0], dir: [0, 0.5, 1], w: 10.6, h: 5.2 },
    };
    const frames = [FR.hero, ...builds.map((b) => FR[b.id] || FR['kage-game']), FR.tools].map((f) => ({ c: V(...f.c), dir: V(...f.dir).normalize(), w: f.w, h: f.h }));
    const narrow = matchMedia('(max-width: 860px)');
    const fc = V(0, 0, 0), fd = V(0, 0, 0), look = V(0, 0, 0);
    const TAN = Math.tan((camera.fov * Math.PI) / 360);

    function frameCamera(p, t) {
      const i = Math.min(frames.length - 2, Math.max(0, Math.floor(p)));
      const f = smooth(clamp01(p - i));
      const A = frames[i], B = frames[i + 1];
      fc.lerpVectors(A.c, B.c, f);
      fd.lerpVectors(A.dir, B.dir, f).normalize();
      const w = A.w + (B.w - A.w) * f, h = A.h + (B.h - A.h) * f;
      const W = innerWidth, H = layer.clientHeight || innerHeight;
      const aspect = W / H;
      let dist, sx = 0, sy = 0;
      if (narrow.matches) {
        // Phone band: the canvas is squeezed into the band, so render at the band's aspect.
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        const nav = Math.min(0.3, 64 / H);
        dist = Math.max(w / 0.84 / (2 * TAN * aspect), h / (0.9 - nav) / (2 * TAN));
        sy = (nav / 2) * 2 * TAN * dist; // centre the diagram below the nav bar
      } else {
        const cardR = (Math.min(520, W * 0.38) + W * 0.04 + 24) / W;
        const avail = 1 - cardR - 0.05;
        dist = Math.max(w / avail / (2 * TAN * aspect), h / 0.8 / (2 * TAN));
        sx = ((cardR + 0.96) / 2 - 0.62) * 2 * TAN * aspect * dist; // engine view offset centres at 62%
      }
      look.set(fc.x - sx, fc.y + sy, fc.z);
      camera.position.copy(look).addScaledVector(fd, dist);
      if (!reduceMotion) { camera.position.x += Math.sin(t * 0.21) * 0.3; camera.position.y += Math.sin(t * 0.29) * 0.18; }
      camera.lookAt(look);
      camera.updateMatrixWorld();
    }

    // ── Scroll position for the 3D: a plateau while a card is being read, an eased hand-over between
    // cards. (The engine measures step centres, which drifts on tall cards and in the phone layout.)
    const stepEls = [...document.querySelectorAll('.s-step')];
    function readProgress() {
      const top = narrow.matches ? layer.clientHeight : 0;
      const anchor = scrollY + top + (innerHeight - top) * 0.42;
      const T = innerHeight * 0.4;
      const tops = stepEls.map((el) => el.getBoundingClientRect().top + scrollY);
      let i = 0;
      while (i < tops.length - 1 && anchor >= tops[i + 1]) i++;
      if (i < tops.length - 1 && anchor > tops[i + 1] - T / 2) return i + (anchor - (tops[i + 1] - T / 2)) / T;
      if (i > 0 && anchor < tops[i] + T / 2) return i - 0.5 + (anchor - tops[i]) / T;
      return i;
    }
    let prog = readProgress();
    // Phone layout: progress dots and #step-N links bring a card's top to just under the 3D band.
    const toStep = (i, smoothScroll) => {
      const y = () => stepEls[i].getBoundingClientRect().top + scrollY;
      scrollTo({ top: y(), behavior: smoothScroll && !reduceMotion ? 'smooth' : 'auto' });
      // Lazy images above can shift the target while scrolling; settle on the card's top afterwards.
      addEventListener('scrollend', () => { if (Math.abs(y() - scrollY) > 4) scrollTo({ top: y(), behavior: 'auto' }); }, { once: true });
    };
    document.getElementById('dots')?.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!narrow.matches || !b) return;
      ev.stopPropagation();
      toStep([...b.parentNode.children].indexOf(b), true);
    }, true);
    const deep = /^#step-(\d+)$/.exec(location.hash);
    if (deep && stepEls[+deep[1]] && narrow.matches) {
      const go = () => { toStep(+deep[1], false); prog = readProgress(); };
      try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
      requestAnimationFrame(go);
      // Keep the card pinned while late images change the page height, until the reader scrolls.
      let pinned = true;
      ['wheel', 'touchstart', 'keydown'].forEach((n) => addEventListener(n, () => { pinned = false; }, { once: true, passive: true }));
      const ro = new ResizeObserver(() => { if (pinned) go(); });
      ro.observe(document.getElementById('main'));
      setTimeout(() => ro.disconnect(), 5000);
    }

    const place = (el, pos, op, prev, W, H) => {
      if (op < 0.01) { if (prev !== 0) el.style.opacity = 0; return 0; }
      tmp.copy(pos).project(camera);
      if (tmp.z > 1) { if (prev !== 0) el.style.opacity = 0; return 0; }
      el.style.transform = `translate3d(${((tmp.x * 0.5 + 0.5) * W).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * H).toFixed(1)}px,0)`;
      const o = Math.round(op * 50) / 50;
      if (o !== prev) el.style.opacity = o;
      return o;
    };

    return {
      // The engine needs one keyframe per step; the camera is re-framed in update().
      keyframes: [...Array(NSTEPS)].map(() => ({ pos: [0, 1, 20], look: [0, 0, 0] })),
      onTheme(p) {
        setPal(PAL[p.night ? 'dark' : 'light']);
        fill.intensity = p.night ? 6 : 1.5;
        floor.material.opacity = p.night ? 0.22 : 0.32;
      },
      update(t, _p, dt = 0.016) {
        const target = readProgress();
        prog += (target - prog) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 4.5));
        const p = Math.abs(target - prog) < 1e-4 ? target : prog;
        frameCamera(p, t);
        const time = reduceMotion ? 0 : t;
        for (const sys of SYS) {
          if (sys.step < 0) continue;
          let d = p - sys.step;
          if (sys.alt !== undefined && Math.abs(p - sys.alt) < Math.abs(d)) d = p - sys.alt;
          reveal(sys, d);
          if (sys.s.g.visible) sys.update(time);
        }
        scene.updateMatrixWorld();
        const W = innerWidth, H = layer.clientHeight || innerHeight;
        for (const l of labels) {
          const op = l.s.a > 0 ? l.e.k * l.e.k : 0;
          l.op = place(l.el, l.s.g.localToWorld(tmp.copy(l.e.obj.position).add(l.off)), op, l.op, W, H);
        }
        for (const s of systems) {
          if (s.steps) s.steps.op = place(s.steps.el, s.g.localToWorld(tmp.copy(s.steps.anchor)), s.a * s.a * s.a, s.steps.op, W, H);
        }
      },
    };
  },
});

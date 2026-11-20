// 3D parts of the Agentic AI page, one builder per stage (layout.js stage builders):
//   heroStage      the loop every system shares: rules, agents propose, evidence, a person accepts or sends back.
//   kageStage      Kage game crew: a task is queued, built in a git worktree, peer-reviewed, merged by a human.
//   officeStage    VeriTomiX Office: founder -> Atlas -> 7 department heads (+ local specialists) -> approval gate.
//   animusStage    ANIMUS Jobs: sources -> router (classifies into lanes) -> verifier -> board or archive.
//   tenglishStage  Tenglish-LM: caption stream -> noise filter -> scene slicer -> corpus -> small LM (in progress).
// Each loop plays continuously; the step band under the stage lights in sync (activeStep).
// Reduced motion shows one still, fully labelled frame per system.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { activeStep } from './layout.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LOGO = { claude: '/media/logos/claude.svg', codex: '/media/logos/codex.svg', antigravity: '/media/logos/antigravity.svg', meshy: '/media/logos/meshy.svg', blender: '/media/logos/blender.svg',
  python: '/media/logos/tools/python.svg', jupyter: '/media/logos/tools/jupyter.svg', colab: '/media/logos/skills/googlecolab.svg', ytdlp: '/media/logos/tools/ytdlp.svg', pytorch: '/media/logos/skills/pytorch.svg' };
export const logo = (k) => `<span class="bd-logo" aria-hidden="true"><img src="${LOGO[k]}" alt="" width="12" height="12"></span>`;

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eout = (x) => 1 - Math.pow(1 - x, 3);
const eback = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2));
const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
const rnd = (j, s) => { const x = Math.sin(j * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// Diagram colours per theme; roles are recoloured on theme change, animated parts read C every frame.
// Lines and the gate use the kit's ink / accent so they read on both backgrounds.
const PAL = {
  dark: { body: 0x4a3b43, idle: 0x75666d, cream: 0xf2ece4, amber: 0xffb36b, ok: 0x84dba5, lane0: 0xffb36b, lane1: 0xff6b6b, lane2: 0xdccfbe, floor: 0xd24a4a },
  light: { body: 0xfdf9f3, idle: 0xc4b6a7, cream: 0x6b5a4e, amber: 0xc46f12, ok: 0x2f8f5b, lane0: 0xc46f12, lane1: 0xb3262b, lane2: 0x4f6b86, floor: 0x8b6f55 },
};

// Shared building blocks for every diagram: theme-aware materials, pods, tracks, packets, gates, pinned tags.
function kit(ctx, stepId) {
  const { THREE, scene, reduceMotion, lowPower } = ctx;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const C = {}, P = {};
  const reg = [];
  const setPal = (pal) => {
    Object.assign(P, PAL[pal.night ? 'dark' : 'light'], { track: pal.ink, gate: pal.accent, accent: pal.accent });
    for (const key in P) (C[key] ||= new THREE.Color()).set(P[key]);
    reg.forEach((r) => r.m.color.set(P[r.role]));
  };
  setPal(ctx.pal);
  const std = (role, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: P[role], roughness: 0.38, metalness: 0.1, transparent: true, ...o }); reg.push({ m, role }); return m; };
  const basic = (role, o = {}) => { const m = new THREE.MeshBasicMaterial({ color: P[role], transparent: true, ...o }); reg.push({ m, role }); return m; };
  const dyn = (o = {}) => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, ...o });
  const geoCache = new Map();
  const rbox = (w, h, d, r = 0.08) => {
    const key = `${w}|${h}|${d}|${r}`;
    if (!geoCache.has(key)) geoCache.set(key, new RoundedBoxGeometry(w, h, d, lowPower ? 2 : 3, r));
    return geoCache.get(key);
  };
  const vec = (p) => (p.isVector3 ? p : V(...p));
  const curve = (...pts) => new THREE.CatmullRomCurve3(pts.map(vec), false, 'centripetal');
  const lineC = (a, b) => new THREE.LineCurve3(vec(a), vec(b));
  const front = V(0, 0, 0.3);
  const mix = (out, a, b, t) => out.copy(a).lerp(b, clamp01(t));

  // Elements with an alpha; labels follow their element.
  const els = [], tags = [];
  const add = (obj, _order, o = {}) => {
    const mats = [];
    obj.traverse((m) => { if (m.material) mats.push({ m: m.material, base: m.material.opacity }); });
    const e = { obj, mats, home: obj.position.clone(), k: 1, alpha: 1, dyn: !!o.dyn };
    els.push(e);
    scene.add(obj);
    return e;
  };
  const elOf = (obj) => els.find((e) => e.obj === obj);
  const tag = (e, html, off, cls = 'bd-up', tagCls = '') => {
    const o = vec(off), p = V(0, 0, 0);
    const t = ctx.tag(`<div class="bd-tag ${tagCls}">${html}</div>`, () => p.copy(e.home).add(o), cls);
    t.tagEl = t.el.firstChild;
    tags.push({ t, e });
    return t;
  };
  const name = (b, i, lg) => `${lg ? logo(lg) : ''}<div><b>${esc(b)}</b>${i ? `<i>${esc(i)}</i>` : ''}</div>`;
  let cur = -2;
  const setStep = (idx) => { if (stepId && cur !== idx) { cur = idx; activeStep(stepId, idx); } };
  const flush = () => {
    for (const e of els) {
      e.obj.visible = e.alpha > 0.004;
      for (const m of e.mats) m.m.opacity = m.base * e.alpha;
    }
    for (const { t, e } of tags) t.show = e.obj.visible;
  };

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
  // A glowing work item with a short trail.
  function packet({ w = 0.3, h = 0.2, d = 0.07, round = true, order = 0.95 } = {}) {
    const geo = round ? new THREE.SphereGeometry(h * 0.5, 16, 12) : rbox(w, h, d, 0.03);
    const mat = dyn();
    const core = new THREE.Mesh(geo, mat);
    const grp = new THREE.Group();
    grp.add(core);
    const e = add(grp, order, { dyn: true });
    const n = reduceMotion ? 0 : lowPower ? 2 : 4;
    const trail = [...Array(n)].map((_, i) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      m.visible = false;
      scene.add(m);
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
          t.m.visible = hp.distanceToSquared(pos) > 4e-4 && alpha > 0.02;
          if (!t.m.visible) return;
          t.m.position.copy(hp);
          t.m.material.color.copy(col);
          t.m.material.opacity = t.op * alpha;
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

  // Soft ground glow and a warm fill light.
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
  const theme = (pal) => { setPal(pal); fill.intensity = pal.night ? 6 : 1.5; floor.material.opacity = pal.night ? 0.22 : 0.32; };
  theme(ctx.pal);

  return { THREE, V, C, P, reduceMotion, lowPower, front, mix, add, elOf, tag, name, setStep, flush, theme, std, basic, dyn, rbox, vec, curve, lineC, pod, track, gateRing, check, cross, packet, progressRing, setRing, esc, seg, eio, eout, eback, bump, rnd, clamp01 };
}


// ════════ Intro: the loop every system shares ════════
function heroBody(k) {
  const { THREE, V, C, P, reduceMotion, lowPower, front, mix, add, elOf, tag, name, setStep, std, basic, dyn, rbox, curve, lineC, pod, track, gateRing, check, cross, packet, progressRing, setRing, esc, seg, eio, eout, eback, bump, rnd, clamp01 } = k;
    const ell = new THREE.CatmullRomCurve3([...Array(64)].map((_, i) => { const a = (i / 64) * Math.PI * 2; return V(Math.cos(a) * 3.5, 0, Math.sin(a) * 1.75); }), true);
    add(track(ell, 0.02, 0.18), 0);
    const HS = [['AGENTS.md', 'rules every agent follows'], ['Agents', 'propose in dated sessions'], ['Evidence', 'hashes, logs, reports'], ['You', 'accept or send back']];
    const HU0 = 0.375;
    const heroSt = HS.map(([n, d], i) => {
      const p = pod(1.3, 0.5);
      p.grp.position.copy(ell.getPointAt((HU0 + i * 0.25) % 1)).add(V(0, 0.3, 0));
      const e = add(p.grp, 0.15 + i * 0.15);
      tag(e, name(n, d), [0, 0.42, 0]);
      return p;
    });
    const hgU = 0.07;
    const heroGate = gateRing(0.36);
    heroGate.position.copy(ell.getPointAt(hgU));
    heroGate.lookAt(heroGate.position.clone().add(ell.getTangentAt(hgU)));
    add(heroGate, 0.8);
    const heroPk = packet({ h: 0.24 });
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
  return updateHero;
}

// ════════ Kage game crew: queue -> build in a worktree -> peer review -> human merge ════════
function kageBody(k) {
  const { THREE, V, C, P, reduceMotion, lowPower, front, mix, add, elOf, tag, name, setStep, std, basic, dyn, rbox, curve, lineC, pod, track, gateRing, check, cross, packet, progressRing, setRing, esc, seg, eio, eout, eback, bump, rnd, clamp01 } = k;
    const KB = V(-3.9, 0.35, 0), KA = V(-1.25, 1.55, -0.35), KC = V(-1.25, -0.7, 0.45), KR = V(1.2, 0.42, 0), KG = V(2.7, 0.42, 0), KM = V(3.65, -1.95, 0);
    const kLanes = [
      [curve(KB, [-2.7, 1.35, -0.2], KA), curve(KA, [0.05, 1.35, -0.2], KR)],
      [curve(KB, [-2.7, -0.55, 0.25], KC), curve(KC, [0.05, -0.45, 0.25], KR)],
    ];
    const kRG = lineC(KR, KG), kGM = curve(KG, [3.5, -0.2, 0], KM);
    const kLaneE = kLanes.map(([a, b], i) => { const e = add(track(a), 0.3 + i * 0.05); add(track(b), 0.45 + i * 0.05); return e; });
    add(track(kRG), 0.55);
    add(track(kGM), 0.6);
    const kMainE = add(track(lineC([-4.6, -1.95, 0], [4.6, -1.95, 0]), 0.045, 0.4), 0.05);
    tag(kMainE, '<b>main</b>', [-4.3, -1.78, 0], 'bd-up', 'bd-plain');
    tag(kLaneE[0], '<b>worktree · feat/engine</b>', [-2.75, 1.62, -0.25], 'bd-up', 'bd-plain');
    tag(kLaneE[1], '<b>worktree · feat/combat</b>', [-2.75, -0.8, 0.3], 'bd-down', 'bd-plain');
    const kBoard = pod(1.2, 0.6); kBoard.grp.position.copy(KB);
    tag(add(kBoard.grp, 0.1), name('./crew', 'task board'), [0, 0.45, 0]);
    const kBuild = [[KA, 'Claude Code', 'engine, shaders', 'claude'], [KC, 'Codex', 'gameplay, physics', 'codex']].map(([p, n, d, lg], i) => {
      const b = pod(1.45, 0.55); b.grp.position.copy(p);
      tag(add(b.grp, 0.25 + i * 0.1), name(n, d, lg), [0, 0.42, 0]);
      return b;
    });
    const kRev = pod(1.45, 0.55); kRev.grp.position.copy(KR);
    tag(add(kRev.grp, 0.5), name('Antigravity', 'peer review, tests', 'antigravity'), [0, 0.42, 0]);
    const kGate = gateRing(0.4); kGate.position.copy(KG); kGate.rotation.y = Math.PI / 2;
    tag(add(kGate, 0.65), name('You', 'merge gate'), [0, -0.55, 0], 'bd-down');
    const kCheck = check(); kCheck.position.set(KG.x + 0.62, KG.y + 0.02, 0.1); add(kCheck, 1, { dyn: true });
    const kRing = progressRing(0.3); add(kRing, 1, { dyn: true });
    const kScan = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 40), dyn()); kScan.rotation.x = Math.PI / 2; add(kScan, 1, { dyn: true });
    const kItem = packet({ round: false, w: 0.34, h: 0.24, d: 0.08 });
    const KCOMMITS = 11, KSP = 0.78;
    const kCommits = [...Array(KCOMMITS)].map(() => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20), dyn());
      m.rotation.x = Math.PI / 2;
      return { m, e: add(m, 0.15, { dyn: true }) };
    });
    const KAGE_T = 9;
    const kCol = new THREE.Color();

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
      kRing.visible = u > 0.29 && u < 0.47;
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
      kScan.visible = scan > 0 && scan < 1;
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
      kCheck.visible = ck > 0.01;
      // Commits slide left along main as each merge lands.
      const sh = eio(seg(u, 0.88, 0.97));
      kCommits.forEach(({ m, e }, k) => {
        const x = KM.x - KSP * (k - 1 + sh);
        m.position.set(x, KM.y, 0);
        e.alpha = k === 0 ? sh : clamp01((x + 4.4) / 0.8);
        m.material.color.copy(k <= 1 ? C.ok : C.idle);
      });
      setStep(u < 0.12 ? 0 : u < 0.46 ? 1 : u < 0.7 ? 2 : 3);
    }
  return updateKage;
}

// ════════ VeriTomiX Office: founder -> Atlas -> heads (+ specialists) -> approval gate ════════
function officeBody(k) {
  const { THREE, V, C, P, reduceMotion, lowPower, front, mix, add, elOf, tag, name, setStep, std, basic, dyn, rbox, curve, lineC, pod, track, gateRing, check, cross, packet, progressRing, setRing, esc, seg, eio, eout, eback, bump, rnd, clamp01 } = k;
    const OF = V(0, 3.25, 0), OA = V(0, 1.3, 0), OG = V(1.5, 2.3, 0), OL = V(2.75, 3.25, 0);
    const oF = pod(1.35, 0.5); oF.grp.position.copy(OF);
    tag(add(oF.grp, 0), name('Founder', 'sets priorities, approves'), [-0.8, 0, 0], 'bd-left');
    const oGate = gateRing(0.36); oGate.position.copy(OG); oGate.rotation.x = Math.PI / 2;
    tag(add(oGate, 0.12), name('Approval gate', 'nothing ships unsigned'), [0.5, 0, 0], 'bd-right');
    const oA = pod(1.55, 0.56); oA.grp.position.copy(OA);
    tag(add(oA.grp, 0.22), name('Atlas', 'coordinator', 'codex'), [-0.9, 0, 0], 'bd-left');
    const oL = pod(1.0, 0.42); oL.grp.position.copy(OL);
    tag(add(oL.grp, 0.95), name('Audit ledger', 'every action logged'), [0, 0.34, 0], 'bd-up');
    const oReq = curve(OF.clone().add(V(-0.45, -0.25, 0)), [-1.0, 2.3, 0], OA.clone().add(V(-0.45, 0.28, 0)));
    const oRet = curve(OA.clone().add(V(0.55, 0.28, 0)), [1.35, 1.7, 0], OG, [1.3, 2.95, 0], OF.clone().add(V(0.55, -0.1, 0)));
    add(track(oReq), 0.18);
    add(track(oRet), 0.2);
    const HEADS = [['Mira', 'R&D'], ['Noah', 'Phantoms'], ['Ada', 'Product'], ['Lina', 'Clinical'], ['Leo', 'Partners'], ['Iris', 'IP & Ops'], ['Finn', 'Finance']];
    const oHeads = HEADS.map(([n, d], i) => {
      const hp = V((i - 3) * 1.3, -0.85, 0.35 - 0.11 * (i - 3) * (i - 3));
      const h = pod(0.98, 0.42, 0.24); h.grp.position.copy(hp);
      tag(add(h.grp, 0.35 + i * 0.05), name(n, d), [0, 0.32, 0], 'bd-up', 'bd-sm');
      const sp = V(hp.x, -2.2, hp.z);
      const spec = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), std('body', { emissive: P.ok, emissiveIntensity: 0.25 }));
      spec.position.copy(sp);
      add(spec, 0.7 + i * 0.03);
      add(track(lineC(hp.clone().add(V(0, -0.22, 0)), sp), 0.012, 0.18), 0.7 + i * 0.03);
      const disp = curve(OA.clone().add(V(0, -0.3, 0)), [hp.x * 0.5, 0.35, hp.z * 0.5], hp.clone().add(V(0, 0.22, 0)));
      add(track(disp, 0.016, 0.18), 0.32 + i * 0.04);
      const pk = packet({ h: 0.17 });
      const ping = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), dyn());
      const pe = add(ping, 1, { dyn: true });
      return { h, hp, sp, disp, pk, ping, pe, spec };
    });
    tag(elOf(oHeads[3].spec), '<b>Local specialists · Llama 3.2</b>', [0, -0.3, 0], 'bd-down', 'bd-plain');
    tag(elOf(oA.grp), '<b>7 department heads</b><i>Gemini CLI · Codex for R&amp;D</i>', [0.95, -0.05, 0], 'bd-right', 'bd-plain');
    const oPk = packet({ h: 0.24 });
    const oCheck = check(); oCheck.position.copy(OG).add(V(0.62, 0.0, 0.1)); add(oCheck, 1, { dyn: true });
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
      oCheck.visible = ck > 0.01;
      mix(oL.strip.material.color, C.idle, C.ok, reduceMotion ? 1 : bump(u, 0.82, 0.96));
      setStep(u < 0.12 ? 0 : u < 0.3 ? 1 : u < 0.52 ? 2 : u < 0.68 ? 3 : 4);
    }
  return updateOffice;
}

// ════════ ANIMUS Jobs: sources -> router -> lanes -> verifier -> board or archive ════════
function animusBody(k) {
  const { THREE, V, C, P, reduceMotion, lowPower, front, mix, add, elOf, tag, name, setStep, std, basic, dyn, rbox, curve, lineC, pod, track, gateRing, check, cross, packet, progressRing, setRing, esc, seg, eio, eout, eback, bump, rnd, clamp01 } = k;
    const SRC = [['Job APIs, boards', 1.35], ['EU calls, OpenAlex', 0], ['Web radar, alerts', -1.35]];
    const aSrc = SRC.map(([n, y], i) => {
      const p = pod(1.35, 0.44); p.grp.position.set(-4.0, y, 0);
      tag(add(p.grp, i * 0.06), `<b>${esc(n)}</b>`, [0, 0.32, 0]);
      return p;
    });
    const AR = V(-1.45, 0, 0);
    const router = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.95, 6), std('body', { flatShading: true }));
    router.position.copy(AR);
    tag(add(router, 0.2), name('Router', 'sorts by type'), [0, -0.72, 0], 'bd-down');
    const rRing = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.035, 8, 48), std('gate', { emissive: P.gate, emissiveIntensity: 0.3 }));
    rRing.position.copy(AR); rRing.rotation.x = Math.PI / 2;
    add(rRing, 0.22);
    const LANES = [['Industry', 1.35, 'lane0'], ['Academic', 0, 'lane1'], ['Fellowships', -1.35, 'lane2']];
    const AV = 1.3, ABX = 3.75;
    const aIn = aSrc.map((p) => curve(p.grp.position.clone().add(V(0.7, 0, 0)), [-2.5, p.grp.position.y * 0.45, 0], AR.clone().add(V(-0.5, 0, 0))));
    aIn.forEach((c, i) => add(track(c, 0.016, 0.18), 0.12 + i * 0.03));
    const aLane = LANES.map(([n, y, key], i) => {
      const a = curve(AR.clone().add(V(0.5, 0, 0)), [-0.35, y * 0.75, 0], [0.4, y, 0], [AV, y, 0]);
      const b = lineC([AV, y, 0], [ABX - 0.5, y, 0]);
      add(track(a, 0.018, 0.24), 0.3 + i * 0.05);
      add(track(b, 0.018, 0.24), 0.5 + i * 0.05);
      const g = gateRing(0.3); g.position.set(AV, y, 0); g.rotation.y = Math.PI / 2;
      const ge = add(g, 0.45 + i * 0.05);
      tag(ge, `<b>${esc(n)}</b>`, [-0.95, 0.18, 0], 'bd-up', 'bd-plain');
      const ok = check(); ok.position.set(AV + 0.55, y + 0.05, 0.1); add(ok, 1, { dyn: true });
      const no = cross(); no.position.set(AV + 0.55, y + 0.05, 0.1); add(no, 1, { dyn: true });
      const drop = curve([AV, y, 0], [AV + 0.35, y - 0.55, 0.15], [AV + 0.4, -2.55, 0.1]);
      return { y, key, a, b, g, ok, no, drop };
    });
    tag(elOf(aLane[0].g), name('Verifier', 'Claude or Codex opens each link'), [0, 0.4, 0], 'bd-up');
    const aBoard = pod(0.9, 3.9, 0.3); aBoard.grp.position.set(ABX, 0, 0);
    tag(add(aBoard.grp, 0.7), name('Your board', 'swipe to triage'), [0, 2.1, 0], 'bd-up');
    const aBin = new THREE.Mesh(rbox(1.2, 0.36, 0.6, 0.08), std('body'));
    aBin.position.set(AV + 0.4, -2.75, 0);
    tag(add(aBin, 0.8), name('Archive', 'dead, duplicate, expired'), [0.7, 0, 0], 'bd-right');
    // Model route with fallback: one family is active; on a limit the route falls through to the next.
    const MODELS = ['Claude', 'Codex', 'Gemini', 'API'];
    const chipX = (i) => -3.2 + i * 1.3;
    const aChips = MODELS.map((n, i) => {
      const p = pod(0.86, 0.3, 0.16); p.grp.position.set(chipX(i), 2.75, 0);
      const l = tag(add(p.grp, 0.85 + i * 0.03), `<b>${esc(n)}</b>`, [0, 0, 0.1], 'bd-mid', 'bd-chip');
      return { p, l, on: false };
    });
    tag(elOf(aChips[0].p.grp), '<b>Model route · falls through on limits</b>', [-0.43, 0.3, 0], 'bd-upr', 'bd-plain');
    const aMarker = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), dyn());
    add(aMarker, 0.95, { dyn: true });
    add(track(curve([-1.5, 2.55, 0], [-1.45, 1.3, 0], AR.clone().add(V(0, 0.5, 0))), 0.012, 0.16), 0.9);
    const AS = 0.85, AL = 6.4, AN = Math.ceil(AL / AS) + 1;
    const aItems = [...Array(AN)].map(() => packet({ round: false, w: 0.3, h: 0.2, d: 0.06 }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 6, 32), dyn());
    const haloE = add(halo, 1, { dyn: true });
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
        L.ok.visible = !g.fail && pop > 0.01;
        L.ok.material.color.copy(C.ok);
        L.no.scale.setScalar(Math.max(0.001, pop));
        L.no.visible = g.fail && pop > 0.01;
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
        setStep(fi.u < 0.24 ? 0 : fi.u < 0.55 ? 1 : fi.u < 0.68 || fi.fail ? 2 : 3);
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
        if (on !== c.on) { c.on = on; c.l.tagEl.classList.toggle('bd-hot', on); }
      });
    }
  return updateAnimus;
}

// ════════ Tenglish-LM: caption stream -> noise filter -> scene slicer -> corpus -> small LM (in progress) ════════
function tengBody(k) {
  const { THREE, V, C, P, reduceMotion, lowPower, front, mix, add, elOf, tag, name, setStep, std, basic, dyn, rbox, curve, lineC, pod, track, gateRing, check, cross, packet, progressRing, setRing, esc, seg, eio, eout, eback, bump, rnd, clamp01 } = k;
    const TG_S = V(-4.45, 0, 0), TG_F = V(-2.35, 0, 0), TG_C = V(0.1, 0, 0), TG_A = V(2.6, 0.68, 0), TG_B = V(2.6, -0.68, 0), TG_M = V(4.7, 0, 0);
    const tgSrc = pod(1.4, 0.52); tgSrc.grp.position.copy(TG_S);
    tag(add(tgSrc.grp, 0.05), name('Caption stream', 'Telugu captions', 'ytdlp'), [0, -0.45, 0], 'bd-down');
    const tgIn = lineC([TG_S.x + 0.78, 0, 0], [TG_F.x - 0.42, 0, 0]);
    const tgMid = lineC([TG_F.x + 0.42, 0, 0], [TG_C.x - 0.9, 0, 0]);
    const tgDrop = curve([TG_F.x, 0, 0], [TG_F.x + 0.12, -0.7, 0.1], [TG_F.x + 0.1, -1.8, 0.1]);
    const tgToA = curve([TG_C.x + 0.9, 0, 0], [1.6, 0.25, 0], [TG_A.x - 0.62, TG_A.y, 0]);
    const tgToB = curve([TG_C.x + 0.9, 0, 0], [1.6, -0.25, 0], [TG_B.x - 0.62, TG_B.y, 0]);
    const tgFromA = curve([TG_A.x + 0.62, TG_A.y, 0], [3.6, 0.4, 0], [TG_M.x - 0.82, 0.22, 0]);
    const tgFromB = curve([TG_B.x + 0.62, TG_B.y, 0], [3.6, -0.4, 0], [TG_M.x - 0.82, -0.22, 0]);
    [[tgIn, 0.12], [tgMid, 0.3], [tgToA, 0.5], [tgToB, 0.5], [tgFromA, 0.7], [tgFromB, 0.7]].forEach(([c, o]) => add(track(c, 0.018, 0.22), o));
    add(track(tgDrop, 0.014, 0.18), 0.28);
    const tgGate = gateRing(0.4); tgGate.position.copy(TG_F); tgGate.rotation.y = Math.PI / 2;
    tag(add(tgGate, 0.22), name('Noise filter', 'non-dialogue lines'), [-0.6, 1.1, 0]);
    const tgBin = new THREE.Mesh(rbox(1.3, 0.34, 0.6, 0.08), std('body'));
    tgBin.position.set(TG_F.x + 0.1, -2.0, 0);
    tag(add(tgBin, 0.35), name('Dropped', 'not dialogue'), [0.75, 0, 0], 'bd-right');
    const tgSlice = pod(1.5, 0.6); tgSlice.grp.position.copy(TG_C);
    const tgSliceE = add(tgSlice.grp, 0.4);
    tag(tgSliceE, name('Scene slicer', '2 to 4 turns, timestamped'), [0, -0.5, 0], 'bd-down');
    const tgChips = ['emotion', 'dialect'].map((n, i) => tag(tgSliceE, `<b>${n}</b>`, [i ? 0.72 : -0.72, 0.88, 0], 'bd-mid', 'bd-chip'));
    const tgDots = [C.lane0, C.lane1].map((c, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), dyn());
      return { m, c, e: add(m, 1, { dyn: true }), to: V(TG_C.x + (i ? 0.72 : -0.72), 0.62, 0.15), from: V(TG_C.x, 0.1, 0.3) };
    });
    const tgFileA = pod(0.95, 0.42); tgFileA.grp.position.copy(TG_A);
    const tgFileB = pod(0.95, 0.42); tgFileB.grp.position.copy(TG_B);
    const tgFA = add(tgFileA.grp, 0.55), tgFB = add(tgFileB.grp, 0.58);
    tag(tgFA, name('Scene corpus', 'on Google Drive', 'colab'), [0, 0.42, 0]);
    tag(tgFA, '<b>CSV</b>', [0, 0, 0.16], 'bd-mid', 'bd-chip');
    tag(tgFB, '<b>TXT</b>', [0, 0, 0.16], 'bd-mid', 'bd-chip');
    const tgLM = pod(1.4, 1.5, 0.3); tgLM.grp.position.copy(TG_M);
    tag(add(tgLM.grp, 0.75), name('Language model', 'small, QLoRA, in progress', 'pytorch'), [0, -0.95, 0], 'bd-down');
    const tgSpin = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.026, 6, lowPower ? 24 : 40, 4.4), dyn());
    tgSpin.position.set(TG_M.x, 0.05, 0.3);
    add(tgSpin, 1, { dyn: true });
    const TG_T0 = [0.02, 0.07, 0.12, 0.17], TG_SLOT = [0, 1, -1, 2];
    const tgSlots = [-0.4, 0, 0.4].map((x) => V(TG_C.x + x, -0.02, 0.34));
    const tgCap = TG_T0.map(() => packet({ round: false, w: 0.3, h: 0.2, d: 0.06 }));
    const tgScene = packet({ round: false, w: 0.7, h: 0.3, d: 0.08 });
    const tgOut = [0, 1].map(() => packet({ round: false, w: 0.3, h: 0.2, d: 0.06 }));
    const TENG_T = 10, tgCol = new THREE.Color(), tgV = V(0, 0, 0);

    function updateTeng(time) {
      const u = reduceMotion ? 0.79 : (time / TENG_T) % 1;
      // Caption lines flow to the filter; non-dialogue drops out, the rest gathers at the slicer.
      let flash = 0, bad = false;
      tgCap.forEach((pk, i) => {
        const t0 = TG_T0[i], tf = t0 + 0.14;
        let pos, col = C.cream, al = 1, sc = 1;
        if (u < t0) { pos = tgIn.getPoint(0); al = 0; }
        else if (u < tf) { pos = tgIn.getPoint(eio(seg(u, t0, tf))); al = seg(u, t0, t0 + 0.02); }
        else if (i === 2) {
          pos = tgDrop.getPoint(eio(seg(u, tf, tf + 0.12)));
          col = mix(tgCol, C.cream, C.idle, seg(u, tf, tf + 0.04));
          al = 1 - seg(u, tf + 0.09, tf + 0.13);
        } else {
          const ts = tf + 0.02, ta = ts + 0.13;
          col = C.amber;
          if (u < ts) { pos = tgIn.getPoint(1); col = mix(tgCol, C.cream, C.amber, seg(u, tf, ts)); }
          else if (u < ta) pos = tgMid.getPoint(eio(seg(u, ts, ta)));
          else { pos = tgV.lerpVectors(tgMid.getPoint(1), tgSlots[TG_SLOT[i]], eio(seg(u, ta, ta + 0.03))); sc = 1 - eout(seg(u, 0.48, 0.52)); }
        }
        pk.set(pos, col, al, sc);
        const f = bump(u, tf - 0.03, tf + 0.05);
        if (f > flash) { flash = f; bad = i === 2; }
      });
      tgGate.material.emissive.copy(bad ? C.accent : C.ok);
      tgGate.material.emissiveIntensity = 0.2 + 1.6 * flash;
      // The kept lines merge into one scene, which gets an emotion and a dialect tag.
      let sp, sCol = C.amber, sa = 0, ss = 1;
      sp = tgV.copy(TG_C).add(front);
      if (u >= 0.5) {
        sa = 1; ss = eback(seg(u, 0.5, 0.54));
        sCol = mix(tgCol, C.amber, C.lane0, seg(u, 0.54, 0.62));
        if (u > 0.66) { const f = eio(seg(u, 0.66, 0.7)); sa = 1 - f; ss = 1 - 0.5 * f; }
      }
      tgScene.set(sp, sCol, sa, ss);
      const tagged = reduceMotion || (u > 0.54 && u < 0.82);
      tgChips.forEach((c, i) => {
        if (tagged !== c.on) { c.on = tagged; c.tagEl.classList.toggle('bd-hot', tagged); }
        const d = tgDots[i];
        d.m.position.lerpVectors(d.from, d.to, reduceMotion ? 1 : eio(seg(u, 0.54 + i * 0.02, 0.6 + i * 0.02)));
        d.m.material.color.copy(d.c);
        d.e.alpha = reduceMotion ? 1 : seg(u, 0.54, 0.56) * (1 - seg(u, 0.8, 0.84));
      });
      // The scene is written to CSV and TXT, then both feed the training stage.
      tgOut.forEach((pk, k) => {
        const cin = k ? tgToB : tgToA, cout = k ? tgFromB : tgFromA;
        let pos, al = 1;
        if (u < 0.66) { pos = cin.getPoint(0); al = 0; }
        else if (u < 0.76) { pos = cin.getPoint(eio(seg(u, 0.66, 0.76))); al = seg(u, 0.66, 0.68); }
        else if (u < 0.82) pos = cin.getPoint(1);
        else if (u < 0.95) { pos = cout.getPoint(eio(seg(u, 0.82, 0.95))); al = 1 - seg(u, 0.93, 0.97); }
        else { pos = cout.getPoint(1); al = 0; }
        pk.set(pos, C.amber, al, 1);
      });
      mix(tgSrc.strip.material.color, C.idle, C.amber, bump(u, 0.02, 0.3));
      mix(tgSlice.strip.material.color, C.idle, C.amber, bump(u, 0.3, 0.64));
      [tgFileA, tgFileB].forEach((f) => mix(f.strip.material.color, C.idle, C.ok, seg(u, 0.74, 0.78) * (1 - seg(u, 0.96, 1))));
      // Training is not finished: the model stays amber with a slow spinner, never a green check.
      mix(tgLM.strip.material.color, C.idle, C.amber, reduceMotion ? 0.8 : 0.35 + 0.65 * bump(u, 0.8, 1));
      tgSpin.rotation.z = reduceMotion ? 0.6 : -time * 1.4;
      tgSpin.material.color.copy(C.amber);
      setStep(u < 0.12 ? 0 : u < 0.4 ? 1 : u < 0.68 ? 2 : u < 0.82 ? 3 : 4);
    }
  return updateTeng;
}

const FR = {
  hero: { c: [0, 0.1, 0], dir: [0.05, 0.42, 1], w: 9.0, h: 4.8 },
  kage: { c: [0, -0.15, 0], dir: [-0.2, 0.16, 1], w: 10.4, h: 6.0 },
  office: { c: [0, 0.1, 0], dir: [0.08, 0.26, 1], w: 10.2, h: 7.8 },
  animus: { c: [0, 0, 0], dir: [-0.14, 0.1, 1], w: 10.4, h: 7.4 },
  teng: { c: [0.1, -0.65, 0], dir: [-0.1, 0.16, 1], w: 12.6, h: 6.4 },
};
const make = (id, body, stepId) => (ctx) => {
  const k = kit(ctx, stepId);
  const update = body(k);
  const f = FR[id];
  ctx.view = { c: k.V(...f.c), dir: k.V(...f.dir).normalize(), w: f.w, h: f.h };
  return { theme: k.theme, update(t) { update(Math.max(0, t)); k.flush(); } }; // t can be slightly negative on the first frame
};
export const heroStage = make('hero', heroBody);
export const kageStage = make('kage', kageBody, 'kage');
export const officeStage = make('office', officeBody, 'office');
export const animusStage = make('animus', animusBody, 'animus');
export const tenglishStage = make('teng', tengBody, 'tenglish');

// 3D parts of the PhD page, split into the stages that use them (layout.js stage builders):
//   heroStage   the PET/CT scanner; the porous phantom lies on the bed and slides into the bore.
//   studyStage  one stage beside the five-study journey; the selected study picks the part shown:
//               1 phantom assembling, 2 scan + digital twin, 3 one design shared with two hospitals,
//               4 heterogeneous targets, 5 printed lesions vs the same shapes in a patient.
import { onTab } from './layout.js';

const SCAN_YAW = 0.75; // three-quarter view: the bore opening and bed face the camera
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => x * x * (3 - 2 * x);

// Materials that follow the theme: lines and faint faces use the theme ink, so they read on both backgrounds.
function themed(THREE) {
  const ink = [], soft = [], acc = [];
  return {
    ink(m) { ink.push(m); return m; }, soft(m) { soft.push(m); return m; }, acc(m) { acc.push(m); return m; },
    apply(pal) { ink.forEach((m) => m.color.set(pal.ink)); soft.forEach((m) => m.color.set(pal.inkSoft)); acc.forEach((m) => m.color.set(pal.accent)); },
  };
}
const show = (o, v, base = 1) => { o.visible = v > 0.01; o.scale.setScalar(Math.max(0.001, v) * base); };

// Porous phantom: 27 cubes (faces, edges, solidity lattice) in a cylinder, a target inside each that can grow
// nested regions (active rim, partial uptake, necrotic core).
function makePhantom(THREE, T) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const SOLID = [0.5, 0.6, 0.7];
  const cubeGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
  const edgeGeo = new THREE.EdgesGeometry(cubeGeo);
  const latticeGeos = [2, 3, 4].map((k) => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.1, 1.1, 1.1, k, k, k)));
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  const group = new THREE.Group();
  const cyl = new THREE.CylinderGeometry(3.3, 3.3, 4.4, 64, 1, true);
  const shell = T.ink(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }));
  group.add(new THREE.Mesh(cyl, shell), new THREE.LineSegments(new THREE.EdgesGeometry(cyl), T.acc(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.4 }))));
  const faceM = T.soft(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.1, depthWrite: false }));
  const edgeM = T.ink(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }));
  const latM = T.soft(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.16 }));
  const cubes = [];
  for (let layer = 0; layer < 3; layer++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
    const si = (x + layer) % 3, k = cubes.length;
    const c = new THREE.Group();
    c.add(new THREE.Mesh(cubeGeo, faceM), new THREE.LineSegments(edgeGeo, edgeM), new THREE.LineSegments(latticeGeos[si], latM));
    const r = 0.2 + 0.07 * z;
    const hot = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0, depthWrite: false }));
    const mid = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0.85 }));
    const core = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x1e1216 }));
    hot.scale.setScalar(r);
    c.add(hot, mid, core);
    const home = V((x - 1) * 1.45, (layer - 1) * 1.35, (z - 1) * 1.45);
    const scatter = home.clone().multiplyScalar(2.2).add(V(1.2 + Math.abs(Math.sin(k * 7.1)) * 1.2, Math.cos(k * 3.3) * 1.3, Math.sin(k * 1.7) - 2));
    const pattern = k % 9; // nine heterogeneity patterns: share of partial uptake and necrotic core
    c.userData = { home, scatter, hot, mid, core, r, contrast: [2, 2.5, 3.33][si] / 3.33, midF: 0.35 + pattern * 0.06, coreF: pattern < 2 ? 0 : 0.15 + (pattern - 2) * 0.08 };
    group.add(c);
    cubes.push(c);
  }
  return {
    group, cubes,
    set(assembled, glow, het) {
      for (const c of cubes) {
        const u = c.userData;
        c.position.lerpVectors(u.scatter, u.home, assembled);
        u.hot.material.opacity = glow * (0.35 + u.contrast * 0.65) * (1 - het * 0.45);
        u.hot.scale.setScalar(u.r * (1 + het * 0.35));
        show(u.mid, het, u.r * u.midF * 1.35);
        show(u.core, het * (u.coreF ? 1 : 0), u.r * u.coreF * 1.35);
      }
    },
  };
}

// PET/CT scanner: gantry with the bore along x, bed and pedestal, two glowing detector rings.
function makeScanner(THREE) {
  const g = new THREE.Group();
  g.rotation.y = SCAN_YAW;
  const housing = new THREE.MeshStandardMaterial({ color: 0xe4ded6, roughness: 0.45, metalness: 0.05 });
  const boreMat = new THREE.MeshStandardMaterial({ color: 0x2a2630, roughness: 0.7, side: THREE.BackSide });
  const gantry = new THREE.Group();
  gantry.rotation.z = Math.PI / 2;
  gantry.add(new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 1.9, 64, 1, true), housing));
  gantry.add(new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 1.9, 64, 1, true), boreMat));
  [-0.95, 0.95].forEach((y) => {
    const cap = new THREE.Mesh(new THREE.RingGeometry(2.25, 3.3, 64), housing);
    cap.rotation.x = Math.PI / 2; cap.position.y = y;
    gantry.add(cap);
  });
  const det = new THREE.MeshBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.4 });
  [-0.97, 0.97].forEach((y) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.045, 8, 96), det);
    ring.rotation.x = Math.PI / 2; ring.position.y = y;
    gantry.add(ring);
  });
  g.add(gantry);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(10, 0.16, 1.5), new THREE.MeshStandardMaterial({ color: 0x3a343c, roughness: 0.5 }));
  bed.position.set(-1.4, -1.5, 0);
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 1.2), housing);
  pedestal.position.set(-4.2, -2.5, 0);
  g.add(bed, pedestal);
  return { group: g, det };
}

// The phantom lying on the bed: slide 0 = on the bed outside, 1 = inside the bore.
function placeOnBed(THREE, phantom, slide, onBed, spin, tmp) {
  phantom.position.copy(tmp.set((-4.2 + 4.2 * slide) * onBed, 0.25 * onBed, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, SCAN_YAW * onBed));
  phantom.rotation.set(0, spin * (1 - onBed) + SCAN_YAW * onBed, (Math.PI / 2) * onBed);
}

// ── Hero: scanner and phantom. The phantom slides into the bore and is scanned, on a slow loop.
export function heroStage(ctx) {
  const { THREE, scene, reduceMotion, tag } = ctx;
  const T = themed(THREE), tmp = new THREE.Vector3(), lp = new THREE.Vector3();
  const scanner = makeScanner(THREE);
  const ph = makePhantom(THREE, T);
  scene.add(scanner.group, ph.group);
  ph.set(1, 0.7, 0);
  const label = tag('<b>PET/CT scanner</b><span>GE Discovery MI</span>', () => lp.set(0, 3.9, 0));
  ctx.view = { c: new THREE.Vector3(-0.9, -0.4, 0), w: 12.5, h: 8.6, dir: new THREE.Vector3(0.12, 0.26, 1) };
  return {
    theme: (pal) => T.apply(pal),
    update(t) {
      const L = 16, u = reduceMotion ? 0.5 : (t % L) / L; // out, slide in, scan, slide out
      const slide = reduceMotion ? 0.55 : u < 0.15 ? 0 : u < 0.35 ? smooth((u - 0.15) / 0.2) : u < 0.75 ? 1 : u < 0.92 ? 1 - smooth((u - 0.75) / 0.17) : 0;
      placeOnBed(THREE, ph.group, slide, 1, 0, tmp);
      ph.group.scale.setScalar(0.5);
      const inside = clamp01((slide - 0.75) * 4);
      scanner.det.opacity = 0.25 + inside * (0.5 + 0.25 * Math.abs(Math.sin(t * 6)));
      ph.set(1, 0.45 + inside * 0.55, 0);
      label.show = true;
    },
  };
}

// ── Study stage: the selected study picks the part; the camera eases between the parts.
export function studyStage(ctx) {
  const { THREE, scene, reduceMotion, tag } = ctx;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const T = themed(THREE), tmp = V(0, 0, 0);
  const ph = makePhantom(THREE, T);
  const scanner = makeScanner(THREE);
  scene.add(ph.group, scanner.group);

  // Study 2: digital twin (point cloud) and the data stream from the scanner.
  const twin = new THREE.Group();
  const twinPts = [], twinHot = [];
  ph.cubes.forEach((c) => {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) for (let l = 0; l < 5; l++) {
      const p = V((i - 2) * 0.27, (j - 2) * 0.27, (l - 2) * 0.27);
      (p.length() < c.userData.r * 1.25 ? twinHot : twinPts).push(p.add(c.userData.home));
    }
  });
  const twinMat = T.ink(new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.5, depthWrite: false }));
  const twinHotMat = new THREE.PointsMaterial({ color: 0xff6a4a, size: 0.11, transparent: true, opacity: 0.95, depthWrite: false });
  twin.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(twinPts), twinMat), new THREE.Points(new THREE.BufferGeometry().setFromPoints(twinHot), twinHotMat));
  twin.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(3.3, 3.3, 4.4, 64, 1, true)), new THREE.LineBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.4 })));
  twin.position.set(4.6, 0.7, -1.4);
  scene.add(twin);
  const STREAM = 140, streamPos = new Float32Array(STREAM * 3);
  const streamGeo = new THREE.BufferGeometry();
  streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
  const streamMat = new THREE.PointsMaterial({ color: 0xff8a5a, size: 0.09, transparent: true, opacity: 0, depthWrite: false });
  const stream = new THREE.Points(streamGeo, streamMat);
  stream.frustumCulled = false;
  scene.add(stream);

  // Study 3: one design file shared with two facilities, each printing its own phantom.
  const miniPhantom = () => {
    const g = new THREE.Group();
    const c2 = new THREE.CylinderGeometry(1.1, 1.1, 1.4, 40, 1, true);
    g.add(new THREE.Mesh(c2, T.ink(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }))));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(c2), T.acc(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }))));
    for (let i = 0; i < 9; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), T.soft(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.45 })));
      b.position.set(((i % 3) - 1) * 0.48, 0, (Math.floor(i / 3) - 1) * 0.48);
      b.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff5a3c })));
      g.add(b);
    }
    return g;
  };
  const hospital = () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 1.8), new THREE.MeshStandardMaterial({ color: 0x3a3038, roughness: 0.7 }));
    body.position.y = 0.8;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.9, 4), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.6 }));
    roof.position.y = 2.05; roof.rotation.y = Math.PI / 4;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshBasicMaterial({ color: 0xffb36b }));
    win.position.set(0, 1, 0.91);
    const mini = miniPhantom();
    mini.position.set(0, -0.1, 2.1);
    g.add(body, roof, win, mini);
    g.userData.mini = mini;
    return g;
  };
  const share = new THREE.Group();
  scene.add(share);
  const docMat = new THREE.MeshBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
  const design = new THREE.Group();
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), docMat);
  for (let l = 0; l < 6; l++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(l ? 1 : 0.7, l ? 0.05 : 0.12), new THREE.MeshBasicMaterial({ color: l ? 0x6a6068 : 0x8b1a1a }));
    line.position.set(l ? 0 : -0.15, 0.6 - l * 0.24, 0.01);
    doc.add(line);
  }
  design.add(doc);
  design.position.set(0.2, 2.6, 0);
  share.add(design);
  const designTag = tag('<b>Shared design file</b><span>STL + protocol</span>', () => design.getWorldPosition(tmp).add(V(0, 1.3, 0)));
  const sites = [
    { g: hospital(), at: V(-3.4, -1.6, -1.2), name: 'Facility 1', sub: 'IUCT Oncopole, Toulouse' },
    { g: hospital(), at: V(3.8, -1.6, -1.2), name: 'Facility 2', sub: 'Rambam, Haifa' },
  ];
  sites.forEach((s) => {
    s.g.position.copy(s.at);
    s.g.rotation.y = -s.at.x * 0.08;
    share.add(s.g);
    s.curve = new THREE.QuadraticBezierCurve3(design.position.clone(), V(s.at.x * 0.5, 4.2, -0.4), s.at.clone().add(V(0, 2.6, 0)));
    share.add(new THREE.Mesh(new THREE.TubeGeometry(s.curve, 48, 0.025, 6), new THREE.MeshBasicMaterial({ color: 0xff7a5a, transparent: true, opacity: 0.6 })));
    s.packets = [0, 1, 2].map(() => { const pk = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), docMat); share.add(pk); return pk; });
    const p = V(0, 0, 0);
    s.tag = tag(`<b>${s.name}</b><span>${s.sub}</span>`, () => s.g.getWorldPosition(p).add(V(0, 3.1, 0)));
  });

  // Study 5: printed lesions in a phantom vs the same shapes inside a patient.
  function lesionGeo(i) {
    const g = new THREE.IcosahedronGeometry(1, 5);
    const p = g.attributes.position, v = V(0, 0, 0);
    for (let k = 0; k < p.count; k++) {
      v.fromBufferAttribute(p, k);
      const n = 0.24 * Math.sin(v.x * 2.6 + i * 1.7) * Math.cos(v.y * 2.1 + i) + 0.12 * Math.sin(v.z * 4.3 + i * 2.3) + 0.06 * Math.sin((v.x + v.y) * 7 + i);
      v.multiplyScalar(1 + n);
      v.x *= 1 + (i % 3) * 0.18; v.y *= 1 - (i % 2) * 0.15;
      p.setXYZ(k, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  const lesionGeos = [...Array(8)].map((_, i) => lesionGeo(i));
  const compare = new THREE.Group();
  scene.add(compare);
  const jas = new THREE.Group();
  jas.position.set(-2.7, 0, 0);
  const jc = new THREE.CylinderGeometry(2, 2, 4, 64, 1, true);
  jas.add(new THREE.Mesh(jc, T.ink(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }))));
  jas.add(new THREE.LineSegments(new THREE.EdgesGeometry(jc), T.acc(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 }))));
  const printed = new THREE.MeshStandardMaterial({ color: 0xe8dccb, roughness: 0.8 });
  lesionGeos.forEach((g, i) => {
    const m = new THREE.Mesh(g, printed);
    const a = (i / 8) * Math.PI * 2;
    m.position.set(Math.cos(a) * 1.15, i < 4 ? 0.9 : -0.9, Math.sin(a) * 1.15);
    m.scale.setScalar(0.42);
    jas.add(m);
  });
  compare.add(jas);
  const patient = new THREE.Group();
  patient.position.set(2.5, -0.3, 0);
  const skin = T.ink(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.12, roughness: 0.3, depthWrite: false, side: THREE.DoubleSide }));
  const profile = [[0, -3.4], [1.05, -3.4], [1.35, -2.5], [1.25, -1.2], [1.12, 0], [1.3, 1.1], [1.55, 1.9], [1.35, 2.5], [0.5, 2.85], [0.42, 3.2], [0, 3.25]].map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), skin);
  torso.scale.z = 0.62;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), skin);
  head.position.y = 3.85; head.scale.set(0.85, 1, 0.9);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.LatheGeometry(profile, 16), 30), T.ink(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.16 })));
  outline.scale.z = 0.62;
  patient.add(torso, head, outline);
  [-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 2.8, 8, 16), skin);
    arm.position.set(s * 1.85, 0.9, 0); arm.rotation.z = s * 0.12;
    const lung = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), new THREE.MeshStandardMaterial({ color: 0xd27a7a, transparent: true, opacity: 0.14, depthWrite: false }));
    lung.position.set(s * 0.55, 1.5, 0); lung.scale.set(0.9, 1.5, 0.8);
    patient.add(arm, lung);
  });
  const liver = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 16), new THREE.MeshStandardMaterial({ color: 0x9a4a3a, transparent: true, opacity: 0.2, depthWrite: false }));
  liver.position.set(-0.45, 0.2, 0.1); liver.scale.set(1.2, 0.6, 0.7);
  patient.add(liver);
  const SITES = [[-0.5, 1.7, 0.1], [0.6, 1.3, 0], [-0.55, 0.25, 0.15], [-0.2, 0.05, 0.2], [0.5, -0.4, 0.1], [0, -1.3, 0.2], [-0.5, -2.2, 0.1], [0.55, -2.4, 0]];
  const synthetic = new THREE.MeshStandardMaterial({ color: 0xff6a4a, emissive: 0xd24a2a, emissiveIntensity: 0.7, roughness: 0.4 });
  lesionGeos.forEach((g, i) => {
    const m = new THREE.Mesh(g, synthetic);
    m.position.set(...SITES[i]);
    m.scale.setScalar(0.2);
    patient.add(m);
  });
  compare.add(patient);
  const jp = V(0, 0, 0), pp = V(0, 0, 0);
  const cmpTags = [
    tag('<b>3D-printed inserts</b><span>Physical phantom · OMNI Legend</span>', () => jas.getWorldPosition(jp).add(V(0, 2.9, 0))),
    tag('<b>Same shapes, synthetic</b><span>Healthy-volunteer PET background</span>', () => patient.getWorldPosition(pp).add(V(0, 4.9, 0))),
  ];
  const tp = V(0, 0, 0), sp = V(0, 0, 0);
  const twinTag = tag('<b>Digital twin</b><span>CASSOULET / DUETTO simulation</span>', () => twin.getWorldPosition(tp).add(V(0, 2.8, 0)));
  const physTag = tag('<b>Physical phantom</b><span>Scanned on a GE Discovery MI</span>', () => sp.set(0, 3.9, 0));

  // Camera frame per study (centre, frame width and height, viewing direction).
  const PH = { c: V(0, -0.1, 0), w: 9, h: 7.8, dir: V(0.2, 0.35, 1).normalize() };
  const VIEWS = [
    PH,
    { c: V(0.9, 0, -0.8), w: 14, h: 7.8, dir: V(-0.02, 0.16, 1).normalize() },
    { c: V(0.2, 0.8, -0.4), w: 10.8, h: 7, dir: V(0, 0.2, 1).normalize() },
    PH,
    { c: V(0, 0.4, 0), w: 10.4, h: 9.2, dir: V(0, 0.08, 1).normalize() },
  ];
  ctx.view = { c: VIEWS[0].c.clone(), w: VIEWS[0].w, h: VIEWS[0].h, dir: VIEWS[0].dir.clone() };

  let target = +(document.querySelector('[data-tabs="studies"]')?.dataset.at || 0), cur = target, tSwitch = 0, now = 0;
  onTab('studies', (i) => { target = i; tSwitch = now; });

  return {
    theme: (pal) => T.apply(pal),
    update(t, dt, s) {
      now = t;
      cur = reduceMotion ? target : cur + (target - cur) * (1 - Math.exp(-dt * 4));
      if (Math.abs(target - cur) < 1e-3) cur = target;
      const w = [0, 1, 2, 3, 4].map((k) => clamp01(1 - Math.abs(cur - k)));
      const since = reduceMotion ? 10 : t - tSwitch;
      const i0 = Math.floor(cur), i1 = Math.min(4, i0 + 1), f = smooth(cur - i0);
      const A = VIEWS[i0], B = VIEWS[i1], v = ctx.view;
      v.c.lerpVectors(A.c, B.c, f); v.dir.lerpVectors(A.dir, B.dir, f).normalize();
      v.w = A.w + (B.w - A.w) * f; v.h = A.h + (B.h - A.h) * f;

      // Phantom: assembles as the stage scrolls in (study 1), lies in the scanner (2), grows patterns (4).
      const assembled = target === 0 && !reduceMotion ? smooth(clamp01((s.progress - 0.12) / 0.3)) : 1;
      const onBed = w[1];
      const slide = target === 1 ? smooth(clamp01((since - 0.3) / 1.8)) : 1;
      placeOnBed(THREE, ph.group, slide, onBed, reduceMotion ? 0.5 : t * 0.1 + 0.5, tmp);
      show(ph.group, w[0] + w[1] + w[3], 1 - onBed * 0.5);
      const het = w[3] * (target === 3 ? smooth(clamp01(since / 1.6)) : 1);
      ph.set(assembled, Math.max(w[0] * 0.6, w[1], w[3]), het);

      show(scanner.group, w[1]);
      const inside = w[1] * clamp01((slide - 0.75) * 4);
      scanner.det.opacity = 0.25 + inside * (0.5 + 0.25 * Math.abs(Math.sin(t * 6)));
      show(twin, inside, 0.72);
      twinMat.opacity = 0.5 * inside; twinHotMat.opacity = 0.95 * inside;
      twin.rotation.y = reduceMotion ? 0.5 : t * 0.15;
      twinTag.show = inside > 0.6; physTag.show = w[1] > 0.6;
      streamMat.opacity = inside;
      if (inside > 0.01) {
        for (let i = 0; i < STREAM; i++) {
          const q = (t * 0.35 + i / STREAM) % 1;
          tmp.set(1.0, Math.sin(i * 12.9) * 1.6, -1.2 + Math.cos(i * 7.3) * 1.2).lerp(V(3.2, 0.6 + Math.sin(i * 3.1) * 1.4, -1.2 + Math.cos(i * 5.7)), q);
          tmp.y += Math.sin(q * Math.PI) * 0.8;
          streamPos.set([tmp.x, tmp.y, tmp.z], i * 3);
        }
        streamGeo.attributes.position.needsUpdate = true;
      }

      show(share, w[2]);
      design.rotation.y = Math.sin(t * 0.8) * 0.3;
      designTag.show = w[2] > 0.6;
      sites.forEach((st, si) => {
        st.packets.forEach((pk, j) => {
          const q = (t * 0.4 + j / 3 + si * 0.17) % 1;
          pk.position.copy(st.curve.getPoint(q));
        });
        st.g.userData.mini.rotation.y = t * 0.4;
        st.tag.show = w[2] > 0.6;
      });

      show(compare, w[4], 0.92);
      jas.rotation.y = reduceMotion ? 0 : t * 0.2;
      patient.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.3) * 0.35;
      cmpTags.forEach((l) => (l.show = w[4] > 0.6));
    },
  };
}

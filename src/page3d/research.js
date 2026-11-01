// My PhD thesis in a nutshell: the porous phantom assembles, is scanned and copied into a digital twin,
// its design is shared with two hospitals, its targets turn heterogeneous, and finally printed lesions
// are compared with the same shapes inside a patient.
// Each study has a key figure and an expandable "Know more" with methods, results and limitations.
import thesis from '../../content/thesis.json';
import pubs from '../../content/publications.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const pubLinks = (ids = []) => ids.map((id) => pubs.find((p) => p.id === id)).filter(Boolean)
  .map((p) => `<li>${esc(p.title)} <span class="s-meta">· ${esc(p.venue)}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</span></li>`).join('');
const figure = (f, cls = '') => `<figure class="s-fig ${cls}"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy" decoding="async"><figcaption>${esc(f.caption)}</figcaption></figure>`;
const ch = (n) => thesis.chapters.find((c) => c.n === n);

function study(n) {
  const c = ch(n), m = c.more;
  return `<p class="s-kicker">Study ${n} of 5</p><h2>${esc(c.title)}</h2>
    <p class="s-lede">${esc(c.eli5)}</p><p>${esc(c.detail)}</p>
    ${m?.figures?.[0] ? figure(m.figures[0]) : ''}
    ${m ? `<details class="s-know">
      <summary>Know more <span class="s-meta">methods, results, limitations</span></summary>
      <p class="s-q">${esc(m.question)}</p>
      <h3>Methods</h3>${list(m.methods)}
      <h3>Key results</h3>${list(m.results)}
      ${m.figures.slice(1).map((f) => figure(f)).join('')}
      <h3>Limitations &amp; next steps</h3>${list(m.limitations)}
      ${c.pubs ? `<h3>Published as</h3><ul class="s-list">${pubLinks(c.pubs)}</ul>` : ''}
    </details>` : ''}`;
}

const STEPS = [
  { title: 'In a nutshell', html: `<p class="s-kicker">PhD · ${esc(thesis.university)} · 2023–2026</p>
      <h1>${esc(thesis.nutshell)}</h1>
      <p class="s-lede">${esc(thesis.eli5)}</p>
      <div style="margin: 1.1rem 0; padding: 12px 14px; background: rgba(230,57,70,0.12); border: 1px solid var(--accent); border-radius: 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <b style="color:var(--text); font-size:0.95rem; display:block;">📊 PhD Defense Presentation Slides</b>
            <span style="font-size:0.75rem; color:var(--muted);">Soutenance de Thèse · IUCT Oncopole / Université de Toulouse (18 MB PDF)</span>
          </div>
          <a class="s-more" href="/docs/Soutenance_SaiNalla.pdf" target="_blank" rel="noopener" style="margin-top:0; font-weight:600; background:var(--accent-strong); color:#fff; padding:6px 14px; border-radius:6px; text-decoration:none; display:inline-block;">View Presentation (PDF) ↗</a>
        </div>
      </div>
      <p>${esc(thesis.abstractShort)}</p>
      <p class="s-meta">${esc(thesis.title)}<br>${thesis.labs.map(esc).join(' · ')} · Supervised by ${thesis.supervisors.map(esc).join(' & ')}</p>
      <p class="s-scroll">Scroll through the five studies</p>` },
  ...[1, 2, 3, 4, 5].map((n) => ({ title: ch(n).title, html: study(n) })),
  { title: 'Takeaway', html: `<p class="s-kicker">Takeaway</p><h2>Ground truth you can trust</h2>
      <p class="s-lede">${esc(thesis.takeaway)}</p>
      <a class="s-more" href="/sections/projects.html">What I built next →</a>` },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: 'research',
  build({ THREE, scene, label, reduceMotion }) {
    const root = new THREE.Group();
    root.position.set(3.6, 0, 0);
    scene.add(root);
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const vis = (p, a, w) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / w));
    const show = (o, v, base = 1) => { o.visible = v > 0.01; o.scale.setScalar(Math.max(0.001, v) * base); };

    // ── Phantom: porous cubes (faint faces, edges, solidity lattice) with a target inside each.
    // Each target can grow nested regions for study 4: active rim, partial uptake, necrotic core.
    const SOLID = [0.5, 0.6, 0.7];
    const cubeGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
    const edgeGeo = new THREE.EdgesGeometry(cubeGeo);
    const latticeGeos = [2, 3, 4].map((k) => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.1, 1.1, 1.1, k, k, k)));
    const sphere = new THREE.SphereGeometry(1, 24, 16);
    const phantom = new THREE.Group();
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false });
    const rimMat = new THREE.LineBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.35 });
    const cyl = new THREE.CylinderGeometry(3.3, 3.3, 4.4, 64, 1, true);
    phantom.add(new THREE.Mesh(cyl, shellMat), new THREE.LineSegments(new THREE.EdgesGeometry(cyl), rimMat));
    root.add(phantom);
    const cubes = [];
    for (let layer = 0; layer < 3; layer++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
      const si = (x + layer) % 3, k = cubes.length;
      const c = new THREE.Group();
      c.add(new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial({ color: 0xd9cfbf, transparent: true, opacity: 0.06 + SOLID[si] * 0.08, depthWrite: false })));
      c.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0xe8ddd0, transparent: true, opacity: 0.55 })));
      c.add(new THREE.LineSegments(latticeGeos[si], new THREE.LineBasicMaterial({ color: 0xd9cfbf, transparent: true, opacity: 0.12 })));
      const r = 0.2 + 0.07 * z;
      const hot = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0, depthWrite: false }));
      const mid = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0.85 }));
      const core = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x1e1216 }));
      hot.scale.setScalar(r);
      c.add(hot, mid, core);
      const home = V((x - 1) * 1.45, (layer - 1) * 1.35, (z - 1) * 1.45);
      const scatter = home.clone().multiplyScalar(2.2).add(V(2.2 + Math.abs(Math.sin(k * 7.1)) * 1.5, Math.cos(k * 3.3) * 1.3, Math.sin(k * 1.7) - 2));
      // Nine heterogeneity patterns: how much of the target is partial uptake and necrotic core.
      const pattern = k % 9;
      c.userData = { home, scatter, hot, mid, core, r, contrast: [2, 2.5, 3.33][si] / 3.33, midF: 0.35 + pattern * 0.06, coreF: pattern < 2 ? 0 : 0.15 + (pattern - 2) * 0.08 };
      phantom.add(c);
      cubes.push(c);
    }

    // ── Study 2: a PET/CT scanner. The phantom lies on the bed and slides into the bore,
    // the detector ring lights up, and data streams out to build a point-cloud digital twin.
    const scanner = new THREE.Group();
    scanner.position.set(0.4, 0, 0);
    const SCAN_YAW = 0.75; // three-quarter view: the bore opening and bed face the camera
    scanner.rotation.y = SCAN_YAW;
    const housing = new THREE.MeshStandardMaterial({ color: 0xe4ded6, roughness: 0.45, metalness: 0.05 });
    const boreMat = new THREE.MeshStandardMaterial({ color: 0x2a2630, roughness: 0.7, side: THREE.BackSide });
    const gantry = new THREE.Group();
    gantry.rotation.z = Math.PI / 2; // bore axis along x, across the screen
    gantry.add(new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 1.9, 64, 1, true), housing));
    gantry.add(new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 1.9, 64, 1, true), boreMat));
    [-0.95, 0.95].forEach((y) => {
      const cap = new THREE.Mesh(new THREE.RingGeometry(2.25, 3.3, 64), housing);
      cap.rotation.x = Math.PI / 2; cap.position.y = y;
      gantry.add(cap);
    });
    const detMat = new THREE.MeshBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.4 });
    [-0.97, 0.97].forEach((y) => {
      const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.045, 8, 96), detMat);
      glowRing.rotation.x = Math.PI / 2; glowRing.position.y = y;
      gantry.add(glowRing);
    });
    scanner.add(gantry);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(10, 0.16, 1.5), new THREE.MeshStandardMaterial({ color: 0x3a343c, roughness: 0.5 }));
    bed.position.set(-1.4, -1.5, 0);
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 1.2), housing);
    pedestal.position.set(-4.2, -2.5, 0);
    scanner.add(bed, pedestal);
    root.add(scanner);

    const twin = new THREE.Group();
    const twinPts = [], twinHot = [];
    cubes.forEach((c) => {
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) for (let l = 0; l < 5; l++) {
        const p = V((i - 2) * 0.27, (j - 2) * 0.27, (l - 2) * 0.27);
        (p.length() < c.userData.r * 1.25 ? twinHot : twinPts).push(p.add(c.userData.home));
      }
    });
    const twinMat = new THREE.PointsMaterial({ color: 0xf2ece4, size: 0.06, transparent: true, opacity: 0.5, depthWrite: false });
    const twinHotMat = new THREE.PointsMaterial({ color: 0xff6a4a, size: 0.11, transparent: true, opacity: 0.95, depthWrite: false });
    twin.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(twinPts), twinMat), new THREE.Points(new THREE.BufferGeometry().setFromPoints(twinHot), twinHotMat));
    twin.add(new THREE.LineSegments(new THREE.EdgesGeometry(cyl), new THREE.LineBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.4 })));
    root.add(twin);
    const twinLabel = label('<b>Digital twin</b><span>CASSOULET / DUETTO simulation</span>', () => twin.getWorldPosition(new THREE.Vector3()).add(V(0, 2.8, 0)), 's-pin');
    const physLabel = label('<b>Physical phantom</b><span>Scanned on a GE Discovery MI</span>', () => scanner.getWorldPosition(new THREE.Vector3()).add(V(0, 3.9, 0)), 's-pin');

    const STREAM = 140;
    const streamPos = new Float32Array(STREAM * 3);
    const streamGeo = new THREE.BufferGeometry();
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    const streamMat = new THREE.PointsMaterial({ color: 0xff8a5a, size: 0.09, transparent: true, opacity: 0, depthWrite: false });
    const stream = new THREE.Points(streamGeo, streamMat);
    stream.frustumCulled = false;
    root.add(stream);

    // ── Study 3: one design file shared with two facilities, each printing its own phantom.
    const miniPhantom = () => {
      const g = new THREE.Group();
      const c2 = new THREE.CylinderGeometry(1.1, 1.1, 1.4, 40, 1, true);
      g.add(new THREE.Mesh(c2, new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(c2), new THREE.LineBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.5 })));
      for (let i = 0; i < 9; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), new THREE.MeshStandardMaterial({ color: 0xd9cfbf, transparent: true, opacity: 0.45 }));
        b.position.set(((i % 3) - 1) * 0.48, 0, (Math.floor(i / 3) - 1) * 0.48);
        const t = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff5a3c }));
        b.add(t);
        g.add(b);
      }
      return g;
    };
    const hospital = () => {
      const g = new THREE.Group();
      const m = new THREE.MeshStandardMaterial({ color: 0x3a3038, roughness: 0.7 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 1.8), m);
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
    share.position.x = 1.6;
    root.add(share);
    const design = new THREE.Group(); // the shared design file
    const docMat = new THREE.MeshBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    const doc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), docMat);
    for (let l = 0; l < 6; l++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(l ? 1 : 0.7, l ? 0.05 : 0.12), new THREE.MeshBasicMaterial({ color: l ? 0x6a6068 : 0x8b1a1a }));
      line.position.set(l ? 0 : -0.15, 0.6 - l * 0.24, 0.01);
      doc.add(line);
    }
    design.add(doc);
    design.position.set(0.2, 2.6, 0);
    share.add(design);
    const designLabel = label('<b>Shared design file</b><span>STL + protocol</span>', () => design.getWorldPosition(new THREE.Vector3()).add(V(0, 1.3, 0)), 's-pin');
    const sites = [
      { g: hospital(), at: V(-3.2, -1.6, -1.2), name: 'Facility 1', sub: 'IUCT Oncopole, Toulouse' },
      { g: hospital(), at: V(3.6, -1.6, -1.2), name: 'Facility 2', sub: 'Rambam, Haifa' },
    ];
    const sharedLabels = [];
    sites.forEach((s) => {
      s.g.position.copy(s.at);
      s.g.rotation.y = -s.at.x * 0.08;
      share.add(s.g);
      s.curve = new THREE.QuadraticBezierCurve3(design.position.clone(), V(s.at.x * 0.5, 4.2, -0.4), s.at.clone().add(V(0, 2.6, 0)));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(s.curve, 48, 0.025, 6), new THREE.MeshBasicMaterial({ color: 0xff7a5a, transparent: true, opacity: 0.6 }));
      share.add(tube);
      s.packets = [0, 1, 2].map(() => { const pk = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), docMat); share.add(pk); return pk; });
      sharedLabels.push(label(`<b>${s.name}</b><span>${s.sub}</span>`, () => s.g.getWorldPosition(new THREE.Vector3()).add(V(0, 3.1, 0)), 's-pin'));
    });

    // ── Study 5: printed lesions in a phantom vs the same shapes inside a patient.
    function lesionGeo(i) {
      const g = new THREE.IcosahedronGeometry(1, 5);
      const p = g.attributes.position, v = new THREE.Vector3();
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
    compare.position.x = 1.7;
    root.add(compare);
    // Left: Jaszczak-style phantom with eight printed inserts.
    const jas = new THREE.Group();
    jas.position.set(-2.6, 0, 0);
    const jc = new THREE.CylinderGeometry(2, 2, 4, 64, 1, true);
    jas.add(new THREE.Mesh(jc, new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })));
    jas.add(new THREE.LineSegments(new THREE.EdgesGeometry(jc), new THREE.LineBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.45 })));
    const printed = new THREE.MeshStandardMaterial({ color: 0xe8dccb, roughness: 0.8 });
    lesionGeos.forEach((g, i) => {
      const m = new THREE.Mesh(g, printed);
      const a = (i / 8) * Math.PI * 2;
      m.position.set(Math.cos(a) * 1.15, i < 4 ? 0.9 : -0.9, Math.sin(a) * 1.15);
      m.scale.setScalar(0.42);
      jas.add(m);
    });
    compare.add(jas);
    // Right: a translucent patient with the same shapes at plausible sites.
    const patient = new THREE.Group();
    patient.position.set(2.4, -0.3, 0);
    const skin = new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.12, roughness: 0.3, depthWrite: false, side: THREE.DoubleSide });
    const profile = [[0, -3.4], [1.05, -3.4], [1.35, -2.5], [1.25, -1.2], [1.12, 0], [1.3, 1.1], [1.55, 1.9], [1.35, 2.5], [0.5, 2.85], [0.42, 3.2], [0, 3.25]].map(([r, y]) => new THREE.Vector2(r, y));
    const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), skin);
    torso.scale.z = 0.62;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), skin);
    head.position.y = 3.85; head.scale.set(0.85, 1, 0.9);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.LatheGeometry(profile, 16), 30), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.12 }));
    outline.scale.z = 0.62;
    patient.add(torso, head, outline);
    [-1, 1].forEach((s) => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 2.8, 8, 16), skin);
      arm.position.set(s * 1.85, 0.9, 0); arm.rotation.z = s * 0.12;
      const lung = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), new THREE.MeshStandardMaterial({ color: 0xd27a7a, transparent: true, opacity: 0.12, depthWrite: false }));
      lung.position.set(s * 0.55, 1.5, 0); lung.scale.set(0.9, 1.5, 0.8);
      patient.add(arm, lung);
    });
    const liver = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 16), new THREE.MeshStandardMaterial({ color: 0x9a4a3a, transparent: true, opacity: 0.18, depthWrite: false }));
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
    const cmpLabels = [
      label('<b>3D-printed inserts</b><span>Physical phantom · OMNI Legend</span>', () => jas.getWorldPosition(new THREE.Vector3()).add(V(0, 2.9, 0)), 's-pin'),
      label('<b>Same shapes, synthetic</b><span>Healthy-volunteer PET background</span>', () => patient.getWorldPosition(new THREE.Vector3()).add(V(0, 4.9, 0)), 's-pin'),
    ];

    const tmp = new THREE.Vector3();
    return {
      keyframes: [
        { pos: [1.2, 2.5, 22], look: [2, 0, 0] },
        { pos: [2, 3, 17], look: [2.4, 0, 0] },
        { pos: [2.6, 3.6, 24], look: [3, -0.2, -0.6] },
        { pos: [2.6, 5, 23], look: [3.6, 0.6, -1] },
        { pos: [2.2, 1.6, 14], look: [2.4, 0, 0] },
        { pos: [2.6, 1.5, 22], look: [3.8, 0.5, 0] },
        { pos: [0, 2, 19], look: [0.6, 0, 0] },
      ],
      update(t, p, dt) {
        const k = Math.min(1, dt * 3);
        const s2 = vis(p, 2, 0.85), s3 = vis(p, 3, 0.75), s4 = vis(p, 4, 0.85), s5 = vis(p, 5, 0.75);
        const assembled = Math.min(1, Math.max(0, (p - 0.3) * 1.4));
        const phantomOn = Math.max(0, Math.min(1, 1 - Math.max(0, p - 4.35) * 2.5)) * (1 - s3);

        // Phantom: on the scanner bed for the simulation, hidden while the design is shared, back for heterogeneity.
        // On the bed for study 2: lie the phantom down and slide it into the bore with scroll.
        const slide = Math.min(1, Math.max(0, (p - 1.45) / 0.5));
        const onBed = s2;
        phantom.position.copy(tmp.set((-4.2 + 4.2 * slide) * onBed, 0.25 * onBed, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, SCAN_YAW * onBed).add(V(scanner.position.x * onBed, 0, 0)));
        show(phantom, phantomOn, 1 - onBed * 0.5);
        phantom.rotation.set(0, (reduceMotion ? 0.5 : t * 0.1 + 0.5) * (1 - onBed) + SCAN_YAW * onBed, (Math.PI / 2) * onBed);
        const glow = Math.max(vis(p, 1, 0.9) * 0.6, s2, s4);
        const het = Math.min(1, Math.max(0, (p - 3.3) * 1.6)) * phantomOn; // nested regions grow in study 4
        for (const c of cubes) {
          const u = c.userData;
          c.position.lerpVectors(u.scatter, u.home, assembled);
          u.hot.material.opacity = glow * (0.35 + u.contrast * 0.65) * (1 - het * 0.45);
          u.hot.scale.setScalar(u.r * (1 + het * 0.35));
          show(u.mid, het, u.r * u.midF * 1.35);
          show(u.core, het * (u.coreF ? 1 : 0), u.r * u.coreF * 1.35);
        }

        // Study 2.
        show(scanner, s2);
        const inside = s2 * Math.min(1, Math.max(0, (slide - 0.75) * 4));
        detMat.opacity = 0.25 + inside * (0.5 + 0.25 * Math.abs(Math.sin(t * 6)));
        twin.position.set(4.3, 0.6, -3.4);
        show(twin, s2 * inside, 0.55);
        twinMat.opacity = 0.5 * inside; twinHotMat.opacity = 0.95 * inside;
        twin.rotation.y = reduceMotion ? 0.5 : t * 0.15;
        twinLabel.visible = inside > 0.6;
        physLabel.visible = s2 > 0.6;
        streamMat.opacity = inside;
        for (let i = 0; i < STREAM; i++) {
          const f = (t * 0.35 + i / STREAM) % 1;
          tmp.set(scanner.position.x + 1.4, Math.sin(i * 12.9) * 1.6, -1.2 + Math.cos(i * 7.3) * 1.2).lerp(V(4.3 - 1.1, Math.sin(i * 3.1) * 1.4, Math.cos(i * 5.7)), f);
          tmp.y += Math.sin(f * Math.PI) * 0.8;
          streamPos.set([tmp.x, tmp.y, tmp.z], i * 3);
        }
        streamGeo.attributes.position.needsUpdate = true;

        // Study 3.
        show(share, s3);
        design.rotation.y = Math.sin(t * 0.8) * 0.3;
        designLabel.visible = s3 > 0.5;
        sites.forEach((s, si) => {
          s.packets.forEach((pk, j) => {
            const f = (t * 0.4 + j / 3 + si * 0.17) % 1;
            pk.position.copy(s.curve.getPoint(f));
            pk.lookAt(pk.position.clone().add(V(0, 0, 1)));
          });
          s.g.userData.mini.rotation.y = t * 0.4;
          sharedLabels[si].visible = s3 > 0.5;
        });

        // Study 5.
        show(compare, s5, 0.85);
        jas.rotation.y = reduceMotion ? 0 : t * 0.2;
        patient.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.3) * 0.35;
        cmpLabels.forEach((l) => (l.visible = s5 > 0.5));
      },
    };
  },
});

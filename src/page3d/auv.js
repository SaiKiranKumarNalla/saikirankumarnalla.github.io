// Black Pearl (AUV MEC): a procedural model of the vehicle, the rule-book envelope,
// a 3D V-cycle, and the final vehicle swimming; the team's videos are embedded at the end.
import { auv as A } from '../../content/academics.json';
import pubs from '../../content/publications.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const paper = pubs.find((p) => p.id === 'oceans2021');

const STEPS = [
  { title: 'Black Pearl', html: `<p class="s-kicker">Bachelor's · ${esc(A.team)} · ${esc(A.dates)}</p>
      <h1>${esc(A.title)}</h1>
      <p class="s-lede">${esc(A.eli5)}</p>
      <p class="s-meta">${esc(A.degree)}<br>${esc(A.competition)} · ${esc(A.role)}</p>
      <p class="s-scroll">Scroll to build the vehicle</p>` },
  ...A.steps.map((s, i) => ({ title: s.title, html: `<p class="s-kicker">${i + 1} of ${A.steps.length}</p><h2>${esc(s.title)}</h2>
      <p class="s-lede">${esc(s.eli5)}</p><p>${esc(s.text)}</p>
      ${s.more.length ? `<details class="s-know"><summary>Know more</summary>${list(s.more)}</details>` : ''}` })),
  { title: 'Watch', html: `<p class="s-kicker">Watch</p><h2>Black Pearl in action</h2>
      ${A.videos.map((v) => `<h3>${esc(v.title)}</h3><div class="s-video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`).join('')}
      ${paper ? `<h3>Paper</h3><div class="s-role"><b>${esc(paper.title)}</b><p>${esc(paper.venue)} · <a href="https://doi.org/${esc(paper.doi)}" target="_blank" rel="noopener">doi.org/${esc(paper.doi)}</a></p></div>` : ''}` },
];
document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: null,
  build({ THREE, scene, label, reduceMotion }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const vis = (p, a, w) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / w));
    const root = new THREE.Group();
    root.position.set(2.4, 0, 0);
    scene.add(root);

    // ── The vehicle (1 unit ≈ 10 cm): 60 × 47 × 37.5 cm.
    const auv = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x2b2d3f, metalness: 0.6, roughness: 0.35 });
    const alu = new THREE.MeshStandardMaterial({ color: 0xc9c9cf, metalness: 0.8, roughness: 0.25 });
    const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false });
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 4.6, 48, 1, true), acrylic);
    hull.rotation.z = Math.PI / 2; hull.position.y = 0.5;
    [-2.3, 2.3].forEach((x) => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.18, 48), alu); cap.rotation.z = Math.PI / 2; cap.position.set(x, 0.5, 0); auv.add(cap); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), acrylic);
    dome.rotation.z = -Math.PI / 2; dome.position.set(2.4, 0.5, 0);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshBasicMaterial({ color: 0x1a1a22 }));
    lens.position.set(2.75, 0.5, 0);
    // Electronics stack inside the hull.
    const boards = [0x2e7a49, 0x2e7a49, 0x3a5a8a].map((c, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 1.2), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })); b.position.set(-0.8 + i * 1.1, 0.5 + (i - 1) * 0.25, 0); auv.add(b); return b; });
    const battery = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.4, 32), metal);
    battery.rotation.z = Math.PI / 2; battery.position.y = -1.05;
    // Frame: two side plates and cross bars.
    [-2.2, 2.2].forEach((z) => { const plate = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 0.08), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.5, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide })); plate.position.set(0, -0.2, z); auv.add(plate); });
    [-2, 2].forEach((x) => [-1.6, 1.3].forEach((y) => { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 8), alu); bar.rotation.x = Math.PI / 2; bar.position.set(x, y, 0); auv.add(bar); }));
    // Thrusters: two surge, two heave, one sway (5 degrees of freedom with roll/yaw from pairs).
    const props = [];
    const thruster = (pos, axis) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 24), metal));
      const prop = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.02), alu);
      g.add(prop); props.push(prop);
      g.position.copy(pos);
      if (axis === 'x') g.rotation.y = Math.PI / 2;
      if (axis === 'y') g.rotation.x = Math.PI / 2;
      auv.add(g);
    };
    thruster(V(-2.9, 0.2, 1.4), 'x'); thruster(V(-2.9, 0.2, -1.4), 'x');
    thruster(V(0, 1.6, 1.6), 'y'); thruster(V(0, 1.6, -1.6), 'y');
    thruster(V(1.6, -0.6, 2.35), 'z');
    auv.add(hull, dome, lens, battery);
    root.add(auv);

    // ── Rule-book envelope: 70 × 50 × 50 cm.
    const env = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7, 5, 5)), new THREE.LineBasicMaterial({ color: 0xff6a4a, transparent: true }));
    env.position.y = 0.1;
    root.add(env);
    const envLabel = label('<b>Rule book</b><span>&lt; 70 × 50 × 50 cm · &lt; 40 kg</span>', () => env.getWorldPosition(new THREE.Vector3()).add(V(0, 3, 0)), 's-pin');
    const finalLabel = label('<b>60 × 47 × 37.5 cm</b><span>20.6 kg · +2.91 % buoyancy · 5 DOF</span>', () => auv.getWorldPosition(new THREE.Vector3()).add(V(0, 2.8, 0)), 's-pin');

    // ── The V-cycle as a 3D path: verification down the left arm, validation up the right.
    const vg = new THREE.Group();
    const vPts = [V(-3.5, 2.2, 0), V(-2.3, 0.7, 0), V(-1.2, -0.8, 0), V(0, -2, 0), V(1.2, -0.8, 0), V(2.3, 0.7, 0), V(3.5, 2.2, 0)];
    const vCurve = new THREE.CatmullRomCurve3(vPts, false, 'catmullrom', 0);
    vg.add(new THREE.Mesh(new THREE.TubeGeometry(vCurve, 80, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.4 })));
    const vNames = ['Requirements', 'System design', 'Virtual prototype', 'Decision matrix', 'Physical prototype', 'System tests', 'Competition'];
    vPts.forEach((p, i) => {
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshStandardMaterial({ color: i === 3 ? 0xffc46b : 0xd24a4a, emissive: i === 3 ? 0xffb36b : 0x8b1a1a, emissiveIntensity: 0.6 }));
      n.position.copy(p);
      vg.add(n);
      const w = new THREE.Vector3();
      vg.userData[`l${i}`] = label(`<b>${vNames[i]}</b>`, () => n.getWorldPosition(w), 's-pin');
    });
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    vg.add(pulse);
    vg.position.set(0.4, 0.2, -1.5);
    root.add(vg);

    // ── Rising bubbles.
    const B = 120, bpos = new Float32Array(B * 3);
    for (let i = 0; i < B; i++) bpos.set([(Math.random() - 0.5) * 12, Math.random() * 10 - 5, (Math.random() - 0.5) * 6], i * 3);
    const bgeo = new THREE.BufferGeometry();
    bgeo.setAttribute('position', new THREE.BufferAttribute(bpos, 3));
    const bubbles = new THREE.Points(bgeo, new THREE.PointsMaterial({ color: 0x9fd0ff, size: 0.07, transparent: true, opacity: 0.6, depthWrite: false }));
    root.add(bubbles);

    return {
      keyframes: [
        { pos: [1.5, 2.5, 18], look: [2.2, 0, 0] },
        { pos: [2, 4, 18], look: [2.4, 0, 0] },
        { pos: [1.5, 1, 15], look: [2.2, 0, -1] },
        { pos: [2.5, 2.5, 15], look: [2.4, 0.3, 0] },
        { pos: [1.5, 2, 19], look: [2.4, 0, 0] },
        { pos: [1.5, 2.5, 18], look: [2.2, 0, 0] },
      ],
      update(t, p, dt) {
        const time = reduceMotion ? 0 : t;
        props.forEach((pr) => (pr.rotation.z = time * 18));
        const swim = Math.max(vis(p, 0, 1), vis(p, 4, 1), vis(p, 5, 1));
        const vstep = vis(p, 2, 0.75);
        auv.scale.setScalar(Math.max(0.001, 1 - vstep * 0.65));
        auv.position.set(swim * Math.sin(time * 0.4) * 0.6, swim * Math.sin(time * 0.7) * 0.25 + vstep * -2.2, vstep * 1.5);
        auv.rotation.set(Math.sin(time * 0.5) * 0.05 * swim, (vis(p, 3, 0.8) ? time * 0.3 : 0.6) + swim * Math.sin(time * 0.3) * 0.2, 0);
        const e = vis(p, 1, 0.8);
        env.visible = e > 0.02; env.material.opacity = e; envLabel.visible = e > 0.6;
        finalLabel.visible = vis(p, 3, 0.7) > 0.6;
        vg.visible = vstep > 0.02;
        vg.scale.setScalar(Math.max(0.001, vstep));
        for (let i = 0; i < vNames.length; i++) vg.userData[`l${i}`].visible = vstep > 0.6;
        pulse.position.copy(vCurve.getPointAt((time * 0.15) % 1));
        for (let i = 0; i < B; i++) { bpos[i * 3 + 1] += dt * (0.6 + (i % 5) * 0.15); if (bpos[i * 3 + 1] > 5) bpos[i * 3 + 1] = -5; }
        bgeo.attributes.position.needsUpdate = true;
      },
    };
  },
});

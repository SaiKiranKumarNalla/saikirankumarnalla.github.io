// Master's thesis: microwave ablation. A tissue block, the antenna, and an ablation zone that grows
// from the tip; a nearby vessel bends it (heat sink); simulation compares liver and lung.
import { masters as M } from '../../content/academics.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

const STEPS = [
  { title: "Master's thesis", html: `<p class="s-kicker">Master's thesis · ${esc(M.dates)}</p>
      <h1>${esc(M.title)}</h1>
      <p class="s-lede">${esc(M.eli5)}</p>
      <p class="s-meta">${esc(M.degree)}<br>${esc(M.host)} · Advisor: ${esc(M.advisor)}</p>
      <p class="s-meta">${esc(M.confidential)}</p>
      <p class="s-scroll">Scroll through the work</p>` },
  ...M.steps.map((s, i) => ({ title: s.title, html: `<p class="s-kicker">Part ${i + 1} of ${M.steps.length}</p><h2>${esc(s.title)}</h2>
      <p class="s-lede">${esc(s.eli5)}</p><p>${esc(s.text)}</p>
      ${s.more.length ? `<details class="s-know"><summary>Know more</summary>${list(s.more)}</details>` : ''}` })),
];
document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: null,
  build({ THREE, scene, reduceMotion }) {
    const root = new THREE.Group();
    root.position.set(3.6, 0, 0);
    root.rotation.set(0.35, -0.5, 0);
    scene.add(root);
    const vis = (p, a, w) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / w));

    // Tissue block with the antenna entering from the left; the radiating tip sits at the origin.
    function tissue(color) {
      const g = new THREE.Group();
      const box = new THREE.BoxGeometry(6.4, 3.4, 4);
      g.add(new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, roughness: 0.6 })));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.25 })));
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 6, 16), new THREE.MeshStandardMaterial({ color: 0xc9c9cf, metalness: 0.8, roughness: 0.25 }));
      antenna.rotation.z = Math.PI / 2; antenna.position.x = -3;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 16), antenna.material);
      tip.rotation.z = -Math.PI / 2; tip.position.x = 0.1;
      g.add(antenna, tip);
      // Ablation zone: congestion rim (red) around a coagulation core (pale).
      const rim = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({ color: 0xd24a4a, emissive: 0x8b1a1a, emissiveIntensity: 0.5, transparent: true, opacity: 0.55, depthWrite: false }));
      const core = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({ color: 0xf2e6d0, emissive: 0xffb36b, emissiveIntensity: 0.25 }));
      g.add(rim, core);
      g.userData = { rim, core };
      return g;
    }
    const liver = tissue(0x9a4a3a);
    root.add(liver);

    // A blood vessel beside the tip carries heat away.
    const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6.4, 24), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0x3a0808, roughness: 0.4 }));
    vessel.rotation.z = Math.PI / 2;
    root.add(vessel);
    const flow = [...Array(24)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff8a6a })); m.userData.u = i / 24; root.add(m); return m; });

    // Radiometric sensing: rings travelling along the antenna.
    const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true })); r.rotation.y = Math.PI / 2; root.add(r); return r; });

    // Simulation view: a lung block beside the liver; in lung the zone grows along the antenna.
    const lung = tissue(0x7a8aa8);
    lung.position.set(0, -4.2, 0);
    root.add(lung);
    const iso = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffc46b, wireframe: true, transparent: true, opacity: 0.35 }));
    root.add(iso);

    return {
      keyframes: [
        { pos: [1.5, 2, 17], look: [2.2, 0, 0] },
        { pos: [1.5, 2.5, 15], look: [2.2, 0, 0] },
        { pos: [2, 1.5, 12], look: [1.4, 0.2, 0] },
        { pos: [1.5, 3, 15], look: [2.2, 0, 0] },
        { pos: [2, 2, 21], look: [2.6, -1.8, 0] },
        { pos: [1.5, 2, 17], look: [2.2, -0.6, 0] },
      ],
      update(t, p) {
        const time = reduceMotion ? 3 : t;
        const grow = 0.35 + ((time * 0.18) % 1) * 0.95; // a burn that keeps growing and restarting
        // Heat sink: vessel distance cycles through 3 / 7 / 11 mm-style positions during ex vivo burns.
        const sinkOn = Math.max(vis(p, 1, 0.8), vis(p, 3, 0.9));
        const depthIdx = Math.floor(time * 0.18) % 3;
        const vz = -(0.9 + depthIdx * 0.55);
        vessel.visible = sinkOn > 0.02;
        vessel.position.set(0, 0, vz);
        vessel.scale.setScalar(Math.max(0.001, sinkOn));
        flow.forEach((m) => { m.visible = vessel.visible; m.position.set(-3.2 + ((m.userData.u + time * 0.4) % 1) * 6.4, 0, vz); });
        const squash = sinkOn * (1 - (depthIdx * 0.25)) * 0.45; // closer vessel, more asymmetry
        const { rim, core } = liver.userData;
        rim.scale.set(1.45 * grow, grow, grow * (1 - squash));
        rim.position.set(-0.2, 0, squash * 0.6 * grow);
        core.scale.set(1.05 * grow * 0.7, grow * 0.7, grow * 0.7 * (1 - squash));
        core.position.copy(rim.position);
        // Radiometer rings (part 2).
        const sense = vis(p, 2, 0.8);
        rings.forEach((r, i) => { const k = (time * 0.6 + i / 3) % 1; r.position.set(-0.2 - k * 2.5, 0, 0); r.material.opacity = sense * (1 - k); r.visible = sense > 0.02; });
        // Simulation (part 4): show the lung block and an isotherm wireframe.
        const sim = Math.max(vis(p, 4, 0.8), vis(p, 5, 0.9));
        lung.visible = sim > 0.02;
        lung.scale.setScalar(Math.max(0.001, sim));
        const L = lung.userData;
        L.rim.scale.set(2.1 * grow, grow * 0.7, grow * 0.7);
        L.rim.position.x = -0.6 * grow;
        L.core.scale.set(1.5 * grow * 0.7, grow * 0.45, grow * 0.45);
        L.core.position.x = L.rim.position.x;
        iso.visible = sim > 0.02;
        iso.scale.set(rim.scale.x * 1.15, rim.scale.y * 1.15, rim.scale.z * 1.15);
        iso.position.copy(rim.position);
        iso.material.opacity = 0.35 * sim;
      },
    };
  },
});

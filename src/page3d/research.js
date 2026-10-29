// Research: the 36-insert porous phantom assembles, duplicates across two hospitals,
// then gives way to patterned and patient-shaped targets, following the thesis chapters.
import thesis from '../../content/thesis.json';
import projects from '../../content/projects.json';
import pubs from '../../content/publications.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pubLinks = (ids = []) => ids.map((id) => pubs.find((p) => p.id === id)).filter(Boolean)
  .map((p) => `<li>${esc(p.title)} <span class="s-meta">· ${esc(p.venue)}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</span></li>`).join('');
const ch = (n) => thesis.chapters.find((c) => c.n === n);
const vp = projects.find((p) => p.id === 'virtualpet');

const STEPS = [
  { title: 'PhD', html: `<p class="s-kicker">Research · PhD, ${esc(thesis.university)} · defended ${esc(thesis.defended)}</p>
      <h1>Can we trust the numbers a scanner gives?</h1>
      <p class="s-lede">${esc(thesis.eli5)}</p>
      <p class="s-meta">${esc(thesis.title)}<br>${thesis.labs.map(esc).join(' · ')} · ${thesis.supervisors.map(esc).join(' & ')}</p>
      <p class="s-scroll">Scroll through the five studies</p>` },
  ...[1, 2, 3, 4, 5].map((n) => ({
    title: ch(n).title,
    html: `<p class="s-kicker">Study ${n} of 5</p><h2>${esc(ch(n).title)}</h2>
      <p class="s-lede">${esc(ch(n).eli5)}</p><p>${esc(ch(n).detail)}</p>
      ${ch(n).pubs ? `<h3>Published as</h3><ul class="s-list">${pubLinks(ch(n).pubs)}</ul>` : ''}`,
  })),
  { title: 'Now', html: `<p class="s-kicker">After the PhD</p><h2>${esc(vp.name)}</h2>
      <p class="s-lede">${esc(vp.eli5)}</p><p>${esc(vp.summary)}</p>
      <div class="s-chips">${vp.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
      <a class="s-more" href="/sections/builder.html">How the agents work →</a>` },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: 'research',
  build({ THREE, scene, reduceMotion }) {
    const root = new THREE.Group();
    root.position.set(3.4, 0, 0);
    scene.add(root);

    // A 6×6 grid of 40 mm-style cubes; three solidities set three contrast levels.
    const SOLID = [0.5, 0.6, 0.7];
    const glass = (o) => new THREE.MeshPhysicalMaterial({ color: 0xe8ddd0, roughness: 0.25, transmission: 0.6, thickness: 0.4, transparent: true, opacity: o });
    const makePhantom = () => {
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 4.2, 48, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.9, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
      g.add(shell);
      const cubes = [];
      for (let layer = 0; layer < 3; layer++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
        const solidity = SOLID[(x + layer) % 3];
        const c = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), glass(0.35 + solidity * 0.5));
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0 });
        const hot = new THREE.Mesh(new THREE.SphereGeometry(0.18 + 0.1 * z, 20, 14), glowMat); // the "target" inside
        c.add(hot);
        const home = new THREE.Vector3((x - 1) * 1.45, (layer - 1) * 1.35, (z - 1) * 1.45);
        const scatter = home.clone().multiplyScalar(3.2).add(new THREE.Vector3(Math.sin(cubes.length * 7.1) * 2, Math.cos(cubes.length * 3.3) * 2, 0));
        c.position.copy(scatter);
        c.userData = { home, scatter, hot, glowMat, contrast: 1 / (1 - solidity) / 3.33 };
        g.add(c);
        cubes.push(c);
      }
      return { g, cubes, shell };
    };
    const A = makePhantom(), B = makePhantom();
    root.add(A.g, B.g);
    B.g.visible = false;

    // Heterogeneous insert: nested shells (necrotic core, active rim).
    const hetero = new THREE.Group();
    [[1.6, 0xff6a4a, 0.35], [1.1, 0xffb36b, 0.5], [0.55, 0x1a1418, 1]].forEach(([r, c, o]) =>
      hetero.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 3), new THREE.MeshStandardMaterial({ color: c, emissive: c === 0x1a1418 ? 0 : c, emissiveIntensity: 0.6, transparent: true, opacity: o, roughness: 0.4 }))));
    root.add(hetero);

    // Patient-derived lesions: irregular blobs.
    const blobs = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.IcosahedronGeometry(0.6 + (i % 3) * 0.15, 3);
      const p = geo.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const v = new THREE.Vector3().fromBufferAttribute(p, k);
        v.multiplyScalar(1 + 0.25 * Math.sin(v.x * 4 + i) * Math.cos(v.y * 3 + i * 2));
        p.setXYZ(k, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd9cfbf : 0xff6a4a, emissive: i % 2 ? 0 : 0xff4a2a, emissiveIntensity: 0.5, roughness: 0.5 }));
      m.position.set(((i % 4) - 1.5) * 1.7, i < 4 ? 0.9 : -0.9, 0);
      blobs.add(m);
    }
    root.add(blobs);

    const vis = (p, a, b) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / b));
    return {
      keyframes: [
        { pos: [0, 2, 20], look: [0.4, 0, 0] },
        { pos: [1, 3, 13], look: [1.2, 0, 0] },
        { pos: [1.5, 1.5, 11], look: [1.4, 0, 0] },
        { pos: [0, 4, 18], look: [0.6, 0, 0] },
        { pos: [1.2, 1, 11], look: [1.4, 0, 0] },
        { pos: [1, 1, 12], look: [1.3, 0, 0] },
        { pos: [0, 2, 19], look: [0.4, 0, 0] },
      ],
      update(t, p, dt) {
        const k = Math.min(1, dt * 3);
        const assembled = Math.min(1, Math.max(0, p - 0.2) * 1.4); // cubes fly home during study 1
        const twoSites = vis(p, 3, 0.8); // study 3: a second phantom appears
        const phantomVis = Math.max(0, 1 - Math.max(0, p - 3.5) * 1.5);
        A.g.position.x += ((twoSites ? -2.6 * twoSites : 0) - A.g.position.x) * k;
        B.g.visible = twoSites > 0.02;
        B.g.position.set(2.6 * twoSites, 0, 0);
        [A, B].forEach((P) => {
          P.g.scale.setScalar(Math.max(0.001, phantomVis) * (twoSites ? 0.75 : 1));
          P.g.rotation.y = reduceMotion ? 0.5 : t * 0.12 + 0.5;
          P.cubes.forEach((c) => {
            c.position.lerpVectors(c.userData.scatter, c.userData.home, assembled);
            // Study 2 shows the targets glowing (simulation copies the cube).
            const glow = Math.max(vis(p, 2, 0.9), twoSites, vis(p, 1, 0.9) * 0.5);
            c.userData.glowMat.opacity = glow * (0.4 + c.userData.contrast * 0.6);
          });
        });
        const h = vis(p, 4, 0.9);
        hetero.scale.setScalar(Math.max(0.001, h));
        hetero.rotation.y = t * 0.3;
        hetero.rotation.x = t * 0.17;
        const b = Math.max(vis(p, 5, 0.9), vis(p, 6, 0.9) * 0.6);
        blobs.scale.setScalar(Math.max(0.001, b));
        blobs.children.forEach((m, i) => { m.rotation.y = t * 0.2 + i; m.rotation.x = t * 0.13 + i; });
      },
    };
  },
});

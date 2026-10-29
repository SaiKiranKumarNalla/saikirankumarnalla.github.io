// My PhD thesis in a nutshell: the porous phantom assembles, splits across two hospitals,
// opens into a cut-away heterogeneous tumour, then becomes patient-shaped lesions.
// Each study has a key figure and an expandable "Know more" with methods, results and limitations.
import thesis from '../../content/thesis.json';
import projects from '../../content/projects.json';
import pubs from '../../content/publications.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const pubLinks = (ids = []) => ids.map((id) => pubs.find((p) => p.id === id)).filter(Boolean)
  .map((p) => `<li>${esc(p.title)} <span class="s-meta">· ${esc(p.venue)}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</span></li>`).join('');
const figure = (f, cls = '') => `<figure class="s-fig ${cls}"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy" decoding="async"><figcaption>${esc(f.caption)}</figcaption></figure>`;
const ch = (n) => thesis.chapters.find((c) => c.n === n);
const vp = projects.find((p) => p.id === 'virtualpet');

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
      <p>${esc(thesis.abstractShort)}</p>
      <p class="s-meta">${esc(thesis.title)}<br>${thesis.labs.map(esc).join(' · ')} · Supervised by ${thesis.supervisors.map(esc).join(' & ')}</p>
      <p class="s-scroll">Scroll through the five studies</p>` },
  ...[1, 2, 3, 4, 5].map((n) => ({ title: ch(n).title, html: study(n) })),
  { title: 'Takeaway', html: `<p class="s-kicker">Takeaway</p><h2>Ground truth you can trust</h2>
      <p class="s-lede">${esc(thesis.takeaway)}</p>
      <h3>What came next: ${esc(vp.name)}</h3><p>${esc(vp.summary)}</p>
      <div class="s-chips">${vp.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
      <a class="s-more" href="/sections/builder.html">How the agents work →</a>` },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');
// Opening "Know more" changes the page height; re-measure the scroll steps.
document.querySelectorAll('.s-know').forEach((d) => d.addEventListener('toggle', () => dispatchEvent(new Event('scroll'))));

runPage({
  active: 'research',
  build({ THREE, scene, reduceMotion }) {
    const root = new THREE.Group();
    root.position.set(3.6, 0, 0);
    scene.add(root);

    // Porous cubes: faint faces, crisp edges, an internal lattice whose density follows solidity,
    // and a glowing target sphere inside.
    const SOLID = [0.5, 0.6, 0.7];
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xe8ddd0, transparent: true, opacity: 0.55 });
    const cubeGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
    const edgeGeo = new THREE.EdgesGeometry(cubeGeo);
    const latticeGeos = [2, 3, 4].map((k) => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.1, 1.1, 1.1, k, k, k)));
    function makePhantom() {
      const g = new THREE.Group();
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 4.4, 64, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }));
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(3.3, 3.3, 4.4, 64, 1, true)), new THREE.LineBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.35 }));
      g.add(shell, rim);
      const cubes = [];
      for (let layer = 0; layer < 3; layer++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
        const si = (x + layer) % 3;
        const c = new THREE.Group();
        c.add(new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial({ color: 0xd9cfbf, transparent: true, opacity: 0.06 + SOLID[si] * 0.08, depthWrite: false })));
        c.add(new THREE.LineSegments(edgeGeo, edgeMat));
        c.add(new THREE.LineSegments(latticeGeos[si], new THREE.LineBasicMaterial({ color: 0xd9cfbf, transparent: true, opacity: 0.12 })));
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0 });
        c.add(new THREE.Mesh(new THREE.SphereGeometry(0.16 + 0.08 * z, 20, 14), glowMat));
        const home = new THREE.Vector3((x - 1) * 1.45, (layer - 1) * 1.35, (z - 1) * 1.45);
        const k = cubes.length;
        const scatter = home.clone().multiplyScalar(2.2).add(new THREE.Vector3(2.2 + Math.abs(Math.sin(k * 7.1)) * 1.5, Math.cos(k * 3.3) * 1.3, Math.sin(k * 1.7) - 2));
        c.position.copy(scatter);
        c.userData = { home, scatter, glowMat, contrast: [2, 2.5, 3.33][si] / 3.33 };
        g.add(c);
        cubes.push(c);
      }
      return { g, cubes };
    }
    const A = makePhantom(), B = makePhantom();
    root.add(A.g, B.g);

    // Heterogeneous insert, cut away so the nested regions show: active rim, partial uptake, necrotic core.
    const hetero = new THREE.Group();
    [[1.7, 0xff6a4a, 0.9, 0.5], [1.15, 0xffb36b, 0.95, 0.35], [0.6, 0x2a1a1e, 1, 0]].forEach(([r, c, o, e]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32, 0, Math.PI * 1.45),
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: e, transparent: o < 1, opacity: o, roughness: 0.5, side: THREE.DoubleSide }));
      hetero.add(m);
    });
    root.add(hetero);

    // Patient-derived lesions: eight smooth irregular shapes, printed (bone) and synthetic (glowing).
    const blobs = new THREE.Group();
    blobs.position.x = 0.6;
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.IcosahedronGeometry(0.5 + (i % 3) * 0.1, 5);
      const p = geo.attributes.position, v = new THREE.Vector3();
      for (let k = 0; k < p.count; k++) {
        v.fromBufferAttribute(p, k);
        v.multiplyScalar(1 + 0.22 * Math.sin(v.x * 3.5 + i) * Math.cos(v.y * 2.8 + i * 2) + 0.1 * Math.sin(v.z * 5 + i));
        p.setXYZ(k, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      const synthetic = i % 2 === 0;
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: synthetic ? 0xff6a4a : 0xe6dccd, emissive: synthetic ? 0xd24a2a : 0, emissiveIntensity: synthetic ? 0.45 : 0, roughness: synthetic ? 0.45 : 0.75 }));
      m.position.set(((i % 4) - 1.5) * 1.45, i < 4 ? 0.8 : -0.8, 0);
      blobs.add(m);
    }
    root.add(blobs);

    const vis = (p, a, w) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / w));
    const show = (o, v) => { o.visible = v > 0.01; o.scale.setScalar(Math.max(0.001, v)); };
    return {
      keyframes: [
        { pos: [0, 2.5, 21], look: [0.6, 0, 0] },
        { pos: [1, 3, 15], look: [1.4, 0, 0] },
        { pos: [1.5, 1.8, 14], look: [1.5, 0, 0] },
        { pos: [0, 4.5, 20], look: [0.8, 0, 0] },
        { pos: [1.4, 1.2, 12.5], look: [1.6, 0, 0] },
        { pos: [1, 1, 13], look: [1.6, 0, 0] },
        { pos: [0, 2, 19], look: [0.6, 0, 0] },
      ],
      update(t, p, dt) {
        const k = Math.min(1, dt * 3);
        const assembled = Math.min(1, Math.max(0, (p - 0.3) * 1.4));
        const twoSites = vis(p, 3, 0.8);
        const phantom = Math.max(0, Math.min(1, 1 - (p - 3.4) * 2)); // gone by study 4
        A.g.position.x += (-2.7 * twoSites - A.g.position.x) * k;
        B.g.position.x = 2.7 * twoSites;
        show(A.g, phantom * (1 - twoSites * 0.28));
        show(B.g, twoSites * 0.72);
        const glow = Math.max(vis(p, 1, 0.9) * 0.6, vis(p, 2, 0.9), twoSites);
        for (const P of [A, B]) {
          P.g.rotation.y = reduceMotion ? 0.5 : t * 0.1 + 0.5;
          for (const c of P.cubes) {
            c.position.lerpVectors(c.userData.scatter, c.userData.home, assembled);
            c.userData.glowMat.opacity = glow * (0.35 + c.userData.contrast * 0.65);
          }
        }
        show(hetero, vis(p, 4, 0.6));
        hetero.rotation.y = (reduceMotion ? 0 : t * 0.25) + 2.2;
        hetero.rotation.x = 0.35;
        show(blobs, Math.max(vis(p, 5, 0.6), vis(p, 6, 0.7) * 0.7));
        blobs.children.forEach((m, i) => { m.rotation.y = t * 0.2 + i; m.rotation.x = t * 0.13 + i; });
      },
    };
  },
});

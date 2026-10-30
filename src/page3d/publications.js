// Publications: a stack of floating paper sheets; the group being read fans out toward the camera.
import pubs from '../../content/publications.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const GROUPS = [['published', 'Published'], ['preprint', 'Preprints'], ['in-preparation', 'In preparation'], ['conference', 'Conference']];
const paras = (t) => String(t).split(/\n\s*\n/).map((x) => `<p>${esc(x.trim())}</p>`).join('');
const item = (p) => `<div class="s-role"><b>${esc(p.title)}</b><p>${esc(p.venue)} · ${p.year}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi.org/${esc(p.doi)}</a>` : ''}</p>
  ${p.abstract ? `<details class="s-know"><summary>Abstract</summary>${paras(p.abstract)}</details>`
    : p.summary ? `<details class="s-know"><summary>Summary</summary><p>${esc(p.summary)}</p><p class="s-meta">Full abstract on the publisher's site.</p></details>` : ''}</div>`;

const groups = GROUPS.map(([k, name]) => ({ k, name, list: pubs.filter((p) => p.status === k).sort((a, b) => b.year - a.year) })).filter((g) => g.list.length);
document.getElementById('main').innerHTML = `
  <section class="s-step s-hero" data-title="Publications"><div class="s-card">
    <p class="s-kicker">Publications</p><h1>Papers, preprints and talks</h1>
    <p class="s-lede">Physical ground truth for PET/CT: 3D-printed phantoms, synthetic lesion insertion, simulation, and earlier work on blood-flow modelling.</p>
    <div class="s-stat">${groups.map((g) => `<div><b>${g.list.length}</b><span>${g.name.toLowerCase()}</span></div>`).join('')}</div>
    <p class="s-scroll">Scroll through each group</p>
  </div></section>
  ${groups.map((g) => `<section class="s-step" data-title="${g.name}"><div class="s-card"><p class="s-kicker">${g.list.length} ${g.list.length > 1 ? 'items' : 'item'}</p><h2>${g.name}</h2>${g.list.map(item).join('')}</div></section>`).join('')}`;

runPage({
  active: 'publications',
  build({ THREE, scene, reduceMotion }) {
    const root = new THREE.Group();
    root.position.set(3.4, 0, 0);
    scene.add(root);
    const paperMat = (hot) => new THREE.MeshStandardMaterial({ color: hot ? 0xf6efe6 : 0xcfc5b8, roughness: 0.7, emissive: hot ? 0x3a0e10 : 0, emissiveIntensity: 0.3, side: THREE.DoubleSide });
    const sheets = [];
    groups.forEach((g, gi) => g.list.forEach((p, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.85, 1, 6), paperMat(false));
      // Slight curl.
      const pos = m.geometry.attributes.position;
      for (let v = 0; v < pos.count; v++) pos.setZ(v, Math.pow(pos.getY(v) / 0.93, 2) * 0.08);
      m.geometry.computeVertexNormals();
      // Ink lines as thin dark strips.
      for (let l = 0; l < 7; l++) {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(l === 0 ? 0.9 : 1.1, l === 0 ? 0.08 : 0.035), new THREE.MeshBasicMaterial({ color: l === 0 ? 0x8b1a1a : 0x4a4048 }));
        line.position.set(l === 0 ? -0.07 : 0, 0.68 - l * 0.18, 0.02);
        m.add(line);
      }
      m.userData = { gi, k, n: g.list.length };
      root.add(m);
      sheets.push(m);
    }));
    const tmp = new THREE.Vector3();
    return {
      keyframes: [{ pos: [0, 2, 18], look: [0.5, 0, 0] }, ...groups.map(() => ({ pos: [1, 0.8, 12], look: [1.2, 0, 0] }))],
      update(t, p, dt) {
        const active = Math.round(p) - 1;
        sheets.forEach((m, i) => {
          const { gi, k, n } = m.userData;
          const fan = gi === active;
          if (fan) tmp.set((k - (n - 1) / 2) * 1.05, 0, 1 - Math.abs(k - (n - 1) / 2) * 0.3);
          else tmp.set(Math.sin(i * 2.4) * 0.2, -1.2 + i * 0.04, -2 - gi * 0.4);
          m.position.lerp(tmp, Math.min(1, dt * 3));
          const rx = fan ? 0 : -Math.PI / 2 + 0.05;
          m.rotation.x += (rx - m.rotation.x) * Math.min(1, dt * 3);
          m.rotation.y = fan ? (k - (n - 1) / 2) * -0.18 : i * 0.3;
          m.rotation.z = fan || reduceMotion ? 0 : Math.sin(t * 0.4 + i) * 0.03;
          m.material.emissiveIntensity = fan ? 0.35 : 0;
        });
        root.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.2) * 0.12;
      },
    };
  },
});

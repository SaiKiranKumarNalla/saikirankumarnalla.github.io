// Project Inventory: every project as a lit pillar on a timeline by year, with the full table.
import projects from '../../content/projects.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STATUS = { active: 'Active', concept: 'Concept', 'coming-soon': 'Public soon', done: 'Completed', 'published-preprint': 'Preprint' };
const sorted = [...projects].sort((a, b) => b.year - a.year);
const years = [...new Set(projects.map((p) => p.year))].sort();

document.getElementById('main').innerHTML = `
  <section class="s-step s-hero" data-title="Inventory"><div class="s-card">
    <p class="s-kicker">Project Inventory</p><h1>Everything, in one list</h1>
    <p class="s-lede">${projects.length} projects from ${years[0]} to ${years.at(-1)}. Each pillar is a project; taller means more recent.</p>
    <p class="s-scroll">Scroll for the table</p>
  </div></section>
  <section class="s-step" data-title="Table"><div class="s-card">
    <table class="s-table"><thead><tr><th>Project</th><th>Type</th><th>Year</th><th>Status</th></tr></thead><tbody>
    ${sorted.map((p) => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.kind)}</td><td>${p.year}</td><td>${STATUS[p.status] || esc(p.status)}</td></tr>`).join('')}
    </tbody></table>
    <a class="s-more" href="/sections/projects">Featured projects in detail →</a>
  </div></section>`;

runPage({
  active: 'inventory',
  build({ THREE, scene, label }) {
    const g = new THREE.Group();
    g.position.set(3, -2, 0);
    scene.add(g);
    const span = years.length - 1 || 1;
    const perYear = {};
    projects.forEach((p) => {
      const yi = years.indexOf(p.year);
      const k = (perYear[p.year] = (perYear[p.year] || 0) + 1) - 1;
      const h = 0.8 + yi * 0.7;
      const active = p.status === 'active' || p.status === 'coming-soon';
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.55), new THREE.MeshStandardMaterial({ color: active ? 0x8b1a1a : 0x4a4048, emissive: active ? 0xd24a4a : 0x000000, emissiveIntensity: active ? 0.5 : 0, roughness: 0.4 }));
      m.position.set((yi - span / 2) * 1.6, h / 2, (k - 1) * 0.9);
      g.add(m);
      if (k === 0) label(`<b>${p.year}</b>`, () => m.getWorldPosition(new THREE.Vector3()).setY(-2.4), 's-pin');
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(span * 1.6 + 2, 0.08, 4), new THREE.MeshStandardMaterial({ color: 0x2a2228, roughness: 0.8 }));
    base.position.y = -0.04;
    g.add(base);
    return {
      keyframes: [{ pos: [0, 4, 18], look: [1, 0, 0] }, { pos: [6, 6, 15], look: [4, 0, 0] }],
      update(t) { g.rotation.y = -0.35 + Math.sin(t * 0.15) * 0.08; },
    };
  },
});

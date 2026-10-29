// Projects: a ring of floating glass panels; the ring turns so the project being read faces the camera.
import projects from '../../content/projects.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FEATURED = ['virtualpet', 'cassoulet', 'veritomix-office', 'animus', 'veritomix', 'flowlab', 'digitaltwin'];
const list = FEATURED.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const STATUS = { active: 'Active', concept: 'Concept', 'coming-soon': 'Public soon', done: 'Completed', 'published-preprint': 'Preprint' };

const steps = [
  { title: 'Projects', html: `<p class="s-kicker">Projects</p><h1>Things I've built</h1>
      <p class="s-lede">Simulators, AI agent systems and ventures: tools that make medical imaging measurable.</p>
      <p class="s-scroll">Scroll through ${list.length} projects</p>` },
  ...list.map((p) => ({ title: p.name, html: `<p class="s-kicker">${esc(p.kind)} · ${esc(p.year)} · ${STATUS[p.status] || ''}</p>
      <h2>${esc(p.name)}</h2><p class="s-lede">${esc(p.eli5 || '')}</p><p>${esc(p.summary)}</p>
      ${p.facts ? `<div class="s-chips">${p.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
      ${p.stack ? `<h3>Built with</h3><div class="s-chips">${p.stack.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
      ${p.note ? `<p class="s-meta">${esc(p.note)}</p>` : ''}` })),
  { title: 'Everything', html: `<h2>And the rest</h2><p>The full list, from student robotics to PET simulators.</p><a class="s-more" href="/sections/inventory.html">Project Inventory →</a>` },
];
document.getElementById('main').innerHTML = steps.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

// Draws a project card onto a canvas so it can live in 3D.
function cardTexture(THREE, p) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 400;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 640, 400);
  grd.addColorStop(0, 'rgba(40,22,28,0.95)'); grd.addColorStop(1, 'rgba(14,10,14,0.95)');
  g.fillStyle = grd; g.fillRect(0, 0, 640, 400);
  g.strokeStyle = 'rgba(210,74,74,0.7)'; g.lineWidth = 3; g.strokeRect(6, 6, 628, 388);
  g.fillStyle = '#d24a4a'; g.font = '500 24px DM Sans, sans-serif'; g.fillText(String(p.kind).toUpperCase(), 40, 70);
  g.fillStyle = '#f2ece4'; g.font = '44px "Zen Antique", serif'; g.fillText(p.name, 40, 140);
  g.fillStyle = 'rgba(242,236,228,0.7)'; g.font = '24px DM Sans, sans-serif';
  const words = String(p.eli5 || p.summary).split(' ');
  let line = '', y = 200;
  for (const w of words) {
    if (g.measureText(line + w).width > 560) { g.fillText(line, 40, y); line = ''; y += 34; if (y > 340) break; }
    line += w + ' ';
  }
  if (y <= 340) g.fillText(line, 40, y);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

runPage({
  active: 'projects',
  build({ THREE, scene, reduceMotion }) {
    const ring = new THREE.Group();
    ring.position.set(4.4, 0, -5);
    scene.add(ring);
    const R = 6.5;
    const cards = list.map((p, i) => {
      const a = (i / list.length) * Math.PI * 2;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3), new THREE.MeshBasicMaterial({ map: cardTexture(THREE, p), transparent: true, side: THREE.DoubleSide }));
      m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      m.rotation.y = a;
      ring.add(m);
      return { m, a };
    });
    // Fonts load after first paint; redraw once they're ready.
    document.fonts?.ready.then(() => cards.forEach((c, i) => { c.m.material.map = cardTexture(THREE, list[i]); }));
    const floor = new THREE.Mesh(new THREE.RingGeometry(R - 0.1, R + 0.1, 96), new THREE.MeshBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9;
    ring.add(floor);

    let rot = 0;
    return {
      keyframes: steps.map((_, i) => (i === 0 || i === steps.length - 1 ? { pos: [0, 3, 24], look: [0.8, 0, -2] } : { pos: [0.4, 0.8, 18.5], look: [1.4, 0, 0] })),
      update(t, p, dt) {
        const idx = Math.max(0, Math.min(list.length - 1, p - 1));
        const goal = p < 0.5 || p > list.length + 0.5 ? rot + dt * 0.08 : -(idx / list.length) * Math.PI * 2;
        rot += (goal - rot) * Math.min(1, dt * 3);
        ring.rotation.y = rot;
        cards.forEach((c, i) => {
          const focus = Math.max(0, 1 - Math.abs(idx - i));
          c.m.material.opacity = 0.35 + focus * 0.65;
          c.m.position.y = reduceMotion ? 0 : Math.sin(t * 0.8 + i) * 0.12;
        });
      },
    };
  },
});

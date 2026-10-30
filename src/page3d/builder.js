// Agentic AI: a 3D constellation of agent roles around a human core; pulses travel out and return.
import builder from '../../content/ai-builder.json';
import projects from '../../content/projects.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ROLES = ['Coordinator', 'Inventory', 'Segmentation', 'QC / correction', 'Activity map', 'Simulation', 'Validation'];
const builds = builder.builds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

document.getElementById('main').innerHTML = `
  <section class="s-step s-hero" data-title="Agentic AI"><div class="s-card">
    <p class="s-kicker">Agentic AI</p><h1>${esc(builder.headline)}</h1>
    <p class="s-lede">Agents do the work; I hold the gates. Each light is an agent role, and the core is the human check every result returns through.</p>
    <p class="s-scroll">Scroll for how it works</p>
  </div></section>
  ${builder.principles.map((p, i) => `<section class="s-step" data-title="${esc(p.title)}"><div class="s-card"><p class="s-kicker">Principle ${i + 1} of ${builder.principles.length}</p><h2>${esc(p.title)}</h2><p class="s-lede">${esc(p.text)}</p></div></section>`).join('')}
  <section class="s-step" data-title="Builds"><div class="s-card"><p class="s-kicker">Built this way</p><h2>Systems in use</h2>
    ${builds.map((p) => `<div class="s-role"><b>${esc(p.name)}</b> <span class="s-meta">${esc(p.kind)}</span><p>${esc(p.eli5 || p.summary)}</p></div>`).join('')}
  </div></section>
  <section class="s-step" data-title="Toolbelt"><div class="s-card"><h2>Toolbelt &amp; next</h2>
    <div class="s-chips">${builder.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
    <h3>Next on the bench</h3><ul class="s-list">${builder.roadmap.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <div class="s-cert"><span>Certifications</span><b>Anthropic certifications</b><p>Coming soon</p></div>
  </div></section>`;

runPage({
  active: 'builder',
  build({ THREE, scene, label, reduceMotion }) {
    const root = new THREE.Group();
    root.position.set(5.2, 0, 0);
    scene.add(root);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0xd24a4a, emissiveIntensity: 0.55, flatShading: true }));
    root.add(core);
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({ color: 0xd24a4a, wireframe: true, transparent: true, opacity: 0.25 }));
    root.add(shell);

    const nodes = ROLES.map((name, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / ROLES.length), th = i * 2.399963;
      const p = new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)).multiplyScalar(4);
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: 0xf2ece4, emissive: 0xffb36b, emissiveIntensity: 0.6, flatShading: true }));
      m.position.copy(p);
      root.add(m);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), p]), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: 0.18 }));
      root.add(line);
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff7a5a }));
      root.add(pulse);
      const w = new THREE.Vector3();
      label(`<b>${name}</b>`, () => m.getWorldPosition(w), 's-pin');
      return { m, p, pulse, phase: i / ROLES.length };
    });

    return {
      keyframes: [
        { pos: [0, 1, 22], look: [1.2, 0, 0] },
        ...builder.principles.map((_, i) => ({ pos: [1 + Math.sin(i * 1.3) * 3, 1 + Math.cos(i) * 2, 17], look: [2, 0, 0] })),
        { pos: [0, 4, 17], look: [0.8, 0, 0] },
        { pos: [0, 0, 22], look: [0.5, 0, 0] },
      ],
      update(t, p) {
        const spin = reduceMotion ? 0 : t * 0.08;
        root.rotation.y = spin + p * 0.4;
        shell.rotation.x = t * 0.1;
        core.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
        // Principle 2 ("humans hold the gates") makes the return pulses obvious.
        const gate = Math.max(0, 1 - Math.abs(p - 2));
        nodes.forEach((nd) => {
          const s = ((t * (0.25 + gate * 0.2) + nd.phase) % 1);
          const k = s < 0.5 ? s * 2 : 2 - s * 2; // out and back
          nd.pulse.position.copy(nd.p).multiplyScalar(k);
          nd.pulse.material.color.set(s < 0.5 ? 0xff7a5a : 0xf2ece4);
          nd.m.rotation.y = t + nd.phase * 6;
        });
      },
    };
  },
});

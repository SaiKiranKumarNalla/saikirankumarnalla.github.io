// Agentic AI: each agent system with its screenshot and "How it's built"
// (hierarchy, models, deployment, safeguards). The 3D shows a matching diagram per system:
// a constellation for the intro, an org tree for VeriTomiX Office, a model router for ANIMUS.
import builder from '../../content/ai-builder.json';
import projects from '../../content/projects.json';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = (items) => `<ul class="s-list">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
const fig = (f) => `<figure class="s-fig"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"><figcaption>${esc(f.caption)}</figcaption></figure>`;
const ROLES = ['Coordinator', 'Inventory', 'Segmentation', 'QC / correction', 'Activity map', 'Simulation', 'Validation'];
const builds = builder.builds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

function buildCard(p, i) {
  const a = p.architecture;
  return `<p class="s-kicker">Built this way · ${i + 1} of ${builds.length} · ${esc(p.kind)}</p><h2>${esc(p.name)}</h2>
    <p class="s-lede">${esc(p.eli5 || '')}</p><p>${esc(p.summary)}</p>
    ${p.facts ? `<div class="s-chips">${p.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
    ${a?.figures?.[0] ? fig(a.figures[0]) : ''}
    ${a ? `<details class="s-know"><summary>How it's built <span class="s-meta">hierarchy, models, deployment</span></summary>
      <h3>Hierarchy</h3>
      <ol class="s-tiers">${a.hierarchy.map((h) => `<li><span>${esc(h.level)}</span><b>${esc(h.who)}</b><p>${esc(h.does)}</p>${h.model ? `<em>${esc(h.model)}</em>` : ''}</li>`).join('')}</ol>
      <h3>Deployment</h3>${list(a.deployment)}
      ${a.figures.slice(1).map(fig).join('')}
      <h3>Safeguards</h3>${list(a.safeguards)}
    </details>` : ''}
    ${p.more ? `<details class="s-know"><summary>Know more <span class="s-meta">problem, approach, status</span></summary>
      <h3>The problem</h3><p>${esc(p.more.problem)}</p><h3>How it works</h3>${list(p.more.approach)}<h3>Status</h3>${list(p.more.status)}
      ${p.stack ? `<h3>Built with</h3><div class="s-chips">${p.stack.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      ${p.note ? `<p class="s-meta">${esc(p.note)}</p>` : ''}
    </details>` : ''}`;
}

document.getElementById('main').innerHTML = `
  <section class="s-step s-hero" data-title="Agentic AI"><div class="s-card">
    <p class="s-kicker">Agentic AI</p><h1>${esc(builder.headline)}</h1>
    <p class="s-lede">Agents do the work; I hold the gates. Each light is an agent role, and the core is the human check every result returns through.</p>
    <p class="s-scroll">Scroll for how it works</p>
  </div></section>
  ${builds.map((p, i) => `<section class="s-step" data-title="${esc(p.name)}"><div class="s-card">${buildCard(p, i)}</div></section>`).join('')}
  <section class="s-step" data-title="Toolbelt"><div class="s-card"><h2>Toolbelt &amp; next</h2>
    <div class="s-chips">${builder.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
    <h3>Next on the bench</h3>${list(builder.roadmap)}
    <div class="s-cert"><span>Certifications</span><b>Anthropic certifications</b><p>Coming soon</p></div>
  </div></section>`;

const STEP = { office: 1 + builds.findIndex((b) => b.id === 'veritomix-office'), animus: 1 + builds.findIndex((b) => b.id === 'animus') };

runPage({
  active: 'builder',
  build({ THREE, scene, label, reduceMotion }) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const vis = (p, a, w = 0.6) => Math.max(0, Math.min(1, 1 - Math.abs(p - a) / w));
    const show = (o, v) => { o.visible = v > 0.01; o.scale.setScalar(Math.max(0.001, v)); };
    const nodeMat = (c) => new THREE.MeshStandardMaterial({ color: 0xf2ece4, emissive: c, emissiveIntensity: 0.6, flatShading: true });
    const lineTo = (a, b, op = 0.25) => new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color: 0xf2ece4, transparent: true, opacity: op }));

    // ── Constellation (intro and toolbelt): agent roles around a human core.
    const star = new THREE.Group();
    star.position.set(5.2, 0, 0);
    scene.add(star);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0xd24a4a, emissiveIntensity: 0.55, flatShading: true }));
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({ color: 0xd24a4a, wireframe: true, transparent: true, opacity: 0.25 }));
    star.add(core, shell);
    const nodes = ROLES.map((name, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / ROLES.length), th = i * 2.399963;
      const p = V(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)).multiplyScalar(4);
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), nodeMat(0xffb36b));
      m.position.copy(p);
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff7a5a }));
      star.add(m, lineTo(V(0, 0, 0), p, 0.18), pulse);
      const w = V();
      return { m, p, pulse, phase: i / ROLES.length, l: label(`<b>${name}</b>`, () => m.getWorldPosition(w), 's-pin') };
    });

    // ── VeriTomiX Office: founder → coordinator → 7 department heads → local specialists.
    const tree = new THREE.Group();
    tree.position.set(3.4, 0.2, 0);
    scene.add(tree);
    const treeLabels = [];
    const tnode = (pos, size, color, text) => {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(size, 0), nodeMat(color));
      m.position.copy(pos); tree.add(m);
      if (text) { const w = V(); treeLabels.push(label(text, () => m.getWorldPosition(w), 's-pin')); }
      return m;
    };
    const founder = tnode(V(0, 3.2, 0), 0.42, 0xd24a4a, '<b>Founder</b><span>approves</span>');
    const atlas = tnode(V(0, 1.6, 0), 0.34, 0xffb36b, '<b>Atlas</b><span>coordinator · Codex</span>');
    tree.add(lineTo(founder.position, atlas.position, 0.5));
    const HEADS = [['Mira', 'R&D · Codex'], ['Noah', 'Phantoms'], ['Ada', 'Product'], ['Lina', 'Clinical'], ['Leo', 'Partners'], ['Iris', 'IP & Ops'], ['Finn', 'Finance']];
    const heads = HEADS.map(([n, d], i) => {
      const x = (i - 3) * 1.25;
      const h = tnode(V(x, -0.2, 0), 0.24, i === 0 ? 0xffb36b : 0x9fd0ff, `<b>${n}</b><span>${d}</span>`);
      tree.add(lineTo(atlas.position, h.position, 0.3));
      const s = tnode(V(x, -1.9, 0), 0.12, 0x7ccf98);
      tree.add(lineTo(h.position, s.position, 0.2));
      return h;
    });
    const legend = label('<b>Department heads</b><span>Gemini CLI unless noted · specialists: local Llama 3.2</span>', () => tree.getWorldPosition(V()).add(V(0, -2.7, 0)), 's-pin');
    treeLabels.push(legend);
    const taskDots = heads.map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc46b })); tree.add(m); return m; });

    // ── ANIMUS: router hub dispatching to model families, with workers around it.
    const router = new THREE.Group();
    router.position.set(3.2, 0.2, 0);
    scene.add(router);
    const routerLabels = [];
    const rnode = (pos, size, color, text, geo) => {
      const m = new THREE.Mesh(geo || new THREE.OctahedronGeometry(size, 0), nodeMat(color));
      m.position.copy(pos); router.add(m);
      const w = V(); routerLabels.push(label(text, () => m.getWorldPosition(w), 's-pin'));
      return m;
    };
    const hub = rnode(V(0, 0, 0), 0.5, 0xd24a4a, '<b>Router</b><span>per-task routes · budgets · fallback</span>', new THREE.TorusKnotGeometry(0.3, 0.09, 64, 8));
    const MODELS = [['Claude CLI', 0], ['Codex', 1], ['Gemini', 2], ['Anthropic API', 3]];
    const models = MODELS.map(([n, i]) => { const p = V((i - 1.5) * 1.6, 2.4, 0); const m = rnode(p, 0.28, 0x9fd0ff, `<b>${n}</b>`); router.add(lineTo(hub.position, p, 0.35)); return m; });
    const WORKERS = ['Sources', 'Scorer', 'Verifier', 'Writer'];
    const workers = WORKERS.map((n, i) => { const p = V((i - 1.5) * 1.6, -2.2, 0); const m = rnode(p, 0.24, 0x7ccf98, `<b>${n}</b>`); router.add(lineTo(hub.position, p, 0.25)); return m; });
    const gate = rnode(V(3.4, 0, 0), 0.26, 0xffc46b, '<b>Approval gate</b><span>Gemini proposes · Claude/Codex approve</span>');
    router.add(lineTo(hub.position, gate.position, 0.35));
    const flow = [...Array(10)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc46b })); router.add(m); return m; });

    const nSteps = 2 + builds.length;
    return {
      keyframes: [
        { pos: [0, 1, 22], look: [1.2, 0, 0] },
        ...builds.map(() => ({ pos: [1.4, 0.6, 15], look: [2.2, 0.3, 0] })),
        { pos: [0, 0, 22], look: [0.5, 0, 0] },
      ].slice(0, nSteps),
      update(t, p) {
        const time = reduceMotion ? 0 : t;
        const tv = vis(p, STEP.office), rv = vis(p, STEP.animus);
        const sv = Math.max(0, 1 - Math.max(tv, rv) * 1.4);
        show(star, sv); show(tree, tv * 0.78); show(router, rv * 0.8);
        nodes.forEach((n) => (n.l.visible = sv > 0.5));
        treeLabels.forEach((l) => (l.visible = tv > 0.75));
        routerLabels.forEach((l) => (l.visible = rv > 0.75));

        star.rotation.y = time * 0.08 + p * 0.4;
        shell.rotation.x = time * 0.1;
        core.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
        nodes.forEach((nd) => {
          const s = (time * 0.25 + nd.phase) % 1, k = s < 0.5 ? s * 2 : 2 - s * 2;
          nd.pulse.position.copy(nd.p).multiplyScalar(k);
          nd.pulse.material.color.set(s < 0.5 ? 0xff7a5a : 0xf2ece4);
          nd.m.rotation.y = time + nd.phase * 6;
        });
        // Office: tasks flow down from the coordinator to each head and results come back up.
        tree.rotation.y = Math.sin(time * 0.2) * 0.15;
        taskDots.forEach((d, i) => { const s = (time * 0.3 + i / 7) % 1, k = s < 0.5 ? s * 2 : 2 - s * 2; d.position.lerpVectors(atlas.position, heads[i].position, k); d.material.color.set(s < 0.5 ? 0xffc46b : 0x7ccf98); });
        founder.rotation.y = atlas.rotation.y = time;
        // ANIMUS: requests go to the routed model, results pass the gate to the workers.
        router.rotation.y = Math.sin(time * 0.2) * 0.15;
        hub.rotation.z = time * 0.6;
        const pick = Math.floor(time * 0.5) % models.length;
        models.forEach((m, i) => (m.material.emissiveIntensity = i === pick ? 1.4 : 0.4));
        flow.forEach((d, i) => {
          const s = (time * 0.4 + i / flow.length) % 1;
          const target = i % 2 ? models[pick].position : workers[i % workers.length].position;
          d.position.lerpVectors(hub.position, target, s);
        });
      },
    };
  },
});

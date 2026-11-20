// 3D parts of the Publications page, one builder per stage (layout.js stage builders):
//   heroStage    every paper as a sheet in a fan, one sliding out at a time.
//   stacksStage  one stack of sheets per status; the selected tab lifts its stack and fans it out.
import pubs from '../../content/publications.json';
import { onTab } from './layout.js';

export const GROUPS = [['published', 'Published'], ['preprint', 'Preprints'], ['in-preparation', 'In preparation'], ['conference', 'Conference']];
// Pal key per status, so the colour follows the theme.
const KEY = { published: 'accent', preprint: 'warm', 'in-preparation': 'inkSoft', conference: 'hot' };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => x * x * (3 - 2 * x);
const ordered = GROUPS.flatMap(([k]) => pubs.filter((p) => p.status === k).sort((a, b) => b.year - a.year));

// Materials that follow the theme.
function themed() {
  const list = [];
  return {
    bind(m, key) { list.push([m, key]); return m; },
    apply(pal) { list.forEach(([m, k]) => m.color.set(pal[k])); },
  };
}

// One sheet of paper: light stock in both themes, a dark outline from the theme, a coloured band and ink lines.
function makeSheet(THREE, T, status, w = 2.4, h = 3.4) {
  const g = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0xf8f2e8, roughness: 0.8, side: THREE.DoubleSide }));
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), T.bind(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }), 'inkSoft'));
  edge.position.z = 0.004;
  const band = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.22), T.bind(new THREE.MeshBasicMaterial(), KEY[status]));
  band.position.set(0, h / 2 - 0.11, 0.006);
  g.add(paper, edge, band);
  const lineM = new THREE.MeshBasicMaterial({ color: 0x4a4048, transparent: true, opacity: 0.8 });
  for (let l = 0; l < 9; l++) {
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(l === 0 ? w * 0.62 : w * (l % 4 === 3 ? 0.5 : 0.78), l === 0 ? 0.13 : 0.05), lineM);
    ln.position.set(l === 0 ? -w * 0.1 : 0, h / 2 - 0.55 - l * 0.3, 0.008);
    g.add(ln);
  }
  return g;
}

// ── Hero: a fan of sheets; they open out from a stack, then one slides forward at a time.
export function heroStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const T = themed();
  const n = ordered.length;
  const root = new THREE.Group();
  scene.add(root);
  const PIV = new THREE.Vector3(0, -3.2, 0);
  const holders = ordered.map((p, i) => {
    const h = new THREE.Group();
    h.position.copy(PIV).add(new THREE.Vector3(0, 0, i * 0.04));
    const s = makeSheet(THREE, T, p.status);
    s.position.y = 4.4;
    h.add(s);
    root.add(h);
    return { h, s, i };
  });
  ctx.view = { c: new THREE.Vector3(0, 1.1, 0), w: 12.2, h: 6.6, dir: new THREE.Vector3(0, 0.08, 1) };
  return {
    theme: (pal) => T.apply(pal),
    update(t) {
      const open = reduceMotion ? 1 : smooth(clamp01((t - 0.2) / 2.2));
      const pick = reduceMotion ? 3 : Math.floor(t / 1.8) % n;
      for (const { h, s, i } of holders) {
        const a = (i - (n - 1) / 2) * 0.15 * open;
        const lift = i === pick ? smooth(1 - Math.abs(((t % 1.8) / 1.8) * 2 - 1)) : 0;
        h.rotation.z = -a + (reduceMotion ? 0 : Math.sin(t * 0.5 + i * 0.9) * 0.006);
        s.position.y = 4.4 + lift * 0.9;
        s.position.z = lift * 0.5;
      }
      root.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.18) * 0.1;
    },
  };
}

// ── Stacks: one pile per status; the selected one lifts and fans out.
export function stacksStage(ctx) {
  const { THREE, scene, reduceMotion, tag } = ctx;
  const T = themed();
  const root = new THREE.Group();
  scene.add(root);
  const SP = 3.7;
  const stacks = GROUPS.map(([k, name], gi) => {
    const list = pubs.filter((p) => p.status === k);
    const g = new THREE.Group();
    g.position.x = (gi - 1.5) * SP;
    root.add(g);
    const sheets = list.map((p, i) => {
      const s = makeSheet(THREE, T, k, 2.3, 3.2);
      s.rotation.x = -Math.PI / 2;
      s.rotation.z = Math.sin(i * 2.1 + gi) * 0.12;
      g.add(s);
      return s;
    });
    const t = tag(`<b>${name}</b><span>${list.length}</span>`, () => new THREE.Vector3(g.position.x, -0.6, 2.6));
    return { k, g, sheets, n: list.length, lift: 0, t };
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(SP * 4.4, 4.6), T.bind(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.07 }), 'ink'));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.05;
  root.add(floor);
  let sel = -1; // -1 = all
  onTab('papers', (i) => { sel = i - 1; ctx.invalidate(); });
  ctx.view = { c: new THREE.Vector3(0, 0.9, 0.2), w: SP * 4 - 0.8, h: 4.4, dir: new THREE.Vector3(0, 0.62, 1) };
  return {
    theme: (pal) => T.apply(pal),
    update(t, dt) {
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 5);
      stacks.forEach((s, gi) => {
        const want = sel === gi ? 1 : 0;
        s.lift += (want - s.lift) * k;
        const dim = sel === -1 || sel === gi ? 1 : 0.35;
        s.sheets.forEach((sh, i) => {
          const spread = 0.1 + s.lift * 0.34;
          sh.position.y = i * spread + s.lift * 0.5;
          sh.position.z = s.lift * (i - (s.n - 1) / 2) * 0.12;
          sh.traverse((o) => { if (o.material) { o.material.transparent = true; o.material.opacity = (o.userData.o ??= o.material.opacity) * dim; } });
        });
      });
      root.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.06;
    },
  };
}

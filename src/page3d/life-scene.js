// 3D parts of the Off the Clock page, one builder per stage (layout.js stage builders):
//   heroStage    emblems of the four chapters orbiting: globe, plate under a cloche, die, record, book, film reel.
//   travelStage  the globe with real country shapes, pins and flight arcs; it turns toward Europe as it scrolls by.
//   foodStage    a table with a covered plate per cuisine; the lids lift in turn.
//   playStage    the hobbies tabs ('hobbies'): board-game cards dealt from a stack, or cover-flow of games played.
//   jukeStage    a record that spins with the audio, a tonearm, and a spectrum ring from the Web Audio analyser.
//   shelfStage   the comics on a shelf; the one hovered in the HTML slides out.
import life from '../../content/life.json';
import { makeGlobe } from './globe.js';
import { onTab } from './layout.js';

// Filled in by life.js: the shared audio element and analyser, and the book hovered in the list.
export const audioState = { audio: null, analyser: null, fft: null, cur: -1, tracks: [] };
export const shelfState = { focus: -1, redraw: null };

const t = life.travel;
const dev = life.gameDev;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const stag = (e, i, n, span = 0.55) => smooth(e * (1 + span) - (i / Math.max(1, n - 1)) * span); // staggered reveal 0..1

// Approximate country centres (lat, lon) used only to place pins and flight arcs on the globe.
const GEO = {
  356: [20.6, 78.9], 250: [46.6, 2.4], 724: [40.2, -3.7], 620: [39.6, -8.0], 276: [51.1, 10.4], 380: [42.8, 12.5],
  203: [49.8, 15.5], '040': [47.6, 14.1], 528: [52.2, 5.5], '056': [50.6, 4.6], 442: [49.8, 6.1], 704: [14.1, 108.3],
};

// Materials that follow the theme: a pal key (accent, ink, ...) or a [dark, light] hex pair.
function themed() {
  const list = [];
  return {
    key(m, k) { list.push([m, k]); return m; },
    tint(m, dark, light) { list.push([m, dark, light]); m.color.setHex(dark); return m; },
    apply(pal) { list.forEach(([m, a, b]) => (typeof a === 'string' ? m.color.set(pal[a]) : m.color.setHex(pal.night ? a : b))); },
  };
}

// A book or card: cover art on the front face of a box, the rest paper and spine.
function cover(THREE, loader, ctx, src, h, depth, { spine = 0x2a2024, pages = 0xe9e0d0 } = {}) {
  const tex = loader.load(src, (tx) => { mesh.scale.x = h * (tx.image.width / tx.image.height); ctx.invalidate(); });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const side = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
  const mats = [side(pages), side(spine), side(pages), side(pages), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }), side(spine)];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
  mesh.scale.set(h * 0.72, h, depth);
  const holder = new THREE.Group();
  holder.add(mesh);
  return holder;
}

// Fade groups: every material gets its opacity multiplied by the group's visibility.
function fader(scene) {
  const fades = new Map();
  return {
    add(group) {
      const mats = new Set();
      group.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => mats.add(m)); });
      mats.forEach((m) => { m.transparent = true; m.userData.op = m.opacity; });
      fades.set(group, mats);
      group.visible = false;
      scene.add(group);
      return group;
    },
    set(group, v) {
      group.visible = v > 0.01;
      if (group.visible) fades.get(group).forEach((m) => { m.opacity = m.userData.op * v; });
      return group.visible;
    },
  };
}

const pipTexture = (THREE, n) => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 96;
  const c = cv.getContext('2d'); c.fillStyle = '#f4efe6'; c.fillRect(0, 0, 96, 96);
  c.fillStyle = '#7a1a1a';
  const P = { 1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.28, .28], [.5, .5], [.72, .72]], 4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]], 5: [[.28, .28], [.72, .28], [.5, .5], [.28, .72], [.72, .72]], 6: [[.3, .25], [.7, .25], [.3, .5], [.7, .5], [.3, .75], [.7, .75]] }[n];
  P.forEach(([x, y]) => { c.beginPath(); c.arc(x * 96, y * 96, 8, 0, 7); c.fill(); });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: tx, roughness: 0.4 });
};
const makeDie = (THREE) => new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), [3, 4, 1, 6, 2, 5].map((n) => pipTexture(THREE, n)));

// ── Hero: emblems of the chapters, orbiting.
export function heroStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const T = themed();
  const root = new THREE.Group();
  scene.add(root);
  // Globe: a wire sphere with a faint core.
  const globe = new THREE.Group();
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), T.key(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.1 }), 'accent')));
  globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.02, 14, 9)), T.key(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }), 'ink')));
  // Plate under a cloche.
  const cloche = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.85, 0.1, 40), new THREE.MeshStandardMaterial({ color: 0xf2ece4, roughness: 0.35 }));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 0.45, roughness: 0.3 }));
  dome.position.y = 0.06;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), dome.material);
  knob.position.y = 1.02;
  cloche.add(plate, dome, knob);
  // Record.
  const vinyl = new THREE.Group();
  vinyl.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.07, 48), new THREE.MeshStandardMaterial({ color: 0x141116, roughness: 0.25, metalness: 0.6 })));
  vinyl.add(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32), T.key(new THREE.MeshStandardMaterial({ roughness: 0.5, emissive: 0x401010, emissiveIntensity: 0.4 }), 'accent')));
  vinyl.rotation.x = Math.PI / 2 - 0.3;
  // Book.
  const book = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.4), [0xe9e0d0, 0x5a1a1a, 0xe9e0d0, 0xe9e0d0, 0x8b1a1a, 0x5a1a1a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })));
  // Film reel.
  const reel = new THREE.Group();
  const reelMat = new THREE.MeshStandardMaterial({ color: 0x2b2529, metalness: 0.5, roughness: 0.4 });
  reel.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.22, 40), reelMat));
  const hole = T.key(new THREE.MeshStandardMaterial({ roughness: 0.5 }), 'accent');
  for (let k = 0; k < 6; k++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 20), hole); const a = (k / 6) * Math.PI * 2; h.position.set(Math.cos(a) * 0.58, 0, Math.sin(a) * 0.58); reel.add(h); }
  reel.rotation.x = Math.PI / 2 - 0.3;
  const die = makeDie(THREE);
  const items = [globe, cloche, vinyl, book, reel, die];
  items.forEach((o) => root.add(o));
  ctx.view = { c: new THREE.Vector3(0, 0, 0), w: 11.6, h: 6.4, dir: new THREE.Vector3(0, 0.3, 1) };
  return {
    theme: (pal) => T.apply(pal),
    update(time) {
      const n = items.length;
      items.forEach((o, i) => {
        const a = time * 0.28 + (i / n) * Math.PI * 2;
        o.position.set(Math.cos(a) * 4.2, Math.sin(time * 0.7 + i * 1.7) * 0.25 + Math.sin(a) * 0.5, Math.sin(a) * 2.2);
        const near = 0.8 + 0.25 * (Math.sin(a) * 0.5 + 0.5);
        o.scale.setScalar(near * (o === die ? 1.1 : 1));
      });
      globe.rotation.y = time * 0.4;
      cloche.rotation.y = time * 0.3;
      vinyl.rotation.z = time * 0.6;
      book.rotation.y = time * 0.5;
      reel.rotation.z = time * 0.7;
      die.rotation.set(time * 0.6, time * 0.8, 0.3);
      root.rotation.z = reduceMotion ? 0 : Math.sin(time * 0.2) * 0.03;
    },
  };
}

// ── Travel: globe, pins and animated flight arcs.
export function travelStage(ctx) {
  const { THREE, scene, camera, reduceMotion, lowPower, tag } = ctx;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const T = themed();
  const R = 3.4;
  const earth = makeGlobe({ R, lowPower, lived: t.lived.map((c) => c.id), visited: t.visited.map((c) => c.id) });
  scene.add(earth.group);
  const arcs = [], pins = [];
  const livedIds = t.lived.map((c) => c.id), base = GEO[250];
  const mkArc = (a, b, i, key) => {
    const A = earth.ll(a[0], a[1], R), B = earth.ll(b[0], b[1], R);
    const lift = 1 + 0.08 + A.distanceTo(B) / R * 0.28;
    const M = A.clone().add(B).normalize().multiplyScalar(R * lift);
    const pts = new THREE.QuadraticBezierCurve3(A, M, B).getPoints(56);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const faint = new THREE.Line(geo, T.key(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }), key));
    const comet = new THREE.Line(geo, T.key(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95 }), 'hot'));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), T.key(new THREE.MeshBasicMaterial(), 'hot'));
    earth.group.add(faint, comet, head);
    arcs.push({ faint, comet, head, pts, i, n: 56 });
  };
  mkArc(GEO[356], base, 0, 'accent');
  t.visited.forEach((c, i) => { if (GEO[c.id] && c.id !== '250') mkArc(base, GEO[c.id], i + 1, 'warm'); });
  const wp = V();
  [...t.lived, ...t.visited].forEach((c) => {
    const g = GEO[c.id]; if (!g) return;
    const lived = livedIds.includes(c.id);
    const key = lived ? 'accent' : 'warm';
    const pin = new THREE.Group();
    pin.position.copy(earth.ll(g[0], g[1], R));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(lived ? 0.085 : 0.055, 12, 10), T.key(new THREE.MeshBasicMaterial(), key));
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.125, 28), T.key(new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }), key));
    ring.lookAt(pin.position.clone().multiplyScalar(2));
    pin.add(dot, ring);
    earth.group.add(pin);
    const q = { pin, ring, lived, seed: pins.length * 0.7, tg: null };
    if (lived) q.tg = tag(`<b>${esc(c.name)}</b>`, () => pin.getWorldPosition(wp), 'lk-tag-chip lk-hot');
    pins.push(q);
  });
  ctx.view = { c: V(0, 0, 0), w: 9.6, h: 9.6, dir: V(0, 0.1, 1) };
  const tmpA = V(), tmpB = V(), tmpC = V();
  let t0 = -1;
  return {
    theme(pal) { earth.setTheme(pal.night); T.apply(pal); },
    update(time, dt, s) {
      if (t0 < 0) t0 = time;
      const reveal = reduceMotion ? 1 : smooth((time - t0 - 0.3) / 1.8);
      const prog = smooth(s.progress * 1.5 - 0.15);
      const lon = 38 - 28 * prog; // India and France in view, then Europe
      earth.group.rotation.set(THREE.MathUtils.degToRad(28), -THREE.MathUtils.degToRad(lon) + (reduceMotion ? 0 : Math.sin(time * 0.15) * 0.07), 0);
      earth.group.updateMatrixWorld();
      for (const a of arcs) {
        const r = smooth(reveal * 1.7 - a.i * 0.12);
        const shown = Math.floor(r * a.n);
        a.faint.geometry.setDrawRange(0, shown);
        const c = reduceMotion ? 1 : (time * 0.3 + a.i * 0.17) % 1;
        const head = Math.min(shown - 1, Math.floor(c * (a.n - 1)));
        const tail = Math.max(0, head - 14);
        a.comet.geometry.setDrawRange(tail, Math.max(0, head - tail));
        a.head.visible = head > 0;
        if (head > 0) a.head.position.copy(a.pts[head]);
        a.faint.visible = a.comet.visible = shown > 1;
      }
      earth.group.getWorldPosition(tmpC);
      for (const q of pins) {
        const pulse = reduceMotion ? 0.5 : (time * 0.8 + q.seed) % 1;
        q.ring.scale.setScalar(0.8 + pulse * (q.lived ? 1.4 : 0.9));
        q.ring.material.opacity = (1 - pulse) * 0.8 * reveal;
        q.pin.scale.setScalar(Math.max(0.001, reveal));
        if (q.tg) {
          q.pin.getWorldPosition(tmpA);
          tmpB.copy(tmpA).sub(tmpC).normalize();
          q.tg.show = reveal > 0.6 && tmpB.dot(camera.position.clone().sub(tmpA).normalize()) > 0.15;
        }
      }
    },
  };
}

// ── Food: table with a covered plate per cuisine, lids lift in turn.
export function foodStage(ctx) {
  const { THREE, scene, reduceMotion, lowPower, tag } = ctx;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const T = themed();
  const tableG = new THREE.Group();
  scene.add(tableG);
  const top = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 5.8), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.7 }), 0x241a1c, 0xc9b79e));
  top.position.y = -1.5;
  const edge = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.2, 5.9), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 }), 0x6a2a2a, 0x8b5a4a));
  edge.position.y = -1.5;
  tableG.add(top, edge);
  const ACC = [0xc8892a, 0xb8473a, 0x6f8f4e, 0x7a5a8a];
  const wp = V();
  const steamMat = T.key(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), 'inkSoft');
  const plates = life.food.plates.map((p, i) => {
    const g = new THREE.Group();
    g.position.set(i % 2 ? 2.05 : -2.05, -1.3, i < 2 ? -1.2 : 1.35);
    const ghost = !!p.placeholder;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.0, 0.12, 48), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.35 }), 0xe6ddd0, 0xf7f2ea));
    plate.position.y = 0.06;
    const well = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.02, 40), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.4 }), 0xcfc6b8, 0xe6dfd2));
    well.position.y = 0.13;
    const food = new THREE.Group();
    food.position.y = 0.14;
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: ghost ? 0x777777 : ACC[i % 4], roughness: 0.8 }));
    mound.scale.y = 0.7;
    food.add(mound);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + i, bit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: ghost ? 0x888888 : ACC[(i + 1 + (k % 2)) % 4], roughness: 0.7 }));
      bit.position.set(Math.cos(a) * 0.62, 0.08, Math.sin(a) * 0.62);
      food.add(bit);
    }
    const lid = new THREE.Group();
    const lidMat = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 0.5, roughness: 0.3, transparent: true });
    lid.add(new THREE.Mesh(new THREE.SphereGeometry(1.12, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidMat));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), lidMat);
    knob.position.y = 1.15; lid.add(knob);
    lid.position.y = 0.14;
    const steam = [...Array(lowPower ? 2 : 4)].map((_, k) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), steamMat); g.add(s); return { s, k }; });
    g.add(plate, well, food, lid);
    tableG.add(g);
    const tg = tag(`<b>${esc(p.name)}</b>`, () => g.localToWorld(wp.set(0, 0.1, 1.5)), 'lk-tag-chip');
    tg.show = false;
    return { g, lid, lidMat, steam, food, ghost, i, tg };
  });
  ctx.view = { c: V(0, -1.0, 0), w: 10.2, h: 6.8, dir: V(0, 0.52, 1) };
  let t0 = -1;
  return {
    theme: (pal) => T.apply(pal),
    update(time) {
      if (t0 < 0) t0 = time;
      steamMat.opacity = reduceMotion ? 0 : 0.12;
      tableG.rotation.y = reduceMotion ? -0.12 : -0.18 + Math.sin(time * 0.3) * 0.04;
      for (const pl of plates) {
        const r = reduceMotion ? 1 : smooth((time - t0 - 0.5 - pl.i * 0.45) / 1.4);
        pl.lid.position.y = 0.14 + r * 2.6;
        pl.lid.rotation.z = r * 0.35 * (pl.i % 2 ? 1 : -1);
        pl.lidMat.opacity = 1 - smooth((r - 0.25) / 0.6);
        pl.lid.visible = pl.lidMat.opacity > 0.01;
        pl.food.scale.setScalar(0.4 + r * 0.6);
        pl.steam.forEach(({ s, k }) => {
          const f = (time * 0.35 + k / pl.steam.length + pl.i * 0.2) % 1;
          s.position.set(Math.sin(f * 6 + k) * 0.18, 0.5 + f * 1.4, Math.cos(f * 5 + k) * 0.18);
          s.scale.setScalar(0.6 + f);
        });
        pl.tg.show = r > 0.8;
      }
    },
  };
}

// ── Hobbies: board-game cards dealt from a stack, or a cover-flow of games played (tabs 'hobbies').
export function playStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const T = themed();
  const loader = new THREE.TextureLoader();
  const fade = fader(scene);

  const boardG = new THREE.Group();
  const felt = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.18, 64), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.9 }), 0x1e1618, 0xd6c9b6));
  felt.position.y = -2.3;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(5, 0.07, 8, 96), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 }), 0x7a2c2c, 0x8b5a4a));
  rim.rotation.x = Math.PI / 2; rim.position.y = -2.21;
  boardG.add(felt, rim);
  const cards = life.boardGames.list.map((b, i, arr) => {
    const piv = new THREE.Group();
    piv.position.set(0, -2.1, 0);
    const c = cover(THREE, loader, ctx, b.cover, 2.5, 0.05);
    c.position.set(0, 3.0, i * 0.045);
    piv.add(c);
    boardG.add(piv);
    return { piv, k: i - (arr.length - 1) / 2, i, n: arr.length };
  });
  const die = makeDie(THREE);
  boardG.add(die);
  const pawns = [0xb8473a, 0xc8892a, 0x4e7a8f].map((col, i) => {
    const m = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45 });
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.12, 20), mat);
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 20), mat); body.position.y = 0.34;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mat); head.position.y = 0.72;
    m.add(b, body, head);
    m.position.set(-1.6 + i * 0.7, -2.1, 2.0 + (i % 2) * 0.35);
    boardG.add(m);
    return m;
  });
  fade.add(boardG);

  const gamesG = new THREE.Group();
  const gline = new THREE.Mesh(new THREE.BoxGeometry(9, 0.05, 0.9), T.key(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 }), 'accent'));
  gline.position.y = -1.9;
  gamesG.add(gline);
  const GN = life.games.list.length;
  const gcards = life.games.list.map((g, i) => { const c = cover(THREE, loader, ctx, g.cover, 2.9, 0.1); gamesG.add(c); return { c, i }; });
  fade.add(gamesG);

  ctx.view = { c: V(0, 0.2, 0), w: 11, h: 8, dir: V(0, 0.28, 1) };
  let sel = 0, eb = 0, eq = 0;
  onTab('hobbies', (i) => { sel = i; ctx.invalidate(); });
  const goal = [{ c: V(0, 0.3, 0), w: 11, h: 8.4 }, { c: V(0, -0.2, 0), w: 12.2, h: 5 }];
  return {
    theme: (pal) => T.apply(pal),
    update(time, dt) {
      const T0 = reduceMotion ? 0 : time;
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2);
      eb += ((sel === 0 ? 1 : 0) - eb) * k;
      eq += ((sel === 1 ? 1 : 0) - eq) * k;
      const g = goal[sel] || goal[0];
      ctx.view.c.lerp(g.c, k); ctx.view.w += (g.w - ctx.view.w) * k; ctx.view.h += (g.h - ctx.view.h) * k;
      if (fade.set(boardG, smooth(eb))) {
        boardG.rotation.y = Math.sin(T0 * 0.3) * 0.05;
        for (const c of cards) {
          const r = stag(smooth(eb), c.i, c.n, 0.9);
          c.piv.rotation.z = THREE.MathUtils.lerp(0.95, -c.k * 0.19, r);
          c.piv.position.x = THREE.MathUtils.lerp(2.8, 0, r);
          c.piv.children[0].position.y = 3.0 + Math.sin(T0 * 0.9 + c.i) * 0.04;
        }
        die.position.set(3.1, 0.6 + Math.sin(T0 * 1.1) * 0.15, 0.8);
        die.rotation.set(T0 * 0.6, T0 * 0.8, 0.3);
        die.scale.setScalar(0.5 + eb * 0.5);
        pawns.forEach((m, i) => { m.position.y = -2.1 + Math.max(0, 1 - stag(smooth(eb), i + 2, 6, 0.8)) * 1.5; m.rotation.y = T0 * 0.5 + i; });
      }
      if (fade.set(gamesG, smooth(eq))) {
        const focus = T0 * 0.25;
        gcards.forEach(({ c, i }) => {
          const d = (((i - focus) % GN) + GN * 1.5) % GN - GN / 2; // wrapped offset in [-GN/2, GN/2)
          const ad = Math.abs(d);
          c.position.set(d * 2.9 * (0.7 + 0.3 * eq), Math.sin(T0 * 0.8 + i * 1.7) * 0.06 - 0.2, -ad * 0.9);
          c.rotation.y = -clamp(d, -1.2, 1.2) * 0.55;
          c.scale.setScalar(Math.max(0.001, smooth(1.9 - ad) * (1 - Math.min(0.25, ad * 0.12))));
        });
      }
    },
  };
}

// ── Jukebox: spinning record, tonearm, spectrum ring driven by the audio analyser.
export function jukeStage(ctx) {
  const { THREE, scene, reduceMotion, lowPower } = ctx;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const T = themed();
  const loader = new THREE.TextureLoader();
  const stageG = new THREE.Group();
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.3, 72), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.2 }), 0x1a1316, 0xcfc2ae));
  platform.position.y = -2.7;
  const platRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.05, 8, 96), T.key(new THREE.MeshBasicMaterial(), 'accent'));
  platRing.rotation.x = Math.PI / 2; platRing.position.y = -2.54;
  stageG.add(platform, platRing);
  const beamMat = T.key(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 'hot');
  const beams = [-3, 0, 3].map((x) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 1.1, 4.6, 24, 1, true), beamMat);
    b.position.set(x * 0.8, 0.3, -1); stageG.add(b); return b;
  });
  scene.add(stageG);

  const juke = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.set(0.12, -0.28, 0);
  const spinner = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.09, 72), new THREE.MeshStandardMaterial({ color: 0x121014, roughness: 0.22, metalness: 0.6 }));
  disc.rotation.x = Math.PI / 2;
  const labelM = T.key(new THREE.MeshStandardMaterial({ emissive: 0xd24a4a, emissiveIntensity: 0.35, roughness: 0.5 }), 'accent');
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.1, 40), labelM);
  lab.rotation.x = Math.PI / 2;
  spinner.add(disc, lab);
  for (let r = 0.95; r < 2.15; r += 0.17) { const gr = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 96), new THREE.MeshBasicMaterial({ color: 0x3d3641 })); gr.position.z = 0.05; spinner.add(gr); }
  const artTex = {};
  const artFor = (src) => artTex[src] || (artTex[src] = loader.load(src, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.needsUpdate = true; ctx.invalidate(); }));
  const art = [0, 1].map((k) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    m.position.z = 0.056 + k * 0.001; m.visible = false; m.userData.o = 0; spinner.add(m); return m;
  });
  let artShown = 0, artCur = -2;
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: 0xf2ece4 }));
  notch.position.set(0.5, 0, 0.07); spinner.add(notch);
  tilt.add(spinner);
  const NB = lowPower ? 32 : 48;
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1, 0.1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ transparent: true }), NB);
  const col = new THREE.Color();
  const paintBars = (night) => { for (let i = 0; i < NB; i++) { col.setHSL(0.02 + 0.1 * Math.abs(Math.sin((i / NB) * Math.PI)), 0.85, night ? 0.58 : 0.4); bars.setColorAt(i, col); } bars.instanceColor.needsUpdate = true; };
  paintBars(true);
  bars.position.z = -0.08;
  tilt.add(bars);
  const arm = new THREE.Group();
  arm.position.set(3.2, 2.5, 0.35);
  const armBar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.07, 0.07), new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 0.5, roughness: 0.3 }));
  armBar.position.x = 1.5;
  const armHead = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.1), new THREE.MeshStandardMaterial({ color: 0x2b2529 }));
  armHead.position.x = 3.0;
  const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 20), new THREE.MeshStandardMaterial({ color: 0x2b2529, metalness: 0.5 }));
  armBase.rotation.x = Math.PI / 2;
  arm.add(armBar, armHead, armBase);
  arm.scale.setScalar(0.9);
  tilt.add(arm);
  juke.add(tilt);
  scene.add(juke);
  const hts = new Float32Array(NB);
  const dummy = new THREE.Object3D();
  let spin = 0, spinV = 0.15, armA = -1.66, level = 0;
  ctx.view = { c: V(0.2, -0.2, 0), w: 11.2, h: 11, dir: V(0, 0.1, 1) };
  return {
    theme(pal) { T.apply(pal); paintBars(pal.night); beamMat.blending = pal.glow; beamMat.opacity = pal.night ? 0.07 : 0.12; beamMat.needsUpdate = true; },
    update(time, dt) {
      const { audio, analyser, fft, cur, tracks } = audioState;
      const playing = !!audio && !audio.paused && cur >= 0;
      let live = false;
      if (playing && analyser && fft) {
        analyser.getByteFrequencyData(fft);
        for (let i = 0; i < 12; i++) if (fft[i]) { live = true; break; }
      }
      const T0 = reduceMotion ? 0 : time;
      spinV += ((playing ? 1.5 : 0.12) - spinV) * (1 - Math.exp(-dt * 2.5));
      spin += dt * spinV * (reduceMotion && !playing ? 0 : 1);
      spinner.rotation.z = -spin;
      if (cur !== artCur) {
        artCur = cur;
        const src = cur >= 0 ? tracks[cur]?.cover : null;
        if (src) { artShown = 1 - artShown; art[artShown].material.map = artFor(src); art[artShown].material.needsUpdate = true; }
      }
      art.forEach((m, k) => {
        const want = k === artShown && cur >= 0 && m.material.map?.image ? 1 : 0;
        m.userData.o += (want - m.userData.o) * (1 - Math.exp(-dt * 6));
        m.material.opacity = m.userData.o; m.visible = m.userData.o > 0.01;
      });
      armA += ((playing ? -2.16 : -1.58) - armA) * (1 - Math.exp(-dt * 2.2));
      arm.rotation.z = armA;
      let sum = 0;
      for (let i = 0; i < NB; i++) {
        const m = i < NB / 2 ? i : NB - 1 - i;
        let target;
        if (live) target = fft[1 + Math.floor((m / (NB / 2)) ** 1.35 * 70)] / 255;
        else if (playing) target = 0.25 + 0.35 * Math.abs(Math.sin(time * 4 + m * 0.7)) * Math.abs(Math.cos(time * 1.7 + m));
        else target = 0.07 + (reduceMotion ? 0 : 0.05 * Math.sin(time * 1.4 + i * 0.5));
        hts[i] += (target - hts[i]) * (1 - Math.exp(-dt * 14));
        sum += hts[i];
        const a = (i / NB) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 2.55, Math.sin(a) * 2.55, 0);
        dummy.rotation.set(0, 0, a - Math.PI / 2);
        dummy.scale.set(1.3 * (lowPower ? 1.5 : 1), 0.12 + hts[i] * 1.9, 1);
        dummy.updateMatrix();
        bars.setMatrixAt(i, dummy.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
      level += (sum / NB - level) * 0.2;
      labelM.emissiveIntensity = 0.3 + level * 1.4;
      juke.position.y = -0.1 + Math.sin(T0 * 0.6) * 0.06;
      beams.forEach((b, i) => { b.visible = true; b.scale.y = 1 + 0.04 * Math.sin(T0 * 0.7 + i * 2); });
      // While audio plays in reduced-motion mode the page still needs frames.
      if (reduceMotion && playing) ctx.invalidate();
    },
  };
}

// ── Bookshelf: the comics; the one hovered in the list slides out.
export function shelfStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const T = themed();
  const loader = new THREE.TextureLoader();
  const shelf = new THREE.Group();
  scene.add(shelf);
  const back = new THREE.Mesh(new THREE.BoxGeometry(8.4, 4.4, 0.12), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.9 }), 0x1b1417, 0xcdbfaa));
  back.position.set(0, -0.2, -0.95);
  const plank = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.2, 1.7), T.tint(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.1 }), 0x3a2024, 0x9a6f5a));
  plank.position.set(0, -1.95, 0);
  shelf.add(back, plank);
  const SPINES = [0x5a1a1a, 0x1f2f45, 0x2f3a24];
  const books = life.fiction.books.map((b, i, arr) => {
    const c = cover(THREE, loader, ctx, b.cover, 3.3, 0.55, { spine: SPINES[i % 3] });
    const k = i - (arr.length - 1) / 2;
    c.userData.home = V(k * 2.55, -1.85 + 1.65, 0.1);
    c.position.copy(c.userData.home);
    c.rotation.y = -k * 0.14;
    c.userData.k = k; c.userData.pull = 0;
    shelf.add(c);
    return c;
  });
  ctx.view = { c: V(0, -0.2, 0.3), w: 9.4, h: 5.6, dir: V(0.05, 0.06, 1) };
  shelfState.redraw = () => ctx.invalidate();
  let t0 = -1;
  return {
    theme: (pal) => T.apply(pal),
    update(time, dt) {
      if (t0 < 0) t0 = time;
      const auto = shelfState.focus < 0 && !reduceMotion ? Math.floor(time / 2.6) % books.length : -1;
      const act = shelfState.focus >= 0 ? shelfState.focus : auto;
      const rise = reduceMotion ? 1 : smooth((time - t0) / 1.4);
      books.forEach((b, i) => {
        const r = stag(rise, i, books.length, 0.8);
        b.userData.pull += ((i === act ? 1 : 0) - b.userData.pull) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 5));
        const pu = b.userData.pull, h = b.userData.home;
        b.position.set(h.x, h.y - (1 - r) * 3.2 + pu * 0.25, h.z + pu * 1.1);
        b.rotation.y = -b.userData.k * 0.14 * (1 - pu) + pu * 0.1;
      });
      shelf.rotation.y = reduceMotion ? 0 : Math.sin(time * 0.3) * 0.04;
    },
  };
}

// Off the Clock: Travel (globe with flight arcs), Food (table of plates), Hobbies (board games, games played),
// and Fragrantmash Creative Studio (audio-reactive jukebox, bookshelf, game reel).
import './life.css';
import life from '../../content/life.json';
import music from '../../content/music.json';
import { runPage } from './engine.js';
import { makeGlobe } from './globe.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t = life.travel;
const countries = t.lived.length + t.visited.length;
const playlists = life.music.playlists;
const allTracks = playlists.flatMap((pl, pi) => (pl.tracks || []).filter((x) => typeof x !== 'string').map((tr) => ({ ...tr, pl: pi })));
const trackCount = allTracks.length || music.trackCount || 0;
const food = life.food;
const dev = life.gameDev;

// Approximate country centres (lat, lon) used only to place pins and flight arcs on the globe.
const GEO = {
  356: [20.6, 78.9], 250: [46.6, 2.4], 724: [40.2, -3.7], 620: [39.6, -8.0], 276: [51.1, 10.4], 380: [42.8, 12.5],
  203: [49.8, 15.5], '040': [47.6, 14.1], 528: [52.2, 5.5], '056': [50.6, 4.6], 442: [49.8, 6.1], 704: [14.1, 108.3],
};

const S = { hero: 0, travel: 1, food: 2, board: 3, games: 4, studio: 5, music: 6, books: 7, reel: 8 };

const trackBtn = (tr, i, fb) => `<button class="l-track" type="button" data-i="${i}" aria-label="Play ${esc(tr.title)}"><span class="l-thumb">${tr.cover || fb ? `<img src="${esc(tr.cover || fb)}" alt="" width="44" height="44" loading="lazy">` : ''}<span class="l-ico" aria-hidden="true"></span></span><span><b>${esc(tr.title)}</b><i>${esc(tr.meta)}</i></span></button>`;
let ti = -1;
const STEPS = [
  { title: 'Off the clock', html: `<p class="s-kicker">Off the clock</p><h1>Beyond the lab</h1>
      <p class="s-lede">${esc(life.intro)}</p>
      <div class="s-stat"><div><b>${countries}</b><span>countries</span></div><div><b>${trackCount}</b><span>tracks</span></div><div><b>${life.fiction.books.length}</b><span>stories</span></div></div>
      <p class="s-scroll">Scroll to explore</p>` },
  { title: 'Travel', html: `<p class="s-kicker">Travel</p><h2>${countries} countries so far</h2><p>${esc(t.text)}</p>
      <h3>Lived in</h3><div class="s-chips">${t.lived.map((c) => `<span class="s-chip-lived">${esc(c.name)}</span>`).join('')}</div>
      <h3>Visited</h3><div class="s-chips">${t.visited.map((c) => `<span>${esc(c.name)}</span>`).join('')}</div>` },
  { title: 'Food', html: `<p class="s-kicker">Food</p><h2>Cooking as prototyping</h2><p>${esc(food.text)}</p>
      <ul class="l-plates">${food.plates.map((p) => `<li class="${p.placeholder ? 'is-placeholder' : ''}"><b>${esc(p.name)}</b>${p.placeholder ? '<span class="l-tag">to be added</span>' : ''}<p>${esc(p.note)}</p></li>`).join('')}</ul>` },
  { title: 'Board games', html: `<p class="s-kicker">Hobbies · Board games</p><h2>Strategy at the table</h2><p>${esc(life.boardGames.text)}</p>
      <div class="s-chips">${life.boardGames.list.map((g) => `<span>${esc(g.name)}</span>`).join('')}</div>` },
  { title: 'Games and more', html: `<p class="s-kicker">Hobbies · Games and more</p><h2>Worlds I play</h2><p>${esc(life.games.text)}</p>
      <div class="s-chips">${life.games.list.map((g) => `<span>${esc(g.name)}</span>`).join('')}</div>
      ${life.more.map((m) => `<div class="s-role"><b>${esc(m.name)}</b><p>${esc(m.text)}</p></div>`).join('')}` },
  { title: 'Creative Studio', html: `<p class="s-kicker">${esc(life.studio.kicker)}</p><h2>${esc(life.studio.name)}</h2>
      <p class="s-lede">${esc(life.studio.text)}</p>
      <div class="l-pillars"><div><b>${trackCount}</b><span>Music tracks</span></div><div><b>${life.fiction.books.length}</b><span>Comics and stories</span></div><div><b>1</b><span>Game in development</span></div></div>` },
  { title: 'Music', html: `<p class="s-kicker">Studio · Music</p><h2>Original compositions</h2><p>${esc(life.music.text)}</p>
      <div class="l-player" role="group" aria-label="Audio player">
        <button class="l-play" id="lPlay" type="button" aria-label="Play"></button>
        <div class="l-now"><b id="lTitle">Choose a track</b><span id="lTime">0:00</span></div>
        <input class="l-seek" id="lSeek" type="range" min="0" max="1000" value="0" aria-label="Seek">
      </div>
      ${playlists.map((pl) => `<div class="l-pl"><div class="l-pl-head">${pl.cover ? `<img src="${esc(pl.cover)}" alt="" loading="lazy">` : ''}<div><b>${esc(pl.name)}</b><span>${esc(pl.meta || '')}</span></div><a href="${esc(pl.url)}" target="_blank" rel="noopener">Open playlist</a></div>
        ${(pl.tracks || []).filter((x) => typeof x !== 'string').map((tr) => trackBtn(tr, ++ti, pl.cover)).join('')}</div>`).join('')}` },
  { title: 'Comics', html: `<p class="s-kicker">Studio · Comics and visual fiction</p><h2>The bookshelf</h2><p>${esc(life.fiction.text)}</p>
      <div class="l-books">${life.fiction.books.map((b, i) => `<a class="l-book" data-i="${i}" href="${esc(b.href)}"><b>${esc(b.name)}</b><span class="s-meta">${esc(b.kind)}</span><p>${esc(b.text)} <em>Read</em></p></a>`).join('')}</div>` },
  { title: 'Game dev', html: `<p class="s-kicker">Studio · Game development</p><h2>${esc(dev.name)}</h2><p class="l-kind">${esc(dev.kind)}</p><p>${esc(dev.text)}</p>
      <a class="l-cta" href="${esc(dev.href)}">${esc(dev.cta)}</a><br>
      <a class="s-more" href="/sections/about.html">Back to the professional story</a>` },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

// ───────────────────────── Audio: one shared element, optional analyser for the 3D visualiser ─────────────────────────
const audio = new Audio();
audio.preload = 'none';
let actx = null, analyser = null, fft = null, cur = -1;
const $ = (id) => document.getElementById(id);
const trackEls = [...document.querySelectorAll('.l-track')];
const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
function ensureAnalyser() {
  if (actx || !(window.AudioContext || window.webkitAudioContext)) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = actx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    const node = actx.createMediaElementSource(audio);
    node.connect(analyser); analyser.connect(actx.destination);
    fft = new Uint8Array(analyser.frequencyBinCount);
  } catch (e) { actx = analyser = fft = null; }
}
function paint() {
  const on = !audio.paused && cur >= 0;
  $('lPlay').classList.toggle('is-on', on);
  $('lPlay').setAttribute('aria-label', on ? 'Pause' : 'Play');
  trackEls.forEach((b, i) => { const a = i === cur && on; b.classList.toggle('is-on', a); });
  $('lTitle').textContent = cur >= 0 ? allTracks[cur].title : 'Choose a track';
}
function play(i) {
  if (!allTracks[i]) return;
  ensureAnalyser();
  actx?.resume?.();
  if (i !== cur) { cur = i; audio.src = allTracks[i].src; }
  audio.play().catch(() => {});
  paint();
}
trackEls.forEach((b, i) => b.addEventListener('click', () => (i === cur && !audio.paused ? audio.pause() : play(i))));
$('lPlay').addEventListener('click', () => { if (cur < 0) play(0); else if (audio.paused) play(cur); else audio.pause(); });
audio.addEventListener('play', paint);
audio.addEventListener('pause', paint);
audio.addEventListener('ended', () => { if (cur + 1 < allTracks.length) play(cur + 1); else paint(); });
audio.addEventListener('timeupdate', () => {
  $('lTime').textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  if (audio.duration) $('lSeek').value = (audio.currentTime / audio.duration) * 1000;
});
$('lSeek').addEventListener('input', (e) => { if (audio.duration) audio.currentTime = (e.target.value / 1000) * audio.duration; });

// Book hover/focus in the card pulls the matching 3D book off the shelf.
let bookFocus = -1;
document.querySelectorAll('.l-book').forEach((el) => {
  const on = () => { bookFocus = +el.dataset.i; document.querySelectorAll('.l-book').forEach((o) => o.classList.toggle('is-focus', o === el)); };
  const off = () => { bookFocus = -1; el.classList.remove('is-focus'); };
  el.addEventListener('mouseenter', on); el.addEventListener('focus', on);
  el.addEventListener('mouseleave', off); el.addEventListener('blur', off);
});

// ───────────────────────── 3D ─────────────────────────
runPage({
  active: null,
  build({ THREE, scene, camera, reduceMotion, lowPower, label }) {
    const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
    const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
    const vis = (p, a, w = 0.8) => smooth(1 - Math.abs(p - a) / w);
    const stag = (e, i, n, span = 0.55) => smooth(e * (1 + span) - (i / Math.max(1, n - 1)) * span); // staggered reveal 0..1
    const root = new THREE.Group();
    scene.add(root);
    let night = true;
    const themed = []; // [material, darkHex, lightHex]
    const tint = (m, dark, light) => { themed.push([m, dark, light]); m.color.setHex(dark); return m; };
    const applyTint = () => themed.forEach(([m, d, l]) => m.color.setHex(night ? d : l));

    // Fade groups: every material gets its opacity multiplied by the group's visibility.
    const fades = new Map();
    function fadeable(group) {
      const mats = new Set();
      group.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!m.userData.dyn) mats.add(m); }); });
      mats.forEach((m) => { m.transparent = true; m.userData.op = m.userData.op ?? m.opacity; });
      fades.set(group, mats);
      group.visible = false;
      root.add(group);
      return group;
    }
    function setFade(group, v) {
      group.visible = v > 0.01;
      if (!group.visible) return false;
      fades.get(group).forEach((m) => { m.opacity = m.userData.op * v; });
      return true;
    }

    const loader = new THREE.TextureLoader();
    function cover(src, h, depth, { spine = 0x2a2024, pages = 0xe9e0d0 } = {}) {
      const tex = loader.load(src, (tx) => {
        const a = tx.image.width / tx.image.height;
        mesh.scale.x = h * a;
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const side = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
      const mats = [side(pages), side(spine), side(pages), side(pages), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }), side(spine)];
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
      mesh.scale.set(h * 0.72, h, depth);
      const holder = new THREE.Group();
      holder.add(mesh);
      holder.userData.mesh = mesh;
      return holder;
    }
    const projectPos = (obj, off = [0, 0, 0]) => { const v = new THREE.Vector3(); return () => obj.localToWorld(v.set(off[0], off[1], off[2])); };

    // ── Travel: globe, pins, animated flight arcs ──
    const earth = makeGlobe({ R: 3.4, lowPower, lived: t.lived.map((c) => c.id), visited: t.visited.map((c) => c.id) });
    root.add(earth.group);
    const R = 3.4;
    const arcs = [], pins = [];
    const livedIds = t.lived.map((c) => c.id), base = GEO[250];
    const mkArc = (a, b, i, col) => {
      const A = earth.ll(a[0], a[1], R), B = earth.ll(b[0], b[1], R);
      const lift = 1 + 0.08 + A.distanceTo(B) / R * 0.28;
      const M = A.clone().add(B).normalize().multiplyScalar(R * lift);
      const pts = new THREE.QuadraticBezierCurve3(A, M, B).getPoints(56);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const faint = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.5 }));
      const comet = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.95 }));
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe9b0 }));
      earth.group.add(faint, comet, head);
      arcs.push({ faint, comet, head, pts, i, n: 56 });
    };
    mkArc(GEO[356], base, 0, 0xe63946);
    t.visited.forEach((c, i) => { if (GEO[c.id] && c.id !== '250') mkArc(base, GEO[c.id], i + 1, 0xd4af37); });
    [...t.lived, ...t.visited].forEach((c) => {
      const g = GEO[c.id]; if (!g) return;
      const lived = livedIds.includes(c.id);
      const pin = new THREE.Group();
      pin.position.copy(earth.ll(g[0], g[1], R));
      const dot = new THREE.Mesh(new THREE.SphereGeometry(lived ? 0.085 : 0.055, 12, 10), new THREE.MeshBasicMaterial({ color: lived ? 0xff5a4a : 0xe5c158 }));
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.125, 28), new THREE.MeshBasicMaterial({ color: lived ? 0xff5a4a : 0xe5c158, transparent: true, side: THREE.DoubleSide }));
      ring.lookAt(pin.position.clone().multiplyScalar(2));
      pin.add(dot, ring);
      earth.group.add(pin);
      pins.push({ pin, ring, lived, seed: pins.length * 0.7 });
      if (lived) {
        const l = label(`<span>${esc(c.name)}</span>`, projectPos(pin), 'l-pin is-lived');
        pins[pins.length - 1].label = l;
      }
    });
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

    // ── Food: table with a covered plate per cuisine, lids lift in turn ──
    const tableG = new THREE.Group();
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 5.8), tint(new THREE.MeshStandardMaterial({ roughness: 0.7 }), 0x241a1c, 0xc9b79e));
    tableTop.position.y = -1.5;
    const tableEdge = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.06, 5.9), tint(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 }), 0x6a2a2a, 0x8b5a4a));
    tableEdge.position.y = -1.33;
    tableG.add(tableTop, tableEdge);
    const ACC = [0xc8892a, 0xb8473a, 0x6f8f4e, 0x7a5a8a];
    const plates = food.plates.map((p, i) => {
      const g = new THREE.Group();
      g.position.set(i % 2 ? 2.05 : -2.05, -1.3, i < 2 ? -1.2 : 1.35);
      const ghost = !!p.placeholder;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.0, 0.12, 48), tint(new THREE.MeshStandardMaterial({ roughness: 0.35 }), 0xe6ddd0, 0xf7f2ea));
      plate.position.y = 0.06;
      const well = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.02, 40), tint(new THREE.MeshStandardMaterial({ roughness: 0.4 }), 0xcfc6b8, 0xe6dfd2));
      well.position.y = 0.13;
      const food3 = new THREE.Group();
      food3.position.y = 0.14;
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: ghost ? 0x777777 : ACC[i % 4], roughness: 0.8 }));
      mound.scale.y = 0.7;
      food3.add(mound);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + i, bit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: ghost ? 0x888888 : ACC[(i + 1 + (k % 2)) % 4], roughness: 0.7 }));
        bit.position.set(Math.cos(a) * 0.62, 0.08, Math.sin(a) * 0.62);
        food3.add(bit);
      }
      const lid = new THREE.Group();
      const lidMat = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 0.85, roughness: 0.22, transparent: true });
      lidMat.userData.dyn = true;
      lid.add(new THREE.Mesh(new THREE.SphereGeometry(1.12, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidMat));
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), lidMat);
      knob.position.y = 1.15; lid.add(knob);
      lid.position.y = 0.14;
      const steam = [...Array(lowPower ? 2 : 4)].map((_, k) => {
        const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        m.userData.dyn = true;
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), m);
        g.add(s);
        return { s, k };
      });
      g.add(plate, well, food3, lid);
      tableG.add(g);
      if (ghost) { plate.material = plate.material.clone(); plate.material.userData.op = 0.5; themed.push([plate.material, 0xe6ddd0, 0xf7f2ea]); well.material.userData.op = 0.5; }
      const pl = { g, lid, lidMat, steam, food3, ghost, i };
      pl.label = label(`<span>${esc(p.name)}</span>`, projectPos(g, [0, -0.1, 1.55]), `l-pin is-plate${ghost ? ' is-ghost' : ''}`);
      pl.label.visible = false;
      return pl;
    });
    fadeable(tableG);
    // placeholder plates stay ghosted: halve their base opacities
    plates.filter((p) => p.ghost).forEach((p) => p.g.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!m.userData.dyn) m.userData.op = 0.45; }); }));

    // ── Board games: a hand of cards dealt from a stack, die and pawns on the table ──
    const boardG = new THREE.Group();
    const felt = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.18, 64), tint(new THREE.MeshStandardMaterial({ roughness: 0.9 }), 0x1e1618, 0xd6c9b6));
    felt.position.y = -2.3;
    const feltRim = new THREE.Mesh(new THREE.TorusGeometry(5, 0.07, 8, 96), tint(new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 }), 0x7a2c2c, 0x8b5a4a));
    feltRim.rotation.x = Math.PI / 2; feltRim.position.y = -2.21;
    boardG.add(felt, feltRim);
    const cards = life.boardGames.list.map((b, i, arr) => {
      const piv = new THREE.Group();
      piv.position.set(0, -2.1, 0);
      const c = cover(b.cover, 2.5, 0.05);
      c.position.set(0, 3.0, i * 0.045);
      piv.add(c);
      boardG.add(piv);
      return { piv, k: i - (arr.length - 1) / 2, i, n: arr.length };
    });
    const pip = (n) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 96;
      const c = cv.getContext('2d'); c.fillStyle = '#f4efe6'; c.fillRect(0, 0, 96, 96);
      c.fillStyle = '#7a1a1a';
      const P = { 1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.28, .28], [.5, .5], [.72, .72]], 4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]], 5: [[.28, .28], [.72, .28], [.5, .5], [.28, .72], [.72, .72]], 6: [[.3, .25], [.7, .25], [.3, .5], [.7, .5], [.3, .75], [.7, .75]] }[n];
      P.forEach(([x, y]) => { c.beginPath(); c.arc(x * 96, y * 96, 8, 0, 7); c.fill(); });
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({ map: tx, roughness: 0.4 });
    };
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), [3, 4, 1, 6, 2, 5].map(pip));
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
    fadeable(boardG);

    // ── Games played: cover-flow of cover art that glides with time and scroll ──
    const gamesG = new THREE.Group();
    const gline = new THREE.Mesh(new THREE.BoxGeometry(9, 0.05, 0.9), new THREE.MeshBasicMaterial({ color: 0xd24a4a, transparent: true, opacity: 0.5 }));
    gline.position.y = -1.9;
    gamesG.add(gline);
    const GN = life.games.list.length;
    const gcards = life.games.list.map((g, i) => {
      const c = cover(g.cover, 2.9, 0.1);
      gamesG.add(c);
      return { c, i };
    });
    fadeable(gamesG);

    // ── Studio stage: platform shared by emblems, jukebox, shelf and reel ──
    const stage = new THREE.Group();
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.3, 72), tint(new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.2 }), 0x1a1316, 0xcfc2ae));
    platform.position.y = -2.7;
    const platRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color: 0xd24a4a }));
    platRing.rotation.x = Math.PI / 2; platRing.position.y = -2.54;
    stage.add(platform, platRing);
    const beams = [-3, 0, 3].map((x) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 1.1, 4.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8a70, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      b.position.set(x * 0.8, 0.3, -1); stage.add(b); return b;
    });
    fadeable(stage);

    // Emblems (studio intro): disc, book, film reel orbiting above the stage.
    const emblems = new THREE.Group();
    const vinyl = (r) => { const g = new THREE.Group(); const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.07, 48), new THREE.MeshStandardMaterial({ color: 0x141116, roughness: 0.25, metalness: 0.6 })); const l = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.34, r * 0.34, 0.08, 32), new THREE.MeshStandardMaterial({ color: 0xa32a2a, emissive: 0xd24a4a, emissiveIntensity: 0.4 })); g.add(d, l); g.rotation.x = Math.PI / 2 - 0.3; return g; };
    const e1 = vinyl(1.1);
    const e2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.4), [0xe9e0d0, 0x5a1a1a, 0xe9e0d0, 0xe9e0d0, 0x8b1a1a, 0x5a1a1a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })));
    const e3 = new THREE.Group();
    const reelMat = new THREE.MeshStandardMaterial({ color: 0x2b2529, metalness: 0.5, roughness: 0.4 });
    e3.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.22, 40), reelMat));
    for (let k = 0; k < 6; k++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 20), new THREE.MeshStandardMaterial({ color: 0xd24a4a, emissive: 0xd24a4a, emissiveIntensity: 0.25 })); const a = (k / 6) * Math.PI * 2; h.position.set(Math.cos(a) * 0.58, 0, Math.sin(a) * 0.58); e3.add(h); }
    e3.rotation.x = Math.PI / 2 - 0.3;
    emblems.add(e1, e2, e3);
    fadeable(emblems);

    // ── Jukebox: spinning record, tonearm, spectrum ring driven by the audio analyser ──
    const juke = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.rotation.set(0.12, -0.28, 0);
    const spinner = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.09, 72), new THREE.MeshStandardMaterial({ color: 0x121014, roughness: 0.22, metalness: 0.6 }));
    disc.rotation.x = Math.PI / 2;
    const labelM = new THREE.MeshStandardMaterial({ color: 0x9a2424, emissive: 0xd24a4a, emissiveIntensity: 0.35, roughness: 0.5 });
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.1, 40), labelM);
    lab.rotation.x = Math.PI / 2;
    spinner.add(disc, lab);
    for (let r = 0.95; r < 2.15; r += 0.17) { const gr = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 96), new THREE.MeshBasicMaterial({ color: 0x3d3641 })); gr.position.z = 0.05; spinner.add(gr); }
    const artTex = {};
    const artFor = (src) => artTex[src] || (artTex[src] = loader.load(src, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.needsUpdate = true; }));
    const art = [0, 1].map((k) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
      m.position.z = 0.056 + k * 0.001; m.visible = false; m.userData.o = 0; spinner.add(m); return m;
    });
    let artShown = 0, artFor_cur = -2;
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: 0xf2ece4 }));
    notch.position.set(0.5, 0, 0.07); notch.visible = false; spinner.add(notch);
    tilt.add(spinner);
    const NB = lowPower ? 32 : 48;
    const barMat = new THREE.MeshBasicMaterial({ transparent: true });
    const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1, 0.1).translate(0, 0.5, 0), barMat, NB);
    const col = new THREE.Color();
    for (let i = 0; i < NB; i++) { col.setHSL(0.02 + 0.1 * Math.abs(Math.sin((i / NB) * Math.PI)), 0.85, 0.58); bars.setColorAt(i, col); }
    bars.position.z = -0.08;
    tilt.add(bars);
    const arm = new THREE.Group();
    arm.position.set(3.2, 2.5, 0.35);
    const armBar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.07, 0.07), new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 0.8, roughness: 0.3 }));
    armBar.position.x = 1.5;
    const armHead = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.1), new THREE.MeshStandardMaterial({ color: 0x2b2529 }));
    armHead.position.x = 3.0;
    const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 20), new THREE.MeshStandardMaterial({ color: 0x2b2529, metalness: 0.5 }));
    armBase.rotation.x = Math.PI / 2;
    arm.add(armBar, armHead, armBase);
    arm.scale.setScalar(0.9);
    tilt.add(arm);
    juke.add(tilt);
    fadeable(juke);
    const hts = new Float32Array(NB);
    const dummy = new THREE.Object3D();
    let spin = 0, spinV = 0.15, armA = -1.66, level = 0;

    // ── Bookshelf: three books, the hovered one slides out ──
    const shelf = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(8.4, 4.4, 0.12), tint(new THREE.MeshStandardMaterial({ roughness: 0.9 }), 0x1b1417, 0xcdbfaa));
    back.position.set(0, -0.2, -0.95);
    const plank = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.2, 1.7), tint(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.1 }), 0x3a2024, 0x9a6f5a));
    plank.position.set(0, -1.95, 0);
    shelf.add(back, plank);
    const SPINES = [0x5a1a1a, 0x1f2f45, 0x2f3a24];
    const books = life.fiction.books.map((b, i, arr) => {
      const c = cover(b.cover, 3.3, 0.55, { spine: SPINES[i % 3] });
      const k = i - (arr.length - 1) / 2;
      c.userData.home = new THREE.Vector3(k * 2.55, -1.85 + 1.65, 0.1);
      c.position.copy(c.userData.home);
      c.rotation.y = -k * 0.14;
      c.userData.k = k; c.userData.pull = 0;
      shelf.add(c);
      return c;
    });
    fadeable(shelf);

    // ── Game reel: gameplay frames travelling along a film strip ──
    const reel = new THREE.Group();
    const stripCv = document.createElement('canvas'); stripCv.width = 256; stripCv.height = 64;
    { const c = stripCv.getContext('2d'); c.fillStyle = '#0d0a0c'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#4a4046'; for (let k = 0; k < 8; k++) { c.fillRect(k * 32 + 9, 5, 14, 9); c.fillRect(k * 32 + 9, 50, 14, 9); } }
    const stripTex = new THREE.CanvasTexture(stripCv);
    stripTex.wrapS = THREE.RepeatWrapping; stripTex.repeat.set(5, 1); stripTex.colorSpace = THREE.SRGBColorSpace;
    const fadeCv = document.createElement('canvas'); fadeCv.width = 256; fadeCv.height = 4;
    { const c = fadeCv.getContext('2d'), gr = c.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, '#000'); gr.addColorStop(0.18, '#fff'); gr.addColorStop(0.82, '#fff'); gr.addColorStop(1, '#000'); c.fillStyle = gr; c.fillRect(0, 0, 256, 4); }
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.9), new THREE.MeshBasicMaterial({ map: stripTex, alphaMap: new THREE.CanvasTexture(fadeCv), transparent: true }));
    reel.add(strip);
    const FW = 3.1, FH = 1.75, GAP = 0.45, N = dev.frames.length, LOOP = N * (FW + GAP);
    const frames = dev.frames.map((src, i) => {
      const tx = loader.load(src); tx.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ map: tx, transparent: true }));
      m.position.z = 0.02; reel.add(m);
      return { m, i };
    });
    reel.rotation.set(-0.12, -0.32, 0.04);
    fadeable(reel);

    // Per-frame updates ─────────────────────────────
    const keyframes = [
      { pos: [0, 1, 20], look: [0.5, 0, 0] },
      { pos: [1.2, 2.0, 15.5], look: [1.0, 0.3, 0] },
      { pos: [1.0, 6.2, 12.5], look: [1.2, -1.4, 0.4] },
      { pos: [1.0, 2.0, 14.5], look: [1.2, -0.1, 0] },
      { pos: [1.0, 1.0, 15.5], look: [1.2, 0, 0] },
      { pos: [1.0, 2.8, 16.5], look: [1.2, -0.7, 0] },
      { pos: [0.8, 0.6, 15.5], look: [1.0, 0, 0] },
      { pos: [1.0, 1.0, 15], look: [1.2, -0.4, 0] },
      { pos: [0.8, 0.5, 15.5], look: [1.0, 0, 0] },
    ];
    const toCam = new THREE.Vector3();

    return {
      keyframes,
      onTheme(p) { night = p.night; earth.setTheme(night); applyTint(); },
      update(time, p, dt) {
        const T = reduceMotion ? 0 : time;
        // Rig: right-hand side on desktop; upper half and scaled down on narrow screens.
        const narrow = innerWidth <= 860, aspect = innerWidth / innerHeight;
        const fit = narrow ? clamp(aspect * 0.98, 0.42, 0.7) : 0.78 + 0.1 * Math.max(vis(p, S.hero, 1.2), vis(p, S.travel, 0.9));
        root.scale.setScalar(fit);
        root.position.set(narrow ? 1.0 : 2.2, narrow ? 1.75 : 0, 0);

        // Globe + arcs (steps 0-1)
        const eg = Math.max(vis(p, S.hero, 1.2), vis(p, S.travel, 0.9));
        earth.group.visible = eg > 0.01;
        earth.group.scale.setScalar(Math.max(0.001, eg));
        const tv = smooth(vis(p, S.travel, 0.7));
        const lon = 38 - 28 * smooth(clamp((p - 0.9) / 0.9)); // India+France in view, then Europe
        const spinY = reduceMotion ? 0 : time * 0.06 * (1 - smooth(clamp(p / 0.8)));
        earth.group.rotation.set(THREE.MathUtils.degToRad(30) * smooth(clamp(p / 0.9)), -THREE.MathUtils.degToRad(lon) * smooth(clamp(p / 0.9)) + spinY, 0);
        if (earth.group.visible) {
          earth.group.updateMatrixWorld();
          for (const a of arcs) {
            const r = smooth(clamp(tv * 1.7 - a.i * 0.12));
            const shown = Math.floor(r * a.n);
            a.faint.geometry.setDrawRange(0, shown);
            const c = reduceMotion ? 1 : (T * 0.3 + a.i * 0.17) % 1;
            const head = Math.min(shown - 1, Math.floor(c * (a.n - 1)));
            const tail = Math.max(0, head - 14);
            a.comet.geometry.setDrawRange(tail, Math.max(0, head - tail));
            a.head.visible = head > 0;
            if (head > 0) a.head.position.copy(a.pts[head]);
            a.faint.visible = a.comet.visible = shown > 1;
          }
          for (const q of pins) {
            const pulse = reduceMotion ? 0.5 : (T * 0.8 + q.seed) % 1;
            q.ring.scale.setScalar(0.8 + pulse * (q.lived ? 1.4 : 0.9));
            q.ring.material.opacity = (1 - pulse) * 0.8 * tv;
            q.pin.scale.setScalar(Math.max(0.001, tv));
            if (q.label) {
              q.pin.getWorldPosition(tmpA);
              tmpB.copy(tmpA).sub(earth.group.getWorldPosition(toCam)).normalize();
              toCam.copy(camera.position).sub(tmpA);
              q.label.visible = tv > 0.6 && tmpB.dot(toCam) > 0;
            }
          }
        } else pins.forEach((q) => { if (q.label) q.label.visible = false; });

        // Food
        const ef = smooth(vis(p, S.food));
        if (setFade(tableG, ef)) {
          tableG.rotation.y = -0.18 + Math.sin(T * 0.3) * 0.03;
          for (const pl of plates) {
            const r = stag(ef, pl.i, plates.length, 0.9);
            pl.lid.position.y = 0.14 + r * 2.6;
            pl.lid.rotation.z = r * 0.35 * (pl.i % 2 ? 1 : -1);
            pl.lidMat.opacity = ef * (1 - smooth((r - 0.25) / 0.6));
            pl.lid.visible = pl.lidMat.opacity > 0.01;
            pl.food3.scale.setScalar(0.4 + r * 0.6);
            pl.steam.forEach(({ s, k }) => {
              const f = (T * 0.35 + k / pl.steam.length + pl.i * 0.2) % 1;
              s.position.set(Math.sin(f * 6 + k) * 0.18, 0.5 + f * 1.4, Math.cos(f * 5 + k) * 0.18);
              s.scale.setScalar(0.6 + f);
              s.material.opacity = (pl.ghost ? 0 : 0.22) * (1 - f) * r * ef;
            });
            pl.label.visible = ef > 0.7 && r > 0.8;
          }
        } else plates.forEach((pl) => { pl.label.visible = false; });

        // Board games: deal the hand from a stack
        const eb = smooth(vis(p, S.board));
        if (setFade(boardG, eb)) {
          boardG.rotation.y = Math.sin(T * 0.3) * 0.05;
          for (const c of cards) {
            const r = stag(eb, c.i, c.n, 0.9);
            c.piv.rotation.z = THREE.MathUtils.lerp(0.95, -c.k * 0.19, r);
            c.piv.position.x = THREE.MathUtils.lerp(2.8, 0, r);
            c.piv.children[0].position.y = 3.0 + Math.sin(T * 0.9 + c.i) * 0.04;
          }
          die.position.set(3.1, 0.6 + Math.sin(T * 1.1) * 0.15, 0.8);
          die.rotation.set(T * 0.6, T * 0.8, 0.3);
          die.scale.setScalar(0.5 + eb * 0.5);
          pawns.forEach((m, i) => { m.position.y = -2.1 + Math.max(0, 1 - stag(eb, i + 2, 6, 0.8)) * 1.5; m.rotation.y = T * 0.5 + i; });
        }

        // Games cover-flow
        const eq = smooth(vis(p, S.games));
        if (setFade(gamesG, eq)) {
          const focus = (reduceMotion ? 0 : T * 0.25) + (p - S.games) * 1.2;
          gcards.forEach(({ c, i }) => {
            let d = (((i - focus) % GN) + GN * 1.5) % GN - GN / 2; // wrapped offset in [-GN/2, GN/2)
            const ad = Math.abs(d);
            c.position.set(d * 2.9 * (0.7 + 0.3 * eq), Math.sin(T * 0.8 + i * 1.7) * 0.06 - 0.2, -ad * 0.9);
            c.rotation.y = -clamp(d, -1.2, 1.2) * 0.55;
            c.scale.setScalar(Math.max(0.001, smooth(1.9 - ad) * (1 - Math.min(0.25, ad * 0.12))));
          });
        }

        // Studio stage lives from the intro to the reel
        const es = smooth(clamp(Math.min((p - 4.3) / 0.8, (8.8 - p) / 0.8)));
        if (setFade(stage, es)) beams.forEach((b, i) => { b.material.opacity = 0.07 * (0.7 + 0.3 * Math.sin(T * 0.7 + i * 2)); });

        const ee = smooth(vis(p, S.studio));
        if (setFade(emblems, ee)) {
          [e1, e2, e3].forEach((o, i) => {
            const a = T * 0.45 + (i / 3) * Math.PI * 2;
            const r = stag(ee, i, 3, 0.7);
            o.position.set(Math.cos(a) * 2.6 * r, 0.2 + Math.sin(T * 0.9 + i * 2) * 0.2, Math.sin(a) * 1.5 * r - 0.2);
            o.scale.setScalar(0.3 + 0.7 * r);
          });
          e2.rotation.y = T * 0.7; e3.rotation.z = T * 0.8; e1.rotation.z = T * 0.5;
        }

        // Jukebox
        const ej = smooth(vis(p, S.music));
        if (setFade(juke, ej)) {
          const playing = !audio.paused && cur >= 0;
          let live = false;
          if (playing && analyser && fft) {
            analyser.getByteFrequencyData(fft);
            for (let i = 0; i < 12; i++) if (fft[i]) { live = true; break; }
          }
          spinV += ((playing ? 1.5 : 0.12) - spinV) * (1 - Math.exp(-dt * 2.5));
          spin += dt * spinV * (reduceMotion && !playing ? 0 : 1);
          spinner.rotation.z = -spin;
          if (cur !== artFor_cur) {
            artFor_cur = cur;
            const src = cur >= 0 ? allTracks[cur].cover : null;
            if (src) { artShown = 1 - artShown; art[artShown].material.map = artFor(src); art[artShown].material.needsUpdate = true; }
          }
          art.forEach((m, k) => {
            const want = k === artShown && cur >= 0 && m.material.map?.image ? 1 : 0;
            m.userData.o += (want - m.userData.o) * (1 - Math.exp(-dt * 6));
            m.material.opacity = m.userData.o * ej; m.visible = m.userData.o > 0.01;
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
          juke.position.y = -0.1 + Math.sin(T * 0.6) * 0.06;
          juke.scale.setScalar(0.88 + ej * 0.12);
        }

        // Books
        const ek = smooth(vis(p, S.books));
        if (setFade(shelf, ek)) {
          const auto = bookFocus < 0 && !reduceMotion ? Math.floor(time / 2.6) % books.length : -1;
          const act = bookFocus >= 0 ? bookFocus : auto;
          books.forEach((b, i) => {
            const r = stag(ek, i, books.length, 0.8);
            b.userData.pull += ((i === act ? 1 : 0) - b.userData.pull) * (1 - Math.exp(-dt * 5));
            const pu = b.userData.pull, h = b.userData.home;
            b.position.set(h.x, h.y - (1 - r) * 3.2 + pu * 0.25, h.z + pu * 1.1);
            b.rotation.y = -b.userData.k * 0.14 * (1 - pu) + pu * 0.1;
          });
        }

        // Reel
        const er = smooth(vis(p, S.reel));
        if (setFade(reel, er)) {
          const off = (T * 0.55) % LOOP;
          stripTex.offset.x = -T * 0.11;
          frames.forEach(({ m, i }) => {
            let x = ((i * (FW + GAP) + off) % LOOP) - LOOP / 2 + (FW + GAP) / 2;
            m.position.x = x;
            const edge = clamp(1 - Math.abs(x) / 5.6) ** 0.6;
            m.material.opacity = edge * er;
            m.position.z = 0.03 + (1 - edge) * -0.2;
          });
          reel.position.y = Math.sin(T * 0.5) * 0.08;
        }
      },
    };
  },
});

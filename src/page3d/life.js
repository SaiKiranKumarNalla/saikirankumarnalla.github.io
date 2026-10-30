// Off the Clock: travel on a real-map globe, then fiction, music, games and board games as 3D shelves.
import life from '../../content/life.json';
import { runPage } from './engine.js';
import { makeGlobe } from './globe.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t = life.travel;
const countries = t.lived.length + t.visited.length;

const STEPS = [
  { title: 'Off the clock', html: `<p class="s-kicker">Off the clock</p><h1>Beyond the lab</h1>
      <p class="s-lede">${esc(life.intro)}</p>
      <div class="s-stat"><div><b>${countries}</b><span>countries</span></div><div><b>${life.fiction.books.length}</b><span>stories</span></div><div><b>${life.music.playlists.length}</b><span>playlists</span></div></div>
      <p class="s-scroll">Scroll to explore</p>` },
  { title: 'Travel', html: `<p class="s-kicker">Travel</p><h2>${countries} countries so far</h2><p>${esc(t.text)}</p>
      <h3>Lived in</h3><div class="s-chips">${t.lived.map((c) => `<span class="s-chip-lived">${esc(c.name)}</span>`).join('')}</div>
      <h3>Visited</h3><div class="s-chips">${t.visited.map((c) => `<span>${esc(c.name)}</span>`).join('')}</div>` },
  { title: 'Fiction', html: `<p class="s-kicker">Fiction</p><h2>Stories I write</h2><p>${esc(life.fiction.text)}</p>
      ${life.fiction.books.map((b) => `<div class="s-role"><b>${esc(b.name)}</b> <span class="s-meta">${esc(b.kind)}</span><p>${esc(b.text)} <a href="${b.href}">Open →</a></p></div>`).join('')}` },
  { title: 'Music', html: `<p class="s-kicker">Music</p><h2>Listen</h2><p>${esc(life.music.text)}</p>
      ${life.music.playlists.map((p) => `<a class="s-playlist" href="${esc(p.url)}" target="_blank" rel="noopener">
        ${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy">` : ''}
        <span><b>${esc(p.name)}</b><span class="s-meta">${esc(p.meta || 'Playlist')} · Flow Music</span>
        ${p.tracks ? `<ol>${p.tracks.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}<em>Listen ↗</em></span></a>`).join('')}` },
  { title: 'Games', html: `<p class="s-kicker">Games</p><h2>Worlds I play in</h2><p>${esc(life.games.text)}</p>
      <div class="s-chips">${life.games.list.map((g) => `<span>${esc(g.name)}</span>`).join('')}</div>` },
  { title: 'Board games', html: `<p class="s-kicker">Board games</p><h2>Strategy at the table</h2><p>${esc(life.boardGames.text)}</p>
      <div class="s-chips">${life.boardGames.list.map((g) => `<span>${esc(g.name)}</span>`).join('')}</div>` },
  { title: 'And more', html: `<p class="s-kicker">And more</p><h2>Other obsessions</h2>
      ${life.more.map((m) => `<div class="s-role"><b>${esc(m.name)}</b><p>${esc(m.text)}</p></div>`).join('')}
      <a class="s-more" href="/sections/about">Back to the professional story →</a>` },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: null,
  build({ THREE, scene, reduceMotion, lowPower }) {
    const anchor = new THREE.Vector3(2.2, 0, 0);
    const vis = (p, a, w = 0.75) => Math.max(0, 1 - Math.abs(p - a) / w);

    // Globe (steps 0–1).
    const earth = makeGlobe({ R: 3.4, lowPower, lived: t.lived.map((c) => c.id), visited: t.visited.map((c) => c.id) });
    earth.group.position.copy(anchor);
    scene.add(earth.group);

    // Shelves of cover art (one group per step).
    const loader = new THREE.TextureLoader();
    function shelf(items, { w = 1.8, h = 2.5, gap = 2.1, arc = 0.22 } = {}) {
      const g = new THREE.Group();
      g.position.copy(anchor).setX(anchor.x + 1.6);
      items.forEach((it, i) => {
        const tex = loader.load(it.cover);
        tex.colorSpace = THREE.SRGBColorSpace;
        const card = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
        const k = i - (items.length - 1) / 2;
        card.position.set(k * gap, 0, -Math.abs(k) * 0.5);
        card.rotation.y = -k * arc;
        card.userData.k = k;
        g.add(card);
      });
      g.visible = false;
      scene.add(g);
      return g;
    }
    const books = shelf(life.fiction.books, { w: 2, h: 3, gap: 2.4 });
    const games = shelf(life.games.list, { w: 1.7, h: 2.2, gap: 1.95 });
    const boards = shelf(life.boardGames.list, { w: 1.4, h: 1.4, gap: 1.5, arc: 0.12 });
    boards.rotation.x = -0.35;

    // Music: a slowly turning record and an equaliser.
    const music = new THREE.Group();
    music.position.copy(anchor);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64), new THREE.MeshStandardMaterial({ color: 0x111014, roughness: 0.25, metalness: 0.5 }));
    disc.rotation.x = Math.PI / 2.4;
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.09, 48), new THREE.MeshStandardMaterial({ color: 0x8b1a1a, emissive: 0xd24a4a, emissiveIntensity: 0.4 }));
    disc.add(label);
    for (let r = 1; r < 2.4; r += 0.18) {
      const groove = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 96), new THREE.MeshBasicMaterial({ color: 0x3a3440 }));
      groove.rotation.x = Math.PI / 2; groove.position.y = 0.045;
      disc.add(groove);
    }
    const bars = [...Array(16)].map((_, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.16), new THREE.MeshStandardMaterial({ color: 0xff6a4a, emissive: 0xd24a4a, emissiveIntensity: 0.6 }));
      b.position.set((i - 7.5) * 0.28, -2.8, 0.8);
      music.add(b);
      return b;
    });
    music.add(disc);
    music.visible = false;
    scene.add(music);

    const groups = [[books, 2], [music, 3], [games, 4], [boards, 5]];
    return {
      keyframes: [
        { pos: [0, 1, 20], look: [0.5, 0, 0] },
        { pos: [1.5, 2.2, 15], look: [1.9, 0.5, 0] },
        { pos: [1.5, 0.5, 16], look: [2.6, 0, 0] },
        { pos: [0.5, 0.8, 15], look: [1.6, -0.3, 0] },
        { pos: [1.5, 0.5, 16], look: [2.6, 0, 0] },
        { pos: [1.5, 2.5, 15], look: [2.6, 0, 0] },
        { pos: [0, 1, 20], look: [0.5, 0, 0] },
      ],
      onTheme(p) { earth.setTheme(p.night); },
      update(time, p) {
        // Globe: spins on the intro, faces Europe for travel, then recedes.
        const g = Math.max(vis(p, 0, 1.2), vis(p, 1, 0.9), vis(p, 6, 1));
        earth.group.visible = g > 0.01;
        earth.group.scale.setScalar(Math.max(0.001, g));
        const spin = reduceMotion ? 0 : time * 0.06;
        const toEurope = vis(p, 1, 1);
        earth.group.rotation.set(THREE.MathUtils.degToRad(35) * toEurope, -THREE.MathUtils.degToRad(15) * toEurope + spin * (1 - toEurope), 0);
        for (const [grp, at] of groups) {
          const v = vis(p, at);
          grp.visible = v > 0.01;
          grp.scale.setScalar(0.6 + v * 0.4);
          grp.children.forEach((c) => {
            if (c.material?.opacity !== undefined) c.material.opacity = v;
            if (c.userData.k !== undefined && !reduceMotion) c.position.y = Math.sin(time * 0.8 + c.userData.k) * 0.08;
          });
        }
        disc.rotation.y = time * 0.6;
        bars.forEach((b, i) => { const h = 0.3 + Math.abs(Math.sin(time * 3 + i * 0.7) * Math.cos(time * 1.3 + i)) * 1.6; b.scale.y = h; b.position.y = -2.8 + h / 2; });
      },
    };
  },
});

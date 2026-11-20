// Off the Clock, on the layout kit, as four chapters. Travel: a wide band with the globe and flight arcs. Food: a
// table in 3D beside a table of plates. Hobbies: tabs for board games and games played, with the 3D following.
// Fragrantmash Creative Studio: a jukebox band with the audio player (Web Audio visualiser, song covers,
// playlists), the comics on a 3D shelf, and the Kage game reel with a link to its showcase.
import './life.css';
import life from '../../content/life.json';
import music from '../../content/music.json';
import { mountPage, hero, split, band, sec, head, stage, tabs, grid, card, stats, chips, gallery, table, callout, cta, btn, esc } from './layout.js';
import { heroStage, travelStage, foodStage, playStage, jukeStage, shelfStage, audioState, shelfState } from './life-scene.js';

const t = life.travel;
const countries = t.lived.length + t.visited.length;
const playlists = life.music.playlists;
const allTracks = playlists.flatMap((pl, pi) => (pl.tracks || []).filter((x) => typeof x !== 'string').map((tr) => ({ ...tr, pl: pi })));
const trackCount = allTracks.length || music.trackCount || 0;
const food = life.food;
const dev = life.gameDev;

const trackBtn = (tr, i, fb) => `<button class="l-track" type="button" data-i="${i}" aria-label="Play ${esc(tr.title)}"><span class="l-thumb">${tr.cover || fb ? `<img src="${esc(tr.cover || fb)}" alt="" width="44" height="44" loading="lazy">` : ''}<span class="l-ico" aria-hidden="true"></span></span><span><b>${esc(tr.title)}</b><i>${esc(tr.meta)}</i></span></button>`;
let ti = -1;
// "gameplay-opening-1080.webp" -> "Gameplay opening"
const frameName = (src) => { const n = src.split('/').pop().replace(/\.\w+$/, '').replace(/-?1080$/, '').replace(/[-_]+/g, ' ').trim(); return n.charAt(0).toUpperCase() + n.slice(1); };

// ── Hero
const heroHtml = `<p class="lk-k">Off the clock</p>
  <h1>Beyond the lab</h1>
  <p class="lk-lede">${esc(life.intro)}</p>
  ${stats([{ value: String(countries), label: 'countries' }, { value: String(trackCount), label: 'tracks' }, { value: String(life.fiction.books.length), label: 'stories' }])}
  <div class="lk-btns">${btn({ href: '#travel', label: 'Travel' })}${btn({ href: '#food', label: 'Food', ghost: true })}${btn({ href: '#hobbies', label: 'Hobbies', ghost: true })}${btn({ href: '#studio', label: 'Creative Studio', ghost: true })}</div>`;

// ── Chapter 1: Travel
const travel = band({
  id: 'travel', cls: 'lf-travel',
  stage: stage('travel', { focus: '0.4 0.04 0.99 0.96', focusM: '0.04 0.04 0.96 0.96' }),
  over: `<p class="lk-k">Chapter 1 · Travel</p><h2>${countries} countries so far</h2><p>${esc(t.text)}</p>`,
  below: grid([
    card({ kicker: 'Lived in', html: chips(t.lived.map((c) => c.name)) }),
    card({ kicker: 'Visited', html: chips(t.visited.map((c) => c.name)) }),
  ], 'lf-places'),
});

// ── Chapter 2: Food
const foodSplit = split({
  id: 'food', flip: true,
  text: `<p class="lk-k">Chapter 2 · Food</p><h2>Cooking as prototyping</h2><p class="lk-lede">${esc(food.text)}</p>
    ${table({ head: ['Plate', 'Note'], rows: food.plates.map((p) => [p.name, p.placeholder ? `${p.note} (to be added)` : p.note]) })}`,
  media: stage('food', { focus: '0.04 0.06 0.96 0.96' }),
});

// ── Chapter 3: Hobbies (tabs; the 3D beside them follows the tab)
const covers = (list, group) => gallery(list.map((g) => ({ src: g.cover, caption: g.name })), group, 'lf-covers');
const hobbies = sec(`${head({ kicker: 'Chapter 3 · Hobbies', title: 'At the table and on the screen', lede: 'Systems, incentives and worlds worth getting lost in.' })}
  ${tabs('hobbies', [
    { label: 'Board games', sub: `${life.boardGames.list.length} favourites`, html: `<h3 class="lf-ph">Strategy at the table</h3><p class="lk-lede">${esc(life.boardGames.text)}</p>${covers(life.boardGames.list, 'board')}` },
    { label: 'Games and more', sub: `${life.games.list.length} recent worlds`, html: `<h3 class="lf-ph">Worlds I play</h3><p class="lk-lede">${esc(life.games.text)}</p>${covers(life.games.list, 'games')}
      ${life.more.map((m) => callout(`<p><b>${esc(m.name)}</b></p><p>${esc(m.text)}</p>`)).join('')}` },
  ], { aside: stage('play', { focus: '0.03 0.04 0.97 0.96' }) })}`, { id: 'hobbies' });

// ── Chapter 4: Fragrantmash Creative Studio
const studioHead = sec(`${head({ kicker: life.studio.kicker, title: life.studio.name, lede: life.studio.text })}
  ${stats([{ value: String(trackCount), label: 'Music tracks' }, { value: String(life.fiction.books.length), label: 'Comics and stories' }, { value: '1', label: 'Game in development' }])}`, { id: 'studio', cls: 'lf-studio' });

const player = `<div class="l-player" role="group" aria-label="Audio player">
    <button class="l-play" id="lPlay" type="button" aria-label="Play"></button>
    <div class="l-now"><b id="lTitle">Choose a track</b><span id="lTime">0:00</span></div>
    <input class="l-seek" id="lSeek" type="range" min="0" max="1000" value="0" aria-label="Seek">
  </div>`;
const jukebox = band({
  id: 'music', cls: 'lf-juke lk-over-t',
  stage: stage('juke', { focus: '0.4 0.03 0.99 0.97', focusM: '0.04 0.03 0.96 0.97' }),
  over: `<p class="lk-k">Studio · Music</p><h2>Original compositions</h2><p>${esc(life.music.text)}</p>${player}`,
  below: `<div class="lf-pls lk-rv-g">${playlists.map((pl) => `<div class="l-pl"><div class="l-pl-head">${pl.cover ? `<img src="${esc(pl.cover)}" alt="" loading="lazy">` : ''}<div><b>${esc(pl.name)}</b><span>${esc(pl.meta || '')}</span></div><a href="${esc(pl.url)}" target="_blank" rel="noopener">Open playlist</a></div>
    ${(pl.tracks || []).filter((x) => typeof x !== 'string').map((tr) => trackBtn(tr, ++ti, pl.cover)).join('')}</div>`).join('')}</div>`,
});

const comics = split({
  id: 'comics',
  text: `<p class="lk-k">Studio · Comics and visual fiction</p><h2>The bookshelf</h2><p class="lk-lede">${esc(life.fiction.text)}</p>
    <div class="l-books">${life.fiction.books.map((b, i) => `<a class="l-book" data-i="${i}" href="${esc(b.href)}"><b>${esc(b.name)}</b><span class="lk-meta">${esc(b.kind)}</span><p>${esc(b.text)} <em>Read</em></p></a>`).join('')}</div>`,
  media: stage('shelf', { focus: '0.04 0.06 0.96 0.96' }),
});

const reel = split({
  id: 'reel', flip: true,
  text: `<p class="lk-k">Studio · Game development</p><h2>${esc(dev.name)}</h2><p class="lf-kind">${esc(dev.kind)}</p><p class="lk-lede">${esc(dev.text)}</p>
    <div class="lk-btns">${btn({ href: dev.href, label: dev.cta })}</div>`,
  media: gallery(dev.frames.map((src) => ({ src, caption: `${dev.name}: ${frameName(src)}` })), 'kage'),
});

const close = cta({
  kicker: 'Off the clock', title: 'Back to the professional story', text: 'The same habit of building worlds and working out how they run, applied to PET/CT.',
  links: [{ href: '/sections/about.html', label: 'About me →' }, { href: '/', label: 'Back to the village', ghost: true }],
});

mountPage({
  active: null,
  html: hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.46 0.1 0.99 0.9', focusM: '0.02 0.1 0.98 0.96' }), html: heroHtml }) + travel + foodSplit + hobbies + studioHead + jukebox + comics + reel + close,
  stages: { hero: heroStage, travel: travelStage, food: foodStage, play: playStage, juke: jukeStage, shelf: shelfStage },
});

// ───────────────────────── Audio: one shared element, optional analyser for the 3D visualiser ─────────────────────────
const audio = new Audio();
audio.preload = 'none';
audioState.audio = audio;
audioState.tracks = allTracks;
let actx = null;
const $ = (id) => document.getElementById(id);
const trackEls = [...document.querySelectorAll('.l-track')];
const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
function ensureAnalyser() {
  if (actx || !(window.AudioContext || window.webkitAudioContext)) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = actx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    const node = actx.createMediaElementSource(audio);
    node.connect(analyser); analyser.connect(actx.destination);
    audioState.fft = new Uint8Array(analyser.frequencyBinCount);
    audioState.analyser = analyser;
  } catch (e) { actx = null; audioState.analyser = audioState.fft = null; }
}
function paint() {
  const cur = audioState.cur;
  const on = !audio.paused && cur >= 0;
  $('lPlay').classList.toggle('is-on', on);
  $('lPlay').setAttribute('aria-label', on ? 'Pause' : 'Play');
  trackEls.forEach((b, i) => b.classList.toggle('is-on', i === cur && on));
  $('lTitle').textContent = cur >= 0 ? allTracks[cur].title : 'Choose a track';
}
function play(i) {
  if (!allTracks[i]) return;
  ensureAnalyser();
  actx?.resume?.();
  if (i !== audioState.cur) { audioState.cur = i; audio.src = allTracks[i].src; }
  audio.play().catch(() => {});
  paint();
}
trackEls.forEach((b, i) => b.addEventListener('click', () => (i === audioState.cur && !audio.paused ? audio.pause() : play(i))));
$('lPlay').addEventListener('click', () => { if (audioState.cur < 0) play(0); else if (audio.paused) play(audioState.cur); else audio.pause(); });
audio.addEventListener('play', paint);
audio.addEventListener('pause', paint);
audio.addEventListener('ended', () => { if (audioState.cur + 1 < allTracks.length) play(audioState.cur + 1); else paint(); });
audio.addEventListener('timeupdate', () => {
  $('lTime').textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  if (audio.duration) $('lSeek').value = (audio.currentTime / audio.duration) * 1000;
});
$('lSeek').addEventListener('input', (e) => { if (audio.duration) audio.currentTime = (e.target.value / 1000) * audio.duration; });

// Book hover/focus in the list pulls the matching 3D book off the shelf.
document.querySelectorAll('.l-book').forEach((el) => {
  const on = () => { shelfState.focus = +el.dataset.i; shelfState.redraw?.(); document.querySelectorAll('.l-book').forEach((o) => o.classList.toggle('is-focus', o === el)); };
  const off = () => { shelfState.focus = -1; shelfState.redraw?.(); el.classList.remove('is-focus'); };
  el.addEventListener('mouseenter', on); el.addEventListener('focus', on);
  el.addEventListener('mouseleave', off); el.addEventListener('blur', off);
});

// Kage, the game, on the layout kit: a hero with the Kage model, the story of the two realms beside a second
// Kage stage, the environment gallery, the gameplay showcase (lazy video + shots), the dev records, the
// multi-agent crew that builds it, and a closing band. Images open in the shared lightbox.
import { mountPage, hero, split, sec, cta, head, stage, gallery, stats, chips, callout, grid, card, btn, esc } from './layout.js';
import { heroStage, storyStage } from './game-scene.js';
import './game.css';

const M = '/media/kage-game';
const env = [
  ['The Forge', 'scenery/01_forge', 'Blacksmith compound overlooking anvil workbenches, weapon racks, smelting kilns, and timber storage sheds.'],
  ['The Pagoda', 'scenery/02_pagoda', 'Multi-tiered wooden pagoda nestled within the sacred pine grove, stone toro lanterns, and ceremonial incense altars.'],
  ['Entry Gate', 'scenery/03_entry_gate', 'Main ceremonial gateway framing the outer entrance into Akabashi with heavy timber reinforced doors and stone ramparts.'],
  ['Training Arena', 'scenery/05_training_arena', 'Martial training precinct featuring elevated sparring rings, sand practice pits, spectator shelters, and combat practice dummies.'],
  ["Kage's Home", 'scenery/06_kages_home', "The ronin's residence compound featuring traditional wooden shoji frames, tiled eaves, and an inner contemplation courtyard."],
].map(([t, f, d]) => ({ src: `${M}/${f}.webp`, caption: `${t}. ${d}`, kicker: 'Environment' }));

const shots = [
  ['Gateway Entrance', 'gameplay_shot_01'], ['Village Square', 'gameplay_shot_02'], ['Arena Pavilion', 'gameplay_shot_03'],
  ['Pagoda street', 'gameplay_shot_04_bridge'], ['Atrium', 'gameplay_shot_05_sprint'], ['Martial Stance', 'gameplay_shot_06_combat'],
].map(([t, f]) => ({ src: `${M}/gameplay/${f}.webp`, caption: t, kicker: 'Gameplay' }));

const records = [
  ['Design Viewer', '01_godot_environment_design_viewer'], ['Layout Blueprint', '02_godot_environment_topdown_blueprint'],
  ['Quarter Overview', '03_godot_environment_quarter_perspective'], ['Animation Suite', '04_animation_suite'],
  ['Weapon Grip Rig', '05_grip_rig'], ['Katana Stances 1', '06_katana_stances_01'],
].map(([t, f]) => ({ src: `${M}/dev_records/${f}.webp`, caption: t, kicker: 'Dev records' }));

// Videos stay lazy: no preload, a small poster, controls.
const video = (src, poster, caption) => `<figure class="gm-video lk-rv"><div class="lk-video"><video controls playsinline preload="none" poster="${esc(poster)}"><source src="${esc(src)}" type="video/mp4"></video></div><figcaption>${esc(caption)}</figcaption></figure>`;

const heroHtml = `<p class="lk-k">The Shadow Guide · Sensei Sai's Digital Guardian</p>
  <h1>I am Kage (影)</h1>
  <p class="lk-lede">In Japanese, Kage means shadow. Inspired by the visual poetry and feudal grit of Ghost of Tsushima, I am Sensei Sai's shadow, standing guard over his research, his medical imaging work, and the digital worlds he builds.</p>
  ${callout(`<p>"He carries a katana not to cut men, but to cut through confusion. Wherever Sensei Sai walks across feudal history and dystopian cyberspace, I walk beside him."</p>`, 'gm-quote')}
  ${chips(['Ghost of Tsushima Inspired', "Sensei Sai's Shadow", 'Ronin Mascot', '3D Interactive Companion'])}
  <div class="lk-btns"><button type="button" class="lk-btn" data-ask>Ask Kage</button>
    ${btn({ href: 'https://github.com/SaiKiranKumarNalla', label: 'GitHub Repo ↗', ghost: true, ext: true })}${btn({ href: 'https://itch.io', label: 'Itch.io ↗', ghost: true, ext: true })}${btn({ href: 'https://youtube.com', label: 'YouTube ↗', ghost: true, ext: true })}</div>`;

const story = split({
  flip: true,
  text: `<p class="lk-k">Godot 4.7 · 3D Action Adventure · In Development</p><h2>The Feudal &amp; AI Realms</h2>
    <p class="lk-lede">A high-fidelity samurai action-adventure set across feudal Japan and cyberspace.</p>
    <p>Traditional swordplay and deep AI mechanics (tokens, attention, agent teams) intertwine across a living province.</p>
    ${stats([{ value: '60', unit: 'FPS', label: 'native runtime' }, { value: 'Akabashi', label: 'living province' }, { value: 'Ronin', label: 'PBR hero' }], 'gm-story-stats')}
    ${chips(['Godot Engine', 'Ronin Samurai', 'Living City', 'Tsushima Map', 'Realtime Combat'])}`,
  media: stage('story', { focus: '0.1 0.06 0.9 0.96' }),
});

const environment = sec(`${head({ kicker: 'Architectural Vistas', title: 'Historic Akabashi Landmarks', lede: 'Zoomed-out establishing vistas of the architectural landmarks across the province. Hard-edged low-poly geometry carrying rich hand-authored PBR surface materials. Open any landmark to inspect it in full.' })}
  ${gallery(env, 'kage-env', 'gm-env')}`, { id: 'environment' });

const gameplay = sec(`${head({ kicker: 'In-engine playable build', title: 'Live Gameplay Capture (60 FPS)', lede: 'Direct in-game gameplay video and live traversal screen captures of Kage navigating, sprinting, and climbing through Akabashi.' })}
  <div class="gm-showcase">
    ${video(`${M}/kage_gameplay_live.mp4`, `${M}/gameplay/gameplay_shot_01.webp`, 'Direct in-game recording: third-person orbit camera, 60 FPS smooth locomotion, bridge crossing, and market traversal. Loads when you press play.')}
    <div><p class="lk-k">Live traversal &amp; interior snapshots</p>${gallery(shots, 'kage-play', 'gm-shots')}</div>
  </div>`, { id: 'gameplay' });

const records_ = split({
  text: `<p class="lk-k">Technical Records</p><h2>3D Village Environment &amp; Rig Suite</h2>
    <p class="lk-lede">Development records, character rig inspection suites, and the complete Godot 3D village environment video overview.</p>
    ${callout('<p><b>Performance target</b></p><p>Tuned for 60 FPS stable performance on integrated GPUs (Apple Silicon M1 / Intel Iris). Shadow maps up to 2048, low draw call count, and zero screen-space GTAO artifacts.</p>', 'gm-perf')}`,
  media: video(`${M}/dev_records/godot_map_overview.mp4`, `${M}/dev_records/01_godot_environment_design_viewer.webp`, '3D village environment: Godot Forward+ cinematic overview sweep across the fortress walls, riverway, and compound layout. Loads when you press play.'),
});

const recordGallery = sec(`${head({ kicker: 'Design blueprint', title: 'Character suite and level layout', lede: 'Blueprints, the animation suite and rig diagnostics, in the order they were made.' })}
  ${gallery(records, 'kage-dev', 'gm-shots')}`, { id: 'records' });

const crew = sec(`${head({ kicker: 'How it is built', title: 'A multi-agent crew builds the game', lede: 'Three CLI agents work in separate git worktrees on a shared task board; no agent approves its own work, and a person holds the merge gate.' })}
  ${grid([
    card({ kicker: 'Engine and shaders', title: 'Claude Code', text: 'Builds engine features and shaders in its own worktree.' }),
    card({ kicker: 'Gameplay and physics', title: 'Codex CLI', text: 'Builds gameplay and physics in a parallel worktree.' }),
    card({ kicker: 'Peer review and tests', title: 'Antigravity CLI', text: 'Reviews and tests every change it did not write.' }),
  ], 'lk-g3 gm-crew')}
  <p class="lk-rv"><a href="/sections/builder.html#kage">See the crew at work, step by step →</a></p>`, { id: 'crew' });

const closing = cta({
  kicker: 'More games', title: 'Back to the work', text: 'Kage is one of the projects built alongside the research.',
  links: [{ href: '/sections/projects.html', label: 'Projects wall →' }, { href: '/sections/builder.html', label: 'Agentic AI →', ghost: true }],
});

mountPage({
  active: 'projects',
  html: hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.55 0.12 0.98 0.92', focusM: '0.04 0.1 0.96 0.96' }), html: heroHtml })
    + story + environment + gameplay + records_ + recordGallery + crew + closing,
  stages: { hero: heroStage, story: storyStage },
});

document.querySelector('[data-ask]')?.addEventListener('click', () => window.KageAsk?.('Tell me about Sensei Sai'));

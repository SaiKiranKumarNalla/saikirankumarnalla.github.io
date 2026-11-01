// Kage Game showcase page: story-driven samurai action-adventure in Godot.
// 3D backdrop: Kage character model with interactive camera frames per step.
import { runPage } from './engine.js';
import { makeKage } from '../world/kageModel.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const STEPS = [
  {
    title: 'I am Kage (影)',
    html: `
      <p class="s-kicker">The Shadow Guide · Sensei Sai's Digital Guardian</p>
      <h1>I am Kage (影)</h1>
      <p class="s-lede">In Japanese, <strong>Kage</strong> means <em>shadow</em>. Inspired by the visual poetry and feudal grit of <strong>Ghost of Tsushima</strong>, I am Sensei Sai's shadow — standing guard over his research, his medical imaging work, and the digital worlds he builds.</p>
      
      <div style="margin: 1.2rem 0; padding: 14px 16px; background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: 8px;">
        <p style="font-size: 0.92rem; color: var(--text); line-height: 1.6; margin: 0;">
          <em>"He carries a katana not to cut men, but to cut through confusion. Wherever Sensei Sai walks across feudal history and dystopian cyberspace, I walk beside him."</em>
        </p>
      </div>

      <div class="s-chips">
        <span>Ghost of Tsushima Inspired</span><span>Sensei Sai's Shadow</span><span>Ronin Mascot</span><span>3D Interactive Companion</span>
      </div>

      <div style="margin-top: 1.4rem; display: flex; gap: 8px; flex-wrap: wrap;">
        <button onclick="if(window.KageAsk) window.KageAsk('Tell me about Sensei Sai');" style="background: var(--accent-strong); color: #fff; border: 0; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.86rem; transition: transform 0.2s;">💬 Ask Kage</button>
        <a href="https://github.com/SaiKiranKumarNalla" target="_blank" rel="noopener" style="background: var(--chip); color: var(--text); border: 1px solid var(--line); padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.84rem; text-decoration: none; display: inline-flex; align-items: center;">GitHub Repo ↗</a>
        <a href="https://itch.io" target="_blank" rel="noopener" style="background: var(--chip); color: var(--text); border: 1px solid var(--line); padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.84rem; text-decoration: none; display: inline-flex; align-items: center;">Itch.io ↗</a>
        <a href="https://youtube.com" target="_blank" rel="noopener" style="background: var(--chip); color: var(--text); border: 1px solid var(--line); padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.84rem; text-decoration: none; display: inline-flex; align-items: center;">YouTube ↗</a>
      </div>

      <p class="s-scroll">Scroll down to explore the Kage action-adventure game below ↓</p>
    `,
  },
  {
    title: 'Kage: The Game',
    html: `
      <p class="s-kicker">Godot 4.7 · 3D Action Adventure · In Development</p>
      <h2>The Feudal &amp; AI Realms</h2>
      <p>A high-fidelity samurai action-adventure game set across feudal Japan and cyberspace, where traditional swordplay and deep AI mechanics (tokens, attention, agent teams) intertwine.</p>
      <div class="s-stat">
        <div><b>60 FPS</b><span>native runtime</span></div>
        <div><b>Akabashi</b><span>living province</span></div>
        <div><b>Ronin</b><span>PBR hero</span></div>
      </div>
      <div class="s-chips">
        <span>Godot Engine</span><span>Ronin Samurai</span><span>Living City</span><span>Tsushima Map</span><span>Realtime Combat</span>
      </div>
      <p class="s-scroll">Scroll down for environment, gameplay &amp; dev records</p>
    `,
  },
  {
    title: 'Environment',
    html: `
      <p class="s-kicker">Architectural Vistas · Environment</p>
      <h2>Historic Akabashi Landmarks</h2>
      <p>Zoomed-out establishing vistas of the architectural landmarks across the province. Hard-edged low-poly geometry carrying rich hand-authored PBR surface materials.</p>
      
      <div style="display:grid; grid-template-columns:1fr; gap:14px; margin:1.4rem 0;">
        <div style="background:var(--panel); border:1px solid var(--line); border-radius:10px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/scenery/01_forge.png" alt="1. The Forge" style="width:100%; height:200px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:10px 14px;">
            <b style="color:var(--text); font-size:0.95rem;">1. The Forge</b>
            <p style="font-size:0.82rem; color:var(--muted); margin:4px 0 0;">Blacksmith compound overlooking anvil workbenches, weapon racks, smelting kilns, and timber storage sheds.</p>
            <span style="display:inline-block; margin-top:6px; font-size:0.72rem; text-transform:uppercase; color:var(--accent); font-weight:600;">environment</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:10px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/scenery/02_pagoda.png" alt="2. The Pagoda" style="width:100%; height:200px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:10px 14px;">
            <b style="color:var(--text); font-size:0.95rem;">2. The Pagoda</b>
            <p style="font-size:0.82rem; color:var(--muted); margin:4px 0 0;">Multi-tiered wooden pagoda nestled within the sacred pine grove, stone toro lanterns, and ceremonial incense altars.</p>
            <span style="display:inline-block; margin-top:6px; font-size:0.72rem; text-transform:uppercase; color:var(--accent); font-weight:600;">environment</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:10px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/scenery/03_entry_gate.png" alt="3. Entry Gate" style="width:100%; height:200px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:10px 14px;">
            <b style="color:var(--text); font-size:0.95rem;">3. Entry Gate</b>
            <p style="font-size:0.82rem; color:var(--muted); margin:4px 0 0;">Main ceremonial gateway framing the outer entrance into Akabashi with heavy timber reinforced doors and stone ramparts.</p>
            <span style="display:inline-block; margin-top:6px; font-size:0.72rem; text-transform:uppercase; color:var(--accent); font-weight:600;">environment</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:10px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/scenery/05_training_arena.png" alt="4. Training Arena" style="width:100%; height:200px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:10px 14px;">
            <b style="color:var(--text); font-size:0.95rem;">4. Training Arena</b>
            <p style="font-size:0.82rem; color:var(--muted); margin:4px 0 0;">Martial training precinct featuring elevated sparring rings, sand practice pits, spectator shelters, and combat practice dummies.</p>
            <span style="display:inline-block; margin-top:6px; font-size:0.72rem; text-transform:uppercase; color:var(--accent); font-weight:600;">environment</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:10px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/scenery/06_kages_home.png" alt="5. Kage's Home" style="width:100%; height:200px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:10px 14px;">
            <b style="color:var(--text); font-size:0.95rem;">5. Kage's Home</b>
            <p style="font-size:0.82rem; color:var(--muted); margin:4px 0 0;">The ronin's residence compound featuring traditional wooden shoji frames, tiled eaves, and an inner contemplation courtyard.</p>
            <span style="display:inline-block; margin-top:6px; font-size:0.72rem; text-transform:uppercase; color:var(--accent); font-weight:600;">environment</span>
          </div>
        </div>
      </div>
      <p style="font-size:0.8rem; color:var(--faint);">Click any location landmark to inspect in full-resolution lightbox.</p>
    `,
  },
  {
    title: 'Gameplay',
    html: `
      <p class="s-kicker">In-Engine Playable Build · Gameplay</p>
      <h2>Live Gameplay Capture (60 FPS)</h2>
      <p>Direct in-game gameplay video and live traversal screen captures of Kage navigating, sprinting, and climbing through Akabashi.</p>
      
      <div style="margin: 1.6rem 0;">
        <video autoplay loop muted playsinline preload="auto" poster="/media/kage-game/gameplay/gameplay_shot_01.png" style="width:100%; border-radius:12px; border:2px solid var(--accent); display:block; background:#000; box-shadow:0 12px 36px rgba(0,0,0,0.5);">
          <source src="/media/kage-game/kage_gameplay_live.mp4" type="video/mp4">
        </video>
        <p style="font-size:0.86rem; color:var(--text); font-weight:500; margin-top:0.6rem;">🎥 Direct in-game recording: Third-person orbit camera, 60 FPS smooth locomotion, bridge crossing, and market traversal.</p>
      </div>

      <h3 style="margin-top:1.8rem;">Live Traversal &amp; Interior Snapshots</h3>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:1.2rem 0;">
        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/gameplay/gameplay_shot_01.png" alt="Compound Gateway Entrance" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Gateway Entrance</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">gameplay</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/gameplay/gameplay_shot_02.png" alt="Village Square & Cherry Blossoms" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Village Square</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">gameplay</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/gameplay/gameplay_shot_03.png" alt="Covered Arena Pavilion" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Arena Pavilion</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">gameplay</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/gameplay/gameplay_shot_04_bridge.png" alt="Pagoda street" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Pagoda street</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">gameplay</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/gameplay/gameplay_shot_05_sprint.png" alt="Atrium" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Atrium</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">gameplay</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/gameplay/gameplay_shot_06_combat.png" alt="Martial Stance & Arena Approach" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Martial Stance</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">gameplay</span>
          </div>
        </div>
      </div>
      <p style="font-size:0.8rem; color:var(--faint);">Click any in-game shot to enlarge.</p>
    `,
  },
  {
    title: 'Dev Records',
    html: `
      <p class="s-kicker">Technical Records · Dev Records</p>
      <h2>3D Village Environment &amp; Rig Suite</h2>
      <p>Development records, character rig inspection suites, and complete Godot 3D village environment video overview.</p>

      <div style="margin: 1.4rem 0;">
        <video autoplay loop muted playsinline preload="auto" poster="/media/kage-game/dev_records/01_godot_environment_design_viewer.png" style="width:100%; border-radius:12px; border:2px solid var(--accent); display:block; background:#000; box-shadow:0 12px 36px rgba(0,0,0,0.5);">
          <source src="/media/kage-game/dev_records/godot_map_overview.mp4" type="video/mp4">
        </video>
        <p style="font-size:0.86rem; color:var(--text); font-weight:500; margin-top:0.6rem;">🎥 3D Village Environment: Godot Forward+ cinematic overview sweep across the fortress walls, riverway, and compound layout.</p>
      </div>

      <h3 style="margin-top:1.8rem;">Design Blueprint &amp; Character Suite</h3>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:1.2rem 0;">
        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/dev_records/01_godot_environment_design_viewer.png" alt="Godot Environment Design Viewer" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Design Viewer</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">dev records</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/dev_records/02_godot_environment_topdown_blueprint.png" alt="Level Layout Blueprint" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Layout Blueprint</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">dev records</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/dev_records/03_godot_environment_quarter_perspective.png" alt="Quarter-Perspective Overview" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Quarter Overview</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">dev records</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/dev_records/04_animation_suite.png" alt="Four-Character Animation Suite" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Animation Suite</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">dev records</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/dev_records/05_grip_rig.png" alt="Weapon Grip & Rigging Diagnostics" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Weapon Grip Rig</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">dev records</span>
          </div>
        </div>

        <div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden;">
          <img class="kage-lightbox-trigger" src="/media/kage-game/dev_records/06_katana_stances_01.png" alt="Katana Stance Diagnostics — Sheet 1" style="width:100%; height:120px; object-fit:cover; display:block; cursor:pointer;">
          <div style="padding:6px 8px;">
            <b style="font-size:0.8rem; color:var(--text); display:block;">Katana Stances 1</b>
            <span style="font-size:0.7rem; color:var(--accent); text-transform:uppercase; font-weight:600;">dev records</span>
          </div>
        </div>
      </div>

      <div class="s-role" style="margin-top:1.6rem;">
        <b>Performance Target</b>
        <p>Tuned for 60 FPS stable performance on integrated GPUs (Apple Silicon M1 / Intel Iris). Shadow maps &le; 2048, low draw call count, and zero screen-space GTAO artifacts.</p>
      </div>

      <a class="s-more" href="/sections/projects.html">← Back to Projects wall</a>
    `,
  },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

// Simple full-screen lightbox for screenshots
const lightbox = document.createElement('div');
lightbox.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(8px);z-index:9999;display:none;align-items:center;justify-content:center;cursor:zoom-out;padding:24px;';
lightbox.innerHTML = `<img id="kageLightboxImg" style="max-width:92vw;max-height:90vh;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,0.8);object-fit:contain;" src="" alt="Enlarged view">`;
document.body.appendChild(lightbox);

const lbImg = document.getElementById('kageLightboxImg');
document.querySelectorAll('.kage-lightbox-trigger').forEach((el) => {
  el.addEventListener('click', () => {
    lbImg.src = el.src;
    lightbox.style.display = 'flex';
  });
});
lightbox.addEventListener('click', () => { lightbox.style.display = 'none'; });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.style.display = 'none'; });

runPage({
  active: 'projects',
  build({ THREE, scene, reduceMotion }) {
    const kage = makeKage();
    kage.position.set(3.2, -1.8, 0);
    kage.scale.setScalar(1.2);
    scene.add(kage);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.7, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x221a20, roughness: 0.8, metalness: 0.1 })
    );
    platform.position.set(3.2, -2.0, 0);
    scene.add(platform);

    const glowRing = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.3, 32),
      new THREE.MeshStandardMaterial({ color: 0xbd3c32, emissive: 0xee6756, emissiveIntensity: 0.8, side: THREE.DoubleSide })
    );
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.set(3.2, -1.78, 0);
    scene.add(glowRing);

    return {
      keyframes: [
        { pos: [0, 2.5, 12], look: [1.8, 0.5, 0] },
        { pos: [1.2, 3.0, 11], look: [2.5, 0.7, 0] },
        { pos: [1.5, 3.2, 10], look: [2.8, 0.8, 0] },
        { pos: [-1, 2.0, 11], look: [2.2, 0.2, 0] },
        { pos: [0.5, 2.8, 12], look: [2.0, 0.5, 0] },
      ],
      update(t, progress, dt) {
        kage.userData.animate(t, false, dt);
        if (!reduceMotion) {
          kage.rotation.y = -0.4 + Math.sin(t * 0.4) * 0.25;
        }
      },
    };
  },
});

document.querySelectorAll('video[autoplay]').forEach((v) => {
  v.muted = true;
  v.play().catch(() => {});
});

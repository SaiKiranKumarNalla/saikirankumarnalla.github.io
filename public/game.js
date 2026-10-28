// ═══════════════════════════════════════════════════════════════
// ANIMUS CODEX — Full Game Engine
// 9 missions · 3 cities · stealth / parkour / puzzle
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  /* ─── CSS Injection ──────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
/* Mission overlay */
.mo{position:absolute;inset:0;z-index:50;background:rgba(8,8,9,.97);display:flex;flex-direction:column;overflow:hidden;animation:moIn .35s ease}
@keyframes moIn{from{opacity:0}to{opacity:1}}
.mo-hud{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.2rem;border-bottom:1px solid var(--ghost-line);min-height:44px;flex-shrink:0}
.mo-tag{font-family:'Space Mono',monospace;font-size:.5rem;text-transform:uppercase;letter-spacing:.2em;padding:.3rem .6rem;border:1px solid rgba(139,26,26,.45);color:var(--blood-glow)}
.mo-title{font-family:'Zen Antique',serif;font-size:1rem;color:var(--paper)}
.mo-abort{font-family:'Space Mono',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.12em;color:var(--mist);background:0;border:1px solid var(--ghost-line);padding:.45rem .7rem;cursor:pointer}
.mo-abort:hover{border-color:rgba(139,26,26,.5);color:var(--paper)}
.mo-body{flex:1;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.2rem}

/* Briefing screen inside mission overlay */
.mo-brief{text-align:center;max-width:480px;animation:fadeUp .4s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.mo-brief-kanji{font-family:'Noto Serif JP',serif;font-size:4rem;color:rgba(139,26,26,.2);margin-bottom:1rem}
.mo-brief-text{font-size:.88rem;color:var(--mist);line-height:1.8;font-weight:300;margin-bottom:1.5rem}
.mo-brief-hint{font-family:'Space Mono',monospace;font-size:.46rem;text-transform:uppercase;letter-spacing:.14em;color:var(--steel);margin-bottom:1.5rem}
.mo-begin{font-family:'Space Mono',monospace;font-size:.54rem;text-transform:uppercase;letter-spacing:.16em;color:var(--paper);background:0;border:1px solid rgba(139,26,26,.5);padding:.85rem 1.4rem;cursor:pointer;transition:all .3s}
.mo-begin:hover{background:rgba(139,26,26,.12);transform:translateY(-2px)}

/* ── STEALTH ── */
.sg-wrap{width:100%;max-width:520px;animation:fadeUp .3s ease}
.sg-grid{display:grid;gap:1px;background:rgba(240,235,227,.04);border:1px solid var(--ghost-line);position:relative;user-select:none}
.sg-cell{aspect-ratio:1;background:rgba(10,10,11,.7);position:relative;cursor:pointer;transition:background .15s}
.sg-cell:hover{background:rgba(139,26,26,.06)}
.sg-cell.sg-wall{background:rgba(240,235,227,.06);cursor:default;pointer-events:none}
.sg-cell.sg-wall:hover{background:rgba(240,235,227,.06)}
.sg-cell.sg-hide{background:rgba(212,175,55,.04);border:1px dashed rgba(212,175,55,.15)}
.sg-cell.sg-exit{background:rgba(139,26,26,.08)}
.sg-cell.sg-exit.sg-open{background:rgba(139,26,26,.18);box-shadow:inset 0 0 12px rgba(194,59,59,.2)}
.sg-cell.sg-exit.sg-open::after{content:'⬡';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--blood-glow);font-size:1.1rem}
.sg-cell.sg-path{background:rgba(139,26,26,.05)}
.sg-cell.sg-danger{background:rgba(194,59,59,.08)}
.sg-entity{position:absolute;z-index:10;transition:left .22s ease,top .22s ease;pointer-events:none;display:flex;align-items:center;justify-content:center}
.sg-player-shape{width:60%;height:60%;background:var(--blood-glow);transform:rotate(45deg);box-shadow:0 0 10px rgba(194,59,59,.5)}
.sg-guard-shape{width:55%;height:55%;background:rgba(240,235,227,.35);transform:rotate(45deg);border:1px solid rgba(240,235,227,.5)}
.sg-intel-shape{width:40%;height:40%;background:rgba(212,175,55,.7);transform:rotate(45deg);box-shadow:0 0 12px rgba(212,175,55,.4);animation:pulse 1.8s ease-in-out infinite}
.sg-intel-shape.collected{opacity:0;transform:rotate(45deg) scale(0)}
@keyframes pulse{0%,100%{box-shadow:0 0 8px rgba(212,175,55,.3)}50%{box-shadow:0 0 18px rgba(212,175,55,.7)}}
.sg-bar{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.8rem;flex-wrap:wrap}
.sg-eagle{font-family:'Space Mono',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.1em;color:var(--paper);background:rgba(139,26,26,.1);border:1px solid rgba(139,26,26,.4);padding:.5rem .8rem;cursor:pointer;transition:all .3s}
.sg-eagle:hover{background:rgba(139,26,26,.2)}
.sg-eagle.active{border-color:rgba(212,175,55,.6);color:rgba(212,175,55,.9);background:rgba(212,175,55,.08)}
.sg-info{font-family:'Space Mono',monospace;font-size:.46rem;text-transform:uppercase;letter-spacing:.1em;color:var(--steel)}
.sg-flash{animation:sgFlash .4s ease}
@keyframes sgFlash{0%,100%{filter:none}50%{filter:brightness(2) hue-rotate(-20deg)}}

/* ── PARKOUR ── */
.pk-wrap{width:100%;max-width:440px;animation:fadeUp .3s ease}
.pk-field{position:relative;height:480px;border:1px solid var(--ghost-line);overflow:hidden;background:linear-gradient(180deg,rgba(10,10,11,.9),rgba(20,18,16,.95)),repeating-linear-gradient(90deg,transparent,transparent 38px,rgba(240,235,227,.02) 39px),repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(240,235,227,.015) 25px)}
.pk-inner{position:absolute;left:0;right:0;transition:top .4s ease}
.pk-ledge{position:absolute;height:8px;background:linear-gradient(90deg,rgba(240,235,227,.25),rgba(240,235,227,.45),rgba(240,235,227,.25));border-radius:2px;cursor:pointer;transition:all .25s;z-index:2}
.pk-ledge:hover{background:linear-gradient(90deg,rgba(194,59,59,.4),rgba(194,59,59,.6),rgba(194,59,59,.4));box-shadow:0 0 12px rgba(194,59,59,.2)}
.pk-ledge.pk-active{background:linear-gradient(90deg,rgba(194,59,59,.5),rgba(194,59,59,.7),rgba(194,59,59,.5))}
.pk-ledge.pk-crumble{background:linear-gradient(90deg,rgba(212,175,55,.2),rgba(212,175,55,.35),rgba(212,175,55,.2));border:1px dashed rgba(212,175,55,.3)}
.pk-ledge.pk-crumbling{animation:crumble .6s ease forwards}
@keyframes crumble{to{opacity:0;transform:translateY(8px) scaleX(.5)}}
.pk-ledge.pk-moving{animation:pkMove 3s ease-in-out infinite alternate}
@keyframes pkMove{from{transform:translateX(-30px)}to{transform:translateX(30px)}}
.pk-player{position:absolute;width:16px;height:22px;background:var(--blood-glow);clip-path:polygon(50% 0%,100% 35%,85% 100%,15% 100%,0% 35%);z-index:10;transition:left .35s ease,top .35s ease;filter:drop-shadow(0 0 8px rgba(194,59,59,.5))}
.pk-sync{position:absolute;width:40px;height:40px;border:2px solid rgba(194,59,59,.5);transform:rotate(45deg);display:flex;align-items:center;justify-content:center;z-index:5}
.pk-sync::after{content:'鷹';transform:rotate(-45deg);font-family:'Noto Serif JP',serif;font-size:.9rem;color:var(--blood-glow);animation:pulse 2s ease-in-out infinite}
.pk-bar{display:flex;justify-content:space-between;align-items:center;margin-top:.7rem}
.pk-info{font-family:'Space Mono',monospace;font-size:.46rem;text-transform:uppercase;letter-spacing:.1em;color:var(--steel)}
.pk-leap{animation:leapFaith 1.2s ease forwards}
@keyframes leapFaith{0%{transform:translateY(0) scale(1);opacity:1}60%{transform:translateY(80px) scale(.6);opacity:.6}100%{transform:translateY(200px) scale(.3);opacity:0}}

/* ── PUZZLE ── */
.pz-wrap{width:100%;max-width:560px;animation:fadeUp .3s ease}
.pz-room{position:relative;min-height:260px;border:1px solid var(--ghost-line);background:linear-gradient(135deg,rgba(139,26,26,.04),transparent 40%),rgba(10,10,11,.7);padding:1rem;display:flex;flex-wrap:wrap;gap:.8rem;justify-content:center;align-items:center}
.pz-obj{width:110px;min-height:90px;border:1px solid var(--ghost-line);background:rgba(10,10,11,.6);padding:.7rem;cursor:pointer;transition:all .3s;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem}
.pz-obj:hover{border-color:rgba(139,26,26,.4);background:rgba(139,26,26,.06);transform:translateY(-3px)}
.pz-obj.examined{border-color:rgba(212,175,55,.4);background:rgba(212,175,55,.04)}
.pz-obj-icon{font-size:1.6rem;line-height:1}
.pz-obj-name{font-family:'Space Mono',monospace;font-size:.44rem;text-transform:uppercase;letter-spacing:.1em;color:var(--mist)}
.pz-log{margin-top:.8rem;border:1px solid var(--ghost-line);background:rgba(10,10,11,.5);padding:.8rem;min-height:80px;max-height:150px;overflow-y:auto}
.pz-log-title{font-family:'Space Mono',monospace;font-size:.44rem;text-transform:uppercase;letter-spacing:.16em;color:rgba(139,26,26,.5);margin-bottom:.5rem}
.pz-clue{font-size:.78rem;color:var(--mist);line-height:1.6;font-weight:300;margin-bottom:.4rem;padding-left:.6rem;border-left:2px solid rgba(139,26,26,.3);animation:fadeUp .3s ease}
.pz-code{margin-top:.8rem;display:flex;flex-direction:column;gap:.6rem;align-items:center}
.pz-code-label{font-family:'Space Mono',monospace;font-size:.44rem;text-transform:uppercase;letter-spacing:.14em;color:var(--steel)}
.pz-code-slots{display:flex;gap:.5rem}
.pz-slot{width:52px;height:52px;border:1px solid var(--ghost-line);background:rgba(10,10,11,.6);display:flex;align-items:center;justify-content:center;font-family:'Zen Antique',serif;font-size:1.1rem;color:var(--paper);transition:all .25s}
.pz-slot.filled{border-color:rgba(139,26,26,.5);background:rgba(139,26,26,.08)}
.pz-options{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center}
.pz-opt{width:52px;height:42px;border:1px solid var(--ghost-line);background:rgba(10,10,11,.6);font-family:'Space Mono',monospace;font-size:.6rem;color:var(--mist);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
.pz-opt:hover{border-color:rgba(139,26,26,.4);color:var(--paper);background:rgba(139,26,26,.08)}
.pz-opt.used{opacity:.3;pointer-events:none}
.pz-code-reset{font-family:'Space Mono',monospace;font-size:.42rem;text-transform:uppercase;letter-spacing:.1em;color:var(--steel);background:0;border:1px solid var(--ghost-line);padding:.3rem .6rem;cursor:pointer;margin-top:.3rem}
.pz-code-reset:hover{color:var(--paper);border-color:rgba(139,26,26,.4)}

/* Codex reveal */
.codex-reveal{text-align:center;max-width:500px;animation:fadeUp .5s ease}
.codex-reveal-kanji{font-family:'Noto Serif JP',serif;font-size:5rem;color:rgba(139,26,26,.25);margin-bottom:1rem}
.codex-reveal-tag{font-family:'Space Mono',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.22em;color:var(--blood-glow);margin-bottom:.8rem}
.codex-reveal-title{font-family:'Zen Antique',serif;font-size:1.4rem;margin-bottom:1rem;color:var(--paper)}
.codex-reveal-text{font-size:.88rem;line-height:1.85;color:var(--mist);font-weight:300;margin-bottom:1.5rem;text-align:left;border-left:2px solid rgba(139,26,26,.3);padding-left:1rem}

/* ── City codex nodes ── */
.cn{position:absolute;width:100px;height:62px;border:1px solid var(--ghost-line);background:rgba(10,10,11,.8);padding:.55rem;cursor:pointer;z-index:3;transition:all .3s}
.cn:hover,.cn.cn-active{border-color:rgba(139,26,26,.5);background:rgba(139,26,26,.08);transform:translateY(-4px)}
.cn.cn-done{opacity:.55;border-color:rgba(212,175,55,.3);background:rgba(212,175,55,.04)}
.cn b{font-family:'Zen Antique',serif;font-size:.78rem;display:block;line-height:1.2}
.cn span{font-family:'Space Mono',monospace;font-size:.36rem;text-transform:uppercase;letter-spacing:.08em;color:var(--steel);display:block;margin-top:.2rem}
.cn .cn-type{color:var(--blood-glow)}

/* Completion flash */
.complete-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(212,175,55,.15),transparent 60%);animation:cFlash .8s ease forwards;pointer-events:none;z-index:99}
@keyframes cFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}

@media(max-width:720px){
  .mo-hud{padding:.5rem .8rem}
  .sg-wrap,.pk-wrap,.pz-wrap{max-width:100%}
  .pk-field{height:400px}
  .pz-obj{width:90px;min-height:75px}
}
`;
  document.head.appendChild(css);

  /* ─── Helpers ─────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const $$ = s => [...document.querySelectorAll(s)];
  function toast(msg) {
    const t = $('toast2');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1400);
  }

  /* ─── State ──────────────────────────────────────────────── */
  const S = {
    sync: 0,
    worldSynced: false,
    eagleIndia: false,
    eagleFrance: false,
    currentCity: null,
    missionsDone: {},       // { 'hyderabad-0': true, ... }
    citiesDone: new Set(),
    codex: [],
    activeMission: null     // reference to running engine
  };

  function setSync(v) {
    S.sync = Math.max(0, Math.min(100, v));
    const f = $('ac2Fill'), n = $('ac2Num');
    if (f) f.style.width = S.sync + '%';
    if (n) n.textContent = S.sync + '%';
  }
  function addSync(pts, msg) { setSync(S.sync + pts); toast(msg + ' · +' + pts + ' sync'); }
  function cityDoneCount() { return ['hyderabad', 'paris', 'toulouse'].filter(c => S.citiesDone.has(c)).length; }

  /* ─── Mission Data ───────────────────────────────────────── */
  const CITIES = {
    hyderabad: {
      region: 'india', title: 'Hyderabad', kicker: 'City Memory — The First Forge',
      intro: 'Mechanical engineering roots, early design/build mindset, and the AUV seed.',
      codexFull: 'Mechanical engineering at Mahindra University. First publication on gas embolism in carotid arteries. Deputy team lead of AUV MEC — systems thinking, leadership, and underwater vehicle design. Excellence scholarship recipient with early fascination for fluid mechanics and biomechanics.',
      syncPts: 16,
      missions: [
        {
          type: 'stealth', title: 'Campus Shadow', kanji: '影',
          briefing: 'Night has fallen over the university campus. Slip past the security patrols and collect three pieces of engineering intel before reaching the archive exit.',
          hint: 'Click adjacent cells to move. Guards move when you move. Dashed cells are hiding spots. Collect all intel (◇) then reach the exit (⬡).',
          codex: { title: 'Engineering Origins', text: 'Mechanical engineering foundations at Mahindra University. A curiosity about how things move — fluids, forces, pressure waves. First journal publication on gas embolism behaviour in human carotid arteries.' },
          map: [
            '########',
            '#P..H..#',
            '#.##.#.#',
            '#i.....#',
            '#.#.##.#',
            '#....Hi#',
            '#.#G...#',
            '#..G.iX#',
            '########'
          ],
          guards: [
            { path: [[6,3],[6,4],[6,5],[6,4]], speed: 1 },
            { path: [[7,2],[7,3],[7,4],[7,3]], speed: 1 }
          ]
        },
        {
          type: 'parkour', title: 'Engineering Tower', kanji: '登',
          briefing: 'Scale the engineering building to reach the rooftop viewpoint. Some ledges are unstable — they crumble after you land. Moving ledges shift position.',
          hint: 'Click a highlighted ledge to jump. Gold dashed ledges crumble after use. Reach the eagle symbol at the top to synchronize.',
          codex: { title: 'Systems Thinker', text: 'Deputy Team Lead of AUV MEC — mechanical subdivision lead for autonomous underwater vehicle development. CFD, thermal simulation, systems engineering, and team execution across two competition cycles.' },
          ledges: [
            { x: 160, y: 440, w: 120, type: 'solid' },
            { x: 40,  y: 390, w: 90,  type: 'solid' },
            { x: 250, y: 350, w: 80,  type: 'crumble' },
            { x: 100, y: 300, w: 100, type: 'solid' },
            { x: 280, y: 260, w: 70,  type: 'moving' },
            { x: 50,  y: 220, w: 90,  type: 'solid' },
            { x: 200, y: 180, w: 80,  type: 'crumble' },
            { x: 80,  y: 130, w: 100, type: 'solid' },
            { x: 250, y: 85,  w: 90,  type: 'solid' },
            { x: 150, y: 35,  w: 80,  type: 'solid' }
          ]
        },
        {
          type: 'puzzle', title: 'Workshop Cipher', kanji: '鍵',
          briefing: 'The AUV workshop is locked behind a cipher. Examine the equipment to find clues. The combination is hidden in the objects around you.',
          hint: 'Click each object to examine it. Collect clues, then enter the 3-digit code in the correct order.',
          codex: { title: 'The Builder\'s Seed', text: 'Excellence Scholarship at Mahindra University. Early exposure to autonomous systems, rapid prototyping, and team-based engineering. The origin of a build-first, iterate-fast mindset that carries through to PhD-level research.' },
          objects: [
            { icon: '⚙️', name: 'Engine', clue: 'Serial plate reads: 7' },
            { icon: '🧭', name: 'Nav Unit', clue: 'Calibration code: 3' },
            { icon: '🛡️', name: 'Hull Plate', clue: 'Stamped number: 5' },
            { icon: '📋', name: 'Blueprint', clue: 'Assembly order: Nav → Hull → Engine' }
          ],
          code: ['3', '5', '7'],
          options: ['3', '5', '7', '1', '9', '4']
        }
      ]
    },
    paris: {
      region: 'france', title: 'Paris / Palaiseau', kicker: 'City Memory — The Dōjō',
      intro: 'Biomedical engineering formation, École Polytechnique, lab research, and the simulation bridge.',
      codexFull: 'MSc in Biomechanical & Biomedical Engineering at École Polytechnique — IP Paris. Full scholarship, PhD track admission. Research at LadHyX on soft matter and drug delivery. Work at Hepta Medical building predictive models for cancer treatment devices and translating R&D into investor-facing demos.',
      syncPts: 16,
      missions: [
        {
          type: 'parkour', title: 'Palaiseau Heights', kanji: '翔',
          briefing: 'Scale the campus facades of École Polytechnique to reach the synchronization point. The Parisian wind makes some ledges shift unpredictably.',
          hint: 'Click highlighted ledges to jump. Moving ledges shift — time your jump. Reach the eagle at the top.',
          codex: { title: 'The Polytechnique Years', text: 'MSc in Biomechanical & Biomedical Engineering at École Polytechnique (IP Paris). Full scholarship, admitted to PhD track. A world of soft matter physics, drug delivery research, and deep-tech startup culture.' },
          ledges: [
            { x: 120, y: 440, w: 130, type: 'solid' },
            { x: 270, y: 395, w: 80,  type: 'solid' },
            { x: 50,  y: 345, w: 90,  type: 'crumble' },
            { x: 220, y: 300, w: 100, type: 'solid' },
            { x: 60,  y: 255, w: 80,  type: 'moving' },
            { x: 280, y: 210, w: 70,  type: 'crumble' },
            { x: 130, y: 170, w: 100, type: 'solid' },
            { x: 30,  y: 125, w: 80,  type: 'solid' },
            { x: 220, y: 80,  w: 90,  type: 'moving' },
            { x: 120, y: 35,  w: 100, type: 'solid' }
          ]
        },
        {
          type: 'puzzle', title: 'Lab Protocol', kanji: '験',
          briefing: 'Inside the LadHyX laboratory, the research findings are locked behind a protocol sequence. Examine the equipment to recover the access code.',
          hint: 'Click objects to gather clues. Enter the 3-part code in the order specified.',
          codex: { title: 'Lab Foundations', text: 'Research at LadHyX on soft matter and drug delivery systems. Experiments on soft gels and particle suspensions. Automated image tracking and analysis pipelines built in Python and MATLAB.' },
          objects: [
            { icon: '🔬', name: 'Microscope', clue: 'Magnification setting: 4x' },
            { icon: '💻', name: 'Computer', clue: 'Current test batch: 2' },
            { icon: '⚗️', name: 'Reactor', clue: 'Temperature locked at: 8°C' },
            { icon: '📖', name: 'Lab Manual', clue: 'Protocol order: Batch → Temp → Magnification' }
          ],
          code: ['2', '8', '4'],
          options: ['2', '4', '6', '8', '1', '3']
        },
        {
          type: 'stealth', title: 'Startup Infiltration', kanji: '潜',
          briefing: 'Hepta Medical\'s offices at night. Recover the predictive model data from three terminals without triggering the security system.',
          hint: 'Turn-based stealth. Click to move, guards advance. Collect all intel (◇) then exit (⬡). Hide in dashed cells.',
          codex: { title: 'Startup Forge', text: 'Researcher & Consultant at Hepta Medical. Built predictive models for a minimally invasive cancer treatment device. Automated tools translating R&D data into clinical visualizations for investor demos. Pre-clinical validation and core R&D roadmap support.' },
          map: [
            '#########',
            '#P......#',
            '#.##.##.#',
            '#.H..i..#',
            '#.##.##.#',
            '#i....H.#',
            '#.##.##.#',
            '#....i.X#',
            '#..G..G.#',
            '#########'
          ],
          guards: [
            { path: [[8,2],[8,3],[8,4],[8,3]], speed: 1 },
            { path: [[8,6],[7,6],[6,6],[7,6]], speed: 1 }
          ]
        }
      ]
    },
    toulouse: {
      region: 'france', title: 'Toulouse', kicker: 'City Memory — The Scanner Shrine',
      intro: 'Medical imaging and radiophysics PhD, PET/CT validation, 3DynaPET, MuPET, and CASSOULET.',
      codexFull: 'PhD in Medical Imaging & Radiophysics at IUCT Oncopole. Building simulation tools and physical phantoms that test whether PET/CT scanners and algorithms actually measure what they claim. Collaboration with GE Healthcare. IP strategy with Toulouse Tech Transfer. 6 publications. Tools: 3DynaPET, MuPET, CASSOULET framework.',
      syncPts: 22,
      missions: [
        {
          type: 'puzzle', title: 'Scanner Calibration', kanji: '測',
          briefing: 'The PET scanner needs recalibration. Examine the equipment in the imaging suite to determine the correct parameter sequence.',
          hint: 'Click objects for clues. Enter the 3-parameter code in calibration order.',
          codex: { title: 'The Scanner\'s Eye', text: 'PhD research on quantitative PET/CT imaging. 3D-printed heterogeneous phantoms that mimic real tumour uptake patterns. Computational PET/CT simulation tools bridging the gap between the scanner and the code.' },
          objects: [
            { icon: '🔭', name: 'Scanner', clue: 'Detector ring count: 6' },
            { icon: '🎯', name: 'Phantom', clue: 'Active targets: 1' },
            { icon: '🖥️', name: 'Monitor', clue: 'Iteration setting: 9' },
            { icon: '📑', name: 'Protocol', clue: 'Calibration order: Target → Ring → Iterations' }
          ],
          code: ['1', '6', '9'],
          options: ['1', '3', '6', '9', '2', '5']
        },
        {
          type: 'parkour', title: 'Oncopole Ascent', kanji: '頂',
          briefing: 'The ultimate synchronization point sits atop the Oncopole tower. This is the final climb — more ledges, tighter spacing, and unstable footholds.',
          hint: 'Click ledges to climb. This route is longer and has more crumbling ledges. Reach the eagle at the summit.',
          codex: { title: 'Translational Tools', text: 'Three core systems built during the PhD: 3DynaPET for dynamic PET validation, MuPET for synthetic data generation via mass transport physics, and CASSOULET — a framework for ground truth lesion cohort generation for multimodal imaging.' },
          ledges: [
            { x: 140, y: 440, w: 120, type: 'solid' },
            { x: 30,  y: 400, w: 80,  type: 'solid' },
            { x: 270, y: 360, w: 70,  type: 'crumble' },
            { x: 120, y: 320, w: 90,  type: 'solid' },
            { x: 280, y: 275, w: 80,  type: 'moving' },
            { x: 40,  y: 240, w: 70,  type: 'crumble' },
            { x: 200, y: 200, w: 90,  type: 'solid' },
            { x: 60,  y: 160, w: 80,  type: 'solid' },
            { x: 250, y: 120, w: 70,  type: 'crumble' },
            { x: 100, y: 85,  w: 100, type: 'solid' },
            { x: 280, y: 50,  w: 70,  type: 'solid' },
            { x: 150, y: 20,  w: 80,  type: 'solid' }
          ]
        },
        {
          type: 'stealth', title: 'Hospital Corridor', kanji: '闇',
          briefing: 'Navigate the IUCT Oncopole corridors after hours to reach the restricted imaging suite. Three intel nodes contain the final memory fragments.',
          hint: 'Turn-based movement. More guards patrol these halls. Use hiding spots and time your moves.',
          codex: { title: 'The Researcher\'s Path', text: 'Cross-functional collaboration with GE Healthcare, eMotion, and Mahindra University. IP strategy and commercial valorisation with Toulouse Tech Transfer. Retrospective clinical study on Dynamic PET. Supervision of interns and scientific production management. Defense scheduled September 2026.' },
          map: [
            '##########',
            '#P.......#',
            '#.###.##.#',
            '#.H.i....#',
            '#.###.##.#',
            '#........#',
            '#.##.###.#',
            '#i..H..i.#',
            '#.##.###.#',
            '#..G..G.X#',
            '##########'
          ],
          guards: [
            { path: [[9,2],[9,3],[9,4],[9,3]], speed: 1 },
            { path: [[9,6],[8,6],[7,6],[8,6]], speed: 1 }
          ]
        }
      ]
    }
  };

  /* ─── Screen Navigation ──────────────────────────────────── */
  function showScreen(name) {
    $$('.ac2-screen').forEach(s => s.classList.toggle('active', s.dataset.screen === name));
    const st = $('ac2Status');
    if (st) st.textContent = 'ANIMUS CODEX: ' + name.toUpperCase();
  }

  function openGame() {
    const g = $('ac2');
    if (!g) return;
    g.classList.add('open');
    g.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showScreen('brief');
  }

  function closeGame() {
    const g = $('ac2');
    if (!g) return;
    g.classList.remove('open');
    g.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ─── World / Region / City Navigation ───────────────────── */
  function syncWorld() {
    if (S.worldSynced) return;
    S.worldSynced = true;
    const wp = $('ac2WorldPanel');
    if (wp) wp.classList.add('synced');
    const frag = document.querySelector('[data-frag="world"]');
    if (frag) frag.classList.add('done');
    setSync(8);
    updateObjective();
    toast('World map synchronized');
  }

  function eagleRegion(region) {
    if (region === 'india' && !S.eagleIndia) {
      S.eagleIndia = true;
      const p = $('ac2IndiaPanel');
      if (p) p.classList.add('eagle');
      toast('Eagle Vision — city trace revealed');
    }
    if (region === 'france' && !S.eagleFrance) {
      S.eagleFrance = true;
      const p = $('ac2FrancePanel');
      if (p) p.classList.add('eagle');
      toast('Eagle Vision — city traces revealed');
    }
  }

  function updateObjective() {
    const obj = $('ac2Objective');
    if (!obj) return;
    if (!S.worldSynced) obj.textContent = 'Synchronize viewpoint to reveal regions.';
    else if (!S.citiesDone.has('hyderabad')) obj.textContent = 'Enter Region Trace A and recover the city Codex.';
    else if (!S.citiesDone.has('paris') || !S.citiesDone.has('toulouse')) obj.textContent = 'Enter Region Trace B and recover remaining city Codex memories.';
    else obj.textContent = 'All core Codex recovered. Generate final dossier.';

    const fb = $('ac2Final');
    if (fb) {
      const allDone = cityDoneCount() === 3;
      fb.disabled = S.sync === 0;
      fb.textContent = allDone ? 'Generate Final Dossier' : (S.sync > 0 ? 'Generate Current Dossier' : 'Final Dossier Locked');
    }
  }

  /* ─── Load City ──────────────────────────────────────────── */
  function loadCity(cityId) {
    const city = CITIES[cityId];
    if (!city) return;
    S.currentCity = cityId;

    const k = $('cityKicker2'), t = $('cityTitle2'), i = $('cityIntro2');
    if (k) k.textContent = city.kicker;
    if (t) t.textContent = city.title;
    if (i) i.textContent = city.intro;

    // Build codex nodes in city map
    const map = $('cityMap2');
    if (map) {
      // Remove old nodes
      map.querySelectorAll('.cn').forEach(n => n.remove());
      const positions = [[15, 18], [55, 55], [15, 78]]; // left%, top% for 3 nodes
      city.missions.forEach((m, idx) => {
        const key = cityId + '-' + idx;
        const node = document.createElement('div');
        node.className = 'cn' + (S.missionsDone[key] ? ' cn-done' : '');
        node.style.left = positions[idx][0] + '%';
        node.style.top = positions[idx][1] + '%';
        node.innerHTML = '<b>' + m.title + '</b><span class="cn-type">' + m.type.toUpperCase() + '</span><span>Codex ' + (idx + 1) + '/3</span>';
        node.addEventListener('click', () => {
          if (S.missionsDone[key]) { toast('Already recovered'); return; }
          startMission(cityId, idx);
        });
        map.appendChild(node);
      });
    }

    // Update progress
    updateCityProgress(cityId);

    // Complete button
    const cb = $('completeCity2');
    if (cb) {
      const doneCount = city.missions.filter((_, idx) => S.missionsDone[cityId + '-' + idx]).length;
      cb.disabled = doneCount < city.missions.length;
      cb.textContent = doneCount >= city.missions.length ? 'Synchronize City Memory →' : doneCount + '/3 Codex recovered';
    }

    // Avatar
    const av = $('avatar2');
    if (av) { av.style.left = '8%'; av.style.top = '78%'; }

    showScreen('city');
  }

  function updateCityProgress(cityId) {
    const city = CITIES[cityId];
    const doneCount = city.missions.filter((_, idx) => S.missionsDone[cityId + '-' + idx]).length;
    const p = $('cityProgress2');
    if (p) p.textContent = doneCount + ' / ' + city.missions.length + ' Codex recovered';
    const cb = $('completeCity2');
    if (cb) {
      cb.disabled = doneCount < city.missions.length;
      cb.textContent = doneCount >= city.missions.length ? 'Synchronize City Memory →' : doneCount + '/3 Codex recovered';
    }
    // Show intel if all done
    const rv = $('cityReveal2');
    if (rv && doneCount >= city.missions.length && !S.citiesDone.has(cityId)) {
      rv.innerHTML = '<div class="reveal-box" style="margin-top:1rem">' + city.codexFull + '</div>';
    }
  }

  function completeCity(cityId) {
    if (S.citiesDone.has(cityId)) return;
    const city = CITIES[cityId];
    S.citiesDone.add(cityId);
    addSync(city.syncPts, city.title + ' synchronized');
    const frag = document.querySelector('[data-frag="' + city.missions[0].type + '"]') ||
                 document.querySelector('[data-frag="' + cityId + '"]');
    if (frag) frag.classList.add('done');
    // Mark frag strip
    $$('.ac2-frag').forEach(f => {
      const key = f.dataset.frag;
      if (key === cityId || (key === 'hyderabad' && cityId === 'hyderabad') ||
          (key === 'paris' && cityId === 'paris') || (key === 'toulouse' && cityId === 'toulouse'))
        f.classList.add('done');
    });
    updateObjective();
    showScreen('world');
    toast(city.title + ' fully synchronized');
  }

  /* ─── Mission Orchestration ──────────────────────────────── */
  function startMission(cityId, mIdx) {
    const city = CITIES[cityId];
    const m = city.missions[mIdx];
    const key = cityId + '-' + mIdx;

    // Move avatar
    const positions = [[15, 18], [55, 55], [15, 78]];
    const av = $('avatar2');
    if (av) { av.style.left = (positions[mIdx][0] + 5) + '%'; av.style.top = positions[mIdx][1] + '%'; }

    // Create mission overlay inside city screen
    const screen = document.querySelector('.ac2-screen[data-screen="city"]');
    if (!screen) return;

    const overlay = document.createElement('div');
    overlay.className = 'mo';

    // HUD
    const hud = document.createElement('div');
    hud.className = 'mo-hud';
    hud.innerHTML = '<span class="mo-tag">' + m.type + '</span><span class="mo-title">' + m.title + '</span>';
    const abort = document.createElement('button');
    abort.className = 'mo-abort';
    abort.textContent = 'Abort';
    abort.addEventListener('click', () => { destroyMission(overlay); });
    hud.appendChild(abort);
    overlay.appendChild(hud);

    // Body
    const body = document.createElement('div');
    body.className = 'mo-body';
    overlay.appendChild(body);

    // Show briefing first
    const brief = document.createElement('div');
    brief.className = 'mo-brief';
    brief.innerHTML = '<div class="mo-brief-kanji">' + m.kanji + '</div>' +
      '<p class="mo-brief-text">' + m.briefing + '</p>' +
      '<div class="mo-brief-hint">' + m.hint + '</div>';
    const beginBtn = document.createElement('button');
    beginBtn.className = 'mo-begin';
    beginBtn.textContent = 'Begin Mission';
    beginBtn.addEventListener('click', () => {
      body.removeChild(brief);
      launchEngine(body, m, () => {
        // On complete
        S.missionsDone[key] = true;
        addSync(5, 'Codex recovered: ' + m.codex.title);
        showCodexReveal(body, m.codex, () => {
          destroyMission(overlay);
          loadCity(cityId); // refresh city screen
        });
      });
    });
    brief.appendChild(beginBtn);
    body.appendChild(brief);

    screen.style.position = 'relative';
    screen.appendChild(overlay);
  }

  function destroyMission(overlay) {
    if (S.activeMission && S.activeMission.destroy) S.activeMission.destroy();
    S.activeMission = null;
    overlay.remove();
  }

  function showCodexReveal(container, codex, onContinue) {
    container.innerHTML = '';
    const reveal = document.createElement('div');
    reveal.className = 'codex-reveal';
    reveal.innerHTML = '<div class="codex-reveal-kanji">巻</div>' +
      '<div class="codex-reveal-tag">Codex Recovered</div>' +
      '<div class="codex-reveal-title">' + codex.title + '</div>' +
      '<div class="codex-reveal-text">' + codex.text + '</div>';
    const flash = document.createElement('div');
    flash.className = 'complete-flash';
    container.appendChild(flash);
    const btn = document.createElement('button');
    btn.className = 'mo-begin';
    btn.textContent = 'Continue';
    btn.addEventListener('click', onContinue);
    reveal.appendChild(btn);
    container.appendChild(reveal);
  }

  /* ─── Engine Launcher ────────────────────────────────────── */
  function launchEngine(container, mission, onComplete) {
    switch (mission.type) {
      case 'stealth': S.activeMission = new StealthEngine(container, mission, onComplete); break;
      case 'parkour': S.activeMission = new ParkourEngine(container, mission, onComplete); break;
      case 'puzzle':  S.activeMission = new PuzzleEngine(container, mission, onComplete); break;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     STEALTH ENGINE — Turn-based grid navigation
     ═══════════════════════════════════════════════════════════ */
  function StealthEngine(container, config, onComplete) {
    const self = this;
    const map = config.map.map(r => r.split(''));
    const rows = map.length, cols = map[0].length;

    // Find entities
    let playerR, playerC, startR, startC;
    const intels = [], exitPos = { r: 0, c: 0 };
    const walls = new Set();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = map[r][c];
        if (ch === 'P') { playerR = startR = r; playerC = startC = c; }
        if (ch === 'X') { exitPos.r = r; exitPos.c = c; }
        if (ch === 'i') intels.push({ r, c, collected: false });
        if (ch === '#') walls.add(r + ',' + c);
      }
    }

    let collected = 0, done = false, eagleOn = false;
    const guards = config.guards.map(g => ({ ...g, pathIdx: 0, r: g.path[0][0], c: g.path[0][1] }));

    // Build DOM
    const wrap = document.createElement('div');
    wrap.className = 'sg-wrap';

    const grid = document.createElement('div');
    grid.className = 'sg-grid';
    grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    const cells = [];
    for (let r = 0; r < rows; r++) {
      cells[r] = [];
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'sg-cell';
        const ch = map[r][c];
        if (ch === '#') cell.classList.add('sg-wall');
        if (ch === 'H') cell.classList.add('sg-hide');
        if (ch === 'X') cell.classList.add('sg-exit');
        cell.addEventListener('click', () => movePlayer(r, c));
        grid.appendChild(cell);
        cells[r][c] = cell;
      }
    }

    // Create entity elements
    function makeEntity(cls) {
      const el = document.createElement('div');
      el.className = 'sg-entity';
      el.innerHTML = '<div class="' + cls + '"></div>';
      grid.appendChild(el);
      return el;
    }

    const playerEl = makeEntity('sg-player-shape');
    const guardEls = guards.map(() => makeEntity('sg-guard-shape'));
    const intelEls = intels.map(() => makeEntity('sg-intel-shape'));

    function cellSize() { return grid.offsetWidth / cols; }

    function posEntity(el, r, c) {
      const s = cellSize();
      el.style.width = s + 'px';
      el.style.height = s + 'px';
      el.style.left = (c * s) + 'px';
      el.style.top = (r * s) + 'px';
    }

    function renderPositions() {
      const s = cellSize();
      if (s === 0) { requestAnimationFrame(renderPositions); return; }
      posEntity(playerEl, playerR, playerC);
      guards.forEach((g, i) => posEntity(guardEls[i], g.r, g.c));
      intels.forEach((intel, i) => {
        posEntity(intelEls[i], intel.r, intel.c);
        if (intel.collected) intelEls[i].firstChild.classList.add('collected');
      });
      // Show danger zones
      cells.flat().forEach(c => c.classList.remove('sg-danger', 'sg-path'));
      guards.forEach(g => {
        // Adjacent cells are danger
        [[-1,0],[1,0],[0,-1],[0,1],[0,0]].forEach(([dr,dc]) => {
          const nr = g.r + dr, nc = g.c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc])
            cells[nr][nc].classList.add('sg-danger');
        });
        // Eagle: show full path
        if (eagleOn) g.path.forEach(([pr,pc]) => { if (cells[pr] && cells[pr][pc]) cells[pr][pc].classList.add('sg-path'); });
      });
      // Exit glow when all intel collected
      if (collected >= intels.length) cells[exitPos.r][exitPos.c].classList.add('sg-open');
    }

    function movePlayer(r, c) {
      if (done) return;
      const dr = Math.abs(r - playerR), dc = Math.abs(c - playerC);
      if (dr + dc !== 1) return;
      if (walls.has(r + ',' + c)) return;

      playerR = r; playerC = c;

      // Collect intel
      intels.forEach((intel, i) => {
        if (!intel.collected && intel.r === r && intel.c === c) {
          intel.collected = true;
          collected++;
          toast('Intel collected: ' + collected + '/' + intels.length);
        }
      });

      // Move guards (turn-based)
      guards.forEach(g => {
        g.pathIdx = (g.pathIdx + 1) % g.path.length;
        g.r = g.path[g.pathIdx][0];
        g.c = g.path[g.pathIdx][1];
      });

      renderPositions();
      updateInfo();

      // Detection check
      for (const g of guards) {
        const dr2 = Math.abs(g.r - playerR), dc2 = Math.abs(g.c - playerC);
        if (dr2 + dc2 <= 1 && map[playerR][playerC] !== 'H') {
          detected();
          return;
        }
      }

      // Exit check
      if (r === exitPos.r && c === exitPos.c && collected >= intels.length) {
        done = true;
        setTimeout(onComplete, 400);
      }
    }

    function detected() {
      wrap.classList.add('sg-flash');
      toast('Detected! Position reset.');
      setTimeout(() => {
        playerR = startR; playerC = startC;
        wrap.classList.remove('sg-flash');
        renderPositions();
      }, 600);
    }

    // Eagle vision
    const bar = document.createElement('div');
    bar.className = 'sg-bar';
    const eagleBtn = document.createElement('button');
    eagleBtn.className = 'sg-eagle';
    eagleBtn.textContent = '👁 Eagle Vision';
    eagleBtn.addEventListener('click', () => {
      eagleOn = !eagleOn;
      eagleBtn.classList.toggle('active', eagleOn);
      renderPositions();
      if (eagleOn) setTimeout(() => { eagleOn = false; eagleBtn.classList.remove('active'); renderPositions(); }, 3000);
    });
    bar.appendChild(eagleBtn);

    const info = document.createElement('div');
    info.className = 'sg-info';
    bar.appendChild(info);

    function updateInfo() {
      info.textContent = 'Intel: ' + collected + '/' + intels.length + (collected >= intels.length ? ' · EXIT OPEN' : '');
    }

    wrap.appendChild(grid);
    wrap.appendChild(bar);
    container.appendChild(wrap);

    updateInfo();
    // Defer render so grid has layout dimensions
    requestAnimationFrame(() => {
      renderPositions();
      // Re-render on resize
      window.addEventListener('resize', renderPositions);
    });

    self.destroy = function () { window.removeEventListener('resize', renderPositions); };
  }

  /* ═══════════════════════════════════════════════════════════
     PARKOUR ENGINE — Click-to-climb platformer
     ═══════════════════════════════════════════════════════════ */
  function ParkourEngine(container, config, onComplete) {
    const self = this;
    const FIELD_W = 400, FIELD_H = 480, INNER_H = 520;

    const wrap = document.createElement('div');
    wrap.className = 'pk-wrap';

    const field = document.createElement('div');
    field.className = 'pk-field';
    field.style.width = '100%';
    field.style.maxWidth = FIELD_W + 'px';

    const inner = document.createElement('div');
    inner.className = 'pk-inner';
    inner.style.width = '100%';
    inner.style.height = INNER_H + 'px';
    inner.style.top = '0px';

    // Sync point at top
    const syncPt = document.createElement('div');
    syncPt.className = 'pk-sync';
    syncPt.style.left = ((config.ledges[config.ledges.length - 1].x + config.ledges[config.ledges.length - 1].w / 2) / FIELD_W * 100 - 5) + '%';
    syncPt.style.top = '5px';
    inner.appendChild(syncPt);

    // Create ledges
    let done = false;
    const ledgeEls = config.ledges.map((l, i) => {
      const el = document.createElement('div');
      el.className = 'pk-ledge';
      if (l.type === 'crumble') el.classList.add('pk-crumble');
      if (l.type === 'moving') el.classList.add('pk-moving');
      el.style.left = (l.x / FIELD_W * 100) + '%';
      el.style.top = l.y + 'px';
      el.style.width = (l.w / FIELD_W * 100) + '%';
      el.dataset.idx = i;
      el.addEventListener('click', () => jumpTo(i));
      inner.appendChild(el);
      return { el, ...l, active: true, idx: i };
    });

    // Player
    const player = document.createElement('div');
    player.className = 'pk-player';
    inner.appendChild(player);

    let currentLedge = 0;
    function positionPlayer(idx) {
      const l = ledgeEls[idx];
      player.style.left = (l.x / FIELD_W * 100 + l.w / FIELD_W * 100 / 2 - 2) + '%';
      player.style.top = (l.y - 22) + 'px';
      currentLedge = idx;
      highlightReachable();
      scrollToPlayer(l.y);
    }

    function scrollToPlayer(y) {
      const visH = field.offsetHeight || FIELD_H;
      const target = Math.max(0, y - visH / 2);
      inner.style.top = -target + 'px';
    }

    function highlightReachable() {
      const cur = ledgeEls[currentLedge];
      if (!cur) return;
      ledgeEls.forEach(l => {
        l.el.classList.remove('pk-active');
        if (!l.active) return;
        const dx = Math.abs((l.x + l.w / 2) - (cur.x + cur.w / 2));
        const dy = cur.y - l.y; // must go up (lower y)
        if (dy > 0 && dy < 170 && dx < 220 && l.idx !== currentLedge) {
          l.el.classList.add('pk-active');
        }
      });
    }

    function jumpTo(idx) {
      if (done) return;
      const target = ledgeEls[idx];
      if (!target.active || !target.el.classList.contains('pk-active')) return;

      positionPlayer(idx);

      // Crumble
      if (target.type === 'crumble') {
        setTimeout(() => {
          target.el.classList.add('pk-crumbling');
          target.active = false;
          // If player still on this ledge, find nearest below
          if (currentLedge === idx) {
            const below = ledgeEls.filter(l => l.active && l.y > target.y).sort((a, b) => a.y - b.y);
            if (below.length) {
              setTimeout(() => positionPlayer(below[0].idx), 300);
            }
          }
        }, 1200);
      }

      // Check if reached top (last ledge or near sync point)
      if (idx === ledgeEls.length - 1) {
        done = true;
        setTimeout(() => {
          player.classList.add('pk-leap');
          setTimeout(onComplete, 1000);
        }, 300);
      }

      updateInfo();
    }

    // Info bar
    const bar = document.createElement('div');
    bar.className = 'pk-bar';
    const info = document.createElement('div');
    info.className = 'pk-info';
    bar.appendChild(info);

    function updateInfo() {
      const remaining = ledgeEls.length - 1 - currentLedge;
      info.textContent = remaining > 0 ? remaining + ' ledges to sync point' : 'Sync point reached!';
    }

    field.appendChild(inner);
    wrap.appendChild(field);
    wrap.appendChild(bar);
    container.appendChild(wrap);

    requestAnimationFrame(() => positionPlayer(0));
    updateInfo();

    self.destroy = function () {};
  }

  /* ═══════════════════════════════════════════════════════════
     PUZZLE ENGINE — Examine objects, decode, enter code
     ═══════════════════════════════════════════════════════════ */
  function PuzzleEngine(container, config, onComplete) {
    const self = this;
    const wrap = document.createElement('div');
    wrap.className = 'pz-wrap';

    // Room with objects
    const room = document.createElement('div');
    room.className = 'pz-room';

    let examined = 0;
    const clues = [];

    config.objects.forEach((obj, i) => {
      const el = document.createElement('div');
      el.className = 'pz-obj';
      el.innerHTML = '<div class="pz-obj-icon">' + obj.icon + '</div><div class="pz-obj-name">' + obj.name + '</div>';
      el.addEventListener('click', () => {
        if (el.classList.contains('examined')) return;
        el.classList.add('examined');
        examined++;
        clues.push(obj.clue);
        const clueEl = document.createElement('div');
        clueEl.className = 'pz-clue';
        clueEl.textContent = obj.name + ': ' + obj.clue;
        logContent.appendChild(clueEl);
        logContent.scrollTop = logContent.scrollHeight;
        toast('Clue found: ' + obj.name);
        if (examined >= config.objects.length) {
          codeSection.style.display = 'flex';
        }
      });
      room.appendChild(el);
    });

    // Clue log
    const log = document.createElement('div');
    log.className = 'pz-log';
    log.innerHTML = '<div class="pz-log-title">Intelligence Log</div>';
    const logContent = document.createElement('div');
    log.appendChild(logContent);

    // Code entry
    const codeSection = document.createElement('div');
    codeSection.className = 'pz-code';
    codeSection.style.display = 'none';

    const codeLabel = document.createElement('div');
    codeLabel.className = 'pz-code-label';
    codeLabel.textContent = 'Enter code (' + config.code.length + ' digits)';
    codeSection.appendChild(codeLabel);

    const slots = document.createElement('div');
    slots.className = 'pz-code-slots';
    const slotEls = [];
    for (let i = 0; i < config.code.length; i++) {
      const s = document.createElement('div');
      s.className = 'pz-slot';
      slots.appendChild(s);
      slotEls.push(s);
    }
    codeSection.appendChild(slots);

    const optionsRow = document.createElement('div');
    optionsRow.className = 'pz-options';
    let entered = [];
    const optBtns = [];

    config.options.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'pz-opt';
      btn.textContent = val;
      btn.addEventListener('click', () => {
        if (entered.length >= config.code.length) return;
        entered.push(val);
        btn.classList.add('used');
        slotEls[entered.length - 1].textContent = val;
        slotEls[entered.length - 1].classList.add('filled');

        if (entered.length === config.code.length) {
          // Check
          const correct = entered.every((v, i) => v === config.code[i]);
          if (correct) {
            toast('Code accepted!');
            setTimeout(onComplete, 600);
          } else {
            toast('Incorrect sequence — try again');
            setTimeout(resetCode, 800);
          }
        }
      });
      optionsRow.appendChild(btn);
      optBtns.push(btn);
    });
    codeSection.appendChild(optionsRow);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'pz-code-reset';
    resetBtn.textContent = 'Reset code';
    resetBtn.addEventListener('click', resetCode);
    codeSection.appendChild(resetBtn);

    function resetCode() {
      entered = [];
      slotEls.forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
      optBtns.forEach(b => b.classList.remove('used'));
    }

    wrap.appendChild(room);
    wrap.appendChild(log);
    wrap.appendChild(codeSection);
    container.appendChild(wrap);

    self.destroy = function () {};
  }

  /* ─── Final Dossier ──────────────────────────────────────── */
  function buildDossier() {
    const recovered = cityDoneCount();
    $('finalSync2').textContent = S.sync + '%';
    $('finalRank2').textContent = S.sync >= 70 ? 'Full Synchronization' : S.sync >= 35 ? 'Stable Synchronization' : 'Unstable Synchronization';
    $('finalSubclass2').innerHTML = '<strong>' + (recovered < 3 ? 'Partial Memory Reconstruction' : 'PET/CT Validation Systems Builder — Translational Researcher') + '</strong>';
    $('finalSummary2').textContent = recovered < 3
      ? 'The dossier is incomplete but usable: the recovered memory strand shows part of Sai\'s India-to-France engineering and medical imaging route. Return to the Codex map for fuller synchronization.'
      : 'Sai\'s professional core reconstructs as an India-to-France engineering and medical imaging trajectory: mechanical systems roots, biomedical engineering formation at École Polytechnique, and PET/CT radiophysics research at IUCT Oncopole — focused on validation, synthetic data, and translational tools.';
    $('finalSide2').textContent = recovered > 0 ? [...S.citiesDone].map(c => CITIES[c]?.title || c).join(' · ') : 'None recovered';
    $('finalSignal2').textContent = recovered >= 3
      ? 'Systems thinker · translational builder · clinical utility · validation-first approach · research-to-market paths.'
      : 'Continue recovering city memories for fuller signal.';
  }

  /* ─── Initialization ─────────────────────────────────────── */
  function init() {
    // Play button(s)
    $$('button, a').forEach(el => {
      if ((el.textContent || '').toLowerCase().includes('play animus')) {
        el.addEventListener('click', e => { e.preventDefault(); openGame(); });
        el.disabled = false;
        el.style.pointerEvents = 'auto';
      }
    });

    // Exit
    const exit = $('ac2Exit');
    if (exit) exit.addEventListener('click', closeGame);

    // Escape key
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGame(); });

    // Open map
    const open = $('ac2Open');
    if (open) open.addEventListener('click', e => { e.preventDefault(); showScreen('world'); });

    // Sync world
    const sync = $('ac2Sync');
    if (sync) sync.addEventListener('click', e => { e.preventDefault(); syncWorld(); });

    // Region hotspots
    $$('.region-hot').forEach(h => {
      h.addEventListener('click', e => {
        e.preventDefault();
        const region = h.dataset.region;
        if (region === 'india') showScreen('india');
        if (region === 'france') showScreen('france');
      });
    });

    // Eagle vision buttons
    const ei = $('ac2EagleIndia');
    if (ei) ei.addEventListener('click', e => { e.preventDefault(); eagleRegion('india'); });
    const ef = $('ac2EagleFrance');
    if (ef) ef.addEventListener('click', e => { e.preventDefault(); eagleRegion('france'); });

    // Back to world
    $$('.backWorld').forEach(b => {
      b.addEventListener('click', e => { e.preventDefault(); showScreen('world'); });
    });

    // City hotspots
    $$('.city-hot').forEach(h => {
      h.addEventListener('click', e => {
        e.preventDefault();
        loadCity(h.dataset.city);
      });
    });

    // Return to region from city
    const ret = $('returnRegion2');
    if (ret) ret.addEventListener('click', e => {
      e.preventDefault();
      if (S.currentCity) {
        const region = CITIES[S.currentCity]?.region;
        if (region) showScreen(region);
        else showScreen('world');
      }
    });

    // Complete city
    const cc = $('completeCity2');
    if (cc) cc.addEventListener('click', e => {
      e.preventDefault();
      if (S.currentCity) completeCity(S.currentCity);
    });

    // Final dossier button
    const fb = $('ac2Final');
    if (fb) fb.addEventListener('click', e => {
      e.preventDefault();
      buildDossier();
      showScreen('final');
    });

    // Replay
    const rp = $('replay2');
    if (rp) rp.addEventListener('click', e => {
      e.preventDefault();
      S.sync = 0; S.worldSynced = false; S.eagleIndia = false; S.eagleFrance = false;
      S.currentCity = null; S.missionsDone = {}; S.citiesDone.clear(); S.codex = [];
      setSync(0);
      $$('.ac2-frag').forEach(f => f.classList.remove('done'));
      const wp = $('ac2WorldPanel');
      if (wp) wp.classList.remove('synced');
      const ip = $('ac2IndiaPanel');
      if (ip) ip.classList.remove('eagle');
      const fp = $('ac2FrancePanel');
      if (fp) fp.classList.remove('eagle');
      showScreen('brief');
    });

    updateObjective();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

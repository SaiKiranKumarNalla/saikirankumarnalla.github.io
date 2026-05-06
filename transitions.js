// === ASSASSIN'S CREED PAGE TRANSITIONS — PAGE-SPECIFIC ===

const PAGE_TRANSITIONS = {
  'index.html':      { text: 'Performing Leap of Faith...', sub: 'NOTHING IS TRUE',          kanji: '家' },
  'about.html':      { text: 'Accessing Memory Sequence...', sub: 'DNA MATCH CONFIRMED',     kanji: '浪人' },
  'experience.html': { text: 'Eavesdropping...',             sub: 'INTELLIGENCE GATHERED',    kanji: '道' },
  'education.html':  { text: 'Synchronizing Viewpoint...',   sub: 'MAP UPDATED',              kanji: '道場' },
  'projects.html':   { text: 'Eagle Vision Activated...',    sub: 'TARGETS REVEALED',         kanji: '鍛' },
  'papers.html':     { text: 'Opening the Codex...',         sub: 'DATA ACQUIRED',            kanji: '刀' },
  'contact.html':    { text: 'Entering the Bureau...',       sub: 'THE BROTHERHOOD AWAITS',   kanji: '縁' }
};

const GLITCH_CHARS = '█▓▒░╗╔╚╝┃━╋┣┫▌▐▀▄';

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll reveal ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal,.stagger').forEach(el => observer.observe(el));

  // ── Inject HUD into existing .ac-transition overlay ──
  const overlay = document.querySelector('.ac-transition');
  if (overlay) {
    // Glitch bars
    const glitchBars = document.createElement('div');
    glitchBars.className = 'glitch-bars';
    for (let i = 0; i < 4; i++) glitchBars.appendChild(document.createElement('div'));
    overlay.appendChild(glitchBars);

    // Corner brackets
    ['c-tl','c-tr','c-bl','c-br'].forEach(cls => {
      const corner = document.createElement('div');
      corner.className = 'ac-corner ' + cls;
      overlay.appendChild(corner);
    });

    // HUD container
    const hud = document.createElement('div');
    hud.className = 'ac-hud';
    hud.innerHTML = `
      <div class="ac-hud-text" id="acHudText"></div>
      <div class="ac-hud-sub" id="acHudSub"></div>
      <div class="ac-sync-wrap">
        <span class="ac-sync-label" id="acSyncLabel">Sync</span>
        <div class="ac-sync-track"><div class="ac-sync-fill" id="acSyncFill"></div></div>
        <span class="ac-sync-pct" id="acSyncPct">0%</span>
      </div>
    `;
    overlay.appendChild(hud);
  }

  // ── Typewriter with glitch ──
  function typeWriter(el, text, speed, callback) {
    let i = 0;
    el.textContent = '';
    const iv = setInterval(() => {
      if (i < text.length) {
        if (Math.random() < 0.14) {
          const gc = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          el.textContent = text.substring(0, i) + gc;
          setTimeout(() => { el.textContent = text.substring(0, i + 1); }, 35 + Math.random() * 25);
        } else {
          el.textContent = text.substring(0, i + 1);
        }
        i++;
      } else {
        clearInterval(iv);
        if (callback) setTimeout(callback, 100);
      }
    }, speed);
    return iv;
  }

  // ── Sync bar animation ──
  function animateSyncBar(duration) {
    const fill = document.getElementById('acSyncFill');
    const pct = document.getElementById('acSyncPct');
    if (!fill || !pct) return;

    fill.style.width = '0%';
    pct.textContent = '0%';
    let progress = 0;
    const step = 50;
    const increment = 100 / (duration / step);

    const iv = setInterval(() => {
      progress = Math.min(progress + increment + (Math.random() * increment * 0.5), 100);
      const rounded = Math.round(progress);
      fill.style.width = rounded + '%';
      pct.textContent = rounded + '%';
      if (progress >= 100) clearInterval(iv);
    }, step);

    // Force 100% at end
    setTimeout(() => {
      clearInterval(iv);
      fill.style.width = '100%';
      pct.textContent = '100%';
    }, duration - 100);
  }

  // ── Resolve page key from href ──
  function getPageKey(href) {
    const filename = href.split('/').pop().split('?')[0].split('#')[0];
    return filename || 'index.html';
  }

  // ── Intercept nav link clicks ──
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (window.location.pathname.endsWith(href)) return;

      e.preventDefault();

      const pageKey = getPageKey(href);
      const config = PAGE_TRANSITIONS[pageKey] || PAGE_TRANSITIONS['index.html'];

      // Update insignia kanji to match destination
      const insignia = document.querySelector('.ac-insignia');
      if (insignia) insignia.textContent = config.kanji;

      // Update sync label
      const syncLabel = document.getElementById('acSyncLabel');
      if (syncLabel) syncLabel.textContent = 'Sync';

      // Clear previous HUD state
      const hudText = document.getElementById('acHudText');
      const hudSub = document.getElementById('acHudSub');
      if (hudText) hudText.textContent = '';
      if (hudSub) hudSub.textContent = '';

      // Trigger transition
      document.body.classList.add('leaping');

      // Start sync bar
      animateSyncBar(2400);

      // Start typewriter after brief delay
      setTimeout(() => {
        if (hudSub) {
          hudSub.textContent = config.sub;
          hudSub.style.opacity = '0';
          requestAnimationFrame(() => { hudSub.style.opacity = '1'; });
        }
        if (hudText) {
          typeWriter(hudText, config.text, 30);
        }
      }, 200);

      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 2500);
    });
  });
});

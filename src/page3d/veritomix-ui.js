// VeriTomiX page interface: staggered reveals, the figure lightbox, the case-study viewer,
// the phantom picker, the horizontal timeline and the header anchors. No 3D here.
export function initUI({ cases, esc, zoom, list, chips }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // ── Reveals: elements ease in once, the children of .vx-rv-g one after another.
  const rv = [...document.querySelectorAll('.vx-rv, .vx-rv-g')];
  if (reduce || !('IntersectionObserver' in window)) rv.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach((el) => io.observe(el));
  }

  // ── Dialog helpers (native <dialog>: focus stays inside, Esc closes).
  const mkDialog = (cls, label) => {
    const d = document.createElement('dialog');
    d.className = cls;
    d.setAttribute('aria-label', label);
    document.body.appendChild(d);
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); // click on the backdrop
    d.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) root.classList.remove('vx-lock'); });
    return d;
  };
  const open = (d) => { root.classList.add('vx-lock'); if (!d.open) d.showModal(); };

  // ── Lightbox: any .vx-zoom figure; arrows page through figures of the same group.
  const lb = mkDialog('vx-lb', 'Figure');
  lb.innerHTML = `<figure class="vx-lb-f"><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="vx-x" aria-label="Close">×</button>
    <button type="button" class="vx-lb-p" aria-label="Previous figure">←</button><button type="button" class="vx-lb-n" aria-label="Next figure">→</button>
    <p class="vx-lb-c" aria-live="polite"></p>`;
  const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbCount = lb.querySelector('.vx-lb-c');
  let group = [], gi = 0;
  const showFig = (i) => {
    gi = (i + group.length) % group.length;
    const b = group[gi];
    lbImg.src = b.dataset.src; lbImg.alt = b.dataset.cap; lbCap.textContent = b.dataset.cap;
    lbCount.textContent = group.length > 1 ? `${gi + 1} / ${group.length}` : '';
    lb.classList.toggle('vx-single', group.length < 2);
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.vx-zoom');
    if (!b) return;
    const scope = b.closest('dialog') || document;
    group = [...scope.querySelectorAll(`.vx-zoom[data-group="${CSS.escape(b.dataset.group)}"]`)];
    showFig(group.indexOf(b));
    open(lb);
  });
  lb.querySelector('.vx-x').addEventListener('click', () => lb.close());
  lb.querySelector('.vx-lb-p').addEventListener('click', () => showFig(gi - 1));
  lb.querySelector('.vx-lb-n').addEventListener('click', () => showFig(gi + 1));
  lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') showFig(gi - 1); if (e.key === 'ArrowRight') showFig(gi + 1); });

  // ── Case-study viewer: the full study (goal, simulation, results, details, every figure).
  const cv = mkDialog('vx-cv', 'Case study');
  let ci = 0;
  const showCase = (i) => {
    ci = (i + cases.length) % cases.length;
    const c = cases[ci];
    const figs = [c.fig, ...(c.figs || [])].filter(Boolean);
    cv.innerHTML = `<div class="vx-cv-in">
      <button type="button" class="vx-x" aria-label="Close">×</button>
      <p class="vx-k">${esc(c.set === 'validation' ? 'Physical validation' : 'Simulation and models')} · ${esc(c.kicker)}</p>
      <h2>${esc(c.name)}</h2>${chips(c.chips)}
      ${c.lede ? `<p class="vx-lede">${esc(c.lede)}</p>` : ''}
      ${c.gsr ? `<dl class="vx-gsr"><div><dt>Goal</dt><dd>${esc(c.gsr.goal)}</dd></div><div><dt>Simulated</dt><dd>${esc(c.gsr.simulated)}</dd></div><div><dt>Results</dt><dd>${esc(c.gsr.results)}</dd></div></dl>` : ''}
      ${figs.length ? zoom(figs[0], `case-${c.id}`, 'vx-cv-main') : ''}
      ${c.more?.length ? `<h3 class="vx-h3">Details</h3>${list(c.more)}` : ''}
      ${figs.length > 1 ? `<h3 class="vx-h3">More figures</h3><div class="vx-gallery vx-g2">${figs.slice(1).map((f) => zoom(f, `case-${c.id}`)).join('')}</div>` : ''}
      <nav class="vx-cv-nav" aria-label="Other studies">
        <button type="button" data-go="-1">← ${esc(cases[(ci - 1 + cases.length) % cases.length].name)}</button>
        <button type="button" data-go="1">${esc(cases[(ci + 1) % cases.length].name)} →</button>
      </nav></div>`;
    cv.scrollTop = 0;
    cv.querySelector('.vx-x').addEventListener('click', () => cv.close());
    cv.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { showCase(ci + +b.dataset.go); cv.querySelector('.vx-x').focus(); }));
  };
  let opener = null;
  document.querySelectorAll('.vx-cc').forEach((card) => {
    const b = card.querySelector('.vx-cc-open');
    const go = () => { opener = b; showCase(cases.findIndex((c) => c.id === b.dataset.case)); open(cv); cv.querySelector('.vx-x').focus(); };
    b.addEventListener('click', go);
    card.querySelector('.vx-cc-im').addEventListener('click', go);
  });
  cv.addEventListener('close', () => opener?.focus());

  // ── Phantom picker (tabs): swaps the panel; the 3D listens for the event.
  const tabs = [...document.querySelectorAll('.vx-ptabs [role="tab"]')];
  const pick = (i, focus) => {
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = k !== i;
    });
    if (focus) tabs[i].focus();
    document.dispatchEvent(new CustomEvent('vx-phantom', { detail: i }));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); pick((i + d + tabs.length) % tabs.length, true); }
    });
  });

  // ── Horizontal timeline: arrow buttons scroll by one card.
  const track = document.querySelector('.vx-tl');
  document.querySelectorAll('.vx-tl-btn').forEach((b) => b.addEventListener('click', () => {
    const step = track.querySelector('li')?.getBoundingClientRect().width || 320;
    track.scrollBy({ left: +b.dataset.dir * (step + 20), behavior: reduce ? 'auto' : 'smooth' });
  }));
  const syncTl = () => {
    const [p, n] = document.querySelectorAll('.vx-tl-btn');
    if (!p) return;
    p.disabled = track.scrollLeft < 4;
    n.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  };
  track?.addEventListener('scroll', syncTl, { passive: true });
  addEventListener('resize', syncTl);
  syncTl();

  // ── Header anchors: highlight the section being read.
  const anchors = [...document.querySelectorAll('.vx-anchors a')];
  const secs = [...document.querySelectorAll('.vx-sec[data-nav]')];
  let cur = '';
  const sync = () => {
    const y = innerHeight * 0.35;
    let id = secs[0]?.dataset.nav;
    for (const s of secs) if (s.getBoundingClientRect().top <= y) id = s.dataset.nav;
    if (id === cur) return;
    cur = id;
    anchors.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      if (on && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollTo({ left: a.offsetLeft - 12, behavior: reduce ? 'auto' : 'smooth' });
    });
  };
  addEventListener('scroll', sync, { passive: true });
  sync();
}

// Tool progression, 2016 to now: one large, readable chart at a time, switched with domain tabs. Each lane has
// the skill's logo and name on the left and one bar per period of use on a shared year axis (labelled every two
// years). A gap between periods is a faint thin line. A skill still in use ends in a soft fade and arrow at the
// right edge; learning ends in a pulsing dot; planned is a small dashed marker. It shows the finished state at
// once (no playback). Plain SVG, no library. The chart scrolls sideways inside its box when the card is narrow.
const NS = 'http://www.w3.org/2000/svg';
const START = 2016, END = 2027;
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Periods of use as [first, last] years, inclusive. `periods` lists gaps; otherwise since..until (or now).
export const periodsOf = (s, now) => s.periods || [[s.since, s.until || now]];
export const isOngoing = (s) => s.state !== 'next' && !s.until;
export const yearsUsed = (s, now) => periodsOf(s, now).reduce((n, [a, b]) => n + (b - a + (s.periods ? 1 : 0)), 0);
const yy = (n) => String(n).slice(2);
export const periodText = (s, now) => {
  const ps = periodsOf(s, now);
  return ps.map(([a, b], i) => {
    const last = i === ps.length - 1;
    if (last && isOngoing(s)) return `${a}–`;
    return a === b ? `${a}` : `${a}–${i === 0 && ps.length > 1 ? yy(b) : b}`;
  }).join(' · ');
};

export function mountTimeline(host, { skills, domains, now, iconUrl, onHover }) {
  const NOW = now + 0.84; // early November
  const order = { learnt: 0, learning: 1, next: 2 };
  const first = (s) => (s.state === 'next' ? NOW : s.since);
  let kind = 'all';
  let domId = domains[0].id;

  host.innerHTML = `<div class="sk-tl-tabs" role="tablist" aria-label="Domain"></div>
    <div class="sk-tl-scroll"><svg class="sk-tl-svg" role="img"></svg></div>
    <ul class="sk-tl-key" aria-hidden="true">
      <li><i class="k-bar"></i>Used</li><li><i class="k-gap"></i>Break</li><li><i class="k-now"></i>Still in use</li><li><i class="k-learn"></i>Learning</li><li><i class="k-next"></i>Planned</li>
    </ul>`;
  const tabsEl = host.querySelector('.sk-tl-tabs');
  const scroller = host.querySelector('.sk-tl-scroll');
  const svg = host.querySelector('svg');

  const inKind = (s) => kind === 'all' || s.kind === kind;
  const listOf = (id) => skills.filter((s) => s.domain === id && inKind(s))
    .sort((a, b) => first(a) - first(b) || order[a.state] - order[b.state] || b.uses.length - a.uses.length);

  function drawTabs() {
    const avail = domains.filter((d) => listOf(d.id).length);
    if (!avail.find((d) => d.id === domId) && avail.length) domId = avail[0].id;
    tabsEl.innerHTML = avail.map((d) => `<button type="button" role="tab" data-d="${d.id}" aria-selected="${d.id === domId}">${esc(d.name)}</button>`).join('');
  }
  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    domId = b.dataset.d; render();
  });

  const LH = 30, TOP = 8, AX = 28, GUT = 150, PAD = 22, MINW = 400;
  function drawChart() {
    const list = listOf(domId);
    const W = Math.max(MINW, scroller.clientWidth);
    const H = TOP + list.length * LH + AX;
    const x = (y) => GUT + ((y - START) / (END - START)) * (W - GUT - PAD);
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('aria-label', `${domains.find((d) => d.id === domId)?.name}: when each skill was used, ${START} to ${now}`);
    const defs = el('defs', {}, svg);
    ['tool', 'comp'].forEach((k) => {
      const g = el('linearGradient', { id: `skfade-${k}`, x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
      el('stop', { offset: 0, 'stop-color': `var(--sk-${k})` }, g);
      el('stop', { offset: 1, 'stop-color': `var(--sk-${k})`, 'stop-opacity': 0.15 }, g);
    });
    const gr = el('g', {}, svg);
    for (let y = START; y <= END - 1; y += 1) {
      const major = (y - START) % 2 === 0;
      el('line', { x1: x(y), x2: x(y), y1: TOP, y2: TOP + list.length * LH, class: major ? 'sk-tl-tick' : 'sk-tl-tick minor' }, gr);
      if (major) el('text', { x: x(y), y: H - 8, class: 'sk-tl-yr', 'text-anchor': 'middle' }, gr).textContent = y;
    }
    list.forEach((s, i) => {
      const cy = TOP + i * LH + LH / 2;
      const cls = s.kind === 'tool' ? 'tool' : 'comp';
      const g = el('g', { class: `sk-lane sk-${s.kind} sk-st-${s.state}`, transform: `translate(0 ${cy})` }, svg);
      if (i % 2 === 0) el('rect', { x: 0, y: -LH / 2, width: W, height: LH, class: 'sk-lane-band' }, g);
      // logo + name
      if (s.kind === 'tool') el('circle', { cx: 12, cy: 0, r: 11, class: 'sk-lane-disc' }, g);
      const sz = s.kind === 'tool' ? 15 : 22;
      el('image', { href: iconUrl(s), width: sz, height: sz, x: 12 - sz / 2, y: -sz / 2 }, g);
      const nm = s.short || s.name;
      el('text', { class: 'sk-lane-txt', x: 28, dy: '0.35em' }, g).textContent = nm.length > 18 ? `${nm.slice(0, 17)}…` : nm;
      // periods
      if (s.state === 'next') {
        el('rect', { x: x(NOW) - 18, y: -5, width: 16, height: 10, rx: 5, class: 'sk-lane-plan' }, g);
      } else {
        const ps = periodsOf(s, now);
        ps.forEach(([a, b], k) => {
          const open = k === ps.length - 1 && isOngoing(s);
          const x0 = x(a), x1 = open ? x(NOW) : x(b + 1);
          if (k) el('line', { x1: x(ps[k - 1][1] + 1), x2: x0, y1: 0, y2: 0, class: 'sk-lane-gap' }, g);
          const w = Math.max(6, x1 - x0 - (open ? 0 : 1));
          el('rect', { x: x0 + (k ? 0.5 : 0), y: -6, width: w, height: 12, rx: 6, class: 'sk-lane-bar', ...(open ? { fill: `url(#skfade-${cls})` } : {}) }, g);
          if (open) {
            if (s.state === 'learning') el('circle', { cx: x1 - 4, cy: 0, r: 4.5, class: 'sk-lane-pulse' }, g);
            else el('path', { d: `M${x1 + 2} -5 L${x1 + 9} 0 L${x1 + 2} 5`, class: 'sk-lane-arrow' }, g);
          }
        });
      }
      const hit = el('rect', { x: 0, y: -LH / 2, width: W, height: LH, class: 'sk-lane-hit' }, g);
      hit.addEventListener('pointerenter', (e) => onHover?.(s, e));
      hit.addEventListener('pointermove', (e) => onHover?.(s, e));
      hit.addEventListener('pointerleave', () => onHover?.(null));
      hit.addEventListener('click', (e) => onHover?.(s, e, true));
    });
  }

  function render() { drawTabs(); drawChart(); }
  render();
  let lastW = 0;
  new ResizeObserver(() => {
    const w = scroller.clientWidth;
    if (w && Math.abs(w - lastW) > 2) { lastW = w; drawChart(); }
  }).observe(scroller);

  return {
    get year() { return NOW; },
    get end() { return NOW; },
    setKind(k) { kind = k; render(); },
    play() {},
  };
}

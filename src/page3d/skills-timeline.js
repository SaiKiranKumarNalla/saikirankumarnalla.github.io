// Tool progression, 2016 to now, as six small dashboards in one row: one per domain. Each lane has the
// skill's logo and name on the left and a thin bar on a shared 2016 to 2026 axis, starting the year it was
// first used. A skill with an `until` year stops there and continues as a faint dotted tail ("not used
// since"). One playhead replays the years across all panels (once on first view, again on Replay, or by
// dragging the scrubber). Plain SVG, no library. Reduced motion shows the finished chart.
const NS = 'http://www.w3.org/2000/svg';
const START = 2016, END = 2027;
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mountTimeline(host, { skills, domains, milestones, now, iconUrl, onHover, reduceMotion }) {
  const NOW = now + 0.84; // early November
  const order = { learnt: 0, learning: 1, next: 2 };
  const startOf = (s) => (s.state === 'next' ? NOW : s.since);

  host.innerHTML = `<div class="sk-tl-head">
      <div class="sk-tl-year"><b>2016</b><span><i data-c="tool">0</i> tools · <i data-c="competency">0</i> competencies</span></div>
      <button type="button" class="sk-tl-play" aria-label="Replay the years">Replay</button>
    </div>
    <div class="sk-tl-row"></div>
    <input class="sk-tl-scrub" type="range" min="${START}" max="${NOW.toFixed(2)}" step="0.01" value="${START}" aria-label="Scrub through the years">`;
  const rowEl = host.querySelector('.sk-tl-row');
  const yearEl = host.querySelector('.sk-tl-year b');
  const cntEl = Object.fromEntries([...host.querySelectorAll('[data-c]')].map((n) => [n.dataset.c, n]));
  const scrub = host.querySelector('.sk-tl-scrub');
  const playBtn = host.querySelector('.sk-tl-play');

  const LH = 15, TOP = 6, BOT = 18, GUT = 92, R = 12;
  let kind = 'all', year = reduceMotion ? NOW : START;

  const panels = domains.map((d) => {
    const box = document.createElement('div');
    box.className = 'sk-mini';
    box.innerHTML = `<h3>${esc(d.name)}</h3>`;
    const chart = document.createElement('div');
    chart.className = 'sk-mini-chart';
    box.appendChild(chart);
    rowEl.appendChild(box);
    const svg = el('svg', { class: 'sk-tl-svg', role: 'img', 'aria-label': `${d.name}: when each skill was first used, 2016 to 2026` });
    chart.appendChild(svg);
    const gGrid = el('g', {}, svg);
    const gLanes = el('g', {}, svg);
    const head = el('line', { class: 'sk-tl-head-line' }, svg);
    const list = skills.filter((s) => s.domain === d.id)
      .sort((a, b) => startOf(a) - startOf(b) || order[a.state] - order[b.state] || b.uses.length - a.uses.length);
    const lanes = list.map((s) => {
      const g = el('g', { class: `sk-lane sk-${s.kind} sk-st-${s.state}${s.until ? ' sk-lapsed' : ''}`, tabindex: '-1' }, gLanes);
      const hit = el('rect', { class: 'sk-lane-hit', height: LH, y: -LH / 2 }, g);
      const tail = el('line', { class: 'sk-lane-tail' }, g);
      const bar = el('line', { class: 'sk-lane-bar', 'stroke-width': (1.4 + Math.min(s.uses.length, 12) * 0.16).toFixed(2) }, g);
      bar.style.opacity = (0.45 + 0.55 * Math.min(1, s.uses.length / 10)).toFixed(2);
      const end = el('circle', { class: 'sk-lane-end', r: 2.6 }, g);
      const mark = el('g', { class: 'sk-lane-mark' }, g);
      const sz = s.kind === 'tool' ? 8 : 12;
      if (s.kind === 'tool') el('circle', { r: 6, class: 'sk-lane-disc', cx: 7, cy: 0 }, mark);
      el('image', { href: iconUrl(s), width: sz, height: sz, x: 7 - sz / 2, y: -sz / 2 }, mark);
      const txt = el('text', { class: 'sk-lane-txt', x: 17, dy: '0.34em' }, g);
      const nm = s.short || s.name;
      txt.textContent = nm.length > 15 ? `${nm.slice(0, 14)}…` : nm;
      g.addEventListener('pointerenter', (e) => onHover?.(s, e));
      g.addEventListener('pointermove', (e) => onHover?.(s, e));
      g.addEventListener('pointerleave', () => onHover?.(null));
      g.addEventListener('click', (e) => onHover?.(s, e, true));
      return { s, start: startOf(s), stop: s.until ? s.until + 1 : NOW, g, hit, bar, tail, end, y: 0, on: true };
    });
    return { d, box, chart, svg, gGrid, head, lanes, W: 0, x: () => 0 };
  });

  function layoutPanel(p) {
    p.W = Math.max(150, p.chart.clientWidth);
    const x0 = GUT, x1 = p.W - R;
    p.x = (y) => x0 + ((y - START) / (END - START)) * (x1 - x0);
    const vis = p.lanes.filter((l) => (l.on = kind === 'all' || l.s.kind === kind));
    p.box.hidden = !vis.length;
    const H = TOP + vis.length * LH + BOT;
    p.svg.setAttribute('viewBox', `0 0 ${p.W} ${H}`);
    p.svg.setAttribute('width', p.W); p.svg.setAttribute('height', H);
    p.gGrid.replaceChildren();
    [2016, 2021, 2026].forEach((y) => {
      el('line', { x1: p.x(y), x2: p.x(y), y1: TOP - 2, y2: H - BOT + 3, class: 'sk-tl-tick' }, p.gGrid);
      el('text', { x: p.x(y), y: H - 4, class: 'sk-tl-yr', 'text-anchor': 'middle' }, p.gGrid).textContent = y;
    });
    milestones.forEach((m) => {
      const ln = el('line', { x1: p.x(m.year), x2: p.x(m.year), y1: TOP - 2, y2: H - BOT + 3, class: 'sk-tl-ms' }, p.gGrid);
      el('title', {}, ln).textContent = m.name;
    });
    p.head.setAttribute('y1', TOP - 2); p.head.setAttribute('y2', H - BOT + 3);
    let i = 0;
    p.lanes.forEach((l) => {
      l.g.classList.toggle('off', !l.on);
      if (!l.on) return;
      l.y = TOP + LH / 2 + i * LH; i++;
      l.g.style.transform = `translate(0px, ${l.y}px)`;
      l.hit.setAttribute('x', 0); l.hit.setAttribute('width', p.W);
    });
  }

  function layout() { panels.forEach(layoutPanel); draw(); }

  function draw() {
    const counts = { tool: 0, competency: 0 };
    panels.forEach((p) => {
      const px = p.x(year);
      p.lanes.forEach((l) => {
        if (!l.on) return;
        const xs = p.x(l.start);
        const shown = year >= l.start - 0.001;
        l.g.classList.toggle('shown', shown);
        if (shown && l.s.state !== 'next') counts[l.s.kind]++;
        // The bar runs from first use to the last-use year (or today); a dotted tail runs on to today.
        const xb = l.s.state === 'next' ? xs + 8 : Math.max(xs, Math.min(px, p.x(l.stop)));
        l.bar.setAttribute('x1', xs); l.bar.setAttribute('x2', shown ? xb : xs);
        l.bar.setAttribute('y1', 0); l.bar.setAttribute('y2', 0);
        if (l.s.until) {
          const xt = Math.max(p.x(l.stop), Math.min(px, p.x(NOW)));
          l.tail.setAttribute('x1', p.x(l.stop)); l.tail.setAttribute('x2', shown ? xt : p.x(l.stop));
          l.tail.setAttribute('y1', 0); l.tail.setAttribute('y2', 0);
        }
        l.end.setAttribute('cx', xb);
      });
      p.head.setAttribute('x1', px); p.head.setAttribute('x2', px);
      p.svg.classList.toggle('done', year >= NOW - 0.01);
    });
    yearEl.textContent = Math.min(now, Math.floor(year));
    cntEl.tool.textContent = counts.tool; cntEl.competency.textContent = counts.competency;
    scrub.value = year;
  }

  // Playback (shared by all panels)
  let raf = 0, played = false;
  function play() {
    cancelAnimationFrame(raf);
    if (reduceMotion) { year = NOW; draw(); return; }
    const from = START, dur = 5600, t0 = performance.now();
    played = true;
    const step = (t) => {
      const f = Math.min(1, (t - t0) / dur);
      year = from + (NOW - from) * ease(f);
      draw();
      if (f < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  playBtn.addEventListener('click', play);
  scrub.addEventListener('input', () => { cancelAnimationFrame(raf); played = true; year = +scrub.value; draw(); });

  layout();
  if (!reduceMotion) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting) && !played) { play(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(rowEl);
  }
  let lastW = 0;
  new ResizeObserver(() => {
    const w = panels.find((p) => !p.box.hidden)?.chart.clientWidth || 0;
    if (w && Math.abs(w - lastW) > 2) { lastW = w; layout(); }
  }).observe(rowEl);

  return {
    get year() { return year; },
    get end() { return NOW; },
    setKind(k) { kind = k; layout(); },
    play,
  };
}

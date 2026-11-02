// Tool progression, 2016 to now. One lane per skill, sorted by the year it was first used: the logo sits
// at that year and the bar grows to today, thicker and brighter with more projects. A playhead replays
// the years (once when the chart scrolls into view, again on Replay, or by dragging the scrubber), so
// skills pop in as they were picked up. Learning skills pulse at the right edge; Next ones wait there
// as hollow marks. Plain SVG, no library. Reduced motion shows the finished chart.
const NS = 'http://www.w3.org/2000/svg';
const START = 2016, END = 2027.15;
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pop = (x) => { const c = 1.9; x = Math.max(0, Math.min(1, x)); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

export function mountTimeline(host, { skills, milestones, now, iconUrl, onHover, reduceMotion }) {
  const NOW = now + 0.84; // early November
  const order = { learnt: 0, learning: 1, next: 2 };
  const all = skills.map((s) => ({ s, start: s.state === 'next' ? NOW : s.since }))
    .sort((a, b) => a.start - b.start || order[a.s.state] - order[b.s.state] || b.s.uses.length - a.s.uses.length);

  host.innerHTML = `<div class="sk-tl-head">
      <div class="sk-tl-year"><b>2016</b><span><i data-c="tool">0</i> tools · <i data-c="competency">0</i> competencies</span></div>
      <button type="button" class="sk-tl-play" aria-label="Replay the years">Replay</button>
    </div>
    <div class="sk-tl-chart"></div>
    <input class="sk-tl-scrub" type="range" min="${START}" max="${NOW.toFixed(2)}" step="0.01" value="${START}" aria-label="Scrub through the years">`;
  const chart = host.querySelector('.sk-tl-chart');
  const yearEl = host.querySelector('.sk-tl-year b');
  const cntEl = Object.fromEntries([...host.querySelectorAll('[data-c]')].map((n) => [n.dataset.c, n]));
  const scrub = host.querySelector('.sk-tl-scrub');
  const playBtn = host.querySelector('.sk-tl-play');

  const svg = el('svg', { class: 'sk-tl-svg', role: 'img', 'aria-label': 'Timeline of when each tool and competency was first used, 2016 to 2026' }, chart);
  const gGrid = el('g', { class: 'sk-tl-grid' }, svg);
  const gLanes = el('g', {}, svg);
  const head = el('line', { class: 'sk-tl-head-line' }, svg);

  const LH = 13, TOP = 20, BOT = 20;
  let W = 0, x = () => 0, kind = 'all', year = reduceMotion ? NOW : START;

  const lanes = all.map((d) => {
    const g = el('g', { class: `sk-lane sk-${d.s.kind} sk-st-${d.s.state}`, tabindex: '-1' }, gLanes);
    const hit = el('rect', { class: 'sk-lane-hit', height: LH, y: -LH / 2 }, g);
    const bar = el('line', { class: 'sk-lane-bar', 'stroke-width': (1.6 + Math.min(d.s.uses.length, 12) * 0.42).toFixed(2) }, g);
    bar.style.opacity = (0.38 + 0.62 * Math.min(1, d.s.uses.length / 10)).toFixed(2);
    const end = el('circle', { class: 'sk-lane-end', r: 3 }, g);
    const txt = el('text', { class: 'sk-lane-txt', dy: '0.34em' }, g);
    txt.textContent = d.s.short || d.s.name;
    const mark = el('g', { class: 'sk-lane-mark' }, g);
    if (d.s.kind === 'tool') el('circle', { r: 6.6, class: 'sk-lane-disc' }, mark);
    const sz = d.s.kind === 'tool' ? 9 : 13;
    el('image', { href: iconUrl(d.s), width: sz, height: sz, x: -sz / 2, y: -sz / 2 }, mark);
    g.addEventListener('pointerenter', (e) => onHover?.(d.s, e));
    g.addEventListener('pointermove', (e) => onHover?.(d.s, e));
    g.addEventListener('pointerleave', () => onHover?.(null));
    g.addEventListener('click', (e) => onHover?.(d.s, e, true));
    return { ...d, g, hit, bar, end, txt, mark, y: 0, on: true };
  });

  function layout() {
    W = Math.max(280, chart.clientWidth);
    const L = 4, R = 16;
    x = (y) => L + ((y - START) / (END - START)) * (W - L - R);
    const vis = lanes.filter((l) => (l.on = kind === 'all' || l.s.kind === kind));
    const H = TOP + vis.length * LH + BOT;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    // Grid: one line per year, labels every two (every one when wide), milestones on top.
    gGrid.replaceChildren();
    for (let y = START; y <= 2027; y++) {
      el('line', { x1: x(y), x2: x(y), y1: TOP - 4, y2: H - BOT + 2, class: 'sk-tl-tick' }, gGrid);
      if (y < 2027 && (W > 440 || y % 2 === 0)) {
        const t = el('text', { x: x(y + 0.5), y: H - 6, class: 'sk-tl-yr', 'text-anchor': 'middle' }, gGrid);
        t.textContent = W > 440 ? y : `'${String(y).slice(2)}`;
      }
    }
    milestones.forEach((m) => {
      el('line', { x1: x(m.year), x2: x(m.year), y1: 12, y2: H - BOT + 2, class: 'sk-tl-ms' }, gGrid);
      const t = el('text', { x: x(m.year), y: 9, class: 'sk-tl-mst', 'text-anchor': m.year > 2026 ? 'end' : 'middle' }, gGrid);
      t.textContent = m.name;
    });
    el('line', { x1: x(NOW), x2: x(NOW), y1: TOP - 4, y2: H - BOT + 2, class: 'sk-tl-now' }, gGrid);
    head.setAttribute('y1', 12); head.setAttribute('y2', H - BOT + 2);
    let i = 0;
    lanes.forEach((l) => {
      l.g.classList.toggle('off', !l.on);
      if (!l.on) return;
      l.y = TOP + LH / 2 + i * LH; i++;
      l.g.style.transform = `translate(0px, ${l.y}px)`;
      const x0 = x(l.start);
      l.hit.setAttribute('x', 0); l.hit.setAttribute('width', W);
      l.mark.style.transform = `translate(${x0}px, 0px)`;
      // Label left of the logo when it fits, otherwise just right of it with a halo over the bar.
      const tw = (l.s.short || l.s.name).length * 5.3;
      const left = x0 - 10 - tw > 2 || l.s.state === 'next';
      l.txt.setAttribute('x', left ? x0 - 10 : x0 + 10);
      l.txt.setAttribute('text-anchor', left ? 'end' : 'start');
      l.txt.classList.toggle('halo', !left);
    });
    draw();
  }

  function draw() {
    const counts = { tool: 0, competency: 0 };
    const px = x(year);
    lanes.forEach((l) => {
      if (!l.on) return;
      const x0 = x(l.start);
      const t = (year - l.start) / 0.35; // the logo pops over a third of a year of playhead
      const s = l.s.state === 'next' ? (year >= NOW - 0.01 ? 1 : 0) : pop(t);
      l.mark.style.transform = `translate(${x0}px, 0px) scale(${Math.max(0, s)})`;
      const shown = year >= l.start - 0.001;
      l.g.classList.toggle('shown', shown);
      if (shown && l.s.state !== 'next') counts[l.s.kind]++;
      const xe = l.s.state === 'next' ? x0 + 9 : Math.max(x0, Math.min(px, x(NOW)));
      l.bar.setAttribute('x1', x0); l.bar.setAttribute('x2', shown ? xe : x0);
      l.bar.setAttribute('y1', 0); l.bar.setAttribute('y2', 0);
      l.end.setAttribute('cx', xe);
    });
    head.setAttribute('x1', px); head.setAttribute('x2', px);
    svg.classList.toggle('done', year >= NOW - 0.01);
    yearEl.textContent = Math.min(now, Math.floor(year));
    cntEl.tool.textContent = counts.tool; cntEl.competency.textContent = counts.competency;
    scrub.value = year;
  }

  // Playback
  let raf = 0, played = false;
  function play() {
    cancelAnimationFrame(raf);
    if (reduceMotion) { year = NOW; draw(); return; }
    const from = START, dur = 6200, t0 = performance.now();
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
    io.observe(chart);
  }
  let lastW = 0;
  new ResizeObserver(() => { if (Math.abs(chart.clientWidth - lastW) > 2) { lastW = chart.clientWidth; layout(); } }).observe(chart);

  return {
    get year() { return year; },
    get end() { return NOW; },
    setKind(k) { kind = k; layout(); },
    play,
  };
}

// Publications, on the layout kit: a hero with every paper fanned out in 3D, research metrics (Scholar,
// ResearchGate, ORCID and the citations chart), a band with one stack of sheets per status and, right under it,
// tabs that filter the papers (cards with first-page thumbnails that open in the lightbox, status badges,
// DOIs and abstracts), and a closing band.
import pubs from '../../content/publications.json';
import metrics from '../../content/research-metrics.json';
import { mountPage, hero, band, split, cta, stage, tabs, stats, bars, acc, btn, esc } from './layout.js';
import { heroStage, stacksStage, GROUPS } from './publications-scene.js';
import './publications.css';

const gs = metrics.googleScholar, rg = metrics.researchGate, oc = metrics.orcid;
const paras = (t) => String(t).split(/\n\s*\n/).map((x) => `<p>${esc(x.trim())}</p>`).join('');
const paperLink = (p) => p.pdf || (p.doi ? `https://doi.org/${p.doi}` : '');
const where = (p) => String(p.venue).split(' · ')[0];
const groups = GROUPS.map(([k, name]) => ({ k, name, list: pubs.filter((p) => p.status === k).sort((a, b) => b.year - a.year) })).filter((g) => g.list.length);
const all = groups.flatMap((g) => g.list);

// First-page images exist only for items flagged firstPage in the JSON; the rest get the typographic placeholder.
const placeholder = (p) => `<span class="pb-thumb pb-ph" aria-hidden="true"><i>${esc(where(p))}</i><b>${esc(p.year)}</b></span>`;
const thumb = (p, group) => (p.firstPage
  ? `<button type="button" class="lk-zoom pb-thumb" data-src="/media/papers/${esc(p.id)}.webp" data-cap="${esc(`${p.title} (${where(p)}, ${p.year})`)}" data-group="${esc(group)}" data-pid="${esc(p.id)}" aria-label="Read the first page of ${esc(p.title)}"><img src="/media/papers/${esc(p.id)}-thumb.webp" alt="" loading="lazy" decoding="async" width="84" height="119"></button>`
  : placeholder(p));

const paper = (p, group) => {
  const link = paperLink(p);
  const more = p.abstract ? acc([{ title: 'Abstract', html: paras(p.abstract) }], 'pb-acc')
    : p.summary ? acc([{ title: 'Summary', html: `<p>${esc(p.summary)}</p><p class="lk-meta">Full abstract on the publisher's site.</p>` }], 'pb-acc') : '';
  return `<article class="lk-card pb-card" data-status="${esc(p.status)}">${thumb(p, group)}<div class="pb-body">
    ${p.statusText ? `<span class="pb-badge">${esc(p.statusText)}</span>` : ''}
    <h3>${esc(p.title)}</h3>
    <p class="pb-venue">${esc(p.venue)} · ${esc(p.year)}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi.org/${esc(p.doi)}</a>` : ''}</p>
    ${link ? `<a class="pb-read" href="${esc(link)}" target="_blank" rel="noopener">${p.pdf ? 'View full poster PDF ↗' : 'Read paper / manuscript ↗'}</a>` : ''}
    ${more}</div></article>`;
};
const grid = (items, group) => `<div class="lk-grid pb-grid">${items.map((p) => paper(p, group)).join('')}</div>`;

// ── Hero
const heroHtml = `<p class="lk-k">Publications</p>
  <h1>Papers, preprints and talks</h1>
  <p class="lk-lede">Physical ground truth for PET/CT: 3D-printed phantoms, synthetic lesion insertion, simulation, and earlier work on blood-flow modelling.</p>
  ${stats(groups.map((g) => ({ value: String(g.list.length), label: g.name.toLowerCase() })))}
  <div class="lk-btns">${btn({ href: '#papers', label: 'Browse the papers' })}${btn({ href: '#metrics', label: 'Research metrics', ghost: true })}</div>`;

// ── Metrics
const yearly = (() => {
  const have = Object.fromEntries((gs.yearlyCitations || []).map((y) => [y.year, +y.value]));
  const ys = (gs.yearlyCitations || []).map((y) => +y.year);
  const end = Math.max(...ys), start = Math.min(gs.sinceYear || end, ...ys);
  const out = [];
  for (let y = start; y <= end; y++) out.push({ label: String(y), value: have[y] || 0, display: String(have[y] || 0), mark: y === end });
  return out;
})();
const metricsSplit = split({
  id: 'metrics', cls: 'lk-even',
  text: `<p class="lk-k">Research metrics</p><h2>Impact at a glance</h2>
    <p class="lk-lede">Early-career numbers, updated ${esc(metrics.updated)}.</p>
    <p class="pb-src">Google Scholar</p>
    ${stats([{ value: String(gs.citations), label: 'citations' }, { value: String(gs.hIndex), label: 'h-index' }, { value: String(gs.i10Index), label: 'i10-index' }])}
    <p class="pb-src">ResearchGate</p>
    ${stats([{ value: String(rg.researchInterestScore), label: 'RI score' }, { value: String(rg.reads), label: 'reads' }, { value: String(rg.citations), label: 'citations' }])}
    <div class="lk-btns">${btn({ href: gs.profile, label: 'Google Scholar ↗', ext: true })}${btn({ href: rg.profile, label: 'ResearchGate ↗', ghost: true, ext: true })}${btn({ href: oc.profile, label: `ORCID ${oc.id} ↗`, ghost: true, ext: true })}</div>`,
  media: bars({ title: 'Citations per year (Google Scholar)', items: yearly, note: `Since ${gs.sinceYear}: ${gs.sinceCitations} citations, h-index ${gs.sinceHIndex}.` }),
});

// ── Papers: the stacks band, with the filter tabs right below it. Tab 0 is "All", then one tab per group in
// GROUPS order, which is the order the stacks stage reads them in.
const tabItems = [{ label: 'All', sub: `${all.length} items`, html: grid(all, 'papers-all') },
  ...groups.map((g) => ({ label: g.name, sub: `${g.list.length} ${g.list.length > 1 ? 'items' : 'item'}`, html: grid(g.list, `papers-${g.k}`) }))];
const papers = band({
  id: 'papers', cls: 'pb-band',
  stage: stage('stacks', { focus: '0.4 0.08 0.99 0.94', focusM: '0.02 0.06 0.98 0.96' }),
  over: '<p class="lk-k">The papers</p><h2>One stack per status</h2><p>Pick a tab below: its stack lifts and fans out here. Click a first page to read it large.</p>',
  below: tabs('papers', tabItems, { cls: 'pb-tabs' }),
});

const close = cta({
  kicker: 'Where it leads', title: 'From papers to the thesis', text: 'The published work, the preprints and the manuscripts in preparation are the five studies of the PhD.',
  links: [{ href: '/sections/research.html', label: 'The PhD in a nutshell →' }, { href: '/sections/projects.html', label: 'What I built next', ghost: true }],
});

mountPage({
  active: 'publications',
  html: hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.5 0.12 0.99 0.92', focusM: '0.02 0.1 0.98 0.96' }), html: heroHtml }) + metricsSplit + papers + close,
  stages: { hero: heroStage, stacks: stacksStage },
});

// A first page that fails to load falls back to the placeholder.
const byId = Object.fromEntries(pubs.map((p) => [p.id, p]));
document.querySelectorAll('button.pb-thumb').forEach((el) => {
  const img = el.querySelector('img');
  const ph = () => { el.outerHTML = placeholder(byId[el.dataset.pid]); };
  img.addEventListener('error', ph, { once: true });
  if (img.complete && !img.naturalWidth && img.src) ph();
});

// Skills & Tools, on the layout kit: a hero with the 3D skill network, the timeline of how the toolkit grew
// (one chart at a time, domain tabs, periods with gaps) as a full-width section, the six domains as tabs with the
// network flying to the chosen one, learning and next as a band with the network again, and the certifications.
// Tools and competencies can be filtered everywhere. The 3D ignores the pointer: hovering a row lights its node.
import data from '../../content/skills.json';
import { mountPage, hero, sec, band, tabs, head, stage, stats, cta, btn, esc } from './layout.js';
import { networkStage, net, skillsOf, sortSk } from './skills-scene.js';
import { iconUrl } from './skills-emblems.js';
import { mountTimeline, periodText } from './skills-timeline.js';
import { certs, certGroup } from './certs.js';
import './skills.css';

const NOW = data.now;
const workById = Object.fromEntries(data.works.map((w) => [w.id, w]));
const byId = Object.fromEntries(data.skills.map((s) => [s.id, s]));
const domName = Object.fromEntries(data.domains.map((d) => [d.id, d.name]));
const count = (f) => data.skills.filter(f).length;

// Years shown come from the first-use year (and the last-use year when a skill has gone quiet), never stored.
const yrs = (s) => {
  if (s.state === 'next') return 'Planned';
  if (s.state === 'learning') return `Started ${s.since}`;
  if (s.periods && s.periods.length > 1) return periodText(s, NOW);
  if (s.until) return s.until === s.since ? `${s.since}` : `${s.since}–${s.until}`;
  const n = NOW - s.since;
  return n <= 0 ? 'Under 1 yr' : `${n} yr${n === 1 ? '' : 's'}`;
};
const usesTxt = (s) => (s.uses.length ? `${s.uses.length} project${s.uses.length === 1 ? '' : 's'}` : 'no project yet');
const ico = (s) => `<span class="sk-ico sk-ico-${s.kind}" aria-hidden="true"><img src="${esc(iconUrl(s))}" alt="" loading="lazy" decoding="async"></span>`;
const stateMark = (s) => `<span class="sk-st sk-${s.state}" title="${esc(data.states[s.state].name)}">${s.state === 'learnt' ? '<i></i>' : esc(data.states[s.state].name)}</span>`;
const TYPE = { project: 'Projects', thesis: 'Theses', paper: 'Papers & posters' };
const detail = (s) => `<p>${esc(s.evidence)}</p>${['project', 'thesis', 'paper'].map((t) => {
  const ws = s.uses.map((u) => workById[u]).filter((w) => w.type === t);
  return ws.length ? `<div class="sk-uses"><span>${TYPE[t]}</span>${ws.map((w) => `<a href="${esc(w.href)}">${esc(w.name)}</a>`).join('')}</div>` : '';
}).join('')}`;

// A compact row: icon, name, years and projects, state. The details open on click.
const row = (s, showDomain = false, extra = false) => `<li class="sk-row${extra ? ' sk-extra' : ''}"${extra ? ' hidden' : ''} data-skill="${s.id}" data-state="${s.state}" data-kind="${s.kind}">
    <button type="button" class="sk-rowbtn" aria-expanded="false">
      ${ico(s)}
      <span class="sk-nm"><b>${esc(s.name)}</b><small>${showDomain ? `${esc(domName[s.domain])} · ` : ''}${esc(yrs(s))} · ${usesTxt(s)}</small></span>
      ${stateMark(s)}<span class="sk-chev" aria-hidden="true"></span>
    </button>
    <div class="sk-detail" hidden>${detail(s)}</div>
  </li>`;
const SHOW = 4; // rows visible per group before "Show all"
const group = (kind, list, showDomain) => list.length ? `<div class="sk-group" data-kind="${kind}">
    <div class="sk-ghead"><span class="sk-shape sk-shape-${kind}" aria-hidden="true"></span>${esc(data.kinds[kind].name)}<em>${list.length}</em></div>
    <ul class="sk-list">${list.map((s, i) => row(s, showDomain, list.length > SHOW + 1 && i >= SHOW)).join('')}</ul>
    ${list.length > SHOW + 1 ? `<button type="button" class="sk-more" aria-expanded="false" data-n="${list.length}">Show all ${list.length}</button>` : ''}</div>` : '';
const groups = (list, showDomain = false) => group('competency', list.filter((s) => s.kind === 'competency'), showDomain) + group('tool', list.filter((s) => s.kind === 'tool'), showDomain);

const ringSvg = {
  learnt: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  learning: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  next: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.6 2.6"/></svg>',
};
const filterBar = () => `<div class="sk-bar" role="toolbar" aria-label="Show tools or competencies">
    ${[['all', 'All'], ['tool', 'Tools'], ['competency', 'Competencies']].map(([v, n]) => `<button type="button" data-filter="${v}" aria-pressed="${v === 'all'}">${v === 'all' ? '' : `<span class="sk-shape sk-shape-${v}" aria-hidden="true"></span>`}${n}</button>`).join('')}
  </div>`;

// ── Hero
const heroHtml = `<p class="lk-k">Competencies &amp; tools</p>
  <h1>Skills &amp; tools</h1>
  <p class="lk-lede">${esc(data.intro)}</p>
  ${stats([{ value: String(count((s) => s.kind === 'competency')), label: 'Competencies' }, { value: String(count((s) => s.kind === 'tool')), label: 'Tools' }, { value: String(count((s) => s.state !== 'learnt')), label: 'Learning & next' }])}
  <ul class="sk-states">${['learnt', 'learning', 'next'].map((st) => `<li class="sk-${st}" title="${esc(data.states[st].text)}">${ringSvg[st]}${esc(data.states[st].name)}</li>`).join('')}</ul>
  <div class="sk-jump">${data.domains.map((d, i) => `<button type="button" data-jump="${i}">${esc(d.name)}</button>`).join('')}</div>`;

// ── Timeline (full width)
const timelineSec = sec(`${head({ kicker: `2016 to ${NOW}`, title: 'How the toolkit grew', lede: 'One domain at a time. Each bar is a period of use; a thin line is a break.' })}
  ${filterBar()}
  <div class="sk-tl" id="skTimeline"></div>`, { id: 'timeline', wide: true });

// ── Domains: tabs, with the network flying to the chosen one
const panel = (d, k) => `<p class="lk-k">${k + 1} / ${data.domains.length} · ${esc(d.kicker)}</p><h3 class="sk-ph">${esc(d.name)}</h3>
  <p class="lk-lede">${esc(d.text)}</p>${groups(skillsOf(d.id))}`;
const domainsSec = sec(`${head({ kicker: 'Six domains', title: 'What I work with', lede: 'Pick a domain: the network flies to it. Hover a row to find it in 3D; open it for the evidence and the projects.' })}
  ${filterBar()}
  ${tabs('dom', data.domains.map((d, k) => ({ label: d.name, html: panel(d, k) })), { variant: 'journey', aside: stage('net', { focus: '0.03 0.04 0.97 0.96' }) })}`, { id: 'domains' });

// ── Learning and next: the network again, with the new and the planned brought forward
const nextRows = (st) => data.skills.filter((s) => s.state === st).sort(sortSk);
const stateGroup = (st) => `<div class="sk-group"><div class="sk-ghead"><span class="sk-ring sk-${st}" aria-hidden="true">${ringSvg[st]}</span>${esc(data.states[st].name)}<em>${nextRows(st).length}</em></div>
  <ul class="sk-list">${nextRows(st).map((s) => row(s, true)).join('')}</ul></div>`;
const growing = band({
  id: 'growing', cls: 'sk-growing',
  stage: stage('growing', { focus: '0.38 0.06 0.99 0.94', focusM: '0.02 0.04 0.98 0.96' }),
  over: `<p class="lk-k">Right now</p><h2>Learning and next</h2><p>Generative and surrogate models trained on CASSOULET, run by agent teams with human gates.</p>
    <a class="sk-link" href="/sections/builder.html">How the agent teams work →</a>`,
  below: `<div class="sk-two">${stateGroup('learning')}${stateGroup('next')}</div>`,
});

// ── Certifications
const certsSec = sec(`${head({ kicker: 'Training', title: 'Certifications & training', lede: certs.intro })}
  <div class="sk-certs-grid">${certs.groups.map(certGroup).join('')}</div>
  <div class="lk-btns">${btn({ href: certs.profiles.google, label: 'Google Skills public profile ↗', ext: true })}</div>`, { id: 'certs', cls: 'sk-certs' });

const close = cta({
  kicker: 'Evidence', title: 'Every skill is tied to a real project', text: 'Open any row above to see the project, thesis or paper where it was used.',
  links: [{ href: '/sections/projects.html', label: 'See the projects →' }, { href: '/sections/publications.html', label: 'Publications', ghost: true }],
});

mountPage({
  active: 'skills',
  html: hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.46 0.1 0.99 0.92', focusM: '0.02 0.1 0.98 0.96' }), html: heroHtml }) + timelineSec + domainsSec + growing + certsSec + close,
  stages: { hero: networkStage('hero'), net: networkStage('domains'), growing: networkStage('growing') },
});

const root = document.getElementById('main');

// Rows expand to show evidence and links; hovering or focusing a row lights its node in 3D.
const expandGroup = (g, open) => {
  g.querySelectorAll('.sk-extra').forEach((r) => { r.hidden = !open; });
  const m = g.querySelector('.sk-more');
  if (m) { m.setAttribute('aria-expanded', String(open)); m.textContent = open ? 'Show fewer' : `Show all ${m.dataset.n}`; }
};
root.addEventListener('click', (e) => {
  const m = e.target.closest('.sk-more');
  if (m) { expandGroup(m.closest('.sk-group'), m.getAttribute('aria-expanded') !== 'true'); return; }
  const b = e.target.closest('.sk-rowbtn'); if (!b) return;
  const open = b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', String(open));
  b.nextElementSibling.hidden = !open;
});
root.addEventListener('pointerover', (e) => { const r = e.target.closest('.sk-row'); if (r) net.hover(r.dataset.skill); });
root.addEventListener('pointerout', (e) => { if (e.target.closest('.sk-row') && !e.relatedTarget?.closest?.('.sk-row')) net.hover(null); });
root.addEventListener('focusin', (e) => { const r = e.target.closest('.sk-row'); if (r) net.hover(r.dataset.skill); });
root.addEventListener('focusout', () => net.hover(null));

// Hero buttons jump to the domain tab.
root.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => {
  document.getElementById(`dom-t${b.dataset.jump}`)?.click();
  document.getElementById('domains').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}));

// Hover card for a timeline lane (a tap on a phone).
const tip = document.createElement('div');
tip.className = 'sk-tip';
tip.setAttribute('role', 'status');
tip.hidden = true;
document.body.appendChild(tip);
function showTip(s, x, y) {
  if (!s) { tip.hidden = true; return; }
  const names = s.uses.map((u) => workById[u].name);
  tip.innerHTML = `<div class="sk-tip-head">${ico(s)}<div><b>${esc(s.name)}</b>
    <span>${esc(data.kinds[s.kind].one)} · ${s.periods?.length > 1 ? `${periodText(s, NOW)} · ` : s.until ? `${s.since}–${s.until} · ` : s.since ? `since ${s.since} · ` : ''}${esc(data.states[s.state].name)}</span></div></div>
    <p>${esc(s.evidence)}</p><span class="sk-tip-uses">${usesTxt(s)}: ${esc(names.slice(0, 5).join(', '))}${names.length > 5 ? ` and ${names.length - 5} more` : ''}</span>`;
  tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = `${Math.max(12, Math.min(innerWidth - w - 12, x + 18))}px`;
  tip.style.top = `${Math.max(64, Math.min(innerHeight - h - 12, y - h / 2))}px`;
}
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.sk-lane-hit')) tip.hidden = true; });

const timeline = mountTimeline(document.getElementById('skTimeline'), {
  skills: data.skills, domains: data.domains, now: NOW, iconUrl,
  onHover: (s, e) => { net.hover(s ? s.id : null); if (s && e) showTip(byId[s.id], e.clientX, e.clientY); else showTip(null); },
});

// Tools / competencies filter: the same choice on every bar, the lists, the timeline and the 3D.
root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
  const f = b.dataset.filter;
  root.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === f)));
  document.documentElement.dataset.skKind = f;
  timeline.setKind(f);
  net.kind(f);
}));

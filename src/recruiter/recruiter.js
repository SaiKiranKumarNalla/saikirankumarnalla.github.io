// Single-page portfolio: one fast, printable page (no 3D) for recruiters. Everything is built from content/*.json.
import profile from '../../content/profile.json';
import pubs from '../../content/publications.json';
import repos from '../../content/repos.json';
import projects from '../../content/projects.json';
import builder from '../../content/ai-builder.json';
import thesis from '../../content/thesis.json';
import veritomix from '../../content/veritomix.json';
import skills from '../../content/skills.json';
import metrics from '../../content/research-metrics.json';
import { iconUrl } from '../page3d/skills-emblems.js';
import './recruiter.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const ext = 'target="_blank" rel="noopener"';

// Same tool-to-logo mapping as the Projects page (src/page3d/projects.js).
const TOOL_LOGOS = {
  MATLAB: 'matlab.webp',
  Python: 'python.svg',
  COMSOL: 'comsol.webp',
  CUDA: 'cuda.svg',
  PyTomography: 'pytomography.webp',
  parallelproj: 'parallelproj.webp',
  'Autodesk Meshmixer': 'autodesk.svg',
};
const toolPill = (name) => {
  const file = TOOL_LOGOS[name];
  const mark = file
    ? `<img src="/media/logos/tools/${file}" alt="" width="16" height="16" loading="lazy" decoding="async">`
    : `<span class="r-mono">${esc(name.slice(0, 2))}</span>`;
  return `<li><span class="r-logo" aria-hidden="true">${mark}</span>${esc(name)}</li>`;
};

const byStartDesc = (a, b) => b.start.localeCompare(a.start);
const orgLogo = (e) => `<span class="r-org"><img src="${esc(e.logo)}" alt="${esc(e.logoAlt || e.org || e.school)}" width="40" height="40" loading="lazy" decoding="async"></span>`;
const place = (e) => (e.city ? ` · ${esc(cap(e.city))}` : '');

const experience = [...profile.experience].sort(byStartDesc).map((e) => `
  <li class="r-entry">${orgLogo(e)}<div>
    <h3>${esc(e.role)}<span class="r-when">${esc(e.years)}</span></h3>
    <p class="r-org-name">${esc(e.org)}${place(e)}${e.group ? `<small>${esc(e.group)}</small>` : ''}</p>
    <ul class="r-points">${e.points.slice(0, 2).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    ${e.partners ? `<ul class="r-partners" aria-label="Partners">${e.partners.map((p) => `<li title="${esc(p.note)}"><img src="${esc(p.logo)}" alt="" width="18" height="18" loading="lazy" decoding="async">${esc(p.name)}</li>`).join('')}</ul>` : ''}
  </div></li>`).join('');

const education = [...profile.education].sort(byStartDesc).map((e) => `
  <li class="r-entry">${orgLogo(e)}<div>
    <h3>${esc(e.degree)}<span class="r-when">${esc(e.years)}</span></h3>
    <p class="r-org-name">${esc(e.school)}${place(e)}</p>
    <p class="r-note">${esc(e.note)}</p>
  </div></li>`).join('');

const repoCard = (r) => `
  <li><a class="r-card" href="/sections/projects.html#${esc(r.id)}">
    <span class="r-tag">${esc(r.kind)} · ${esc(r.years)}</span>
    <b>${esc(r.name)}</b>
    <p>${esc(r.headline || r.eli5)}</p>
    ${r.tools?.length ? `<ul class="r-pills">${r.tools.map(toolPill).join('')}</ul>` : ''}
  </a></li>`;

const builds = builder.builds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

// Skills: most-used first among skills in use or being learnt; years follow the Skills page rules.
const NOW = skills.now;
const years = (s) => {
  if (s.state === 'next') return 'Planned';
  if (s.state === 'learning') return `Learning, ${s.since}`;
  if (s.until) return s.until === s.since ? `${s.since}` : `${s.since}–${s.until}`;
  const n = NOW - s.since;
  return n <= 0 ? 'Under 1 yr' : `${n} yr${n === 1 ? '' : 's'}`;
};
const topSkills = (kind, n) => skills.skills.filter((s) => s.kind === kind && s.state !== 'next')
  .sort((a, b) => b.uses.length - a.uses.length).slice(0, n);
const chip = (s) => `<li class="r-chip${s.state === 'learning' ? ' r-learning' : ''}"><img src="${esc(iconUrl(s))}" alt="" width="20" height="20" loading="lazy" decoding="async"><span>${esc(s.short || s.name)}</span><small>${esc(years(s))}</small></li>`;

const statusCount = (st) => pubs.filter((p) => p.status === st).length;
const STATUS = [['published', 'Published'], ['preprint', 'Preprints'], ['in-preparation', 'In preparation'], ['conference', 'Conference']];
const listed = pubs.filter((p) => ['published', 'preprint'].includes(p.status)).sort((a, b) => b.year - a.year || a.status.localeCompare(b.status));
const sc = metrics.googleScholar, rg = metrics.researchGate;

const L = profile.links;
document.getElementById('bar').innerHTML = `
  <a class="r-brand" href="/">NALLA<span>.</span></a>
  <span class="r-bar-title">Single-page portfolio</span>
  <div class="r-bar-right">
    <button class="r-btn r-ghost" id="printBtn" type="button">Print / PDF</button>
    <button class="r-btn r-ghost" id="themeBtn" type="button" aria-label="Toggle light and dark">Dark</button>
    <a class="r-btn r-ghost" href="/">Full portfolio</a>
  </div>`;

document.getElementById('main').innerHTML = `
<section class="r-hero">
  <div>
    <h1>${esc(profile.displayName)}</h1>
    <p class="r-role">${esc(profile.headline)}</p>
    <p class="r-pitch">${esc(profile.tagline)}</p>
    <p class="r-now"><b>Now:</b> ${esc(profile.now)}</p>
    <div class="r-cta">
      <a class="r-btn" href="mailto:${esc(profile.email)}">Email</a>
      <a class="r-btn r-ghost" href="/${esc(L.cv)}" ${ext}>Download CV</a>
      <a class="r-btn r-ghost" href="${esc(L.linkedin)}" ${ext}>LinkedIn</a>
      <a class="r-btn r-ghost" href="${esc(L.github)}" ${ext}>GitHub</a>
    </div>
  </div>
  <dl class="r-facts">
    <div><dt>Based in</dt><dd>${esc(profile.location)}</dd></div>
    <div><dt>Open to</dt><dd><ul class="r-open">${profile.openTo.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></dd></div>
    <div><dt>Languages</dt><dd>${esc(profile.languages.join(' · '))}</dd></div>
    <div><dt>Email</dt><dd>${esc(profile.email)}</dd></div>
  </dl>
</section>

<div class="r-cols">
  <section class="r-sec" aria-labelledby="h-exp"><h2 id="h-exp">Experience</h2><ol class="r-timeline">${experience}</ol></section>
  <section class="r-sec" aria-labelledby="h-edu"><h2 id="h-edu">Education</h2><ol class="r-timeline">${education}</ol>
    <h2 class="r-h2b">Programmes</h2>
    <ul class="r-plain">${profile.programmes.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
  </section>
</div>

<div class="r-cols">
  <section class="r-sec" aria-labelledby="h-phd"><h2 id="h-phd">PhD in one breath</h2>
    <p class="r-lede">${esc(thesis.eli5)}</p>
    <p class="r-meta">${esc(thesis.title)}<br>${esc(thesis.university)} · defended September 2026</p>
    <a class="r-more" href="/sections/research.html">The PhD studies</a>
  </section>
  <section class="r-sec" aria-labelledby="h-vx"><h2 id="h-vx">${esc(veritomix.name)}</h2>
    <p class="r-lede">${esc(veritomix.mission)}</p>
    <p class="r-meta">${esc(veritomix.status)} &mdash; ${veritomix.team.map((t) => esc(t.name)).join(' &amp; ')}</p>
    <p class="r-meta"><b>CASSOULET</b> is its simulation engine: ${esc(veritomix.cassoulet.motto)}</p>
    <a class="r-more" href="/sections/veritomix.html">About VeriTomiX</a>
  </section>
</div>

<section class="r-sec" aria-labelledby="h-proj"><h2 id="h-proj">Selected projects</h2>
  <ul class="r-grid">${repos.map(repoCard).join('')}</ul>
  <a class="r-more" href="/sections/projects.html">All projects</a>
</section>

<section class="r-sec" aria-labelledby="h-ai"><h2 id="h-ai">Agentic AI systems</h2>
  <p class="r-lede">${esc(builder.headline)}</p>
  <ul class="r-grid r-grid3">${builds.map((p) => `<li class="r-card r-static"><span class="r-tag">${esc(p.kind)} · ${p.year}</span><b>${esc(p.name)}</b><p>${esc(p.eli5)}</p></li>`).join('')}</ul>
  <ul class="r-plain r-inline">${builder.principles.map((p) => `<li><b>${esc(p.title)}.</b> ${esc(p.text)}</li>`).join('')}</ul>
  <a class="r-more" href="/sections/builder.html">How the agent systems are built</a>
</section>

<section class="r-sec" aria-labelledby="h-sk"><h2 id="h-sk">Skills</h2>
  <div class="r-cols r-cols-tight">
    <div><h3 class="r-h3">Tools</h3><ul class="r-chips">${topSkills('tool', 10).map(chip).join('')}</ul></div>
    <div><h3 class="r-h3">Competencies</h3><ul class="r-chips">${topSkills('competency', 10).map(chip).join('')}</ul></div>
  </div>
  <p class="r-meta">Ordered by number of projects that used them. Years are first use; a range means not used since.</p>
  <a class="r-more" href="/sections/skills.html">Full skills timeline</a>
</section>

<section class="r-sec" aria-labelledby="h-pub"><h2 id="h-pub">Publications</h2>
  <div class="r-pubhead">
    <ul class="r-counts">${STATUS.map(([k, n]) => `<li><b>${statusCount(k)}</b><span>${n}</span></li>`).join('')}</ul>
    <ul class="r-metrics">
      <li><b>${sc.citations}</b><span>Scholar citations</span></li>
      <li><b>${sc.hIndex}</b><span>h-index</span></li>
      <li><b>${rg.reads}</b><span>ResearchGate reads</span></li>
    </ul>
  </div>
  <ul class="r-pubs">${listed.map((p) => `<li>
    <span class="r-badge r-${esc(p.status)}">${p.status === 'published' ? 'Published' : 'Preprint'}</span>
    <div><b>${esc(p.title)}</b>
    ${p.statusText ? `<span class="r-dual">${esc(p.statusText)}</span>` : ''}
    <p>${esc(p.venue)} · ${p.year}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" ${ext}>doi.org/${esc(p.doi)}</a>` : ''}</p></div></li>`).join('')}</ul>
  <p class="r-meta">Metrics as of ${esc(metrics.updated)}: <a href="${esc(sc.profile)}" ${ext}>Google Scholar</a> · <a href="${esc(rg.profile)}" ${ext}>ResearchGate</a> · <a href="${esc(metrics.orcid.profile)}" ${ext}>ORCID</a></p>
  <a class="r-more" href="/sections/publications.html">All papers, preprints, posters and manuscripts</a>
</section>

<section class="r-sec r-contact" aria-labelledby="h-ct"><h2 id="h-ct">Contact</h2>
  <p><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a> · <a href="${esc(L.linkedin)}" ${ext}>LinkedIn</a> · <a href="${esc(L.github)}" ${ext}>GitHub</a> · <a href="/${esc(L.cv)}" ${ext}>CV (PDF)</a> · <a href="/sections/contact.html">Contact page</a></p>
  <p class="r-meta">${esc(profile.location)} · Open to ${esc(profile.openTo.join(', '))}</p>
</section>`;

const themeBtn = document.getElementById('themeBtn');
const sync = () => { themeBtn.textContent = document.documentElement.dataset.theme === 'light' ? 'Dark' : 'Light'; };
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('sai-theme', next); } catch (e) { /* storage blocked */ }
  sync();
});
sync();
document.getElementById('printBtn').addEventListener('click', () => window.print());

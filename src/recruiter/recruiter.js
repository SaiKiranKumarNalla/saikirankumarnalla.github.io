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
const defended = thesis.defended === '2026-09' ? 'September 2026' : thesis.defended;
const nPub = statusCount('published'), nPre = statusCount('preprint');
const vxLogo = (t) => `/media/veritomix/veritomix-logo-${t}.webp`;

// "Where I fit": role types matched to proof on this page.
const FIT = [
  ['Imaging Research Scientist', 'PET/CT, phantoms, simulation, quantitative validation and publications.', 'Proof: publications, thesis, CASSOULET'],
  ['Clinical AI / Imaging Product', 'A ground-truth validation mindset for explainable medical-imaging AI.', 'Proof: VeriTomiX, CASSOULET, agentic builds'],
  ['MedTech / Life Sciences Strategy', 'Technical fluency with market, IP and stakeholder translation exposure.', 'Proof: Hepta Medical, VC and strategy programmes'],
  ['Healthcare Venture / Analyst', 'Deep-tech curiosity, medtech exposure and scientific communication.', 'Proof: toolkit, experience, programmes'],
];
const PIPE = [
  ['Need', 'Clinical, technical or translational gap.'],
  ['Model', 'Physical, computational or analytical model.'],
  ['Prototype', 'Code, CAD, simulation or fabrication.'],
  ['Validate', 'Data, metrics and experiments against known truth.'],
  ['Translate', 'Papers, posters, tools and product artifacts.'],
];

document.getElementById('bar').innerHTML = `
  <a class="r-brand" href="/">NALLA<span>.</span></a>
  <nav class="r-links" aria-label="Sections">
    <a href="#fit">Fit</a><a href="#evidence">Evidence</a><a href="#cases">Cases</a><a href="#veritomix">VeriTomiX</a><a href="#proof">Proof</a><a href="#toolkit">Toolkit</a><a href="#experience">Experience</a>
  </nav>
  <div class="r-bar-right">
    <button class="r-btn r-ghost" id="printBtn" type="button">Print / PDF</button>
    <button class="r-btn r-ghost" id="themeBtn" type="button" aria-label="Toggle light and dark">Dark</button>
    <a class="r-btn r-ghost" href="/">Full portfolio</a>
  </div>`;

const head = (kicker, title, copy) => `<div class="r-head"><div><span class="r-kicker">${kicker}</span><h2 class="r-title">${title}</h2></div>${copy ? `<p class="r-headcopy">${copy}</p>` : ''}</div>`;

const skillTile = (s) => `<li class="r-tile${s.state === 'learning' ? ' r-learning' : ''}"><span class="r-tileicon"><img src="${esc(iconUrl(s))}" alt="" width="28" height="28" loading="lazy" decoding="async"></span><b>${esc(s.short || s.name)}</b><small>${esc(years(s))}</small></li>`;

document.getElementById('main').innerHTML = `
<header class="r-hero">
  <div>
    <span class="r-kicker">Single-page portfolio &middot; 3-minute scan</span>
    <h1>${esc(profile.displayName.replace(', PhD', ''))}<span class="r-phd">PhD</span></h1>
    <p class="r-role">${esc(profile.headline)}</p>
    <p class="r-pitch">${esc(profile.tagline)}</p>
    <p class="r-now"><b>Now:</b> ${esc(profile.now)}</p>
    <div class="r-cta">
      <a class="r-btn" href="mailto:${esc(profile.email)}">Email Sai</a>
      <a class="r-btn r-ghost" href="/${esc(L.cv)}" ${ext}>Download CV</a>
      <a class="r-btn r-ghost" href="${esc(L.linkedin)}" ${ext}>LinkedIn</a>
      <a class="r-btn r-ghost" href="${esc(L.github)}" ${ext}>GitHub</a>
    </div>
  </div>
  <aside class="r-glass r-facts" aria-label="Quick facts">
    <div class="r-bigstat"><b>${esc(defended)}</b><span>PhD defended &middot; open to roles</span></div>
    <dl>
      <div><dt>Based in</dt><dd>${esc(profile.location)}</dd></div>
      <div><dt>Open to</dt><dd><ul class="r-open">${profile.openTo.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></dd></div>
      <div><dt>Languages</dt><dd>${esc(profile.languages.join(' · '))}</dd></div>
    </dl>
  </aside>
</header>

<section class="r-sec" id="fit" aria-labelledby="h-fit">
  ${head('Best-fit roles', '<span id="h-fit">Where I fit</span>', 'A quick map for recruiters: role type, why it fits, and where to check the proof first.')}
  <ul class="r-grid r-grid4">${FIT.map(([t, d, p]) => `<li class="r-card r-glass"><b>${esc(t)}</b><p>${esc(d)}</p><small>${esc(p)}</small></li>`).join('')}</ul>
</section>

<section class="r-sec" id="evidence" aria-labelledby="h-ev">
  <div class="r-evgrid">
    <article class="r-glass r-pitchcard"><span class="r-kicker">30-second pitch</span><h2 id="h-ev">Research depth, builder speed, translation instinct.</h2>
      <p>${esc(thesis.abstractShort)}</p></article>
    <ul class="r-stats">
      <li class="r-glass"><b>${nPub}</b><span>Published papers</span></li>
      <li class="r-glass"><b>${nPre}</b><span>Preprints</span></li>
      <li class="r-glass"><b>${sc.citations}</b><span>Scholar citations, h-index ${sc.hIndex}</span></li>
      <li class="r-glass"><b>${profile.experience.length}</b><span>Roles across labs, hospital and startups</span></li>
    </ul>
  </div>
</section>

<section class="r-sec" id="cases" aria-labelledby="h-proj">
  ${head('Portfolio evidence', '<span id="h-proj">Case studies</span>', 'Each card opens the full project, with methods, figures and tools.')}
  <ul class="r-grid">${repos.map(repoCard).join('')}</ul>
  <a class="r-more" href="/sections/projects.html">All projects</a>
</section>

<section class="r-sec" id="phd" aria-labelledby="h-phd">
  <article class="r-glass r-phdcard">
    <span class="r-kicker">The PhD in one breath</span>
    <h2 class="r-title" id="h-phd">${esc(thesis.title)}</h2>
    <p class="r-lede">${esc(thesis.eli5)}</p>
    <p class="r-meta">${esc(thesis.university)} &middot; defended ${esc(defended)}</p>
    <a class="r-more" href="/sections/research.html">The PhD studies</a>
  </article>
</section>

<section class="r-sec" id="veritomix" aria-labelledby="h-vx">
  <article class="r-glass r-vx">
    <div class="r-vxmain">
      <img class="r-vxlogo r-onlight" src="${vxLogo('onlight')}" alt="${esc(veritomix.name)}" width="240" height="82" decoding="async">
      <img class="r-vxlogo r-ondark" src="${vxLogo('ondark')}" alt="" width="240" height="82" decoding="async">
      <span class="r-kicker">${esc(veritomix.status)}</span>
      <h2 class="r-title" id="h-vx">${esc(veritomix.tagline)}</h2>
      <p class="r-lede">${esc(veritomix.mission)}</p>
      <p class="r-meta">${veritomix.team.map((t) => esc(t.name)).join(' &amp; ')}</p>
      <a class="r-more" href="/sections/veritomix.html">About VeriTomiX</a>
    </div>
    <div class="r-vxengine">
      <img src="/media/cassoulet-logo.webp" alt="CASSOULET" width="320" height="84" loading="lazy" decoding="async">
      <span class="r-tag">Simulation engine</span>
      <p>${esc(veritomix.cassoulet.motto)}</p>
      <p class="r-meta">${esc(veritomix.cassoulet.expansion)}</p>
    </div>
  </article>
</section>

<section class="r-sec" id="ai" aria-labelledby="h-ai">
  ${head('Agentic AI', '<span id="h-ai">Agent systems</span>', esc(builder.headline))}
  <ul class="r-grid r-grid3">${builds.map((p) => `<li class="r-card r-glass r-static"><span class="r-tag">${esc(p.kind)} · ${p.year}</span><b>${esc(p.name)}</b><p>${esc(p.eli5)}</p></li>`).join('')}</ul>
  <ul class="r-principles">${builder.principles.map((p) => `<li><b>${esc(p.title)}.</b> ${esc(p.text)}</li>`).join('')}</ul>
  <a class="r-more" href="/sections/builder.html">How the agent systems are built</a>
</section>

<section class="r-sec" id="pipeline" aria-labelledby="h-pipe">
  ${head('How I work', '<span id="h-pipe">Pipeline</span>')}
  <ol class="r-pipeline">${PIPE.map(([t, d], i) => `<li class="r-glass"><b>0${i + 1}</b><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
</section>

<section class="r-sec" id="proof" aria-labelledby="h-pub">
  ${head('Research outputs', '<span id="h-pub">Proof</span>', 'Clickable publications, with the numbers on top for a quick scan.')}
  <div class="r-pubhead">
    <ul class="r-counts">${STATUS.map(([k, n]) => `<li class="r-glass"><b>${statusCount(k)}</b><span>${n}</span></li>`).join('')}</ul>
    <ul class="r-counts r-metrics">
      <li class="r-glass"><b>${sc.citations}</b><span>Scholar citations</span></li>
      <li class="r-glass"><b>${sc.hIndex}</b><span>h-index</span></li>
      <li class="r-glass"><b>${rg.reads}</b><span>ResearchGate reads</span></li>
    </ul>
  </div>
  <ul class="r-grid r-pubgrid">${listed.map((p) => `<li class="r-card r-glass r-static r-pub">
    <span class="r-badge r-${esc(p.status)}">${p.status === 'published' ? 'Published' : 'Preprint'} &middot; ${p.year}</span>
    <b>${esc(p.title)}</b>
    ${p.statusText ? `<span class="r-dual">${esc(p.statusText)}</span>` : ''}
    <p>${esc(p.venue)}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" ${ext}>doi.org/${esc(p.doi)}</a>` : ''}</p></li>`).join('')}</ul>
  <p class="r-meta">Metrics as of ${esc(metrics.updated)}: <a href="${esc(sc.profile)}" ${ext}>Google Scholar</a> · <a href="${esc(rg.profile)}" ${ext}>ResearchGate</a> · <a href="${esc(metrics.orcid.profile)}" ${ext}>ORCID</a></p>
  <a class="r-more" href="/sections/publications.html">All papers, preprints, posters and manuscripts</a>
</section>

<section class="r-sec" id="proofpack" aria-labelledby="h-pp">
  ${head('Decision shortcuts', '<span id="h-pp">Proof pack</span>')}
  <div class="r-pack">
    <article class="r-glass r-packlead"><b>Everything a recruiter usually needs, in one place.</b><p>Open the strongest evidence directly: case studies, publications, CV, GitHub and contact. The full portfolio holds the creative side.</p></article>
    <div class="r-actions">
      <a class="r-glass" href="#cases"><b>Case studies</b><span>work evidence</span></a>
      <a class="r-glass" href="#proof"><b>Publications</b><span>research proof</span></a>
      <a class="r-glass" href="/${esc(L.cv)}" ${ext}><b>CV</b><span>download PDF</span></a>
      <a class="r-glass" href="${esc(L.github)}" ${ext}><b>GitHub</b><span>code and work</span></a>
      <a class="r-glass" href="mailto:${esc(profile.email)}"><b>Contact</b><span>email Sai</span></a>
    </div>
  </div>
</section>

<section class="r-sec" id="toolkit" aria-labelledby="h-sk">
  ${head('Tools mapped to work', '<span id="h-sk">Toolkit</span>', 'Ordered by number of projects that used them. Years are first use; a range means not used since.')}
  <div class="r-toolgrid">
    <article class="r-glass r-toolsec"><h3>Tools</h3><ul class="r-tiles">${topSkills('tool', 12).map(skillTile).join('')}</ul></article>
    <article class="r-glass r-toolsec"><h3>Competencies</h3><ul class="r-tiles">${topSkills('competency', 12).map(skillTile).join('')}</ul></article>
  </div>
  <a class="r-more" href="/sections/skills.html">Full skills timeline</a>
</section>

<section class="r-sec" id="experience" aria-labelledby="h-exp">
  ${head('Professional journey', '<span id="h-exp">Experience</span>')}
  <ol class="r-timeline r-glass">${experience}</ol>
</section>

<section class="r-sec" id="education" aria-labelledby="h-edu">
  ${head('Academic foundation', '<span id="h-edu">Education</span>')}
  <ol class="r-edu">${education}</ol>
  <ul class="r-chips r-prog">${profile.programmes.map((p) => `<li class="r-chip">${esc(p)}</li>`).join('')}</ul>
</section>

<section class="r-sec r-contact" id="contact" aria-labelledby="h-ct">
  <div class="r-glass r-contactpanel">
    <h2 id="h-ct">Let&rsquo;s talk.</h2>
    <p>Open to roles in ${esc(profile.openTo.join(', '))}. ${esc(profile.location)}.</p>
    <div class="r-cta r-center">
      <a class="r-btn" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
      <a class="r-btn r-ghost" href="/${esc(L.cv)}" ${ext}>Download CV</a>
      <a class="r-btn r-ghost" href="${esc(L.linkedin)}" ${ext}>LinkedIn</a>
      <a class="r-btn r-ghost" href="/sections/contact.html">Contact page</a>
    </div>
  </div>
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

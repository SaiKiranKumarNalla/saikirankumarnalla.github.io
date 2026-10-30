// Recruiter mode: one fast, printable page (no 3D) for a 60-second scan. Built from content/*.json.
import profile from '../../content/profile.json';
import pubs from '../../content/publications.json';
import repos from '../../content/repos.json';
import projects from '../../content/projects.json';
import builder from '../../content/ai-builder.json';
import thesis from '../../content/thesis.json';
import { renderNav } from '../page3d/nav.js';
import './recruiter.css';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const count = (st) => pubs.filter((p) => p.status === st).length;

const FIT = [
  ['Imaging research scientist', 'PET/CT quantification, phantoms, simulation and validation, with first-author papers.', '/sections/research.html', 'PhD thesis'],
  ['Medical-imaging AI / simulation engineer', 'Builds simulators and synthetic ground truth for testing imaging AI; Python, MATLAB, GPU.', '/sections/projects.html#cassoulet', 'CASSOULET'],
  ['Agentic AI / applied AI', 'Designs and runs multi-agent systems with human gates, routing and provenance.', '/sections/builder.html', 'Agentic AI'],
  ['MedTech R&D and translation', 'Hospital, startup and industry work: devices, benches, IP and VC programmes.', '/sections/projects.html#ppvi', 'Projects'],
];
const PIPE = [['Need', 'A clinical or technical gap'], ['Model', 'Physics, simulation or data'], ['Build', 'Code, CAD, prints, agents'], ['Validate', 'Metrics against ground truth'], ['Translate', 'Papers, tools, products']];
const agentic = builder.builds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const shown = pubs.filter((p) => ['published', 'preprint'].includes(p.status)).sort((a, b) => b.year - a.year);

document.getElementById('main').innerHTML = `
<header class="r-hero">
  <div>
    <p class="r-kicker">Recruiter mode · 60-second scan</p>
    <h1>${esc(profile.displayName)}</h1>
    <p class="r-role">${esc(profile.headline)}</p>
    <p class="r-pitch">${esc(profile.tagline)} ${esc(profile.now)}</p>
    <div class="r-cta">
      <a class="r-btn" href="mailto:${esc(profile.email)}">Email Sai</a>
      <a class="r-btn r-ghost" href="/${esc(profile.links.cv)}" target="_blank" rel="noopener">Download CV</a>
      <a class="r-btn r-ghost" href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
      <button class="r-btn r-ghost r-print" onclick="window.print()">Print / save as PDF</button>
    </div>
  </div>
  <aside class="r-facts">
    <div><span>Status</span><b>Available now</b></div>
    <div><span>Based in</span><b>${esc(profile.location)}</b></div>
    <div><span>Open to</span><b>${esc(profile.openTo.join(' · '))}</b></div>
    <div><span>Languages</span><b>${esc(profile.languages.map((l) => l.split(' (')[0]).join(' · '))}</b></div>
  </aside>
</header>

<section class="r-stats">
  <div><b>PhD</b><span>Medical imaging, Toulouse 2026</span></div>
  <div><b>${count('published')}</b><span>published papers</span></div>
  <div><b>${count('preprint')}</b><span>preprints</span></div>
  <div><b>${repos.length}</b><span>technical projects</span></div>
  <div><b>${agentic.length}</b><span>agent systems in use</span></div>
</section>

<section class="r-sec"><h2>Where I fit</h2>
  <div class="r-fit">${FIT.map(([t, d, href, proof]) => `<a class="r-card" href="${href}"><b>${esc(t)}</b><p>${esc(d)}</p><span>Proof: ${esc(proof)} →</span></a>`).join('')}</div>
</section>

<section class="r-sec"><h2>How I work</h2>
  <ol class="r-pipe">${PIPE.map(([t, d], i) => `<li><span>0${i + 1}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>
</section>

<section class="r-sec r-two">
  <div><h2>PhD in one breath</h2><p class="r-lede">${esc(thesis.eli5)}</p><p class="r-meta">${esc(thesis.title)} · ${esc(thesis.university)}</p><a class="r-link" href="/sections/research.html">The five studies →</a></div>
  <div><h2>Agent systems</h2>${agentic.map((p) => `<div class="r-item"><b>${esc(p.name)}</b><p>${esc(p.eli5)}</p></div>`).join('')}<a class="r-link" href="/sections/builder.html">How they're built →</a></div>
</section>

<section class="r-sec"><h2>Selected projects</h2>
  <div class="r-grid">${repos.map((r) => `<a class="r-card" href="/sections/projects.html#${r.id}"><span class="r-tag">${esc(r.kind)} · ${esc(r.years)}</span><b>${esc(r.name)}</b><p>${esc(r.eli5)}</p></a>`).join('')}</div>
</section>

<section class="r-sec"><h2>Publications</h2>
  <ul class="r-pubs">${shown.map((p) => `<li><span class="r-badge r-${p.status}">${p.status === 'published' ? 'Published' : 'Preprint'}</span><b>${esc(p.title)}</b><p>${esc(p.venue)} · ${p.year}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</p></li>`).join('')}</ul>
  <a class="r-link" href="/sections/publications.html">All papers, preprints and talks →</a>
</section>

<section class="r-sec r-two">
  <div><h2>Experience</h2>${profile.experience.map((e) => `<div class="r-item"><b>${esc(e.role)}</b>, ${esc(e.org)} <span class="r-meta">${esc(e.years)}</span><p>${esc(e.points[0])}</p></div>`).join('')}</div>
  <div><h2>Education</h2>${profile.education.map((e) => `<div class="r-item"><b>${esc(e.degree)}</b><p>${esc(e.school)} · ${esc(e.years)} · ${esc(e.note)}</p></div>`).join('')}
    <h2 class="r-h2b">Toolkit</h2><div class="r-chips">${['Python', 'MATLAB', 'PET/CT reconstruction', 'Monte Carlo & analytical simulation', 'parallelproj / PyTomography', '3D printing & CAD', 'COMSOL', 'Claude Code · Codex · Gemini', 'Ollama'].map((s) => `<span>${s}</span>`).join('')}</div>
    <h2 class="r-h2b">Programmes</h2><div class="r-chips">${profile.programmes.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
  </div>
</section>

<section class="r-sec r-contact"><h2>Let's talk</h2>
  <p>${esc(profile.email)} · <a href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> · <a href="${esc(profile.links.github)}" target="_blank" rel="noopener">GitHub</a> · <a href="/">Full 3D portfolio</a></p>
</section>`;

renderNav(null);
const themeBtn = document.getElementById('themeBtn');
const syncTheme = () => { themeBtn.textContent = document.documentElement.dataset.theme === 'light' ? '☀' : '☾'; };
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('sai-theme', next); } catch (e) {}
  syncTheme();
});
syncTheme();
import('../kage/widget.js').then((m) => m.mountKage());

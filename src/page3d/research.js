// My PhD thesis in a nutshell, on the layout kit: a full-bleed hero with the scanner and phantom, the problem
// and abstract, the five studies as a horizontal journey (each with methods, results and limitations, and its
// own 3D part beside it), every key figure in a gallery, and a closing takeaway band.
import thesis from '../../content/thesis.json';
import pubs from '../../content/publications.json';
import { mountPage, hero, split, sec, cta, head, stage, tabs, acc, gallery, stats, chips, callout, list, btn, esc } from './layout.js';
import { heroStage, studyStage } from './research-scene.js';
import './research.css';

const ch = (n) => thesis.chapters.find((c) => c.n === n);
const pubLinks = (ids = []) => ids.map((id) => pubs.find((p) => p.id === id)).filter(Boolean)
  .map((p) => `<li>${esc(p.title)} <span class="lk-meta">· ${esc(p.venue)}${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</span></li>`).join('');
const SLIDES = `/docs/${thesis.slides}`;
const problem = ch(0);
const studies = [1, 2, 3, 4, 5].map(ch);

const heroHtml = `<p class="lk-k">PhD · ${esc(thesis.university)} · 2023–2026</p>
  <h1>${esc(thesis.nutshell)}</h1>
  <p class="lk-lede">${esc(thesis.eli5)}</p>
  ${callout(`<p><b>PhD Defense Presentation Slides</b></p><p class="lk-meta">Soutenance de Thèse · IUCT Oncopole / Université de Toulouse (18 MB PDF)</p>`, 'rs-slides')}
  <div class="lk-btns">${btn({ href: SLIDES, label: 'View Presentation (PDF) ↗', ext: true })}${btn({ href: '#studies', label: 'The five studies', ghost: true })}</div>`;

const overview = split({
  cls: 'lk-even',
  text: `<p class="lk-k">${esc(problem.title)}</p><h2>${esc(problem.eli5)}</h2>
    <p class="lk-lede">${esc(problem.detail)}</p>
    <p>${esc(thesis.abstractShort)}</p>`,
  media: `${stats([
    { value: '5', label: 'studies' },
    { value: String(thesis.labs.length), label: thesis.labs.join(' · ') },
    { value: '2023–2026', label: thesis.university },
  ])}
    <div class="rs-meta lk-rv">
      <p class="lk-k">Thesis</p><p class="rs-title">${esc(thesis.title)}</p>
      <p class="lk-meta">${thesis.labs.map(esc).join(' · ')} · Supervised by ${thesis.supervisors.map(esc).join(' & ')}</p>
      <p class="lk-k rs-pk">Partners</p>${chips(thesis.partners)}
    </div>`,
});

const panel = (c) => {
  const m = c.more;
  return `<p class="lk-k">Study ${c.n} of 5</p><h2 class="rs-ph">${esc(c.title)}</h2>
    <p class="lk-lede">${esc(c.eli5)}</p><p>${esc(c.detail)}</p>
    ${m ? `${callout(`<p class="rs-q">${esc(m.question)}</p>`, 'rs-qbox')}
    ${acc([
    { title: 'Key results', html: list(m.results), open: true },
    { title: 'Methods', html: list(m.methods) },
    { title: 'Limitations & next steps', html: list(m.limitations) },
    ...(c.pubs ? [{ title: 'Published as', html: `<ul class="lk-list">${pubLinks(c.pubs)}</ul>` }] : []),
  ])}
    <a class="rs-figlink" href="#figures">${m.figures.length} figure${m.figures.length > 1 ? 's' : ''} from this study in the gallery ↓</a>` : ''}`;
};

const journey = sec(`${head({ kicker: 'The journey', title: 'Five studies', lede: 'Pick a study to see its question, key results, methods and limitations. The 3D beside it follows your choice.' })}
  ${tabs('studies', studies.map((c) => ({ label: c.title, html: panel(c) })), { variant: 'journey', aside: stage('study', { cls: 'lk-tall', focus: '0.05 0.1 0.95 0.92' }) })}`, { id: 'studies' });

const figs = studies.flatMap((c) => (c.more?.figures || []).map((f) => ({ ...f, kicker: `Study ${c.n} · ${c.title}` })));
const figures = sec(`${head({ kicker: 'Figures', title: 'Key figures from the thesis', lede: 'Open a figure to see it large; the arrows page through all of them.' })}
  ${gallery(figs, 'thesis')}`, { id: 'figures' });

const takeaway = cta({
  kicker: 'Takeaway', title: 'Ground truth you can trust', text: thesis.takeaway,
  links: [{ href: '/sections/projects.html', label: 'What I built next →' }, { href: SLIDES, label: 'Defense slides (PDF) ↗', ghost: true, ext: true }],
});

mountPage({
  active: 'research',
  html: hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.53 0.14 0.98 0.9', focusM: '0.02 0.16 0.98 0.96' }), html: heroHtml }) + overview + journey + figures + takeaway,
  stages: { hero: heroStage, study: studyStage },
});

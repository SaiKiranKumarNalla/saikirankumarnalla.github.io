// About, on the layout kit: a hero with the globe, a stat strip, the chronological path as a horizontal
// timeline (Hyderabad, Paris, Toulouse) whose stops hold the degrees and roles as logo cards, the PhD partners,
// a wide band with Europe and the cities Sai is open to, and a closing call to get in touch.
import profile from '../../content/profile.json';
import { mountPage, hero, sec, band, cta, head, stage, stats, grid, card, chips, btn, esc } from './layout.js';
import { heroStage, nextStage } from './about-scene.js';
import './about.css';

// Every degree and role in profile.json, placed in the city it belongs to and sorted oldest first.
// The AUV club is not a profile entry, so it is added here.
const EXTRA = [
  { role: 'Deputy team lead', org: 'Autonomous Underwater Vehicle club, Mahindra École Centrale', years: '2019–2020', start: '2019', city: 'hyderabad', points: ['Built the club from scratch: 25 members, finances, media.'] },
];
const ENTRIES = [
  ...profile.education.map((e) => ({ ...e, title: e.degree, org: e.school, line: e.note, edu: true })),
  ...profile.experience.map((e) => ({ ...e, title: e.role, line: e.points?.[0] })),
  ...EXTRA.map((e) => ({ ...e, title: e.role, line: e.points[0] })),
].sort((a, b) => a.start.localeCompare(b.start) || (b.edu ? 1 : 0) - (a.edu ? 1 : 0));

const logo = (src, alt) => `<span class="ab-logo${src ? '' : ' ab-logo-none'}">${src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : ''}</span>`;
const role = (e) => `<article class="ab-role${e.edu ? ' ab-edu' : ''}">${logo(e.logo, e.logoAlt || e.org)}<div class="ab-rt">
  <b>${esc(e.title)}</b><span class="ab-org">${esc(e.org)}</span><span class="ab-years">${esc(e.years)}</span>
  ${e.group ? `<span class="ab-group">${esc(e.group)}</span>` : ''}${e.line ? `<p>${esc(e.line)}</p>` : ''}</div></article>`;
const roles = (city) => `<div class="ab-roles">${ENTRIES.filter((e) => e.city === city).map(role).join('')}</div>`;

const STOPS = [
  { city: 'hyderabad', when: '2016–2021', place: 'Hyderabad, India', title: 'Engineering roots',
    text: 'Mechanical engineering at Mahindra École Centrale, on an excellence scholarship. First research: simulating how gas bubbles disturb blood flow in the carotid artery, which became a journal paper.',
    link: { href: '/sections/auv.html', label: 'Black Pearl, the underwater robot →' } },
  { city: 'paris', when: '2021–2023', place: 'Paris & Palaiseau, France', title: 'Biomedical engineering, hospitals and a startup',
    text: 'A fully funded MSc at École Polytechnique, alongside a deep-tech startup, a fluid-mechanics lab, a hospital and a medtech company.',
    link: { href: '/sections/masters.html', label: "Master's thesis: microwave ablation →" } },
  { city: 'toulouse', when: '2023–2026', place: 'Toulouse, France', title: 'PhD in medical imaging',
    text: 'At the IUCT Oncopole cancer institute: ground truth for PET/CT from 3D-printed phantoms and synthetic lesions.',
    link: { href: '/sections/research.html', label: 'The research, explained →' } },
];
const path = `<ol class="lk-tl ab-path lk-rv-g">${STOPS.map((s) => `<li class="ab-stop"><span class="lk-tl-dot" aria-hidden="true"></span>
  <time>${esc(s.when)} · ${esc(s.place)}</time><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
  ${roles(s.city)}<a class="ab-more" href="${esc(s.link.href)}">${esc(s.link.label)}</a></li>`).join('')}</ol>`;

const partners = profile.experience.flatMap((e) => e.partners || []);

const heroHtml = `<p class="lk-k">About</p>
  <h1>${esc(profile.displayName)}</h1>
  <p class="lk-lede">${esc(profile.headline)}. ${esc(profile.tagline)}</p>
  <p>${esc(profile.now)}</p>
  <div class="lk-btns">${btn({ href: '#path', label: 'Follow the path' })}${btn({ href: '/sections/contact.html', label: 'Get in touch', ghost: true })}</div>`;

const html = [
  hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.55 0.12 0.98 0.9', focusM: '0.04 0.08 0.96 0.94' }), html: heroHtml }),

  sec(stats([{ value: '3', label: 'countries' }, { value: '6', label: 'institutions' }, { value: '4', label: 'languages' }])),

  sec(`${head({ kicker: '2016 to now', title: 'The path, city by city', lede: 'Degrees and roles in order, from engineering in Hyderabad to a PhD in Toulouse.' })}${path}`, { id: 'path', wide: true }),

  sec(`${head({ kicker: 'PhD partners', title: 'Who the PhD worked with' })}
    ${grid(partners.map((p) => card({ html: `${logo(p.logo, p.name)}<h3 class="ab-pn">${esc(p.name)}</h3><p>${esc(p.note)}</p>` })), 'ab-partners')}`),

  band({
    stage: stage('next', { cls: 'ab-next', focus: '0.42 0.06 0.98 0.94', focusM: '0.04 0.06 0.96 0.94' }),
    over: `<p class="lk-k">Now · ${esc(profile.location)}</p><h2>What's next</h2>
      <p>Looking for roles where physics-grade imaging meets AI: industry R&amp;D, medtech, and research groups building simulation or generative models for PET/CT.</p>
      <h3>Open to</h3>${chips(profile.openTo)}`,
  }),

  cta({
    kicker: 'Next', title: "Let's talk", text: 'Research roles, industry R&D, medtech ventures, or a good conversation about PET and AI.',
    links: [{ href: '/sections/contact.html', label: 'Get in touch →' }, { href: '/sections/life.html', label: 'Off the clock: hobbies, games & life →', ghost: true }],
  }),
].join('');

mountPage({ active: 'about', html, stages: { hero: heroStage, next: nextStage } });

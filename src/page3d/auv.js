// Black Pearl (AUV MEC), on the layout kit: a hero with the vehicle swimming, the brief beside the rule-book
// envelope, the modified V-cycle as a wide 3D band with a step band, the design sections as alternating splits
// with their figures and tables, test results as stat strips and bar charts, the final vehicle, the team,
// and the team's videos and paper.
import { auv as A } from '../../content/academics.json';
import pubs from '../../content/publications.json';
import { mountPage, hero, split, band, sec, cta, head, stage, steps, grid, card, gallery, fig, stats, bars, acc, table, list, callout, btn, esc } from './layout.js';
import { heroStage, envelopeStage, vcycleStage, stabilityStage, finalStage, VNAMES } from './auv-scene.js';
import './auv.css';

const paper = pubs.find((p) => p.id === 'oceans2021');
const S = Object.fromEntries(A.steps.map((s, i) => [s.title, { ...s, i }]));
const N = A.steps.length;
const kick = (s) => `<p class="lk-k">${String(s.i + 1).padStart(2, '0')} of ${N} · ${esc(s.title)}</p>`;
const intro = (s, title = s.title) => `${kick(s)}<h2>${esc(title)}</h2><p class="lk-lede">${esc(s.eli5)}</p><p>${esc(s.text)}</p>`;
const more = (s, open = false) => (s.more.length ? acc([{ title: 'Know more', sub: `${s.more.length} details`, html: list(s.more), open }]) : '');
const figs = (s) => gallery(s.figures || [], 'auv', 'lk-one');

const brief = S['The brief'], vc = S['A modified V-cycle'], concept = S['Concept and layout'], mat = S['Materials and structure'],
  cfd = S['Hydrodynamics (CFD)'], stab = S['Stability and buoyancy'], fab = S['Fabrication and iteration'],
  test = S['Testing and thermal study'], grip = S['Gripper, vision and acoustics'], fin = S['The final vehicle'], team = S['Building the team'];

const heroHtml = `<p class="lk-k">Bachelor's · ${esc(A.team)} · ${esc(A.dates)}</p>
  <h1>${esc(A.title)}</h1>
  <p class="lk-lede">${esc(A.eli5)}</p>
  <p class="lk-meta">${esc(A.degree)}<br>${esc(A.competition)} · ${esc(A.role)}</p>
  <p class="lk-meta">${esc(A.report)}. Supervisor: ${esc(A.supervisor)}.</p>
  <div class="lk-btns">${btn({ href: '#watch', label: 'Watch the videos' })}${paper ? btn({ href: `https://doi.org/${paper.doi}`, label: 'Paper (OCEANS 2021) ↗', ghost: true, ext: true }) : ''}</div>`;

const html = [
  hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.55 0.16 0.97 0.88', focusM: '0.04 0.18 0.96 0.94' }), html: heroHtml }),

  split({ flip: true, text: `${intro(brief)}${list(brief.more)}`, media: stage('envelope', { focus: '0.06 0.12 0.94 0.94' }) }),

  band({
    cls: 'lk-over-t',
    stage: stage('vcycle', { cls: 'au-vband', focus: '0.4 0.1 0.97 0.92', focusM: '0.02 0.08 0.98 0.92' }),
    over: intro(vc),
    below: `${steps(VNAMES.map((title) => ({ title })), { id: 'vcycle', cls: 'au-vsteps' })}
      ${grid(vc.more.map((m, i) => card({ kicker: ['Rating', 'Threshold', 'Iterations'][i] || 'Note', text: m })), 'lk-g3 au-vcards')}`,
  }),

  split({ text: `${intro(concept)}${table(concept.table)}${more(concept)}`, media: figs(concept) }),

  split({
    flip: true,
    text: `${intro(mat)}${table(mat.table)}${more(mat)}`,
    media: `${figs(mat)}
      ${bars({ title: 'Beam deformation under the same load (L = 450 mm)', unit: 'mm', items: [{ label: 'Rectangular, 5 mm', value: 1.12 }, { label: 'Rectangular, 25 mm', value: 0.004 }, { label: 'T-slot extrusion', value: 0.02, mark: true }] })}
      ${bars({ title: 'Beam mass', unit: 'g', items: [{ label: 'Rectangular, 5 mm', value: 180 }, { label: 'Rectangular, 25 mm', value: 900 }, { label: 'T-slot extrusion', value: 334, mark: true }] })}`,
  }),

  split({
    text: `${intro(cfd)}${stats([{ value: '12.62', unit: 'N', label: 'Surge drag at 0.5 m/s' }, { value: '1.07', unit: '%', label: 'Sphere added-mass error' }, { value: '451,099', label: 'Mesh nodes (final)' }])}${table(cfd.table)}${more(cfd)}`,
    media: `${figs(cfd)}
      ${bars({ title: 'Added mass by direction', unit: 'kg', items: [{ label: 'Surge', value: 5.56 }, { label: 'Sway', value: 9.34, mark: true }, { label: 'Heave', value: 8.03 }] })}`,
  }),

  split({
    flip: true,
    text: `${intro(stab)}${stats([{ value: '45 → 30', unit: 'cm', label: 'Bottom hull shortened' }, { value: '5', unit: 'kg', label: 'Dead weights added' }, { value: '2.91', unit: '%', label: 'Final positive buoyancy' }])}${more(stab, true)}`,
    media: stage('stability', { focus: '0.04 0.08 0.76 0.92', focusM: '0.02 0.08 0.62 0.92' }),
  }),

  split({ text: `${intro(fab)}${table(fab.table)}${more(fab)}`, media: figs(fab) }),

  split({
    flip: true,
    text: `${intro(test)}${stats([{ value: '312', unit: 'K', label: 'Simulated peak (COMSOL)' }, { value: '353', unit: 'K', label: 'ESC failure temperature' }, { value: '1', unit: 'h', label: 'Full-load heat run' }])}${more(test)}`,
    media: `${figs(test)}
      ${bars({ title: 'Electronics temperature', unit: 'K', items: [{ label: 'Simulated peak', value: 312, mark: true }, { label: 'ESC failure', value: 353 }], note: 'The simulated peak stays 41 K below the point where the ESCs fail.' })}`,
  }),

  split({
    text: `${intro(grip)}${table(grip.table)}${more(grip)}`,
    media: `${figs(grip)}
      ${bars({ title: 'Object detection, time per frame', unit: 'ms', items: [{ label: '1920 × 1080', value: 215 }, { label: '640 × 360', value: 20, mark: true }] })}`,
  }),

  band({
    cls: 'lk-over-r',
    stage: stage('final', { focus: '0.04 0.1 0.6 0.92', focusM: '0.04 0.12 0.96 0.94' }),
    over: intro(fin),
    below: `${stats([{ value: '60 × 47 × 37.5', unit: 'cm', label: 'Size' }, { value: '20.6', unit: 'kg', label: 'Mass in air' }, { value: '2.91', unit: '%', label: 'Positive buoyancy' }, { value: '3–6', unit: '°', label: 'Pitch' }, { value: '5', unit: 'DOF', label: 'Active degrees of freedom' }])}
      <div class="au-final">${fig(brief.figures[0], 'auv')}<div class="lk-rv">${list(fin.more)}</div></div>`,
  }),

  sec(`${head({ kicker: `${String(team.i + 1).padStart(2, '0')} of ${N} · ${team.title}`, title: team.eli5, lede: team.text })}
    ${grid([...A.members.map((m) => card({ kicker: 'Team', title: m })), card({ kicker: 'Supervisor', title: A.supervisor })], 'au-team')}
    ${callout(`<p><b>Scope of the report</b></p><p>${esc(A.scope)}</p>`)}`, { cls: 'au-team-sec' }),

  sec(`${head({ kicker: 'Watch', title: 'Black Pearl in action' })}
    <div class="lk-grid au-videos lk-rv-g">${A.videos.map((v) => `<figure class="au-vid"><div class="lk-video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><figcaption>${esc(v.title)}</figcaption></figure>`).join('')}</div>`, { id: 'watch' }),

  paper ? cta({ kicker: 'Paper', title: paper.title, text: paper.venue, links: [{ href: `https://doi.org/${paper.doi}`, label: `doi.org/${paper.doi} ↗`, ext: true }, { href: '/sections/masters.html', label: "Master's thesis →", ghost: true }] }) : '',
].join('');

mountPage({
  active: 'auv',
  html,
  stages: { hero: heroStage, envelope: envelopeStage, vcycle: vcycleStage, stability: stabilityStage, final: finalStage },
});

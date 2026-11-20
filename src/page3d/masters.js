// Master's thesis, microwave ablation, on the layout kit: a hero with the growing ablation zone, the key
// numbers, the five parts as a step band, the problem beside a heat-sink stage, the radiometer beside its
// stage, the ex vivo burns as cards, the simulation as a wide band (liver vs lung), and the outcome.
import { masters as M } from '../../content/academics.json';
import { mountPage, hero, split, band, sec, cta, head, stage, steps, grid, card, stats, chips, acc, list, btn, esc } from './layout.js';
import { heroStage, sinkStage, radioStage, simStage } from './masters-scene.js';
import './masters.css';

const N = M.steps.length;
const [problem, radio, exvivo, sim, outcome] = M.steps;
const kick = (i) => `<p class="lk-k">Part ${i + 1} of ${N}</p>`;
const intro = (s, i) => `${kick(i)}<h2>${esc(s.title)}</h2><p class="lk-lede">${esc(s.eli5)}</p><p>${esc(s.text)}</p>`;
const more = (s, open = false) => (s.more.length ? acc([{ title: 'Know more', sub: `${s.more.length} details`, html: list(s.more), open }]) : '');

const heroHtml = `<p class="lk-k">Master's thesis · ${esc(M.dates)}</p>
  <h1>${esc(M.title)}</h1>
  <p class="lk-lede">${esc(M.eli5)}</p>
  <p class="lk-meta">${esc(M.degree)}<br>${esc(M.host)} · Advisor: ${esc(M.advisor)}</p>
  <p class="lk-meta">${esc(M.confidential)}</p>
  <div class="lk-btns">${btn({ href: '#parts', label: 'Follow the work' })}${btn({ href: '/sections/research.html', label: 'The PhD that followed →', ghost: true })}</div>`;

const tools = outcome.more[1].replace(/^Tools:\s*/, '').split(', ');
const exKick = ['Heat sinks', 'Contraction', 'Full size', 'Analysis'];

const html = [
  hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.5 0.14 0.98 0.9', focusM: '0.02 0.12 0.98 0.94' }), html: heroHtml }),

  sec(stats([
    { value: '2.45', unit: 'GHz', label: 'Antenna frequency' },
    { value: '>90', unit: '%', label: 'Size prediction ex vivo' },
    { value: '50–70', unit: '%', label: 'Size prediction in vivo' },
    { value: '30', label: 'Fixture simulations: 21 liver, 9 lung' },
  ])),

  sec(`${head({ kicker: 'The work', title: 'Five parts, from problem to outcome' })}
    ${steps(M.steps.map((s) => ({ title: s.title, text: s.eli5 })))}`, { id: 'parts' }),

  split({ text: `${intro(problem, 0)}${more(problem, true)}`, media: stage('sink', { focus: '0.03 0.06 0.84 0.94', focusM: '0.02 0.06 0.82 0.94' }) }),

  split({ flip: true, text: `${intro(radio, 1)}${more(radio)}`, media: stage('radio', { focus: '0.04 0.06 0.96 0.94' }) }),

  sec(`${head({ kicker: 'Part 3 of 5', title: exvivo.title, lede: exvivo.eli5 })}
    <p class="ms-lead lk-rv">${esc(exvivo.text)}</p>
    ${grid(exvivo.more.map((m, i) => card({ kicker: exKick[i] || 'Detail', text: m })), 'lk-g4 ms-ex')}`, { id: 'exvivo' }),

  band({
    cls: 'lk-over-r',
    stage: stage('sim', { cls: 'ms-sim', focus: '0.02 0.08 0.6 0.94', focusM: '0.02 0.06 0.98 0.94' }),
    over: `${intro(sim, 3)}`,
    below: more(sim, true),
  }),

  sec(`${head({ kicker: 'Part 5 of 5', title: outcome.title, lede: outcome.eli5 })}
    <p class="ms-lead lk-rv">${esc(outcome.text)}</p>
    ${grid([card({ kicker: 'Foundation', text: outcome.more[0] }), card({ kicker: 'Tools', html: chips(tools) })], 'ms-out')}`),

  cta({
    kicker: 'Next', title: 'From the startup to the PhD',
    text: 'The same habit of benchmarking simulation against measurement carries into the doctoral work on PET/CT.',
    links: [{ href: '/sections/research.html', label: 'The PhD research →' }, { href: '/sections/about.html', label: 'The full path', ghost: true }],
  }),
].join('');

mountPage({ active: 'masters', html, stages: { hero: heroStage, sink: sinkStage, radio: radioStage, sim: simStage } });

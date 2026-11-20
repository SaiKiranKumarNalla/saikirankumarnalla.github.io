// Agentic AI, on the layout kit: a hero with the shared agent loop, the four principles, each agent system as
// its own stage (wide bands and splits that alternate) with a step band that lights in sync, then the app
// screenshots, hierarchy and details beside it; toolbelt and roadmap; the AI certifications; a closing band.
import builder from '../../content/ai-builder.json';
import projects from '../../content/projects.json';
import { mountPage, hero, split, band, sec, cta, head, stage, steps, grid, card, gallery, chips, callout, list, acc, timeline, btn, esc } from './layout.js';
import { heroStage, kageStage, officeStage, animusStage, tenglishStage, logo } from './builder-scene.js';
import { certById, certCard } from './certs.js';
import './builder.css';

const builds = builder.builds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const explain = builder.explainers || {};
const N = builds.length;

const agents = (label, items) => `<ul class="bd-agents" aria-label="${esc(label)}">${items.map(([lg, t]) => `<li>${logo(lg)}${esc(t)}</li>`).join('')}</ul>`;
const tiers = (a) => `<ol class="bd-tiers lk-rv-g">${a.hierarchy.map((h) => `<li><span>${esc(h.level)}</span><b>${esc(h.who)}</b><p>${esc(h.does)}</p>${h.model ? `<em>${esc(h.model)}</em>` : ''}</li>`).join('')}</ol>`;
const AGENTS = {
  'kage-game': agents('Agents and tools', [['claude', 'Claude Code'], ['codex', 'Codex CLI'], ['antigravity', 'Antigravity'], ['meshy', 'Meshy AI'], ['blender', 'Blender']]),
  'tenglish-lm': agents('Languages and tools', [['python', 'Python'], ['jupyter', 'Jupyter'], ['colab', 'Google Colab'], ['ytdlp', 'yt-dlp'], ['pytorch', 'PyTorch']]),
};
const RELATED = {
  'tenglish-lm': `<a class="bd-gamelink" href="/sections/skills.html#certs"><div><span>Related certification</span><b>Google DeepMind: Small Language Models</b></div><em aria-hidden="true">→</em></a>`,
  'kage-game': `<a class="bd-gamelink" href="/sections/game.html"><div><span>Kage, the game</span><b>Gameplay, the world and footage</b></div><em aria-hidden="true">→</em></a>`,
};

const intro = (p, i) => `<p class="lk-k">System ${i + 1} of ${N} · ${esc(p.kind)}</p><h2>${esc(p.name)}</h2><p class="lk-lede">${esc(p.eli5 || '')}</p><p>${esc(p.summary)}</p>`;
const watch = (p) => (explain[p.id] ? callout(`<p class="bd-watch"><span>In the diagram</span>${esc(explain[p.id].watch)}</p>`) : '');
const stepBand = (p, id) => steps((explain[p.id]?.steps || []).map((title) => ({ title })), { id, cls: 'bd-steps' });

// Facts, tools, links and the problem / approach / status write-up.
const details = (p) => `${p.facts ? chips(p.facts) : ''}${AGENTS[p.id] || ''}
  ${p.links?.length ? `<div class="lk-btns">${p.links.map((l) => btn({ ...l, ghost: true, ext: true, label: `${l.label} ↗` })).join('')}</div>` : ''}
  ${p.id === 'tenglish-lm' && p.note ? `<p class="lk-meta">${esc(p.note)}</p>` : ''}${RELATED[p.id] || ''}
  ${p.more ? acc([{ title: 'Know more', sub: 'problem, approach, status', open: true,
    html: `<h3>The problem</h3><p>${esc(p.more.problem)}</p><h3>How it works</h3>${list(p.more.approach)}<h3>Status</h3>${list(p.more.status)}
      ${p.stack ? `<h3>Built with</h3>${chips(p.stack)}` : ''}${p.note && p.id !== 'tenglish-lm' ? `<p class="lk-meta">${esc(p.note)}</p>` : ''}` }]) : ''}`;

// App screenshots, then the hierarchy and how it is deployed and safeguarded.
const build = (p) => {
  const a = p.architecture;
  if (!a) return '';
  const figs = a.figures || [];
  return `${figs.length ? gallery(figs.map((f) => ({ src: f.src, caption: f.caption })), `app-${p.id}`, 'lk-one') : ''}
    <div class="lk-rv"><p class="lk-k bd-sub">How it is built</p><h3>Hierarchy</h3></div>${tiers(a)}
    ${acc([{ title: 'Deployment', html: list(a.deployment) }, { title: 'Safeguards', html: list(a.safeguards) }])}`;
};
const detailSplit = (p, flip) => split({ flip, text: `<p class="lk-k">${esc(p.name)} · details</p>${details(p)}`, media: build(p), cls: 'bd-detail' });

const P = Object.fromEntries(builds.map((p) => [p.id, p]));
const idx = (id) => builds.findIndex((b) => b.id === id);
const sysHtml = [];
if (P['kage-game']) {
  const p = P['kage-game'];
  sysHtml.push(
    band({ id: 'kage', stage: stage('kage', { focus: '0.4 0.06 0.99 0.94', focusM: '0.01 0.03 0.99 0.98' }), over: intro(p, idx(p.id)), below: `${watch(p)}${stepBand(p, 'kage')}` }),
    detailSplit(p, false),
  );
}
if (P['veritomix-office']) {
  const p = P['veritomix-office'];
  sysHtml.push(
    split({ id: 'office', flip: true, cls: 'bd-sys', text: `${intro(p, idx(p.id))}${watch(p)}`, media: stage('office', { cls: 'lk-tall', focus: '0.02 0.03 0.98 0.97', focusM: '0.0 0.03 1 0.97' }) }),
    sec(stepBand(p, 'office'), { cls: 'bd-stepsec' }),
    detailSplit(p, false),
  );
}
if (P.animus) {
  const p = P.animus;
  sysHtml.push(
    band({ id: 'animus', cls: 'lk-over-r', stage: stage('animus', { focus: '0.01 0.05 0.6 0.96', focusM: '0.0 0.03 1 0.97' }), over: intro(p, idx(p.id)), below: `${watch(p)}${stepBand(p, 'animus')}` }),
    detailSplit(p, true),
  );
}
if (P['tenglish-lm']) {
  const p = P['tenglish-lm'];
  sysHtml.push(
    sec(`<div class="lk-sh lk-rv">${intro(p, idx(p.id))}</div>${stage('tenglish', { focus: '0.02 0.04 0.98 0.96', focusM: '0.0 0.04 1 0.96' })}
      <div class="lk-below">${watch(p)}${stepBand(p, 'tenglish')}</div>`, { id: 'tenglish', wide: true }),
    detailSplit(p, true),
  );
}

const heroHtml = `<p class="lk-k">Agentic AI</p>
  <h1>${esc(builder.headline)}</h1>
  <p class="lk-lede">Agents do the work; I hold the gates. Every system here runs the same loop: written rules, agents that propose, evidence that is logged, and a person who accepts or sends the work back.</p>
  <div class="lk-btns">${btn({ href: '#kage', label: `See ${N} systems at work` })}${btn({ href: '#certs', label: 'AI certifications', ghost: true })}</div>`;

const principles = sec(`${head({ kicker: 'How I work', title: 'Four rules behind every system' })}
  ${grid(builder.principles.map((p, i) => card({ kicker: String(i + 1).padStart(2, '0'), title: p.title, text: p.text })), 'lk-g4')}`);

const systemsHead = sec(head({ kicker: `${N} systems`, title: 'Agents at work', lede: 'Each diagram plays one real loop from start to finish. The steps under it light up as it runs.' }), { cls: 'bd-sys-head' });

const bench = split({
  flip: true,
  text: `<p class="lk-k">Toolbelt</p><h2>What the agents run on</h2>${chips(builder.stack)}
    ${builder.learning ? callout(`<p><b>${esc(builder.learning.repo)}</b></p><p>${esc(builder.learning.text)}</p>`) : ''}`,
  media: `<div class="lk-rv"><p class="lk-k">Next on the bench</p></div>${timeline(builder.roadmap.map((title, i) => ({ when: ['Next', 'Then', 'Later'][i] || `Step ${i + 1}`, title })))}`,
});

const certs = sec(`${head({ kicker: 'Certifications', title: 'AI certifications', lede: 'Formal training behind the agent work.' })}
  <div class="bd-certs lk-rv">${`<div class="ct-grid">${certById(['claude-fluency', 'gcloud-agents', 'deepmind-slm']).map(certCard).join('')}</div>`}</div>
  <p class="bd-more lk-rv"><a href="/sections/skills.html#certs">All certifications →</a></p>`, { id: 'certs' });

const closing = cta({
  kicker: 'Next', title: 'Agents propose, I decide', text: 'See what these systems helped build.',
  links: [{ href: '/sections/projects.html', label: 'Projects →' }, { href: '/sections/game.html', label: 'Kage, the game →', ghost: true }],
});

mountPage({
  active: 'builder',
  html: hero({ stage: stage('hero', { cls: 'lk-bleed', focus: '0.46 0.12 1 0.92', focusM: '0.02 0.1 0.98 0.96' }), html: heroHtml })
    + principles + systemsHead + sysHtml.join('') + bench + certs + closing,
  stages: { hero: heroStage, kage: kageStage, office: officeStage, animus: animusStage, tenglish: tenglishStage },
});

// Content panels for the 3D home. Everything is rendered from content/*.json.
import profile from '../../content/profile.json';
import pubs from '../../content/publications.json';
import thesis from '../../content/thesis.json';
import projects from '../../content/projects.json';
import repos from '../../content/repos.json';
import builder from '../../content/ai-builder.json';
import music from '../../content/music.json';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chips = (arr) => (arr?.length ? `<div class="p-chips">${arr.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : '');
const more = (href, text) => `<a class="p-more" href="${href}">${text} <span aria-hidden="true">→</span></a>`;

const STATUS = {
  published: 'Published', preprint: 'Preprint', conference: 'Conference', 'in-preparation': 'In preparation',
  active: 'Active', concept: 'Concept', 'coming-soon': 'Public soon', done: 'Completed', 'published-preprint': 'Preprint',
};

function pubItem(p) {
  const link = p.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi.org/${esc(p.doi)}</a>` : '';
  return `<li class="p-pub">
    <span class="p-badge p-${esc(p.status)}">${STATUS[p.status] || esc(p.status)}</span>
    <h4>${esc(p.title)}</h4>
    <p class="p-meta">${esc(p.venue)} · ${esc(p.year)} ${link ? `· ${link}` : ''}</p>
  </li>`;
}

export const PANELS = {
  kagegame: {
    title: 'Kage',
    kicker: "The village guide · Sai's samurai game",
    html: () => `
      <p class="p-lede"><strong>Kage</strong> (<span lang="ja">影</span>, "shadow") is the guide who walks you through this village. He is also the hero of a samurai action-adventure game Sai is building.</p>
      <div class="p-feature">
        <span class="p-feature-kicker">Game in development</span>
        <b>Kage: a samurai action-adventure</b>
        <p>Set across feudal Japan and cyberspace, where traditional swordplay meets AI-driven mechanics. Built in Godot 4 with a multi-agent development crew.</p>
        <a class="p-feature-btn" href="/sections/game.html">Open the game page <span aria-hidden="true">→</span></a>
      </div>
      <h3>The guide</h3>
      <p>Inspired by <em>Ghost of Tsushima</em>, Kage carries a katana to cut through confusion, not people. Whether you are a researcher, a recruiter or just wandering, he takes you to the right building.</p>
      <div class="p-actions">${more('/sections/game.html', 'Game showcase and gameplay reel')}</div>`,
  },
  about: {
    title: 'About',
    kicker: 'Medical imaging scientist · AI builder',
    html: () => `
      <p class="p-lede">${esc(profile.tagline)}</p>
      <p>${esc(profile.now)}</p>
      <h3>Experience</h3>
      <ol class="p-timeline">${profile.experience.map((e) => `<li><b>${esc(e.role)}</b>, ${esc(e.org)} <span class="p-meta">${esc(e.years)}</span></li>`).join('')}</ol>
      <h3>Education</h3>
      <ol class="p-timeline">${profile.education.map((e) => `<li><b>${esc(e.degree)}</b>, ${esc(e.school)} <span class="p-meta">${esc(e.years)} · ${esc(e.note)}</span></li>`).join('')}</ol>
      <h3>Programmes</h3>${chips(profile.programmes)}
      <h3>Languages</h3>${chips(profile.languages)}
      <div class="p-actions">${more('/sections/about.html', 'Full story')}</div>`,
  },
  research: {
    title: 'PhD Thesis',
    kicker: 'PhD · Université de Toulouse · 2023–2026',
    html: () => `
      <h3 class="p-first">${esc(thesis.title)}</h3>
      <p class="p-meta">${thesis.labs.map(esc).join(' · ')} · Supervised by ${thesis.supervisors.map(esc).join(' & ')}</p>
      <div class="p-eli5"><span>In one breath</span>${esc(thesis.eli5)}</div>
      <ol class="p-steps">${thesis.chapters.filter((c) => c.n > 0).map((c) => `<li><b>${esc(c.title)}</b><p>${esc(c.detail)}</p></li>`).join('')}</ol>
      <p class="p-lede">${esc(thesis.takeaway)}</p>
      <h3>Now</h3>
      <p>${esc(projects.find((p) => p.id === 'virtualpet').summary)}</p>
      <div class="p-actions">${more('/sections/research.html', 'The PhD, step by step')}${more('/sections/masters.html', "Master's thesis: microwave ablation")}${more('/sections/auv.html', "Bachelor's: Black Pearl AUV")}</div>`,
  },
  projects: {
    title: 'Projects',
    kicker: 'Projects & repos',
    html: () => repos.map((p) => `
      <a class="p-card p-card-link" href="/sections/projects.html#${esc(p.id)}">
        <div class="p-card-top"><span class="p-kind">${esc(p.kind)}</span><span class="p-meta">${esc(p.years)}</span></div>
        <h4>${esc(p.name)}</h4>
        <p>${esc(p.eli5)}</p>
      </a>`).join('') + `<div class="p-actions">${more('/sections/projects.html', 'Explore all projects in 3D')}${more('/sections/builder.html', 'AI agent systems: Agentic AI')}</div>`,
  },
  publications: {
    title: 'Publications',
    kicker: `${pubs.filter((p) => p.status === 'published').length} published · ${pubs.filter((p) => p.status === 'preprint').length} preprints · ${pubs.filter((p) => p.status === 'conference').length} conference`,
    html: () => ['published', 'preprint', 'in-preparation', 'conference'].map((s) => {
      const list = pubs.filter((p) => p.status === s).sort((a, b) => b.year - a.year);
      return list.length ? `<h3>${STATUS[s]}</h3><ul class="p-pubs">${list.map(pubItem).join('')}</ul>` : '';
    }).join('') + `<div class="p-actions">${more('/sections/publications.html', 'All publications')}</div>`,
  },
  builder: {
    title: 'Agentic AI',
    kicker: builder.headline,
    html: () => `
      <p class="p-lede">AI agent systems I designed and run: Kage's multi-agent development crew, VeriTomiX Office, and ANIMUS Jobs.</p>
      <div class="p-feature">
        <span class="p-feature-kicker">Case study</span>
        <b>Kage: the samurai game</b>
        <p>Built with an autonomous multi-agent crew (Claude Code, Codex, Antigravity) running worktree tasks and cross-agent peer reviews.</p>
        <a class="p-feature-link" href="/sections/game.html">Game showcase and gameplay video <span aria-hidden="true">→</span></a>
      </div>
      <h3>Toolbelt</h3>${chips(builder.stack)}
      <h3>Next on the bench</h3><ul class="p-list">${builder.roadmap.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      <div class="p-actions">${more('/sections/builder.html', 'How I build with agents')}</div>`,
  },
  contact: {
    title: 'Contact',
    kicker: `Based in ${profile.location} · open to ${profile.openTo.join(', ')}`,
    html: () => `
      <p class="p-lede">Research roles, industry R&amp;D, medtech ventures, or a good conversation about PET and AI: I'd like to hear from you.</p>
      <ul class="p-contact">
        <li><span>Email</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>
        <li><span>LinkedIn</span><a href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">sai-kiran-kumar-nalla</a></li>
        <li><span>GitHub</span><a href="${esc(profile.links.github)}" target="_blank" rel="noopener">SaiKiranKumarNalla</a></li>
        <li><span>CV</span><a href="${esc(profile.links.cv)}" target="_blank" rel="noopener">Download (PDF)</a></li>
      </ul>
      <div class="p-actions">${more('kage.html', 'Or ask Kage, my AI assistant')}${more('recruiter.html', 'Recruiter mode')}${more('/sections/contact.html', 'Contact page')}</div>`,
  },
  life: {
    title: 'Off the Clock',
    kicker: 'Travel · Fragrantmash Creative Studio',
    html: () => `
      <p class="p-lede">Outside the lab: 12 countries explored, and <strong>Fragrantmash Creative Studio</strong>, home to my Google Flow music, comics and visual fiction, and the samurai game <em>Kage</em>.</p>
      <div class="p-feature">
        <span class="p-feature-kicker">Fragrantmash Studio</span>
        <b>Music · comics · games</b>
        <p>Original tracks (Shāpanang and Up There), serialized visual fiction, and playable game worlds.</p>
        <div class="p-feature-row">
          <a class="p-feature-btn" href="/sections/life.html">Open the studio <span aria-hidden="true">→</span></a>
          <a class="p-feature-btn p-ghost" href="/sections/game.html">Kage: the game <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <h3>Creative tracks and hobbies</h3>
      ${chips(['Google Flow music', 'Comics', 'Game development', 'Solo travel', 'Strategy games'])}
      <div class="p-actions">${more('/sections/life.html', 'Off the Clock: travel globe and studio')}</div>`,
  },
  music: {
    title: 'Music',
    kicker: 'Off the clock',
    html: () => `
      <p class="p-lede">${esc(music.intro)}</p>
      <ul class="p-contact">${music.playlists.map((p, i) => `<li><span>Playlist ${i + 1}</span><a href="${esc(p.url)}" target="_blank" rel="noopener">Listen on Flow Music</a></li>`).join('')}</ul>
      ${chips(music.featured)}
      <div class="p-actions">${more('/sections/life.html', 'Off the clock: travel, fiction, music and games')}</div>`,
  },
};

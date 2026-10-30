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
  about: {
    title: 'About',
    kicker: 'Medical imaging scientist · AI builder',
    html: () => `
      <p class="p-lede">${esc(profile.tagline)}</p>
      <p>${esc(profile.now)}</p>
      <h3>Programmes</h3>${chips(profile.programmes)}
      <h3>Languages</h3>${chips(profile.languages)}
      <div class="p-actions">${more('/about', 'Full story')}</div>`,
  },
  experience: {
    title: 'Experience',
    kicker: 'Research, hospital and industry',
    html: () => `
      <ol class="p-timeline">${profile.experience.map((e) => `<li><b>${esc(e.role)}</b>, ${esc(e.org)} <span class="p-meta">${esc(e.years)}</span><p>${esc(e.points[0])}</p></li>`).join('')}</ol>
      <div class="p-actions">${more('/experience', 'Full experience')}</div>`,
  },
  education: {
    title: 'Education',
    kicker: 'PhD · Master\'s · Bachelor\'s',
    html: () => `
      <ol class="p-timeline">${profile.education.map((e) => `<li><b>${esc(e.degree)}</b>, ${esc(e.school)} <span class="p-meta">${esc(e.years)} · ${esc(e.note)}</span></li>`).join('')}</ol>
      <h3>PhD thesis</h3>
      <p><b>${esc(thesis.title)}</b></p>
      <div class="p-eli5"><span>In one breath</span>${esc(thesis.eli5)}</div>
      <div class="p-actions">${more('/education', 'Full education')}</div>`,
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
      <div class="p-actions">${more('/education', 'The PhD, step by step')}${more('/education', "Master's thesis: microwave ablation")}${more('/education', "Bachelor's: Black Pearl AUV")}</div>`,
  },
  projects: {
    title: 'Projects',
    kicker: 'Projects & repos',
    html: () => repos.map((p) => `
      <a class="p-card p-card-link" href="/projects">
        <div class="p-card-top"><span class="p-kind">${esc(p.kind)}</span><span class="p-meta">${esc(p.years)}</span></div>
        <h4>${esc(p.name)}</h4>
        <p>${esc(p.eli5)}</p>
      </a>`).join('') + `<div class="p-actions">${more('/projects', 'Explore all projects in 3D')}</div>`,
  },
  publications: {
    title: 'Publications',
    kicker: `${pubs.filter((p) => p.status === 'published').length} published · ${pubs.filter((p) => p.status === 'preprint').length} preprints · ${pubs.filter((p) => p.status === 'conference').length} conference`,
    html: () => ['published', 'preprint', 'in-preparation', 'conference'].map((s) => {
      const list = pubs.filter((p) => p.status === s).sort((a, b) => b.year - a.year);
      return list.length ? `<h3>${STATUS[s]}</h3><ul class="p-pubs">${list.map(pubItem).join('')}</ul>` : '';
    }).join('') + `<div class="p-actions">${more('/papers', 'All publications')}</div>`,
  },
  builder: {
    title: 'Agentic AI',
    kicker: builder.headline,
    html: () => `
      <p class="p-lede">AI agent systems I designed and run: VeriTomiX Office, a company of AI department heads, and ANIMUS Jobs, a verified career agent.</p>
      <h3>Toolbelt</h3>${chips(builder.stack)}
      <h3>Next on the bench</h3><ul class="p-list">${builder.roadmap.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      <div class="p-actions">${more('/experience', 'Career path')}</div>`,
  },
  contact: {
    title: 'Reach Out',
    kicker: `Based in ${profile.location} · open to ${profile.openTo.join(', ')}`,
    html: () => `
      <p class="p-lede">Research roles, industry R&amp;D, medtech ventures, or a good conversation about PET and AI: I'd like to hear from you.</p>
      <ul class="p-contact">
        <li><span>Email</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>
        <li><span>LinkedIn</span><a href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">sai-kiran-kumar-nalla</a></li>
        <li><span>GitHub</span><a href="${esc(profile.links.github)}" target="_blank" rel="noopener">SaiKiranKumarNalla</a></li>
        <li><span>CV</span><a href="${esc(profile.links.cv)}" target="_blank" rel="noopener">Download (PDF)</a></li>
      </ul>
      <div class="p-actions">${more('/kage', 'Or ask Kage, my AI assistant')}${more('/recruiter', 'Recruiter mode')}${more('/contact', 'Contact page')}</div>`,
  },
  life: {
    title: 'Off the Clock',
    kicker: 'Travel · fiction · music · games',
    html: () => `<p class="p-lede">Outside the lab: 12 countries, three stories, two playlists and a shelf of strategy games.</p>
      <div class="p-actions">${more('/about', 'Explore Off the Clock')}</div>`,
  },
  music: {
    title: 'Music',
    kicker: 'Off the clock',
    html: () => `
      <p class="p-lede">${esc(music.intro)}</p>
      <ul class="p-contact">${music.playlists.map((p, i) => `<li><span>Playlist ${i + 1}</span><a href="${esc(p.url)}" target="_blank" rel="noopener">Listen on Flow Music</a></li>`).join('')}</ul>
      ${chips(music.featured)}
      <div class="p-actions">${more('/about', 'Off the clock: travel, fiction, music and games')}</div>`,
  },
};

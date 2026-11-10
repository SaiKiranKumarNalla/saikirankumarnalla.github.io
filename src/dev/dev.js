import './dev.css';
import profile from '../../content/profile.json';
import repos from '../../content/repos.json';
import skillsData from '../../content/skills.json';
import pubs from '../../content/publications.json';
import metrics from '../../content/research-metrics.json';
import vtx from '../../content/veritomix.json';
import certData from '../../content/certifications.json';
import { initGithub, getCommits } from './github.js';

const PROXY_URL = 'https://kage-proxy.kage-proxy.workers.dev';
const REPO_URL = 'https://github.com/SaiKiranKumarNalla/saikirankumarnalla.github.io';

const PROMPT = 'sai@portfolio:~$';
const GITHUB = profile.links.github;
const LINKEDIN = profile.links.linkedin;
const CV = '/Assets/Sai_Nalla_CV.pdf';
const OPEN_EXTRA = { home: '/', recruiter: '/recruiter.html', dev: '/dev.html' };
const SECTIONS = ['about', 'auv', 'builder', 'contact', 'game', 'inventory', 'life', 'masters', 'projects', 'publications', 'research', 'skills', 'veritomix'];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const out = document.getElementById('dvOut');
const screen = document.getElementById('dvScreen');
const input = document.getElementById('dvInput');
const form = document.getElementById('dvForm');

// ---- rendering: every string goes through textContent ----
// A line is a string, {t, href, cls}, or an array of those (segments).
function seg(s) {
  if (typeof s === 'string') return document.createTextNode(s);
  const safe = s.href && (/^https:\/\//.test(s.href) || s.href.startsWith('/') || s.href.startsWith('mailto:'));
  const n = document.createElement(safe ? 'a' : 'span');
  n.textContent = s.t;
  if (s.cls) n.className = s.cls;
  if (safe) {
    n.href = s.href;
    if (/^https:\/\//.test(s.href)) { n.target = '_blank'; n.rel = 'noopener'; }
  }
  return n;
}
function print(line) {
  const d = document.createElement('div');
  d.className = 'dv-ln';
  if (Array.isArray(line)) line.forEach((s) => d.append(seg(s)));
  else d.append(seg(line));
  out.append(d);
}
const printAll = (lines) => lines.forEach(print);
const echo = (cmd) => {
  const d = document.createElement('div');
  d.className = 'dv-ln dv-echo';
  const p = document.createElement('span'); p.className = 'dv-p'; p.textContent = PROMPT + ' ';
  d.append(p, document.createTextNode(cmd));
  out.append(d);
};
const toBottom = () => { screen.scrollTop = screen.scrollHeight; };
const H = (t) => ({ t, cls: 'k h' });
const M = (t) => ({ t, cls: 'm' });
const pad = (s, n) => String(s).padEnd(n, ' ');

// ---- data helpers ----
const NOW = skillsData.now;
function years(s) {
  if (s.periods) return s.periods.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(', ');
  if (s.since) return s.until ? `${s.since}-${s.until}` : `${s.since}-now`;
  return 'planned';
}
function span(s) {
  const ps = s.periods || (s.since ? [[s.since, s.until || NOW]] : []);
  const n = ps.reduce((t, [a, b]) => t + Math.max(1, b - a), 0);
  return n ? `~${n}y` : '';
}
const domainName = Object.fromEntries(skillsData.domains.map((d) => [d.id, d.name]));
const findRepo = (id) => repos.find((r) => r.id === id.toLowerCase());
const findPub = (id) => pubs.find((p) => p.id === id.toLowerCase());

const MAN = {
  help: ['help [command]', 'List all commands by category. With a command name, shows its manual.'],
  whoami: ['whoami', 'Short introduction: name, role, location and current focus.'],
  about: ['about', 'Background, current work and education.'],
  neofetch: ['neofetch', 'A compact profile card: role, PhD, languages, tools with years and uptime (years since the first project).'],
  timeline: ['timeline', 'Education and experience in chronological order, from content/profile.json.'],
  ls: ['ls [projects|sections|papers]', 'List projects/, sections/ or papers/. Without an argument lists the top-level directories.'],
  cat: ['cat <project-id|paper-id>', 'Show full details for a project or a paper. Use ls projects or ls papers for ids.'],
  projects: ['projects', 'All projects with years and kind.'],
  skills: ['skills [tools|competencies]', 'Skills grouped by domain, with years (since/until/periods), an approximate total and learning state.'],
  stack: ['stack', 'The technology behind this site: Vite, Three.js, GitHub Pages and Actions, Cloudflare Worker, Gemini / Workers AI.'],
  tree: ['tree', 'Site map of pages and sections.'],
  grep: ['grep <term>', 'Case-insensitive search across projects, skills, certifications and papers. Prints where each match lives.'],
  certs: ['certs', 'Certifications and training: title, issuer, date and a verify link where one exists. Badge tracks list their badges.'],
  pubs: ['pubs', 'Publications with venue and status, plus Google Scholar and ResearchGate metrics.'],
  veritomix: ['veritomix', 'The VeriTomiX mission and team.'],
  cv: ['cv', 'Open the CV (PDF) in a new tab.'],
  github: ['github', 'Open the GitHub profile.'],
  linkedin: ['linkedin', 'Open the LinkedIn profile.'],
  contact: ['contact', 'Email, GitHub, LinkedIn and location.'],
  open: ['open <page>', 'Navigate to a section page, or to home, recruiter or dev.'],
  ask: ['ask <question>', 'Ask Kage, the AI assistant, through the same Cloudflare Worker the site uses. Answers come back as plain text.'],
  git: ['git log | git status', 'log shows the 10 latest commits of this site (GitHub API, cached 1 hour). status is a joke with an honest footnote.'],
  sudo: ['sudo hire sai', 'Prints contact options.'],
  history: ['history', 'Commands entered in this session.'],
  date: ['date', 'Current date and time.'],
  echo: ['echo [text]', 'Print text.'],
  theme: ['theme [dark|light]', 'Switch the colour theme. The choice is remembered.'],
  layout: ['layout [terminal|split]', 'Hide or show the GitHub panel. The choice is remembered.'],
  clear: ['clear', 'Clear the screen (also Ctrl+L).'],
  exit: ['exit', 'Return to the home page.'],
  man: ['man <command>', 'Show a manual page.'],
};

// ---- commands ----
const commands = {
  help(args) {
    if (args && args[0]) return commands.man(args);
    const cats = [
      ['About me', [['whoami', 'who I am'], ['about', 'background and focus'], ['neofetch', 'profile card'], ['timeline', 'career timeline'], ['contact', 'contact options'], ['cv', 'open the CV (PDF)']]],
      ['Work', [['projects', 'all projects'], ['cat <id>', 'project or paper details'], ['skills [tools|competencies]', 'skills with years'], ['certs', 'certifications and training'], ['pubs', 'publications and metrics'], ['veritomix', 'the VeriTomiX mission'], ['grep <term>', 'search everything']]],
      ['This site', [['stack', 'how it is built'], ['tree', 'site map'], ['git log | git status', 'repository'], ['ls [projects|sections|papers]', 'list things'], ['open <page>', 'go to a page'], ['github | linkedin', 'links']]],
      ['Talk', [['ask <question>', 'ask Kage, the AI assistant'], ['sudo hire sai', 'try it']]],
      ['Shell', [['man <command>', 'manual page'], ['history | date | echo', 'the usual'], ['theme [dark|light]', 'switch theme'], ['layout [terminal|split]', 'toggle the GitHub panel'], ['clear | exit', 'clear / go home']]],
    ];
    const lines = [];
    cats.forEach(([n, rows]) => lines.push('', H(n), ...rows.map(([c, d]) => [{ t: pad(c, 32), cls: 'ok' }, d])));
    printAll([...lines, '', M('Tab completes, Up/Down recalls history, man <command> for details.')]);
  },
  whoami() {
    printAll([
      [{ t: profile.displayName, cls: 'h' }],
      profile.headline, M(profile.tagline), '',
      [M('location  '), `${profile.location} (open to ${profile.openTo.join(', ')})`],
      [M('now       '), profile.now],
    ]);
  },
  about() {
    printAll([H('About'), profile.tagline, '', [M('Now: '), profile.now], '', H('Education'),
      ...profile.education.map((e) => `${pad(e.years, 10)} ${e.degree}, ${e.school}`),
      '', M('More: open about')]);
  },
  ls(args) {
    const t = (args[0] || '').replace(/\/$/, '');
    if (!t) return print('projects/  sections/  papers/');
    if (t === 'projects') return printAll(repos.map((r) => `${pad(r.id, 12)} ${r.name}`));
    if (t === 'sections') return print(SECTIONS.join('  '));
    if (t === 'papers') return printAll(pubs.map((p) => `${pad(p.id, 12)} ${p.year}  ${p.title.slice(0, 70)}`));
    print(`ls: cannot access '${t}': No such directory`);
  },
  cat(args) {
    const id = args[0];
    if (!id) return print('usage: cat <project-id|paper-id>   (try: ls projects)');
    const r = findRepo(id);
    if (r) {
      const lines = [H(r.name), M(`${r.kind} · ${r.years} · ${r.context}`), '', r.summary, ''];
      if (r.eli5) lines.push([M('In short: '), r.eli5], '');
      const m = r.more;
      if (m) {
        if (m.problem) lines.push(H('Problem'), m.problem, '');
        if (m.approach) lines.push(H('Approach'), ...m.approach.map((a) => `- ${a}`), '');
        if (m.outcome) lines.push(H('Outcome'), ...m.outcome.map((a) => `- ${a}`), '');
      }
      if (r.stack) lines.push([M('stack: '), r.stack.join(', ')]);
      (r.links || []).forEach((l) => lines.push(l.href ? [M(`${l.label}: `), { t: l.href, href: l.href }] : [M(`${l.label}: `), l.status || 'n/a']));
      return printAll(lines);
    }
    const p = findPub(id);
    if (p) {
      return printAll([H(p.title), M(`${p.venue} · ${p.year} · ${p.status}`), '', p.summary, '',
        [M('tags: '), p.tags.join(', ')], p.doi ? [M('doi:  '), { t: p.doi, href: `https://doi.org/${p.doi}` }] : '']);
    }
    print(`cat: ${id.slice(0, 40)}: No such file`);
  },
  projects() {
    printAll([H('Projects'), ...repos.map((r) => [{ t: pad(r.id, 11), cls: 'ok' }, `${pad(r.years, 10)} ${r.name}`, M(`  ${r.kind}`)]), M('cat <id> for details.')]);
  },
  skills(args) {
    const a = (args[0] || '').toLowerCase();
    const kind = a.startsWith('tool') ? 'tool' : a.startsWith('comp') ? 'competency' : '';
    if (a && !kind) return print('usage: skills [tools|competencies]');
    const list = skillsData.skills.filter((s) => !kind || s.kind === kind);
    const lines = [];
    for (const d of skillsData.domains) {
      const items = list.filter((s) => s.domain === d.id);
      if (!items.length) continue;
      lines.push('', H(d.name));
      items.forEach((s) => {
        const st = s.state === 'learnt' ? '' : s.state;
        lines.push([{ t: pad(s.short || s.name, 26), cls: 'ok' }, pad(years(s), 18), M(pad(span(s), 6)), st ? { t: st, cls: 'w' } : '']);
      });
    }
    printAll([...(kind ? [] : [M('Showing tools and competencies. Filter with: skills tools | skills competencies')]), ...lines]);
  },
  stack() {
    printAll([H('This site'),
      [M('build      '), 'Vite, multi-page (no SPA router), plain JS modules'],
      [M('3D         '), 'Three.js village on the home page and section pages'],
      [M('content    '), 'JSON files in content/ rendered by page scripts'],
      [M('hosting    '), 'GitHub Pages, deployed by GitHub Actions on push to main'],
      [M('assistant  '), 'Kage chat -> Cloudflare Worker -> Gemini / Workers AI (no keys in the client)'],
      [M('source     '), { t: 'github.com/SaiKiranKumarNalla/saikirankumarnalla.github.io', href: 'https://github.com/SaiKiranKumarNalla/saikirankumarnalla.github.io' }]]);
  },
  pubs() {
    const g = metrics.googleScholar, rg = metrics.researchGate;
    printAll([H('Publications'), ...pubs.map((p) => [{ t: pad(p.year, 6), cls: 'ok' }, `${p.title}`, M(` (${p.venue}, ${p.status})`)]),
      '', H(`Metrics (updated ${metrics.updated})`),
      `Google Scholar: ${g.citations} citations, h-index ${g.hIndex}, i10 ${g.i10Index}`,
      `ResearchGate: ${rg.reads} reads, ${rg.citations} citations`,
      [{ t: 'Google Scholar profile', href: g.profile }]]);
  },
  veritomix() {
    printAll([H(`${vtx.name}: ${vtx.tagline}`), vtx.mission, '', [M('status: '), vtx.status],
      ...vtx.team.map((m) => [M('team:   '), `${m.name}, ${m.role}`]), '', M('More: open veritomix')]);
  },
  cv() {
    print([M('Opening '), { t: CV, href: CV }, M(' ...')]);
    window.open(CV, '_blank', 'noopener');
  },

  neofetch() {
    const ed = profile.education[0];
    const first = Math.min(...skillsData.skills.map((x) => x.since || 9999), 2016);
    const tools = skillsData.skills.filter((x) => x.kind === 'tool' && x.state === 'learnt' && !x.until && x.since)
      .sort((a, b) => a.since - b.since).slice(0, 5).map((x) => `${x.short || x.name} ${x.since}-now`);
    const art = ['  ____  _  ', ' / ___|| | ', ' \\___ \\| |/', '  ___) |   <', ' |____/|_|\\_\\'];
    const info = [
      ['sai', `@${'portfolio'}`], ['---', ''], ['Name', profile.displayName], ['Role', profile.headline],
      ['Location', profile.location], ['PhD', `${ed.degree.replace('PhD, ', '')} (${ed.years})`],
      ['Languages', 'Python, MATLAB, JavaScript, CUDA'], ['Tools', tools.join(', ')],
      ['Uptime', `${NOW - first} years since first project (${first})`], ['Spoken', profile.languages.join(', ')],
    ];
    printAll(info.map(([k, v], i) => [{ t: pad(art[i] || '', 14), cls: 'k' }, k === 'sai' ? { t: 'sai', cls: 'ok h' } : { t: pad(k, 10), cls: 'ok' }, k === 'sai' ? { t: v, cls: 'h' } : v]));
  },
  timeline() {
    const items = [
      ...profile.education.map((e) => ({ s: e.start, y: e.years, t: e.degree, o: e.school, k: 'edu' })),
      ...profile.experience.map((e) => ({ s: e.start, y: e.years, t: e.role, o: e.org, k: 'work' })),
    ].sort((a, b) => a.s.localeCompare(b.s));
    printAll([H('Timeline'), ...items.map((i) => [{ t: pad(i.y, 11), cls: 'ok' }, { t: pad(i.k, 5), cls: 'm' }, `${i.t}, ${i.o}`])]);
  },
  tree() {
    const rows = ['.', '|-- / (home, 3D village)', '|-- recruiter.html', '|-- dev.html (you are here)', '|-- sections/',
      ...SECTIONS.map((s, i) => `|   ${i === SECTIONS.length - 1 ? '`' : '|'}-- ${s}.html`), '`-- Assets/Sai_Nalla_CV.pdf'];
    printAll(rows);
  },
  certs() {
    const lines = [];
    certData.groups.forEach((g) => {
      lines.push('', H(g.name));
      certData.items.filter((c) => c.group === g.id).forEach((c) => {
        lines.push([{ t: pad(c.title.slice(0, 44), 46), cls: 'ok' }, M(pad(c.issuer.slice(0, 30), 32)), c.date || '']);
        (c.badges || []).forEach((b) => lines.push([M(`  - ${pad(b.title, 50)}`), b.date]));
        if (c.verify) lines.push([M('    verify: '), c.verify]);
      });
    });
    printAll([...lines, '', M('Google items are listed on the public Google Skills profile.')]);
  },
  grep(args) {
    const q = args.join(' ').toLowerCase();
    if (q.length < 2) return print('usage: grep <term>   (at least 2 characters)');
    const hits = [];
    const add = (where, text) => { if (text && String(text).toLowerCase().includes(q)) hits.push([where, String(text)]); };
    repos.forEach((r) => {
      [r.name, r.kind, r.context, r.summary, r.eli5, ...(r.stack || []), ...((r.more && r.more.approach) || []), ...((r.more && r.more.outcome) || []), r.more && r.more.problem].forEach((t) => add(`projects/${r.id}`, t));
    });
    skillsData.skills.forEach((x) => { add(`skills/${x.id}`, x.name); add(`skills/${x.id}`, x.evidence); });
    certData.items.forEach((c) => { add(`certs/${c.id}`, c.title); add(`certs/${c.id}`, c.issuer); (c.badges || []).forEach((b) => add(`certs/${c.id}`, b.title)); });
    pubs.forEach((p) => { add(`papers/${p.id}`, p.title); add(`papers/${p.id}`, p.summary); (p.tags || []).forEach((t) => add(`papers/${p.id}`, t)); });
    const seen = new Set(); const lines = [];
    for (const [w, t] of hits) {
      const k = w + t; if (seen.has(k)) continue; seen.add(k);
      const i = t.toLowerCase().indexOf(q);
      const a = Math.max(0, i - 30), e = Math.min(t.length, i + q.length + 40);
      lines.push([{ t: w, cls: 'ok' }, M(': '), (a ? '...' : '') + t.slice(a, i), { t: t.slice(i, i + q.length), cls: 'k h' }, t.slice(i + q.length, e) + (e < t.length ? '...' : '')]);
    }
    if (!lines.length) return print(`grep: no matches for '${q.slice(0, 40)}'`);
    printAll([...lines.slice(0, 25), M(`${lines.length} match${lines.length === 1 ? '' : 'es'}${lines.length > 25 ? ' (showing 25)' : ''}. cat <id> for details.`)]);
  },
  man(args) {
    const c = (args[0] || '').toLowerCase();
    if (!c) return print('usage: man <command>');
    const m = MAN[c];
    if (!m) return print(`No manual entry for ${c.slice(0, 30)}`);
    printAll([H(`${c.toUpperCase()}(1)`), '', [M('SYNOPSIS  '), m[0]], '', m[1]]);
  },
  history() { printAll(history.length ? history.map((h, i) => `${pad(i + 1, 4)} ${h}`) : [M('(empty)')]); },
  date() { print(new Date().toString()); },
  echo(args) { print(args.join(' ')); },
  layout(args) {
    const a = (args[0] || '').toLowerCase();
    const next = a === 'terminal' || a === 'split' ? a : document.body.classList.contains('dv-solo') ? 'split' : 'terminal';
    setLayout(next); print(`layout: ${next}`);
  },
  sudo(args) {
    if (args.join(' ').toLowerCase() !== 'hire sai') return print('sudo: try "sudo hire sai"');
    printAll([[{ t: '[sudo] password for recruiter: ', cls: 'm' }, 'accepted.'], '',
      H('Excellent decision. Here is how to reach Sai:'),
      [M('email     '), { t: profile.email, href: `mailto:${profile.email}` }],
      [M('linkedin  '), { t: LINKEDIN, href: LINKEDIN }], [M('cv        '), { t: CV, href: CV }],
      [M('talk      '), 'ask "Is Sai a fit for my role?"'], '',
      [M('Open to: '), `${profile.openTo.join(', ')}. Based in ${profile.location}.`]]);
  },
  async git(args) {
    const sub = (args[0] || '').toLowerCase();
    if (sub === 'status') {
      return printAll(['On branch main', "Your branch is up to date with 'origin/main'.", '',
        'nothing to commit, working tree clean', M('(honest note: this is a static portfolio, so there is no working tree here. The real repo is on GitHub; see git log.)')]);
    }
    if (sub !== 'log') return print('usage: git log | git status');
    print(M('Fetching commits...'));
    try {
      const list = await getCommits();
      if (!list.length) return print('No commits returned.');
      printAll(list.map((c) => [{ t: pad(c.sha, 8), cls: 'w' }, M(pad(c.date, 12)), c.msg]));
      print([M('Repo: '), { t: REPO_URL, href: REPO_URL }]);
    } catch (e) {
      printAll(['Could not reach the GitHub API (offline or rate-limited).', [M('Browse the history here: '), { t: `${REPO_URL}/commits`, href: `${REPO_URL}/commits` }]]);
    }
  },
  async ask(args) {
    const q = args.join(' ').trim();
    if (!q) return print('usage: ask <question>   e.g. ask what has Sai built?');
    print(M('Kage is thinking...'));
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
      const res = await fetch(PROXY_URL, { signal: ctl.signal, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: document.title, messages: [{ role: 'user', content: q.slice(0, 600) }] }) });
      clearTimeout(to);
      if (res.status === 403) return print('Kage: this page is not allowed to use the assistant (403).');
      if (res.status === 429) return print('Kage: too many questions right now (429). Try again in a minute.');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = String(data.text || '').replace(/\[ACTION:[^\]]*\]/g, '').trim();
      printAll([[{ t: 'kage> ', cls: 'k h' }, reply || '(no answer)']]);
    } catch (e) {
      print("Kage is offline right now. Try again later, or run 'contact'.");
    }
  },
  github() { print([{ t: GITHUB, href: GITHUB }]); window.open(GITHUB, '_blank', 'noopener'); },
  linkedin() { print([{ t: LINKEDIN, href: LINKEDIN }]); window.open(LINKEDIN, '_blank', 'noopener'); },
  contact() {
    printAll([H('Contact'), [M('email     '), { t: profile.email, href: `mailto:${profile.email}` }],
      [M('github    '), { t: GITHUB, href: GITHUB }], [M('linkedin  '), { t: LINKEDIN, href: LINKEDIN }],
      [M('location  '), profile.location]]);
  },
  open(args) {
    const s = (args[0] || '').toLowerCase();
    const target = OPEN_EXTRA[s] || (s === 'veritomix' || SECTIONS.includes(s) ? `/sections/${s}.html` : '');
    if (!target) return printAll([s ? `open: unknown page '${s.slice(0, 30)}'` : 'usage: open <page>', M([...SECTIONS, ...Object.keys(OPEN_EXTRA)].join('  '))]);
    print(M(`Navigating to ${target} ...`));
    window.location.href = target;
  },
  theme(args) {
    const cur = document.documentElement.dataset.theme;
    const next = args[0] === 'dark' || args[0] === 'light' ? args[0] : cur === 'dark' ? 'light' : 'dark';
    setTheme(next);
    print(`theme: ${next}`);
  },
  clear() { out.replaceChildren(); },
  exit() { print(M('Returning to the home page ...')); window.location.href = '/'; },
};
const NAMES = Object.keys(commands);
const ARGS = {
  cat: [...repos.map((r) => r.id), ...pubs.map((p) => p.id)],
  ls: ['projects', 'sections', 'papers'],
  open: [...SECTIONS, ...Object.keys(OPEN_EXTRA)], man: NAMES, help: NAMES, git: ['log', 'status'], sudo: ['hire sai'], layout: ['terminal', 'split'], skills: ['tools', 'competencies'], theme: ['dark', 'light'],
};

function setLayout(l) {
  document.body.classList.toggle('dv-solo', l === 'terminal');
  try { localStorage.setItem('dev-layout', l); } catch (e) { /* storage blocked */ }
}
try { if (localStorage.getItem('dev-layout') === 'terminal') document.body.classList.add('dv-solo'); } catch (e) { /* ignore */ }
document.getElementById('dvLayout').addEventListener('click', () => commands.layout([]));

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('sai-theme', t); } catch (e) { /* storage blocked */ }
}
document.getElementById('dvTheme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

let busy = false;
async function run(raw) {
  const line = raw.trim();
  echo(raw);
  if (!line) return toBottom();
  const [cmd, ...args] = line.split(/\s+/);
  const fn = Object.prototype.hasOwnProperty.call(commands, cmd.toLowerCase()) ? commands[cmd.toLowerCase()] : null;
  if (fn) { busy = true; try { await fn(args); } catch (e) { print('error: command failed'); } busy = false; }
  else print(`${cmd.slice(0, 40)}: command not found. Type 'help'.`);
  toBottom();
}

// ---- input: history, completion ----
const history = [];
let hi = 0;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  skipTyping();
  const v = input.value;
  if (v.trim()) { history.push(v); }
  hi = history.length;
  input.value = '';
  run(v);
});
input.addEventListener('keydown', (e) => {
  if (typing) { e.preventDefault(); skipTyping(); return; }
  if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
  else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hi < history.length - 1 ? history[++hi] : ((hi = history.length), ''); }
  else if (e.key === 'Tab') { e.preventDefault(); complete(); }
  else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); commands.clear(); }
});
function complete() {
  const v = input.value;
  const parts = v.split(/\s+/);
  const pool = parts.length <= 1 ? NAMES : (ARGS[parts[0].toLowerCase()] || []);
  const cur = parts[parts.length - 1].toLowerCase();
  const hits = pool.filter((n) => n.startsWith(cur));
  if (!hits.length) return;
  if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + ' '; return; }
  let p = hits[0];
  for (const h of hits) while (!h.startsWith(p)) p = p.slice(0, -1);
  parts[parts.length - 1] = p; input.value = parts.join(' ');
  echo(v); print(hits.join('  ')); toBottom();
}
screen.addEventListener('click', () => { if (!window.getSelection().toString()) input.focus(); });

// quick-command chips
const chips = document.getElementById('dvChips');
['help', 'whoami', 'projects', 'skills', 'stack', 'pubs', 'veritomix', 'contact', 'clear'].forEach((c) => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = c;
  b.addEventListener('click', () => { skipTyping(); input.value = ''; history.push(c); hi = history.length; run(c); input.focus({ preventScroll: true }); });
  chips.append(b);
});

// ---- intro: typed whoami, skippable ----
let typing = false, timer = 0;
function finishIntro() { typing = false; clearTimeout(timer); input.readOnly = false; input.value = ''; run('whoami'); print(M("Type 'help' for commands.")); toBottom(); }
function skipTyping() { if (typing) finishIntro(); }
function intro() {
  if (reduce) { run('whoami'); print(M("Type 'help' for commands.")); return; }
  typing = true; input.readOnly = true;
  const text = 'whoami'; let i = 0;
  const step = () => {
    if (!typing) return;
    if (i < text.length) { input.value = text.slice(0, ++i); timer = setTimeout(step, 90); }
    else timer = setTimeout(finishIntro, 350);
  };
  timer = setTimeout(step, 400);
}
document.addEventListener('pointerdown', skipTyping);
intro();
input.focus({ preventScroll: true });

initGithub();

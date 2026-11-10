// GitHub panel: live public repos (unauthenticated, cached 1 h) with a static fallback from content/repos.json.
// All GitHub-supplied strings go through textContent / setAttribute only.
import baseRepos from '../../content/repos.json';
import projects from '../../content/projects.json';

const USER = 'SaiKiranKumarNalla';
const API = `https://api.github.com/users/${USER}`;
const CACHE_KEY = 'dev-gh-cache-v2';
const TTL = 60 * 60 * 1000;
const NS = 'http://www.w3.org/2000/svg';
// Featured projects that live in projects.json (Agentic AI page) are added to the terminal's project list
// and to the offline fallback below, so they appear even when GitHub is unreachable.
const FROM_PROJECTS = ['tenglish-lm'];
const asRepo = (p) => ({
  id: p.id, name: p.name, kind: p.kind, years: String(p.year), context: 'Personal research project',
  eli5: p.eli5, summary: p.summary, stack: p.stack, note: p.note,
  url: ((p.links || []).find((l) => l.label === 'GitHub') || {}).href || '',
  links: p.links,
  more: p.more ? { problem: p.more.problem, approach: p.more.approach, status: p.more.status } : undefined,
});
export const repos = [
  ...baseRepos,
  ...FROM_PROJECTS.filter((id) => !baseRepos.some((r) => r.id === id)).map((id) => projects.find((p) => p.id === id)).filter(Boolean).map(asRepo),
];
const STATIC_LANGS = new Set(['MATLAB', 'Python', 'CUDA']);

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const svg = (tag, attrs) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};
const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? u : '');

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.t < TTL && Array.isArray(c.repos)) return c;
  } catch (e) { /* storage blocked or bad JSON */ }
  return null;
}
function writeCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), ...data })); } catch (e) { /* ignore */ }
}

async function getJson(url) {
  const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function load() {
  const cached = readCache();
  if (cached) return { ...cached, live: true, cached: true };
  const [list, user] = await Promise.all([
    getJson(`${API}/repos?sort=updated&per_page=30`),
    getJson(API).catch(() => null),
  ]);
  if (!Array.isArray(list)) throw new Error('bad response');
  const slim = list.map((r) => ({
    name: String(r.name || ''), url: String(r.html_url || ''), desc: String(r.description || ''),
    lang: r.language ? String(r.language) : '', stars: Number(r.stargazers_count) || 0,
    forks: Number(r.forks_count) || 0, fork: !!r.fork, pushed: String(r.pushed_at || ''),
  }));
  const u = user ? {
    name: String(user.name || ''), bio: String(user.bio || ''), followers: Number(user.followers) || 0,
    following: Number(user.following) || 0, public_repos: Number(user.public_repos) || slim.length,
    location: String(user.location || ''), avatar: String(user.avatar_url || ''),
  } : null;
  const out = { repos: slim, user: u };
  writeCache(out);
  return { ...out, live: true, cached: false };
}

function fallback() {
  const slim = repos.map((r) => ({
    name: r.name, url: r.url || '', desc: r.summary, lang: '', stars: 0, forks: 0, fork: false, pushed: '',
    kind: r.kind, years: r.years, stack: r.stack,
  }));
  return { repos: slim, user: null, live: false };
}

function ago(iso) {
  const t = Date.parse(iso);
  if (!t) return '';
  const d = Math.max(0, Math.round((Date.now() - t) / 86400000));
  if (d < 1) return 'today';
  if (d < 31) return `${d} d ago`;
  if (d < 365) return `${Math.round(d / 30)} mo ago`;
  return `${(d / 365).toFixed(1)} y ago`;
}

function renderProfile(data) {
  const u = data.user;
  $('ghName').textContent = (u && u.name) || 'Sai Kiran Kumar Nalla';
  const meta = [];
  if (data.live) meta.push(`${(u && u.public_repos) || data.repos.length} public repositories`);
  if (u) { meta.push(`${u.followers} followers`); if (u.location) meta.push(u.location); }
  if (!data.live) meta.push('Medical imaging scientist and AI builder');
  $('ghMeta').textContent = meta.join(' · ');
  const img = $('ghAvatar');
  img.addEventListener('error', () => { img.hidden = true; }, { once: true });
  img.src = `https://github.com/${USER}.png?size=128`;
  const src = $('ghSource');
  src.textContent = data.live
    ? `Live from the GitHub API${data.cached ? ' (cached for up to 1 hour)' : ''}.`
    : 'GitHub is unreachable or rate-limited. Showing a static snapshot of featured work from this site.';
}

function languages(data) {
  const counts = new Map();
  for (const r of data.repos) {
    if (data.live) {
      if (r.lang) counts.set(r.lang, (counts.get(r.lang) || 0) + 1);
    } else {
      for (const s of r.stack || []) if (STATIC_LANGS.has(s)) counts.set(s, (counts.get(s) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function renderLangs(data) {
  const bar = $('ghLangBar'), legend = $('ghLegend');
  bar.replaceChildren(); legend.replaceChildren();
  const langs = languages(data);
  const total = langs.reduce((s, [, n]) => s + n, 0);
  if (!total) { legend.append(el('li', 'dv-muted', 'No language data available.')); return; }
  let x = 0;
  langs.slice(0, 8).forEach(([name, n], i) => {
    const w = (n / total) * 100;
    bar.append(svg('rect', { x: x.toFixed(2), y: 0, width: Math.max(w - 0.4, 0.4).toFixed(2), height: 3, class: `l${i}` }));
    x += w;
    const li = el('li');
    li.append(el('span', `dv-dot l${i}`), el('span', 'dv-lname', name), el('span', 'dv-lpct', `${Math.round(w)}%`));
    legend.append(li);
  });
  if (data.live === false) legend.append(el('li', 'dv-muted', 'Counted from the languages of featured projects.'));
}

function renderRepos(data) {
  const ul = $('ghRepos');
  ul.replaceChildren();
  if (!data.repos.length) { ul.append(el('li', 'dv-muted', 'No public repositories found.')); return; }
  for (const r of data.repos) {
    const li = el('li', 'dv-repo');
    const url = safeUrl(r.url);
    const head = el('div', 'dv-repo-head');
    if (url) {
      const a = el('a', 'dv-repo-name', r.name);
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      head.append(a);
    } else head.append(el('span', 'dv-repo-name', r.name));
    if (r.fork) head.append(el('span', 'dv-tag', 'fork'));
    if (r.kind) head.append(el('span', 'dv-tag', r.kind));
    li.append(head);
    if (r.desc) li.append(el('p', 'dv-repo-desc', r.desc));
    const meta = el('div', 'dv-repo-meta');
    if (data.live) {
      if (r.lang) meta.append(el('span', null, r.lang));
      meta.append(el('span', null, `${r.stars} stars`));
      if (r.forks) meta.append(el('span', null, `${r.forks} forks`));
      const a = ago(r.pushed);
      if (a) meta.append(el('span', null, `updated ${a}`));
    } else {
      if (r.years) meta.append(el('span', null, r.years));
      if (r.stack && r.stack.length) meta.append(el('span', null, r.stack.slice(0, 3).join(', ')));
    }
    li.append(meta);
    ul.append(li);
  }
}

function renderStrip(data) {
  const s = $('ghStrip'), note = $('ghStripNote');
  s.replaceChildren();
  const W = 52, now = Date.now(), week = 7 * 86400000;
  const buckets = new Array(W).fill(0);
  let any = false;
  if (data.live) {
    for (const r of data.repos) {
      const t = Date.parse(r.pushed);
      if (!t) continue;
      const i = W - 1 - Math.floor((now - t) / week);
      if (i >= 0 && i < W) { buckets[i]++; any = true; }
    }
  }
  const max = Math.max(1, ...buckets);
  buckets.forEach((n, i) => {
    const lv = n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4));
    s.append(svg('rect', { x: i * 6, y: 4, width: 5, height: 20, rx: 1, class: `lv${lv}` }));
  });
  note.textContent = !data.live
    ? 'Unavailable without the GitHub API.'
    : any
      ? 'Approximation: one mark per repository, placed at its most recent push in the last 52 weeks. It is not a contribution graph.'
      : 'No pushes in the last 52 weeks. This is an approximation from repository push dates, not a contribution graph.';
}

export async function initGithub() {
  let data;
  try { data = await load(); } catch (e) { data = fallback(); }
  if (!data.repos.length) data = fallback();
  renderProfile(data); renderLangs(data); renderRepos(data); renderStrip(data);
  return data;
}

// Recent commits of the site repo (cached 1 h). Returns [{sha, msg, date}] or throws.
const COMMITS_KEY = 'dev-gh-commits-v1';
export async function getCommits() {
  try {
    const c = JSON.parse(sessionStorage.getItem(COMMITS_KEY) || 'null');
    if (c && Date.now() - c.t < TTL && Array.isArray(c.list)) return c.list;
  } catch (e) { /* ignore */ }
  const raw = await getJson(`https://api.github.com/repos/${USER}/saikirankumarnalla.github.io/commits?per_page=10`);
  if (!Array.isArray(raw)) throw new Error('bad response');
  const list = raw.map((c) => ({
    sha: String((c && c.sha) || '').slice(0, 7),
    msg: String((c && c.commit && c.commit.message) || '').split('\n')[0].slice(0, 90),
    date: String((c && c.commit && c.commit.author && c.commit.author.date) || '').slice(0, 10),
  }));
  try { sessionStorage.setItem(COMMITS_KEY, JSON.stringify({ t: Date.now(), list })); } catch (e) { /* ignore */ }
  return list;
}

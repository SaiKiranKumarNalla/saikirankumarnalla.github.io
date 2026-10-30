// Kage, the site's assistant: a small live 3D Kage in the bottom-right corner that opens a chat.
// Answers come from the existing Cloudflare worker; Kage can also take the visitor to a page.
import * as THREE from 'three';
import { makeKageCharacter } from '../world/character.js';
import profile from '../../content/profile.json';
import thesis from '../../content/thesis.json';
import repos from '../../content/repos.json';
import pubs from '../../content/publications.json';
import builder from '../../content/ai-builder.json';
import './widget.css';

const PROXY_URL = 'https://kage-proxy.sainalla82.workers.dev';
const PAGES = {
  home: ['/', 'the village (home)'], about: ['/about.html', 'About'], experience: ['/experience.html', 'Experience'],
  education: ['/education.html', 'Education (PhD, Master\'s, Bachelor\'s)'], projects: ['/projects.html', 'Projects'],
  publications: ['/papers.html', 'Publications'], contact: ['/contact.html', 'Reach Out'], cv: ['/Assets/Sai_Nalla_CV.pdf', 'CV (PDF)'],
};
const PROMPTS = ['Who is Sai, in two lines?', 'Explain the PhD like I am five', 'What has Sai built?', 'Is Sai a fit for my role?'];

function systemPrompt() {
  const pubList = pubs.map((p) => `- ${p.title} (${p.venue}, ${p.year}, ${p.status}${p.doi ? `, doi:${p.doi}` : ''})`).join('\n');
  const repoList = repos.map((r) => `- ${r.name}: ${r.summary}`).join('\n');
  return `You are Kage (影), the assistant on Sai Kiran Kumar Nalla's portfolio. Be warm, concise and professional; answer in 2-5 sentences unless asked for more. Refer to him as Sai. Never invent facts: if unsure, say so and suggest the Contact page.

ABOUT SAI
${profile.displayName}. ${profile.headline}. ${profile.tagline} Now: ${profile.now}
Based in ${profile.location}; open to ${profile.openTo.join(', ')}. Email ${profile.email}.
Education: ${profile.education.map((e) => `${e.degree}, ${e.school} (${e.years})`).join('; ')}.
Experience: ${profile.experience.map((e) => `${e.role}, ${e.org} (${e.years})`).join('; ')}.

PHD: ${thesis.title}. In simple words: ${thesis.eli5}
Studies: ${thesis.chapters.filter((c) => c.n > 0).map((c) => `${c.title}: ${c.detail}`).join(' | ')}

PROJECTS
${repoList}

AGENTIC AI: ${builder.headline} Principles: ${builder.principles.map((p) => p.title).join(', ')}. Tools: ${builder.stack.join(', ')}.

PUBLICATIONS
${pubList}

NAVIGATION: when the visitor wants to see something, end your reply with exactly one tag [ACTION:navigate:KEY] where KEY is one of: ${Object.keys(PAGES).join(', ')}. The visitor is currently on: ${document.title}.`;
}

export function mountKage() {
  if (document.getElementById('kageDock')) return;
  const dock = document.createElement('div');
  dock.id = 'kageDock';
  dock.innerHTML = `
    <section class="kg-panel" id="kgPanel" hidden aria-label="Chat with Kage">
      <header><div><b>Kage</b><span>Sai's assistant</span></div><button class="kg-x" aria-label="Close">×</button></header>
      <div class="kg-msgs" id="kgMsgs" aria-live="polite"></div>
      <div class="kg-quick">${PROMPTS.map((p) => `<button>${p}</button>`).join('')}</div>
      <form class="kg-form"><input id="kgIn" placeholder="Ask about Sai's work…" autocomplete="off" aria-label="Message"><button aria-label="Send">➤</button></form>
    </section>
    <button class="kg-btn" id="kgBtn" aria-label="Ask Kage" aria-expanded="false"><canvas width="96" height="120"></canvas><span class="kg-tip">Ask Kage</span></button>`;
  document.body.appendChild(dock);

  const panel = dock.querySelector('#kgPanel'), btn = dock.querySelector('#kgBtn'), msgs = dock.querySelector('#kgMsgs'), input = dock.querySelector('#kgIn');
  const history = [];
  let busy = false, state = 'idle', hover = false;

  const add = (role, html) => { const d = document.createElement('div'); d.className = `kg-msg ${role}`; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toggle = (open) => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open && !msgs.children.length) add('kage', "Hi, I'm Kage. Ask me about Sai's research, projects or fit for a role, or tell me where you'd like to go.");
    if (open) input.focus();
  };
  btn.addEventListener('click', () => toggle(panel.hidden));
  dock.querySelector('.kg-x').addEventListener('click', () => toggle(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) toggle(false); });

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    add('user', esc(text));
    history.push({ role: 'user', content: text });
    const typing = add('kage typing', '<i></i><i></i><i></i>');
    state = 'talk';
    try {
      const res = await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: systemPrompt(), messages: history.slice(-12) }) });
      const data = await res.json();
      typing.remove();
      if (data.error) throw new Error(data.error);
      const reply = (data.text || '').replace(/\[ACTION:[^\]]*\]/g, '').trim() || '…';
      history.push({ role: 'assistant', content: reply });
      add('kage', esc(reply).replace(/\n/g, '<br>'));
      const nav = data.action?.type === 'navigate' && PAGES[data.action.data];
      if (nav) {
        const go = add('kage action', `➜ Take me to ${esc(nav[1])}`);
        go.addEventListener('click', () => { location.href = nav[0]; });
      }
    } catch (e) {
      typing.remove();
      add('kage', "I couldn't reach my brain just now. Try again in a moment, or use the Contact page to reach Sai directly.");
    }
    busy = false;
    state = 'idle';
  }
  // Pages can hand Kage a question directly (e.g. the story pages' "Ask Kage for a summary").
  window.KageAsk = (text) => { toggle(true); send(text); return true; };
  dock.querySelector('.kg-form').addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
  dock.querySelectorAll('.kg-quick button').forEach((b) => b.addEventListener('click', () => send(b.textContent)));

  // The live avatar: Kage idles, waves on hover, and talks while answering. Rendered at ~20 fps.
  const canvas = btn.querySelector('canvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { btn.classList.add('kg-static'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(96, 120, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 96 / 120, 0.1, 50);
  camera.position.set(0, 2.2, 7.2);
  camera.lookAt(0, 1.55, 0);
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x2a1414, 1.6));
  const key = new THREE.DirectionalLight(0xffe2cc, 2); key.position.set(2, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd24a4a, 2.5); rim.position.set(-3, 2, -2); scene.add(rim);
  const kage = makeKageCharacter();
  kage.rotation.y = -0.35;
  scene.add(kage);
  let last = 0;
  btn.addEventListener('pointerenter', () => { hover = true; });
  btn.addEventListener('pointerleave', () => { hover = false; });
  const clock = new THREE.Clock();
  (function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < 50) return;
    last = now;
    const t = clock.getElapsedTime();
    kage.userData.setTalking(state === 'talk');
    kage.userData.animate(t, false, 0.05);
    kage.rotation.y += ((hover ? 0 : -0.35 + Math.sin(t * 0.5) * 0.15) - kage.rotation.y) * 0.1;
    renderer.render(scene, camera);
  })(0);
}

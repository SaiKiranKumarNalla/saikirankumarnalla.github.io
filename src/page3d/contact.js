// Contact, on the layout kit: a hero with the village lantern, a grid of contact cards, the cities and
// work Sai is open to, and a closing band with Kage (the AI assistant) and the CV.
import profile from '../../content/profile.json';
import { makeBuilding } from '../world/props.js';
import { mountPage, hero, sec, cta, head, stage, grid, card, chips, callout, btn, esc } from './layout.js';
import './contact.css';
// Profile links that are only a bare domain (no profile path yet) aren't shown.
const real = (u) => !!u && /^https?:\/\/[^/]+\/./.test(u);

const L = profile.links;
const link = (href, label, ext = true) => `<a class="ct-link" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
const cards = [
  { kicker: 'Email', title: 'Write to me', html: `<p>${link(`mailto:${profile.email}`, esc(profile.email), false)}</p>` },
  { kicker: 'LinkedIn', title: 'Connect', html: `<p>${link(L.linkedin, 'linkedin.com/in/sai-kiran-kumar-nalla')}</p>` },
  { kicker: 'GitHub', title: 'Code', html: `<p>${link(L.github, 'github.com/SaiKiranKumarNalla')}</p>` },
  ...(real(L.itch) ? [{ kicker: 'Itch.io', title: 'Games', html: `<p>${link(L.itch, 'Indie Games on Itch')}</p>` }] : []),
  ...(real(L.youtube) ? [{ kicker: 'YouTube', title: 'Videos', html: `<p>${link(L.youtube, 'Dev &amp; Game Reels')}</p>` }] : []),
];

const heroHtml = `<p class="lk-k">Contact · ${esc(profile.location)}</p><h1>Let's talk</h1>
  <p class="lk-lede">Research roles, industry R&amp;D, medtech ventures, or a good conversation about PET and AI.</p>
  <div class="lk-btns">${btn({ href: `mailto:${profile.email}`, label: 'Email me' })}${btn({ href: '#links', label: 'More ways to reach me', ghost: true })}</div>`;

const html = [
  hero({ stage: stage('lantern', { cls: 'lk-bleed', focus: '0.62 0.08 0.96 0.94', focusM: '0.1 0.06 0.9 0.94' }), html: heroHtml }),

  sec(`${head({ kicker: 'Find me', title: 'Where to reach me' })}${grid(cards.map(card), 'ct-cards')}`, { id: 'links' }),

  sec(`${head({ kicker: 'Open to', title: 'Where and how I would like to work' })}
    ${chips(profile.openTo)}
    ${callout(`<p><b>Based in ${esc(profile.location)}.</b></p><p>${esc(profile.now)}</p>`)}`, { cls: 'ct-open' }),

  cta({
    kicker: 'Prefer a quicker answer?', title: 'Ask Kage, my AI assistant',
    text: 'Kage knows my research, projects and background and can answer or point you to the right page.',
    links: [{ href: '?ask=kage', label: 'Ask Kage →' }, { href: `/${L.cv}`, label: 'Download my CV (PDF)', ghost: true, ext: true }],
  }),
].join('');

function lanternStage(ctx) {
  const { THREE, scene, lowPower, reduceMotion } = ctx;
  const lantern = makeBuilding({ style: 'lanternTower', footprint: 2.6 }, { lowPower });
  lantern.userData.setGlow(1);
  scene.add(lantern);
  const glow = new THREE.PointLight(0xffa860, 30, 18, 1.5);
  glow.position.set(0, 5.6, 2.5);
  scene.add(glow);
  ctx.view = { c: new THREE.Vector3(0, 4.6, 0), w: 9, h: 12.6, dir: new THREE.Vector3(0.1, 0.12, 1) };
  let base = 30;
  return {
    theme: (pal) => { base = pal.night ? 30 : 14; },
    update(t) {
      lantern.userData.animate(t);
      if (!reduceMotion) lantern.rotation.y = Math.sin(t * 0.3) * 0.4;
      glow.intensity = base + Math.sin(t * 7) * 1.5 + Math.sin(t * 13);
    },
  };
}

mountPage({ active: 'contact', html, stages: { lantern: lanternStage } });

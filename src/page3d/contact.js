// Contact: the village lantern, glowing brighter as the visitor reaches the contact details.
import profile from '../../content/profile.json';
import { makeBuilding } from '../world/props.js';
import { runPage } from './engine.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

document.getElementById('main').innerHTML = `
  <section class="s-step s-hero" data-title="Contact"><div class="s-card">
    <p class="s-kicker">Contact · ${esc(profile.location)}</p><h1>Let's talk</h1>
    <p class="s-lede">Research roles, industry R&amp;D, medtech ventures, or a good conversation about PET and AI.</p>
    <div class="s-role"><b>Email</b><p><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></p></div>
    <div class="s-role"><b>LinkedIn</b><p><a href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">linkedin.com/in/sai-kiran-kumar-nalla</a></p></div>
    <div class="s-role"><b>GitHub</b><p><a href="${esc(profile.links.github)}" target="_blank" rel="noopener">github.com/SaiKiranKumarNalla</a></p></div>
    <div class="s-role"><b>CV</b><p><a href="/${esc(profile.links.cv)}" target="_blank" rel="noopener">Download (PDF)</a></p></div>
    <h3>Open to</h3><div class="s-chips">${profile.openTo.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
    <a class="s-more" href="/kage">Or ask Kage, my AI assistant →</a>
  </div></section>`;

runPage({
  active: 'contact',
  build({ THREE, scene, lowPower, reduceMotion }) {
    const lantern = makeBuilding({ style: 'lanternTower', footprint: 2.6 }, { lowPower });
    lantern.position.set(3.6, -4, 0);
    lantern.scale.setScalar(0.9);
    scene.add(lantern);
    const glow = new THREE.PointLight(0xffa860, 30, 18, 1.5);
    glow.position.set(3.6, 1.5, 2);
    scene.add(glow);
    lantern.userData.setGlow(1);
    return {
      keyframes: [{ pos: [0, 1, 16], look: [1.2, 0, 0] }],
      update(t) {
        lantern.userData.animate(t);
        if (!reduceMotion) lantern.rotation.y = Math.sin(t * 0.3) * 0.4;
        glow.intensity = 28 + Math.sin(t * 7) * 1.5 + Math.sin(t * 13) * 1;
      },
    };
  },
});

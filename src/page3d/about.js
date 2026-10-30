// About: a dark glass globe turns to each city of Sai's path as the visitor scrolls.
import profile from '../../content/profile.json';
import life from '../../content/life.json';
import { runPage } from './engine.js';
import { makeGlobe } from './globe.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const exp = (org) => profile.experience.find((e) => e.org.includes(org));
const edu = (school) => profile.education.find((e) => e.school.includes(school));
const role = (e) => e ? `<div class="s-role"><b>${esc(e.role || e.degree)}</b>, ${esc(e.org || e.school)} <span class="s-meta">${esc(e.years)}</span>${e.points ? `<p>${esc(e.points[0])}</p>` : e.note ? `<p>${esc(e.note)}</p>` : ''}</div>` : '';

const CITY = {
  hyderabad: { name: 'Hyderabad', sub: 'India', lat: 17.39, lon: 78.49 },
  paris: { name: 'Paris · Palaiseau', sub: 'France', lat: 48.71, lon: 2.25 },
  toulouse: { name: 'Toulouse', sub: 'France', lat: 43.6, lon: 1.44 },
  haifa: { name: 'Haifa', sub: 'Rambam Health Care Campus', lat: 32.79, lon: 34.99 },
  london: { name: 'London', sub: 'Open to', lat: 51.51, lon: -0.13, side: 'left' },
  amsterdam: { name: 'Amsterdam', sub: 'Open to', lat: 52.37, lon: 4.9, side: 'above' },
  berlin: { name: 'Berlin', sub: 'Open to', lat: 52.52, lon: 13.4, side: 'right' },
};

// Each step: text, which city the globe faces, which pins are labelled, and which arcs are drawn.
const STEPS = [
  {
    title: 'Intro', face: null, pins: ['hyderabad', 'paris', 'toulouse'], arcs: [],
    html: `<p class="s-kicker">About</p>
      <h1>Sai Kiran Kumar Nalla, PhD</h1>
      <p class="s-lede">${esc(profile.headline)}. ${esc(profile.tagline)}</p>
      <p>${esc(profile.now)}</p>
      <div class="s-stat"><div><b>3</b><span>countries</span></div><div><b>6</b><span>institutions</span></div><div><b>4</b><span>languages</span></div></div>
      <p class="s-scroll">Scroll to follow the path</p>`,
  },
  {
    title: 'Hyderabad', face: 'hyderabad', pins: ['hyderabad'], arcs: [],
    html: `<p class="s-kicker">2016–2021 · Hyderabad, India</p><h2>Engineering roots</h2>
      <p>Mechanical engineering at Mahindra École Centrale, on an excellence scholarship. First research: simulating how gas bubbles disturb blood flow in the carotid artery, which became a journal paper.</p>
      ${role(edu('Mahindra'))}${role(exp('Mahindra'))}
      <div class="s-role"><b>Deputy team lead</b>, Autonomous Underwater Vehicle club <span class="s-meta">2019–2020</span><p>Built the club from scratch: 25 members, finances, media.</p></div>
      <a class="s-more" href="/sections/auv.html">Black Pearl, the underwater robot →</a>`,
  },
  {
    title: 'Paris', face: 'paris', pins: ['paris'], arcs: [['hyderabad', 'paris']],
    html: `<p class="s-kicker">2021–2023 · Paris & Palaiseau, France</p><h2>Biomedical engineering, hospitals and a startup</h2>
      <p>A fully funded MSc at École Polytechnique, then straight into the clinic and industry.</p>
      ${role(edu('Polytechnique'))}${role(exp('LadHyX'))}${role(exp('Saint Joseph'))}${role(exp('Hepta'))}
      <a class="s-more" href="/sections/masters.html">Master's thesis: microwave ablation →</a>`,
  },
  {
    title: 'Toulouse', face: 'toulouse', pins: ['toulouse', 'haifa'], arcs: [['paris', 'toulouse'], ['toulouse', 'haifa']],
    html: `<p class="s-kicker">2023–2026 · Toulouse, France</p><h2>PhD in medical imaging</h2>
      <p>At the IUCT Oncopole cancer institute, co-supervised with Rambam Health Care Campus in Haifa, and working with GE HealthCare and eMotion Tech.</p>
      ${role(edu('Toulouse'))}${role(exp('IUCT'))}
      <a class="s-more" href="/sections/research.html">The research, explained →</a>`,
  },
  {
    title: 'Next', face: 'europe', pins: ['toulouse', 'london', 'amsterdam', 'berlin'], arcs: [['toulouse', 'london'], ['toulouse', 'amsterdam'], ['toulouse', 'berlin']],
    html: `<p class="s-kicker">Now · ${esc(profile.location)}</p><h2>What's next</h2>
      <p>Looking for roles where physics-grade imaging meets AI: industry R&amp;D, medtech, and research groups building simulation or generative models for PET/CT.</p>
      <h3>Open to</h3><div class="s-chips">${profile.openTo.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <a class="s-more" href="/sections/contact">Get in touch →</a>`,
  },
  {
    title: 'Beyond the lab', face: 'wide', pins: ['hyderabad', 'paris', 'toulouse', 'haifa'], arcs: [['hyderabad', 'paris'], ['paris', 'toulouse'], ['toulouse', 'haifa']],
    html: `<p class="s-kicker">Beyond the lab</p><h2>The rest of me</h2>
      <p>Drawn to where deep tech meets strategy: healthcare ventures, life-science consulting, and how research reaches patients.</p>
      <h3>Programmes</h3><div class="s-chips">${profile.programmes.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <h3>Languages</h3><div class="s-chips">${profile.languages.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <h3>Interests</h3><div class="s-chips">${profile.interests.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <a class="s-more" href="/sections/life.html">Off the clock: travel, fiction, music and games →</a>`,
  },
];

document.getElementById('main').innerHTML = STEPS.map((s, i) =>
  `<section class="s-step${i === 0 ? ' s-hero' : ''}" data-title="${esc(s.title)}"><div class="s-card">${s.html}</div></section>`).join('');

runPage({
  active: 'about',
  build({ THREE, scene, camera, label, reduceMotion, lowPower }) {
    const R = 3.6;
    const globe = new THREE.Group();
    globe.position.set(2.2, 0, 0);
    scene.add(globe);

    // Real country shapes; the places Sai has lived and visited are lit.
    const earth = makeGlobe({ R, lowPower, lived: life.travel.lived.map((c) => c.id), visited: life.travel.visited.map((c) => c.id) });
    globe.add(earth.group);
    const halo = earth.halo;
    const ll = earth.ll;

    // City pins.
    const pins = {};
    for (const [id, c] of Object.entries(CITY)) {
      const p = ll(c.lat, c.lon, R);
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff6a5a }));
      pin.position.copy(p);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.14, 32), new THREE.MeshBasicMaterial({ color: 0xff6a5a, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      ring.position.copy(p).multiplyScalar(1.002);
      ring.lookAt(p.clone().multiplyScalar(2));
      globe.add(pin, ring);
      const world = new THREE.Vector3();
      const l = label(`<b>${c.name}</b><span>${c.sub}</span>`, () => pin.getWorldPosition(world), `s-pin${c.side ? ` s-pin-${c.side}` : ''}`);
      pins[id] = { pin, ring, l, world };
    }

    // Arcs between cities, drawn progressively.
    const arcs = {};
    const arcFor = (a, b) => {
      const key = `${a}-${b}`;
      if (arcs[key]) return arcs[key];
      const pa = ll(CITY[a].lat, CITY[a].lon, R), pb = ll(CITY[b].lat, CITY[b].lon, R);
      const lift = 1 + pa.distanceTo(pb) / (R * 2.2);
      const mid = pa.clone().add(pb).normalize().multiplyScalar(R * lift);
      const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
      const geo = new THREE.TubeGeometry(curve, 64, 0.022, 6, false);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff7a5a, transparent: true, opacity: 0.9 }));
      geo.setDrawRange(0, 0);
      globe.add(mesh);
      return (arcs[key] = { mesh, geo, total: geo.index.count, shown: 0 });
    };
    STEPS.forEach((s) => s.arcs.forEach(([a, b]) => arcFor(a, b)));

    // Where the globe faces at each step (rotation.x = lat, rotation.y = -lon brings a point to the camera).
    const FACE = {
      hyderabad: [17, 78.5], paris: [46, 2.3], toulouse: [40, 12], europe: [50, 5], wide: [32, 42],
    };
    const faceRot = (s, i) => {
      const [lat, lon] = s.face ? FACE[s.face] : [18, 40 + i];
      return [THREE.MathUtils.degToRad(lat * 0.85), THREE.MathUtils.degToRad(-lon)];
    };

    const normal = new THREE.Vector3(), toCam = new THREE.Vector3();
    return {
      keyframes: [
        { pos: [0, 1.2, 21], look: [0.4, 0, 0] },
        { pos: [1.2, 0.6, 17.5], look: [0.9, 0, 0] },
        { pos: [1.2, 0.6, 17], look: [0.9, 0, 0] },
        { pos: [1.2, 0.6, 17], look: [0.9, 0, 0] },
        { pos: [0.6, 1.5, 18], look: [0.6, 0, 0] },
        { pos: [0, 0.5, 19], look: [0.4, 0, 0] },
      ],
      onTheme(p) { earth.setTheme(p.night); },
      update(t, progress, dt) {
        const i = Math.min(STEPS.length - 2, Math.floor(progress));
        const f = Math.max(0, Math.min(1, progress - i));
        const e = f * f * (3 - 2 * f);
        const [ax, ay] = faceRot(STEPS[i], i), [bx, by] = faceRot(STEPS[i + 1], i + 1);
        let dy = by - ay; dy = ((dy + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        const spin = !reduceMotion && progress < 0.5 ? t * 0.05 * (1 - progress * 2) : 0;
        globe.rotation.set(ax + (bx - ax) * e, ay + dy * e + spin, 0, 'XYZ');

        const step = STEPS[Math.round(progress)];
        for (const [id, p] of Object.entries(pins)) {
          const on = step.pins.includes(id);
          // Only label pins on the camera-facing side of the globe.
          normal.copy(p.pin.getWorldPosition(p.world)).sub(globe.position).normalize();
          p.l.visible = on && normal.dot(toCam.copy(camera.position).sub(globe.position).normalize()) > 0.2;
          p.pin.visible = on || ['hyderabad', 'paris', 'toulouse', 'haifa'].includes(id);
          p.ring.scale.setScalar(on ? 1 + Math.sin(t * 3) * 0.25 + 0.25 : 0.6);
        }
        const wanted = new Set(step.arcs.map(([a, b]) => `${a}-${b}`));
        for (const [k, a] of Object.entries(arcs)) {
          const goal = wanted.has(k) ? a.total : 0;
          a.shown += (goal - a.shown) * Math.min(1, dt * (goal ? 2.2 : 6));
          a.geo.setDrawRange(0, Math.floor(a.shown / 3) * 3);
        }
        halo.material.opacity = 0.07 + Math.sin(t * 1.2) * 0.02;
      },
    };
  },
});

// The globe of the About page, as two stages (layout.js stage builders), both using globe.js:
//   heroStage  Hyderabad, Paris, Toulouse and Haifa, joined by arcs; the globe turns slowly between India and Europe.
//   nextStage  Europe, with arcs from Toulouse to the cities Sai is open to (London, Amsterdam, Berlin).
import life from '../../content/life.json';
import { makeGlobe } from './globe.js';

const CITY = {
  hyderabad: { name: 'Hyderabad', sub: 'India', lat: 17.39, lon: 78.49, side: 'r' },
  paris: { name: 'Paris', sub: 'Palaiseau', lat: 48.71, lon: 2.25, side: 'l' },
  toulouse: { name: 'Toulouse', sub: 'France', lat: 43.6, lon: 1.44, side: 'r' },
  haifa: { name: 'Haifa', sub: 'Rambam', lat: 32.79, lon: 34.99, side: 'r' },
  london: { name: 'London', sub: 'Open to', lat: 51.51, lon: -0.13, side: 'l' },
  amsterdam: { name: 'Amsterdam', sub: 'Open to', lat: 52.37, lon: 4.9, side: '' },
  berlin: { name: 'Berlin', sub: 'Open to', lat: 52.52, lon: 13.4, side: 'r' },
};
const R = 3.6;

function globeStage(ctx, { pins, arcs, view, spin, lowRes, k = 1 }) {
  const { THREE, scene, camera, reduceMotion, lowPower } = ctx;
  const globe = new THREE.Group();
  scene.add(globe);
  const earth = makeGlobe({ R, lowPower: lowPower || lowRes, lived: life.travel.lived.map((c) => c.id), visited: life.travel.visited.map((c) => c.id) });
  globe.add(earth.group);
  const ll = earth.ll;
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xff6a5a });
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6a5a, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const arcMat = new THREE.MeshBasicMaterial({ color: 0xff7a5a, transparent: true, opacity: 0.9 });
  const P = {};
  for (const id of pins) {
    const c = CITY[id], p = ll(c.lat, c.lon, R);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), pinMat);
    pin.position.copy(p);
    pin.scale.setScalar(k);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.14, 32), ringMat);
    ring.position.copy(p).multiplyScalar(1.002);
    ring.lookAt(p.clone().multiplyScalar(2));
    globe.add(pin, ring);
    const w = new THREE.Vector3();
    const tag = ctx.tag(`<b>${c.name}</b><span>${c.sub}</span>`, () => pin.getWorldPosition(w), c.side ? `lk-tag-${c.side}` : '');
    P[id] = { pin, ring, tag };
  }
  for (const [a, b] of arcs) {
    const pa = ll(CITY[a].lat, CITY[a].lon, R), pb = ll(CITY[b].lat, CITY[b].lon, R);
    const lift = 1 + pa.distanceTo(pb) / (R * 2.2);
    const mid = pa.clone().add(pb).normalize().multiplyScalar(R * lift);
    globe.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(pa, mid, pb), 64, 0.022, 6, false), arcMat));
  }
  ctx.view = { c: new THREE.Vector3(...view.c), w: view.w, h: view.h, dir: new THREE.Vector3(0, 0, 1) };
  const normal = new THREE.Vector3(), toCam = new THREE.Vector3(), wp = new THREE.Vector3();
  return {
    theme(pal) {
      earth.setTheme(pal.night);
      pinMat.color.set(pal.hot); ringMat.color.set(pal.hot); arcMat.color.set(pal.night ? 0xff7a5a : pal.accent);
    },
    update(t, dt, st) {
      if (view.m) { const k2 = st.narrow ? view.m : view.w; ctx.view.w = ctx.view.h = k2; }
      const [lat, lon] = spin(reduceMotion ? 0 : t);
      globe.rotation.set((lat * Math.PI * 0.85) / 180, (-lon * Math.PI) / 180, 0);
      for (const p of Object.values(P)) {
        normal.copy(p.pin.getWorldPosition(wp)).sub(globe.position).normalize();
        p.tag.show = normal.dot(toCam.copy(camera.position).sub(globe.position).normalize()) > 0.3;
        p.ring.scale.setScalar((1 + Math.sin(t * 3) * 0.25 + 0.25) * k);
      }
      earth.halo.material.opacity = 0.07 + Math.sin(t * 1.2) * 0.02;
    },
  };
}

export const heroStage = (ctx) => globeStage(ctx, {
  pins: ['hyderabad', 'paris', 'toulouse', 'haifa'],
  arcs: [['hyderabad', 'paris'], ['paris', 'toulouse'], ['toulouse', 'haifa']],
  view: { c: [0, 0, 0], w: 8.4, h: 8.4 },
  spin: (t) => [30, 40 + Math.sin(t * 0.12) * 34],
});

export const nextStage = (ctx) => globeStage(ctx, {
  pins: ['toulouse', 'london', 'amsterdam', 'berlin'],
  arcs: [['toulouse', 'london'], ['toulouse', 'amsterdam'], ['toulouse', 'berlin']],
  view: { c: [0.3, 0.75, 3.2], w: 3.0, h: 3.0, m: 2.2 },
  spin: (t) => [50, 5 + Math.sin(t * 0.2) * 3],
  lowRes: true,
  k: 0.5,
});

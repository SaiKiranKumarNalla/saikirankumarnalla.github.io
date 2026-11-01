// Small signs of village life, all procedural and cheap: smoke curling from the forge chimney, a waterwheel
// turning in the stream, a little arched bridge over the stream, and stone lanterns (tōrō) that light at dusk.
import * as THREE from 'three';

const stoneMat = new THREE.MeshStandardMaterial({ color: 0x77736f, roughness: 0.95, flatShading: true });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3226, roughness: 0.9, flatShading: true });
const darkWood = new THREE.MeshStandardMaterial({ color: 0x2b1d17, roughness: 0.9, flatShading: true });
const redMat = new THREE.MeshStandardMaterial({ color: 0xa3262a, roughness: 0.8, flatShading: true });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x1d1b24, roughness: 0.85, flatShading: true });

function m(geo, mat, x = 0, y = 0, z = 0, parent) {
  const o = new THREE.Mesh(geo, mat);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  parent?.add(o);
  return o;
}

function softDot(rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, `rgba(${rgb},1)`); grd.addColorStop(0.5, `rgba(${rgb},.45)`); grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── Forge smoke: soft puffs that rise, swell, drift with the wind and fade ──
export function makeSmoke(origin, { count = 14 } = {}) {
  const group = new THREE.Group();
  const tex = softDot('255,255,255');
  const puffs = Array.from({ length: count }, (_, i) => {
    const mat = new THREE.SpriteMaterial({ map: tex, color: 0x7f7a75, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(mat);
    group.add(s);
    return { s, mat, life: i / count, speed: 0.11 + Math.random() * 0.05, spin: Math.random() * 6 };
  });
  let tint = new THREE.Color(0x7f7a75), alpha = 0.5;
  return {
    group,
    setNight(n) { tint = new THREE.Color(n ? 0x5a4c4a : 0x7f7a75); alpha = 0.5; puffs.forEach((p) => p.mat.color.copy(tint)); },
    update(t, dt, w) {
      const wx = (w?.x ?? 0.2), wz = (w?.z ?? 0.1);
      puffs.forEach((p) => {
        p.life += p.speed * dt;
        if (p.life >= 1) { p.life -= 1; p.spin = Math.random() * 6; }
        const L = p.life, rise = L * 7.5;
        // Rises straight at first, then leans with the wind and curls.
        p.s.position.set(
          origin.x + (wx * 6 + 0.6) * L * L + Math.sin(t * 0.8 + p.spin) * 0.3 * L,
          origin.y + rise,
          origin.z + wz * 6 * L * L + Math.cos(t * 0.7 + p.spin) * 0.3 * L,
        );
        p.s.scale.setScalar(0.7 + L * 3.4);
        p.mat.opacity = alpha * Math.min(1, L * 5) * (1 - L) ** 1.1;
        p.mat.rotation = p.spin + L * 1.5;
      });
    },
  };
}

// ── Stone lantern (tōrō): lit from inside at night, plain stone by day ──
function makeToro(glowMats, halos, haloTex) {
  const g = new THREE.Group();
  m(new THREE.CylinderGeometry(0.42, 0.5, 0.25, 6), stoneMat, 0, 0.125, 0, g);
  m(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), stoneMat, 0, 0.7, 0, g);
  m(new THREE.CylinderGeometry(0.38, 0.3, 0.16, 6), stoneMat, 0, 1.22, 0, g);
  const glow = new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffa040, emissiveIntensity: 0, flatShading: true });
  glowMats.push(glow);
  m(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 6), glow, 0, 1.48, 0, g);
  m(new THREE.ConeGeometry(0.55, 0.36, 6), stoneMat, 0, 1.84, 0, g);
  m(new THREE.SphereGeometry(0.09, 8, 6), stoneMat, 0, 2.06, 0, g);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffb060, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  halo.position.y = 1.48; halo.scale.setScalar(1.5);
  g.add(halo); halos.push(halo);
  return g;
}

// ── A small arched bridge over the stream ──
function makeArchBridge(length = 5.2, width = 1.5) {
  const g = new THREE.Group();
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.05, -length / 2), new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0, 0.05, length / 2));
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const p = curve.getPoint(i / N), tan = curve.getTangent(i / N);
    const plank = m(new THREE.BoxGeometry(width, 0.09, length / N * 1.05), darkWood, p.x, p.y, p.z, g);
    plank.rotation.x = -Math.atan2(tan.y, tan.z);
    if (i % 3 === 0) [-1, 1].forEach((s) => m(new THREE.BoxGeometry(0.1, 0.62, 0.1), redMat, s * (width / 2 - 0.05), p.y + 0.31, p.z, g));
  }
  [-1, 1].forEach((s) => {
    const rail = m(new THREE.TubeGeometry(curve, 16, 0.05, 5), redMat, s * (width / 2 - 0.05), 0.62, 0, g);
    rail.castShadow = false;
  });
  return g;
}

// ── Waterwheel (mizuguruma) with a small mill hut ──
function makeWaterwheel() {
  const g = new THREE.Group();
  const wheel = new THREE.Group();
  const R = 1.7, W = 0.7;
  [-W / 2, W / 2].forEach((x) => {
    const rim = m(new THREE.TorusGeometry(R, 0.07, 6, 28), woodMat, x, 0, 0, wheel);
    rim.rotation.y = Math.PI / 2;
  });
  for (let i = 0; i < 8; i++) { // spokes
    const a = (i / 8) * Math.PI;
    [-W / 2, W / 2].forEach((x) => {
      const sp = m(new THREE.BoxGeometry(0.06, R * 2, 0.07), woodMat, x, 0, 0, wheel);
      sp.rotation.x = a;
    });
  }
  for (let i = 0; i < 16; i++) { // paddles
    const a = (i / 16) * Math.PI * 2;
    const pd = m(new THREE.BoxGeometry(W + 0.1, 0.06, 0.42), darkWood, 0, Math.cos(a) * (R - 0.05), Math.sin(a) * (R - 0.05), wheel);
    pd.rotation.x = -a;
  }
  m(new THREE.CylinderGeometry(0.16, 0.16, W + 0.5, 8), darkWood, 0, 0, 0, wheel).rotation.z = Math.PI / 2;
  wheel.position.y = 1.35;
  g.add(wheel);
  // Axle post and a little hut on the bank (+x side).
  m(new THREE.BoxGeometry(0.3, 1.5, 0.3), darkWood, 0.75, 0.75, 0, g);
  const hut = new THREE.Group();
  m(new THREE.BoxGeometry(2.6, 2, 2.4), new THREE.MeshStandardMaterial({ color: 0xcdbfa8, roughness: 0.95, flatShading: true }), 0, 1, 0, hut);
  [-1, 1].forEach((s) => m(new THREE.BoxGeometry(0.16, 2, 0.16), darkWood, s * 1.25, 1, 1.15, hut));
  const roof = m(new THREE.ConeGeometry(2.4, 1.2, 4), roofMat, 0, 2.6, 0, hut);
  roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.95);
  hut.position.x = 2.4;
  g.add(hut);
  return { group: g, wheel };
}

// Everything above, placed relative to the stream and the forge.
export function makeVillageLife({ stream, forgeChimney, lowPower }) {
  const group = new THREE.Group();
  const glowMats = [], halos = [];
  const haloTex = softDot('255,190,110');
  const curve = stream.curve;
  const atRadius = (r) => {
    // Find the stream parameter whose point is ~r from the plaza centre.
    let best = 0, err = Infinity;
    for (let i = 0; i <= 200; i++) { const p = curve.getPointAt(i / 200); const e = Math.abs(Math.hypot(p.x, p.z) - r); if (e < err) { err = e; best = i / 200; } }
    const p = curve.getPointAt(best), tan = curve.getTangentAt(best).setY(0).normalize();
    return { p, tan, side: new THREE.Vector3(tan.z, 0, -tan.x) };
  };

  // Bridge across the stream, with a stone lantern at each end.
  const b = atRadius(36);
  const bridge = makeArchBridge();
  bridge.position.set(b.p.x, 0, b.p.z);
  bridge.rotation.y = Math.atan2(b.side.x, b.side.z); // the deck runs across the flow
  group.add(bridge);
  [-1, 1].forEach((s) => {
    const t = makeToro(glowMats, halos, haloTex);
    t.position.set(b.p.x + b.side.x * 3.4 * s + b.tan.x * 1.2, 0, b.p.z + b.side.z * 3.4 * s + b.tan.z * 1.2);
    group.add(t);
  });

  // Waterwheel further up the stream: the wheel sits at the edge of the water, the hut on the bank.
  const w = atRadius(45);
  const ww = makeWaterwheel();
  ww.group.position.set(w.p.x + w.side.x * 1.1, 0, w.p.z + w.side.z * 1.1);
  ww.group.rotation.y = Math.atan2(w.tan.x, w.tan.z); // axle (local x) runs across the flow, local -z is downstream
  group.add(ww.group);
  const toroWheel = makeToro(glowMats, halos, haloTex);
  toroWheel.position.set(w.p.x + w.side.x * 2.6 - w.tan.x * 3, 0, w.p.z + w.side.z * 2.6 - w.tan.z * 3);
  group.add(toroWheel);

  const smoke = forgeChimney ? makeSmoke(forgeChimney, { count: lowPower ? 9 : 14 }) : null;
  if (smoke) group.add(smoke.group);

  let night = false;
  return {
    group,
    // Spots Kage and the trees should keep clear of.
    footprints: [b.p.clone(), ww.group.position.clone()],
    setNight(n) {
      night = n;
      glowMats.forEach((g) => (g.emissiveIntensity = n ? 1.6 : 0));
      halos.forEach((h) => (h.material.opacity = n ? 0.4 : 0));
      smoke?.setNight(n);
    },
    update(t, dt, wnd) {
      ww.wheel.rotation.x += dt * 0.55; // the bottom of the wheel moves with the current (toward the pond)
      smoke?.update(t, dt, wnd);
      if (night) glowMats.forEach((g, i) => (g.emissiveIntensity = 1.5 + Math.sin(t * 7 + i * 2) * 0.06 + Math.sin(t * 17 + i) * 0.04));
    },
  };
}

// Seasons and wind for the village: the season follows the visitor's month (override with ?season=fall etc.).
// Wind drives everything: tumbling leaves or petals, swaying pampas grass, slanted rain, drifting snow.
import * as THREE from 'three';

export const SEASONS = {
  spring: { ground: 0x93ad6e, crowns: [0xf2a7bf, 0xd97a98, 0xffd1dc], grass: [0x8fae5a, 0xb9cf7a], leaves: [0xffc2d4, 0xf59ab5, 0xffe3ea], fall: 'leaf', count: 260 },
  summer: { ground: 0x8fa860, crowns: [0x4f7f3a, 0x6b9a45, 0x3e6b30], grass: [0x9fb85a, 0xd8c477], leaves: [0x7fae4a, 0xa8c860], fall: 'leaf', count: 90 },
  rainy: { ground: 0x6f8f58, crowns: [0x3f6e3c, 0x557f43, 0x2f5a33], grass: [0x6f9450, 0x8fae62], leaves: [0x5e8c46], fall: 'rain', count: 1400 },
  fall: { ground: 0xa9a26a, crowns: [0xd2542a, 0xe8902f, 0xb8321f, 0xf0b03a], grass: [0xd8b25c, 0xf0d488], leaves: [0xe0602a, 0xf0a030, 0xc23a1c, 0xf4c24a], fall: 'leaf', count: 320 },
  winter: { ground: 0xdfe4e8, crowns: [0xe9eef2, 0xcfd8de, 0xb8c4cc], grass: [0xc9c2a8, 0xe4dfcf], leaves: [0xffffff], fall: 'snow', count: 700 },
};

export function currentSeason() {
  const q = new URLSearchParams(location.search).get('season');
  if (SEASONS[q]) return q;
  const m = new Date().getMonth(); // 0 = January
  if (m >= 2 && m <= 4) return 'spring';
  if (m === 5) return 'summer';
  if (m === 6 || m === 7) return 'rainy';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

// Gusty wind: a steady breeze with slow gusts. Returns strength along +x / +z.
export function wind(t) {
  const gust = Math.max(0, Math.sin(t * 0.35) * Math.sin(t * 0.13 + 1)) * 2.2;
  const s = 0.6 + gust;
  return { x: s, z: s * 0.35, gust };
}

// Pampas / tall grass fields (instanced blades swaying in a vertex shader).
export function makeGrass({ count, inner, outer, avoid, colors }) {
  const geo = new THREE.ConeGeometry(0.11, 1, 3, 1);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true });
  const uniforms = { uTime: { value: 0 }, uWind: { value: 0.6 } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = 'uniform float uTime; uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float bend = position.y * position.y * (0.25 + uWind * 0.35);
      float wave = sin(uTime * 2.2 + wp.x * 0.35 + wp.z * 0.2) * 0.5 + 0.5;
      transformed.x += bend * (0.4 + wave);
      transformed.z += bend * 0.3 * sin(uTime * 1.7 + wp.z * 0.4);`);
  };
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  let placed = 0;
  // Grass grows in clumps, so fields look like meadows rather than noise.
  const clumps = Array.from({ length: 40 }, () => { const a = Math.random() * Math.PI * 2, r = inner + Math.random() * (outer - inner); return [Math.cos(a) * r, Math.sin(a) * r]; });
  for (let i = 0; placed < count && i < count * 4; i++) {
    const [cx, cz] = clumps[i % clumps.length];
    const a = Math.random() * Math.PI * 2, r = Math.random() * 7;
    p.set(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r);
    if (avoid.some((v) => v.distanceTo(p) < 6)) continue;
    const h = 1.4 + Math.random() * 2.2;
    s.set(1, h, 1);
    q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3));
    m.compose(p, q, s);
    mesh.setMatrixAt(placed, m);
    mesh.setColorAt(placed, c.set(colors[0]).lerp(new THREE.Color(colors[1]), Math.random()));
    placed++;
  }
  mesh.count = placed;
  mesh.receiveShadow = true;
  return { mesh, update(t, w) { uniforms.uTime.value = t; uniforms.uWind.value = w.gust; } };
}

// Falling leaves or petals: small tumbling quads blown by the wind.
function makeLeaves(count, colors, spread) {
  const geo = new THREE.PlaneGeometry(0.28, 0.16);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 }), count);
  mesh.frustumCulled = false;
  const st = Array.from({ length: count }, () => ({
    p: new THREE.Vector3((Math.random() - 0.5) * spread, Math.random() * 16, (Math.random() - 0.5) * spread),
    r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    spin: new THREE.Vector3(Math.random() * 3, Math.random() * 3, Math.random() * 3),
    fall: 0.5 + Math.random() * 0.8,
  }));
  const c = new THREE.Color();
  st.forEach((_, i) => mesh.setColorAt(i, c.set(colors[i % colors.length])));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  return {
    object: mesh,
    update(dt, t, w, center) {
      st.forEach((l, i) => {
        l.p.y -= l.fall * dt;
        l.p.x += (w.x * 3 + Math.sin(t * 2 + i) * 0.6) * dt;
        l.p.z += (w.z * 3 + Math.cos(t * 1.5 + i) * 0.5) * dt;
        l.r.x += l.spin.x * dt * (1 + w.gust); l.r.y += l.spin.y * dt; l.r.z += l.spin.z * dt * (1 + w.gust);
        if (l.p.y < 0.05 || Math.abs(l.p.x - center.x) > spread / 2 || Math.abs(l.p.z - center.z) > spread / 2) {
          l.p.set(center.x - spread / 2 + Math.random() * spread * 0.6, 6 + Math.random() * 12, center.z + (Math.random() - 0.5) * spread);
        }
        m.compose(l.p, q.setFromEuler(l.r), one);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// Rain (slanted streaks) or snow (soft points).
function makePrecip(kind, count, spread) {
  const rain = kind === 'rain';
  const pos = new Float32Array(count * (rain ? 6 : 3));
  const seed = (i) => { const x = (Math.random() - 0.5) * spread, y = Math.random() * 24, z = (Math.random() - 0.5) * spread; return [x, y, z]; };
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const object = rain
    ? new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xaab8c8, transparent: true, opacity: 0.45 }))
    : new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.9, depthWrite: false }));
  object.frustumCulled = false;
  const pts = Array.from({ length: count }, seed);
  return {
    object,
    update(dt, t, w, center) {
      pts.forEach((p, i) => {
        p[1] -= (rain ? 26 : 1.6) * dt;
        p[0] += w.x * (rain ? 2 : 1.2) * dt + (rain ? 0 : Math.sin(t + i) * 0.3 * dt);
        p[2] += w.z * dt;
        if (p[1] < 0) { p[0] = center.x + (Math.random() - 0.5) * spread; p[1] = 20 + Math.random() * 4; p[2] = center.z + (Math.random() - 0.5) * spread; }
        if (rain) {
          const k = i * 6;
          pos[k] = p[0]; pos[k + 1] = p[1]; pos[k + 2] = p[2];
          pos[k + 3] = p[0] - w.x * 0.08; pos[k + 4] = p[1] + 0.7; pos[k + 5] = p[2];
        } else { pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; }
      });
      geo.attributes.position.needsUpdate = true;
    },
  };
}

// Wind streaks: faint white ribbons that sweep across the village on gusts.
function makeStreaks(n) {
  const group = new THREE.Group();
  const items = Array.from({ length: n }, () => {
    const pts = Array.from({ length: 12 }, (_, i) => new THREE.Vector3(i * 0.9, Math.sin(i * 0.6) * 0.3, 0));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    group.add(line);
    return { line, life: Math.random() * 6 };
  });
  return {
    object: group,
    update(dt, t, w, center) {
      items.forEach((s) => {
        s.life += dt;
        const d = 3.5;
        if (s.life > d + Math.random() * 4) {
          s.life = 0;
          s.line.position.set(center.x - 30, 1 + Math.random() * 6, center.z + (Math.random() - 0.5) * 50);
        }
        s.line.position.x += (8 + w.gust * 6) * dt;
        s.line.material.opacity = Math.max(0, Math.sin((s.life / d) * Math.PI)) * (0.15 + w.gust * 0.12);
      });
    },
  };
}

export function makeWeather(season, { lowPower, spread = 80 }) {
  const cfg = SEASONS[season];
  const scale = lowPower ? 0.5 : 1;
  const parts = [];
  if (cfg.fall === 'leaf') parts.push(makeLeaves(Math.round(cfg.count * scale), cfg.leaves, spread));
  if (cfg.fall === 'rain' || cfg.fall === 'snow') parts.push(makePrecip(cfg.fall, Math.round(cfg.count * scale), spread));
  if (cfg.fall === 'rain') parts.push(makeLeaves(Math.round(60 * scale), cfg.leaves, spread));
  parts.push(makeStreaks(lowPower ? 4 : 8));
  const group = new THREE.Group();
  parts.forEach((p) => group.add(p.object));
  return { group, update: (dt, t, w, center) => parts.forEach((p) => p.update(dt, t, w, center)) };
}

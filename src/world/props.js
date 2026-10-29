// Procedural low-poly props for the village. Each building faces +Z (the plaza).
import * as THREE from 'three';

const C = {
  wood: 0x2b1d17, woodLight: 0x4a3226, plaster: 0xd9cfbf, roof: 0x1d1b24, red: 0x8b1a1a,
  redGlow: 0xc23b3b, gold: 0xc9a45c, stone: 0x6d6a72, window: 0xffb36b, petal: 0xff9fb8,
  crown: 0xd98aa0, crownDark: 0x7d3a4f, skin: 0xd9b48f, cloth: 0x1f2a44, hat: 0xc8a978,
};
const mats = {};
const mat = (color, extra = {}) => {
  const key = color + JSON.stringify(extra);
  return (mats[key] ||= new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra }));
};

function mesh(geo, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent?.add(m);
  return m;
}
const box = (w, h, d, m, x, y, z, p) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, p);

// Pyramid roof with a thin eave slab: reads as a Japanese hip roof at low poly counts.
function roof(size, height, y, parent, color = C.roof) {
  const r = mesh(new THREE.ConeGeometry(size * 0.75, height, 4, 1), mat(color), 0, y + height / 2, 0, parent);
  r.rotation.y = Math.PI / 4;
  box(size * 1.12, 0.18, size * 1.12, mat(color), 0, y - 0.05, 0, parent);
  return r;
}

function glowWindow(w, h, x, y, z, parent, glowMats) {
  const m = new THREE.MeshStandardMaterial({ color: C.window, emissive: C.window, emissiveIntensity: 1.2, flatShading: true });
  glowMats.push(m);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  win.position.set(x, y, z + 0.01);
  parent.add(win);
  return win;
}

function torii(width, height, parent, z = 0) {
  const g = new THREE.Group();
  const red = mat(C.red);
  box(0.35, height, 0.35, red, -width / 2, 0, 0, g);
  box(0.35, height, 0.35, red, width / 2, 0, 0, g);
  box(width + 1.6, 0.35, 0.5, mat(C.roof), 0, height, 0, g);
  box(width + 0.8, 0.25, 0.35, red, 0, height - 0.9, 0, g);
  g.position.z = z;
  parent.add(g);
  return g;
}

function pagodaTiers(tiers, base, parent, glowMats, startY = 0) {
  let y = startY, size = base;
  for (let i = 0; i < tiers; i++) {
    const h = i === 0 ? 2.6 : 1.9;
    box(size, h, size, mat(i % 2 ? C.plaster : C.woodLight), 0, y, 0, parent);
    glowWindow(size * 0.35, h * 0.45, 0, y + h * 0.55, size / 2, parent, glowMats);
    y += h;
    roof(size + 1.6, 1.3, y, parent);
    y += 0.55;
    size *= 0.74;
  }
  return y;
}

export function makeBuilding(def, { lowPower }) {
  const g = new THREE.Group();
  const glowMats = [];
  const anim = [];
  box(def.footprint * 1.9, 0.45, def.footprint * 1.9, mat(C.stone), 0, 0, 0, g); // plinth

  switch (def.style) {
    case 'pagoda': {
      const top = pagodaTiers(def.tiers || 2, 6, g, glowMats, 0.45);
      mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mat(C.gold), 0, top + 1.6, 0, g);
      torii(3.2, 3.4, g, def.footprint + 1.3);
      break;
    }
    case 'tower': { // The Builder: a 3-tier pagoda crowned by orbiting "agents" around a red core
      const top = pagodaTiers(3, 5.4, g, glowMats, 0.45);
      const coreMat = new THREE.MeshStandardMaterial({ color: C.red, emissive: C.redGlow, emissiveIntensity: 1.6, flatShading: true });
      glowMats.push(coreMat);
      const core = mesh(new THREE.IcosahedronGeometry(0.7, 0), coreMat, 0, top + 1.8, 0, g);
      const orbit = new THREE.Group();
      orbit.position.y = top + 1.8;
      const agentMat = new THREE.MeshStandardMaterial({ color: C.plaster, emissive: C.window, emissiveIntensity: 0.8, flatShading: true });
      glowMats.push(agentMat);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        mesh(new THREE.OctahedronGeometry(0.22, 0), agentMat, Math.cos(a) * 1.9, Math.sin(a * 2) * 0.35, Math.sin(a) * 1.9, orbit);
      }
      g.add(orbit);
      anim.push((t) => { orbit.rotation.y = t * 0.6; core.rotation.y = -t * 0.8; core.position.y = top + 1.8 + Math.sin(t * 1.6) * 0.15; });
      break;
    }
    case 'forge': {
      box(8, 3.2, 6.5, mat(C.woodLight), 0, 0.45, 0, g);
      roof(9.6, 1.6, 3.65, g);
      box(1.3, 4.6, 1.3, mat(C.stone), 2.6, 3.4, -1.4, g); // chimney
      const ember = new THREE.MeshStandardMaterial({ color: 0xff6a2a, emissive: 0xff4a10, emissiveIntensity: 2, flatShading: true });
      glowMats.push(ember);
      const fire = mesh(new THREE.IcosahedronGeometry(0.55, 0), ember, 0, 1.4, 3.6, g);
      box(1.6, 0.9, 0.8, mat(0x26262c, { metalness: 0.6, roughness: 0.4 }), -2.2, 0.45, 4.1, g); // anvil
      glowWindow(2.6, 1.6, 0, 2.1, 3.25, g, glowMats);
      anim.push((t) => { const s = 1 + Math.sin(t * 7) * 0.08 + Math.sin(t * 13) * 0.05; fire.scale.setScalar(s); });
      break;
    }
    case 'library': {
      box(7.4, 2.4, 5.6, mat(C.plaster), 0, 0.45, 0, g);
      box(7.8, 0.3, 6, mat(C.wood), 0, 2.85, 0, g);
      box(6.2, 2, 4.6, mat(C.woodLight), 0, 3.15, 0, g);
      roof(8.8, 1.5, 5.15, g);
      for (let i = -2; i <= 2; i++) glowWindow(0.8, 1.3, i * 1.35, 1.6, 2.8, g, glowMats);
      for (let i = 0; i < 5; i++) { // scroll rack
        const s = mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.5, 8), mat(i % 2 ? C.gold : C.plaster), -3 + i * 0.45, 1.1, 4.2, g);
        s.rotation.z = Math.PI / 2;
      }
      break;
    }
    case 'shrine': {
      box(4.2, 0.9, 4.2, mat(C.wood), 0, 0.45, 0, g);
      box(3.4, 2.4, 3, mat(C.plaster), 0, 1.35, -0.2, g);
      roof(5.2, 1.4, 3.75, g, C.red);
      glowWindow(1.2, 1.4, 0, 2.4, 1.3, g, glowMats);
      torii(3, 3.6, g, def.footprint + 1.4);
      torii(3, 3.6, g, def.footprint + 3.6);
      break;
    }
    case 'stage': { // The Flow: an open stage with a taiko drum and pulsing sound rings
      box(6.6, 0.8, 5.4, mat(C.wood), 0, 0.45, 0, g);
      [[-2.9, -2.3], [2.9, -2.3], [-2.9, 2.3], [2.9, 2.3]].forEach(([x, z]) => box(0.3, 3.4, 0.3, mat(C.red), x, 1.25, z, g));
      roof(7.6, 1.3, 4.65, g);
      const drum = mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.1, 14), mat(C.woodLight), 0, 2.1, 0.5, g);
      drum.rotation.x = Math.PI / 2;
      const ringMat = new THREE.MeshBasicMaterial({ color: C.redGlow, transparent: true, opacity: 0.6 });
      const rings = [0, 1, 2].map(() => {
        const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 6, 40), ringMat.clone());
        r.position.set(0, 2.1, 1.2);
        g.add(r);
        return r;
      });
      anim.push((t) => rings.forEach((r, i) => {
        const p = (t * 0.6 + i / 3) % 1;
        r.scale.setScalar(1 + p * 2.4);
        r.position.z = 1.2 + p * 1.5;
        r.material.opacity = 0.6 * (1 - p);
      }));
      break;
    }
    case 'gate': {
      torii(5, 6.2, g, 0);
      torii(4, 5, g, -3.2);
      box(0.9, 1.4, 0.9, mat(C.stone), -3.4, 0.45, 1.2, g);
      box(0.9, 1.4, 0.9, mat(C.stone), 3.4, 0.45, 1.2, g);
      break;
    }
    case 'lanternTower': { // Kage: a tall stone lantern with a living light
      box(1.8, 0.6, 1.8, mat(C.stone), 0, 0.45, 0, g);
      mesh(new THREE.CylinderGeometry(0.4, 0.55, 4.2, 6), mat(C.stone), 0, 3.15, 0, g);
      box(2.1, 0.35, 2.1, mat(C.stone), 0, 5.25, 0, g);
      const lightMat = new THREE.MeshStandardMaterial({ color: C.window, emissive: C.redGlow, emissiveIntensity: 1.8, flatShading: true });
      glowMats.push(lightMat);
      box(1.3, 1.3, 1.3, lightMat, 0, 5.6, 0, g);
      roof(2.6, 1.1, 6.95, g);
      const wisp = mesh(new THREE.OctahedronGeometry(0.28, 0), lightMat, 0, 8.6, 0, g);
      anim.push((t) => { wisp.position.y = 8.6 + Math.sin(t * 2) * 0.3; wisp.rotation.y = t; });
      break;
    }
  }

  // One warm point light per building (desktop only) sells the lit-window feel cheaply.
  let light = null;
  if (!lowPower) {
    light = new THREE.PointLight(0xffa860, 14, 16, 1.6);
    light.position.set(0, 2.4, def.footprint + 1.5);
    g.add(light);
  }

  const baseIntensity = glowMats.map((m) => m.emissiveIntensity);
  let glow = 1, hover = false;
  const refresh = () => glowMats.forEach((m, i) => (m.emissiveIntensity = baseIntensity[i] * (0.35 + 0.65 * glow) * (hover ? 1.6 : 1)));
  g.userData.setGlow = (v) => { glow = v; if (light) light.intensity = 14 * v; refresh(); };
  g.userData.setHover = (v) => { if (v !== hover) { hover = v; refresh(); } };
  g.userData.animate = (t) => anim.forEach((f) => f(t));
  return g;
}

export function makeTreeInstances({ count, inner, outer, avoid }) {
  const group = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.4, 6);
  trunkGeo.translate(0, 1.2, 0);
  const crownGeo = new THREE.IcosahedronGeometry(1.6, 0);
  const trunks = new THREE.InstancedMesh(trunkGeo, mat(C.wood), count);
  const crowns = new THREE.InstancedMesh(crownGeo, new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), count);
  trunks.castShadow = crowns.castShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const color = new THREE.Color();
  let rng = 7;
  const rand = () => ((rng = (rng * 16807) % 2147483647) / 2147483647); // deterministic layout
  for (let i = 0, placed = 0; placed < count && i < count * 20; i++) {
    const a = rand() * Math.PI * 2, r = inner + rand() * (outer - inner);
    p.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (avoid.some((v) => v.distanceTo(p) < 8)) continue;
    const k = 0.75 + rand() * 0.7;
    s.set(k, k, k);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI);
    m.compose(p, q, s); trunks.setMatrixAt(placed, m);
    m.compose(p.clone().setY(2.6 * k), q, s.clone().multiply(new THREE.Vector3(1, 0.8, 1))); crowns.setMatrixAt(placed, m);
    crowns.setColorAt(placed, color.set(C.crown).lerp(new THREE.Color(C.crownDark), rand() * 0.6));
    placed++;
  }
  group.add(trunks, crowns);
  return group;
}

export function makeLanterns({ count, radius }) {
  const group = new THREE.Group();
  const glowMat = new THREE.MeshStandardMaterial({ color: C.window, emissive: C.window, emissiveIntensity: 1.4, flatShading: true });
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.PI / count;
    const l = new THREE.Group();
    box(0.5, 0.9, 0.5, mat(C.stone), 0, 0, 0, l);
    box(0.55, 0.55, 0.55, glowMat, 0, 0.9, 0, l);
    const cap = mesh(new THREE.ConeGeometry(0.6, 0.45, 4), mat(C.stone), 0, 1.68, 0, l);
    cap.rotation.y = Math.PI / 4;
    l.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    group.add(l);
  }
  let base = 1;
  return {
    group,
    setIntensity: (v) => { base = v; },
    flicker: (t) => { glowMat.emissiveIntensity = (0.4 + base) * (1 + Math.sin(t * 9) * 0.04 + Math.sin(t * 23) * 0.03); },
  };
}

export function makePlayer() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.42, 0.62, 1.5, 8), mat(C.cloth), 0, 0.95, 0, body);
  mesh(new THREE.TorusGeometry(0.47, 0.07, 6, 16), mat(C.red), 0, 1.05, 0, body).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.34, 10, 8), mat(C.skin), 0, 1.95, 0, body);
  mesh(new THREE.ConeGeometry(0.85, 0.42, 14), mat(C.hat), 0, 2.38, 0, body);
  const sword = box(0.07, 1.5, 0.07, mat(0x111111), 0.3, 0.7, -0.45, body);
  sword.rotation.z = 0.6;
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.7, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.03;
  g.add(body, shadow);
  let walk = 0;
  g.userData.animate = (t, moving) => {
    walk += moving ? 0.22 : 0;
    body.position.y = moving ? Math.abs(Math.sin(walk)) * 0.14 : Math.sin(t * 2) * 0.03;
    body.rotation.z = moving ? Math.sin(walk) * 0.06 : 0;
  };
  return g;
}

export function makePetals({ count, spread }) {
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = Math.random() * 18;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    vel[i] = 0.6 + Math.random() * 0.9;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: C.petal, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false }));
  points.frustumCulled = false;
  let t = 0;
  return {
    points,
    update(dt, center) {
      t += dt;
      for (let i = 0; i < count; i++) {
        const k = i * 3;
        pos[k + 1] -= vel[i] * dt;
        pos[k] += Math.sin(t + i) * 0.4 * dt + 0.25 * dt;
        pos[k + 2] += Math.cos(t * 0.7 + i) * 0.3 * dt;
        if (pos[k + 1] < 0) { // respawn above, around the player
          pos[k] = center.x + (Math.random() - 0.5) * spread;
          pos[k + 1] = 14 + Math.random() * 6;
          pos[k + 2] = center.z + (Math.random() - 0.5) * spread;
        }
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

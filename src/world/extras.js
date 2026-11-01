// Extra life for the village, all procedural and cheap (no textures to download):
// koi circling the pond with ripples, sky lanterns rising at night, drifting clouds by day,
// the odd shooting star, and butterflies over the grass in daylight.
import * as THREE from 'three';

// A soft round sprite drawn once on a canvas (shared by lanterns, ripples and stars).
function glow(inner, outer, size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, inner); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── Koi: fish that wander the pond just under the surface ──
// Each fish is a tapered body with flowing fins; a travelling wave bends it from head to tail, faster when it
// swims faster, and it curves into its turns. Patterns are painted per vertex (kohaku, sanke, ogon...).
// The pond's water surface sits at y = 0.32 (see makePond); fish swim between the bed and the surface.
const KOI_PATTERNS = [
  { base: 0xf6f1e8, spots: [0xd8401f, 0xe0522a] }, // kohaku: white with red
  { base: 0xf28a2e, spots: [0xf6f1e8] }, // orange with white
  { base: 0xf4f0e6, spots: [0xd8401f, 0x1c1a1c] }, // sanke: white, red and black
  { base: 0xf0b545, spots: [] }, // ogon: plain gold
  { base: 0xe8542a, spots: [0x1c1a1c] }, // red with black
  { base: 0xf6f1e8, spots: [0x2a2a30] }, // shiro: white with black
  { base: 0xf6d9a8, spots: [0xe8742a] },
];
const SURFACE = 0.32;

function koiBody(pattern) {
  const L = 0.95;
  const geo = new THREE.SphereGeometry(1, 18, 10);
  geo.rotateX(Math.PI / 2); // poles along z
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const base = new THREE.Color(pattern.base), c = new THREE.Color(), belly = new THREE.Color(0xfff6ea);
  const spots = pattern.spots.flatMap((hex) => Array.from({ length: 2 }, () => ({ c: new THREE.Color(hex), u: 0.25 + Math.random() * 0.7, x: (Math.random() - 0.5) * 0.9, r: 0.12 + Math.random() * 0.14 })));
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i), ring = Math.sqrt(Math.max(1e-6, 1 - z * z));
    const nx = pos.getX(i) / ring, ny = pos.getY(i) / ring;
    const u = (z + 1) / 2; // 0 = tail, 1 = snout
    // Widest at the shoulders, a slim tail stem, a rounded head.
    const w = 0.14 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.65) + 0.012;
    pos.setXYZ(i, nx * w, ny * w * 0.78, (u - 0.6) * L);
    c.copy(ny < -0.25 ? belly : base);
    if (ny > -0.2) spots.forEach((s) => { if (Math.hypot((u - s.u) * 1.6, nx - s.x) < s.r * 1.8) c.copy(s.c); });
    if (u > 0.93) c.lerp(new THREE.Color(0x000000), 0.15); // a hint of a face
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return { geo, L };
}

function koiTail() {
  // A soft fan, a little longer at the outer lobes, laid nearly flat (how a koi tail reads from above).
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.quadraticCurveTo(0.14, -0.1, 0.16, -0.3);
  sh.quadraticCurveTo(0.05, -0.22, 0, -0.24);
  sh.quadraticCurveTo(-0.05, -0.22, -0.16, -0.3);
  sh.quadraticCurveTo(-0.14, -0.1, 0, 0);
  const g = new THREE.ShapeGeometry(sh, 6); g.rotateX(Math.PI / 2); // shape -y becomes -z: the fan trails behind
  return g;
}

export function makeKoi(x, z, { count = 6, radius = 3.3 } = {}) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const tailGeo = koiTail();
  const finGeo = new THREE.CircleGeometry(0.08, 10); finGeo.scale(1, 0.55, 1); finGeo.rotateX(-Math.PI / 2); finGeo.translate(0.07, 0, 0);
  const fish = Array.from({ length: count }, (_, i) => {
    const pattern = KOI_PATTERNS[i % KOI_PATTERNS.length];
    const { geo, L } = koiBody(pattern);
    const tg = tailGeo.clone();
    const finMat = new THREE.MeshStandardMaterial({ color: pattern.base, transparent: true, opacity: 0.7, side: THREE.DoubleSide, roughness: 0.6, depthWrite: false });
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, emissive: 0xffffff, emissiveIntensity: 0.04 }));
    const tail = new THREE.Mesh(tg, finMat);
    tail.position.z = -0.6 * L + 0.02;
    const f = new THREE.Group();
    f.add(mesh, tail);
    const fins = [1, -1].map((s) => { const m = new THREE.Mesh(finGeo, finMat); m.scale.x = s; m.position.set(0.06 * s, -0.02, 0.1); f.add(m); return m; });
    const k = 0.75 + Math.random() * 0.45; // sizes vary
    f.scale.setScalar(k);
    group.add(f);
    const a = Math.random() * Math.PI * 2, r = Math.random() * radius * 0.7;
    return {
      f, mesh, tail, fins, L, k, base: geo.attributes.position.array.slice(), tbase: tg.attributes.position.array.slice(),
      x: Math.cos(a) * r, z: Math.sin(a) * r, head: Math.random() * Math.PI * 2, speed: 0.3, turn: 0, wave: Math.random() * 6,
      seed: Math.random() * 100, depth: 0.15 + Math.random() * 0.05, rise: 0,
    };
  });

  // Rings that spread and fade where a fish noses the surface; and a few lily pads to give the surface a plane.
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  const ripples = Array.from({ length: 4 }, () => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 40), rippleMat.clone());
    m.rotation.x = -Math.PI / 2; m.position.y = SURFACE + 0.012; m.visible = false;
    group.add(m);
    return { m, life: 1 };
  });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.28 + Math.random() * 0.12, 14, 0.3, Math.PI * 2 - 0.6), padMat);
    const a = i * 1.1 + Math.random() * 0.5, r = radius * (0.55 + Math.random() * 0.4);
    pad.rotation.set(-Math.PI / 2, 0, Math.random() * 6);
    pad.position.set(Math.cos(a) * r, SURFACE + 0.008, Math.sin(a) * r);
    group.add(pad);
  }

  const bend = (arr, out, k, zHead, L, amp, wave, curve) => {
    for (let i = 0; i < arr.length; i += 3) {
      const z = arr[i + 2], back = Math.min(1, Math.max(0, (zHead - z) / L)); // 0 at the snout, 1 at the tail tip
      out[i] = arr[i] + (Math.sin(z * 7 - wave) * amp * back * back + curve * back * back);
    }
  };
  let nextRipple = 1.5;
  return {
    group,
    update(t, dt) {
      fish.forEach((k) => {
        // Wander: a slowly varying turn rate, steering back inside the pond near the rim, and apart from each other.
        let want = Math.sin(t * 0.37 + k.seed) * 0.5 + Math.sin(t * 0.13 + k.seed * 2) * 0.4;
        const r = Math.hypot(k.x, k.z);
        if (r > radius - 0.9) {
          const inward = Math.atan2(-k.x, -k.z);
          let d = ((inward - k.head + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          want += d * 1.6 * Math.min(1, (r - (radius - 0.9)) / 0.6 + 0.3);
        }
        fish.forEach((o) => {
          if (o === k) return;
          const dx = k.x - o.x, dz = k.z - o.z, dd = Math.hypot(dx, dz);
          if (dd < 0.7 && dd > 1e-3) {
            const away = Math.atan2(dx, dz);
            want += ((((away - k.head + Math.PI * 3) % (Math.PI * 2)) - Math.PI)) * 0.6 * (1 - dd / 0.7);
          }
        });
        want = Math.max(-1.3, Math.min(1.3, want));
        k.turn += (want - k.turn) * Math.min(1, dt * 1.5);
        k.head += k.turn * dt;
        // Cruise with occasional lazy surges.
        const surge = Math.max(0, Math.sin(t * 0.21 + k.seed * 3)) ** 4;
        k.speed += ((0.22 + surge * 0.45) * k.k - k.speed) * Math.min(1, dt * 1.2);
        k.x += Math.sin(k.head) * k.speed * dt;
        k.z += Math.cos(k.head) * k.speed * dt;
        k.rise = Math.max(0, k.rise - dt * 0.5);
        k.f.position.set(k.x, k.depth + Math.sin(t * 0.6 + k.seed) * 0.015 + k.rise * 0.07, k.z);
        k.f.rotation.y = k.head;
        // Swimming wave: tail beats faster when swimming faster; the body bows into the turn.
        k.wave += dt * (5 + k.speed * 18);
        const amp = 0.035 + k.speed * 0.09, curve = -k.turn * 0.07;
        const zHead = 0.4 * k.L;
        const pa = k.mesh.geometry.attributes.position;
        bend(k.base, pa.array, k, zHead, k.L, amp, k.wave, curve); pa.needsUpdate = true;
        // The tail fin rides the end of the wave.
        const tz = -0.6 * k.L;
        const tailX = Math.sin(tz * 7 - k.wave) * amp + curve;
        k.tail.position.x = tailX;
        k.tail.rotation.y = Math.cos(tz * 7 - k.wave) * amp * 7 * 0.35 + curve * 2;
        k.fins.forEach((m, j) => { m.rotation.z = (j ? -1 : 1) * (0.25 + Math.sin(t * 3 + k.seed + j) * 0.2); });
      });
      // Now and then a fish rises to the surface and leaves a ring.
      if (t > nextRipple) {
        nextRipple = t + 1.5 + Math.random() * 3;
        const free = ripples.find((p) => p.life >= 1);
        const k = fish[Math.floor(Math.random() * fish.length)];
        if (free && k) {
          k.rise = 1;
          free.life = 0; free.m.visible = true;
          free.m.position.x = k.x + Math.sin(k.head) * 0.35 * k.k; free.m.position.z = k.z + Math.cos(k.head) * 0.35 * k.k;
        }
      }
      ripples.forEach((p) => {
        if (p.life >= 1) return;
        p.life = Math.min(1, p.life + dt * 0.45);
        p.m.scale.setScalar(0.08 + p.life * 0.9);
        p.m.material.opacity = (1 - p.life) * 0.3;
        if (p.life >= 1) p.m.visible = false;
      });
    },
  };
}

// ── Sky lanterns: warm paper lanterns released from the village, rising and drifting at night ──
export function makeSkyLanterns({ count = 18 } = {}) {
  const group = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.32, 0.24, 0.62, 8, 1, true);
  const halo = new THREE.SpriteMaterial({ map: glow('rgba(255,190,110,0.9)', 'rgba(255,120,40,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const items = Array.from({ length: count }, () => {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffb070, emissive: 0xff8a3a, emissiveIntensity: 1.6, side: THREE.DoubleSide, transparent: true });
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, mat));
    const s = new THREE.Sprite(halo); s.scale.setScalar(2.2); g.add(s);
    group.add(g);
    const it = { g, mat, sway: Math.random() * 6 };
    reset(it, true);
    return it;
  });
  function reset(it, scatter) {
    const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 22;
    it.g.position.set(Math.cos(a) * r, scatter ? Math.random() * 45 : 2, Math.sin(a) * r);
    it.rise = 0.9 + Math.random() * 0.9;
  }
  let fade = 0, on = false;
  return {
    group,
    setVisible(v) { on = v; },
    update(t, dt, w) {
      fade += ((on ? 1 : 0) - fade) * Math.min(1, dt * 1.5);
      group.visible = fade > 0.01;
      if (!group.visible) return;
      const drift = (w?.x ?? 0.3);
      items.forEach((it) => {
        const p = it.g.position;
        p.y += it.rise * dt;
        p.x += (Math.sin(t * 0.5 + it.sway) * 0.3 + drift * 0.6) * dt;
        p.z += Math.cos(t * 0.4 + it.sway) * 0.3 * dt;
        const life = Math.min(1, p.y / 6) * Math.max(0, 1 - (p.y - 34) / 14); // fade in low, out high
        it.mat.opacity = life * fade;
        it.mat.emissiveIntensity = (1.3 + Math.sin(t * 3 + it.sway) * 0.3) * life * fade;
        it.g.children[1].material.opacity = life * fade;
        if (p.y > 48) reset(it, false);
      });
    },
  };
}

// ── Clouds: a handful of soft low-poly clouds drifting across the daytime sky ──
export function makeClouds({ count = 7 } = {}) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, transparent: true, opacity: 0.92, fog: false });
  const puff = new THREE.IcosahedronGeometry(1, 1);
  const clouds = Array.from({ length: count }, () => {
    const c = new THREE.Group();
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(puff, mat);
      const s = 2.2 + Math.random() * 2.2;
      m.scale.set(s * 1.3, s * 0.7, s);
      m.position.set((i - n / 2) * 2.6 + Math.random(), Math.random() * 1.2, Math.random() * 2 - 1);
      c.add(m);
    }
    const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 60;
    c.position.set(Math.cos(a) * r, 42 + Math.random() * 18, Math.sin(a) * r);
    c.userData.speed = 1.2 + Math.random() * 1.4;
    group.add(c);
    return c;
  });
  let fade = 0, on = false;
  return {
    group,
    setVisible(v) { on = v; },
    update(dt, w) {
      fade += ((on ? 1 : 0) - fade) * Math.min(1, dt * 1.5);
      group.visible = fade > 0.01;
      mat.opacity = 0.92 * fade;
      if (!group.visible) return;
      clouds.forEach((c) => {
        c.position.x += c.userData.speed * (1 + (w?.gust ?? 0)) * dt;
        if (c.position.x > 140) c.position.x = -140;
      });
    },
  };
}

// ── Shooting stars: a bright streak across the night sky every few seconds ──
export function makeShootingStars() {
  const mat = new THREE.MeshBasicMaterial({ map: glow('rgba(255,255,255,1)', 'rgba(255,200,180,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const geo = new THREE.PlaneGeometry(14, 0.35);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;
  const from = new THREE.Vector3(), dir = new THREE.Vector3();
  let life = 1, next = 4, on = false;
  return {
    object: mesh,
    setVisible(v) { on = v; if (!v) mesh.visible = false; },
    update(t, dt, camera) {
      if (!on) return;
      if (life >= 1 && t > next) {
        life = 0; next = t + 5 + Math.random() * 9;
        const a = Math.random() * Math.PI * 2;
        from.set(Math.cos(a) * 140, 80 + Math.random() * 30, Math.sin(a) * 140);
        dir.set(-Math.sin(a), -0.35, Math.cos(a)).normalize();
        mesh.visible = true;
      }
      if (life >= 1) return;
      life = Math.min(1, life + dt * 1.2);
      mesh.position.copy(from).addScaledVector(dir, life * 70);
      mesh.lookAt(camera.position);
      // Align the streak with its direction of travel as seen from the camera.
      const p0 = mesh.position.clone().project(camera), p1 = mesh.position.clone().add(dir).project(camera);
      mesh.rotateZ(Math.atan2(p1.y - p0.y, p1.x - p0.x));
      mat.opacity = Math.sin(life * Math.PI);
      if (life >= 1) mesh.visible = false;
    },
  };
}

// ── Butterflies: little flapping pairs of wings wandering over the grass by day ──
export function makeButterflies({ count = 14 } = {}) {
  const group = new THREE.Group();
  const wing = new THREE.PlaneGeometry(0.32, 0.26); wing.translate(0.16, 0, 0);
  const tints = [0xffd24a, 0xffffff, 0xff8a5a, 0x9ad0ff, 0xf6a0c8];
  const flies = Array.from({ length: count }, (_, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: tints[i % tints.length], side: THREE.DoubleSide });
    const b = new THREE.Group();
    const l = new THREE.Mesh(wing, mat), r = new THREE.Mesh(wing, mat);
    r.scale.x = -1;
    b.add(l, r);
    group.add(b);
    const a = Math.random() * Math.PI * 2, rad = 10 + Math.random() * 22;
    return { b, l, r, cx: Math.cos(a) * rad, cz: Math.sin(a) * rad, s: Math.random() * 10 };
  });
  let on = false;
  return {
    group,
    setVisible(v) { on = v; group.visible = v; },
    update(t) {
      if (!on) return;
      flies.forEach((f) => {
        const u = t * 0.35 + f.s;
        f.b.position.set(f.cx + Math.sin(u) * 3 + Math.sin(u * 2.3) * 1.2, 1.1 + Math.sin(u * 3.1) * 0.5, f.cz + Math.cos(u * 0.8) * 3);
        f.b.rotation.y = Math.atan2(Math.cos(u), -Math.sin(u * 0.8));
        const flap = Math.sin(t * 18 + f.s) * 1.1;
        f.l.rotation.y = flap; f.r.rotation.y = -flap;
      });
    },
  };
}

// Sky, blood moon, stars, distant mountains, fireflies, and extra village props.
import * as THREE from 'three';

function glowTexture(inner = 'rgba(255,120,90,1)', outer = 'rgba(255,40,30,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Vertical-gradient sky dome; colours are swapped for day/night.
export function makeSky() {
  const uniforms = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.55)) : mix(horizon, bottom, pow(-h, 0.4));
      gl_FragColor = vec4(c, 1.0); }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(230, 32, 16), mat);
  dome.renderOrder = -1;
  return {
    mesh: dome,
    set(top, horizon, bottom) { uniforms.top.value.set(top); uniforms.horizon.value.set(horizon); uniforms.bottom.value.set(bottom); },
  };
}

export function makeMoon() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.SphereGeometry(9, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xff5a3c, fog: false })
  );
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,90,60,0.9)', 'rgba(140,10,10,0)'), fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(70, 70, 1);
  // Subtle darker "maria" so it reads as a moon, not a sun.
  const spots = new THREE.Mesh(new THREE.SphereGeometry(9.05, 16, 8), new THREE.MeshBasicMaterial({ color: 0x7a1a14, transparent: true, opacity: 0.35, fog: false }));
  spots.scale.set(0.55, 0.45, 0.2);
  spots.position.set(-2.5, 1.5, 8);
  g.add(halo, disc, spots);
  g.position.set(-70, 62, -150);
  return {
    group: g,
    setNight(on) { disc.material.color.set(on ? 0xff5a3c : 0xfff2d6); halo.material.opacity = on ? 1 : 0.55; spots.visible = on; },
  };
}

export function makeStars(count = 900) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random(), v = Math.random() * 0.45 + 0.08;
    const th = u * Math.PI * 2, ph = Math.acos(1 - v);
    pos.set([Math.sin(ph) * Math.cos(th) * 210, Math.cos(ph) * 210, Math.sin(ph) * Math.sin(th) * 210], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd9cf, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.8, fog: false, depthWrite: false }));
}

export function makeMountains() {
  const g = new THREE.Group();
  const near = new THREE.MeshStandardMaterial({ color: 0x1a0e14, flatShading: true, roughness: 1 });
  const far = new THREE.MeshStandardMaterial({ color: 0x120a10, flatShading: true, roughness: 1 });
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + Math.random() * 0.1;
    const layerFar = i % 2 === 0;
    const r = layerFar ? 150 : 118;
    const h = (layerFar ? 46 : 30) + Math.random() * 22;
    const m = new THREE.Mesh(new THREE.ConeGeometry(18 + Math.random() * 14, h, 5 + (i % 3)), layerFar ? far : near);
    m.position.set(Math.cos(a) * r, h / 2 - 3, Math.sin(a) * r);
    m.rotation.y = Math.random() * Math.PI;
    g.add(m);
  }
  g.userData.mats = [near, far];
  return g;
}

export function makeFireflies(count = 70) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 45;
    pos.set([Math.cos(a) * r, 0.8 + Math.random() * 3, Math.sin(a) * r], i * 3);
    seed[i] = Math.random() * 100;
  }
  const base = pos.slice();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: glowTexture('rgba(255,220,140,1)', 'rgba(255,150,60,0)'), size: 0.9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mat);
  return {
    points,
    update(t) {
      for (let i = 0; i < count; i++) {
        const s = seed[i], k = i * 3;
        pos[k] = base[k] + Math.sin(t * 0.4 + s) * 1.6;
        pos[k + 1] = base[k + 1] + Math.sin(t * 0.9 + s * 2) * 0.6;
        pos[k + 2] = base[k + 2] + Math.cos(t * 0.35 + s) * 1.6;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.65 + Math.sin(t * 2.3) * 0.25;
    },
    setVisible(v) { points.visible = v; },
  };
}

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });

// Koi pond with an arched red bridge, placed between two buildings.
export function makePond(x, z, rotY = 0) {
  const g = new THREE.Group();
  const water = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), new THREE.MeshStandardMaterial({ color: 0x1b2a3a, roughness: 0.08, metalness: 0.6, emissive: 0x2a0a0a, emissiveIntensity: 0.4 }));
  water.rotation.x = -Math.PI / 2; water.position.y = 0.05;
  g.add(water);
  for (let i = 0; i < 16; i++) { // stone rim
    const a = (i / 16) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.25, 0), flat(0x5e5a62));
    s.position.set(Math.cos(a) * 4.4, 0.2, Math.sin(a) * 4.4);
    s.castShadow = true;
    g.add(s);
  }
  const red = flat(0xb02a2a);
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-5, 0.1, 0), new THREE.Vector3(0, 2.4, 0), new THREE.Vector3(5, 0.1, 0));
  const deck = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.08, 4), red);
  for (let i = 0; i <= 10; i++) { // planks + posts
    const p = curve.getPoint(i / 10);
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 1.5), flat(0x3a2620));
    plank.position.copy(p); plank.castShadow = true;
    g.add(plank);
    if (i % 2 === 0) [-0.75, 0.75].forEach((zz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), red);
      post.position.set(p.x, p.y + 0.4, zz);
      g.add(post);
    });
  }
  [-0.75, 0.75].forEach((zz) => {
    const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.06, 4), red);
    rail.position.set(0, 0.8, zz);
    g.add(rail);
  });
  g.add(deck);
  const koi = [0xff7a3c, 0xf2efe6, 0xff4a2a].map((c, i) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 6), flat(c, { emissive: c, emissiveIntensity: 0.15 }));
    f.rotation.z = Math.PI / 2;
    f.userData.phase = i * 2.1;
    g.add(f);
    return f;
  });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  g.userData.animate = (t) => koi.forEach((f) => {
    const a = t * 0.5 + f.userData.phase;
    f.position.set(Math.cos(a) * 2.6, 0.12, Math.sin(a) * 2.6);
    f.rotation.y = -a;
  });
  return g;
}

export function makeBamboo(x, z, count = 9) {
  const g = new THREE.Group();
  const stalk = flat(0x4f6b3a), leaf = flat(0x6f8f4a);
  for (let i = 0; i < count; i++) {
    const h = 6 + Math.random() * 5;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, h, 6), stalk);
    s.position.set((Math.random() - 0.5) * 3, h / 2, (Math.random() - 0.5) * 3);
    s.rotation.z = (Math.random() - 0.5) * 0.12;
    s.castShadow = true;
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 5), leaf);
    top.position.y = h / 2 - 0.4;
    s.add(top);
    g.add(s);
  }
  g.position.set(x, 0, z);
  return g;
}

// Nobori banners on poles, gently waving.
export function makeBanner(x, z, color = 0x8b1a1a) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.5, 6), flat(0x2b1d17));
  pole.position.y = 2.75;
  const geo = new THREE.PlaneGeometry(0.9, 3, 1, 8);
  const cloth = new THREE.Mesh(geo, flat(color, { side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.25 }));
  cloth.position.set(0.5, 3.6, 0);
  const base = geo.attributes.position.array.slice();
  g.add(pole, cloth);
  g.position.set(x, 0, z);
  g.userData.animate = (t) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) p[i + 2] = base[i + 2] + Math.sin(t * 2.2 + base[i + 1] * 1.6) * 0.12 * (base[i] + 0.45);
    geo.attributes.position.needsUpdate = true;
  };
  return g;
}

export function makeRocks(count, inner, outer) {
  const g = new THREE.Group();
  const m = flat(0x55525c);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, r = inner + Math.random() * (outer - inner);
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.9, 0), m);
    s.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
    s.scale.y = 0.6;
    s.rotation.set(Math.random(), Math.random(), Math.random());
    s.castShadow = s.receiveShadow = true;
    g.add(s);
  }
  return g;
}

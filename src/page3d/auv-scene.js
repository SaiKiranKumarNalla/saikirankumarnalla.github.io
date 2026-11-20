// 3D parts of the Black Pearl page, one builder per stage (layout.js stage builders):
//   heroStage       the vehicle swimming among rising bubbles.
//   envelopeStage   the vehicle inside the rule-book envelope (70 × 50 × 50 cm).
//   vcycleStage     the modified V-cycle as a 3D path; a pulse walks it and lights the matching step card.
//   stabilityStage  centre of buoyancy above centre of gravity: the vehicle rolls and rights itself.
//   finalStage      the finished vehicle turning slowly, with its measured envelope.
import { activeStep } from './layout.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// The vehicle (1 unit ≈ 10 cm): 60 × 47 × 37.5 cm. Two hulls in a frame, five thrusters.
function makeVehicle(THREE) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x2b2d3f, metalness: 0.6, roughness: 0.35 });
  const alu = new THREE.MeshStandardMaterial({ color: 0xc9c9cf, metalness: 0.8, roughness: 0.25 });
  const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false });
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 4.6, 48, 1, true), acrylic);
  hull.rotation.z = Math.PI / 2; hull.position.y = 0.5;
  [-2.3, 2.3].forEach((x) => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.18, 48), alu); cap.rotation.z = Math.PI / 2; cap.position.set(x, 0.5, 0); g.add(cap); });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), acrylic);
  dome.rotation.z = -Math.PI / 2; dome.position.set(2.4, 0.5, 0);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshBasicMaterial({ color: 0x1a1a22 }));
  lens.position.set(2.75, 0.5, 0);
  [0x2e7a49, 0x2e7a49, 0x3a5a8a].forEach((c, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 1.2), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 })); b.position.set(-0.8 + i * 1.1, 0.5 + (i - 1) * 0.25, 0); g.add(b); });
  const battery = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.4, 32), metal);
  battery.rotation.z = Math.PI / 2; battery.position.y = -1.05;
  const plateM = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.5, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
  [-2.2, 2.2].forEach((z) => { const plate = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 0.08), plateM); plate.position.set(0, -0.2, z); g.add(plate); });
  [-2, 2].forEach((x) => [-1.6, 1.3].forEach((y) => { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 8), alu); bar.rotation.x = Math.PI / 2; bar.position.set(x, y, 0); g.add(bar); }));
  const props = [];
  const thruster = (pos, axis) => {
    const t = new THREE.Group();
    t.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 24), metal));
    const prop = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.02), alu);
    t.add(prop); props.push(prop);
    t.position.copy(pos);
    if (axis === 'x') t.rotation.y = Math.PI / 2;
    if (axis === 'y') t.rotation.x = Math.PI / 2;
    g.add(t);
  };
  thruster(V(-2.9, 0.2, 1.4), 'x'); thruster(V(-2.9, 0.2, -1.4), 'x');
  thruster(V(0, 1.6, 1.6), 'y'); thruster(V(0, 1.6, -1.6), 'y');
  thruster(V(1.6, -0.6, 2.35), 'z');
  g.add(hull, dome, lens, battery);
  return { group: g, spin: (t) => props.forEach((p) => (p.rotation.z = t * 18)) };
}

function makeBubbles(THREE, n, spread = [12, 10, 6]) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * spread[0], Math.random() * spread[1] - spread[1] / 2, (Math.random() - 0.5) * spread[2]], i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x9fd0ff, size: 0.07, transparent: true, opacity: 0.6, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  const top = spread[1] / 2;
  return {
    points: pts,
    theme: (pal) => mat.color.set(pal.night ? 0x9fd0ff : 0x3a78b8),
    step(dt) { for (let i = 0; i < n; i++) { pos[i * 3 + 1] += dt * (0.6 + (i % 5) * 0.15); if (pos[i * 3 + 1] > top) pos[i * 3 + 1] = -top; } geo.attributes.position.needsUpdate = true; },
  };
}

const view = (THREE, c, w, h, dir) => ({ c: new THREE.Vector3(...c), w, h, dir: new THREE.Vector3(...dir).normalize() });

export function heroStage(ctx) {
  const { THREE, scene, reduceMotion, lowPower } = ctx;
  const v = makeVehicle(THREE), b = makeBubbles(THREE, lowPower ? 80 : 140, [16, 11, 8]);
  scene.add(v.group, b.points);
  ctx.view = view(THREE, [0, 0.1, 0], 9, 6.6, [1, 0.42, 0.62]);
  return {
    theme: b.theme,
    update(t, dt) {
      v.spin(t);
      v.group.position.set(Math.sin(t * 0.4) * 0.5, Math.sin(t * 0.7) * 0.22, 0);
      v.group.rotation.set(Math.sin(t * 0.5) * 0.05, 0.25 + Math.sin(t * 0.3) * 0.18, 0);
      if (!reduceMotion) b.step(dt);
    },
  };
}

export function envelopeStage(ctx) {
  const { THREE, scene, tag, reduceMotion } = ctx;
  const v = makeVehicle(THREE);
  const envMat = new THREE.LineBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.9 });
  const env = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7, 5, 5)), envMat);
  env.position.y = 0.1;
  scene.add(v.group, env);
  const p = new THREE.Vector3();
  tag('<b>Rule book</b><span>&lt; 70 × 50 × 50 cm · &lt; 40 kg</span>', () => p.set(0, 3.1, 0));
  ctx.view = view(THREE, [0, 0.2, 0], 10.6, 8.4, [0.8, 0.5, 1]);
  return {
    theme: (pal) => envMat.color.set(pal.night ? 0xff6a4a : pal.accent),
    update(t, dt, s) {
      v.spin(t);
      v.group.rotation.y = reduceMotion ? 0.3 : 0.3 + t * 0.15;
      envMat.opacity = 0.35 + 0.6 * clamp01((s.progress - 0.15) / 0.3);
    },
  };
}

export const VNAMES = ['Requirements', 'System design', 'Virtual prototype', 'Decision matrix', 'Physical prototype', 'System tests', 'Competition'];
export function vcycleStage(ctx) {
  const { THREE, scene, tag, reduceMotion } = ctx;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const vPts = [V(-3.5, 2.2, 0), V(-2.3, 0.7, 0), V(-1.2, -0.8, 0), V(0, -2, 0), V(1.2, -0.8, 0), V(2.3, 0.7, 0), V(3.5, 2.2, 0)];
  const curve = new THREE.CatmullRomCurve3(vPts, false, 'catmullrom', 0);
  const tubeM = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.45 });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.05, 8), tubeM));
  const nodes = vPts.map((p, i) => {
    const m = new THREE.MeshStandardMaterial({ color: i === 3 ? 0xffc46b : 0xd24a4a, emissive: i === 3 ? 0xffb36b : 0x8b1a1a, emissiveIntensity: 0.6 });
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), m);
    n.position.copy(p);
    scene.add(n);
    const t = tag(`<b>${VNAMES[i]}</b>`, () => p, i < 3 ? 'lk-tag-l' : i > 3 ? 'lk-tag-r' : '');
    if (i === 3) t.el.classList.add('vc-below');
    return { n, m };
  });
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  scene.add(pulse);
  // Arm labels: verification down the left, validation up the right.
  const al = V(-3.2, -0.6, 0), ar = V(3.2, -0.6, 0);
  tag('<span>Verification</span>', () => al, 'lk-tag-chip');
  tag('<span>Validation</span>', () => ar, 'lk-tag-chip');
  ctx.view = view(THREE, [0, 0.15, 0], 10.4, 5.6, [0, 0.1, 1]);
  let u = 0, hold = 0, at = -1;
  document.addEventListener('lk-step', (e) => { if (e.detail.id === 'vcycle') { u = e.detail.index / 6; hold = 4; } });
  return {
    theme: (pal) => { tubeM.color.set(pal.ink); pulse.material.color.set(pal.night ? 0xffffff : 0x2a2226); },
    update(t, dt, s) {
      ctx.view.w = s.narrow ? 13.6 : 10.4; // phones: room for the node labels at the ends of the V
      if (reduceMotion) u = hold > 0 ? u : 0.5;
      else if (hold > 0) hold -= dt;
      else u = (u + dt * 0.07) % 1;
      pulse.position.copy(curve.getPointAt(u));
      const k = Math.round(u * 6);
      nodes.forEach((n, i) => { const on = i === k; n.n.scale.setScalar(on ? 1.6 : 1); n.m.emissiveIntensity = on ? 1.4 : 0.6; });
      if (k !== at) { at = k; activeStep('vcycle', k); }
    },
  };
}

export function stabilityStage(ctx) {
  const { THREE, scene, tag, reduceMotion } = ctx;
  const v = makeVehicle(THREE);
  const rig = new THREE.Group();
  rig.add(v.group);
  scene.add(rig);
  const dot = (color) => new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true }));
  const cb = dot(0x4aa8ff), cg = dot(0xff5a3c);
  cb.position.set(0, 0.55, 0); cg.position.set(0, -0.75, 0);
  cb.renderOrder = cg.renderOrder = 2;
  rig.add(cb, cg);
  const lineM = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 });
  const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2.6, 0), new THREE.Vector3(0, 2.6, 0)]), lineM);
  rig.add(axis);
  // Leader lines from each marker out to its label, beside the hull (seen from the front, -z is screen right).
  const aB = new THREE.Vector3(0, 0.55, -3.6), aG = new THREE.Vector3(0, -0.75, -3.6);
  rig.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([cb.position, aB, cg.position, aG]), lineM));
  const pb = new THREE.Vector3(), pg = new THREE.Vector3();
  tag('<b>Centre of buoyancy</b><span>pushes up</span>', () => rig.localToWorld(pb.copy(aB)), 'lk-tag-r');
  tag('<b>Centre of gravity</b><span>pulls down, below it</span>', () => rig.localToWorld(pg.copy(aG)), 'lk-tag-r');
  ctx.view = view(THREE, [0, 0, -1.2], 7.4, 6.4, [1, 0.18, 0.1]);
  return {
    theme: (pal) => lineM.color.set(pal.ink),
    update(t) {
      v.spin(t);
      // A damped roll: knocked over, then the righting moment brings it back upright.
      const L = 7, q = reduceMotion ? 0.12 : (t % L) / L;
      rig.rotation.x = 0.5 * Math.exp(-q * 5) * Math.cos(q * 18);
    },
  };
}

export function finalStage(ctx) {
  const { THREE, scene, tag, reduceMotion, lowPower } = ctx;
  const v = makeVehicle(THREE), b = makeBubbles(THREE, lowPower ? 60 : 110);
  scene.add(v.group, b.points);
  const p = new THREE.Vector3();
  tag('<b>60 × 47 × 37.5 cm</b><span>20.6 kg · +2.91 % buoyancy · 5 DOF</span>', () => v.group.getWorldPosition(p).add(new THREE.Vector3(0, 2.6, 0)));
  ctx.view = view(THREE, [0, 0.2, 0], 9, 6.8, [1, 0.4, 0.75]);
  return {
    theme: b.theme,
    update(t, dt) {
      v.spin(t);
      v.group.rotation.y = reduceMotion ? 0.6 : t * 0.3;
      v.group.position.y = Math.sin(t * 0.7) * 0.2;
      if (!reduceMotion) b.step(dt);
    },
  };
}

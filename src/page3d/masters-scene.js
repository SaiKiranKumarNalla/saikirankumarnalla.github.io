// 3D parts of the Master's thesis page (microwave ablation), one stage each (layout.js stage builders):
//   heroStage   a tissue block, the antenna entering from the left, and an ablation zone that keeps growing.
//   sinkStage   the same burn with a blood vessel beside the tip; the vessel moves 3 / 7 / 11 mm away and
//               the zone is pulled out of shape (heat sink).
//   radioStage  radiometric sensing: rings travel back along the antenna and shells show the temperature field.
//   simStage    the simulation view: liver and lung side by side; in lung the zone grows along the antenna.
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Materials follow the theme: faces and lines use pal.ink / pal.inkSoft, the zone uses pal.accent / pal.warm.
function themed() {
  const L = { ink: [], soft: [], acc: [], warm: [], hot: [] };
  const reg = (k) => (m) => { L[k].push(m); return m; };
  return {
    ink: reg('ink'), soft: reg('soft'), acc: reg('acc'), warm: reg('warm'), hot: reg('hot'),
    apply(p) {
      L.ink.forEach((m) => m.color.set(p.ink)); L.soft.forEach((m) => m.color.set(p.inkSoft));
      L.acc.forEach((m) => m.color.set(p.accent)); L.warm.forEach((m) => m.color.set(p.warm)); L.hot.forEach((m) => m.color.set(p.hot));
    },
  };
}

// Tissue block with the antenna entering from the left; the radiating tip sits near the origin. The ablation
// zone is a congestion rim (accent) around a coagulation core (warm).
function tissue(THREE, T, kind) {
  const g = new THREE.Group();
  const box = new THREE.BoxGeometry(6.4, 3.4, 4);
  g.add(new THREE.Mesh(box, kind === 'lung' ? T.soft(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.1, depthWrite: false, roughness: 0.6 })) : T.acc(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.1, depthWrite: false, roughness: 0.6 }))));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), T.ink(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 }))));
  const metal = T.soft(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.5 }));
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 6, 16), metal);
  antenna.rotation.z = Math.PI / 2; antenna.position.x = -3;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 16), metal);
  tip.rotation.z = -Math.PI / 2; tip.position.x = 0.1;
  g.add(antenna, tip);
  const rim = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), T.acc(new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5, depthWrite: false, roughness: 0.5 })));
  const core = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), T.warm(new THREE.MeshStandardMaterial({ roughness: 0.6, transparent: true, opacity: 0.92 })));
  g.add(rim, core);
  g.userData = { rim, core, kind };
  return g;
}

// A burn that keeps growing and restarting.
const growth = (t, reduceMotion) => (reduceMotion ? 0.95 : 0.35 + ((t * 0.18) % 1) * 0.95);

function setZone(g, grow, squash = 0) {
  const { rim, core, kind } = g.userData;
  if (kind === 'lung') {
    rim.scale.set(2.1 * grow, grow * 0.7, grow * 0.7); rim.position.x = -0.6 * grow;
    core.scale.set(1.05 * grow * 1.43, grow * 0.45, grow * 0.45); core.position.x = rim.position.x;
  } else {
    rim.scale.set(1.45 * grow, grow, grow * (1 - squash)); rim.position.set(-0.2, 0, squash * 0.6 * grow);
    core.scale.set(1.05 * grow * 0.7, grow * 0.7, grow * 0.7 * (1 - squash)); core.position.copy(rim.position);
  }
}

const frame = (ctx, c, w, h, dir) => { const { THREE } = ctx; ctx.view = { c: new THREE.Vector3(...c), w, h, dir: new THREE.Vector3(...dir).normalize() }; };

export function heroStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const T = themed();
  const liver = tissue(THREE, T, 'liver');
  scene.add(liver);
  frame(ctx, [-1.6, 0, 0], 8.6, 5.2, [0.4, 0.5, 1]);
  const at = new THREE.Vector3();
  ctx.tag('<b>Microwave antenna</b><span>2.45 GHz</span>', () => at.set(-4.6, 0.2, 0));
  const zt = new THREE.Vector3();
  ctx.tag('<b>Ablation zone</b>', () => zt.copy(liver.userData.rim.position).add({ x: 0, y: liver.userData.rim.scale.y + 0.2, z: 0 }));
  return {
    theme: (pal) => T.apply(pal),
    update(t) { setZone(liver, growth(t, reduceMotion)); },
  };
}

export function sinkStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const T = themed();
  const liver = tissue(THREE, T, 'liver');
  scene.add(liver);
  const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6.4, 24), T.acc(new THREE.MeshStandardMaterial({ roughness: 0.4 })));
  vessel.rotation.z = Math.PI / 2;
  scene.add(vessel);
  const flowM = T.hot(new THREE.MeshBasicMaterial());
  const flow = [...Array(24)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), flowM); m.userData.u = i / 24; scene.add(m); return m; });
  frame(ctx, [-0.8, 0, -0.6], 9.6, 6.6, [0.18, 1.0, 0.7]);
  const vp = new THREE.Vector3();
  let narrow = false;
  const vt = ctx.tag('<b>Blood vessel</b><span>3 mm from the tip</span>', () => vp.copy(vessel.position).setX(narrow ? 1.2 : 3.4), 'lk-tag-r');
  const label = vt.el.querySelector('span');
  let last = -1;
  return {
    theme: (pal) => T.apply(pal),
    update(t, dt, st) {
      if (st.narrow !== narrow) { narrow = st.narrow; vt.el.classList.toggle('lk-tag-r', !narrow); }
      const time = reduceMotion ? 3 : t;
      const grow = growth(time, reduceMotion);
      const idx = reduceMotion ? 0 : Math.floor(time * 0.18) % 3; // 3 / 7 / 11 mm
      const vz = -(0.9 + idx * 0.55);
      vessel.position.set(0, 0, vz);
      flow.forEach((m) => m.position.set(-3.2 + ((m.userData.u + time * 0.4) % 1) * 6.4, 0, vz));
      setZone(liver, grow, 0.45 * (1 - idx * 0.25));
      if (idx !== last) { last = idx; label.textContent = `${[3, 7, 11][idx]} mm from the tip`; }
    },
  };
}

export function radioStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const T = themed();
  const liver = tissue(THREE, T, 'liver');
  scene.add(liver);
  const ringM = T.warm(new THREE.MeshBasicMaterial({ transparent: true }));
  const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 32), ringM.clone()); T.warm(r.material); r.rotation.y = Math.PI / 2; scene.add(r); return r; });
  // Temperature field around the antenna: three shells.
  const shells = [1.2, 1.9, 2.6].map((r, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), T.ink(new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.1 - i * 0.02 }))); m.scale.set(1.3, 0.85, 0.85); m.position.x = -0.4; scene.add(m); return m; });
  frame(ctx, [-1.8, 0, 0], 10.6, 5.8, [0.3, 0.45, 1]);
  const rp = new THREE.Vector3();
  ctx.tag('<b>Radiometer</b><span>reads heat back</span>', () => rp.set(-4.8, 0.2, 0));
  const sp = new THREE.Vector3();
  ctx.tag('<b>Temperature field</b>', () => sp.set(-0.4, 2.4, 0));
  return {
    theme: (pal) => T.apply(pal),
    update(t) {
      const time = reduceMotion ? 3 : t;
      setZone(liver, growth(time, reduceMotion));
      rings.forEach((r, i) => { const k = reduceMotion ? i / 3 : (time * 0.6 + i / 3) % 1; r.position.set(-0.2 - k * 2.5, 0, 0); r.material.opacity = clamp01(1 - k); });
      shells.forEach((s, i) => s.scale.set(1.3 * (0.9 + 0.1 * Math.sin(time * 1.2 + i)), 0.85, 0.85));
    },
  };
}

export function simStage(ctx) {
  const { THREE, scene, reduceMotion } = ctx;
  const T = themed();
  const liver = tissue(THREE, T, 'liver'); liver.position.set(0, 2.3, 0);
  const lung = tissue(THREE, T, 'lung'); lung.position.set(0, -2.3, 0);
  scene.add(liver, lung);
  const iso = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), T.acc(new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.45 })));
  liver.add(iso);
  frame(ctx, [-1.4, 0, 0], 10.6, 9.4, [0.2, 0.5, 1]);
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  let narrow = false;
  const tl = ctx.tag('<b>Liver</b><span>round zone, vessel asymmetry</span>', () => (narrow ? a.set(1.2, 4.1, 0) : a.set(3.4, 2.3, 0)), 'lk-tag-r');
  const tu = ctx.tag('<b>Lung</b><span>grows along the antenna</span>', () => (narrow ? b.set(1.2, -0.5, 0) : b.set(3.4, -2.3, 0)), 'lk-tag-r');
  return {
    theme: (pal) => T.apply(pal),
    update(t, dt, st) {
      if (st.narrow !== narrow) { narrow = st.narrow; for (const x of [tl, tu]) x.el.classList.toggle('lk-tag-r', !narrow); }
      const grow = growth(t, reduceMotion);
      setZone(liver, grow, 0.3); setZone(lung, grow);
      const r = liver.userData.rim;
      iso.scale.copy(r.scale).multiplyScalar(1.15); iso.position.copy(r.position);
    },
  };
}

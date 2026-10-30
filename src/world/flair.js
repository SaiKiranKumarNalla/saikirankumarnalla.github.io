// Cinematic touches for the village: light shafts through the trees, a wind trail that points the way,
// and an eagle circling overhead.
import * as THREE from 'three';

// Soft additive light shafts slanting down through the tree belt.
export function makeGodRays({ count = 9, radius = 36 }) {
  const group = new THREE.Group();
  const geo = new THREE.CylinderGeometry(1.2, 3.4, 34, 12, 1, true);
  geo.translate(0, -17, 0);
  const tex = (() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 64;
    const g = c.getContext('2d'), grd = g.createLinearGradient(0, 0, 0, 64);
    grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.35, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 4, 64);
    return new THREE.CanvasTexture(c);
  })();
  const rays = Array.from({ length: count }, (_, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd8a0, map: tex, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const m = new THREE.Mesh(geo, mat);
    const a = (i / count) * Math.PI * 2 + 0.3;
    m.position.set(Math.cos(a) * radius, 30, Math.sin(a) * radius);
    m.rotation.set(0.35, 0, -0.45); // slant along the sun direction
    group.add(m);
    return { m, phase: Math.random() * 6 };
  });
  return {
    group,
    setStyle(color, strength) { rays.forEach((r) => r.m.material.color.set(color)); group.userData.strength = strength; group.visible = strength > 0; },
    update(t) { const s = group.userData.strength ?? 0.12; rays.forEach((r) => (r.m.material.opacity = s * (0.6 + 0.4 * Math.sin(t * 0.4 + r.phase)))); },
  };
}

// A guiding wind trail: a ribbon of flowing dashes from Kage to the building under the cursor.
export function makeWindTrail() {
  const N = 40;
  const geo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: N }, () => new THREE.Vector3()));
  const mat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.9, gapSize: 0.7, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const line = new THREE.Line(geo, mat);
  line.frustumCulled = false;
  let target = null, alpha = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), mid = new THREE.Vector3(), side = new THREE.Vector3();
  return {
    object: line,
    point(from, to) { target = to ? [from, to] : null; },
    update(t, dt) {
      alpha += ((target ? 1 : 0) - alpha) * Math.min(1, dt * 5);
      mat.opacity = alpha * 0.85;
      line.visible = alpha > 0.02;
      if (!target) return;
      a.copy(target[0]).setY(1.2); b.copy(target[1]).setY(1.2);
      side.subVectors(b, a).cross(new THREE.Vector3(0, 1, 0)).normalize();
      const pos = geo.attributes.position;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        mid.lerpVectors(a, b, u);
        mid.addScaledVector(side, Math.sin(u * Math.PI * 2 + t * 3) * 0.8 * Math.sin(u * Math.PI));
        mid.y += Math.sin(u * Math.PI) * 2.2;
        pos.setXYZ(i, mid.x, mid.y, mid.z);
      }
      pos.needsUpdate = true;
      line.computeLineDistances();
      mat.dashOffset = -t * 3; // dashes flow toward the building
    },
  };
}

// An eagle gliding in wide circles above the village, with the occasional wing beat.
export function makeEagle() {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.8, flatShading: true });
  const light = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.8, flatShading: true });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 5), dark);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 5), light);
  head.position.z = 1.15; g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0xe0a020 }));
  beak.rotation.x = Math.PI / 2; beak.position.z = 1.45; g.add(beak);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.6), dark);
  tail.position.z = -1.2; g.add(tail);
  const wing = (s) => {
    const w = new THREE.Group();
    const shape = new THREE.Shape([new THREE.Vector2(0, 0.4), new THREE.Vector2(2.6 * s, 0.1), new THREE.Vector2(3.2 * s, -0.4), new THREE.Vector2(0, -0.5)]);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: 0x4a3426, side: THREE.DoubleSide, flatShading: true }));
    m.rotation.x = -Math.PI / 2;
    w.add(m);
    g.add(w);
    return w;
  };
  const wings = [wing(-1), wing(1)];
  g.scale.setScalar(1.2);
  return {
    object: g,
    update(t) {
      const a = t * 0.12, r = 34;
      g.position.set(Math.cos(a) * r, 30 + Math.sin(t * 0.3) * 2, Math.sin(a) * r);
      g.rotation.set(0, -a, 0.35); // bank into the turn
      const beat = Math.sin(t * 0.5) > 0.7 ? Math.sin(t * 9) * 0.5 : 0.08; // mostly gliding
      wings[0].rotation.z = beat; wings[1].rotation.z = -beat;
    },
  };
}

// Cinematic touches for the village: light shafts through the trees, a wind trail that points the way,
// and black kites circling overhead.
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

// Black kites (tobi), the bird you actually see over Japanese towns: they soar in wide thermal
// circles on long, fingered wings, banking into the turn, with a short burst of deep wing beats now and then.
// Each wing has an arm and a hand section, so a beat bends at the wrist instead of flapping like a plank.
function wingGeometries() {
  // Shapes are drawn in x (span, outward) and y (= forward), then laid flat.
  const arm = new THREE.Shape();
  arm.moveTo(0, 0.2); arm.lineTo(1.25, 0.24); arm.lineTo(1.25, -0.36);
  arm.quadraticCurveTo(0.7, -0.52, 0, -0.42); arm.closePath();
  const hand = new THREE.Shape();
  hand.moveTo(0, 0.24);
  hand.quadraticCurveTo(0.7, 0.24, 1.15, 0.06);
  // Five slotted primaries ("fingers") along the outer trailing edge.
  const tips = [[1.42, -0.02], [1.46, -0.12], [1.42, -0.22], [1.32, -0.31], [1.16, -0.38]];
  tips.forEach(([x, y], k) => {
    hand.lineTo(x, y);
    const n = tips[k + 1];
    if (n) hand.lineTo((x + n[0]) / 2 - 0.12, (y + n[1]) / 2 - 0.01);
  });
  hand.quadraticCurveTo(0.6, -0.42, 0, -0.36); hand.closePath();
  const flat = (shape) => { const g = new THREE.ShapeGeometry(shape, 6); g.rotateX(Math.PI / 2); g.computeVertexNormals(); return g; };
  // Forked tail, the kite's signature.
  const tail = new THREE.Shape();
  tail.moveTo(-0.1, 0); tail.lineTo(-0.26, -0.78); tail.lineTo(0, -0.62); tail.lineTo(0.26, -0.78); tail.lineTo(0.1, 0); tail.closePath();
  return { arm: flat(arm), hand: flat(hand), tail: flat(tail) };
}

export function makeKites({ count = 2 } = {}) {
  const group = new THREE.Group();
  const geo = wingGeometries();
  const plumage = new THREE.MeshStandardMaterial({ color: 0x5a4030, emissive: 0x1e140d, roughness: 0.9, side: THREE.DoubleSide });
  const primaries = new THREE.MeshStandardMaterial({ color: 0x2c1f17, emissive: 0x120c08, roughness: 0.9, side: THREE.DoubleSide });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5a3f2c, roughness: 0.85 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x9a8064, roughness: 0.85 });
  // A slim, tapered body (widest at the chest) rather than a cone.
  const bodyGeo = new THREE.SphereGeometry(1, 14, 10);
  const bp = bodyGeo.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const z = bp.getZ(i), taper = z > 0 ? 1 : 1 + z * 0.45;
    bp.setXYZ(i, bp.getX(i) * 0.2 * taper, bp.getY(i) * 0.19 * taper, z * 0.72);
  }
  bodyGeo.computeVertexNormals();
  const headGeo = new THREE.SphereGeometry(0.15, 12, 8);
  const beakGeo = new THREE.ConeGeometry(0.045, 0.16, 6); beakGeo.rotateX(Math.PI / 2);
  const beakMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.6 });

  const birds = Array.from({ length: count }, (_, n) => {
    const g = new THREE.Group();
    g.rotation.order = 'YXZ';
    g.add(new THREE.Mesh(bodyGeo, bodyMat));
    const head = new THREE.Mesh(headGeo, headMat); head.position.set(0, 0.06, 0.78); g.add(head);
    const beak = new THREE.Mesh(beakGeo, beakMat); beak.position.set(0, 0.03, 0.94); g.add(beak);
    const tail = new THREE.Group(); tail.position.set(0, 0.02, -0.6);
    tail.add(new THREE.Mesh(geo.tail, plumage)); g.add(tail);
    const side = (s) => {
      const shoulder = new THREE.Group(); shoulder.position.set(0.12 * s, 0.06, 0.12);
      const arm = new THREE.Mesh(geo.arm, plumage); arm.scale.x = s; shoulder.add(arm);
      const wrist = new THREE.Group(); wrist.position.x = 1.25 * s; shoulder.add(wrist);
      const hand = new THREE.Mesh(geo.hand, primaries); hand.scale.x = s; wrist.add(hand);
      g.add(shoulder);
      return { shoulder, wrist, s };
    };
    const wings = [side(1), side(-1)];
    g.scale.setScalar(1.25);
    group.add(g);
    return {
      g, tail, wings,
      R: 24 + n * 7, w: (n % 2 ? -1 : 1) * (0.2 - n * 0.03), th: n * 2.4,
      alt: 27 + n * 5, cx: 0, cz: 0, drift: n * 3.1,
      nextFlap: 3 + n * 4, flapStart: -10, beat: 0,
    };
  });

  const toC = new THREE.Vector3();
  return {
    group,
    update(t, dt) {
      birds.forEach((b) => {
        // The thermal drifts slowly over the village, and the circle breathes in and out.
        b.cx = Math.sin(t * 0.021 + b.drift) * 14; b.cz = Math.cos(t * 0.017 + b.drift) * 12;
        const R = b.R + Math.sin(t * 0.07 + b.drift) * 4;
        b.th += b.w * dt;
        const x = b.cx + Math.cos(b.th) * R, z = b.cz + Math.sin(b.th) * R;
        // Wing beats: a short burst every 8–15 s; climbs a little while beating, sinks gently while soaring.
        if (t > b.nextFlap) { b.flapStart = t; b.nextFlap = t + 8 + Math.random() * 7; }
        const ft = t - b.flapStart;
        const env = ft < 0 || ft > 1.8 ? 0 : Math.sin((ft / 1.8) * Math.PI) ** 0.6;
        b.alt += (env * 0.9 - 0.12) * dt;
        b.alt = Math.min(36, Math.max(25, b.alt));
        b.g.position.set(x, b.alt + Math.sin(t * 0.5 + b.drift) * 0.4, z);
        // Face the direction of travel and bank into the turn (toward the circle's centre).
        const vx = -Math.sin(b.th) * b.w, vz = Math.cos(b.th) * b.w;
        const yaw = Math.atan2(vx, vz);
        toC.set(b.cx - x, 0, b.cz - z).normalize();
        const lateral = toC.x * Math.cos(yaw) - toC.z * Math.sin(yaw); // + means the centre is on the bird's +x side
        b.g.rotation.set(-0.05 - env * 0.12, yaw, -Math.sign(lateral) * (0.32 + Math.sin(t * 0.9 + b.drift) * 0.04));
        // Soaring: wings held slightly raised, hands drooped, with small gust corrections.
        // Beating: the arm leads and the hand follows a moment later, bending at the wrist.
        b.beat += dt * (2.1 * Math.PI * 2) * (env > 0 ? 1 : 0);
        const arm = 0.1 + Math.sin(t * 1.3 + b.drift) * 0.03 + env * Math.sin(b.beat) * 0.6;
        const hand = -0.06 + env * Math.sin(b.beat - 0.9) * 0.45;
        b.wings.forEach((w) => { w.shoulder.rotation.z = arm * w.s; w.wrist.rotation.z = hand * w.s; });
        b.tail.rotation.z = -Math.sign(lateral) * 0.12; // the forked tail twists to steer
      });
    },
  };
}

// Small cherry-blossom shrubs scattered between the buildings and along the paths.
export function makeBlossomShrubs({ count, inner, outer, avoid }) {
  const group = new THREE.Group();
  const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.7, 5); stemGeo.translate(0, 0.35, 0);
  const bloomGeo = new THREE.IcosahedronGeometry(0.55, 0);
  const stems = new THREE.InstancedMesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x4a2e22, roughness: 0.9 }), count);
  const blooms = new THREE.InstancedMesh(bloomGeo, new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }), count * 2);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  const pinks = [0xf7b6c8, 0xee8fae, 0xffd3df, 0xe0708f];
  let placed = 0;
  for (let i = 0; placed < count && i < count * 30; i++) {
    const a = Math.random() * Math.PI * 2, r = inner + Math.random() * (outer - inner);
    p.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (avoid.some((v) => v.distanceTo(p) < 6.5)) continue;
    const k = 0.7 + Math.random() * 0.7;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6);
    m.compose(p, q, s.set(k, k, k)); stems.setMatrixAt(placed, m);
    for (let j = 0; j < 2; j++) {
      const b = p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5 * k, (0.75 + j * 0.25) * k, (Math.random() - 0.5) * 0.5 * k));
      const bk = k * (j ? 0.7 : 1);
      m.compose(b, q, s.set(bk, bk * 0.8, bk)); blooms.setMatrixAt(placed * 2 + j, m);
      blooms.setColorAt(placed * 2 + j, c.set(pinks[(placed + j) % pinks.length]));
    }
    placed++;
  }
  stems.count = placed; blooms.count = placed * 2;
  blooms.castShadow = true;
  group.add(stems, blooms);
  return group;
}

// A winding stream that flows in from the forest and into the pond (scrolling ripples in the shader).
export function makeStream(points, width = 2.4) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.04, z)));
  const N = 120, pos = [], uv = [], idx = [];
  const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const u = i / N, pt = curve.getPointAt(u), tan = curve.getTangentAt(u);
    side.crossVectors(tan, up).normalize().multiplyScalar(width * (0.8 + 0.3 * Math.sin(u * 17)) / 2);
    pos.push(pt.x - side.x, pt.y, pt.z - side.z, pt.x + side.x, pt.y, pt.z + side.z);
    uv.push(0, u * 30, 1, u * 30);
    if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const uniforms = { uTime: { value: 0 }, uDeep: { value: new THREE.Color(0x2f6f8a) }, uShallow: { value: new THREE.Color(0x8fd0dc) } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; varying vec2 vUv;
      void main(){
        float edge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
        float flow = vUv.y + uTime * 1.2; // ripples travel down toward the pond
        float ripple = sin(flow * 6.0 + sin(vUv.x * 9.0 + uTime) * 1.5) * 0.5 + 0.5;
        float sparkle = smoothstep(0.95, 1.0, sin(flow * 11.0 + sin(vUv.x * 6.0 + uTime * 0.7) * 2.2) * 0.5 + 0.5);
        vec3 col = mix(uShallow, uDeep, edge) + ripple * 0.06 + sparkle * 0.16;
        gl_FragColor = vec4(col, 0.55 + edge * 0.35);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  return { mesh, curve, update(t) { uniforms.uTime.value = t; }, setNight(n) { uniforms.uDeep.value.set(n ? 0x1a2c44 : 0x2f6f8a); uniforms.uShallow.value.set(n ? 0x4a6a8a : 0x8fd0dc); } };
}

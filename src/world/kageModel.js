// Kage, the detailed version: the Meshy-generated samurai (rigged GLB), animated in code.
// The low-poly Kage stands in until the model has loaded (or if it fails), with the same API:
// setTalking, setPresenting, handWorld, animate(t, moving, dt).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makeKageCharacter } from './character.js';

const URL = '/models/kage.glb';
const HEIGHT = 3.0; // matches the low-poly Kage, so cameras and labels stay put
let cached; // one download shared by the village and the corner widget

// Bone poses as local [x, y, z] rotations added on top of the rest pose (found by eye for this rig).
const MEDITATE = {
  thighL: [1.5, 0, 0.7], thighR: [1.5, 0, -0.7], shinL: [2.3, 0, 0], shinR: [2.3, 0, 0],
  upper_armL: [0.35, 0, 0.25], upper_armR: [0.35, 0, -0.25], forearmL: [0.6, 0, 0], forearmR: [0.6, 0, 0],
  headfront: [0.12, 0, 0],
};

export function makeKage() {
  const root = new THREE.Group();
  const fallback = makeKageCharacter();
  root.add(fallback);
  let api = fallback.userData;
  const state = { talking: false, presenting: false };
  root.userData.setTalking = (v) => { state.talking = v; api.setTalking(v); };
  root.userData.setPresenting = (v) => { state.presenting = v; api.setPresenting(v); };
  root.userData.handWorld = (out) => api.handWorld(out);
  root.userData.animate = (t, moving, dt) => api.animate(t, moving, dt);

  cached ??= new GLTFLoader().loadAsync(URL);
  cached.then((gltf) => {
    const model = rig(gltf);
    root.remove(fallback);
    root.add(model);
    api = model.userData;
    api.setTalking(state.talking);
    api.setPresenting(state.presenting);
  }).catch(() => {}); // keep the low-poly Kage
  return root;
}

function rig(gltf) {
  // Each caller gets its own copy with its own skeleton.
  const src = gltf.scene;
  const model = cloneSkinned(src);
  const box = new THREE.Box3().setFromObject(src);
  const k = HEIGHT / (box.max.y - box.min.y);
  const holder = new THREE.Group();
  model.scale.setScalar(k);
  holder.add(model);
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });

  const B = {}, rest = {};
  model.traverse((o) => { if (o.isBone) { B[o.name] = o; rest[o.name] = o.quaternion.clone(); } });
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  const add = (name, x, y, z, w = 1) => {
    const b = B[name];
    if (!b || !w) return;
    b.quaternion.multiply(q.setFromEuler(e.set(x * w, y * w, z * w)));
  };

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02;
  holder.add(shadow);

  let phase = 0, talk = 0, present = 0, presentTarget = 0, med = 0, idle = 0, run = 0;
  holder.userData.setTalking = (v) => { talk = v ? 1 : 0; };
  holder.userData.setPresenting = (v) => { presentTarget = v ? 1 : 0; };
  holder.userData.handWorld = (out) => (B.handR ? B.handR.getWorldPosition(out) : holder.getWorldPosition(out).setY(2));
  holder.userData.animate = (t, moving, dt) => {
    dt = dt || 0.016;
    for (const n in B) B[n].quaternion.copy(rest[n]);
    run += ((moving ? 1 : 0) - run) * Math.min(1, dt * 10);
    phase += moving ? dt * 11 : 0;
    idle = moving || talk || presentTarget ? 0 : idle + dt;
    med += ((idle > 1.2 ? 1 : 0) - med) * Math.min(1, dt * (idle > 1.2 ? 2 : 8));
    present += (presentTarget - present) * Math.min(1, dt * 6);

    // Run cycle.
    const s = Math.sin(phase), c = Math.cos(phase);
    add('thighL', s * 0.9, 0, 0, run); add('thighR', -s * 0.9, 0, 0, run);
    add('shinL', Math.max(0, -c) * 1.3 + 0.2, 0, 0, run); add('shinR', Math.max(0, c) * 1.3 + 0.2, 0, 0, run);
    add('upper_armL', -s * 0.7, 0, 0, run); add('upper_armR', s * 0.7, 0, 0, run);
    add('forearmL', 0.9, 0, 0, run); add('forearmR', 0.9, 0, 0, run);
    add('spine', 0.18, 0, 0, run);

    // Idle breathing and a slow look around.
    const still = (1 - run) * (1 - med);
    add('spine003', Math.sin(t * 1.6) * 0.02, 0, 0, still);
    add('headfront', 0, Math.sin(t * 0.7) * 0.25, 0, still * (1 - present));

    // Meditation: cross-legged, hands in a mudra, floating and gently bobbing.
    for (const n in MEDITATE) add(n, ...MEDITATE[n], med);

    // Presenting: the right arm reaches out toward the panel; talking adds a small gesture.
    add('upper_armR', 1.1, 0, 0, present * (1 - run));
    add('forearmR', 0.3, 0, 0, present * (1 - run));
    add('headfront', 0, 0.35, 0, present);
    if (talk && !moving) add('forearmL', 0.5 + Math.sin(t * 3) * 0.15, 0, 0, 1 - med);

    model.position.y = run * Math.abs(c) * 0.08 + med * (0.25 + Math.sin(t * 1.3) * 0.12);
    shadow.scale.setScalar(1 - 0.35 * med);
  };
  return holder;
}

// Clone a skinned scene so several instances can animate independently.
function cloneSkinned(source) {
  const map = new Map();
  const clone = source.clone(true);
  const srcList = [], cloneList = [];
  source.traverse((o) => srcList.push(o));
  clone.traverse((o) => cloneList.push(o));
  srcList.forEach((o, i) => map.set(o, cloneList[i]));
  cloneList.forEach((o, i) => {
    const s = srcList[i];
    if (o.isSkinnedMesh) {
      o.skeleton = s.skeleton.clone();
      o.skeleton.bones = s.skeleton.bones.map((b) => map.get(b));
      o.bind(o.skeleton, s.bindMatrix);
    }
  });
  return clone;
}

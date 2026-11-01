// Kage, the detailed version: the Meshy-generated samurai (rigged GLB), animated in code.
// The low-poly Kage (character.js) stands in if the model fails to load or is very slow, with the same API:
// setTalking, setPresenting, handWorld, animate(t, moving, dt, speed). `speed` (units/s) drives the gait.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makeKageCharacter } from './character.js';

const URL = '/models/kage.glb';
const HEIGHT = 3.0; // matches the low-poly Kage, so cameras and labels stay put
let cached; // one download shared by the village and the corner widget

// Map generic animation bone names to the actual rig bone names in kage.glb
const BONE_MAP = {
  thighL: 'thigh.L',
  thighR: 'thigh.R',
  shinL: 'shin.L',
  shinR: 'shin.R',
  upper_armL: 'upper_arm.L',
  upper_armR: 'upper_arm.R',
  forearmL: 'forearm.L',
  forearmR: 'forearm.R',
  headfront: 'headfront',
  spine: 'spine',
  spine003: 'spine.003',
  handR: 'hand.R',
  handL: 'hand.L'
};

// Idle guard stance
const GUARD_IDLE = {
  thighL: [0.05, 0, 0.05],
  thighR: [0.05, 0, -0.05],
  shinL: [0.05, 0, 0],
  shinR: [0.05, 0, 0],
  upper_armL: [0.25, 0, 0.15],
  upper_armR: [0.25, 0, -0.15],
  forearmL: [0.35, 0, 0],
  forearmR: [0.35, 0, 0],
  headfront: [0.05, 0, 0]
};

export function makeKage() {
  const root = new THREE.Group();
  let api = null, fallback = null;
  const state = { talking: false, presenting: false };
  const useFallback = () => {
    if (api) return;
    fallback = makeKageCharacter();
    root.add(fallback);
    use(fallback.userData);
  };
  const use = (next) => { api = next; api.setTalking(state.talking); api.setPresenting(state.presenting); };
  root.userData.setTalking = (v) => { state.talking = v; api?.setTalking(v); };
  root.userData.setPresenting = (v) => { state.presenting = v; api?.setPresenting(v); };
  root.userData.handWorld = (out) => (api ? api.handWorld(out) : root.getWorldPosition(out).setY(2));
  root.userData.animate = (t, moving, dt, speed) => api?.animate(t, moving, dt, speed);

  // The low-poly Kage stands in if the model fails to load, or is very slow to arrive.
  const slow = setTimeout(useFallback, 6000);
  cached ??= new GLTFLoader().loadAsync(URL);
  cached.then((gltf) => {
    clearTimeout(slow);
    const model = rig(gltf);
    if (fallback) { root.remove(fallback); fallback = null; }
    root.add(model);
    api = null;
    use(model.userData);
  }).catch(() => { clearTimeout(slow); useFallback(); });
  return root;
}

const RUN_SPEED_REF = 6.5; // units per second at which the gait reaches full amplitude

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
  // Resolve bone by exact name or mapped canonical name
  const bone = (name) => B[name] || B[BONE_MAP[name]];
  const add = (name, x, y, z, w = 1) => {
    const b = bone(name);
    if (!b || !w) return;
    b.quaternion.multiply(q.setFromEuler(e.set(x * w, y * w, z * w)));
  };
  const resetPose = () => { for (const n in B) B[n].quaternion.copy(rest[n]); };

  // Jog cycle. Each leg swings forward with a bent knee and pushes back straight.
  const gait = (phase, w) => {
    const s = Math.sin(phase), c = Math.cos(phase);
    add('thighL', s * 0.75, 0, 0, w);
    add('thighR', -s * 0.75, 0, 0, w);
    add('shinL', Math.max(0, c) * 1.1 + 0.12, 0, 0, w);
    add('shinR', Math.max(0, -c) * 1.1 + 0.12, 0, 0, w);
    add('upper_armL', -s * 0.55, 0, 0, w);
    add('upper_armR', s * 0.55, 0, 0, w);
    add('forearmL', 0.7, 0, 0, w);
    add('forearmR', 0.7, 0, 0, w);
    add('spine', 0.14, 0, 0, w);
  };

  // Measure how far a foot sweeps front-to-back over one cycle, so the cycle rate can match
  // the ground speed (no foot sliding).
  const foot = bone('footL') || bone('foot.L') || bone('shinL');
  let stride = 5.5;
  if (foot) {
    const v = new THREE.Vector3();
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < 24; i++) {
      resetPose(); gait((i / 24) * Math.PI * 2, 1);
      holder.updateMatrixWorld(true);
      foot.getWorldPosition(v);
      lo = Math.min(lo, v.z); hi = Math.max(hi, v.z);
    }
    resetPose();
    // The foot moves fastest (π/2 x its average) mid-stance, when it is on the ground, so match that speed.
    if (hi - lo > 0.3) stride = Math.PI * (hi - lo);
  }

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02;
  holder.add(shadow);

  let phase = 0, talk = 0, present = 0, presentTarget = 0, guard = 0, idle = 0, run = 0;
  holder.userData.stride = stride;
  holder.userData.setTalking = (v) => { talk = v ? 1 : 0; };
  holder.userData.setPresenting = (v) => { presentTarget = v ? 1 : 0; };
  holder.userData.handWorld = (out) => (bone('handR') ? bone('handR').getWorldPosition(out) : holder.getWorldPosition(out).setY(2));
  holder.userData.animate = (t, moving, dt, speed) => {
    dt = dt || 0.016;
    speed = moving ? (speed ?? RUN_SPEED_REF) : 0;
    resetPose();
    // Gait amplitude follows speed (a short walk when slowing down, a full jog at cruising speed).
    const want = Math.min(1, speed / RUN_SPEED_REF);
    run += (want - run) * Math.min(1, dt * 8);
    // Advance the cycle by the distance actually covered: one cycle per (stride x amplitude).
    if (speed > 0) phase += (Math.PI * 2 * speed * dt) / (stride * Math.max(0.35, run));
    idle = moving || talk || presentTarget ? 0 : idle + dt;
    guard += ((idle > 0.8 ? 1 : 0) - guard) * Math.min(1, dt * 3);
    present += (presentTarget - present) * Math.min(1, dt * 6);

    gait(phase, run);

    // Idle breathing and natural head tracking
    const still = 1 - run;
    add('spine003', Math.sin(t * 1.5) * 0.02, 0, 0, still);
    add('headfront', Math.sin(t * 1.2) * 0.03, Math.sin(t * 0.7) * 0.2, 0, still * (1 - present));

    // Guard stance: feet planted, hands near the hilt
    for (const n in GUARD_IDLE) add(n, ...GUARD_IDLE[n], guard * still * (1 - present));

    // Presenting gesture: right arm extends forward toward the panel
    add('upper_armR', 1.0, 0, 0, present * still);
    add('forearmR', 0.35, 0, 0, present * still);
    add('headfront', 0, 0.3, 0, present);
    if (talk && !moving) add('forearmL', 0.4 + Math.sin(t * 3) * 0.12, 0, 0, still);

    // Two small bounces per cycle (one per footfall)
    model.position.y = run * Math.abs(Math.cos(phase)) * 0.07;
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

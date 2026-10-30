// Kage: the site's samurai mascot, rebuilt for the village (matches the classic-site model).
// About 2.6 units tall; the origin is at his feet and he faces +Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const M = {
  skin: new THREE.MeshStandardMaterial({ color: 0xb9805a, roughness: 0.7 }),
  hand: new THREE.MeshStandardMaterial({ color: 0xe8c9a8, roughness: 0.7 }),
  armor: new THREE.MeshStandardMaterial({ color: 0x2b2d3f, roughness: 0.55 }),
  armorLight: new THREE.MeshStandardMaterial({ color: 0x3a3c52, roughness: 0.5 }),
  robe: new THREE.MeshStandardMaterial({ color: 0x1d1f30, roughness: 0.75 }),
  legs: new THREE.MeshStandardMaterial({ color: 0x121218, roughness: 0.8 }),
  boot: new THREE.MeshStandardMaterial({ color: 0x3a2620, roughness: 0.6 }),
  red: new THREE.MeshStandardMaterial({ color: 0xd04848, roughness: 0.5, emissive: 0x3a0808, emissiveIntensity: 0.4 }),
  hat: new THREE.MeshStandardMaterial({ color: 0xe9d3b0, roughness: 0.8 }),
  hatRim: new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.8 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf6efe6, roughness: 0.4 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x0c0708, roughness: 0.3 }),
  brow: new THREE.MeshStandardMaterial({ color: 0x1a100c, roughness: 0.8 }),
  hilt: new THREE.MeshStandardMaterial({ color: 0xc79a86, roughness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x9a9aa2, roughness: 0.35, metalness: 0.6 }),
};

function part(geo, mat, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
const rbox = (w, h, d, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);

export function makeKageCharacter() {
  const root = new THREE.Group();
  const body = new THREE.Group(); // bobs while walking
  root.add(body);

  // Legs (pivot at the hip so they can swing).
  const legs = [-1, 1].map((s) => {
    const hip = new THREE.Group();
    hip.position.set(s * 0.17, 0.78, 0);
    part(rbox(0.2, 0.62, 0.22, 0.05), M.legs, 0, -0.33, 0, hip);
    part(rbox(0.26, 0.16, 0.38, 0.06), M.boot, 0, -0.7, 0.06, hip);
    body.add(hip);
    return hip;
  });

  // Robe skirt, torso, armor.
  part(new THREE.CylinderGeometry(0.42, 0.52, 0.62, 12), M.robe, 0, 0.98, 0, body);
  part(rbox(0.86, 0.72, 0.5, 0.08), M.armor, 0, 1.58, 0, body);
  part(rbox(0.58, 0.46, 0.08, 0.04), M.armorLight, 0, 1.6, 0.27, body); // chest plate
  part(rbox(0.07, 0.07, 0.03, 0.01), M.metal, -0.05, 1.56, 0.32, body).rotation.z = Math.PI / 4; // clasp
  [-1, 1].forEach((s) => part(rbox(0.34, 0.3, 0.56, 0.07), M.armor, s * 0.52, 1.82, 0, body)); // shoulder plates
  part(rbox(0.9, 0.11, 0.54, 0.03), M.red, 0, 1.25, 0, body); // belt
  const strap = part(rbox(0.07, 0.78, 0.04, 0.02), M.red, 0.12, 1.42, 0.3, body); // diagonal strap
  strap.rotation.z = -0.5;
  part(rbox(0.3, 0.1, 0.36, 0.03), M.legs, 0, 2.0, 0, body); // collar

  // Arms (pivot at the shoulder).
  const arms = [-1, 1].map((s) => {
    const sh = new THREE.Group();
    sh.position.set(s * 0.56, 1.8, 0);
    part(rbox(0.22, 0.62, 0.24, 0.06), M.armor, 0, -0.34, 0, sh);
    part(rbox(0.2, 0.2, 0.16, 0.06), M.hand, 0, -0.74, 0.02, sh);
    body.add(sh);
    return sh;
  });

  // Katana across the back, hilt over the left shoulder.
  const sword = new THREE.Group();
  part(rbox(0.07, 1.25, 0.07, 0.02), M.dark, 0, 0, 0, sword);
  part(rbox(0.09, 0.42, 0.09, 0.02), M.hilt, 0, 0.82, 0, sword);
  part(rbox(0.1, 0.06, 0.1, 0.02), M.red, 0, 1.06, 0, sword);
  part(rbox(0.24, 0.04, 0.12, 0.01), M.dark, 0, 0.6, 0, sword); // tsuba
  sword.position.set(-0.08, 1.6, -0.3);
  sword.rotation.z = 0.55;
  body.add(sword);

  // Head.
  const head = new THREE.Group();
  head.position.set(0, 2.42, 0.02);
  part(rbox(0.6, 0.66, 0.56, 0.14), M.skin, 0, 0, 0, head);
  [-1, 1].forEach((s) => part(rbox(0.08, 0.16, 0.1, 0.04), M.skin, s * 0.32, -0.02, 0, head)); // ears
  const eyes = [-1, 1].map((s) => {
    const e = new THREE.Group();
    e.position.set(s * 0.13, 0.04, 0.285);
    part(new THREE.SphereGeometry(0.06, 12, 10), M.white, 0, 0, 0, e).scale.set(1.15, 0.9, 0.3);
    part(new THREE.SphereGeometry(0.035, 10, 8), M.dark, 0, 0, 0.012, e).scale.set(1, 1.2, 0.4);
    const brow = part(rbox(0.13, 0.03, 0.02, 0.01), M.brow, 0, 0.1, 0.01, e);
    brow.rotation.z = s * -0.12;
    head.add(e);
    return e;
  });
  part(rbox(0.05, 0.1, 0.06, 0.02), M.skin, 0, -0.05, 0.3, head); // nose
  const mouth = part(rbox(0.13, 0.035, 0.02, 0.012), M.white, 0, -0.17, 0.285, head);

  // Kasa (conical straw hat) with a red finial.
  const kasa = new THREE.Group();
  kasa.position.y = 0.36;
  part(new THREE.ConeGeometry(0.92, 0.42, 28, 1), M.hat, 0, 0.12, 0, kasa);
  part(new THREE.CylinderGeometry(0.93, 0.93, 0.035, 28, 1, true), M.hatRim, 0, -0.09, 0, kasa);
  part(new THREE.ConeGeometry(0.05, 0.12, 8), M.red, 0, 0.38, 0, kasa);
  head.add(kasa);
  body.add(head);

  // Soft contact shadow.
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  let phase = 0, talk = 0, present = 0, presentTarget = 0, med = 0, idle = 0, still = 0;
  root.userData.setTalking = (v) => { talk = v ? 1 : 0; };
  // Presenting: the right arm lifts out to the side, palm toward what he is showing.
  root.userData.setPresenting = (v) => { presentTarget = v ? 1 : 0; };
  // World position of the presenting hand (where a presented panel unfolds from).
  root.userData.handWorld = (out) => arms[1].localToWorld(out.set(0, -0.74, 0.02));
  root.userData.animate = (t, moving, dt) => {
    dt = dt || 0.016;
    // Running: quick stride, big arm swing, leaning into it.
    phase += moving ? dt * 15 : 0;
    const swing = moving ? Math.sin(phase) : 0;
    // At rest he settles into floating meditation (cross-legged, hands in his lap, eyes closed).
    idle = moving || talk || presentTarget ? 0 : idle + dt;
    const medTarget = idle > 1.2 ? 1 : 0;
    med += (medTarget - med) * Math.min(1, dt * (medTarget ? 2 : 8));
    const m = med;
    legs[0].rotation.x = swing * 0.9 * (1 - m) - 1.45 * m;
    legs[1].rotation.x = -swing * 0.9 * (1 - m) - 1.45 * m;
    legs[0].rotation.z = -0.9 * m;
    legs[1].rotation.z = 0.9 * m;
    arms[0].rotation.x = -swing * 0.9 * (1 - m) - 0.75 * m;
    arms[1].rotation.x = swing * 0.9 * (1 - m) - 0.75 * m;
    arms[0].rotation.z = -0.35 * m;
    body.rotation.x = moving ? 0.22 : 0;
    const float = 0.55 + Math.sin(t * 1.3) * 0.12;
    body.position.y = moving ? Math.abs(Math.cos(phase)) * 0.12 : Math.sin(t * 1.6) * 0.015 * (1 - m) + float * m - 0.45 * m;
    shadow.scale.setScalar(1 - 0.35 * m);
    head.rotation.y = moving ? 0 : Math.sin(t * 0.7) * 0.15 * (1 - m);
    head.rotation.x = 0.12 * m;
    head.rotation.z = moving ? swing * 0.03 : 0;
    const blink = (t % 3.8) < 0.11 ? 0.1 : 1;
    eyes.forEach((e) => (e.scale.y = m > 0.6 ? 0.12 : blink));
    mouth.scale.y = talk ? 1 + Math.abs(Math.sin(t * 14)) * 1.6 : 1;
    if (!moving && talk) arms[1].rotation.x = -0.35 + Math.sin(t * 3) * 0.1; // gestures while speaking
    present += (presentTarget - present) * Math.min(1, dt * 6);
    if (present > 0.01 && !moving) {
      arms[1].rotation.z = 1.35 * present + Math.sin(t * 1.5) * 0.04 * present;
      arms[1].rotation.x = -0.45 * present;
      head.rotation.y = 0.35 * present;
    } else arms[1].rotation.z = 0.35 * m;
  };
  return root;
}

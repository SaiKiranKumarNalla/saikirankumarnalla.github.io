// Kage (影, "shadow"): a small spirit that floats beside the player and narrates the village.
import * as THREE from 'three';

export function makeKage() {
  const g = new THREE.Group();
  const robe = new THREE.MeshStandardMaterial({ color: 0x2a2236, emissive: 0x3a0e14, emissiveIntensity: 0.6, roughness: 0.6, flatShading: true, transparent: true, opacity: 0.92 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 7, 1, true), robe);
  body.position.y = 0.75;
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), robe);
  head.position.y = 1.65;
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff3b3b });
  const eyes = [-0.14, 0.14].map((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), eyeMat);
    e.position.set(x, 1.68, 0.36);
    return e;
  });
  const wispMat = new THREE.MeshBasicMaterial({ color: 0xc23b3b, transparent: true, opacity: 0.8 });
  const wisps = [0, 1, 2].map((i) => {
    const w = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), wispMat);
    w.userData.phase = (i / 3) * Math.PI * 2;
    return w;
  });
  const glow = new THREE.PointLight(0xc23b3b, 9, 8, 2);
  glow.position.y = 1.4;
  g.add(body, head, ...eyes, ...wisps, glow);
  g.scale.setScalar(1.35);

  let blink = 0;
  g.userData.animate = (t) => {
    const hover = 1.2 + Math.sin(t * 2.2) * 0.18;
    body.position.y = 0.75 + hover; head.position.y = 1.65 + hover;
    eyes.forEach((e) => { e.position.y = 1.68 + hover; });
    glow.position.y = 1.4 + hover;
    wisps.forEach((w) => {
      const a = t * 1.8 + w.userData.phase;
      w.position.set(Math.cos(a) * 0.8, hover + 0.9 + Math.sin(a * 2) * 0.25, Math.sin(a) * 0.8);
    });
    // Blink every few seconds.
    blink = (t % 4.2) < 0.12 ? 0.1 : 1;
    eyes.forEach((e) => (e.scale.y = blink));
  };
  return g;
}

// Speech bubble with a queue so lines don't trample each other.
export function makeSpeech(el) {
  let hideAt = 0, current = '';
  return {
    say(text, now, ms = 5200) {
      if (text === current && now < hideAt) return;
      current = text;
      el.querySelector('.w-kage-text').textContent = text;
      el.classList.add('show');
      hideAt = now + ms;
    },
    tick(now) {
      if (hideAt && now > hideAt) { el.classList.remove('show'); hideAt = 0; current = ''; }
    },
    get visible() { return el.classList.contains('show'); },
  };
}

export const IDLE_LINES = [
  'Try clicking a building: I will walk you to its door.',
  'Psst. The ☾ button turns night into day.',
  'In a hurry? “Classic site” is up in the corner. I won\'t be offended.',
  'Sai built this whole village from code. No 3D models were downloaded.',
];

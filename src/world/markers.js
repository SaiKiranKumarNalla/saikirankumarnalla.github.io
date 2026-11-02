// Entrance markers: a soft ground ring and faint light column at every door, so it is clear where to stand.
import * as THREE from 'three';

export const MARKER_RADIUS = 2.2; // matches the door trigger distance in main.js

export function makeEntranceMarkers(doors, { reduceMotion = false, lowPower = false } = {}) {
  const group = new THREE.Group();
  const ringGeo = new THREE.RingGeometry(MARKER_RADIUS - 0.16, MARKER_RADIUS, 64);
  const discGeo = new THREE.CircleGeometry(MARKER_RADIUS - 0.16, 48);
  const colGeo = new THREE.CylinderGeometry(MARKER_RADIUS * 0.8, MARKER_RADIUS * 0.8, 6, 32, 1, true);
  [ringGeo, discGeo].forEach((g) => g.rotateX(-Math.PI / 2));
  colGeo.translate(0, 3, 0);
  // Column fades out toward the top.
  const c = document.createElement('canvas'); c.width = 1; c.height = 64;
  const cx = c.getContext('2d'), grad = cx.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, '#000'); grad.addColorStop(1, '#fff');
  cx.fillStyle = grad; cx.fillRect(0, 0, 1, 64);
  const fade = new THREE.CanvasTexture(c);

  const mk = (opts) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...opts });
  const items = doors.map((door) => {
    const root = new THREE.Group();
    root.position.set(door.pos.x, 0.07, door.pos.z);
    const ringM = mk({}), discM = mk({}), colM = mk({ alphaMap: fade, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringM), disc = new THREE.Mesh(discGeo, discM);
    root.add(ring, disc);
    let col = null;
    if (!lowPower) { col = new THREE.Mesh(colGeo, colM); root.add(col); }
    group.add(root);
    return { door, root, ringM, discM, colM, col, level: 0, flash: 0 };
  });

  let night = true, tint = new THREE.Color();
  const setNight = (n) => {
    night = n;
    tint.set(n ? 0xff5a4a : 0xb02a22);
    items.forEach((m) => {
      [m.ringM, m.discM, m.colM].forEach((mat) => { mat.color.copy(tint); mat.blending = n ? THREE.AdditiveBlending : THREE.NormalBlending; mat.needsUpdate = true; });
    });
  };
  setNight(true);

  // active(door) is true while the door is hovered or is Kage's destination.
  const update = (t, dt, active) => {
    items.forEach((m, i) => {
      m.level += ((active(m.door) ? 1 : 0) - m.level) * Math.min(1, dt * 8);
      m.flash = Math.max(0, m.flash - dt * 1.6);
      const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.8 + i * 0.9);
      const k = night ? 1 : 1.8; // normal blending needs a bit more opacity to read by day
      const boost = m.level * 0.45 + m.flash * 0.9;
      m.ringM.opacity = Math.min(1, (0.38 + pulse * 0.2) * k + boost);
      m.discM.opacity = Math.min(0.6, (0.07 + pulse * 0.05) * k + boost * 0.3);
      m.colM.opacity = Math.min(0.5, (0.08 + pulse * 0.04) * k + boost * 0.35);
      const s = 1 + m.level * 0.08 + (reduceMotion ? 0 : pulse * 0.025) + m.flash * 0.14;
      m.root.scale.set(s, 1, s);
    });
  };
  const flash = (door) => { const m = items.find((x) => x.door === door); if (m && !reduceMotion) m.flash = 1; else if (m) m.flash = 0.5; };
  return { group, update, setNight, flash };
}

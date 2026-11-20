// 3D parts of the Kage page, one builder per stage (layout.js stage builders):
//   heroStage   Kage in his guard stance on a platform with a glowing ring, turning slowly.
//   storyStage  Kage walking in place on a smaller platform, beside the story of the two realms.
import { makeKage } from '../world/kageModel.js';

function platform(THREE, r, scene) {
  const base = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1 });
  const ringM = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, emissiveIntensity: 0.7 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.12, 0.4, 48), base);
  disc.position.y = -0.2;
  const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.88, r * 0.96, 64), ringM);
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01;
  scene.add(disc, ring);
  return (pal) => {
    base.color.set(pal.night ? 0x221a20 : 0xcdbfae);
    ringM.color.set(pal.accent); ringM.emissive.set(pal.night ? 0xee6756 : pal.accent);
  };
}

function kageStage(ctx, { scale, r, moving, yaw, view }) {
  const { THREE, scene, reduceMotion } = ctx;
  const apply = platform(THREE, r, scene);
  const kage = makeKage();
  kage.scale.setScalar(scale);
  scene.add(kage);
  ctx.view = { c: new THREE.Vector3(...view.c), w: view.w, h: view.h, dir: new THREE.Vector3(...view.dir) };
  return {
    theme: apply,
    update(t, dt) {
      kage.userData.animate(t, moving, dt || 0.016, moving ? 2.2 : 0);
      kage.rotation.y = reduceMotion ? yaw : yaw + Math.sin(t * 0.4) * 0.28;
    },
  };
}

export const heroStage = (ctx) => kageStage(ctx, { scale: 1.25, r: 2.5, moving: false, yaw: -0.4, view: { c: [0, 1.7, 0], w: 5.6, h: 5.4, dir: [0.1, 0.12, 1] } });
export const storyStage = (ctx) => kageStage(ctx, { scale: 1.1, r: 2.2, moving: true, yaw: 0.55, view: { c: [0, 1.6, 0], w: 5.4, h: 5.2, dir: [0.1, 0.12, 1] } });

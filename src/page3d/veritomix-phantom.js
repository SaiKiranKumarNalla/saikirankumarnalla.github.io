// Phantoms for the VeriTomiX page.
//  - The CASSOULET abdominal phantom: a CT-derived mesh (organs, vessels, bones, muscle, skin) built from a public
//    CC BY 4.0 abdominal CT dataset (Zenodo 10.5281/zenodo.17407158). Shipped as a simplified, meshopt-compressed GLB
//    (public/media/veritomix/abdominal-phantom.glb) and loaded lazily.
//  - The NEMA IEC body phantom with six micro-spheres, rebuilt from the CASSOULET phantom template
//    (cassoulet_sim/Phantoms/NEMA IEC Micro sphere/phantom_metadata.json).
// Lengths in millimetres, scaled by ctx.k. Scene axes: x = head-foot (head towards +x), y = anterior (up), z = lateral.

// Native GLB frame: x = patient right, y = anterior, z = superior. Centre of the body surface:
const NATIVE_CENTRE = [-13, 197, -788];

export function phantomCategory(name) {
  const n = name.toLowerCase();
  if (n.startsWith('skin')) return 'skin';
  if (n.startsWith('fat')) return 'fat';
  if (n.startsWith('arteries__') || /aorta|iliac_artery/.test(n)) return 'artery';
  if (n.startsWith('veins__') || /vena|portal|pulmonary_vein|hepatic_vessels/.test(n)) return 'vein';
  if (/rib_|vertebrae|hip_|femur|sacrum|scapula|sternum|costal/.test(n)) return 'bone';
  if (/autochthon|gluteus|iliopsoas/.test(n)) return 'muscle';
  if (/liver/.test(n)) return 'liver';
  if (/kidney/.test(n)) return 'kidney';
  if (/spleen/.test(n)) return 'spleen';
  if (/lung/.test(n)) return 'lung';
  if (/heart|atrial/.test(n)) return 'heart';
  if (/colon|duodenum|small_bowel|stomach|esophagus/.test(n)) return 'bowel';
  if (/bladder|prostate/.test(n)) return 'bladder';
  return 'gland';
}

// Loads the GLB and returns { group, byCat: {cat: [mesh]}, byName: Map }. Materials are assigned by the caller.
export async function loadAbdominalPhantom(ctx, url) {
  const { THREE, k } = ctx;
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js'),
  ]);
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const inner = gltf.scene;
  inner.position.set(-NATIVE_CENTRE[0], -NATIVE_CENTRE[1], -NATIVE_CENTRE[2]);
  const group = new THREE.Group();
  group.rotation.y = Math.PI / 2; // native z (superior) -> scene +x, native x (right) -> scene -z
  group.scale.setScalar(k);
  group.add(inner);
  const byCat = {}, byName = new Map();
  inner.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.computeVertexNormals();
    const cat = phantomCategory(o.name || o.parent?.name || '');
    (byCat[cat] ||= []).push(o);
    byName.set(o.name, o);
  });
  return { group, byCat, byName };
}

const NEMA = {
  diameters: [3.95, 4.95, 6.23, 7.86, 9.89, 12.43],
  centres: [[35.72, 75.91], [-20.98, 75.35], [-49.62, 25.22], [-21.07, -24.37], [36.62, -23.4], [66.7, 25.66]],
  ring: [8, 25.6], // the spheres sit on a circle around the lung-insert axis
  length: 180, arcR: 147, lower: 83, corner: 77,
};

// NEMA IEC body phantom: D-shaped tank, central lung insert, six hot spheres. Returns { group, spheres, shellMats }.
export function buildNema(ctx) {
  const { THREE, k, std, lowPower } = ctx;
  const g = new THREE.Group();
  const s = new THREE.Shape();
  const { arcR, lower, corner } = NEMA;
  s.moveTo(arcR, 0);
  s.absarc(0, 0, arcR, 0, Math.PI, false);
  s.lineTo(-arcR, -lower + corner);
  s.quadraticCurveTo(-arcR, -lower, -arcR + corner, -lower);
  s.lineTo(arcR - corner, -lower);
  s.quadraticCurveTo(arcR, -lower, arcR, -lower + corner);
  s.lineTo(arcR, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: NEMA.length, bevelEnabled: false, curveSegments: lowPower ? 16 : 32 });
  geo.translate(0, 0, -NEMA.length / 2);
  geo.rotateY(Math.PI / 2); // extrusion axis -> scene x
  geo.scale(k, k, k);
  const tankM = std('nemaShell', { opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, roughness: 0.15 });
  const tank = new THREE.Mesh(geo, tankM);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), ctx.lineMat('nemaEdge', { opacity: 0.85 }));
  g.add(tank, edges);
  const lungM = std('lung', { opacity: 0.5, roughness: 0.6 });
  const lungG = new THREE.CylinderGeometry(25 * k, 25 * k, NEMA.length * k, 24); lungG.rotateZ(Math.PI / 2);
  g.add(new THREE.Mesh(lungG, lungM));
  const spheres = NEMA.centres.map(([x, y], i) => {
    const m = std('lesion', { emissive: 0xffffff, emissiveIntensity: 0.8, roughness: 0.3 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry((NEMA.diameters[i] / 2) * k * 1.6, 18, 12), m);
    // Sphere sizes are drawn 1.6x larger than the real 4-12 mm so they read at this scale.
    mesh.position.set(-17 * k, (y - NEMA.ring[1]) * k, (x - NEMA.ring[0]) * k);
    g.add(mesh);
    return { mesh, m, d: NEMA.diameters[i] };
  });
  return { group: g, spheres, bottom: -lower * k, mats: [tankM, edges.material, lungM, ...spheres.map((x) => x.m)] };
}

// Emulated, research-based PET/CT scanner models for the VeriTomiX page.
// Geometry is ported from the CASSOULET scanner viewers (cassoulet_sim/Scanners/5RDMI/dmi_5r_scanner_model.html and
// Scanners/OmniLegend32/omni_legend_32_scanner_model.html): published module/block counts and dimensions, with the
// assumptions those packages document (polygon packing, block gaps). Housing shapes are illustrative, not engineering CAD.
// All lengths are millimetres; buildScanner() scales them by ctx.k into scene units.

export const SCANNERS = {
  dmi: {
    id: 'dmi', name: 'GE Discovery MI 5-ring', short: 'Discovery MI 5R',
    boreR: 350, detR: 372, outerR: 980, depth: 1050, ctDepth: 640,
    modules: 34, rings: 5, blockLen: 47.84, blockGap: 2.8, blockW: 64.5, blockDepth: 25,
    facts: ['34 modules × 4 blocks × 4 crystals', '45 crystal rows × 544 crystals', '25 mm LBS crystals', 'TOF, 385 ps in 29 bins'],
  },
  omni: {
    id: 'omni', name: 'GE Omni Legend 32 cm', short: 'Omni Legend 32',
    boreR: 350, detR: 362.7, outerR: 980, depth: 1050, ctDepth: 640,
    modules: 22, rings: 6, blockLen: 320 / 6, blockGap: 0, blockW: 98.4, blockDepth: 30,
    facts: ['22 modules × 24 blocks', '72 crystal rows × 528 crystals', '4.1 × 4.1 × 30 mm BGO', 'Non-TOF, 320 mm axial FOV'],
  },
};

// ctx: { THREE, k, std, basic, lineMat, rbox, lowPower }. Materials come from the page so they follow the theme.
// cut: [a0, a1] angular sector (radians) whose detector modules are left out, so the bore can be seen.
export function buildScanner(ctx, spec, cut = [0, 0]) {
  const { THREE, k, std, basic, lineMat, rbox } = ctx;
  const g = new THREE.Group();
  const solid = [];
  const R_IN = spec.boreR * k, R_OUT = spec.outerR * k, LEN = spec.depth * k, CT = spec.ctDepth * k;
  const R_DET = spec.detR * k;
  const pitch = (spec.blockLen + spec.blockGap) * k;
  const afov = (spec.rings * spec.blockLen + (spec.rings - 1) * spec.blockGap) * k;
  // A window in the shell faces the camera so the detector ring and the patient stay visible.
  const W0 = Math.PI / 2, WL = Math.PI * 1.5;
  const seg = ctx.lowPower ? 48 : 72;

  const shellM = std('housing', { side: THREE.DoubleSide, roughness: 0.32 });
  const faceM = std('face', { side: THREE.DoubleSide, roughness: 0.4 });
  const linerM = std('lining', { side: THREE.DoubleSide, opacity: 0.14, depthWrite: false });
  const baseM = std('base');
  const trimM = std('trim', { roughness: 0.25, metalness: 0.5, emissive: 0x000000 });
  solid.push(shellM, faceM, linerM, baseM, trimM);
  const cyl = (r, len, x, m, open = true, t0 = W0, tl = WL) => {
    const geo = new THREE.CylinderGeometry(r, r, len, seg, 1, open, t0, tl); geo.rotateZ(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, m); mesh.position.x = x; g.add(mesh); return mesh;
  };
  const ring = (rIn, rOut, x, m, t0 = Math.PI, tl = WL) => {
    const geo = new THREE.RingGeometry(rIn, rOut, seg, 1, t0, tl); geo.rotateY(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, m); mesh.position.x = x; g.add(mesh); return mesh;
  };
  // PET section (centred on x = 0) and the CT section in front of it (towards -x, where the couch enters).
  cyl(R_OUT, LEN, 0, shellM);
  cyl(R_OUT * 0.97, CT, -LEN / 2 - CT / 2, shellM);
  ring(R_IN, R_OUT, LEN / 2, faceM);
  ring(R_IN, R_OUT * 0.97, -LEN / 2 - CT, faceM);
  ring(R_OUT * 0.97, R_OUT, -LEN / 2, faceM);
  cyl(R_IN, LEN + CT, -CT / 2, linerM, true, 0, Math.PI * 2);
  [LEN / 2, -LEN / 2 - CT].forEach((x) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(R_IN + 25 * k, 7 * k, 8, seg), trimM);
    t.rotation.y = Math.PI / 2; t.position.x = x; g.add(t);
  });
  const base = new THREE.Mesh(rbox(LEN + CT * 0.95, 0.42, R_OUT * 1.25, 0.06), baseM);
  base.position.set(-CT / 2, -R_OUT - 0.1, 0); g.add(base);
  // Detector support girder behind the modules.
  const girderM = std('girder', { roughness: 0.4, metalness: 0.35 });
  solid.push(girderM);
  cyl(R_DET + 48 * k, afov + 30 * k, 0, girderM);

  // Detector modules: one instanced box per (axial block ring, module), flat faces of a regular polygon.
  const nInst = spec.modules * spec.rings;
  const detM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2, transparent: true });
  detM.userData.base = 1;
  const det = new THREE.InstancedMesh(rbox(spec.blockLen * k * 0.98, spec.blockDepth * k, spec.blockW * k * 0.98, 0.004), detM, nInst);
  const sipmM = std('sipm', { roughness: 0.4, metalness: 0.4 });
  solid.push(detM, sipmM);
  const sipm = new THREE.InstancedMesh(new THREE.BoxGeometry(spec.blockLen * k * 0.98, 10 * k, spec.blockW * k * 1.02), sipmM, nInst);
  const o = new THREE.Object3D();
  for (let r = 0; r < spec.rings; r++) for (let m = 0; m < spec.modules; m++) {
    const a = (m / spec.modules) * Math.PI * 2;
    const x = (r - (spec.rings - 1) / 2) * pitch;
    const place = (rad, mesh) => {
      o.position.set(x, Math.sin(a) * rad, Math.cos(a) * rad);
      o.rotation.set(Math.PI / 2 - a, 0, 0);
      o.scale.setScalar(a > cut[0] && a < cut[1] ? 0 : 1); // cut-away sector facing the camera window
      o.updateMatrix();
      mesh.setMatrixAt(r * spec.modules + m, o.matrix);
    };
    place(R_DET + (spec.blockDepth * k) / 2, det);
    place(R_DET + spec.blockDepth * k + 5 * k, sipm);
    det.setColorAt(r * spec.modules + m, new THREE.Color(1, 1, 1));
  }
  g.add(det, sipm);

  // Wireframe twin of this scanner (shown in the digital-twin step).
  const pts = [];
  const loop = (r, x, n) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2; pts.push(x, Math.sin(a) * r, Math.cos(a) * r, x, Math.sin(b) * r, Math.cos(b) * r); } };
  [LEN / 2, -LEN / 2, -LEN / 2 - CT].forEach((x) => { loop(R_IN, x, 64); loop(R_OUT, x, 64); });
  for (let r = 0; r <= spec.rings; r++) loop(R_DET, (r - spec.rings / 2) * pitch, spec.modules);
  for (let i = 0; i < spec.modules; i++) {
    const a = (i / spec.modules) * Math.PI * 2;
    pts.push(-afov / 2, Math.sin(a) * R_DET, Math.cos(a) * R_DET, afov / 2, Math.sin(a) * R_DET, Math.cos(a) * R_DET);
  }
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push(-LEN / 2 - CT, Math.sin(a) * R_OUT, Math.cos(a) * R_OUT, LEN / 2, Math.sin(a) * R_OUT, Math.cos(a) * R_OUT); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const twinM = lineMat('twin', { opacity: 1, depthWrite: false, toneMapped: false });
  const twin = new THREE.LineSegments(tg, twinM);
  g.add(twin);

  return {
    spec, group: g, det, heat: new Float32Array(nInst), solid, twinM,
    rDet: R_DET, rIn: R_IN, rOut: R_OUT, len: LEN, ct: CT, pitch, afov,
    ringOf: (x) => Math.max(0, Math.min(spec.rings - 1, Math.round(x / pitch + (spec.rings - 1) / 2))),
    moduleOf: (y, z) => ((Math.round((Math.atan2(y, z) / (Math.PI * 2)) * spec.modules) % spec.modules) + spec.modules) % spec.modules,
  };
}

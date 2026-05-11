(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var mount = document.getElementById('kage3dMount');
    if (!mount || !window.THREE) return;

    var THREE = window.THREE;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.2, 7.2);
    camera.lookAt(0, 0.45, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x74656a, 0.9));
    var key = new THREE.DirectionalLight(0xfff1dd, 1.35);
    key.position.set(3.2, 5.5, 4.5);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x8b1a1a, 0.55);
    rim.position.set(-3, 2.4, -2.5);
    scene.add(rim);
    var redLight = new THREE.PointLight(0xc23b3b, 1.25, 8);
    redLight.position.set(-1.8, 1.7, 2.4);
    scene.add(redLight);

    var root = new THREE.Group();
    root.rotation.y = 0.32;
    scene.add(root);

    function mat(color, extra) {
      extra = extra || {};
      return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.72, metalness: 0.04, flatShading: true }, extra));
    }

    var mats = {
      hat: mat(0xb09565),
      hatDark: mat(0x8e7548),
      face: mat(0xc9a87a, { roughness: 0.5 }),
      robe: mat(0x2e2a38),
      cloak: mat(0x22202c),
      dark: mat(0x14131a),
      sash: mat(0xa52525),
      sashDark: mat(0x701818),
      blade: mat(0xf0ebe3, { roughness: 0.16, metalness: 0.7 }),
      guard: mat(0xb5ada5, { roughness: 0.22, metalness: 0.35 }),
      eye: new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff2525, emissiveIntensity: 1.6, roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: 0x3b0b0b, emissive: 0x8b1a1a, emissiveIntensity: 0.2, roughness: 0.45 }),
      base: mat(0x0b0b0d, { metalness: 0.25 }),
      baseRing: new THREE.MeshBasicMaterial({ color: 0x8b1a1a, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    };

    function add(parent, geom, material, pos, rot, scale) {
      var m = new THREE.Mesh(geom, material);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      parent.add(m);
      return m;
    }

    // Display base
    add(root, new THREE.CylinderGeometry(1.05, 1.18, 0.12, 48), mats.base, [0, -1.46, 0]);
    var baseRing = add(root, new THREE.RingGeometry(0.82, 0.98, 48), mats.baseRing, [0, -1.39, 0], [-Math.PI / 2, 0, 0]);

    var kage = new THREE.Group();
    root.add(kage);

    // Body: built to match the chatbot Kage silhouette.
    var torso = new THREE.Group();
    torso.position.set(0, -0.16, 0);
    kage.add(torso);
    var body = add(torso, new THREE.BoxGeometry(0.7, 1.08, 0.42), mats.robe, [0, -0.05, 0]);
    var cloak = add(torso, new THREE.CylinderGeometry(0.58, 0.72, 1.08, 4), mats.cloak, [0, -0.34, -0.02], [0, Math.PI / 4, 0], [1, 1, 0.72]);
    var sash = add(torso, new THREE.BoxGeometry(0.82, 0.12, 0.09), mats.sash, [0.03, 0.05, 0.26], [0, 0, -0.35]);
    var sashTail = add(torso, new THREE.BoxGeometry(0.28, 0.11, 0.08), mats.sash, [0.52, 0.14, 0.28], [0, 0, 0.1]);

    var headGroup = new THREE.Group();
    headGroup.position.set(0, 0.73, 0.02);
    kage.add(headGroup);
    var head = add(headGroup, new THREE.BoxGeometry(0.55, 0.5, 0.42), mats.face, [0, 0, 0]);
    add(headGroup, new THREE.BoxGeometry(0.36, 0.12, 0.32), mats.face, [0, -0.29, 0.02]);

    // Clear conical kasa: visible cone + separate brim, never flattened into a sheet.
    var kasa = new THREE.Group();
    kasa.position.set(0, 0.32, 0);
    headGroup.add(kasa);
    var hatCone = add(kasa, new THREE.ConeGeometry(0.95, 0.48, 28), mats.hat, [0, 0.22, 0], [0, 0, 0]);
    var hatBrim = add(kasa, new THREE.CylinderGeometry(1.02, 1.02, 0.055, 28), mats.hatDark, [0, 0.02, 0], [0, 0, 0]);
    var hatTip = add(kasa, new THREE.ConeGeometry(0.055, 0.11, 8), mats.sash, [0, 0.5, 0], [0, Math.PI / 4, 0]);

    var eyeL = add(headGroup, new THREE.BoxGeometry(0.12, 0.045, 0.022), mats.eye, [-0.13, 0.05, 0.222]);
    var eyeR = add(headGroup, new THREE.BoxGeometry(0.12, 0.045, 0.022), mats.eye, [0.13, 0.05, 0.222]);
    var browL = add(headGroup, new THREE.BoxGeometry(0.15, 0.026, 0.025), mats.dark, [-0.13, 0.13, 0.218], [0, 0, 0.12]);
    var browR = add(headGroup, new THREE.BoxGeometry(0.15, 0.026, 0.025), mats.dark, [0.13, 0.13, 0.218], [0, 0, -0.12]);
    var mouth = add(headGroup, new THREE.BoxGeometry(0.18, 0.024, 0.024), mats.mouth, [0, -0.12, 0.224]);

    var leftArm = new THREE.Group();
    var rightArm = new THREE.Group();
    leftArm.position.set(-0.45, 0.05, 0.02);
    rightArm.position.set(0.45, 0.05, 0.02);
    kage.add(leftArm, rightArm);
    var leftSleeve = add(leftArm, new THREE.BoxGeometry(0.18, 0.62, 0.18), mats.robe, [0, -0.25, 0], [0, 0, -0.16]);
    var rightSleeve = add(rightArm, new THREE.BoxGeometry(0.18, 0.62, 0.18), mats.robe, [0, -0.25, 0], [0, 0, 0.16]);
    var leftHand = add(leftArm, new THREE.BoxGeometry(0.11, 0.11, 0.1), mats.face, [0.02, -0.61, 0]);
    var rightHand = add(rightArm, new THREE.BoxGeometry(0.11, 0.11, 0.1), mats.face, [-0.02, -0.61, 0]);

    var legL = add(kage, new THREE.BoxGeometry(0.18, 0.56, 0.2), mats.dark, [-0.18, -1.0, -0.02]);
    var legR = add(kage, new THREE.BoxGeometry(0.18, 0.56, 0.2), mats.dark, [0.18, -1.0, -0.02]);

    var sword = new THREE.Group();
    add(sword, new THREE.BoxGeometry(0.045, 1.25, 0.024), mats.blade, [0, 0, 0]);
    add(sword, new THREE.BoxGeometry(0.16, 0.035, 0.13), mats.guard, [0, -0.66, 0], [0, Math.PI / 4, 0]);
    add(sword, new THREE.BoxGeometry(0.07, 0.3, 0.055), mats.sash, [0, -0.83, 0]);
    sword.position.set(0.57, 0.17, 0.12);
    sword.rotation.set(0.08, 0, -0.5);
    kage.add(sword);

    var parts = { root: root, kage: kage, torso: torso, body: body, cloak: cloak, sash: sash, sashTail: sashTail, headGroup: headGroup, head: head, kasa: kasa, hatCone: hatCone, hatBrim: hatBrim, hatTip: hatTip, eyeL: eyeL, eyeR: eyeR, browL: browL, browR: browR, mouth: mouth, leftArm: leftArm, rightArm: rightArm, leftSleeve: leftSleeve, rightSleeve: rightSleeve, leftHand: leftHand, rightHand: rightHand, legL: legL, legR: legR, sword: sword };

    var poseText = {
      guardian: '<strong>Guardian:</strong> Kage wears the same dark robe, red sash, straw kasa, and quiet blade seen in the chatbot form — the default shadow guide of Sensei Sai.',
      scout: '<strong>Scout:</strong> Kage leans forward in a lighter travel sash, watching for the quickest route through the scrolls.',
      oracle: '<strong>Oracle:</strong> Kage darkens the robe, lowers the blade, and lets the red eyes glow like a quiet answer forming in the dark.',
      ronin: '<strong>Ronin:</strong> Kage shifts into a guarded stance with the katana across the body — protective, calm, and ready.',
      meditate: '<strong>Meditating:</strong> Kage sits upright beneath the kasa, blade resting, waiting for the signal beneath the noise.',
      sleep: '<strong>Sleeping:</strong> Kage dozes while standing small and still. Even shadows recharge before the next visitor arrives.'
    };

    function setDress(kind) {
      var palette = {
        guardian: [0x2e2a38, 0x22202c, 0xa52525, 0xb09565, 0x8e7548],
        scout: [0x303346, 0x202230, 0xb26a35, 0xb49b6d, 0x90794e],
        oracle: [0x252235, 0x171724, 0x8b1a1a, 0x80775b, 0x65583f],
        ronin: [0x292330, 0x17151d, 0xb32b2b, 0xb09565, 0x8e7548],
        meditate: [0x353040, 0x1c1a23, 0x7e1515, 0xaa9368, 0x83704c],
        sleep: [0x24212c, 0x17161e, 0x7c1717, 0xa48b5f, 0x76643f]
      }[kind] || palette.guardian;
      mats.robe.color.setHex(palette[0]);
      mats.cloak.color.setHex(palette[1]);
      mats.sash.color.setHex(palette[2]);
      mats.hat.color.setHex(palette[3]);
      mats.hatDark.color.setHex(palette[4]);
    }

    function resetPose() {
      setDress('guardian');
      root.position.set(0, 0, 0); root.rotation.x = 0;
      kage.position.set(0, 0, 0); kage.rotation.set(0, 0, 0); kage.scale.set(1, 1, 1);
      torso.position.set(0, -0.16, 0); torso.rotation.set(0, 0, 0); torso.scale.set(1, 1, 1);
      body.position.set(0, -0.05, 0); body.rotation.set(0, 0, 0); body.scale.set(1, 1, 1);
      cloak.position.set(0, -0.34, -0.02); cloak.rotation.set(0, Math.PI / 4, 0); cloak.scale.set(1, 1, 0.72);
      headGroup.position.set(0, 0.73, 0.02); headGroup.rotation.set(0, 0, 0); headGroup.scale.set(1, 1, 1);
      kasa.position.set(0, 0.32, 0); kasa.rotation.set(0, 0, 0); kasa.scale.set(1, 1, 1);
      leftArm.position.set(-0.45, 0.05, 0.02); leftArm.rotation.set(0, 0, 0);
      rightArm.position.set(0.45, 0.05, 0.02); rightArm.rotation.set(0, 0, 0);
      leftSleeve.position.set(0, -0.25, 0); leftSleeve.rotation.set(0, 0, -0.16);
      rightSleeve.position.set(0, -0.25, 0); rightSleeve.rotation.set(0, 0, 0.16);
      leftHand.position.set(0.02, -0.61, 0); rightHand.position.set(-0.02, -0.61, 0);
      legL.position.set(-0.18, -1.0, -0.02); legL.rotation.set(0, 0, 0); legL.scale.set(1, 1, 1);
      legR.position.set(0.18, -1.0, -0.02); legR.rotation.set(0, 0, 0); legR.scale.set(1, 1, 1);
      sash.position.set(0.03, 0.05, 0.26); sash.rotation.set(0, 0, -0.35); sashTail.position.set(0.52, 0.14, 0.28); sashTail.rotation.set(0, 0, 0.1);
      sword.position.set(0.57, 0.17, 0.12); sword.rotation.set(0.08, 0, -0.5);
      camera.position.set(0, 1.2, 7.2); camera.lookAt(0, 0.45, 0);
    }

    function setPose(pose) {
      resetPose();
      setDress(pose);
      if (pose === 'scout') {
        kage.rotation.x = -0.08; headGroup.rotation.x = -0.12; rightArm.rotation.z = -0.3; sword.position.set(-0.62, 0.06, 0.18); sword.rotation.set(0.12, 0, 0.62);
      } else if (pose === 'oracle') {
        headGroup.rotation.x = 0.08; sword.position.set(0.78, -0.1, 0.04); sword.rotation.set(0.05, 0, -0.16); leftArm.rotation.z = 0.24; rightArm.rotation.z = -0.24;
      } else if (pose === 'ronin') {
        rightArm.rotation.z = -0.42; leftArm.rotation.z = 0.22; sword.position.set(0.15, 0.18, 0.46); sword.rotation.set(0.12, 0, -1.22); headGroup.rotation.y = -0.06;
      } else if (pose === 'meditate') {
        kage.position.y = -0.18; torso.position.y = -0.36; torso.scale.set(0.95, 0.8, 0.95); headGroup.position.y = 0.32; kasa.position.y = 0.34;
        leftArm.position.set(-0.35, -0.15, 0.08); rightArm.position.set(0.35, -0.15, 0.08); leftArm.rotation.z = 0.95; rightArm.rotation.z = -0.95;
        legL.position.set(-0.36, -1.1, 0.14); legL.rotation.set(0.18, 0, 1.25); legL.scale.set(1, 0.72, 1);
        legR.position.set(0.36, -1.1, 0.14); legR.rotation.set(0.18, 0, -1.25); legR.scale.set(1, 0.72, 1);
        sword.position.set(0.84, -0.75, 0.06); sword.rotation.set(0, 0, -0.1);
        camera.position.set(0, 0.95, 7.4); camera.lookAt(0, 0.18, 0);
      } else if (pose === 'sleep') {
        // Keep Kage upright and readable. No sideways rotation.
        kage.position.y = -0.1; headGroup.rotation.x = 0.28; headGroup.rotation.z = -0.1; kasa.rotation.z = -0.08;
        leftArm.rotation.z = 0.35; rightArm.rotation.z = -0.35; sword.position.set(0.75, -0.24, 0.06); sword.rotation.set(0, 0, -0.18);
        legL.scale.y = 0.88; legR.scale.y = 0.88;
      }
      var status = document.getElementById('kage3dStatus');
      if (status) status.innerHTML = poseText[pose] || poseText.guardian;
      if (window.trackSaiEvent) window.trackSaiEvent('Kage 3D Pose', { pose: pose });
    }

    function setExpression(expression) {
      eyeL.scale.set(1, 1, 1); eyeR.scale.set(1, 1, 1); mouth.visible = true; mouth.rotation.z = 0; mouth.scale.set(1, 1, 1); mats.eye.emissiveIntensity = 1.6; mats.mouth.emissiveIntensity = 0.2;
      if (expression === 'speaking') { mouth.scale.set(1.15, 2.15, 1); mats.mouth.emissiveIntensity = 0.75; }
      if (expression === 'smirk') { mouth.rotation.z = -0.22; mouth.scale.set(0.92, 1, 1); }
      if (expression === 'focused') { eyeL.scale.set(1.14, 0.62, 1); eyeR.scale.set(1.14, 0.62, 1); mats.eye.emissiveIntensity = 2.25; }
      if (expression === 'sleepy') { eyeL.scale.set(1, 0.28, 1); eyeR.scale.set(1, 0.28, 1); mouth.scale.set(0.82, 0.72, 1); mats.eye.emissiveIntensity = 0.65; }
      if (expression === 'silent') { mouth.visible = false; mats.eye.emissiveIntensity = 1.1; }
      if (window.trackSaiEvent) window.trackSaiEvent('Kage 3D Expression', { expression: expression });
    }

    function wireControls(containerId, attr, fn) {
      var wrap = document.getElementById(containerId);
      if (!wrap) return;
      wrap.addEventListener('click', function (e) {
        var btn = e.target.closest('button[' + attr + ']');
        if (!btn) return;
        wrap.querySelectorAll('.kage-control').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        fn(btn.getAttribute(attr));
      });
    }

    wireControls('kagePoseControls', 'data-pose', setPose);
    wireControls('kageExpressionControls', 'data-expression', setExpression);

    var dragging = false;
    var lastX = 0;
    mount.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; mount.setPointerCapture(e.pointerId); });
    mount.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      root.rotation.y += dx * 0.012;
    });
    mount.addEventListener('pointerup', function () { dragging = false; });
    mount.addEventListener('pointercancel', function () { dragging = false; });
    mount.addEventListener('wheel', function (e) {
      e.preventDefault();
      camera.position.z = Math.max(5.8, Math.min(9.5, camera.position.z + e.deltaY * 0.004));
    }, { passive: false });

    function resize() {
      var rect = mount.getBoundingClientRect();
      var w = Math.max(320, rect.width);
      var h = Math.max(400, rect.height || 560);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', resize);
    resize();
    setPose('guardian');
    setExpression('calm');

    function animate() {
      requestAnimationFrame(animate);
      if (!dragging) root.rotation.y += 0.002;
      baseRing.rotation.z += 0.003;
      renderer.render(scene, camera);
    }
    animate();
  });
})();

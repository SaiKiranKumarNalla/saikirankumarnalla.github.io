// KAGE v6 — fixed katana handle pivot + hat framing
(function(){
'use strict';

function boot(){
  if(typeof THREE==='undefined'){
    setTimeout(boot,100);
    return;
  }

  try{
    go();
  }catch(e){
    console.error('Kage error:',e);
  }
}

function go(){
  // Prevent duplicate Kage instances if this file is injected twice
  var old=document.querySelector('.kage-wrap');
  if(old) old.remove();

  // CSS
  var s=document.createElement('style');
  s.textContent='.kage-wrap{position:fixed;bottom:4px;right:4px;z-index:900;opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s;pointer-events:none}.kage-wrap.visible{opacity:1;transform:translateY(0);pointer-events:auto}.kage-stage{width:96px;height:140px;cursor:pointer;overflow:visible}.kage-stage canvas{display:block}.kage-tooltip{position:absolute;bottom:100%;right:50px;width:185px;border:1px solid rgba(139,26,26,.2);background:rgba(10,10,11,.94);backdrop-filter:blur(12px);padding:.7rem;opacity:0;visibility:hidden;transform:translate(8px,8px) scale(.95);transform-origin:bottom right;transition:all .3s;pointer-events:none;z-index:901}.kage-tooltip.show{opacity:1;visibility:visible;transform:translate(0,0) scale(1);pointer-events:auto}.kt-h{display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem;padding-bottom:.35rem;border-bottom:1px solid rgba(240,235,227,.06)}.kt-h b{font-family:serif;font-size:1.1rem;color:rgba(139,26,26,.35)}.kt-h em{font-family:serif;font-size:.75rem;color:#f0ebe3;font-style:normal}.kt-s{font-family:monospace;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#c23b3b;margin-bottom:4px}.kt-d{font-size:11px;color:#c4bfb6;line-height:1.5}.kt-f{font-family:monospace;font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#4a4a4a;margin-top:6px}';
  document.head.appendChild(s);

  // DOM
  var wrap=document.createElement('div');
  wrap.className='kage-wrap';

  var tip=document.createElement('div');
  tip.className='kage-tooltip';
  tip.innerHTML='<div class="kt-h"><b>\u5F71</b><em>Kage</em></div><div class="kt-s">Shadow Protocol \u2014 Dormant</div><div class="kt-d">Your guide through this portfolio.</div><div class="kt-f">Coming Soon</div>';

  var stage=document.createElement('div');
  stage.className='kage-stage';

  wrap.appendChild(tip);
  wrap.appendChild(stage);
  document.body.appendChild(wrap);

  // Three.js
  var W=96;
  var H=140;

  var renderer=new THREE.WebGLRenderer({
    antialias:true,
    alpha:true
  });

  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
  stage.appendChild(renderer.domElement);

  var scene=new THREE.Scene();

  var camera=new THREE.PerspectiveCamera(26,W/H,0.1,50);
  camera.position.set(1.8,1.72,6.2);
  camera.lookAt(new THREE.Vector3(0,1.15,0));

  scene.add(new THREE.AmbientLight(0x888888,0.9));

  var dl=new THREE.DirectionalLight(0xfff5e8,1.1);
  dl.position.set(4,7,5);
  scene.add(dl);

  var rl=new THREE.DirectionalLight(0x8b1a1a,0.3);
  rl.position.set(-3,2,-2);
  scene.add(rl);

  var fl=new THREE.PointLight(0xffe8cc,0.35,6);
  fl.position.set(0,2.3,3);
  scene.add(fl);

  // Materials
  var mBody=new THREE.MeshLambertMaterial({color:0x2e2a38,flatShading:true});
  var mCloth=new THREE.MeshLambertMaterial({color:0x22202c,flatShading:true});
  var mCrim=new THREE.MeshLambertMaterial({color:0xa52525,flatShading:true});
  var mAccent=new THREE.MeshLambertMaterial({color:0x701818,flatShading:true});
  var mSteel=new THREE.MeshLambertMaterial({color:0xb5ada5,flatShading:true});
  var mBlade=new THREE.MeshLambertMaterial({color:0xf5f0e8,flatShading:true});
  var mSkin=new THREE.MeshLambertMaterial({color:0xc9a87a,flatShading:true});
  var mSkinD=new THREE.MeshLambertMaterial({color:0xb09060,flatShading:true});
  var mEye=new THREE.MeshBasicMaterial({color:0xee4444});
  var mBrow=new THREE.MeshLambertMaterial({color:0x3a2a18,flatShading:true});
  var mHat=new THREE.MeshLambertMaterial({color:0xb09565,flatShading:true});
  var mHatD=new THREE.MeshLambertMaterial({color:0x8e7548,flatShading:true});

  function box(gx,gy,gz,mat,px,py,pz,parent){
    var mesh=new THREE.Mesh(new THREE.BoxGeometry(gx,gy,gz),mat);
    mesh.position.set(px || 0,py || 0,pz || 0);
    (parent || scene).add(mesh);
    return mesh;
  }

  function lerp(a,b,f){
    return a+(b-a)*f;
  }

  var kg=new THREE.Group();

  // ── HEAD ──
  var head=new THREE.Group();
  head.position.set(0,2.08,0);

  // Face
  box(.42,.40,.38,mSkin,0,0,0,head);

  // Chin and jaw
  box(.30,.11,.26,mSkin,0,-.23,.02,head);
  box(.06,.13,.26,mSkinD,-.17,-.17,.02,head);
  box(.06,.13,.26,mSkinD,.17,-.17,.02,head);

  // Eyes
  var eyeL=box(.09,.04,.02,mEye.clone(),-.1,.04,.2,head);
  var eyeR=box(.09,.04,.02,mEye.clone(),.1,.04,.2,head);

  // Eyebrows
  var browL=box(.12,.025,.03,mBrow,-.1,.1,.19,head);
  browL.rotation.z=0.1;

  var browR=box(.12,.025,.03,mBrow,.1,.1,.19,head);
  browR.rotation.z=-0.1;

  // Kasa hat — larger frame + readable shallow cone
  var kasa=new THREE.Mesh(new THREE.ConeGeometry(.82,.34,16),mHat);
  kasa.position.set(0,.34,0);
  head.add(kasa);

  var kasaBot=new THREE.Mesh(new THREE.CircleGeometry(.66,16),mHatD);
  kasaBot.rotation.x=Math.PI/2;
  kasaBot.position.set(0,.18,0);
  head.add(kasaBot);

  var kasaTip=new THREE.Mesh(new THREE.ConeGeometry(.06,.12,4),mCrim);
  kasaTip.position.set(0,.56,0);
  kasaTip.rotation.y=Math.PI/4;
  head.add(kasaTip);

  kg.add(head);

  // ── TORSO ──
  var torso=new THREE.Group();
  torso.position.set(0,1.45,0);

  box(.48,.62,.28,mBody,0,0,0,torso);

  var sash=box(.055,.66,.29,mCrim,.04,0,.003,torso);
  sash.rotation.z=-.35;

  var kn=box(.07,.07,.04,mSteel,-.14,-.12,.15,torso);
  kn.rotation.z=Math.PI/4;

  var sode=box(.18,.05,.26,mCrim,-.28,.26,0,torso);
  sode.rotation.z=.18;

  kg.add(torso);

  // ── COAT PANELS ──
  var coatL=box(.03,.5,.2,mCloth,-.25,1.25,.03,kg);
  var coatR=box(.03,.5,.2,mCloth,.25,1.25,.03,kg);

  box(.14,.28,.03,mCloth,-.15,.98,-.14,kg);
  box(.14,.28,.03,mCloth,.15,.98,-.14,kg);

  // ── ARMS ──
  var armL=new THREE.Group();
  armL.position.set(-.32,1.32,0);

  box(.12,.26,.12,mBody,0,0,0,armL);
  box(.1,.22,.1,mCloth,0,-.24,0,armL);
  box(.08,.08,.08,mSkin,0,-.38,0,armL);

  kg.add(armL);

  var armR=new THREE.Group();
  armR.position.set(.36,1.32,.06);

  box(.12,.26,.12,mBody,0,0,0,armR);
  box(.1,.22,.1,mCloth,0,-.24,0,armR);
  box(.08,.08,.08,mSkin,0,-.38,0,armR);

  kg.add(armR);

  // ── HAKAMA + OBI ──
  var hak=new THREE.Mesh(new THREE.CylinderGeometry(.18,.33,.68,4),mCloth);
  hak.position.set(0,.66,0);
  hak.rotation.y=Math.PI/4;
  kg.add(hak);

  box(.5,.07,.3,mAccent,0,1.02,0,kg);

  // ── FEET ──
  box(.1,.04,.16,mCloth,-.11,.02,.02,kg);
  box(.1,.04,.16,mCloth,.11,.02,.02,kg);

  // ── KATANA ──
  // Important fix:
  // The katana group pivot is now the handle/grip point.
  // That means katana.position is the point where the hand should hold it.
  var katana=new THREE.Group();

  // Blade extends upward from guard
  box(.022,.82,.01,mBlade,0,.41,0,katana);

  var bladeGlow=box(
    .03,
    .82,
    .003,
    new THREE.MeshBasicMaterial({
      color:0xf5f0e8,
      transparent:true,
      opacity:.12
    }),
    0,
    .41,
    .008,
    katana
  );

  // Guard / tsuba near hand pivot
  var tsu=box(.09,.01,.09,mSteel,0,.02,0,katana);
  tsu.rotation.y=Math.PI/4;

  // Handle centered around pivot
  box(.03,.18,.03,mCrim,0,-.09,0,katana);

  // Pommel below the hand
  box(.035,.02,.035,mSteel,0,-.19,0,katana);

  kg.add(katana);

  var katBack={
    px:.1,
    py:1.55,
    pz:-.18,
    rx:.1,
    ry:0,
    rz:-.45
  };

  var katReady={
    px:.42,
    py:.92,
    pz:.10,
    rx:-.25,
    ry:0,
    rz:-.72
  };

  katana.position.set(katBack.px,katBack.py,katBack.pz);
  katana.rotation.set(katBack.rx,katBack.ry,katBack.rz);

  // ── PLATFORM ──
  var plat=new THREE.Mesh(
    new THREE.CylinderGeometry(.38,.42,.035,8),
    new THREE.MeshLambertMaterial({
      color:0x0e0e10,
      flatShading:true
    })
  );

  plat.position.y=-.018;
  scene.add(plat);

  var ring=new THREE.Mesh(
    new THREE.RingGeometry(.36,.42,8),
    new THREE.MeshBasicMaterial({
      color:0x8b1a1a,
      side:THREE.DoubleSide,
      transparent:true,
      opacity:.18
    })
  );

  ring.rotation.x=-Math.PI/2;
  ring.position.y=.002;
  scene.add(ring);

  // ── PARTICLES ──
  var PC=8;
  var pGeo=new THREE.BufferGeometry();
  var pArr=new Float32Array(PC*3);
  var pVel=[];

  for(var i=0;i<PC;i++){
    pArr[i*3]=(Math.random()-.5)*.7;
    pArr[i*3+1]=Math.random()*2;
    pArr[i*3+2]=(Math.random()-.5)*.7;
    pVel.push(.002+Math.random()*.004);
  }

  pGeo.setAttribute('position',new THREE.BufferAttribute(pArr,3));

  var pts=new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color:0xc23b3b,
      size:.02,
      transparent:true,
      opacity:.25
    })
  );

  scene.add(pts);

  // Diagonal stance
  kg.rotation.y=.48;
  scene.add(kg);

  // ── ANIMATE ──
  var t=0;
  var hov=false;
  var tgtR=.48;
  var curR=.48;
  var kL=0;
  var rafId=null;
  var hidden=false;

  function animate(){
    rafId=requestAnimationFrame(animate);

    if(hidden) return;

    t+=.016;

    torso.scale.y=1+Math.sin(t*1.4)*.01;
    head.position.y=2.08+Math.sin(t*1.4)*.003;

    var sw=hov ? tgtR : .48+Math.sin(t*.4)*.06;
    curR+=(sw-curR)*.04;
    kg.rotation.y=curR;

    coatL.rotation.x=Math.sin(t*1.8)*.025;
    coatR.rotation.x=Math.sin(t*1.8+.8)*.025;

    armL.rotation.x=Math.sin(t*.8)*.02;
    armR.rotation.x=hov ? -.08 : Math.sin(t*.8+Math.PI)*.02;

    var ei=hov ? 1 : .5+Math.sin(t*2.2)*.35;
    var ec=new THREE.Color(ei*.86,ei*.27,ei*.27);

    eyeL.material.color.copy(ec);
    eyeR.material.color.copy(ec);

    // Katana back ↔ ready
    var kt=hov ? 1 : 0;
    kL+=(kt-kL)*.06;

    katana.position.set(
      lerp(katBack.px,katReady.px,kL),
      lerp(katBack.py,katReady.py,kL),
      lerp(katBack.pz,katReady.pz,kL)
    );

    katana.rotation.set(
      lerp(katBack.rx,katReady.rx,kL),
      lerp(katBack.ry,katReady.ry,kL),
      lerp(katBack.rz,katReady.rz,kL)
    );

    head.rotation.x=hov ? .12 : Math.sin(t*.6)*.015;

    ring.rotation.z+=.003;
    bladeGlow.material.opacity=.08+Math.sin(t*1.5)*.05;

    var pp=pts.geometry.attributes.position.array;

    for(var j=0;j<PC;j++){
      pp[j*3+1]+=pVel[j];

      if(pp[j*3+1]>2.2){
        pp[j*3+1]=0;
        pp[j*3]=(Math.random()-.5)*.6;
        pp[j*3+2]=(Math.random()-.5)*.6;
      }
    }

    pts.geometry.attributes.position.needsUpdate=true;

    fl.intensity=hov ? .5 : .35;

    renderer.render(scene,camera);
  }

  animate();

  // ── VISIBILITY ──
  setInterval(function(){
    var a=document.getElementById('ac2');
    var shouldHide=!!(a && a.classList.contains('open'));

    hidden=shouldHide;
    wrap.style.display=shouldHide ? 'none' : '';
  },500);

  // Entrance — 2s delay then fade in + bow
  setTimeout(function(){
    wrap.classList.add('visible');

    setTimeout(function(){
      var v=0;

      var iv=setInterval(function(){
        v+=.03;
        head.rotation.x=Math.sin(v*Math.PI)*.2;

        if(v>=1){
          clearInterval(iv);
          head.rotation.x=0;
        }
      },16);
    },300);
  },2000);

  // ── INTERACTIONS ──
  stage.addEventListener('mouseenter',function(){
    hov=true;
  });

  stage.addEventListener('mouseleave',function(){
    hov=false;
    tgtR=.48;
  });

  stage.addEventListener('mousemove',function(e){
    if(!hov) return;

    var r=stage.getBoundingClientRect();
    tgtR=.48+((e.clientX-r.left)/r.width-.5)*.5;
  });

  stage.addEventListener('touchstart',function(){
    hov=true;
  },{passive:true});

  stage.addEventListener('touchend',function(){
    setTimeout(function(){
      hov=false;
      tgtR=.48;
    },1500);
  },{passive:true});

  var ttOpen=false;

  stage.addEventListener('click',function(e){
    e.stopPropagation();

    ttOpen=!ttOpen;
    tip.classList.toggle('show',ttOpen);
  });

  document.addEventListener('click',function(){
    if(ttOpen){
      ttOpen=false;
      tip.classList.remove('show');
    }
  });

  // Basic cleanup if you remove the widget manually in dev tools
  wrap.kageDispose=function(){
    if(rafId) cancelAnimationFrame(rafId);

    renderer.dispose();

    scene.traverse(function(obj){
      if(obj.geometry) obj.geometry.dispose();

      if(obj.material){
        if(Array.isArray(obj.material)){
          obj.material.forEach(function(mat){
            if(mat.dispose) mat.dispose();
          });
        }else if(obj.material.dispose){
          obj.material.dispose();
        }
      }
    });

    wrap.remove();
  };

  console.log('Kage v6 loaded successfully');
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot);
}else{
  boot();
}

})();

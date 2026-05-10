(function(){
'use strict';
function boot(){if(typeof THREE==='undefined'){setTimeout(boot,100);return;}go();}
function go(){
var css=document.createElement('style');
css.textContent='.kage-wrap{position:fixed;bottom:0;right:0;z-index:900;display:flex;flex-direction:column;align-items:flex-end;opacity:0;transform:translate(16px,16px);transition:opacity .8s,transform .8s;pointer-events:none}.kage-wrap.visible{opacity:1;transform:translate(0,0);pointer-events:auto}.kage-stage{width:80px;height:110px;background:0;position:relative;overflow:visible;cursor:pointer}.kage-stage canvas{display:block;width:100%!important;height:100%!important}.kage-tooltip{position:absolute;bottom:100%;right:50px;width:185px;border:1px solid rgba(139,26,26,.2);background:linear-gradient(135deg,rgba(139,26,26,.05),transparent 40%),rgba(10,10,11,.94);backdrop-filter:blur(12px);padding:.7rem;opacity:0;visibility:hidden;transform:translate(8px,8px) scale(.95);transform-origin:bottom right;transition:all .3s;pointer-events:none}.kage-tooltip.show{opacity:1;visibility:visible;transform:translate(0,0) scale(1);pointer-events:auto}.kage-tooltip::after{content:"";position:absolute;bottom:-5px;right:10px;width:8px;height:8px;background:rgba(10,10,11,.94);border-right:1px solid rgba(139,26,26,.2);border-bottom:1px solid rgba(139,26,26,.2);transform:rotate(45deg)}.kt-h{display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem;padding-bottom:.35rem;border-bottom:1px solid rgba(240,235,227,.06)}.kt-h b{font-family:"Noto Serif JP",serif;font-size:1.1rem;color:rgba(139,26,26,.35)}.kt-h span{font-family:"Zen Antique",serif;font-size:.75rem;color:#f0ebe3}.kt-s{font-family:"Space Mono",monospace;font-size:.36rem;text-transform:uppercase;letter-spacing:.12em;color:#c23b3b;margin-bottom:.3rem}.kt-d{font-size:.64rem;color:#c4bfb6;line-height:1.5;font-weight:300}.kt-f{font-family:"Space Mono",monospace;font-size:.34rem;text-transform:uppercase;letter-spacing:.1em;color:#4a4a4a;margin-top:.4rem}html[data-theme="light"] .kage-tooltip{background:linear-gradient(135deg,rgba(139,26,26,.04),transparent 40%),rgba(240,235,227,.95)!important}html[data-theme="light"] .kage-tooltip::after{background:rgba(240,235,227,.95)!important}html[data-theme="light"] .kt-h span{color:#1a1a1c!important}html[data-theme="light"] .kt-d{color:#4a4540!important}@media(max-width:600px){.kage-stage{width:65px;height:90px}.kage-tooltip{width:165px;right:40px}}';
document.head.appendChild(css);

var w=document.createElement('div');w.className='kage-wrap';
w.innerHTML='<div class="kage-tooltip" id="kageTip"><div class="kt-h"><b>\u5F71</b><span>Kage</span></div><div class="kt-s">Shadow Protocol \u2014 Dormant</div><div class="kt-d">Your guide through this portfolio. I watch, I wait, I remember.</div><div class="kt-f">Activation \u2014 Coming Soon</div></div><div class="kage-stage" id="kageStage"></div>';
document.body.appendChild(w);

var el=document.getElementById('kageStage'),tip=document.getElementById('kageTip');
var W=80,H=110;
var rnd=new THREE.WebGLRenderer({antialias:true,alpha:true});
rnd.setSize(W,H);rnd.setPixelRatio(Math.min(window.devicePixelRatio,2));
el.appendChild(rnd.domElement);

var sc=new THREE.Scene();
var cam=new THREE.PerspectiveCamera(26,W/H,0.1,50);
cam.position.set(1.8,1.7,5.2);cam.lookAt(0,1.05,0);
sc.add(new THREE.AmbientLight(0x888888,0.9));
var dl=new THREE.DirectionalLight(0xfff5e8,1.1);dl.position.set(4,7,5);sc.add(dl);
sc.add(new THREE.DirectionalLight(0x8b1a1a,0.3).translateX(-3).translateY(2).translateZ(-2));
var fl=new THREE.PointLight(0xffe8cc,0.35,6);fl.position.set(0,2.3,3);sc.add(fl);

var M={
  body:new THREE.MeshLambertMaterial({color:0x2e2a38,flatShading:true}),
  cloth:new THREE.MeshLambertMaterial({color:0x22202c,flatShading:true}),
  crim:new THREE.MeshLambertMaterial({color:0xa52525,flatShading:true}),
  accent:new THREE.MeshLambertMaterial({color:0x701818,flatShading:true}),
  steel:new THREE.MeshLambertMaterial({color:0xb5ada5,flatShading:true}),
  blade:new THREE.MeshLambertMaterial({color:0xf5f0e8,flatShading:true}),
  skin:new THREE.MeshLambertMaterial({color:0xc9a87a,flatShading:true}),
  skinD:new THREE.MeshLambertMaterial({color:0xb09060,flatShading:true}),
  eye:new THREE.MeshBasicMaterial({color:0xee4444}),
  brow:new THREE.MeshLambertMaterial({color:0x3a2a18,flatShading:true}),
  hat:new THREE.MeshLambertMaterial({color:0xb09565,flatShading:true}),
  hatD:new THREE.MeshLambertMaterial({color:0x8e7548,flatShading:true})
};

var kg=new THREE.Group(),P={};

// HEAD
var hd=new THREE.Group();hd.position.y=2.08;
hd.add(new THREE.Mesh(new THREE.BoxGeometry(.42,.40,.38),M.skin));
var ch=new THREE.Mesh(new THREE.BoxGeometry(.30,.11,.26),M.skin);ch.position.set(0,-.23,.02);hd.add(ch);
var jL=new THREE.Mesh(new THREE.BoxGeometry(.06,.13,.26),M.skinD);jL.position.set(-.17,-.17,.02);hd.add(jL);
var jR=new THREE.Mesh(new THREE.BoxGeometry(.06,.13,.26),M.skinD);jR.position.set(.17,-.17,.02);hd.add(jR);
var eg=new THREE.BoxGeometry(.09,.04,.02);
var eL=new THREE.Mesh(eg,M.eye.clone());eL.position.set(-.1,.04,.2);hd.add(eL);
var eR=new THREE.Mesh(eg,M.eye.clone());eR.position.set(.1,.04,.2);hd.add(eR);
P.eL=eL;P.eR=eR;
var bg=new THREE.BoxGeometry(.12,.025,.03);
hd.add(Object.assign(new THREE.Mesh(bg,M.brow),{position:new THREE.Vector3(-.1,.1,.19),rotation:new THREE.Euler(0,0,.1)}));
hd.add(Object.assign(new THREE.Mesh(bg,M.brow),{position:new THREE.Vector3(.1,.1,.19),rotation:new THREE.Euler(0,0,-.1)}));

// KASA — complete cone with bottom disc
var kasa=new THREE.Mesh(new THREE.ConeGeometry(.75,.4,12),M.hat);kasa.position.y=.36;hd.add(kasa);
var kasaB=new THREE.Mesh(new THREE.CircleGeometry(.75,12),M.hatD);kasaB.rotation.x=Math.PI/2;kasaB.position.y=.16;hd.add(kasaB);
var kasaT=new THREE.Mesh(new THREE.ConeGeometry(.06,.12,4),M.crim);kasaT.position.y=.57;kasaT.rotation.y=Math.PI/4;hd.add(kasaT);
kg.add(hd);P.head=hd;

// TORSO
var tg=new THREE.Group();tg.position.y=1.45;
tg.add(new THREE.Mesh(new THREE.BoxGeometry(.48,.62,.28),M.body));
var sash=new THREE.Mesh(new THREE.BoxGeometry(.055,.66,.29),M.crim);sash.rotation.z=-.35;sash.position.set(.04,0,.003);tg.add(sash);
var knot=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.04),M.steel);knot.rotation.z=Math.PI/4;knot.position.set(-.14,-.12,.15);tg.add(knot);
var sode=new THREE.Mesh(new THREE.BoxGeometry(.18,.05,.26),M.crim);sode.position.set(-.28,.26,0);sode.rotation.z=.18;tg.add(sode);
kg.add(tg);P.torso=tg;

// COAT
var cL=new THREE.Mesh(new THREE.BoxGeometry(.03,.5,.2),M.cloth);cL.position.set(-.25,1.25,.03);kg.add(cL);P.cL=cL;
var cR=new THREE.Mesh(new THREE.BoxGeometry(.03,.5,.2),M.cloth);cR.position.set(.25,1.25,.03);kg.add(cR);P.cR=cR;
kg.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.14,.28,.03),M.cloth),{position:new THREE.Vector3(-.15,.98,-.14)}));
kg.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.14,.28,.03),M.cloth),{position:new THREE.Vector3(.15,.98,-.14)}));

// ARMS
var aL=new THREE.Group();aL.position.set(-.32,1.32,0);
aL.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.26,.12),M.body));
aL.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.1,.22,.1),M.cloth),{position:new THREE.Vector3(0,-.24,0)}));
aL.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.08),M.skin),{position:new THREE.Vector3(0,-.38,0)}));
kg.add(aL);P.aL=aL;

var aR=new THREE.Group();aR.position.set(.32,1.32,0);
aR.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.26,.12),M.body));
aR.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.1,.22,.1),M.cloth),{position:new THREE.Vector3(0,-.24,0)}));
aR.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.08),M.skin),{position:new THREE.Vector3(0,-.38,0)}));
kg.add(aR);P.aR=aR;

// HAKAMA+OBI
kg.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.18,.33,.68,4),M.cloth),{position:new THREE.Vector3(0,.66,0),rotation:new THREE.Euler(0,Math.PI/4,0)}));
kg.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.5,.07,.3),M.accent),{position:new THREE.Vector3(0,1.02,0)}));

// FEET
var fg=new THREE.BoxGeometry(.1,.04,.16);
kg.add(Object.assign(new THREE.Mesh(fg,M.cloth),{position:new THREE.Vector3(-.11,.02,.02)}));
kg.add(Object.assign(new THREE.Mesh(fg,M.cloth),{position:new THREE.Vector3(.11,.02,.02)}));

// KATANA — starts on back
var kat=new THREE.Group();
kat.add(new THREE.Mesh(new THREE.BoxGeometry(.022,.82,.01),M.blade));
kat.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.03,.82,.003),new THREE.MeshBasicMaterial({color:0xf5f0e8,transparent:true,opacity:.12})),{position:new THREE.Vector3(0,0,.008)}));
kat.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.09,.01,.09),M.steel),{position:new THREE.Vector3(0,.42,0),rotation:new THREE.Euler(0,Math.PI/4,0)}));
kat.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.03,.18,.03),M.crim),{position:new THREE.Vector3(0,.52,0)}));
kat.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(.035,.02,.035),M.steel),{position:new THREE.Vector3(0,.62,0)}));
// Back position: handle up by right shoulder, blade angled down-left
kat.position.set(.1,1.55,-.18);kat.rotation.set(.1,0,-.45);
kg.add(kat);P.kat=kat;

var katBack={px:.1,py:1.55,pz:-.18,rx:.1,ry:0,rz:-.45};
var katReady={px:.44,py:1.0,pz:.12,rx:-.25,ry:0,rz:.75};

// PLATFORM
sc.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.035,8),new THREE.MeshLambertMaterial({color:0x0e0e10,flatShading:true})),{position:new THREE.Vector3(0,-.018,0)}));
var ring=new THREE.Mesh(new THREE.RingGeometry(.36,.42,8),new THREE.MeshBasicMaterial({color:0x8b1a1a,side:THREE.DoubleSide,transparent:true,opacity:.18}));
ring.rotation.x=-Math.PI/2;ring.position.y=.002;sc.add(ring);

// PARTICLES
var PC=8,pG=new THREE.BufferGeometry(),pA=new Float32Array(PC*3),pV=[];
for(var i=0;i<PC;i++){pA[i*3]=(Math.random()-.5)*.7;pA[i*3+1]=Math.random()*2;pA[i*3+2]=(Math.random()-.5)*.7;pV.push(.002+Math.random()*.004);}
pG.setAttribute('position',new THREE.BufferAttribute(pA,3));
var pts=new THREE.Points(pG,new THREE.PointsMaterial({color:0xc23b3b,size:.02,transparent:true,opacity:.25}));sc.add(pts);

kg.rotation.y=.35;sc.add(kg);

// ANIMATE
var t=0,hov=false,tgtR=.35,curR=.35,kL=0;
function lrp(a,b,f){return a+(b-a)*f;}
function anim(){
  requestAnimationFrame(anim);t+=.016;
  P.torso.scale.y=1+Math.sin(t*1.4)*.01;
  P.head.position.y=2.08+Math.sin(t*1.4)*.003;
  var sw=hov?tgtR:.35+Math.sin(t*.4)*.06;
  curR+=(sw-curR)*.04;kg.rotation.y=curR;
  P.cL.rotation.x=Math.sin(t*1.8)*.025;P.cR.rotation.x=Math.sin(t*1.8+.8)*.025;
  P.aL.rotation.x=Math.sin(t*.8)*.02;
  P.aR.rotation.x=hov?-.3:Math.sin(t*.8+Math.PI)*.02;
  var ei=hov?1:.5+Math.sin(t*2.2)*.35;
  var ec=new THREE.Color(ei*.86,ei*.27,ei*.27);
  P.eL.material.color.copy(ec);P.eR.material.color.copy(ec);
  var kt=hov?1:0;kL+=(kt-kL)*.06;
  P.kat.position.set(lrp(katBack.px,katReady.px,kL),lrp(katBack.py,katReady.py,kL),lrp(katBack.pz,katReady.pz,kL));
  P.kat.rotation.set(lrp(katBack.rx,katReady.rx,kL),lrp(katBack.ry,katReady.ry,kL),lrp(katBack.rz,katReady.rz,kL));
  P.head.rotation.x=hov?.12:Math.sin(t*.6)*.015;
  ring.rotation.z+=.003;
  var pp=pts.geometry.attributes.position.array;
  for(var i=0;i<PC;i++){pp[i*3+1]+=pV[i];if(pp[i*3+1]>2.2){pp[i*3+1]=0;pp[i*3]=(Math.random()-.5)*.6;pp[i*3+2]=(Math.random()-.5)*.6;}}
  pts.geometry.attributes.position.needsUpdate=true;
  fl.intensity=hov?.5:.35;
  rnd.render(sc,cam);
}
anim();

setInterval(function(){var a=document.getElementById('ac2');w.style.display=(a&&a.classList.contains('open'))?'none':'';},500);
setTimeout(function(){w.classList.add('visible');setTimeout(function(){var v=0;var iv=setInterval(function(){v+=.03;P.head.rotation.x=Math.sin(v*Math.PI)*.2;if(v>=1){clearInterval(iv);P.head.rotation.x=0;}},16);},300);},2000);

el.addEventListener('mouseenter',function(){hov=true;});
el.addEventListener('mouseleave',function(){hov=false;tgtR=.35;});
el.addEventListener('mousemove',function(e){if(!hov)return;var r=el.getBoundingClientRect();tgtR=.35+((e.clientX-r.left)/r.width-.5)*.5;});
el.addEventListener('touchstart',function(){hov=true;},{passive:true});
el.addEventListener('touchend',function(){setTimeout(function(){hov=false;tgtR=.35;},1500);},{passive:true});
var ttO=false;
el.addEventListener('click',function(e){e.stopPropagation();ttO=!ttO;tip.classList.toggle('show',ttO);});
document.addEventListener('click',function(){if(ttO){ttO=false;tip.classList.remove('show');}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

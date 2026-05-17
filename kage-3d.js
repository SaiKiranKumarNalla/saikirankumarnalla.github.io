
(function(){'use strict';
const emo={guardian:'🗡️',bow:'🙇',listening:'👂',thinking:'🌘',speaking:'💬',alert:'👁️',scout:'🔭',shadow:'🔴',drawn:'🗡️',fighting:'⚔️',slash:'💥',smirk:'😏',error:'🔥',sleep:'💤'};let currentState='guardian';const scenes=[];
function mat(color,o){return new THREE.MeshStandardMaterial(Object.assign({color,roughness:.64,metalness:.02,flatShading:false},o||{}));}
function add(p,g,m,pos,rot,sca){const x=new THREE.Mesh(g,m);if(pos)x.position.set(pos[0],pos[1],pos[2]);if(rot)x.rotation.set(rot[0],rot[1],rot[2]);if(sca)x.scale.set(sca[0],sca[1],sca[2]);x.castShadow=x.receiveShadow=true;p.add(x);return x;}
function makeBox(w,h,d,bevel){const s=new THREE.Shape();const r=Math.min(bevel||.02,w/2,h/2);s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:r*.35,bevelSize:r*.35,bevelSegments:2}).center();}
function makeAlmond(w,h,d){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.bezierCurveTo(-w*.28,h*.62,w*.28,h*.62,w/2,0);sh.bezierCurveTo(w*.25,-h*.44,-w*.25,-h*.44,-w/2,0);return new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.0025,bevelSize:.0025,bevelSegments:2}).center();}
function makeLip(w,h,d){const sh=new THREE.Shape();sh.moveTo(-w/2,h*.03);sh.bezierCurveTo(-w*.28,h*.36,w*.28,h*.36,w/2,h*.03);sh.bezierCurveTo(w*.31,-h*.46,-w*.31,-h*.46,-w/2,h*.03);return new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.0025,bevelSize:.0025,bevelSegments:2}).center();}
function addTube(p,pts,r,m){const c=new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(v[0],v[1],v[2])));const x=new THREE.Mesh(new THREE.TubeGeometry(c,18,r,8,false),m);x.castShadow=x.receiveShadow=true;p.add(x);return x;}
function createKage(canvas,opt){opt=opt||{};const mini=!!opt.mini;const interactiveMini=!!opt.interactive;const R=new THREE.WebGLRenderer({canvas,antialias:true,alpha:mini});R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.shadowMap.enabled=!mini;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=mini?.78:.68;const scene=new THREE.Scene();if(!mini)scene.background=new THREE.Color(0x26272d);const cam=new THREE.PerspectiveCamera(mini?28:31,1,.1,100);cam.position.set(0,mini?.72:.38,mini?6.7:8.4);cam.lookAt(0,mini?.55:-.18,0);scene.add(new THREE.AmbientLight(0x544846,mini?.58:.46));const key=new THREE.DirectionalLight(0xffe1c2,mini?1.05:1.05);key.position.set(4.2,6.2,5.2);key.castShadow=!mini;scene.add(key);const rim=new THREE.DirectionalLight(0xce3440,mini?.58:1.05);rim.position.set(-3.8,2.4,-3.5);scene.add(rim);const fill=new THREE.PointLight(0x8f1b20,mini?.35:.55,8);fill.position.set(-1.5,1.2,2.8);scene.add(fill);if(!mini){const grid=new THREE.GridHelper(14,28,0x56565c,0x3e3f45);grid.position.y=-1.48;grid.material.opacity=.4;grid.material.transparent=true;scene.add(grid);const floor=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.ShadowMaterial({opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.485;floor.receiveShadow=true;scene.add(floor)}
const M={hat:mat(0xe7cf8b,{roughness:.78}),hatEdge:mat(0x8c7137,{roughness:.86}),under:mat(0x100b08),face:mat(0xc58b68,{roughness:.62}),skinShade:mat(0x8b5844,{roughness:.7}),neck:mat(0x9a6249,{roughness:.64}),robe:mat(0x070914,{roughness:.78}),robe2:mat(0x111728,{roughness:.72}),sash:mat(0xaa2028,{roughness:.55}),sashDark:mat(0x5e0f15),metal:mat(0xbfc1bd,{roughness:.26,metalness:.7}),guard:mat(0x19161a,{roughness:.48,metalness:.42}),wrap:mat(0xe8dfcf,{roughness:.48}),eyeWhite:mat(0xf3eadf,{roughness:.42}),eye:new THREE.MeshStandardMaterial({color:0x090406,emissive:0x3b090c,emissiveIntensity:.08,roughness:.38}),pupil:new THREE.MeshStandardMaterial({color:0x050203,emissive:0x140204,emissiveIntensity:.05,roughness:.28}),irisBrown:new THREE.MeshStandardMaterial({color:0x5b341f,emissive:0x1c0b04,emissiveIntensity:.10,roughness:.34}),highlight:mat(0xffffff,{roughness:.20}),hair:mat(0x07080d,{roughness:.72}),teeth:mat(0xfff4df,{roughness:.34}),tongue:mat(0xb7424a,{roughness:.55}),mouth:new THREE.MeshStandardMaterial({color:0x2e080b,emissive:0x070101,emissiveIntensity:.025,roughness:.72}),black:mat(0x030408,{roughness:.86}),base:mat(0x130d10,{roughness:.55,metalness:.18}),ring:new THREE.MeshBasicMaterial({color:0x7b181c,transparent:true,opacity:.26,side:THREE.DoubleSide})};
const root=new THREE.Group();scene.add(root);if(!mini){add(root,new THREE.CylinderGeometry(.66,.74,.07,48),M.base,[0,-1.36,0]);const br=add(root,new THREE.RingGeometry(.56,.72,48),M.ring,[0,-1.315,0],[-Math.PI/2,0,0]);root.userData.br=br}
const baseKageScale=mini?.64:.86;const k=new THREE.Group();k.userData.baseY=mini?0:-.34;k.scale.setScalar(baseKageScale);k.position.y=k.userData.baseY;root.add(k);
// legs and feet, visible under robe
const legL=add(k,makeBox(.090,.52,.12,.014),M.black,[-.12,-.94,.02]);const legR=add(k,makeBox(.090,.52,.12,.014),M.black,[.12,-.94,.02]);
// visible attached boots/shoes: raised above the stand with rounded toes and small soles
const bootMat=M.guard;
function makeBoot(side){
  const ankle=add(k,makeBox(.118,.230,.115,.022),M.black,[side*.122,-.970,.025],[0,0,0]);
  const foot=add(k,makeBox(.170,.082,.255,.032),bootMat,[side*.122,-1.105,.165],[0,0,side*.015]);
  const toe=add(k,new THREE.SphereGeometry(.082,20,12),bootMat,[side*.122,-1.096,.292]);toe.scale.set(1.05,.40,.70);
  const sole=add(k,makeBox(.188,.026,.282,.014),M.black,[side*.122,-1.145,.180],[0,0,0]);
  const heel=add(k,makeBox(.126,.034,.096,.012),M.black,[side*.122,-1.123,.045],[0,0,0]);
  return {ankle,foot,toe,sole,heel};
}
const bootL=makeBoot(-1), bootR=makeBoot(1);
// Dedicated seated meditation body: a separate seated silhouette, so meditation reads as a real pose.
const meditationGroup=new THREE.Group();meditationGroup.visible=false;k.add(meditationGroup);
// soft robe mass over crossed legs, low and close to the platform
const medSeat=add(meditationGroup,new THREE.CylinderGeometry(.50,.58,.14,16),M.robe,[0,-.860,.115],[0,Math.PI/12,0]);medSeat.scale.set(1.16,.76,.78);
const medLap=add(meditationGroup,makeBox(.62,.125,.38,.050),M.robe2,[0,-.760,.225],[.03,0,0]);
const medRobeFront=add(meditationGroup,makeBox(.42,.105,.22,.040),M.robe,[0,-.850,.385],[.08,0,0]);
// visible seated lower body/robe mass so the torso does not look like it is floating above the legs
const medBodyCore=add(meditationGroup,new THREE.CylinderGeometry(.38,.49,.38,10),M.robe2,[0,-.550,.105],[0,Math.PI/10,0]);medBodyCore.scale.z=.68;
const medWaistBand=add(meditationGroup,makeBox(.58,.050,.060,.012),M.sash,[0,-.390,.330],[0,0,0]);
const medRobeFoldL=add(meditationGroup,makeBox(.050,.320,.060,.014),M.robe,[-.205,-.590,.345],[0,0,.10]);
const medRobeFoldR=add(meditationGroup,makeBox(.050,.320,.060,.014),M.robe,[.205,-.590,.345],[0,0,-.10]);
// crossed legs: broad thighs sweep outward, shins cross in front, boots/toes peek out on top of the base
const medThighL=add(meditationGroup,makeBox(.42,.105,.135,.030),M.black,[-.210,-.855,.245],[0,.10,-.48]);
const medThighR=add(meditationGroup,makeBox(.42,.105,.135,.030),M.black,[.210,-.855,.245],[0,-.10,.48]);
const medShinL=add(meditationGroup,makeBox(.39,.085,.125,.026),M.black,[-.105,-.935,.395],[0,-.42,.58]);
const medShinR=add(meditationGroup,makeBox(.39,.085,.125,.026),M.black,[.105,-.935,.395],[0,.42,-.58]);
const medFootL=add(meditationGroup,makeBox(.205,.068,.170,.030),bootMat,[-.290,-.915,.400],[0,.52,-.05]);
const medFootR=add(meditationGroup,makeBox(.205,.068,.170,.030),bootMat,[.290,-.915,.400],[0,-.52,.05]);
const medSoleL=add(meditationGroup,makeBox(.210,.020,.175,.010),M.black,[-.290,-.955,.405],[0,.52,-.05]);
const medSoleR=add(meditationGroup,makeBox(.210,.020,.175,.010),M.black,[.290,-.955,.405],[0,-.52,.05]);
// calm resting arms: elbows drop, forearms rest on thighs, palms are low and symmetrical
const medArmL=new THREE.Group();meditationGroup.add(medArmL);
add(medArmL,makeBox(.128,.245,.130,.026),M.robe2,[-.330,-.110,.075],[.06,0,.18]);
add(medArmL,makeBox(.096,.270,.105,.024),M.robe2,[-.220,-.375,.300],[.04,0,.92]);
posePalm(medArmL,-1,-.112,-.540,.405,.12);
const medArmR=new THREE.Group();meditationGroup.add(medArmR);
add(medArmR,makeBox(.128,.245,.130,.026),M.robe2,[.330,-.110,.075],[.06,0,-.18]);
add(medArmR,makeBox(.096,.270,.105,.024),M.robe2,[.220,-.375,.300],[.04,0,-.92]);
posePalm(medArmR,1,.112,-.540,.405,-.12);

// clothing as separate game-ready costume pieces
const lower=add(k,new THREE.CylinderGeometry(.27,.39,.72,6),M.robe, [0,-.42,0], [0,Math.PI/6,0]);lower.scale.set(.88,1,.55);
const torso=new THREE.Group();torso.position.set(0,.08,0);k.add(torso);
// broader shoulder/body silhouette: chest is wider at top, robe narrows toward waist
const upper=add(torso,makeBox(.64,.62,.34,.04),M.robe2,[0,0,0]);upper.scale.set(1.05,1,.95);
const chestPlate=add(torso,makeBox(.58,.44,.35,.035),M.robe2,[0,.02,.01]);
const shoulder=add(torso,makeBox(.82,.18,.38,.04),M.robe,[0,.27,0]);
const shoulderL=add(torso,makeBox(.18,.16,.36,.035),M.robe,[-.45,.22,0],[0,0,-.08]);
const shoulderR=add(torso,makeBox(.18,.16,.36,.035),M.robe,[.45,.22,0],[0,0,.08]);
const collar=add(torso,makeBox(.36,.12,.36,.025),M.black,[0,.39,.02]);
const belt=add(k,makeBox(.56,.055,.06,.01),M.sash,[0,-.34,.19],[0,0,0]);const beltBack=add(k,makeBox(.38,.045,.05,.01),M.sashDark,[0,-.34,-.19]);const strap=add(k,makeBox(.046,.70,.035,.008),M.sash,[.075,-.15,.218],[0,0,-.26]);const pin=add(k,makeBox(.065,.065,.028,.01),M.metal,[-.08,-.10,.238],[0,0,Math.PI/4]);
// arms hanging down with sculpted hands and individual fingers
function makeHand(parent,side){const wrist=add(parent,makeBox(.082,.070,.050,.014),M.face,[side*.006,-.545,.036],[0,0,side*.020]);const palm=add(parent,makeBox(.132,.142,.072,.024),M.face,[side*.010,-.602,.044],[0,0,side*.030]);const thumb=add(parent,makeBox(.038,.096,.034,.011),M.face,[side*.090,-.593,.060],[.05,0,side*.58]);for(let i=0;i<4;i++){const x=side*((i-1.5)*.027-.004);const len=[.094,.114,.108,.088][i];const finger=add(parent,makeBox(.020,len,.022,.008),M.face,[x,-.696,.068],[0,0,side*((i-1.5)*.032)]);const tip=add(parent,new THREE.SphereGeometry(.0125,8,6),M.face,[x,-.696-len*.52,.070]);tip.scale.set(1,.72,1)}return palm}
const armL=new THREE.Group();armL.position.set(-.435,.13,.015);k.add(armL);
add(armL,makeBox(.18,.18,.18,.03),M.robe,[.020,.03,0],[0,0,-.06]);
add(armL,makeBox(.150,.455,.16,.028),M.robe2,[0,-.235,0],[0,0,.010]);
add(armL,makeBox(.160,.042,.168,.012),M.robe2,[0,-.485,.002]);makeHand(armL,-1);
const armR=new THREE.Group();armR.position.set(.435,.13,.015);k.add(armR);
add(armR,makeBox(.18,.18,.18,.03),M.robe,[-.020,.03,0],[0,0,.06]);
add(armR,makeBox(.150,.455,.16,.028),M.robe2,[0,-.235,0],[0,0,-.010]);
add(armR,makeBox(.160,.042,.168,.012),M.robe2,[0,-.485,.002]);makeHand(armR,1);
// dedicated expression pose arms: these avoid detaching the normal sleeve/hand rig
function posePalm(group,side,x,y,z,rotZ){
  const palm=add(group,makeBox(.118,.110,.070,.022),M.face,[x,y,z],[0,0,rotZ||0]);
  add(group,makeBox(.034,.082,.032,.010),M.face,[x+side*.070,y+.004,z+.010],[.04,0,side*.52]);
  for(let i=0;i<4;i++){
    const fx=x+side*((i-1.5)*.022-.006);
    const len=[.074,.088,.082,.066][i];
    add(group,makeBox(.018,len,.020,.007),M.face,[fx,y-.072,z+.024],[0,0,side*((i-1.5)*.030)]);
  }
  return palm;
}
function thinkFist(group,side,x,y,z,rotZ){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.set(.10,0,rotZ||0);group.add(g);
  // compact fist/palm turned upward: fingers point into the underside of the chin
  add(g,makeBox(.102,.082,.066,.020),M.face,[0,0,0],[0,0,0]);
  for(let i=0;i<4;i++){
    const fx=side*((i-1.5)*.018);
    add(g,makeBox(.017,.070,.020,.007),M.face,[fx,.058,.030],[0,0,side*((i-1.5)*.028)]);
    add(g,new THREE.SphereGeometry(.010,8,6),M.face,[fx,.096,.032]);
  }
  // thumb rests along the side of the chin, not hanging downward
  add(g,makeBox(.024,.070,.024,.008),M.face,[side*.058,.030,.022],[.02,0,side*.72]);
  return g;
}
const thinkArm=new THREE.Group();thinkArm.visible=false;k.add(thinkArm);
// Thinking pose: human-like chain. Shoulder stays attached, elbow folds in, fist supports chin from below.
add(thinkArm,makeBox(.150,.285,.150,.026),M.robe2,[.390,.065,.040],[.03,0,-.30]);
add(thinkArm,makeBox(.112,.305,.125,.024),M.robe2,[.220,.235,.225],[.08,-.08,-.78]);
// wrist cuff visibly connects the forearm to the fist under the chin
add(thinkArm,makeBox(.092,.060,.100,.018),M.robe2,[.108,.350,.260],[.08,-.08,-.78]);
thinkFist(thinkArm,1,.070,.392,.294,-.05);
const thinkElbow=add(thinkArm,new THREE.SphereGeometry(.074,14,10),M.robe2,[.315,.145,.125]);thinkElbow.scale.set(1.05,.82,1.00);
const speakArm=new THREE.Group();speakArm.visible=false;k.add(speakArm);
// Speaking pose: connected shoulder, elbow down, open palm at chest level.
add(speakArm,makeBox(.150,.290,.150,.026),M.robe2,[.405,.055,.055],[.02,0,-.20]);
add(speakArm,makeBox(.112,.245,.125,.024),M.robe2,[.265,-.100,.220],[.05,-.06,-.78]);
posePalm(speakArm,1,.130,-.220,.318,.28);
const speakElbow=add(speakArm,new THREE.SphereGeometry(.068,14,10),M.robe2,[.330,-.025,.135]);speakElbow.scale.set(1.05,.82,1.00);
// Shadow Sense pose: namaste / prayer hands at chest, designed as a calm sensing stance.
const shadowArm=new THREE.Group();shadowArm.visible=false;k.add(shadowArm);
add(shadowArm,makeBox(.150,.270,.145,.026),M.robe2,[-.365,.075,.060],[.04,0,.46]);
add(shadowArm,makeBox(.105,.275,.120,.024),M.robe2,[-.175,.020,.260],[.04,-.05,.98]);
const shadowElbowL=add(shadowArm,new THREE.SphereGeometry(.064,14,10),M.robe2,[-.285,.040,.150]);shadowElbowL.scale.set(1.05,.82,1.00);
add(shadowArm,makeBox(.150,.270,.145,.026),M.robe2,[.365,.075,.060],[.04,0,-.46]);
add(shadowArm,makeBox(.105,.275,.120,.024),M.robe2,[.175,.020,.260],[.04,.05,-.98]);
const shadowElbowR=add(shadowArm,new THREE.SphereGeometry(.064,14,10),M.robe2,[.285,.040,.150]);shadowElbowR.scale.set(1.05,.82,1.00);
// palms meet vertically at center chest; fingers point upward, not down.
const namasteL=new THREE.Group();namasteL.position.set(-.030,.030,.372);namasteL.rotation.set(.05,0,-.08);shadowArm.add(namasteL);
add(namasteL,makeBox(.050,.112,.040,.014),M.face,[0,0,0]);
for(let i=0;i<4;i++) add(namasteL,makeBox(.010,.074,.014,.004),M.face,[.020,(i-1.5)*.013,.010],[0,0,.03]);
add(namasteL,makeBox(.015,.060,.016,.005),M.face,[-.026,-.010,.012],[0,0,-.52]);
const namasteR=new THREE.Group();namasteR.position.set(.030,.030,.372);namasteR.rotation.set(.05,0,.08);shadowArm.add(namasteR);
add(namasteR,makeBox(.050,.112,.040,.014),M.face,[0,0,0]);
for(let i=0;i<4;i++) add(namasteR,makeBox(.010,.074,.014,.004),M.face,[-.020,(i-1.5)*.013,.010],[0,0,-.03]);
add(namasteR,makeBox(.015,.060,.016,.005),M.face,[.026,-.010,.012],[0,0,.52]);

// Weapon/hand pose system: hands are built around handle contact points instead of floating near blade.
function gripHand(parent,side,x,y,z,rotZ,sca){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.set(0,0,rotZ||0);g.scale.setScalar(sca||1);parent.add(g);
  // palm is wrapped around the tsuka, not placed in front of it
  add(g,makeBox(.070,.055,.060,.014),M.face,[0,0,0],[0,0,0]);
  // curled fingers cross the front of the handle
  for(let i=0;i<4;i++){
    const fy=(i-1.5)*.014;
    add(g,makeBox(.015,.060,.018,.006),M.face,[side*.034,fy,.036],[0,0,side*.10]);
    add(g,makeBox(.013,.040,.016,.005),M.face,[side*.018,fy+.002,.054],[0,0,side*.45]);
  }
  // thumb locks the grip from the opposite side
  add(g,makeBox(.020,.064,.020,.007),M.face,[-side*.038,.006,.032],[0,0,-side*.70]);
  return g;
}
function braceHand(parent,side,x,y,z,rotZ,sca){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.set(0,0,rotZ||0);g.scale.setScalar(sca||1);parent.add(g);
  add(g,makeBox(.076,.058,.056,.014),M.face,[0,0,0]);
  for(let i=0;i<4;i++) add(g,makeBox(.014,.060,.018,.006),M.face,[side*((i-1.5)*.012),-.050,.026],[0,0,side*.04]);
  add(g,makeBox(.020,.060,.020,.007),M.face,[side*.050,-.010,.030],[0,0,side*.55]);
  return g;
}
// Fighting pose arms: sleeves connect from shoulders toward the handle grip zone.
const fightArmL=new THREE.Group();fightArmL.visible=false;k.add(fightArmL);
add(fightArmL,makeBox(.145,.315,.145,.026),M.robe2,[-.370,.070,.065],[.04,0,.48]);
add(fightArmL,makeBox(.112,.330,.125,.024),M.robe2,[-.188,-.075,.270],[.10,-.05,1.13]);
const fightElbowL=add(fightArmL,new THREE.SphereGeometry(.070,14,10),M.robe2,[-.292,-.005,.160]);fightElbowL.scale.set(1.05,.82,1.00);
const fightArmR=new THREE.Group();fightArmR.visible=false;k.add(fightArmR);
add(fightArmR,makeBox(.145,.325,.145,.026),M.robe2,[.370,.085,.065],[.04,0,-.52]);
add(fightArmR,makeBox(.112,.330,.125,.024),M.robe2,[.182,-.055,.285],[.10,.05,-1.12]);
const fightElbowR=add(fightArmR,new THREE.SphereGeometry(.070,14,10),M.robe2,[.292,.000,.165]);fightElbowR.scale.set(1.05,.82,1.00);
const drawnSword=new THREE.Group();drawnSword.visible=false;k.add(drawnSword);
// Held katana: the tsuka/handle is the anchor; grip hands are children of the weapon so they never separate.
add(drawnSword,makeBox(.045,.255,.040,.006),M.wrap,[0,-.215,.365]);
add(drawnSword,makeBox(.160,.028,.090,.006),M.guard,[0,-.070,.365],[0,Math.PI/4,0]);
add(drawnSword,makeBox(.030,1.160,.018,.004),M.metal,[0,.565,.365]);
add(drawnSword,makeBox(.019,.090,.017,.004),M.sash,[0,1.135,.365]);
gripHand(drawnSword,1,.032,-.145,.392,-.12,.92);   // right hand near guard
gripHand(drawnSword,-1,-.030,-.245,.392,.10,.92);  // left hand lower on tsuka
drawnSword.rotation.set(.05,0,-.78);
// Drawn/unsheathing pose: katana remains sheathed across the waist; left hand braces saya, right hand grips tsuka.
const drawArmL=new THREE.Group();drawArmL.visible=false;k.add(drawArmL);
// left shoulder drops toward the waist and reaches to the saya mouth at the left hip
add(drawArmL,makeBox(.140,.300,.140,.026),M.robe2,[-.405,.035,.065],[.04,0,.28]);
// left forearm angles inward/down to clamp the scabbard opening, like an iai draw
add(drawArmL,makeBox(.108,.300,.120,.024),M.robe2,[-.245,-.205,.305],[.10,.02,.86]);
// open bracing hand placed on the saya mouth at the hip, not centered in front
braceHand(drawArmL,-1,-.105,-.338,.420,.04,1.02);
const drawArmR=new THREE.Group();drawArmR.visible=false;k.add(drawArmR);
// right shoulder crosses the body toward the tsuka beside the guard
add(drawArmR,makeBox(.140,.310,.140,.026),M.robe2,[.405,.055,.065],[.04,0,-.54]);
// right forearm reaches farther outward so the wrist lines up with the white handle/tsuka
add(drawArmR,makeBox(.108,.365,.120,.024),M.robe2,[.285,-.155,.345],[.08,-.03,-1.08]);
// closed grip hand wraps the WHITE handle, just outside the tsuba/guard
const drawGrip=gripHand(drawArmR,1,.275,-.318,.442,-1.50,1.02);
const bowArmL=new THREE.Group();bowArmL.visible=false;k.add(bowArmL);
add(bowArmL,makeBox(.118,.350,.125,.024),M.robe2,[-.250,-.120,.245],[0,0,.98]);
posePalm(bowArmL,-1,-.100,-.245,.285,-.10);
const bowArmR=new THREE.Group();bowArmR.visible=false;k.add(bowArmR);
add(bowArmR,makeBox(.118,.350,.125,.024),M.robe2,[.250,-.120,.245],[0,0,-.98]);
posePalm(bowArmR,1,.100,-.245,.285,.10);
// subtle slash trail arc, shown only in Slash mode
const slashArc=new THREE.Group();slashArc.visible=false;k.add(slashArc);
const arcMat=new THREE.MeshBasicMaterial({color:0xff3030,transparent:true,opacity:.28,side:THREE.DoubleSide});
const arc=add(slashArc,new THREE.TorusGeometry(.55,.010,8,48,Math.PI*1.15),arcMat,[.050,.080,.410],[0,0,-.75]);arc.scale.set(1.05,.55,.05);
// neck, head, face
// neck, head, face
const neck=add(k,makeBox(.18,.20,.17,.035),M.neck,[0,.51,.0]);const headG=new THREE.Group();headG.position.set(0,.82,.02);k.add(headG);const head=add(headG,makeBox(.48,.45,.40,.105),M.face,[0,.006,0]);
// softer U-shaped lower face/chin: rounded fillet instead of a square block
const jaw=add(headG,makeBox(.315,.120,.305,.095),M.face,[0,-.258,.030]);jaw.scale.x=.88;
const chinSoft=add(headG,new THREE.SphereGeometry(.172,28,16),M.face,[0,-.304,.060]);chinSoft.scale.set(1.00,.42,.86);
const cheekRoundL=add(headG,new THREE.SphereGeometry(.070,18,10),M.face,[-.185,-.205,.095]);cheekRoundL.scale.set(.70,1.28,.56);
const cheekRoundR=add(headG,new THREE.SphereGeometry(.070,18,10),M.face,[.185,-.205,.095]);cheekRoundR.scale.set(.70,1.28,.56);
const chinShade=add(headG,new THREE.SphereGeometry(.132,18,10),M.neck,[0,-.326,.202]);chinShade.scale.set(.82,.10,.14);
// asymmetrical, angled ears tucked under the kasa brim, with clearer upper and lower shape
function makeEar(parent,side){
  const ear=new THREE.Group();
  ear.position.set(side*.302,.006,.020);
  ear.rotation.set(-.04,side*.34,side*.16);
  parent.add(ear);
  const asym=side<0?1.08:.96;
  const outer=add(ear,new THREE.SphereGeometry(.086,28,18),M.face,[0,0,0]);
  outer.scale.set(.46*asym,1.20,.31);
  const topHelix=add(ear,new THREE.SphereGeometry(.047,18,12),M.face,[side*.006,.052,.010]);
  topHelix.scale.set(.52*asym,.62,.25);
  const lobe=add(ear,new THREE.SphereGeometry(.040,18,12),M.face,[side*.004,-.080,.006]);
  lobe.scale.set(.52*asym,.58,.28);
  const rim=add(ear,new THREE.TorusGeometry(.035,.0055,8,22),M.neck,[side*.002,.006,.034],[0,side*1.34,0]);
  rim.scale.set(.72*asym,1.36,.24);
  const bowl=add(ear,new THREE.SphereGeometry(.046,18,12),M.skinShade,[side*.006,-.004,.035]);
  bowl.scale.set(.32*asym,.76,.12);
  addTube(ear,[[side*.002,.044,.047],[side*.017,.010,.054],[side*.004,-.044,.047]],.0048,M.neck);
  const notch=add(ear,new THREE.SphereGeometry(.014,10,8),M.skinShade,[side*.015,-.006,.058]);
  notch.scale.set(.7,.5,.22);
  return ear;
}
const earL=makeEar(headG,-1),earR=makeEar(headG,1);
// stronger masculine LEGO-samurai face: white eye base, black pupils/glints, stern angled brows, neutral mouth
const noseBridge=add(headG,makeBox(.026,.126,.020,.008),M.skinShade,[0,.012,.232]);
const noseTip=add(headG,new THREE.SphereGeometry(.031,18,12),M.neck,[0,-.060,.252]);noseTip.scale.set(.86,.56,.48);
const noseWingL=add(headG,new THREE.SphereGeometry(.015,12,8),M.neck,[-.023,-.066,.250]);noseWingL.scale.set(.75,.45,.32);
const noseWingR=add(headG,new THREE.SphereGeometry(.015,12,8),M.neck,[.023,-.066,.250]);noseWingR.scale.set(.75,.45,.32);
const nostrilL=add(headG,new THREE.SphereGeometry(.0055,8,6),M.mouth,[-.020,-.071,.266]);nostrilL.scale.set(1.45,.55,.28);
const nostrilR=add(headG,new THREE.SphereGeometry(.0055,8,6),M.mouth,[.020,-.071,.266]);nostrilR.scale.set(1.45,.55,.28);
const eyeWhiteL=add(headG,new THREE.SphereGeometry(.039,28,18),M.eyeWhite,[-.112,.067,.259]);eyeWhiteL.scale.set(1.18,.90,.10);eyeWhiteL.rotation.z=-.06;
const eyeWhiteR=add(headG,new THREE.SphereGeometry(.039,28,18),M.eyeWhite,[.112,.067,.259]);eyeWhiteR.scale.set(1.18,.90,.10);eyeWhiteR.rotation.z=.06;
const eyeL=add(headG,new THREE.SphereGeometry(.023,24,14),M.pupil,[-.112,.064,.270]);eyeL.scale.set(.90,1.20,.10);
const eyeR=add(headG,new THREE.SphereGeometry(.023,24,14),M.pupil,[.112,.064,.270]);eyeR.scale.set(.90,1.20,.10);
const glintL=add(headG,new THREE.SphereGeometry(.0065,10,8),M.highlight,[-.120,.078,.278]);glintL.scale.set(1,.82,.10);
const glintR=add(headG,new THREE.SphereGeometry(.0065,10,8),M.highlight,[.104,.078,.278]);glintR.scale.set(1,.82,.10);
// calm closed-eye arcs used for meditation; hidden in normal states
const closedEyeL=addTube(headG,[[-.152,.068,.279],[-.116,.058,.283],[-.080,.068,.279]],.0065,M.black);closedEyeL.visible=false;
const closedEyeR=addTube(headG,[[.080,.068,.279],[.116,.058,.283],[.152,.068,.279]],.0065,M.black);closedEyeR.visible=false;
const browL=addTube(headG,[[-.158,.130,.265],[-.118,.139,.267],[-.080,.130,.265]],.0145,M.black);
const browR=addTube(headG,[[.080,.130,.265],[.118,.139,.267],[.158,.130,.265]],.0145,M.black);
const mouth=new THREE.Group();mouth.position.set(0,-.145,.252);headG.add(mouth);
const mouthBack=add(mouth,makeLip(.104,.032,.015),M.mouth,[0,0,0]);
const upperTeeth=add(mouth,makeBox(.070,.007,.012,.004),M.teeth,[0,.006,.012]);upperTeeth.rotation.z=.004;
const lowerTeeth=add(mouth,makeBox(.038,.005,.012,.004),M.teeth,[0,-.012,.013]);lowerTeeth.rotation.z=-.004;
const tongue=add(mouth,new THREE.SphereGeometry(.018,14,8),M.tongue,[0,-.020,.015]);tongue.scale.set(1.08,.28,.18);
const sternLine=addTube(mouth,[[-.050,-.002,.019],[-.018,-.010,.022],[.018,-.010,.022],[.050,-.002,.019]],.0042,M.black);
const frownLine=addTube(mouth,[[-.052,-.006,.026],[-.020,.006,.029],[.020,.006,.029],[.052,-.006,.026]],.0044,M.black);frownLine.visible=false;
// masculine layered hair visible under the kasa, kept above the eyes with no lash-like center strands
const hairG=new THREE.Group();hairG.position.set(0,.190,.076);headG.add(hairG);
add(hairG,makeBox(.205,.060,.030,.010),M.hair,[0,.018,.128],[0,0,.02]);
add(hairG,makeBox(.052,.112,.032,.010),M.hair,[-.118,-.038,.122],[0.08,-.10,.34]);
add(hairG,makeBox(.050,.105,.032,.010),M.hair,[.120,-.035,.122],[0.08,.10,-.34]);
add(hairG,makeBox(.050,.158,.032,.010),M.hair,[-.190,-.076,.096],[0.10,-.16,.50]);
add(hairG,makeBox(.048,.146,.032,.010),M.hair,[.190,-.072,.096],[0.10,.16,-.50]);
// kasa hat: lighter, thin brim, dark underside
const kasa=new THREE.Group();kasa.position.set(0,.245,0);headG.add(kasa);add(kasa,new THREE.ConeGeometry(.548,.300,72),M.hat,[0,.128,0],[0,Math.PI/4,0]);add(kasa,new THREE.CylinderGeometry(.600,.625,.028,72),M.hatEdge,[0,-.005,0]);add(kasa,new THREE.CylinderGeometry(.466,.574,.011,72),M.under,[0,-.025,0]);add(kasa,new THREE.ConeGeometry(.032,.064,12),M.sash,[0,.312,0],[0,Math.PI/4,0]);
// katana close to body
const sword=new THREE.Group();
// katana mounted BEHIND Kage on his left side in a dark scabbard/saya, visibly attached to the body
const saya=add(sword,makeBox(.050,1.18,.040,.008),M.black,[0,-.13,0]);
add(sword,makeBox(.060,.060,.046,.009),M.sash,[0,-.73,.003]);
add(sword,makeBox(.165,.035,.115,.007),M.guard,[0,.47,.006],[0,Math.PI/4,0]);
add(sword,makeBox(.070,.35,.056,.012),M.wrap,[0,.68,.006]);
add(sword,makeBox(.038,.055,.038,.008),M.sash,[0,.89,.006]);
sword.position.set(-.34,-.04,-.285);sword.rotation.set(.04,-.10,.42);k.add(sword);
// two carrier straps/loops attach the scabbard to the sash and torso so it does not float
const swordLoop1=add(k,makeBox(.215,.040,.045,.008),M.sashDark,[-.245,-.34,-.245],[0,0,.42]);
const swordLoop2=add(k,makeBox(.185,.035,.040,.008),M.sashDark,[-.230,-.03,-.235],[0,0,.42]);
let drag=false,lastX=0,rot=.08,targetRot=.08,transitionStart=-9,state='guardian',stateTime=0;const ROT_MIN=-Math.PI/2,ROT_MAX=Math.PI/2;function clampRot(v){return Math.max(ROT_MIN,Math.min(ROT_MAX,v));}function setLook(v){if(typeof v==='number')targetRot=clampRot(v);else if(v==='left')targetRot=-.72;else if(v==='right')targetRot=.72;else if(v==='section')targetRot=.42;else targetRot=.08;}const clock=new THREE.Clock();function basePose(){k.position.set(0,k.userData.baseY||0,0);k.rotation.set(0,0,0);torso.position.set(0,.08,0);torso.rotation.set(0,0,0);neck.position.set(0,.51,0);headG.position.set(0,.84,.02);headG.rotation.set(0,0,0);kasa.rotation.set(0,0,0);armL.position.set(-.435,.13,.015);armR.position.set(.435,.13,.015);armL.rotation.set(0,0,0);armR.rotation.set(0,0,0);armL.scale.set(1,1,1);armR.scale.set(1,1,1);sword.position.set(-.34,-.04,-.285);sword.rotation.set(.04,-.10,.42);armL.visible=armR.visible=true;thinkArm.visible=speakArm.visible=shadowArm.visible=fightArmL.visible=fightArmR.visible=drawnSword.visible=drawArmL.visible=drawArmR.visible=bowArmL.visible=bowArmR.visible=slashArc.visible=meditationGroup.visible=false;meditationGroup.position.set(0,0,0);legL.visible=legR.visible=lower.visible=true;bootL.ankle.visible=bootL.foot.visible=bootL.toe.visible=bootL.sole.visible=bootL.heel.visible=true;bootR.ankle.visible=bootR.foot.visible=bootR.toe.visible=bootR.sole.visible=bootR.heel.visible=true;sword.visible=true;swordLoop1.visible=swordLoop2.visible=true;bootL.ankle.position.set(-.122,-.970,.025);bootL.foot.position.set(-.122,-1.105,.165);bootL.toe.position.set(-.122,-1.096,.292);bootL.sole.position.set(-.122,-1.145,.180);bootL.heel.position.set(-.122,-1.123,.045);bootR.ankle.position.set(.122,-.970,.025);bootR.foot.position.set(.122,-1.105,.165);bootR.toe.position.set(.122,-1.096,.292);bootR.sole.position.set(.122,-1.145,.180);bootR.heel.position.set(.122,-1.123,.045);eyeWhiteL.visible=eyeWhiteR.visible=eyeL.visible=eyeR.visible=true;eyeWhiteL.scale.set(1.18,.90,.10);eyeWhiteR.scale.set(1.18,.90,.10);eyeL.scale.set(.90,1.20,.10);eyeR.scale.set(.90,1.20,.10);eyeWhiteL.position.set(-.112,.064,.250);eyeWhiteR.position.set(.112,.064,.250);eyeL.position.set(-.112,.064,.264);eyeR.position.set(.112,.064,.264);glintL.visible=glintR.visible=true;closedEyeL.visible=closedEyeR.visible=false;mouth.visible=true;mouth.rotation.set(0,0,0);mouth.scale.set(1,1,1);mouth.position.set(0,-.145,.252);upperTeeth.visible=lowerTeeth.visible=tongue.visible=sternLine.visible=true;frownLine.visible=false;browL.rotation.set(0,0,0);browR.rotation.set(0,0,0);browL.position.set(0,0,0);browR.position.set(0,0,0);M.eye.color.setHex(0x090406);M.eye.emissive.setHex(0x3b090c);M.eyeWhite.color.setHex(0xf3eadf);M.eye.emissiveIntensity=.18;}
function setState(s){state=s;stateTime=clock.elapsedTime;transitionStart=stateTime;basePose();if(s==='scout')setLook('right');else if(s==='listening')setLook('left');else if(s==='thinking'||s==='shadow')setLook('section');else setLook('center');M.eye.color.setHex((s==='error'||s==='shadow'||s==='fighting'||s==='slash')?0x4b0505:0x090406);M.eye.emissive.setHex((s==='shadow'||s==='fighting'||s==='slash')?0xff1f1f:(s==='error'?0x661010:0x3b090c));if(s==='meditating'){
  // True seated meditation: upper body lowers onto a cross-legged base; sword is quiet/hidden.
  k.position.y=(k.userData.baseY||0);
  k.rotation.set(0,0,0);
  torso.position.set(0,-.125,.010);
  neck.position.set(0,.340,.010);
  headG.position.set(0,.635,.035);
  meditationGroup.position.set(0,.130,0);
  headG.rotation.set(.065,0,0);
  kasa.rotation.set(.016,0,0);
  lower.visible=false;legL.visible=legR.visible=false;
  bootL.ankle.visible=bootL.foot.visible=bootL.toe.visible=bootL.sole.visible=bootL.heel.visible=false;
  bootR.ankle.visible=bootR.foot.visible=bootR.toe.visible=bootR.sole.visible=bootR.heel.visible=false;
  armL.visible=armR.visible=false;
  meditationGroup.visible=true;
  sword.visible=false;swordLoop1.visible=swordLoop2.visible=false;
  M.eye.emissiveIntensity=.08;
  eyeWhiteL.visible=eyeWhiteR.visible=eyeL.visible=eyeR.visible=false;
  glintL.visible=glintR.visible=false;closedEyeL.visible=closedEyeR.visible=true;
  browL.rotation.z=.010;browR.rotation.z=-.010;browL.position.y=-.006;browR.position.y=-.006;
  mouth.scale.set(.48,.28,1);mouth.position.y=-.150;upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;sternLine.visible=true;frownLine.visible=false;
}
if(s==='bow'){k.rotation.x=.16;headG.rotation.x=.20;kasa.rotation.x=.045;armL.visible=armR.visible=false;bowArmL.visible=bowArmR.visible=true;browL.rotation.z=.03;browR.rotation.z=-.03;mouth.scale.set(.86,.70,1)}if(s==='listening'){headG.rotation.x=.015;M.eye.emissiveIntensity=.35;eyeWhiteL.scale.y=.66;eyeWhiteR.scale.y=.66;eyeL.scale.y=.88;eyeR.scale.y=.88;browL.position.y=.006;browR.position.y=.006;armL.rotation.z=.06;armR.rotation.z=-.06;mouth.scale.set(.82,.62,1)}if(s==='thinking'){headG.rotation.z=.025;headG.rotation.x=.025;mouth.scale.set(.62,.40,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;sternLine.visible=true;browL.rotation.z=-.04;browR.rotation.z=.04;browL.position.y=.004;browR.position.y=.004;eyeWhiteL.scale.y=.72;eyeWhiteR.scale.y=.72;eyeL.scale.y=.95;eyeR.scale.y=.95;armR.visible=false;thinkArm.visible=true;armL.rotation.z=.05}if(s==='speaking'){M.eye.emissiveIntensity=.45;mouth.scale.set(1.00,1.02,1);armR.visible=false;speakArm.visible=true;armL.rotation.z=.03;browL.position.y=.002;browR.position.y=.002}if(s==='alert'){M.eye.emissiveIntensity=.70;browL.rotation.z=-.08;browR.rotation.z=.08;eyeWhiteL.scale.set(1.24,1.02,.10);eyeWhiteR.scale.set(1.24,1.02,.10);eyeL.scale.set(.96,1.32,.10);eyeR.scale.set(.96,1.32,.10);armL.rotation.z=.14;armR.rotation.z=-.14;mouth.scale.set(.72,.48,1)}if(s==='scout'){k.rotation.x=-.135;k.position.y=(k.userData.baseY||0)-.030;headG.rotation.x=-.295;headG.position.y=.875;headG.position.z=.060;kasa.rotation.x=-.070;M.eye.emissiveIntensity=.42;eyeWhiteL.scale.set(1.26,.96,.10);eyeWhiteR.scale.set(1.26,.96,.10);eyeL.scale.set(.96,1.18,.10);eyeR.scale.set(.96,1.18,.10);browL.rotation.z=-.025;browR.rotation.z=.025;mouth.scale.set(.58,.38,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;armL.rotation.z=.18;armR.rotation.z=-.18;armR.rotation.x=-.55;armR.position.y=.18;armR.position.z=.050;}if(s==='shadow'){
  // Namaste-based Shadow Sense: hands pressed together, body still, red focused eyes.
  armL.visible=armR.visible=false;shadowArm.visible=true;
  sword.visible=true;swordLoop1.visible=swordLoop2.visible=true;
  k.rotation.y=.035;torso.rotation.y=.020;headG.rotation.x=.040;
  M.eye.color.setHex(0x8b0505);M.eye.emissive.setHex(0xff1919);M.eyeWhite.color.setHex(0xffd6d6);M.eye.emissiveIntensity=2.25;
  browL.rotation.z=-.035;browR.rotation.z=.035;browL.position.y=.002;browR.position.y=.002;
  eyeWhiteL.scale.set(1.12,.76,.10);eyeWhiteR.scale.set(1.12,.76,.10);eyeL.scale.set(.92,1.18,.10);eyeR.scale.set(.92,1.18,.10);
  mouth.scale.set(.54,.34,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;
}if(s==='drawn'){
  // Preparing to unsheath: saya is across the waist, left hand braces it, right hand grips the handle.
  headG.rotation.y=-.028;headG.rotation.x=-.006;k.rotation.y=.30;k.rotation.z=-.012;torso.rotation.y=-.14;
  M.eye.emissiveIntensity=.55;browL.rotation.z=-.040;browR.rotation.z=.040;browL.position.y=.001;browR.position.y=.001;
  eyeWhiteL.scale.set(1.20,.86,.10);eyeWhiteR.scale.set(1.20,.86,.10);eyeL.scale.set(.94,1.12,.10);eyeR.scale.set(.94,1.12,.10);
  mouth.scale.set(.58,.34,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;
  armL.visible=armR.visible=false;drawArmL.visible=drawArmR.visible=true;drawnSword.visible=false;
  sword.visible=true;swordLoop1.visible=swordLoop2.visible=true;
  // Iai draw setup: the sheathed katana is anchored at the left hip, not flat across the stomach.
  // The saya runs left/back/down while the handle rises slightly right/up toward the pulling hand.
  sword.position.set(-.225,-.405,.360);sword.rotation.set(.045,-.035,-1.365);
  swordLoop1.position.set(-.285,-.405,.245);swordLoop1.rotation.set(0,0,.18);
  swordLoop2.position.set(-.170,-.350,.270);swordLoop2.rotation.set(0,0,.12);
  // stance: left foot forward, right foot back, knees implied by the lowered/turned body.
  bootL.ankle.position.set(-.175,-.970,.135);bootL.foot.position.set(-.205,-1.105,.335);bootL.toe.position.set(-.220,-1.096,.465);bootL.sole.position.set(-.205,-1.145,.345);bootL.heel.position.set(-.190,-1.123,.205);
  bootR.ankle.position.set(.155,-.970,-.065);bootR.foot.position.set(.170,-1.105,.045);bootR.toe.position.set(.185,-1.096,.160);bootR.sole.position.set(.170,-1.145,.055);bootR.heel.position.set(.155,-1.123,-.075);
}if(s==='fighting'){
  // Ready stance: two hands locked on the handle; weapon, fingers, and wrists move as one unit.
  headG.rotation.y=-.045;headG.rotation.x=-.014;k.rotation.y=.34;k.rotation.z=-.035;torso.rotation.y=-.16;
  M.eye.color.setHex(0x4b0505);M.eye.emissive.setHex(0xff1f1f);M.eye.emissiveIntensity=1.20;
  browL.rotation.z=-.055;browR.rotation.z=.055;eyeWhiteL.scale.set(1.26,.96,.10);eyeWhiteR.scale.set(1.26,.96,.10);eyeL.scale.set(1.00,1.28,.10);eyeR.scale.set(1.00,1.28,.10);
  mouth.scale.set(.60,.34,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;
  armL.visible=armR.visible=false;fightArmL.visible=fightArmR.visible=drawnSword.visible=true;
  drawnSword.position.set(.100,-.020,.075);drawnSword.rotation.set(.09,0,-.82);
  sword.visible=false;swordLoop1.visible=swordLoop2.visible=false;
  bootL.ankle.position.set(-.190,-.970,.145);bootL.foot.position.set(-.220,-1.105,.360);bootL.toe.position.set(-.235,-1.096,.490);bootL.sole.position.set(-.220,-1.145,.370);bootL.heel.position.set(-.205,-1.123,.220);
  bootR.ankle.position.set(.175,-.970,-.075);bootR.foot.position.set(.185,-1.105,.035);bootR.toe.position.set(.200,-1.096,.150);bootR.sole.position.set(.185,-1.145,.045);bootR.heel.position.set(.175,-1.123,-.090);
}if(s==='slash'){
  // Slash: hands drive the blade forward, body and feet support the cut.
  headG.rotation.y=-.070;headG.rotation.x=-.018;k.rotation.y=.42;k.rotation.z=-.070;torso.rotation.y=-.24;
  M.eye.color.setHex(0x620303);M.eye.emissive.setHex(0xff2424);M.eye.emissiveIntensity=1.65;
  browL.rotation.z=-.085;browR.rotation.z=.085;eyeWhiteL.scale.set(1.32,1.02,.10);eyeWhiteR.scale.set(1.32,1.02,.10);eyeL.scale.set(1.05,1.36,.10);eyeR.scale.set(1.05,1.36,.10);
  mouth.scale.set(.66,.38,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;
  armL.visible=armR.visible=false;fightArmL.visible=fightArmR.visible=drawnSword.visible=slashArc.visible=true;
  drawnSword.position.set(.175,.020,.145);drawnSword.rotation.set(.16,0,-1.18);
  sword.visible=false;swordLoop1.visible=swordLoop2.visible=false;
  bootL.ankle.position.set(-.210,-.970,.165);bootL.foot.position.set(-.255,-1.105,.400);bootL.toe.position.set(-.275,-1.096,.535);bootL.sole.position.set(-.255,-1.145,.410);bootL.heel.position.set(-.235,-1.123,.250);
  bootR.ankle.position.set(.180,-.970,-.090);bootR.foot.position.set(.195,-1.105,.015);bootR.toe.position.set(.215,-1.096,.125);bootR.sole.position.set(.195,-1.145,.025);bootR.heel.position.set(.180,-1.123,-.105);
}if(s==='smirk'){mouth.rotation.z=-.08;mouth.scale.set(.94,.66,1);headG.rotation.y=-.055;browL.rotation.z=.025;browR.rotation.z=.005}if(s==='sleep'){headG.rotation.x=.24;headG.rotation.z=-.08;kasa.rotation.z=-.06;eyeWhiteL.scale.y=.20;eyeWhiteR.scale.y=.20;eyeL.scale.y=.18;eyeR.scale.y=.18;glintL.visible=glintR.visible=false;mouth.scale.set(.60,.36,1);upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;M.eye.emissiveIntensity=.10}if(s==='error'){mouth.scale.set(.86,.58,1);mouth.position.y=-.150;upperTeeth.visible=lowerTeeth.visible=tongue.visible=false;sternLine.visible=false;frownLine.visible=true;browL.rotation.z=.09;browR.rotation.z=-.09;browL.position.y=-.004;browR.position.y=-.004;eyeWhiteL.scale.y=.58;eyeWhiteR.scale.y=.58;eyeL.scale.y=.72;eyeR.scale.y=.72;headG.rotation.x=-.010;armL.rotation.z=-.035;armR.rotation.z=.035;M.eye.emissiveIntensity=.30}}
if(!mini||interactiveMini){canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'});canvas.addEventListener('pointermove',e=>{if(!drag)return;rot=clampRot(rot+(e.clientX-lastX)*.008);targetRot=rot;lastX=e.clientX});canvas.addEventListener('pointerup',()=>{drag=false;canvas.style.cursor='grab'});canvas.addEventListener('pointercancel',()=>{drag=false;canvas.style.cursor='grab'});canvas.style.cursor='grab'}
function resize(){const w=canvas.clientWidth||canvas.parentElement.clientWidth||92,h=canvas.clientHeight||canvas.parentElement.clientHeight||128;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}window.addEventListener('resize',resize);setTimeout(resize,0);resize();setState('guardian');
function anim(){requestAnimationFrame(anim);const t=clock.elapsedTime;if(!drag){if(!mini)targetRot=Math.sin(t*.32)*.62;rot+=(clampRot(targetRot)-rot)*.045;}root.rotation.y=(mini&&!interactiveMini)?.18:clampRot(rot);if(root.userData.br)root.userData.br.rotation.z+=.004;const tr=Math.max(0,1-(t-transitionStart)/.55);const pulseEase=tr*tr*(3-2*tr);k.scale.setScalar(baseKageScale*(1-.035*pulseEase));if(state==='meditating'){k.position.y=(k.userData.baseY||0)+Math.sin(t*.9)*.004;headG.position.y=.635+Math.sin(t*.9)*.003;}else{k.position.y=(k.userData.baseY||0)+Math.sin(t*1.25)*.012;headG.position.y=.84+Math.sin(t*1.3)*.004;}const blink=(Math.sin(t*2.1)>0.985)?0.18:1;if(state!=='sleep'&&state!=='listening'&&state!=='error'&&state!=='meditating'){eyeWhiteL.scale.y=.90*blink;eyeWhiteR.scale.y=.90*blink;eyeL.scale.y=1.20*blink;eyeR.scale.y=1.20*blink}if(state==='meditating'){const calm=Math.sin(t*.9);torso.position.y=-.125+calm*.003;meditationGroup.position.y=.130+calm*.002;headG.rotation.x=.065+calm*.004;}if(state==='speaking'){mouth.scale.y=.92+Math.abs(Math.sin(t*10))*0.34;mouth.scale.x=.98+Math.sin(t*10)*.04;headG.rotation.y=Math.sin(t*2.0)*.018;speakArm.rotation.z=Math.sin(t*3.6)*.070;speakArm.position.y=Math.sin(t*3.0)*.012;browL.position.y=Math.sin(t*2.5)*.002;browR.position.y=Math.sin(t*2.5+.4)*.002}if(state==='listening'){headG.rotation.x=.018+Math.sin(t*1.8)*.024;headG.rotation.y=Math.sin(t*1.4)*.012;eyeWhiteL.scale.y=.64+Math.sin(t*2.1)*.030;eyeWhiteR.scale.y=.64+Math.sin(t*2.1)*.030;eyeL.scale.y=.84+Math.sin(t*2.1)*.038;eyeR.scale.y=.84+Math.sin(t*2.1)*.038}if(state==='thinking'){headG.rotation.z=.018+Math.sin(t*1.10)*.010;headG.rotation.x=.020+Math.sin(t*1.2)*.008;thinkArm.rotation.z=-.02+Math.sin(t*1.3)*.010;thinkArm.position.y=Math.sin(t*1.4)*.004;browL.rotation.z=-.035+Math.sin(t*1.6)*.008;browR.rotation.z=.035-Math.sin(t*1.6)*.008}if(state==='alert'){k.rotation.z=Math.sin(t*8)*.003;eyeL.scale.y=1.30;eyeR.scale.y=1.30;armL.rotation.z=.14+Math.sin(t*6)*.018;armR.rotation.z=-.14-Math.sin(t*6)*.018}if(state==='scout'){const breathe=Math.sin(t*1.25);k.rotation.x=-.135+breathe*.012;headG.rotation.x=-.295+Math.sin(t*1.7)*.018;headG.rotation.y=Math.sin(t*1.2)*.020;kasa.rotation.x=-.070+Math.sin(t*1.5)*.008;armR.rotation.x=-.55+Math.sin(t*1.6)*.030;armR.rotation.z=-.18+Math.sin(t*1.6)*.020;}if(state==='shadow'){const pulse=.72+Math.abs(Math.sin(t*4.2))*.36;M.eye.emissiveIntensity=1.70+pulse*.65;eyeL.scale.y=1.10+pulse*.10;eyeR.scale.y=1.10+pulse*.10;headG.rotation.x=.040+Math.sin(t*1.2)*.004;shadowArm.position.y=Math.sin(t*1.4)*.004;}if(state==='drawn'){headG.rotation.y=-.040+Math.sin(t*1.6)*.006;k.rotation.y=.18+Math.sin(t*1.4)*.008;drawArmR.rotation.z=Math.sin(t*1.8)*.010;drawArmL.rotation.z=-Math.sin(t*1.8)*.010;}if(state==='fighting'){headG.rotation.y=-.050+Math.sin(t*2.0)*.008;k.rotation.y=.28+Math.sin(t*2.1)*.010;k.rotation.z=-.030+Math.sin(t*2.5)*.006;drawnSword.rotation.z=-.82+Math.sin(t*2.4)*.025;fightArmL.rotation.z=Math.sin(t*2.5)*.012;fightArmR.rotation.z=-Math.sin(t*2.5)*.012;eyeL.scale.y=1.30;eyeR.scale.y=1.30;}if(state==='slash'){headG.rotation.y=-.070+Math.sin(t*3.0)*.012;const swing=Math.sin((t-stateTime)*5.2);k.rotation.y=.34+swing*.050;k.rotation.z=-.070+swing*.030;drawnSword.rotation.z=-1.18+swing*.32;drawnSword.rotation.x=.16+Math.abs(swing)*.05;drawnSword.position.x=.175+Math.max(0,swing)*.045;fightArmL.rotation.z=swing*.050;fightArmR.rotation.z=-swing*.055;slashArc.rotation.z=-.75+swing*.38;slashArc.visible=true;eyeL.scale.y=1.38;eyeR.scale.y=1.38;}if(state==='error'){headG.rotation.z=Math.sin(t*1.8)*.010;frownLine.position.y=Math.sin(t*2.2)*.002;k.position.x=Math.sin(t*14)*.004*Math.max(0,1-(t-stateTime)*.5)}if(state==='guardian'||state==='bow'||state==='smirk'||state==='sleep'){const micro=Math.sin(t*1.7);headG.rotation.y+=micro*.010;headG.rotation.z+=Math.sin(t*1.1)*.004;browL.rotation.z+=Math.sin(t*2.2)*.006;browR.rotation.z-=Math.sin(t*2.2)*.006;if(state==='guardian'){eyeL.position.x=-.112+Math.sin(t*1.4)*.004;eyeR.position.x=.112+Math.sin(t*1.4)*.004;mouth.scale.y=.92+Math.abs(Math.sin(t*1.0))*.05;}}R.render(scene,cam)}anim();return{setState,setLook,resize}}

window.KageV43 = window.KageV43 || {};
window.KageV43.create = createKage;
window.KageV43.states = ['guardian','meditating','bow','listening','thinking','speaking','alert','scout','shadow','drawn','fighting','slash','smirk','error','sleep'];
window.KageV43.timeState = function(){
  var h = new Date().getHours();
  if (h >= 23 || h < 6) return 'sleep';
  if (h >= 6 && h < 9) return 'meditating';
  if (h >= 9 && h < 18) return 'guardian';
  if (h >= 18 && h < 21) return 'scout';
  return 'shadow';
};
window.KageV43.describe = function(s){
  var map = {
    guardian:'<strong>Guardian:</strong> Kage stands watch over Sensei Sai\'s portfolio.',
    meditating:'<strong>Meditating:</strong> Kage sits calmly, slowing the noise before the next task.',
    bow:'<strong>Bow:</strong> Kage greets the visitor with respect.',
    listening:'<strong>Listening:</strong> Kage leans in and waits for the next prompt.',
    thinking:'<strong>Thinking:</strong> Kage studies the path before answering.',
    speaking:'<strong>Speaking:</strong> Kage answers through the Ask Kage console.',
    alert:'<strong>Alert:</strong> Kage senses something that needs attention.',
    scout:'<strong>Scout:</strong> Kage scans the horizon for the right route.',
    shadow:'<strong>Shadow Sense:</strong> Kage focuses, palms joined, crimson eyes awake.',
    drawn:'<strong>Drawn:</strong> Kage prepares an iai draw from the saya.',
    fighting:'<strong>Ready:</strong> Kage locks both hands on the katana.',
    slash:'<strong>Slash:</strong> Kage performs a controlled cutting motion.',
    smirk:'<strong>Smirk:</strong> Kage shows a little ronin confidence.',
    error:'<strong>Error:</strong> Kage marks a disturbance in the code.',
    sleep:'<strong>Sleep:</strong> Kage rests, but the shadow remains nearby.'
  };
  return map[s] || map.guardian;
};
function mountKageViewer(){
  var mount = document.getElementById('kage3dMount');
  if(!mount || !window.THREE) return;
  if(mount.dataset.kageMounted) return;
  mount.dataset.kageMounted='1';
  var canvas = document.createElement('canvas');
  canvas.id='kage3dCanvas';
  canvas.style.width='100%';
  canvas.style.height='100%';
  mount.insertBefore(canvas, mount.firstChild);
  var inst = createKage(canvas,{mini:false});
  window.KageV43.main = inst;
  function setState(s){
    if(s==='meditate') s='meditating';
    if(s==='ready') s='fighting';
    if(s==='focused') s='shadow';
    if(s==='calm') s='guardian';
    if(!s) s='guardian';
    inst.setState(s);
    var status=document.getElementById('kage3dStatus');
    if(status) status.innerHTML=window.KageV43.describe(s);
    document.querySelectorAll('#kageStateControls .kage-control, #kagePoseControls .kage-control, #kageExpressionControls .kage-control').forEach(function(b){
      var v=b.getAttribute('data-state')||b.getAttribute('data-pose')||b.getAttribute('data-expression');
      if(v==='meditate') v='meditating';
      if(v==='ready') v='fighting';
      if(v==='focused') v='shadow';
      if(v==='calm') v='guardian';
      b.classList.toggle('active', v===s);
    });
    if(window.trackSaiEvent) window.trackSaiEvent('Kage v43 State',{state:s});
  }
  window.KageV43.setMainState=setState;
  document.addEventListener('click',function(e){
    var btn=e.target.closest('[data-state],[data-pose],[data-expression]');
    if(!btn) return;
    if(!btn.closest('#kageStateControls,#kagePoseControls,#kageExpressionControls')) return;
    setState(btn.getAttribute('data-state')||btn.getAttribute('data-pose')||btn.getAttribute('data-expression'));
  });
  setState('guardian');
}
function initV43(){
  if(!window.THREE){ setTimeout(initV43,80); return; }
  mountKageViewer();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initV43); else initV43();
})();

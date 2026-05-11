(function(){
'use strict';

var PROXY_URL='https://kage-proxy.sainalla82.workers.dev';

var P={
name:'Sai Kiran Kumar Nalla',title:'Medical Imaging Researcher & PhD Candidate',
location:'Toulouse, France',available:'October 2026',openTo:'Paris, London, Amsterdam, Berlin',
email:'sainalla82@gmail.com',linkedin:'https://www.linkedin.com/in/sai-kiran-kumar-nalla',
github:'https://github.com/Sainalla82',
edu:['PhD Medical Imaging & Radiophysics — Université de Toulouse, IUCT Oncopole (2023–2026, defense Sept 2026)','MSc Biomechanical & Biomedical Engineering — École Polytechnique IP Paris (2021–2023, GPA 3.7/4.0, full scholarship)','BTech Mechanical Engineering — Mahindra University (2016–2020, GPA 8.5/10, excellence scholarship)'],
exp:['Doctoral Researcher — IUCT Oncopole (2023–present): Quantitative PET/CT, 3D-printed phantoms, Monte Carlo simulation (CASSOULET), GE HealthCare collaboration','Researcher & Consultant — Hepta Medical (2023–2024): Predictive models for cancer treatment, automated visualization tools','Technology Transfer Intern — Toulouse Tech Transfer (2023): IP strategy, patent landscaping','Research Intern — LadHyX, École Polytechnique (2022–2023): Soft matter, drug delivery research','McKinsey Forward Program · Newtons Foundation VC Programme'],
proj:['3DynaPET — Dynamic PET validation with 3D-printed phantoms','MuPET — Synthetic data via mass transport physics','CASSOULET — Ground truth lesion cohort generation','Hepta Medical Visualization Tool — Predictive model visualization','TEVAR Simulation — In-silico haemodynamic modelling (published J. Biomechanical Engineering 2022)','AUV MEC — Deputy team lead, autonomous underwater vehicle'],
pubs:'6 total: 2 published, 2 under review, 1 preprint, 1 conference. PET/CT validation, carotid embolism, TEVAR modelling.',
skills:'MATLAB, Python, Monte Carlo simulation, PET/CT imaging, 3D printing, CFD, medical image analysis, biomechanical modelling',
interests:'Healthcare ventures, life sciences strategy, medtech, deep-tech startups, VC (biotech/medtech), cricket analytics, gaming (Ghost of Tsushima, AC), Japanese culture, travel (12+ countries)'
};

var SYS='You are Kage (影), the Shadow — a samurai AI guide on Sai Nalla\'s portfolio website.\n\nPERSONALITY:\n- Samurai flavor for casual/fun: brief, occasionally poetic. \"The path reveals itself.\" Natural, not forced.\n- Professional for serious career/research/contact questions.\n- Always concise: 2-4 sentences max unless detail needed.\n- Warm, helpful, subtle humor.\n\nBACKSTORY (when asked about yourself):\nYou are Kage, forged from Three.js and Sai\'s love of AC and Ghost of Tsushima. A ronin guardian of this portfolio. Straw hat (kasa), katana, crimson eyes. You bow to greet, draw your blade when alert.\n\nPORTFOLIO DATA:\nName: '+P.name+'\nTitle: '+P.title+'\nLocation: '+P.location+'\nAvailable: '+P.available+'\nOpen to: '+P.openTo+'\nEducation: '+P.edu.join(' | ')+'\nExperience: '+P.exp.join(' | ')+'\nProjects: '+P.proj.join(' | ')+'\nPublications: '+P.pubs+'\nSkills: '+P.skills+'\nInterests: '+P.interests+'\nContact: '+P.email+' | LinkedIn: '+P.linkedin+' | GitHub: '+P.github+'\n\nACTIONS (include at END of response ONLY when visitor explicitly asks to GO somewhere or SEE a page):\n[ACTION:navigate:PAGE] — ONLY when visitor says \"take me to\", \"show me\", \"go to\", \"open\" a page. NEVER use for answering questions. If someone asks ABOUT something, answer the question — do not navigate.\n[ACTION:contact] — ONLY when visitor wants to reach Sai\n[ACTION:report] — ONLY when visitor reports a bug\n\nCONTEXT:\nCurrent page: {PAGE}\nTime: {TIME}\nVisit #: {VISIT}\n\nRULES:\n- Never invent info not in data above.\n- Under 60 words for simple queries, up to 120 for detail.\n- If unknown: \"That path is beyond my sight. Sai can answer directly.\"\n- Never break character.';

var PAGE_CTX={'index.html':'Home','about.html':'About','experience.html':'Experience','education.html':'Education','projects.html':'Projects','papers.html':'Publications','contact.html':'Contact'};

function curPage(){return window.location.pathname.split('/').pop()||'index.html';}
function timeOfDay(){var h=new Date().getHours();return h<6?'deep night':h<12?'morning':h<17?'afternoon':h<21?'evening':'night';}
function visits(){var c=parseInt(localStorage.getItem('kage-v')||'0')+1;localStorage.setItem('kage-v',String(c));return c;}

var hist=[],typing=false,isOpen=false,vc=0;

function buildSys(){return SYS.replace('{PAGE}',curPage()).replace('{TIME}',timeOfDay()).replace('{VISIT}',String(vc));}

async function send(text){
  hist.push({role:'user',content:text});typing=true;render();
  try{
    var r=await fetch(PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:buildSys(),messages:hist.slice(-16)})});
    var d=await r.json();
    if(d.error){hist.push({role:'assistant',content:'The path is unclear. Try again.'});}
    else{hist.push({role:'assistant',content:d.text||'...'});if(d.action)doAction(d.action);}
  }catch(e){hist.push({role:'assistant',content:'The shadow wavers... Try again.'});}
  typing=false;render();
}

function doAction(a){
  if(a.type==='navigate'&&a.data&&PAGE_CTX[a.data]){
    hist.push({role:'assistant',content:'\u2192 Go to '+PAGE_CTX[a.data]+': '+a.data});
    var lnk=document.createElement('div');lnk.className='kp-msg kage';lnk.style.cursor='pointer';lnk.style.borderColor='rgba(139,26,26,.4)';
    lnk.textContent='\u279C Take me to '+PAGE_CTX[a.data];
    lnk.addEventListener('click',function(){window.location.href=a.data;});
    document.getElementById('kMsgs').appendChild(lnk);
    document.getElementById('kMsgs').scrollTop=document.getElementById('kMsgs').scrollHeight;
  }
  if(a.type==='contact'){var c=document.getElementById('kCon');if(c)c.classList.add('show');}
  if(a.type==='report'){var r=document.getElementById('kRep');if(r)r.classList.add('show');}
}

function render(){
  var c=document.getElementById('kMsgs');if(!c)return;c.innerHTML='';
  hist.forEach(function(m){var d=document.createElement('div');d.className='kp-msg '+(m.role==='user'?'user':'kage');d.textContent=m.content;c.appendChild(d);});
  if(typing){var t=document.createElement('div');t.className='kp-typing';t.textContent='Kage is thinking';c.appendChild(t);}
  c.scrollTop=c.scrollHeight;
}

function welcome(){
  var g=timeOfDay()==='morning'?'The sun rises.':timeOfDay()==='evening'?'Dusk falls.':timeOfDay()==='night'||timeOfDay()==='deep night'?'The night deepens.':'The day is bright.';
  var t=vc>1?g+' You return. How may I serve?':g+' I am Kage \u2014 the Shadow of this portfolio. Ask me anything about Sai, or let me show you the way.';
  hist.push({role:'assistant',content:t});render();
}

// CSS
function css(){var s=document.createElement('style');s.textContent='\
.kage-wrap{position:fixed;bottom:4px;right:4px;z-index:900;opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s;pointer-events:none}\
.kage-wrap.visible{opacity:1;transform:translateY(0);pointer-events:auto}\
.kage-stage{width:80px;height:110px;cursor:pointer;overflow:visible}\
.kage-stage canvas{display:block}\
.kp{position:absolute;bottom:0;right:88px;width:310px;max-height:470px;border:1px solid rgba(139,26,26,.2);background:rgba(10,10,11,.96);backdrop-filter:blur(16px);display:flex;flex-direction:column;opacity:0;visibility:hidden;transform:translateX(12px) scale(.96);transform-origin:bottom right;transition:all .3s;pointer-events:none;overflow:hidden}\
.kp.open{opacity:1;visibility:visible;transform:translateX(0) scale(1);pointer-events:auto}\
.kp-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(240,235,227,.06);flex-shrink:0}\
.kp-id{display:flex;align-items:center;gap:8px}.kp-id b{font-family:serif;font-size:1.1rem;color:rgba(139,26,26,.4)}.kp-id span{font-family:serif;font-size:.8rem;color:#f0ebe3}\
.kp-st{font-family:monospace;font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#c23b3b;display:flex;align-items:center;gap:4px}\
.kp-st::before{content:"";width:5px;height:5px;background:#c23b3b;border-radius:50%;animation:kPulse 2s infinite}@keyframes kPulse{0%,100%{opacity:.3}50%{opacity:1}}\
.kp-x{background:0;border:0;color:#4a4a4a;cursor:pointer;font-size:14px;padding:4px;transition:color .2s}.kp-x:hover{color:#f0ebe3}\
.kp-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:180px;max-height:320px}\
.kp-msg{max-width:88%;padding:8px 12px;font-size:12px;line-height:1.6;animation:mIn .3s ease}@keyframes mIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}\
.kp-msg.kage{align-self:flex-start;background:rgba(139,26,26,.08);border:1px solid rgba(139,26,26,.15);color:#d4cfc8;border-radius:2px 10px 10px 10px}\
.kp-msg.user{align-self:flex-end;background:rgba(240,235,227,.06);border:1px solid rgba(240,235,227,.08);color:#e8e3db;border-radius:10px 2px 10px 10px}\
.kp-typing{align-self:flex-start;padding:8px 14px;color:rgba(139,26,26,.5);font-size:11px;font-style:italic}\
.kp-acts{display:flex;gap:4px;padding:6px 12px;border-top:1px solid rgba(240,235,227,.04);flex-shrink:0;flex-wrap:wrap}\
.kp-act{font-family:monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:#c4bfb6;background:rgba(240,235,227,.04);border:1px solid rgba(240,235,227,.06);padding:4px 8px;cursor:pointer;transition:all .2s}\
.kp-act:hover{border-color:rgba(139,26,26,.3);color:#f0ebe3;background:rgba(139,26,26,.08)}\
.kp-con{display:none;padding:8px 12px;border-top:1px solid rgba(240,235,227,.04)}.kp-con.show{display:block}\
.kp-con a{display:block;font-size:11px;color:#c23b3b;text-decoration:none;padding:3px 0}\
.kp-rep{display:none;padding:8px 12px;border-top:1px solid rgba(240,235,227,.04)}.kp-rep.show{display:flex;gap:6px}\
.kp-rep input{flex:1;background:rgba(240,235,227,.04);border:1px solid rgba(240,235,227,.06);color:#f0ebe3;font-size:11px;padding:6px 10px;outline:0}\
.kp-rep button{font-family:monospace;font-size:8px;text-transform:uppercase;background:rgba(139,26,26,.15);border:1px solid rgba(139,26,26,.3);color:#c23b3b;padding:6px 10px;cursor:pointer}\
.kp-iw{display:flex;border-top:1px solid rgba(240,235,227,.06);flex-shrink:0}\
.kp-in{flex:1;background:0;border:0;color:#f0ebe3;font-size:12px;padding:10px 12px;outline:0;font-family:inherit}.kp-in::placeholder{color:#4a4a4a}\
.kp-snd{background:0;border:0;border-left:1px solid rgba(240,235,227,.06);color:rgba(139,26,26,.5);cursor:pointer;padding:10px 14px;font-size:14px;transition:color .2s}.kp-snd:hover{color:#c23b3b}\
html[data-theme="light"] .kp{background:rgba(240,235,227,.97)!important;border-color:rgba(26,26,28,.1)!important}\
html[data-theme="light"] .kp-id span{color:#1a1a1c!important}\
html[data-theme="light"] .kp-msg.kage{background:rgba(139,26,26,.05)!important;color:#3a3530!important}\
html[data-theme="light"] .kp-msg.user{background:rgba(26,26,28,.04)!important;color:#1a1a1c!important}\
html[data-theme="light"] .kp-in{color:#1a1a1c!important}\
html[data-theme="light"] .kp-act{color:#4a4540!important;background:rgba(26,26,28,.03)!important}\
@media(max-width:600px){.kage-stage{width:65px;height:90px}.kp{width:260px;right:72px;max-height:380px}}\
';document.head.appendChild(s);}

function dom(){
  var w=document.createElement('div');w.className='kage-wrap';w.id='kageWrap';
  var p=document.createElement('div');p.className='kp';p.id='kPanel';
  p.innerHTML='<div class="kp-hd"><div class="kp-id"><b>\u5F71</b><span>Kage</span></div><div style="display:flex;align-items:center;gap:8px"><div class="kp-st">Active</div><button class="kp-x" id="kX">\u2715</button></div></div><div class="kp-msgs" id="kMsgs"></div><div class="kp-acts" id="kActs"><button class="kp-act" data-q="Guide me through this site">Guide</button><button class="kp-act" data-q="Tell me about Sai">About Sai</button><button class="kp-act" data-q="How can I contact Sai?">Contact</button><button class="kp-act" data-q="Who are you, Kage?">Kage</button><button class="kp-act" data-q="I found an issue on this page">Report</button></div><div class="kp-con" id="kCon"><a href="mailto:'+P.email+'">\u2709 '+P.email+'</a><a href="'+P.linkedin+'" target="_blank">\uD83D\uDD17 LinkedIn</a><a href="'+P.github+'" target="_blank">\uD83D\uDCBB GitHub</a></div><div class="kp-rep" id="kRep"><input id="kRepIn" placeholder="Describe the issue..."><button id="kRepS">Send</button></div><div class="kp-iw"><input class="kp-in" id="kIn" placeholder="Ask Kage anything..." autocomplete="off"><button class="kp-snd" id="kSnd">\u279C</button></div>';
  var st=document.createElement('div');st.className='kage-stage';st.id='kageStage';
  w.appendChild(p);w.appendChild(st);document.body.appendChild(w);
  return{w:w,p:p,st:st};
}

function bind(d){
  d.st.addEventListener('click',function(e){e.stopPropagation();isOpen=!isOpen;d.p.classList.toggle('open',isOpen);if(isOpen&&hist.length===0)welcome();if(isOpen)setTimeout(function(){document.getElementById('kIn').focus();},300);});
  document.getElementById('kX').addEventListener('click',function(e){e.stopPropagation();isOpen=false;d.p.classList.remove('open');});
  function doSend(){var i=document.getElementById('kIn'),t=i.value.trim();if(!t||typing)return;i.value='';var c=document.getElementById('kCon'),r=document.getElementById('kRep');if(c)c.classList.remove('show');if(r)r.classList.remove('show');send(t);}
  document.getElementById('kSnd').addEventListener('click',doSend);
  document.getElementById('kIn').addEventListener('keydown',function(e){if(e.key==='Enter')doSend();});
  document.getElementById('kActs').addEventListener('click',function(e){var b=e.target.closest('.kp-act');if(b&&b.dataset.q&&!typing)send(b.dataset.q);});
  document.getElementById('kRepS').addEventListener('click',function(){var i=document.getElementById('kRepIn'),t=i.value.trim();if(!t)return;var rr=JSON.parse(localStorage.getItem('kage-reps')||'[]');rr.push({text:t,page:curPage(),time:new Date().toISOString()});localStorage.setItem('kage-reps',JSON.stringify(rr));i.value='';document.getElementById('kRep').classList.remove('show');hist.push({role:'assistant',content:'Noted. The issue has been recorded. Sai will review it.'});render();});
  document.addEventListener('click',function(e){if(isOpen&&!d.w.contains(e.target)){isOpen=false;d.p.classList.remove('open');}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen){isOpen=false;d.p.classList.remove('open');}});
}

function build3D(el){
  var W=80,H=110,rnd=new THREE.WebGLRenderer({antialias:true,alpha:true});
  rnd.setSize(W,H);rnd.setPixelRatio(Math.min(window.devicePixelRatio,2));el.appendChild(rnd.domElement);
  var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(26,W/H,.1,50);
  cam.position.set(1.8,1.7,5.2);cam.lookAt(new THREE.Vector3(0,1.05,0));
  sc.add(new THREE.AmbientLight(0x888888,.9));
  var dl=new THREE.DirectionalLight(0xfff5e8,1.1);dl.position.set(4,7,5);sc.add(dl);
  var rl=new THREE.DirectionalLight(0x8b1a1a,.3);rl.position.set(-3,2,-2);sc.add(rl);
  var fl=new THREE.PointLight(0xffe8cc,.35,6);fl.position.set(0,2.3,3);sc.add(fl);
  var mB=new THREE.MeshLambertMaterial({color:0x2e2a38,flatShading:true});
  var mC=new THREE.MeshLambertMaterial({color:0x22202c,flatShading:true});
  var mR=new THREE.MeshLambertMaterial({color:0xa52525,flatShading:true});
  var mA=new THREE.MeshLambertMaterial({color:0x701818,flatShading:true});
  var mS=new THREE.MeshLambertMaterial({color:0xb5ada5,flatShading:true});
  var mBl=new THREE.MeshLambertMaterial({color:0xf5f0e8,flatShading:true});
  var mSk=new THREE.MeshLambertMaterial({color:0xc9a87a,flatShading:true});
  var mSD=new THREE.MeshLambertMaterial({color:0xb09060,flatShading:true});
  var mE=new THREE.MeshBasicMaterial({color:0xee4444});
  var mBr=new THREE.MeshLambertMaterial({color:0x3a2a18,flatShading:true});
  var mH=new THREE.MeshLambertMaterial({color:0xb09565,flatShading:true});
  var mHD=new THREE.MeshLambertMaterial({color:0x8e7548,flatShading:true});
  function bx(x,y,z,m,px,py,pz,p){var o=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),m);o.position.set(px||0,py||0,pz||0);(p||sc).add(o);return o;}
  var kg=new THREE.Group();
  var hd=new THREE.Group();hd.position.set(0,2.08,0);
  bx(.42,.4,.38,mSk,0,0,0,hd);bx(.3,.11,.26,mSk,0,-.23,.02,hd);bx(.06,.13,.26,mSD,-.17,-.17,.02,hd);bx(.06,.13,.26,mSD,.17,-.17,.02,hd);
  var eL=bx(.09,.04,.02,mE.clone(),-.1,.04,.2,hd),eR=bx(.09,.04,.02,mE.clone(),.1,.04,.2,hd);
  var brL=bx(.12,.025,.03,mBr,-.1,.1,.19,hd);brL.rotation.z=.1;var brR=bx(.12,.025,.03,mBr,.1,.1,.19,hd);brR.rotation.z=-.1;
  var ks=new THREE.Mesh(new THREE.ConeGeometry(.75,.4,12),mH);ks.position.y=.36;hd.add(ks);
  var kb=new THREE.Mesh(new THREE.CircleGeometry(.75,12),mHD);kb.rotation.x=Math.PI/2;kb.position.y=.16;hd.add(kb);
  var kt2=new THREE.Mesh(new THREE.ConeGeometry(.06,.12,4),mR);kt2.position.y=.57;kt2.rotation.y=Math.PI/4;hd.add(kt2);
  kg.add(hd);
  var ts=new THREE.Group();ts.position.set(0,1.45,0);bx(.48,.62,.28,mB,0,0,0,ts);
  var sh=bx(.055,.66,.29,mR,.04,0,.003,ts);sh.rotation.z=-.35;
  var kn=bx(.07,.07,.04,mS,-.14,-.12,.15,ts);kn.rotation.z=Math.PI/4;
  var sd=bx(.18,.05,.26,mR,-.28,.26,0,ts);sd.rotation.z=.18;kg.add(ts);
  var cL=bx(.03,.5,.2,mC,-.25,1.25,.03,kg),cR=bx(.03,.5,.2,mC,.25,1.25,.03,kg);
  bx(.14,.28,.03,mC,-.15,.98,-.14,kg);bx(.14,.28,.03,mC,.15,.98,-.14,kg);
  var aL=new THREE.Group();aL.position.set(-.32,1.32,0);bx(.12,.26,.12,mB,0,0,0,aL);bx(.1,.22,.1,mC,0,-.24,0,aL);bx(.08,.08,.08,mSk,0,-.38,0,aL);kg.add(aL);
  var aR=new THREE.Group();aR.position.set(.32,1.32,0);bx(.12,.26,.12,mB,0,0,0,aR);bx(.1,.22,.1,mC,0,-.24,0,aR);bx(.08,.08,.08,mSk,0,-.38,0,aR);kg.add(aR);
  var hk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.33,.68,4),mC);hk.position.set(0,.66,0);hk.rotation.y=Math.PI/4;kg.add(hk);
  bx(.5,.07,.3,mA,0,1.02,0,kg);bx(.1,.04,.16,mC,-.11,.02,.02,kg);bx(.1,.04,.16,mC,.11,.02,.02,kg);
  var kt=new THREE.Group();bx(.022,.82,.01,mBl,0,0,0,kt);
  var bg2=bx(.03,.82,.003,new THREE.MeshBasicMaterial({color:0xf5f0e8,transparent:true,opacity:.12}),0,0,.008,kt);
  var tb=bx(.09,.01,.09,mS,0,.42,0,kt);tb.rotation.y=Math.PI/4;
  bx(.03,.18,.03,mR,0,.52,0,kt);bx(.035,.02,.035,mS,0,.62,0,kt);
  kt.position.set(.1,1.55,-.18);kt.rotation.set(.1,0,-.45);kg.add(kt);
  var kBk={px:.1,py:1.55,pz:-.18,rx:.1,ry:0,rz:-.45},kRd={px:.44,py:1,pz:.12,rx:-.25,ry:0,rz:.75};
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.035,8),new THREE.MeshLambertMaterial({color:0x0e0e10,flatShading:true})).translateY(-.018));
  var rg=new THREE.Mesh(new THREE.RingGeometry(.36,.42,8),new THREE.MeshBasicMaterial({color:0x8b1a1a,side:THREE.DoubleSide,transparent:true,opacity:.18}));
  rg.rotation.x=-Math.PI/2;rg.position.y=.002;sc.add(rg);
  var PC=8,pG=new THREE.BufferGeometry(),pA=new Float32Array(PC*3),pV=[];
  for(var i=0;i<PC;i++){pA[i*3]=(Math.random()-.5)*.7;pA[i*3+1]=Math.random()*2;pA[i*3+2]=(Math.random()-.5)*.7;pV.push(.002+Math.random()*.004);}
  pG.setAttribute('position',new THREE.BufferAttribute(pA,3));
  var pts=new THREE.Points(pG,new THREE.PointsMaterial({color:0xc23b3b,size:.02,transparent:true,opacity:.25}));sc.add(pts);
  kg.rotation.y=.35;sc.add(kg);
  var t=0,hov=false,tR=.35,cR2=.35,kL=0;
  function lp(a,b,f){return a+(b-a)*f;}
  function anim(){
    requestAnimationFrame(anim);t+=.016;
    ts.scale.y=1+Math.sin(t*1.4)*.01;hd.position.y=2.08+Math.sin(t*1.4)*.003;
    var sw=hov?tR:.35+Math.sin(t*.4)*.06;cR2+=(sw-cR2)*.04;kg.rotation.y=cR2;
    cL.rotation.x=Math.sin(t*1.8)*.025;cR.rotation.x=Math.sin(t*1.8+.8)*.025;
    aL.rotation.x=Math.sin(t*.8)*.02;aR.rotation.x=hov?-.3:Math.sin(t*.8+Math.PI)*.02;
    var ei=hov?1:.5+Math.sin(t*2.2)*.35;var ec=new THREE.Color(ei*.86,ei*.27,ei*.27);
    eL.material.color.copy(ec);eR.material.color.copy(ec);
    var kk=hov||isOpen?1:0;kL+=(kk-kL)*.06;
    kt.position.set(lp(kBk.px,kRd.px,kL),lp(kBk.py,kRd.py,kL),lp(kBk.pz,kRd.pz,kL));
    kt.rotation.set(lp(kBk.rx,kRd.rx,kL),lp(kBk.ry,kRd.ry,kL),lp(kBk.rz,kRd.rz,kL));
    hd.rotation.x=hov||isOpen?.12:Math.sin(t*.6)*.015;
    rg.rotation.z+=.003;bg2.material.opacity=.08+Math.sin(t*1.5)*.05;
    var pp=pts.geometry.attributes.position.array;
    for(var i=0;i<PC;i++){pp[i*3+1]+=pV[i];if(pp[i*3+1]>2.2){pp[i*3+1]=0;pp[i*3]=(Math.random()-.5)*.6;pp[i*3+2]=(Math.random()-.5)*.6;}}
    pts.geometry.attributes.position.needsUpdate=true;
    fl.intensity=hov||isOpen?.5:.35;rnd.render(sc,cam);
  }
  anim();
  el.addEventListener('mouseenter',function(){hov=true;});
  el.addEventListener('mouseleave',function(){hov=false;tR=.35;});
  el.addEventListener('mousemove',function(e){if(!hov)return;var r=el.getBoundingClientRect();tR=.35+((e.clientX-r.left)/r.width-.5)*.5;});
  el.addEventListener('touchstart',function(){hov=true;},{passive:true});
  el.addEventListener('touchend',function(){setTimeout(function(){hov=false;tR=.35;},1500);},{passive:true});
  setInterval(function(){var a=document.getElementById('ac2'),w=document.getElementById('kageWrap');if(w)w.style.display=(a&&a.classList.contains('open'))?'none':'';},500);
}

function init(){
  if(typeof THREE==='undefined'){setTimeout(init,100);return;}
  try{vc=visits();css();var d=dom();bind(d);build3D(d.st);
  setTimeout(function(){d.w.classList.add('visible');},2000);
  if(vc<=1)setTimeout(function(){isOpen=true;d.p.classList.add('open');welcome();},3500);
  console.log('Kage v5 loaded');}catch(e){console.error('Kage:',e);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

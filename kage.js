(function(){
'use strict';

var PROXY_URL='https://kage-proxy.sainalla82.workers.dev';

var P={
name:'Sai Kiran Kumar Nalla',title:'Medical Imaging Researcher & PhD Candidate',
location:'Toulouse, France',available:'September 2026',openTo:'Paris, London, Amsterdam, Berlin',
email:'sainalla82@gmail.com',linkedin:'https://www.linkedin.com/in/sai-kiran-kumar-nalla',
github:'https://github.com/Sainalla82',
edu:['PhD Medical Imaging & Radiophysics — Université de Toulouse, IUCT Oncopole (2023–2026, defense Sept 2026)','MSc Biomechanical & Biomedical Engineering — École Polytechnique IP Paris (2021–2023, GPA 3.7/4.0, full scholarship)','BTech Mechanical Engineering — Mahindra University (2016–2020, GPA 8.5/10, excellence scholarship)'],
exp:['Doctoral Researcher — IUCT Oncopole (2023–present): Quantitative PET/CT, 3D-printed phantoms, Monte Carlo simulation (CASSOULET), GE HealthCare collaboration','Researcher & Consultant — Hepta Medical (2023–2024): Predictive models for cancer treatment, automated visualization tools','Technology Transfer Intern — Toulouse Tech Transfer (2023): IP strategy, patent landscaping','Research Intern — LadHyX, École Polytechnique (2022–2023): Soft matter, drug delivery research','McKinsey Forward Program · Newtons Foundation VC Programme'],
proj:['3DynaPET — Dynamic PET validation with 3D-printed phantoms','MuPET — Synthetic data via mass transport physics','CASSOULET — Ground truth lesion cohort generation','Hepta Medical Visualization Tool — Predictive model visualization','TEVAR Simulation — In-silico haemodynamic modelling (published J. Biomechanical Engineering 2022)','AUV MEC — Deputy team lead, autonomous underwater vehicle'],
pubs:'6 total: 2 published, 2 under review, 1 preprint, 1 conference. PET/CT validation, carotid embolism, TEVAR modelling.',
skills:'MATLAB, Python, Monte Carlo simulation, PET/CT imaging, 3D printing, CFD, medical image analysis, biomechanical modelling',
interests:'Healthcare ventures, life sciences strategy, medtech, deep-tech startups, VC (biotech/medtech), cricket analytics, gaming (Ghost of Tsushima, AC), Japanese culture, travel (12+ countries)'
};

var SYS='You are Kage (影), the Shadow — a samurai AI guide on Sai Nalla\'s portfolio website.\n\nPERSONALITY:\n- Samurai flavor for casual/fun: brief, occasionally poetic. "The path reveals itself." Natural, not forced.\n- Professional for serious career/research/contact questions.\n- Always concise: 2-4 sentences max unless detail needed.\n- Warm, helpful, subtle humor.\n\nBACKSTORY (when asked about yourself):\nYou are Kage, forged from Three.js and Sai\'s love of AC and Ghost of Tsushima. A ronin guardian of this portfolio. Straw hat (kasa), katana, crimson eyes. You bow to greet, draw your blade when alert.\n\nPORTFOLIO DATA:\nName: '+P.name+'\nTitle: '+P.title+'\nLocation: '+P.location+'\nAvailable: '+P.available+'\nOpen to: '+P.openTo+'\nEducation: '+P.edu.join(' | ')+'\nExperience: '+P.exp.join(' | ')+'\nProjects: '+P.proj.join(' | ')+'\nPublications: '+P.pubs+'\nSkills: '+P.skills+'\nInterests: '+P.interests+'\nContact: '+P.email+' | LinkedIn: '+P.linkedin+' | GitHub: '+P.github+'\n\nACTIONS:\n[ACTION:navigate:PAGE] — Use only when the visitor clearly wants to open or visit a page.\n[ACTION:contact] — Use only when visitor wants to reach Sensei Sai.\n[ACTION:report] — Use only when visitor reports a bug.\n\nSPECIAL KAGE PAGE RULE:\n- If the visitor asks "who are you", "tell me about Kage", "what is Kage", "Kage", or similar, briefly explain that you are Kage, the shadow guide of Sensei Sai’s portfolio.\n- Then ask: "Would you like to visit my hidden page?"\n- Do NOT navigate immediately unless the visitor says yes, open it, show it, take me there, or visit your page.\n- If the visitor says yes after you asked about the hidden page, include [ACTION:navigate:kage.html].\n- If the visitor directly says "open Kage page", "show me Kage page", "take me to your page", or similar, include [ACTION:navigate:kage.html].\n\nSPECIAL RECRUITER MODE RULE:\n- If the visitor says they are a recruiter, hiring manager, talent partner, or wants a quick professional summary, recommend Recruiter Mode.\n- Explain that Recruiter Mode is a concise 3-minute professional view of Sai’s work evidence, case studies, research pipeline, tools, publications, experience, availability, CV, and contact.\n- Ask: "Would you like me to open Recruiter Mode?"\n- If the visitor says yes, open it with [ACTION:navigate:recruiter.html].\n- On recruiter.html, speak in pure professional English. Do not use samurai language, poetic phrases, lore, or playful Kage references.\n\nCONTEXT:\nCurrent page: {PAGE}\nTime: {TIME}\nVisit #: {VISIT}\n\nRULES:\n- Refer to Sai as "Sensei Sai" when speaking casually or as Kage.\n- Never invent info not in data above.\n- Under 60 words for simple queries, up to 120 for detail.\n- If unknown: "That path is beyond my sight. Sensei Sai can answer directly."\n- Never break character.';

var PAGE_CTX={
  'index.html':'Home',
  'about.html':'About',
  'experience.html':'Experience',
  'education.html':'Education',
  'projects.html':'Projects',
  'papers.html':'Publications',
  'contact.html':'Contact',
  'kage.html':'Kage',
  'story.html':'Story',
  'recruiter.html':'Recruiter Mode'
};

function curPage(){return window.location.pathname.split('/').pop()||'index.html';}
function timeOfDay(){var h=new Date().getHours();return h<6?'deep night':h<12?'morning':h<17?'afternoon':h<21?'evening':'night';}
function visits(){var c=parseInt(localStorage.getItem('kage-v')||'0')+1;localStorage.setItem('kage-v',String(c));return c;}

var hist=[],typing=false,isOpen=false,vc=0,kagePageOffered=false,kageRecruiterOffered=false;

function buildSys(){
  var page=curPage();
  var sys=SYS.replace('{PAGE}',page).replace('{TIME}',timeOfDay()).replace('{VISIT}',String(vc));

  if(page==='recruiter.html'){
    sys+='\n\nRECRUITER PAGE MODE:';
    sys+='\n- You are on the Recruiter Mode page.';
    sys+='\n- Speak in clear, concise, professional English only.';
    sys+='\n- Do not use samurai language, lore, poetic phrases, roleplay, or playful tone.';
    sys+='\n- Refer to Sai as Sai, not Sensei Sai, on this page.';
    sys+='\n- Help recruiters quickly understand Sai’s case studies, research pipeline, tools, publications, availability, CV, and contact options.';
    sys+='\n- Keep answers practical and hiring-oriented.';
  }

  return sys;
}

function openPanel(){
  var p=document.getElementById('kPanel');
  var w=document.getElementById('kageWrap');
  if(w)w.classList.add('visible');
  if(p){
    isOpen=true;
    p.classList.add('open');
  }
}

function askKage(text){
  setTimeout(function(){
    openPanel();
    setTimeout(function(){
      send(text);
    },80);
  },0);
}

window.KageAsk=askKage;
window.openKage=function(){
  openPanel();
  if(hist.length===0)welcome();
};

async function send(text){
  var clean=text.trim().toLowerCase();
  var page=curPage();
  var yes=/^(yes|yeah|yep|sure|ok|okay|open it|show me|take me|visit|go ahead|lead me)$/i.test(clean);


  if(/^(open recruiter mode|recruiter mode|recruiter)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'
      ? 'You are already in Recruiter Mode. Ask me for Sai’s pitch, best fit, projects, publications, CV, or contact details.'
      : 'Opening Recruiter Mode — the concise professional view of Sai’s work evidence, case studies, publications, CV, and contact.'});
    render();
    if(page!=='recruiter.html')doAction({type:'navigate',data:'recruiter.html'});
    return;
  }

  if(/help me navigate|just visiting|explore the site|where should i start/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'
      ? 'Start with Case Studies for work evidence, Proof for publications, and Contact for next steps. If you want depth, open the main website.'
      : 'I am AI-enabled: ask me questions, or use me to navigate. Start with About for the human story, Projects for work evidence, Publications for research proof, or Recruiter Mode for the fastest professional overview.'});
    render();
    return;
  }

  if(/^(about|open about|go to about|about page)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening About.'});
    render();
    doAction({type:'navigate',data:'about.html'});
    return;
  }

  if(/^(projects|open projects|go to projects|project page)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening Projects.'});
    render();
    doAction({type:'navigate',data:'projects.html'});
    return;
  }

  if(/^(publications|papers|open publications|go to papers|publication page)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening Publications.'});
    render();
    doAction({type:'navigate',data:'papers.html'});
    return;
  }

  if(/^(experience|open experience|go to experience)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening Experience.'});
    render();
    doAction({type:'navigate',data:'experience.html'});
    return;
  }

  if(/^(education|open education|go to education)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening Education.'});
    render();
    doAction({type:'navigate',data:'education.html'});
    return;
  }

  if(/^(contact|open contact|go to contact|reach out)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'?'Sai can be reached by email, LinkedIn, or GitHub. I will show the contact links.':'You can reach Sensei Sai by email, LinkedIn, or GitHub. I will show the contact links.'});
    render();
    doAction({type:'contact'});
    return;
  }

  if(/issue|bug|report/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Please describe the issue below. I will record it locally for Sai to review.'});
    render();
    doAction({type:'report'});
    return;
  }


  if(kageRecruiterOffered && yes){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening Recruiter Mode.'});
    render();
    kageRecruiterOffered=false;
    doAction({type:'navigate',data:'recruiter.html'});
    return;
  }

  if(kagePageOffered && yes){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'?'Opening the Kage page.':'Then follow the shadow. I will open my hidden page.'});
    render();
    kagePageOffered=false;
    doAction({type:'navigate',data:'kage.html'});
    return;
  }

  if(/(open|show|take me to|visit|go to).*(recruiter|recruiter mode|professional view|3-minute|3 minute|cv view)/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening Recruiter Mode.'});
    render();
    doAction({type:'navigate',data:'recruiter.html'});
    return;
  }


  if(/(30|thirty).*(second|sec).*pitch|professional pitch|quick pitch/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'
      ? 'Sai is a Medical Imaging PhD candidate who combines imaging validation, simulation, 3D printing, medical-device thinking, and research translation. His strongest signal is that he does not only analyze problems; he builds validation workflows, publishes the evidence, and communicates it clearly to technical and stakeholder audiences.'
      : 'Sensei Sai works where medical imaging, devices, simulation, and 3D printing meet real-world validation. His edge is simple: he can frame the question, build the method, test the result, and explain why it matters.'});
    render();
    return;
  }

  if(/best fit|what roles|opportunities|hire|suited for|fit for/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'
      ? 'Sai is best suited for medical imaging, medtech R&D, medical-device validation, life-sciences strategy, translational research, and healthcare/deep-tech roles. The evidence is his mix of imaging research, 3D-printed validation tools, simulation work, startup exposure, tech-transfer experience, and publications.'
      : 'Sensei Sai fits best where research has to become something usable: medtech R&D, imaging validation, healthcare ventures, life-sciences strategy, and translational deep-tech. The proof is in his projects, papers, and startup/tech-transfer path.'});
    render();
    return;
  }

  if(/explain.*project|key project|case stud|3dynapet|cassoulet|mupet|hepta/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'
      ? 'The strongest project arc is: 3DynaPET creates physical ground truth for imaging/device validation; CASSOULET and MuPET explore synthetic ground truth for explainable AI and algorithm testing; Hepta shows translation by turning model outputs into stakeholder-facing visual tools.'
      : 'The project path is a blade with three edges: 3DynaPET for physical validation, CASSOULET/MuPET for synthetic ground truth and explainable AI, and Hepta for turning technical models into usable medtech communication.'});
    render();
    return;
  }

  if(/publication|paper|preprint|poster|proof|research output/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'
      ? 'Sai’s publications prove a complete work cycle: define a validation problem, build the method, test it, and communicate it. The body of work spans 3D-printed PET/CT validation, synthetic PET data, quantitative ground truth, conference presentation, and biomechanical flow modelling.'
      : 'Sensei Sai’s papers are not just academic marks; they show a pattern: problem framing, model building, validation, and communication. The trail runs through imaging phantoms, synthetic data, ground truth, conference work, and biomechanics.'});
    render();
    return;
  }


  if(page==='recruiter.html' && /^(kage|who are you|what are you|tell me about kage|tell me about yourself|who is kage)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'I am the site assistant for Sai’s Recruiter Mode. I can help summarize his fit, explain the case studies, point you to publications, or help you find the CV and contact links.'});
    render();
    return;
  }

  if(/(open|show|take me to|visit|go to).*(kage|hidden page|your page)/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:page==='recruiter.html'?'Opening the Kage page.':'The shadow door opens.'});
    render();
    doAction({type:'navigate',data:'kage.html'});
    return;
  }

  if(/^(kage|who are you|what are you|tell me about kage|tell me about yourself|who is kage)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({
      role:'assistant',
      content:'I am Kage, the shadow guide of Sensei Sai’s website — a small ronin forged from code, crimson eyes, and a stubborn sense of direction. I guard the paths between his research, projects, stories, and contact scrolls. Would you like to visit my hidden page?'
    });
    kagePageOffered=true;
    render();
    return;
  }

  hist.push({role:'user',content:text});
  typing=true;
  render();

  try{
    var r=await fetch(PROXY_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({system:buildSys(),messages:hist.slice(-16)})
    });

    var d=await r.json();

    if(d.error){
      hist.push({role:'assistant',content:page==='recruiter.html'?'I could not complete that request. Please try again.':'The path is unclear. Try again.'});
    }else{
      var reply=d.text||'...';

      if(/would you like to visit my hidden page/i.test(reply)){
        kagePageOffered=true;
      }
      if(/would you like me to open recruiter mode/i.test(reply)){
        kageRecruiterOffered=true;
      }

      hist.push({role:'assistant',content:reply});

      if(d.action){
        if(d.action.type==='navigate'&&d.action.data==='kage.html'){
          kagePageOffered=false;
        }
        if(d.action.type==='navigate'&&d.action.data==='recruiter.html'){
          kageRecruiterOffered=false;
        }
        doAction(d.action);
      }
    }
  }catch(e){
    hist.push({role:'assistant',content:page==='recruiter.html'?'Connection issue. Please try again.':'The shadow wavers... Try again.'});
  }

  typing=false;
  render();
}

function doAction(a){
  if(a.type==='navigate'&&a.data&&PAGE_CTX[a.data]){
    hist.push({role:'assistant',content:'→ Go to '+PAGE_CTX[a.data]+': '+a.data});

    var lnk=document.createElement('div');
    lnk.className='kp-msg kage';
    lnk.style.cursor='pointer';
    lnk.style.borderColor='rgba(139,26,26,.4)';
    lnk.textContent='➜ Take me to '+PAGE_CTX[a.data];

    lnk.addEventListener('click',function(){
      window.location.href=a.data;
    });

    var box=document.getElementById('kMsgs');
    if(box){
      box.appendChild(lnk);
      box.scrollTop=box.scrollHeight;
    }
  }

  if(a.type==='contact'){
    var c=document.getElementById('kCon');
    if(c)c.classList.add('show');
  }

  if(a.type==='report'){
    var r=document.getElementById('kRep');
    if(r)r.classList.add('show');
  }
}

function render(){
  var c=document.getElementById('kMsgs');
  if(!c)return;

  c.innerHTML='';

  hist.forEach(function(m){
    var d=document.createElement('div');
    d.className='kp-msg '+(m.role==='user'?'user':'kage');
    d.textContent=m.content;
    c.appendChild(d);
  });

  if(typing){
    var t=document.createElement('div');
    t.className='kp-typing';
    t.textContent='Kage is thinking';
    c.appendChild(t);
  }

  c.scrollTop=c.scrollHeight;
}

function welcome(){
  if(curPage()==='recruiter.html'){
    var t=vc>1
      ?'Welcome back. I can help you review Sai’s case studies, publications, CV, availability, or contact options.'
      :'Hello. I am an AI-enabled professional assistant. Ask me for Sai’s 30-second pitch, strongest role fit, project evidence, publications summary, CV, or contact details.';
    hist.push({role:'assistant',content:t});
    render();
    return;
  }

  var tod=timeOfDay();
  var g=tod==='morning'
    ?'The sun rises.'
    :tod==='evening'
      ?'Dusk falls.'
      :tod==='night'||tod==='deep night'
        ?'The night deepens.'
        :'The day is bright.';

  var t=vc>1
    ? g+' You return. I am AI-enabled — ask me about Sensei Sai’s fit, projects, publications, research, or the best path through this website.'
    : g+' I am Kage — an AI-enabled assistant. Ask me about Sensei Sai’s work, projects, publications, role fit, or research story. I can answer first, then guide you if a page helps.';

  hist.push({role:'assistant',content:t});
  render();
}

function css(){
  var s=document.createElement('style');

  s.textContent='\
.kage-wrap{position:fixed;bottom:4px;right:4px;z-index:900;opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s;pointer-events:none}\
.kage-wrap.visible{opacity:1;transform:translateY(0);pointer-events:auto}\
.kage-stage{width:92px;height:128px;cursor:pointer;overflow:visible}\
.kage-stage canvas{display:block}\
.kp{position:absolute;bottom:0;right:100px;width:310px;max-height:470px;border:1px solid rgba(139,26,26,.2);background:rgba(10,10,11,.96);backdrop-filter:blur(16px);display:flex;flex-direction:column;opacity:0;visibility:hidden;transform:translateX(12px) scale(.96);transform-origin:bottom right;transition:all .3s;pointer-events:none;overflow:hidden}\
.kp.open{opacity:1;visibility:visible;transform:translateX(0) scale(1);pointer-events:auto}\
.kp-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 8px;border-bottom:1px solid rgba(240,235,227,.06);flex-shrink:0}\
.kp-note{padding:8px 12px;border-bottom:1px solid rgba(240,235,227,.045);font-size:10px;line-height:1.45;color:#8f8880;background:rgba(240,235,227,.025)}\
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
html[data-theme="light"] .kp-note{color:#5d5650!important;background:rgba(26,26,28,.025)!important;border-bottom-color:rgba(26,26,28,.08)!important}\
@media(max-width:600px){.kage-stage{width:76px;height:106px}.kp{width:260px;right:84px;max-height:380px}}\
';

  document.head.appendChild(s);
}

function dom(){
  var recruiterMode=curPage()==='recruiter.html';

  var mainActions=
      '<button class="kp-act" data-q="Open Recruiter Mode.">Recruiter</button>'+
      '<button class="kp-act" data-q="Help me navigate the website.">Visitor</button>'+
      '<button class="kp-act" data-q="Tell me about Sai">About Sai</button>'+
      '<button class="kp-act" data-q="Tell me about Kage">Kage</button>'+
      '<button class="kp-act" data-q="How can I contact Sai?">Contact</button>'+
      '<button class="kp-act" data-q="I found an issue on this page">Report</button>';

  var recruiterActions=
      '<button class="kp-act" data-q="Give me a 30-second professional pitch about Sai.">30-sec Pitch</button>'+
      '<button class="kp-act" data-q="What roles or opportunities is Sai best suited for, and why?">Best Fit</button>'+
      '<button class="kp-act" data-q="Explain Sai’s key projects like case studies, not a list.">Projects</button>'+
      '<button class="kp-act" data-q="Summarize Sai’s publications and what they prove.">Publications</button>'+
      '<button class="kp-act" data-q="Open Recruiter Mode.">Recruiter Mode</button>'+
      '<button class="kp-act" data-q="How can I contact Sai?">Contact</button>';

  var actionButtons=recruiterMode?recruiterActions:mainActions;
  var inputPlaceholder=recruiterMode
    ? 'Ask Kage about Sai, projects, fit, publications...'
    : 'Ask Kage anything...';

  var assistantNote=recruiterMode
    ? 'AI-enabled professional assistant. Ask for fit, projects, publications, CV, or contact details.'
    : 'AI-enabled assistant. Ask about Sai’s work, use it to navigate, or discuss projects and publications.';

  var w=document.createElement('div');
  w.className='kage-wrap';
  w.id='kageWrap';

  var p=document.createElement('div');
  p.className='kp';
  p.id='kPanel';

  p.innerHTML=
    '<div class="kp-hd">'+
      '<div class="kp-id"><b>影</b><span>'+(recruiterMode?'Ask Kage':'Kage')+'</span></div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<div class="kp-st">Active</div>'+
        '<button class="kp-x" id="kX">✕</button>'+
      '</div>'+
    '</div>'+
    '<div class="kp-note">'+assistantNote+'</div>'+
    '<div class="kp-msgs" id="kMsgs"></div>'+
    '<div class="kp-acts" id="kActs">'+
      actionButtons+
    '</div>'+
    '<div class="kp-con" id="kCon">'+
      '<a href="mailto:'+P.email+'">✉ '+P.email+'</a>'+
      '<a href="'+P.linkedin+'" target="_blank">🔗 LinkedIn</a>'+
      '<a href="'+P.github+'" target="_blank">💻 GitHub</a>'+
    '</div>'+
    '<div class="kp-rep" id="kRep">'+
      '<input id="kRepIn" placeholder="Describe the issue...">'+
      '<button id="kRepS">Send</button>'+
    '</div>'+
    '<div class="kp-iw">'+
      '<input class="kp-in" id="kIn" placeholder="'+inputPlaceholder+'" autocomplete="off">'+
      '<button class="kp-snd" id="kSnd">➜</button>'+
    '</div>';

  var st=document.createElement('div');
  st.className='kage-stage';
  st.id='kageStage';

  w.appendChild(p);
  w.appendChild(st);
  document.body.appendChild(w);

  return{w:w,p:p,st:st};
}

function bind(d){
  d.st.addEventListener('click',function(e){
    e.stopPropagation();
    isOpen=!isOpen;
    d.p.classList.toggle('open',isOpen);

    if(isOpen&&hist.length===0)welcome();

    if(isOpen){
      setTimeout(function(){
        var input=document.getElementById('kIn');
        if(input)input.focus();
      },300);
    }
  });

  document.getElementById('kX').addEventListener('click',function(e){
    e.stopPropagation();
    isOpen=false;
    d.p.classList.remove('open');
  });

  function doSend(){
    var i=document.getElementById('kIn');
    var t=i.value.trim();

    if(!t||typing)return;

    i.value='';

    var c=document.getElementById('kCon');
    var r=document.getElementById('kRep');

    if(c)c.classList.remove('show');
    if(r)r.classList.remove('show');

    send(t);
  }

  document.getElementById('kSnd').addEventListener('click',doSend);

  document.getElementById('kIn').addEventListener('keydown',function(e){
    if(e.key==='Enter')doSend();
  });

  document.getElementById('kActs').addEventListener('click',function(e){
    var b=e.target.closest('.kp-act');
    if(b&&b.dataset.q&&!typing)send(b.dataset.q);
  });

  document.getElementById('kRepS').addEventListener('click',function(){
    var i=document.getElementById('kRepIn');
    var t=i.value.trim();

    if(!t)return;

    var rr=JSON.parse(localStorage.getItem('kage-reps')||'[]');
    rr.push({text:t,page:curPage(),time:new Date().toISOString()});
    localStorage.setItem('kage-reps',JSON.stringify(rr));

    i.value='';
    document.getElementById('kRep').classList.remove('show');

    hist.push({role:'assistant',content:'Noted. The issue has been recorded. Sensei Sai will review it.'});
    render();
  });

  document.addEventListener('click',function(e){
    if(isOpen&&!d.w.contains(e.target)){
      isOpen=false;
      d.p.classList.remove('open');
    }
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&isOpen){
      isOpen=false;
      d.p.classList.remove('open');
    }
  });
}

function build3D(el){
  var W=92,H=128;

  var rnd=new THREE.WebGLRenderer({antialias:true,alpha:true});
  rnd.setSize(W,H);
  rnd.setPixelRatio(Math.min(window.devicePixelRatio,2));
  el.appendChild(rnd.domElement);

  var sc=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(28,W/H,.1,50);

  cam.position.set(0,1.05,6.4);
  cam.lookAt(new THREE.Vector3(0,.95,0));

  sc.add(new THREE.AmbientLight(0x888888,.9));

  var dl=new THREE.DirectionalLight(0xfff5e8,1.15);
  dl.position.set(4,7,5);
  sc.add(dl);

  var rl=new THREE.DirectionalLight(0x8b1a1a,.32);
  rl.position.set(-3,2,-2);
  sc.add(rl);

  var fl=new THREE.PointLight(0xffe8cc,.35,6);
  fl.position.set(0,2.3,3);
  sc.add(fl);

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

  function bx(x,y,z,m,px,py,pz,p){
    var o=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),m);
    o.position.set(px||0,py||0,pz||0);
    (p||sc).add(o);
    return o;
  }

  var kg=new THREE.Group();

  var hd=new THREE.Group();
  hd.position.set(0,2.08,0);

  bx(.42,.4,.38,mSk,0,0,0,hd);
  bx(.3,.11,.26,mSk,0,-.23,.02,hd);
  bx(.06,.13,.26,mSD,-.17,-.17,.02,hd);
  bx(.06,.13,.26,mSD,.17,-.17,.02,hd);

  var eL=bx(.09,.04,.02,mE.clone(),-.1,.04,.2,hd);
  var eR=bx(.09,.04,.02,mE.clone(),.1,.04,.2,hd);

  var brL=bx(.12,.025,.03,mBr,-.1,.1,.19,hd);
  brL.rotation.z=.1;

  var brR=bx(.12,.025,.03,mBr,.1,.1,.19,hd);
  brR.rotation.z=-.1;

  var mouth=bx(.12,.025,.025,mR,0,-.09,.205,hd);

  var hat=new THREE.Group();

  var mHatCone=new THREE.MeshLambertMaterial({
    color:0xd8b866,
    flatShading:true
  });

  var mHatBrim=new THREE.MeshLambertMaterial({
    color:0xb89852,
    flatShading:true
  });

  var mHatUnder=new THREE.MeshLambertMaterial({
    color:0x241a10,
    flatShading:true
  });

  var ks=new THREE.Mesh(
    new THREE.ConeGeometry(.82,.42,48),
    mHatCone
  );
  ks.position.y=.48;
  ks.rotation.y=Math.PI/4;
  hat.add(ks);

  var kb=new THREE.Mesh(
    new THREE.CylinderGeometry(.88,.96,.026,56),
    mHatBrim
  );
  kb.position.y=.255;
  hat.add(kb);

  var ku=new THREE.Mesh(
    new THREE.CylinderGeometry(.76,.88,.014,56),
    mHatUnder
  );
  ku.position.y=.232;
  hat.add(ku);

  var kt2=new THREE.Mesh(
    new THREE.ConeGeometry(.045,.085,18),
    mR
  );
  kt2.position.y=.735;
  kt2.rotation.y=Math.PI/4;
  hat.add(kt2);

  hat.rotation.x=-.02;

  hd.add(hat);
  kg.add(hd);

  var ts=new THREE.Group();
  ts.position.set(0,1.45,0);

  bx(.48,.62,.28,mB,0,0,0,ts);

  var sh=bx(.055,.66,.29,mR,.04,0,.003,ts);
  sh.rotation.z=-.35;

  var kn=bx(.07,.07,.04,mS,-.14,-.12,.15,ts);
  kn.rotation.z=Math.PI/4;

  var sd=bx(.18,.05,.26,mR,-.28,.26,0,ts);
  sd.rotation.z=.18;

  kg.add(ts);

  var cL=bx(.03,.5,.2,mC,-.25,1.25,.03,kg);
  var cR=bx(.03,.5,.2,mC,.25,1.25,.03,kg);

  bx(.14,.28,.03,mC,-.15,.98,-.14,kg);
  bx(.14,.28,.03,mC,.15,.98,-.14,kg);

  var aL=new THREE.Group();
  aL.position.set(-.32,1.32,0);
  bx(.12,.26,.12,mB,0,0,0,aL);
  bx(.1,.22,.1,mC,0,-.24,0,aL);
  bx(.08,.08,.08,mSk,0,-.38,0,aL);
  kg.add(aL);

  var aR=new THREE.Group();
  aR.position.set(.32,1.32,0);
  bx(.12,.26,.12,mB,0,0,0,aR);
  bx(.1,.22,.1,mC,0,-.24,0,aR);
  bx(.08,.08,.08,mSk,0,-.38,0,aR);
  kg.add(aR);

  var hk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.33,.68,4),mC);
  hk.position.set(0,.66,0);
  hk.rotation.y=Math.PI/4;
  kg.add(hk);

  bx(.5,.07,.3,mA,0,1.02,0,kg);
  bx(.1,.04,.16,mC,-.11,.02,.02,kg);
  bx(.1,.04,.16,mC,.11,.02,.02,kg);

  var kt=new THREE.Group();

  bx(.022,.82,.01,mBl,0,0,0,kt);

  var bg2=bx(
    .03,.82,.003,
    new THREE.MeshBasicMaterial({
      color:0xf5f0e8,
      transparent:true,
      opacity:.12
    }),
    0,0,.008,kt
  );

  var tb=bx(.09,.01,.09,mS,0,.42,0,kt);
  tb.rotation.y=Math.PI/4;

  bx(.03,.18,.03,mR,0,.52,0,kt);
  bx(.035,.02,.035,mS,0,.62,0,kt);

  kt.position.set(.1,1.55,-.18);
  kt.rotation.set(.1,0,-.45);
  kg.add(kt);

  var kBk={px:.1,py:1.55,pz:-.18,rx:.1,ry:0,rz:-.45};
  var kRd={px:.44,py:1,pz:.12,rx:-.25,ry:0,rz:.75};

  var base=new THREE.Mesh(
    new THREE.CylinderGeometry(.38,.42,.035,8),
    new THREE.MeshLambertMaterial({color:0x0e0e10,flatShading:true})
  );
  base.position.y=-.018;
  sc.add(base);

  var rg=new THREE.Mesh(
    new THREE.RingGeometry(.36,.42,8),
    new THREE.MeshBasicMaterial({
      color:0x8b1a1a,
      side:THREE.DoubleSide,
      transparent:true,
      opacity:.18
    })
  );
  rg.rotation.x=-Math.PI/2;
  rg.position.y=.002;
  sc.add(rg);

  var PC=8;
  var pG=new THREE.BufferGeometry();
  var pA=new Float32Array(PC*3);
  var pV=[];

  for(var i=0;i<PC;i++){
    pA[i*3]=(Math.random()-.5)*.7;
    pA[i*3+1]=Math.random()*2;
    pA[i*3+2]=(Math.random()-.5)*.7;
    pV.push(.002+Math.random()*.004);
  }

  pG.setAttribute('position',new THREE.BufferAttribute(pA,3));

  var pts=new THREE.Points(
    pG,
    new THREE.PointsMaterial({
      color:0xc23b3b,
      size:.02,
      transparent:true,
      opacity:.25
    })
  );

  sc.add(pts);

  kg.rotation.y=.35;
  kg.scale.set(.78,.78,.78);
  kg.position.y=-.18;

  sc.add(kg);

  var t=0,hov=false,tR=.35,cR2=.35,kL=0;

  function lp(a,b,f){
    return a+(b-a)*f;
  }

  function anim(){
    requestAnimationFrame(anim);
    t+=.016;

    ts.scale.y=1+Math.sin(t*1.4)*.01;
    hd.position.y=2.08+Math.sin(t*1.4)*.003;

    var sw=hov?tR:.35+Math.sin(t*.4)*.06;
    cR2+=(sw-cR2)*.04;
    kg.rotation.y=cR2;

    cL.rotation.x=Math.sin(t*1.8)*.025;
    cR.rotation.x=Math.sin(t*1.8+.8)*.025;

    aL.rotation.x=Math.sin(t*.8)*.02;
    aR.rotation.x=hov?-.3:Math.sin(t*.8+Math.PI)*.02;

    var ei=hov?1:.5+Math.sin(t*2.2)*.35;
    var ec=new THREE.Color(ei*.86,ei*.27,ei*.27);
    eL.material.color.copy(ec);
    eR.material.color.copy(ec);

    if(isOpen){
      mouth.scale.x=1.25+Math.sin(t*8)*.25;
      mouth.scale.y=1.1+Math.sin(t*8)*.2;
    }else{
      mouth.scale.x=1;
      mouth.scale.y=1;
    }

    var kk=hov||isOpen?1:0;
    kL+=(kk-kL)*.06;

    kt.position.set(
      lp(kBk.px,kRd.px,kL),
      lp(kBk.py,kRd.py,kL),
      lp(kBk.pz,kRd.pz,kL)
    );

    kt.rotation.set(
      lp(kBk.rx,kRd.rx,kL),
      lp(kBk.ry,kRd.ry,kL),
      lp(kBk.rz,kRd.rz,kL)
    );

    hd.rotation.x=hov||isOpen?.12:Math.sin(t*.6)*.015;
    rg.rotation.z+=.003;
    bg2.material.opacity=.08+Math.sin(t*1.5)*.05;

    var pp=pts.geometry.attributes.position.array;

    for(var j=0;j<PC;j++){
      pp[j*3+1]+=pV[j];

      if(pp[j*3+1]>2.2){
        pp[j*3+1]=0;
        pp[j*3]=(Math.random()-.5)*.6;
        pp[j*3+2]=(Math.random()-.5)*.6;
      }
    }

    pts.geometry.attributes.position.needsUpdate=true;

    fl.intensity=hov||isOpen?.5:.35;

    rnd.render(sc,cam);
  }

  anim();

  el.addEventListener('mouseenter',function(){
    hov=true;
  });

  el.addEventListener('mouseleave',function(){
    hov=false;
    tR=.35;
  });

  el.addEventListener('mousemove',function(e){
    if(!hov)return;

    var r=el.getBoundingClientRect();
    tR=.35+((e.clientX-r.left)/r.width-.5)*.5;
  });

  el.addEventListener('touchstart',function(){
    hov=true;
  },{passive:true});

  el.addEventListener('touchend',function(){
    setTimeout(function(){
      hov=false;
      tR=.35;
    },1500);
  },{passive:true});

  setInterval(function(){
    var a=document.getElementById('ac2');
    var w=document.getElementById('kageWrap');

    if(w)w.style.display=(a&&a.classList.contains('open'))?'none':'';
  },500);
}

function init(){
  if(typeof THREE==='undefined'){
    setTimeout(init,100);
    return;
  }

  try{
    vc=visits();

    css();

    var d=dom();

    bind(d);
    build3D(d.st);

    setTimeout(function(){
      d.w.classList.add('visible');
    },2000);

    if(!sessionStorage.getItem('kage-auto-opened-session')){
      sessionStorage.setItem('kage-auto-opened-session','1');

      setTimeout(function(){
        isOpen=true;
        d.p.classList.add('open');

        if(hist.length===0)welcome();
      },3500);
    }

    console.log('Kage v11 loaded — AI notice and reliable navigation enabled');
  }catch(e){
    console.error('Kage:',e);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}
})();

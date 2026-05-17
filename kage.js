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

function saveSessionProfile(){sessionStorage.setItem('kage-session-profile',JSON.stringify(sessionProfile));}
function rememberFromText(text){
  var t=(text||'').toLowerCase();
  if(/recruiter|hiring|talent|hr|manager/.test(t))sessionProfile.visitorType='recruiter';
  if(/student|phd|researcher|collaborator|founder|investor|vc|consultant/.test(t))sessionProfile.visitorType=sessionProfile.visitorType||RegExp.lastMatch;
  var m=t.match(/(?:for|hiring for|role in|interested in|looking for)\s+([a-z0-9 +\-/]{3,50})/i);
  if(m)sessionProfile.role=m[1].replace(/[?.!,]+$/,'');
  if(/medtech|strategy|product|research|imaging|ai|startup|venture|consulting|biomechanics/.test(t)){
    sessionProfile.topic=(t.match(/medtech|strategy|product|research|imaging|ai|startup|venture|consulting|biomechanics/)||[''])[0];
  }
  saveSessionProfile();
}
function pageHint(){
  var p=curPage();
  if(p==='index.html')return 'Choose Recruiter Mode for the fast professional path, or continue into the creative portfolio.';
  if(p==='about.html')return 'On this page I can give the personal story, a recruiter summary, or a short bio.';
  if(p==='experience.html')return 'On this page I can explain career progression, role fit, or translate the timeline into interview evidence.';
  if(p==='education.html')return 'On this page I can summarize the training path and why it fits medtech, research, or strategy roles.';
  if(p==='projects.html')return 'On this page I can turn projects into case studies: problem, method, result, and recruiter proof.';
  if(p==='papers.html')return 'On this page I can summarize publications by topic, evidence, or practical relevance.';
  if(p==='contact.html')return 'On this page I can help draft an outreach message or point to email, LinkedIn, and GitHub.';
  if(p==='recruiter.html')return 'On this page I can create a role-specific profile, summarize case studies, or help contact Sai.';
  if(p==='kage.html')return 'On this page I can explain my expressions, modes, and hidden site commands.';
  if(p==='story.html')return 'On this page I can introduce the fiction preview and creative side.';
  return 'I can help you navigate this page.';
}
function recruiterPacket(role){
  role=(role||sessionProfile.role||sessionProfile.topic||'medtech, life-sciences strategy, research, or product roles');
  return 'Recruiter packet for '+role+':\n\nPitch: Sai is a Medical Imaging Researcher & PhD Candidate who connects quantitative imaging validation, simulation, 3D-printed phantoms, and clinical-facing communication.\n\nEvidence: 3DynaPET, CASSOULET, MuPET, Hepta Medical visualization, TEVAR simulation, and 6 publication outputs.\n\nBest fit: medtech strategy, life-sciences consulting, imaging AI/product, clinical innovation, deep-tech venture, or translational R&D.\n\nAvailability: September 2026. Locations: Paris, London, Amsterdam, Berlin.';
}
function beginTour(){
  sessionProfile.tourStep=1; saveSessionProfile();
  return 'Ronin path started. Step 1: open Recruiter Mode for the fastest professional overview. Then continue to Projects, Publications, and Contact. Shall I open Recruiter Mode?';
}
function tourNext(){
  var pages=['recruiter.html','projects.html','papers.html','contact.html'];
  sessionProfile.tourStep=(sessionProfile.tourStep||0)+1; saveSessionProfile();
  return pages[Math.min(sessionProfile.tourStep-1,pages.length-1)];
}

var hist=[],typing=false,isOpen=false,vc=0,kagePageOffered=false,kageRecruiterOffered=false;
var sessionProfile={visitorType:null,role:null,topic:null,tourStep:0};

function buildSys(){
  var page=curPage();
  var sys=SYS.replace('{PAGE}',page).replace('{TIME}',timeOfDay()).replace('{VISIT}',String(vc));

  var sp=JSON.parse(sessionStorage.getItem('kage-session-profile')||'{}');
  if(sp.visitorType||sp.role||sp.topic){
    sys+='\n\nSESSION CONTEXT:';
    if(sp.visitorType)sys+='\n- Visitor type: '+sp.visitorType;
    if(sp.role)sys+='\n- Visitor role/goal: '+sp.role;
    if(sp.topic)sys+='\n- Current interest: '+sp.topic;
    sys+='\n- Use this only within this browser session; do not claim long-term memory.';
  }
  sys+='\n\nPAGE-AWARE HELP:';
  sys+='\n- On Home, help the visitor choose Recruiter Mode or the creative portfolio.';
  sys+='\n- On About, offer personal story vs professional summary.';
  sys+='\n- On Projects, offer clinical impact, technical details, or case studies.';
  sys+='\n- On Publications, summarize by topic, evidence, or recruiter proof.';
  sys+='\n- On Contact, help compose outreach or find links.';
  sys+='\n- On Kage, explain expressions, ask-kage mode, and site guidance.';

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
  rememberFromText(text);
  setKageBotState(kageIntentState(text));
  var clean=text.trim().toLowerCase();
  var page=curPage();
  var yes=/^(yes|yeah|yep|sure|ok|okay|open it|show me|take me|visit|go ahead|lead me)$/i.test(clean);


  if(/^(3-minute profile|3 minute profile|30-sec pitch|30 second pitch|quick profile|professional pitch)$/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Sai is a Medical Imaging Researcher & PhD Candidate focused on quantitative PET/CT validation, 3D-printed phantoms, simulation, and translational medtech work. He is strongest where research evidence, clinical imaging, technical depth, and strategy communication meet. For proof, open Recruiter Mode, Projects, or Publications.'});
    render(); return;
  }

  if(/^(best fit|best-fit roles|role fit|fit|what roles)$/i.test(clean) || /best.*role|suited.*role/.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Best-fit paths: medtech or life-sciences strategy, imaging AI/product, translational R&D, clinical innovation, deep-tech venture roles, and research-facing consulting. The proof is his blend of PET/CT validation, simulation, 3D printing, publications, and stakeholder-facing visualization work.'});
    render(); return;
  }

  if(/recruiter packet|targeted profile|smart cv|role-specific|role specific|generate.*fit/.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:recruiterPacket(text)});
    render(); return;
  }

  if(/page help|help on this page|what can you do here|guide this page/.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:pageHint()});
    render(); return;
  }

  if(/site tour|walk me through|tour mode|ronin path/.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:beginTour()});
    kageRecruiterOffered=true;
    render(); return;
  }

  if(/next step|continue tour|next in tour/.test(clean)){
    var next=tourNext();
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening the next path: '+PAGE_CTX[next]+'.'});
    render(); doAction({type:'navigate',data:next}); return;
  }

  if(/shadow sense/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Shadow Sense: Sai’s site has two paths. Recruiters should start with Recruiter Mode, then Projects and Publications for proof. Curious visitors can follow About, Story, and Kage for the human and creative side.'});
    setKageBotState('shadow'); render(); return;
  }

  if(/draw blade|serious mode|professional mode/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Blade drawn. Opening the serious professional path: Recruiter Mode.'});
    setKageBotState('drawn'); render(); doAction({type:'navigate',data:'recruiter.html'}); return;
  }

  if(/^meditate$|meditation summary|calm summary/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Meditation: Sai’s path moves from mechanical engineering to biomedical engineering, then medical imaging research. The through-line is validation — building trustworthy bridges between simulation, physical phantoms, clinical imaging, and decisions.'});
    setKageBotState('meditating'); render(); return;
  }

  if(/unlock story|story page|creative side/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Opening the story shelf — the creative path beyond research.'});
    render(); doAction({type:'navigate',data:'story.html'}); return;
  }

  if(/thank|thanks/i.test(clean)){
    hist.push({role:'user',content:text});
    hist.push({role:'assistant',content:'Always. I bow, then return to the watch.'});
    setKageBotState('bow'); render(); setTimeout(function(){setKageBotState(kageTimeState());},2200); return;
  }

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
  setKageBotState('thinking');
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
      setKageBotState('speaking');

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
    setKageBotState('error');
  }

  typing=false;
  render();
  setTimeout(function(){ if(!typing) setKageBotState(isOpen?'listening':kageTimeState()); }, 2600);
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
  if(window.__kageBot3D && !typing){ setKageBotState(window.__kageBotState || kageTimeState()); }
  var c=document.getElementById('kMsgs');
  if(!c)return;

  c.innerHTML='';

  hist.forEach(function(m){
    var d=document.createElement('div');
    d.className='kp-msg '+(m.role==='user'?'user':'kage');
    if(m.role!=='user' && m.role!=='system'){
      var row=document.createElement('div'); row.className='kp-row kage-row';
      var av=document.createElement('div'); av.className='kp-mini'; var cv=document.createElement('canvas'); av.appendChild(cv);
      var bubble=document.createElement('div'); bubble.className=d.className; bubble.textContent=m.content;
      row.appendChild(av); row.appendChild(bubble); c.appendChild(row);
      setTimeout(function(canvas,state){ return function(){ if(window.KageV43&&window.KageV43.create){ var inst=window.KageV43.create(canvas,{mini:true}); inst.setState(state||'guardian'); } }; }(cv, window.__kageBotState||kageTimeState()),0);
    }else{
      d.textContent=m.content; c.appendChild(d);
    }
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
    ? g+' You return. '+pageHint()+' Ask me about Sensei Sai’s fit, projects, publications, research, or the best path through this website.'
    : g+' I am Kage — an AI-enabled assistant. '+pageHint()+' I can answer first, then guide you if a page helps.';

  hist.push({role:'assistant',content:t});
  render();
}

function css(){
  var s=document.createElement('style');

  s.textContent='\
.kage-wrap{position:fixed;bottom:18px;right:18px;left:auto;z-index:900;opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s;pointer-events:none}\
.kage-wrap.visible{opacity:1;transform:translateY(0);pointer-events:auto}\
.kage-stage{width:112px;height:150px;cursor:pointer;overflow:visible;filter:drop-shadow(0 18px 34px rgba(0,0,0,.42));position:relative;z-index:2}\
.kage-stage canvas,.kage-stage-canvas{display:block;width:100%!important;height:100%!important}\
.kage-stage{background:radial-gradient(circle at 50% 70%,rgba(139,26,26,.18),transparent 62%);border-radius:22px}\
.kage-stage::after{content:"";position:absolute;left:18px;right:18px;bottom:7px;height:12px;border:1px solid rgba(139,26,26,.22);transform:rotate(45deg);background:rgba(139,26,26,.04);z-index:-1}\
.kp-head-avatar{width:54px;height:66px;flex:0 0 54px;margin:-18px 0 -18px -6px;position:relative;filter:drop-shadow(0 12px 18px rgba(0,0,0,.35))}\
.kp-head-avatar canvas{display:block;width:100%!important;height:100%!important}\
.kp-row{display:flex;align-items:flex-end;gap:8px;max-width:98%;align-self:flex-start;animation:mIn .25s ease}\
.kp-row .kp-msg{margin:0;max-width:calc(100% - 72px)}\
.kp-mini{width:64px;height:78px;flex:0 0 64px;position:relative;filter:drop-shadow(0 12px 16px rgba(0,0,0,.28))}\
.kp-mini canvas{display:block;width:100%!important;height:100%!important}\
.kp{position:absolute;bottom:0;right:124px;left:auto;width:390px;max-height:560px;border:1px solid rgba(139,26,26,.28);background:linear-gradient(180deg,rgba(14,13,15,.98),rgba(8,8,10,.98));backdrop-filter:blur(18px);display:flex;flex-direction:column;opacity:0;visibility:hidden;transform:translateX(-14px) scale(.97);transform-origin:bottom right;transition:all .28s ease;pointer-events:none;overflow:hidden;border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.52),0 0 0 1px rgba(240,235,227,.025) inset}\
.recruiter-kage .kp{width:430px;max-height:620px}\
.kp.open{opacity:1;visibility:visible;transform:translateX(0) scale(1);pointer-events:auto}\
.kp-hd{display:flex;align-items:center;justify-content:space-between;padding:13px 15px 10px;border-bottom:1px solid rgba(240,235,227,.07);flex-shrink:0;background:linear-gradient(90deg,rgba(139,26,26,.12),transparent 65%)}\
.kp-id{display:flex;align-items:center;gap:9px}.kp-id b{font-family:serif;font-size:1.25rem;color:rgba(194,59,59,.52);line-height:1}.kp-id span{font-family:serif;font-size:.95rem;color:#f0ebe3;letter-spacing:.01em}\
.kp-st{font-family:monospace;font-size:8px;text-transform:uppercase;letter-spacing:1.4px;color:#c23b3b;display:flex;align-items:center;gap:5px}\
.kp-st::before{content:"";width:5px;height:5px;background:#c23b3b;border-radius:50%;box-shadow:0 0 12px rgba(194,59,59,.65);animation:kPulse 2s infinite}@keyframes kPulse{0%,100%{opacity:.35}50%{opacity:1}}\
.kp-x{background:rgba(240,235,227,.035);border:1px solid rgba(240,235,227,.055);color:#746d66;cursor:pointer;font-size:13px;padding:4px 7px;border-radius:9px;transition:all .2s}.kp-x:hover{color:#f0ebe3;border-color:rgba(194,59,59,.35);background:rgba(139,26,26,.13)}\
.kp-note{margin:10px 12px 0;padding:9px 11px;border:1px solid rgba(240,235,227,.065);border-radius:13px;font-size:10.5px;line-height:1.45;color:#a9a19a;background:rgba(240,235,227,.035);flex-shrink:0}\
.kp-msgs{flex:1;overflow-y:auto;padding:12px 12px 10px;display:flex;flex-direction:column;gap:9px;min-height:210px;max-height:370px;scrollbar-width:thin;scrollbar-color:rgba(240,235,227,.18) transparent}\
.recruiter-kage .kp-msgs{max-height:440px;min-height:250px}\
.kp-msgs::-webkit-scrollbar{width:6px}.kp-msgs::-webkit-scrollbar-track{background:transparent}.kp-msgs::-webkit-scrollbar-thumb{background:rgba(240,235,227,.16);border-radius:999px}.kp-msgs::-webkit-scrollbar-thumb:hover{background:rgba(240,235,227,.26)}\
.kp-msg{max-width:92%;padding:11px 13px;font-size:13px;line-height:1.62;animation:mIn .25s ease;white-space:pre-wrap;word-break:break-word}@keyframes mIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}\
.kp-msg.kage{align-self:flex-start;background:rgba(240,235,227,.06);border:1px solid rgba(240,235,227,.09);color:#e5ded7;border-radius:5px 15px 15px 15px;box-shadow:0 12px 28px rgba(0,0,0,.18)}\
.kp-msg.user{align-self:flex-end;background:rgba(139,26,26,.2);border:1px solid rgba(194,59,59,.32);color:#fff4ee;border-radius:15px 5px 15px 15px}\
.kp-typing{align-self:flex-start;margin-left:4px;padding:8px 12px;color:rgba(194,59,59,.78);font-size:11px;font-style:italic}\
.kp-acts{display:flex;gap:6px;padding:9px 12px 7px;border-top:1px solid rgba(240,235,227,.055);flex-shrink:0;flex-wrap:wrap;background:rgba(240,235,227,.018)}\
.kp-act{font-family:monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.55px;color:#d4cec6;background:rgba(240,235,227,.055);border:1px solid rgba(240,235,227,.075);padding:6px 9px;cursor:pointer;transition:all .2s;border-radius:999px}\
.kp-act:hover{border-color:rgba(194,59,59,.45);color:#fff;background:rgba(139,26,26,.16);transform:translateY(-1px)}\
.kp-con{display:none;margin:0 12px 8px;padding:8px 10px;border:1px solid rgba(240,235,227,.065);border-radius:12px;background:rgba(240,235,227,.03)}.kp-con.show{display:block}\
.kp-con a{display:block;font-size:12px;color:#e05252;text-decoration:none;padding:4px 0}.kp-con a:hover{color:#fff}\
.kp-rep{display:none;margin:0 12px 8px;padding:8px;border:1px solid rgba(240,235,227,.065);border-radius:12px;background:rgba(240,235,227,.03)}.kp-rep.show{display:flex;gap:6px}\
.kp-rep input{flex:1;background:rgba(8,8,10,.42);border:1px solid rgba(240,235,227,.08);color:#f0ebe3;font-size:12px;padding:8px 10px;outline:0;border-radius:9px}\
.kp-rep button{font-family:monospace;font-size:8px;text-transform:uppercase;background:rgba(139,26,26,.18);border:1px solid rgba(194,59,59,.35);color:#e05252;padding:8px 10px;cursor:pointer;border-radius:9px}\
.kp-iw{display:flex;margin:0 12px 12px;border:1px solid rgba(240,235,227,.085);border-radius:14px;background:rgba(240,235,227,.035);flex-shrink:0;overflow:hidden}\
.kp-in{flex:1;background:0;border:0;color:#f0ebe3;font-size:12.5px;padding:12px 12px;outline:0;font-family:inherit}.kp-in::placeholder{color:#7d756e}\
.kp-mic,.kp-snd{background:rgba(139,26,26,.12);border:0;border-left:1px solid rgba(240,235,227,.075);color:#c23b3b;cursor:pointer;padding:10px 11px;font-size:14px;transition:all .2s}.kp-mic:hover,.kp-snd:hover{color:#fff;background:rgba(139,26,26,.28)}.kp-mic.listening{color:#fff;background:rgba(139,26,26,.38);box-shadow:0 0 18px rgba(194,59,59,.28) inset}\
html[data-theme="light"] .kp{background:linear-gradient(180deg,rgba(248,245,239,.98),rgba(240,235,227,.98))!important;border-color:rgba(26,26,28,.11)!important;box-shadow:0 28px 80px rgba(0,0,0,.18)!important}\
html[data-theme="light"] .kp-hd{background:linear-gradient(90deg,rgba(139,26,26,.07),transparent 65%)!important;border-bottom-color:rgba(26,26,28,.08)!important}\
html[data-theme="light"] .kp-id span{color:#1a1a1c!important}\
html[data-theme="light"] .kp-note{color:#5d5650!important;background:rgba(26,26,28,.028)!important;border-color:rgba(26,26,28,.075)!important}\
html[data-theme="light"] .kp-msg.kage{background:rgba(255,255,255,.72)!important;color:#322d29!important;border-color:rgba(26,26,28,.08)!important}\
html[data-theme="light"] .kp-msg.user{background:rgba(139,26,26,.08)!important;color:#1a1a1c!important;border-color:rgba(139,26,26,.18)!important}\
html[data-theme="light"] .kp-in{color:#1a1a1c!important}.kp-in::placeholder{color:#8d8580}\
html[data-theme="light"] .kp-iw,html[data-theme="light"] .kp-act{color:#4a4540!important;background:rgba(26,26,28,.035)!important;border-color:rgba(26,26,28,.075)!important}\
html[data-theme="light"] .kage-stage{background:radial-gradient(circle at 50% 70%,rgba(139,26,26,.10),transparent 62%)!important}\
html[data-theme="light"] .kp-con,html[data-theme="light"] .kp-rep{background:rgba(26,26,28,.025)!important;border-color:rgba(26,26,28,.075)!important}\
@media(max-width:700px){.kage-wrap{right:10px;left:auto;bottom:10px}.kp{width:calc(100vw - 112px);right:92px;left:auto;max-height:78vh}.recruiter-kage .kp{width:calc(100vw - 112px)}.kp-msgs,.recruiter-kage .kp-msgs{max-height:48vh}.kage-stage{width:82px;height:116px}}\
';

  document.head.appendChild(s);
}

function dom(){
  var recruiterMode=curPage()==='recruiter.html';

  var mainActions=
      '<button class="kp-act" data-q="Open Recruiter Mode.">Recruiter</button>'+
      '<button class="kp-act" data-q="Give me a 3-minute profile.">3-min Profile</button>'+
      '<button class="kp-act" data-q="Help me on this page.">Page Help</button>'+
      '<button class="kp-act" data-q="Start site tour.">Tour</button>'+
      '<button class="kp-act" data-q="Tell me about Kage">Kage</button>'+
      '<button class="kp-act" data-q="How can I contact Sai?">Contact</button>'+
      '<button class="kp-act" data-q="I found an issue on this page">Report</button>';

  var recruiterActions=
      '<button class="kp-act" data-q="Give me a 30-second professional pitch about Sai.">30-sec Pitch</button>'+
      '<button class="kp-act" data-q="What roles or opportunities is Sai best suited for, and why?">Best Fit</button>'+
      '<button class="kp-act" data-q="Generate a recruiter packet for this role.">Role Packet</button>'+
      '<button class="kp-act" data-q="Explain Sai’s key projects like case studies, not a list.">Projects</button>'+
      '<button class="kp-act" data-q="Summarize Sai’s publications and what they prove.">Publications</button>'+
      '<button class="kp-act" data-q="Start site tour.">Tour</button>'+
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
  if(recruiterMode)w.classList.add('recruiter-kage');
  w.id='kageWrap';

  var p=document.createElement('div');
  p.className='kp';
  p.id='kPanel';

  p.innerHTML=
    '<div class="kp-hd">'+
      '<div class="kp-id"><div class="kp-head-avatar"><canvas id="kageHeaderCanvas"></canvas></div><b>影</b><span>'+(recruiterMode?'Ask Kage':'Kage')+'</span></div>'+
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
      '<button class="kp-mic" id="kMic" title="Voice input">🎙</button>'+
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

  var mic=document.getElementById('kMic');
  if(mic){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ mic.title='Voice input is not supported in this browser. Try Chrome/Edge on HTTPS.'; mic.addEventListener('click',function(){ hist.push({role:'assistant',content:'Voice input is not available in this browser. Try Chrome or Edge on HTTPS, or type your question.'}); render(); }); }
    else{
      mic.addEventListener('click',function(e){
        e.stopPropagation();
        var rec=new SR(); rec.lang='en-US'; rec.interimResults=false; rec.maxAlternatives=1;
        mic.classList.add('listening'); setKageBotState('listening');
        rec.onresult=function(ev){ var tx=ev.results&&ev.results[0]&&ev.results[0][0]?ev.results[0][0].transcript:''; var i=document.getElementById('kIn'); if(i){i.value=tx; i.focus(); if(tx && !typing){ setTimeout(function(){ document.getElementById('kSnd').click(); },120); }} };
        rec.onend=function(){ mic.classList.remove('listening'); };
        rec.onerror=function(){ mic.classList.remove('listening'); setKageBotState('error'); hist.push({role:'assistant',content:'I could not hear you. Browser voice input usually needs microphone permission, Chrome/Edge, and HTTPS.'}); render(); };
        rec.start();
      });
    }
  }

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
    var tag=(e.target&&e.target.tagName||'').toLowerCase();
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault(); openPanel(); isOpen=true; d.p.classList.add('open'); if(hist.length===0)welcome(); var ii=document.getElementById('kIn'); if(ii)ii.focus(); return;
    }
    if(e.key==='/' && !isOpen && tag!=='input' && tag!=='textarea'){
      e.preventDefault(); openPanel(); isOpen=true; d.p.classList.add('open'); if(hist.length===0)welcome(); var jj=document.getElementById('kIn'); if(jj)jj.focus(); return;
    }
    if(e.key==='Escape'&&isOpen){
      isOpen=false;
      d.p.classList.remove('open');
    }
  });
}

function kageTimeState(){
  if(window.KageV43 && window.KageV43.timeState) return window.KageV43.timeState();
  var h=new Date().getHours();
  if(h>=23||h<6)return 'sleep';
  if(h>=6&&h<9)return 'meditating';
  if(h>=18&&h<21)return 'scout';
  if(h>=21)return 'shadow';
  return 'guardian';
}
function kageIntentState(text){
  text=(text||'').toLowerCase();
  if(/bug|error|broken|issue/.test(text))return 'error';
  if(/thank|thanks|cool|great|nice/.test(text))return 'smirk';
  if(/sleep|tired|night/.test(text))return 'sleep';
  if(/meditat|calm|focus|breathe/.test(text))return 'meditating';
  if(/search|find|look|scan|where|navigate|open|visit/.test(text))return 'scout';
  if(/fight|ready|katana|blade/.test(text))return 'fighting';
  if(/draw|unsheath/.test(text))return 'drawn';
  if(/slash|attack|swing/.test(text))return 'slash';
  if(/shadow|sense/.test(text))return 'shadow';
  if(/\?/.test(text))return 'thinking';
  return 'listening';
}
function setKageBotState(state){
  var next=state || kageTimeState();
  window.__kageBotState=next;
  /* Floating website bot follows broad time-of-day poses instead of being locked. */
  if(window.__kageBot3D && window.__kageBot3D.setState) window.__kageBot3D.setState(next);
  /* The Ask Kage header/avatar mirrors the same expression state. */
  if(window.__kageHeader3D && window.__kageHeader3D.setState) window.__kageHeader3D.setState(next);
}
function build3D(el){
  el.innerHTML='';
  var canvas=document.createElement('canvas');
  canvas.className='kage-stage-canvas';
  canvas.setAttribute('aria-label','Kage assistant render');
  el.appendChild(canvas);
  function mount(){
    if(window.KageV43 && window.KageV43.create){
      window.__kageBot3D=window.KageV43.create(canvas,{mini:true,interactive:true});
      var hc=document.getElementById('kageHeaderCanvas');
      if(hc && !window.__kageHeader3D) window.__kageHeader3D=window.KageV43.create(hc,{mini:true});
      setKageBotState(kageTimeState());
      setInterval(function(){ if(!isOpen && !typing) setKageBotState(kageTimeState()); }, 60000);
      return;
    }
    setTimeout(mount,80);
  }
  mount();
  el.addEventListener('mouseenter',function(){ if(!isOpen) setKageBotState('guardian'); });
  el.addEventListener('mouseleave',function(){ if(!isOpen&&!typing) setKageBotState(kageTimeState()); });
  setInterval(function(){
    var a=document.getElementById('ac2');
    var w=document.getElementById('kageWrap');
    if(w)w.style.display=(a&&a.classList.contains('open'))?'none':'';
  },500);
}


function tourCss(){
  if(document.getElementById('kageTourCss')) return;
  var st=document.createElement('style');
  st.id='kageTourCss';
  st.textContent='\
.kage-choice{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(5,5,7,.62);backdrop-filter:blur(12px)}\
.kage-choice.show{display:flex}\
.kage-choice-card{width:min(560px,calc(100vw - 32px));border:1px solid rgba(194,59,59,.32);background:linear-gradient(145deg,rgba(22,18,24,.98),rgba(9,9,12,.98));box-shadow:0 35px 120px rgba(0,0,0,.62);border-radius:24px;padding:26px;position:relative;overflow:hidden}\
.kage-choice-card:before{content:"影";position:absolute;right:22px;bottom:-18px;font-family:serif;font-size:110px;color:rgba(139,26,26,.10);pointer-events:none}\
.kage-choice-k{font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.22em;color:#c23b3b;margin-bottom:10px}\
.kage-choice-title{font-family:serif;font-size:30px;line-height:1.05;color:#f0ebe3;margin-bottom:10px}\
.kage-choice-copy{font-size:14px;line-height:1.7;color:#bfb7ae;margin-bottom:18px;max-width:460px}\
.kage-choice-actions{display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1}\
.kage-choice-btn{border:1px solid rgba(240,235,227,.11);background:rgba(240,235,227,.045);color:#f0ebe3;padding:12px 14px;border-radius:999px;cursor:pointer;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;transition:.2s}\
.kage-choice-btn.primary{border-color:rgba(194,59,59,.5);background:rgba(139,26,26,.22)}\
.kage-choice-btn:hover{transform:translateY(-2px);border-color:#c23b3b}\
.kage-tour-card{position:fixed;right:22px;bottom:22px;width:min(390px,calc(100vw - 32px));z-index:1190;border:1px solid rgba(194,59,59,.35);background:linear-gradient(180deg,rgba(14,13,15,.98),rgba(8,8,10,.98));box-shadow:0 28px 90px rgba(0,0,0,.55);border-radius:20px;padding:16px;display:none}\
.kage-tour-card.show{display:block}\
.kage-tour-step{font-family:monospace;font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:#c23b3b;margin-bottom:8px}\
.kage-tour-title{font-family:serif;font-size:20px;color:#f0ebe3;margin-bottom:7px}\
.kage-tour-text{font-size:13px;line-height:1.55;color:#c8c0b7;margin-bottom:13px}\
.kage-tour-actions{display:flex;justify-content:space-between;gap:8px}\
.kage-tour-actions button{border:1px solid rgba(240,235,227,.10);background:rgba(240,235,227,.045);color:#f0ebe3;padding:9px 11px;border-radius:999px;cursor:pointer;font-family:monospace;font-size:9px;text-transform:uppercase;letter-spacing:.1em}\
.kage-tour-actions .primary{border-color:rgba(194,59,59,.45);background:rgba(139,26,26,.18)}\
.kage-tour-highlight{outline:2px solid rgba(194,59,59,.82)!important;outline-offset:8px!important;box-shadow:0 0 0 9999px rgba(0,0,0,.34),0 0 40px rgba(194,59,59,.22)!important;position:relative;z-index:20}\
html[data-theme="light"] .kage-choice-card,html[data-theme="light"] .kage-tour-card{background:linear-gradient(180deg,rgba(248,245,239,.98),rgba(240,235,227,.98))!important;color:#1a1a1c!important}\
html[data-theme="light"] .kage-choice-title,html[data-theme="light"] .kage-tour-title{color:#1a1a1c!important}\
html[data-theme="light"] .kage-choice-copy,html[data-theme="light"] .kage-tour-text{color:#4a4540!important}\
@media(max-width:700px){.kage-tour-card{right:10px;bottom:10px}.kage-tour-highlight{outline-offset:4px!important}}\
';
  document.head.appendChild(st);
}

function showRecruiterChoice(){
  if(curPage()!=='index.html') return;
  if(sessionStorage.getItem('kage-path-choice-seen')) return;
  sessionStorage.setItem('kage-path-choice-seen','1');
  tourCss();
  var ov=document.createElement('div');
  ov.className='kage-choice show';
  ov.id='kageChoice';
  ov.innerHTML='<div class="kage-choice-card">'+
    '<div class="kage-choice-k">Choose your path</div>'+ 
    '<div class="kage-choice-title">Are you visiting as a recruiter?</div>'+ 
    '<div class="kage-choice-copy">I can take you through a guided Recruiter Mode tour: 30-second pitch, 3-minute profile, best-fit roles, case studies, proof, CV/contact. Or you can continue through the creative portfolio.</div>'+ 
    '<div class="kage-choice-actions">'+
      '<button class="kage-choice-btn primary" id="kChoiceRecruiter">Recruiter Mode Tour</button>'+ 
      '<button class="kage-choice-btn" id="kChoiceRecruiterPage">Just open Recruiter Mode</button>'+ 
      '<button class="kage-choice-btn" id="kChoiceStay">Continue Current Site</button>'+ 
    '</div></div>';
  document.body.appendChild(ov);
  document.getElementById('kChoiceRecruiter').onclick=function(){ sessionStorage.setItem('kage-start-recruiter-tour','1'); window.location.href='recruiter.html#overview'; };
  document.getElementById('kChoiceRecruiterPage').onclick=function(){ window.location.href='recruiter.html'; };
  document.getElementById('kChoiceStay').onclick=function(){ ov.classList.remove('show'); setTimeout(function(){ if(ov.parentNode)ov.parentNode.removeChild(ov);},220); };
}

function startRecruiterGuidedTour(){
  tourCss();
  var steps=[
    {sel:'#overview', title:'Overview', text:'This opening section is the fast professional read: Sai’s identity, availability, target locations, and primary recruiter actions.'},
    {sel:'#quick-overview', title:'3-minute profile', text:'This section gives a quick professional snapshot for recruiters who want the full profile without exploring every page.'},
    {sel:'#why', title:'Best-fit roles', text:'Here you can frame Sai for medtech, life-sciences strategy, healthcare ventures, imaging validation, and deep-tech roles.'},
    {sel:'#case-studies', title:'Evidence through case studies', text:'These cards translate projects into proof: problem, method, result, and why the work matters.'},
    {sel:'#proof', title:'Publications and proof', text:'This is the evidence layer: publications, research outputs, and credibility signals.'},
    {sel:'#contact', title:'Contact path', text:'This is where recruiters can reach Sai, download/review the CV, and move from browsing to conversation.'}
  ];
  var i=0, card=document.getElementById('kageTourCard');
  if(!card){
    card=document.createElement('div');
    card.id='kageTourCard';
    card.className='kage-tour-card';
    card.innerHTML='<div class="kage-tour-step" id="kTourStep"></div><div class="kage-tour-title" id="kTourTitle"></div><div class="kage-tour-text" id="kTourText"></div><div class="kage-tour-actions"><button id="kTourSkip">End</button><span style="flex:1"></span><button id="kTourPrev">Back</button><button class="primary" id="kTourNext">Next</button></div>';
    document.body.appendChild(card);
  }
  function clear(){ document.querySelectorAll('.kage-tour-highlight').forEach(function(x){x.classList.remove('kage-tour-highlight');}); }
  function show(){
    clear();
    var st=steps[i], el=document.querySelector(st.sel);
    if(el){ el.classList.add('kage-tour-highlight'); el.scrollIntoView({behavior:'smooth',block:'center'}); }
    document.getElementById('kTourStep').textContent='Step '+(i+1)+' of '+steps.length;
    document.getElementById('kTourTitle').textContent=st.title;
    document.getElementById('kTourText').textContent=st.text;
    document.getElementById('kTourPrev').style.visibility=i===0?'hidden':'visible';
    document.getElementById('kTourNext').textContent=i===steps.length-1?'Finish':'Next';
    card.classList.add('show');
    if(window.__kageBot3D&&window.__kageBot3D.setState) window.__kageBot3D.setState(i===0?'bow':(i===steps.length-1?'guardian':'scout'));
  }
  function end(){ clear(); card.classList.remove('show'); sessionStorage.removeItem('kage-start-recruiter-tour'); if(window.__kageBot3D&&window.__kageBot3D.setState) window.__kageBot3D.setState(kageTimeState()); }
  document.getElementById('kTourSkip').onclick=end;
  document.getElementById('kTourPrev').onclick=function(){ if(i>0){i--;show();} };
  document.getElementById('kTourNext').onclick=function(){ if(i<steps.length-1){i++;show();} else end(); };
  show();
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

    showRecruiterChoice();
    if(curPage()==='recruiter.html' && (sessionStorage.getItem('kage-start-recruiter-tour') || location.hash==='#tour')){
      setTimeout(startRecruiterGuidedTour,900);
    }

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

    console.log('Kage v13 loaded — polished chat UI');
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

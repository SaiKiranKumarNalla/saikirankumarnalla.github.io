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
  setKageBotState(kageIntentState(text));
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
    ? g+' You return. I am AI-enabled — ask me about Sensei Sai’s fit, projects, publications, research, or the best path through this website.'
    : g+' I am Kage — an AI-enabled assistant. Ask me about Sensei Sai’s work, projects, publications, role fit, or research story. I can answer first, then guide you if a page helps.';

  hist.push({role:'assistant',content:t});
  render();
}

function css(){
  var s=document.createElement('style');

  s.textContent='\
.kage-wrap{position:fixed;bottom:18px;left:18px;z-index:900;opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s;pointer-events:none}\
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
.kp{position:absolute;bottom:0;left:124px;width:390px;max-height:560px;border:1px solid rgba(139,26,26,.28);background:linear-gradient(180deg,rgba(14,13,15,.98),rgba(8,8,10,.98));backdrop-filter:blur(18px);display:flex;flex-direction:column;opacity:0;visibility:hidden;transform:translateX(14px) scale(.97);transform-origin:bottom left;transition:all .28s ease;pointer-events:none;overflow:hidden;border-radius:18px;box-shadow:0 28px 90px rgba(0,0,0,.52),0 0 0 1px rgba(240,235,227,.025) inset}\
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
.kp-snd{background:rgba(139,26,26,.12);border:0;border-left:1px solid rgba(240,235,227,.075);color:#c23b3b;cursor:pointer;padding:10px 14px;font-size:15px;transition:all .2s}.kp-snd:hover{color:#fff;background:rgba(139,26,26,.28)}\
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
@media(max-width:700px){.kage-wrap{left:10px;bottom:10px}.kp{width:calc(100vw - 112px);left:92px;max-height:78vh}.recruiter-kage .kp{width:calc(100vw - 112px)}.kp-msgs,.recruiter-kage .kp-msgs{max-height:48vh}.kage-stage{width:82px;height:116px}}\
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
  window.__kageBotState=state;
  if(window.__kageBot3D && window.__kageBot3D.setState) window.__kageBot3D.setState(state);
  if(window.__kageHeader3D && window.__kageHeader3D.setState) window.__kageHeader3D.setState(state);
}
function build3D(el){
  el.innerHTML='';
  var canvas=document.createElement('canvas');
  canvas.className='kage-stage-canvas';
  canvas.setAttribute('aria-label','Kage assistant render');
  el.appendChild(canvas);
  function mount(){
    if(window.KageV43 && window.KageV43.create){
      window.__kageBot3D=window.KageV43.create(canvas,{mini:true});
      var hc=document.getElementById('kageHeaderCanvas');
      if(hc && !window.__kageHeader3D) window.__kageHeader3D=window.KageV43.create(hc,{mini:true});
      setKageBotState(kageTimeState());
      setInterval(function(){ if(!isOpen && !typing) setKageBotState(kageTimeState()); }, 60000);
      return;
    }
    setTimeout(mount,80);
  }
  mount();
  el.addEventListener('mouseenter',function(){ if(!isOpen) setKageBotState('listening'); });
  el.addEventListener('mouseleave',function(){ if(!isOpen&&!typing) setKageBotState(kageTimeState()); });
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

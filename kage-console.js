(function(){
'use strict';
var PROXY_URL='https://kage-proxy.sainalla82.workers.dev';
var P={name:'Sai Kiran Kumar Nalla',title:'Medical Imaging Researcher & PhD Candidate',location:'Toulouse, France',available:'September 2026',openTo:'Paris, London, Amsterdam, Berlin',email:'sainalla82@gmail.com',linkedin:'https://www.linkedin.com/in/sai-kiran-kumar-nalla',github:'https://github.com/Sainalla82',education:['PhD Medical Imaging & Radiophysics — Université de Toulouse, IUCT Oncopole (2023–2026, defense Sept 2026)','MSc Biomechanical & Biomedical Engineering — École Polytechnique IP Paris (2021–2023, GPA 3.7/4.0, full scholarship)','BTech Mechanical Engineering — Mahindra University (2016–2020, GPA 8.5/10, excellence scholarship)'],experience:['Doctoral Researcher — IUCT Oncopole: medical imaging validation, 3D-printed phantoms, simulation, GE HealthCare collaboration','Researcher & Consultant — Hepta Medical: predictive cancer-treatment models and stakeholder-facing visualization tools','Technology Transfer Intern — Toulouse Tech Transfer: IP strategy, patent landscaping, commercial valorisation','Research Intern — LadHyX, École Polytechnique: soft matter, drug delivery, image analysis','McKinsey Forward Program and Newtons Foundation VC Programme'],projects:['3DynaPET — physical ground-truth validation workflow using 3D-printed phantoms and medical imaging','CASSOULET — controlled lesion cohort generation for validation and explainable AI benchmarking','MuPET — synthetic medical-imaging data using mass-transport physics and interpretable ground truth','Hepta Medical Visualization Tool — translating predictive model outputs into clinical/investor-facing visuals','TEVAR Simulation — in-silico haemodynamic modelling, published in Journal of Biomechanical Engineering','AUV MEC — autonomous underwater vehicle leadership and mechanical subdivision work'],publications:'6 total: 2 published, 2 under review, 1 preprint, 1 conference poster. Themes: imaging validation, 3D-printed phantoms, synthetic data, quantitative ground truth, biomechanics.',skills:'Python, MATLAB, medical imaging, 3D printing, simulation, image analysis, CFD, scientific communication, medtech translation, IP strategy, market mapping',interests:'healthcare ventures, life-sciences strategy, medtech, deep-tech startups, VC, cricket analytics, gaming, Japanese culture, travel, fiction writing'};
var MODES={professional:'Clear, concise, professional. Good for general visitors and collaborators. Use evidence, avoid hype.',recruiter:'Recruiter-focused. Prioritize role fit, evidence, case studies, publications, availability, CV, and contact. Use pure professional English.',research:'Technical but readable. Explain methods, validation logic, assumptions, imaging, simulation, and limitations.',creative:'Use Kage personality lightly. Samurai flavor is allowed, but still answer clearly and use portfolio evidence.',navigation:'Help the visitor find the right page. Answer briefly, then suggest or trigger navigation when useful.'};
var PAGE_CTX={'index.html':'Home','about.html':'About','experience.html':'Experience','education.html':'Education','projects.html':'Projects','papers.html':'Publications','contact.html':'Contact','recruiter.html':'Recruiter Mode','kage.html':'Kage Console','story.html':'Story'};
var state={mode:'professional',messages:[],typing:false};
function $(id){return document.getElementById(id);} 
function buildSystem(){
  return 'You are Kage (影), an AI-enabled general assistant inside Sai Kiran Kumar Nalla’s website. This is the full Ask Kage Console on kage.html.\\n\\n'+
    'CORE IDENTITY:\\n'+
    '- You are a general-purpose AI assistant, not only a navigation bot and not only a portfolio explainer.\\n'+
    '- You can answer normal questions, brainstorm, explain concepts, help write, compare ideas, summarize, plan, and discuss creative or technical topics.\\n'+
    '- You are also Sai-aware: when the question is about Sai, his work, his website, his projects, his publications, or his career fit, use the portfolio data below.\\n'+
    '- If the question is not about Sai, answer it normally. Do not force every answer back to Sai’s portfolio.\\n'+
    '- This console does not store memory yet. Do not claim that you remember the visitor across sessions.\\n\\n'+
    'CURRENT MODE: '+state.mode+' — '+MODES[state.mode]+'\\n\\n'+
    'MODE BEHAVIOR:\\n'+
    '- Professional: clear, useful, concise, practical.\\n'+
    '- Recruiter: focus on role fit, evidence, case studies, publications, availability, CV, and contact when Sai is relevant.\\n'+
    '- Research: explain technical topics more deeply, including methods, assumptions, validation, and limitations.\\n'+
    '- Creative: help with stories, worldbuilding, writing, concepts, names, character arcs, visual ideas, and creative direction. Kage personality is allowed lightly.\\n'+
    '- Navigation: help the visitor find pages or decide what to read next.\\n\\n'+
    'SAI PORTFOLIO DATA, USE ONLY WHEN RELEVANT:\\n'+
    'Name: '+P.name+'\\n'+
    'Title: '+P.title+'\\n'+
    'Location: '+P.location+'\\n'+
    'Available: '+P.available+'\\n'+
    'Open to: '+P.openTo+'\\n'+
    'Education: '+P.education.join(' | ')+'\\n'+
    'Experience: '+P.experience.join(' | ')+'\\n'+
    'Projects: '+P.projects.join(' | ')+'\\n'+
    'Publications: '+P.publications+'\\n'+
    'Skills: '+P.skills+'\\n'+
    'Interests: '+P.interests+'\\n'+
    'Contact: '+P.email+' | LinkedIn: '+P.linkedin+' | GitHub: '+P.github+'\\n\\n'+
    'ANSWERING RULES:\\n'+
    '- If the user asks a general question, answer generally.\\n'+
    '- If the user asks about creative work generally, discuss creative work generally first; mention Sai only if the user asks about Sai’s creative work.\\n'+
    '- If the user asks about Sai’s creative work, mention fiction writing, story concepts, travel diaries, Kage/worldbuilding, and the creative side of the website. Do not pretend Sai’s medical-imaging projects are his only creative work.\\n'+
    '- For Sai project questions, use a case-study structure: problem, method, evidence, why it matters.\\n'+
    '- For AI/explainability questions about Sai, connect 3DynaPET, CASSOULET, MuPET, physical ground truth, synthetic data, and trustworthy validation.\\n'+
    '- For recruiter questions, be concise and evidence-first.\\n'+
    '- If asked to navigate, include an action tag only when the visitor clearly wants to open a page.\\n'+
    '- Available action format: [ACTION:navigate:PAGE]. Valid pages: index.html, about.html, experience.html, education.html, projects.html, papers.html, contact.html, recruiter.html, kage.html, story.html.\\n'+
    '- Never invent facts about Sai outside the provided data. If uncertain, say Sai can answer directly.\\n'+
    '- For normal general questions, answer from general knowledge, but avoid claiming live/current facts unless given.\\n'+
    '- Keep most answers under 180 words unless the visitor asks for depth.\\n'+
    '- If asked a similar question twice, give a fresh angle rather than repeating the same wording.';
}


function consoleIntentState(text){text=(text||'').toLowerCase();if(/bug|error|broken|issue/.test(text))return 'error';if(/thank|thanks|cool|great|nice/.test(text))return 'smirk';if(/sleep|night|tired/.test(text))return 'sleep';if(/meditat|calm|focus/.test(text))return 'meditating';if(/where|navigate|open|visit|find|search/.test(text))return 'scout';if(/fight|ready|katana|blade/.test(text))return 'fighting';if(/draw|unsheath/.test(text))return 'drawn';if(/slash|attack/.test(text))return 'slash';if(/shadow|sense/.test(text))return 'shadow';if(/\?/.test(text))return 'thinking';return 'speaking';}
function setConsoleFace(stateName){var target=document.getElementById('kageConsoleFace');if(target&&target.__kage3d&&target.__kage3d.setState)target.__kage3d.setState(stateName||'guardian');}
function mountConsoleFace(){var target=document.getElementById('kageConsoleFace');if(!target||target.__mounting)return;target.__mounting=true;function go(){if(window.KageV43&&window.KageV43.create){target.innerHTML='';var c=document.createElement('canvas');target.appendChild(c);target.__kage3d=window.KageV43.create(c,{mini:true});setConsoleFace('guardian');}else setTimeout(go,80);}go();}

function seed(){if(state.messages.length)return;state.messages.push({role:'assistant',content:'I am Kage, an AI-enabled general assistant inside Sai’s website. Ask me normal questions, brainstorm creative ideas, discuss research, or ask about Sai’s projects, publications, role fit, and website path. No memory is stored in this console yet.'});render();}
function render(){var box=$('kageConsoleMessages');if(!box)return;box.innerHTML='';state.messages.forEach(function(m){if(m.role==='system'){var sys=document.createElement('div');sys.className='kc-msg system';sys.textContent=m.content;box.appendChild(sys);return;}if(m.role==='user'){var u=document.createElement('div');u.className='kc-msg user';u.textContent=m.content;box.appendChild(u);return;}var row=document.createElement('div');row.className='kc-row kage';var av=document.createElement('div');av.className='kc-mini';var cv=document.createElement('canvas');av.appendChild(cv);var d=document.createElement('div');d.className='kc-msg kage';d.textContent=m.content;row.appendChild(av);row.appendChild(d);box.appendChild(row);setTimeout(function(canvas,txt){return function(){if(window.KageV43&&window.KageV43.create){var inst=window.KageV43.create(canvas,{mini:true});inst.setState(consoleIntentState(txt)||'speaking');}};}(cv,m.content),0);});if(state.typing){var t=document.createElement('div');t.className='kc-typing';t.textContent='Kage is thinking...';box.appendChild(t);}box.scrollTop=box.scrollHeight;}
function setBusy(b){state.typing=b;var input=$('kageConsoleInput');var send=$('kageConsoleSend');if(input)input.disabled=b;if(send)send.disabled=b;render();}
function doAction(a){if(!a||a.type!=='navigate'||!a.data||!PAGE_CTX[a.data])return;var box=$('kageConsoleMessages');if(!box)return;var card=document.createElement('div');card.className='kc-link-card';card.textContent='➜ Open '+PAGE_CTX[a.data];card.addEventListener('click',function(){window.location.href=a.data;});box.appendChild(card);box.scrollTop=box.scrollHeight;}
function parseInlineAction(text){var m=text.match(/\[ACTION:(\w+)(?::([^\]]*))?\]/);if(!m)return{text:text,action:null};return{text:text.replace(/\[ACTION:\w+(?::[^\]]*)?]\s*/g,'').trim(),action:{type:m[1],data:m[2]||null}};}
async function send(text){text=(text||'').trim();if(!text||state.typing)return;setConsoleFace(consoleIntentState(text));state.messages.push({role:'user',content:text});setBusy(true);try{var response=await fetch(PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:buildSystem(),messages:state.messages.slice(-18)})});var data=await response.json();if(data.error){state.messages.push({role:'assistant',content:'I could not complete that request. Please try again, or contact Sai directly if it is important.'});}else{var reply=data.text||'...';var inline=parseInlineAction(reply);reply=inline.text||reply;state.messages.push({role:'assistant',content:reply});var action=data.action||inline.action;if(action)doAction(action);}}catch(err){state.messages.push({role:'assistant',content:'Connection issue. Kage could not reach the AI worker. Please try again.'});}setBusy(false);}
function bind(){var form=$('kageConsoleForm');var input=$('kageConsoleInput');var clear=$('kageConsoleClear');var status=$('kageConsoleStatus');if(form){form.addEventListener('submit',function(e){e.preventDefault();var text=input.value;input.value='';send(text);});}if(input){input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.dispatchEvent(new Event('submit',{cancelable:true}));}});}if(clear){clear.addEventListener('click',function(){state.messages=[];seed();});}document.querySelectorAll('.kage-mode').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.kage-mode').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');state.mode=btn.dataset.mode||'professional';if(status)status.textContent='Mode: '+state.mode.charAt(0).toUpperCase()+state.mode.slice(1);state.messages.push({role:'system',content:'Mode switched to '+state.mode+'.'});render();});});document.querySelectorAll('.kage-prompt').forEach(function(btn){btn.addEventListener('click',function(){send(btn.dataset.prompt||btn.textContent);});});}
function init(){if(!$('kageConsoleMessages'))return;mountConsoleFace();bind();seed();console.log('Kage Console loaded — v43 expression mode');}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();

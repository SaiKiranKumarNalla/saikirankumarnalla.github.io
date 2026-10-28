(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('dynamic-ready');

  function tagReveal(){
    const selectors = [
      'section', '.nav-card', '.project-card', '.paper-card', '.edu-card', '.exp-card', '.timeline-item',
      '.vol-card', '.stat-card', '.tool-card', '.skill-card', '.case-card', '.fit-card', '.proof-card',
      '.tool-tile', '.method-card', '.recruiter-card', '.metric-card', '.contact-card', '.acc-item'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el, index)=>{
      if(el.closest('.kp,.kage-console,.kc-row,.kp-row')) return;
      el.classList.add('dyn-reveal');
      el.style.setProperty('--reveal-delay', `${Math.min(index % 8, 7) * 55}ms`);
    });
  }

  function revealObserver(){
    if(reduce){ document.querySelectorAll('.dyn-reveal').forEach(el=>el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.dyn-reveal').forEach(el=>io.observe(el));
  }

  function cardGlow(){
    const cards = document.querySelectorAll('.nav-card,.project-card,.paper-card,.edu-card,.exp-card,.vol-card,.stat-card,.tool-card,.skill-card,.case-card,.fit-card,.proof-card,.tool-tile,.metric-card,.contact-card,.acc-item');
    cards.forEach(card=>{
      if(card.closest('.kp,.kage-console')) return;
      card.classList.add('dyn-card');
      card.addEventListener('pointermove', e=>{
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  function cursorGlow(){
    if(reduce || window.innerWidth < 800) return;
    const glow = document.createElement('div');
    glow.className = 'dynamic-cursor-glow';
    document.body.appendChild(glow);
    let x = window.innerWidth/2, y = window.innerHeight/2, tx=x, ty=y;
    window.addEventListener('pointermove', e=>{ tx=e.clientX; ty=e.clientY; }, {passive:true});
    function loop(){
      x += (tx-x)*0.12; y += (ty-y)*0.12;
      glow.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    tagReveal(); revealObserver(); cardGlow(); cursorGlow();
  });
})();

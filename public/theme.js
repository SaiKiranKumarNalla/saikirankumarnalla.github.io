// ── Theme Toggle ──
(function(){
  // Apply saved theme immediately (before render)
  var s=localStorage.getItem('sai-theme');
  if(s)document.documentElement.setAttribute('data-theme',s);

  function toggle(){
    var c=document.documentElement.getAttribute('data-theme');
    var n=(c==='light')?'dark':'light';
    document.documentElement.setAttribute('data-theme',n);
    localStorage.setItem('sai-theme',n);
  }

  document.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('themeToggle');
    if(b) b.addEventListener('click',toggle);
  });

  // Keyboard fallback: Ctrl+Shift+T toggles theme
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey && e.shiftKey && e.key==='T'){
      e.preventDefault();
      toggle();
    }
  });
})();

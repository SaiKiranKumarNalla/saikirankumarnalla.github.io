// ── Theme Toggle ──
(function(){
  // Apply saved theme immediately (before render)
  var s=sessionStorage.getItem('sai-theme')||(function(){var h=new Date().getHours();return h>=7&&h<19?'light':'dark';})();
  if(s)document.documentElement.setAttribute('data-theme',s);

  function toggle(){
    var c=document.documentElement.getAttribute('data-theme');
    var n=(c==='light')?'dark':'light';
    document.documentElement.setAttribute('data-theme',n);
    sessionStorage.setItem('sai-theme',n);
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

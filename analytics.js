// ── Lightweight analytics + client-side error logging ──
(function(){
  window.trackSaiEvent = function(name, props){
    props = props || {};
    if (window.plausible) window.plausible(name, { props: props });
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.log('[analytics]', name, props);
    }
  };

  window.addEventListener('error', function(event){
    window.trackSaiEvent('JS Error', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener('unhandledrejection', function(event){
    window.trackSaiEvent('Unhandled Promise Rejection', {
      reason: String(event.reason)
    });
  });
})();


document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a');
  if (!a) return;
  var href = a.getAttribute('href') || '';
  if (/\.pdf($|\?)/i.test(href)) window.trackSaiEvent('CV Downloaded', { href: href });
  if (href.indexOf('linkedin.com') !== -1) window.trackSaiEvent('LinkedIn Clicked');
  if (href.indexOf('github.com') !== -1) window.trackSaiEvent('GitHub Clicked');
  if (href.indexOf('mailto:') === 0) window.trackSaiEvent('Email Clicked');
});

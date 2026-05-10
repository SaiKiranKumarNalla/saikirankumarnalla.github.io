// ── Theme Toggle ──
// Reads/saves preference in localStorage, applies to <html> data-theme attribute
(function () {
  const saved = localStorage.getItem('sai-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sai-theme', next);
    });
  });
})();

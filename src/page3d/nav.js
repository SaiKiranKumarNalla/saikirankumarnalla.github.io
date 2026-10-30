// Shared top navigation for the 3D section pages (same look as the home page menu).
// "Thesis" is a dropdown: PhD, Master's and Bachelor's each have their own page.
export const THESES = [
  ['research', 'PhD', 'Medical imaging · Toulouse 2026', '/education.html'],
  ['masters', "Master's", 'Microwave ablation · Polytechnique 2023', '/education.html'],
  ['auv', "Bachelor's", 'Black Pearl AUV · Mahindra 2020', '/education.html'],
];
export const SECTIONS = [
  ['about', 'About'], ['thesis', 'Thesis'], ['projects', 'Projects'],
  ['publications', 'Publications'], ['builder', 'Agentic AI'], ['contact', 'Contact'],
];

// The dropdown markup; `active` is the current page id (highlights the matching item).
export function thesisDropdown(active) {
  const on = THESES.some(([id]) => id === active);
  return `<div class="w-dd">
    <button class="w-dd-btn${on ? ' active' : ''}" aria-haspopup="true" aria-expanded="false">Thesis <span aria-hidden="true">▾</span></button>
    <div class="w-dd-menu" role="menu">
      ${THESES.map(([id, name, sub, href]) => `<a role="menuitem" href="${href}" data-thesis="${id}"${id === active ? ' aria-current="page"' : ''}><b>${name}</b><span>${sub}</span></a>`).join('')}
    </div>
  </div>`;
}

// Click-to-open for touch and keyboard (hover opens it on desktop via CSS).
export function wireDropdown(root) {
  root.querySelectorAll('.w-dd').forEach((dd) => {
    const btn = dd.querySelector('.w-dd-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains('open');
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', () => root.querySelectorAll('.w-dd.open').forEach((d) => { d.classList.remove('open'); d.querySelector('.w-dd-btn').setAttribute('aria-expanded', 'false'); }));
}

// Light/dark toggle for pages without the 3D engine (the engine wires its own, with scene colours).
export function wireTheme() {
  const btn = document.getElementById('themeBtn');
  const sync = () => { btn.textContent = document.documentElement.dataset.theme === 'light' ? '☀' : '☾'; };
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('sai-theme', next); } catch (e) {}
    sync();
  });
  sync();
}

export function renderNav(active) {
  const header = document.getElementById('nav');
  header.className = 'w-nav';
  header.innerHTML = `
    <a class="w-brand" href="/">NALLA<span>.</span></a>
    <nav class="w-menu" id="menu" aria-label="Sections">
      ${SECTIONS.map(([id, name]) => (id === 'thesis' ? thesisDropdown(active)
        : `<a href="/sections/${id}.html"${id === active ? ' class="active" aria-current="page"' : ''}>${name}</a>`)).join('')}
    </nav>
    <div class="w-nav-right">
      <button class="w-icon" id="themeBtn" aria-label="Toggle light and dark">☾</button>
      <a class="w-cv" href="/Assets/Sai_Nalla_CV.pdf" target="_blank" rel="noopener">CV</a>
      <button class="w-icon w-burger" id="burger" aria-label="Open menu" aria-expanded="false">☰</button>
    </div>`;
  wireDropdown(header);
  const burger = document.getElementById('burger');
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
}

// Shared top navigation for the 3D section pages (same look as the home page menu).
export const SECTIONS = [
  ['about', 'About'], ['research', 'PhD Thesis'], ['projects', 'Projects'], ['inventory', 'Project Inventory'],
  ['publications', 'Publications'], ['builder', 'AI Builder'], ['contact', 'Contact'],
];

export function renderNav(active) {
  const header = document.getElementById('nav');
  header.className = 'w-nav';
  header.innerHTML = `
    <a class="w-brand" href="/">NALLA<span>.</span></a>
    <nav class="w-menu" id="menu" aria-label="Sections">
      ${SECTIONS.map(([id, name]) => `<a href="/sections/${id}.html"${id === active ? ' class="active" aria-current="page"' : ''}>${name}</a>`).join('')}
    </nav>
    <div class="w-nav-right">
      <button class="w-icon" id="themeBtn" aria-label="Toggle light and dark">☾</button>
      <a class="w-cv" href="/Assets/Sai_Nalla_CV.pdf" target="_blank" rel="noopener">CV</a>
      <button class="w-icon w-burger" id="burger" aria-label="Open menu" aria-expanded="false">☰</button>
    </div>`;
  const burger = document.getElementById('burger');
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
}

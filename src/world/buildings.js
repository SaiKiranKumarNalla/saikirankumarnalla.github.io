// One building per section. `style` picks the procedural model in props.js.
// `footprint` is the collision radius; `height` places the floating label.
export const BUILDINGS = [
  { id: 'dojo',    en: 'The Dōjō',      jp: '道場', sub: 'Who I am: the ronin behind the research', href: 'about.html',     style: 'pagoda', tiers: 2, footprint: 4.2, height: 9 },
  { id: 'forge',   en: 'The Forge',     jp: '鍛冶', sub: 'Projects: CASSOULET, VeriTomiX, Flow Lab and more', href: 'projects.html', style: 'forge',  footprint: 4.4, height: 7 },
  { id: 'scrolls', en: 'The Scrolls',   jp: '巻物', sub: 'Papers, preprints and talks', href: 'papers.html', style: 'library', footprint: 4.2, height: 7.5 },
  { id: 'builder', en: 'The Builder',   jp: '工房', sub: 'How I build with teams of AI agents', href: 'builder.html', style: 'tower', tiers: 3, footprint: 3.8, height: 12.5 },
  { id: 'thesis',  en: 'The Defense',   jp: '論文', sub: 'My PhD, explained like you are five', href: null, style: 'shrine', footprint: 3.6, height: 7 },
  { id: 'flow',    en: 'The Flow',      jp: '流れ', sub: 'Music I make, with Google Flow visuals', href: 'https://www.flowmusic.app/playlist/cb6cb429-cafb-4434-85b5-06bed869db8b', external: true, cta: 'Listen', style: 'stage', footprint: 3.8, height: 6.5 },
  { id: 'path',    en: 'The Path',      jp: '道',   sub: 'Experience and education', href: 'experience.html', style: 'gate', footprint: 3.2, height: 7.5 },
  { id: 'kage',    en: 'Kage',          jp: '影',   sub: 'Ask my AI companion anything', href: 'kage.html', style: 'lanternTower', footprint: 2.6, height: 9 },
];

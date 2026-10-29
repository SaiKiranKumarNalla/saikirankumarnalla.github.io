// One building per section. `style` picks the procedural model in props.js.
// `footprint` is the collision radius; `height` places the floating label.
export const BUILDINGS = [
  { id: 'dojo', kage: 'The Dōjō. Who Sai is: Hyderabad to Paris to Toulouse, a scientist who also writes fiction.',    en: 'The Dōjō',      jp: '道場', sub: 'Who I am: the ronin behind the research', href: 'about.html',     style: 'pagoda', tiers: 2, footprint: 4.2, height: 9 },
  { id: 'forge', kage: 'The Forge. CASSOULET, VeriTomiX, Flow Lab… everything Sai has hammered into shape.',   en: 'The Forge',     jp: '鍛冶', sub: 'Projects: CASSOULET, VeriTomiX, Flow Lab and more', href: 'projects.html', style: 'forge',  footprint: 4.4, height: 7 },
  { id: 'scrolls', kage: 'The Scrolls. Papers and preprints on 3D-printed phantoms and PET simulation.', en: 'The Scrolls',   jp: '巻物', sub: 'Papers, preprints and talks', href: 'papers.html', style: 'library', footprint: 4.2, height: 7.5 },
  { id: 'builder', kage: "The Builder. See those lights circling the roof? Those are his AI agents. He's the one who checks their homework.", en: 'The Builder',   jp: '工房', sub: 'How I build with teams of AI agents', href: 'builder.html', style: 'tower', tiers: 3, footprint: 3.8, height: 12.5 },
  { id: 'thesis', kage: "The Defense. Sai's PhD, told so simply a five-year-old could follow. Its doors open soon.",  en: 'The Defense',   jp: '論文', sub: 'My PhD, explained like you are five', href: null, style: 'shrine', footprint: 3.6, height: 7 },
  { id: 'flow', kage: "The Flow. Listen closely: that's Sai's music. Step in to play it.",    en: 'The Flow',      jp: '流れ', sub: 'Music I make, with Google Flow visuals', href: 'https://www.flowmusic.app/playlist/cb6cb429-cafb-4434-85b5-06bed869db8b', external: true, cta: 'Listen', style: 'stage', footprint: 3.8, height: 6.5 },
  { id: 'path', kage: 'The Path. Every lab, hospital and startup Sai has trained in.',    en: 'The Path',      jp: '道',   sub: 'Experience and education', href: 'experience.html', style: 'gate', footprint: 3.2, height: 7.5 },
  { id: 'kage', kage: 'My lantern! Step inside and you can ask me anything, about Sai or about the world.',    en: 'Kage',          jp: '影',   sub: 'Ask my AI companion anything', href: 'kage.html', style: 'lanternTower', footprint: 2.6, height: 9 },
];

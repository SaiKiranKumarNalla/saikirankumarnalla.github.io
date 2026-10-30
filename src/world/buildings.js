// One building per section. `panel` is the content panel it opens; `style` picks the model in props.js.
// `footprint` is the collision radius; `height` places the floating label.
export const BUILDINGS = [
  { id: 'dojo', panel: 'education', label: 'Education', jp: '道場', en: 'The Dōjō', style: 'pagoda', tiers: 2, footprint: 4.2, height: 9,
    kage: 'The Dōjō. Where Sai trained: PhD, Master\'s and Bachelor\'s.' },
  { id: 'path', panel: 'experience', label: 'Experience', jp: '道', en: 'The Path', style: 'gate', footprint: 3.2, height: 7.5,
    kage: 'The Path. Where Sai has worked.' },
  { id: 'shrine', panel: 'about', label: 'About', jp: '神社', en: 'The Shrine', style: 'shrine', footprint: 3.6, height: 7,
    kage: 'The Shrine. Who Sai is.' },
  { id: 'forge', panel: 'projects', label: 'Projects', jp: '鍛冶', en: 'The Forge', style: 'forge', footprint: 4.4, height: 7,
    kage: 'The Forge. The tools and ventures Sai has built.' },
  { id: 'scrolls', panel: 'publications', label: 'Publications', jp: '巻物', en: 'The Scrolls', style: 'library', footprint: 4.2, height: 7.5,
    kage: 'The Scrolls. Every paper, preprint and talk.' },
  { id: 'lantern', panel: 'contact', label: 'Reach Out', jp: '縁', en: 'The Lantern', style: 'lanternTower', footprint: 2.6, height: 9,
    kage: 'The Lantern. Light it and Sai will hear from you.' },
];

// Top-menu order (same as the section pages' menu).
export const MENU = ['about', 'experience', 'education', 'projects', 'publications', 'contact'];

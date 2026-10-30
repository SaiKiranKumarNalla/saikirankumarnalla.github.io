// One building per section. `panel` is the content panel it opens; `style` picks the model in props.js.
// `footprint` is the collision radius; `height` places the floating label.
export const BUILDINGS = [
  { id: 'dojo', panel: 'about', label: 'About', jp: '道場', en: 'The Dōjō', style: 'pagoda', tiers: 2, footprint: 4.2, height: 9,
    kage: 'The Dōjō. Who Sai is, and where he trained.' },
  { id: 'forge', panel: 'projects', label: 'Projects', jp: '鍛冶', en: 'The Forge', style: 'forge', footprint: 4.4, height: 7,
    kage: 'The Forge. The tools and ventures Sai has built.' },
  { id: 'scrolls', panel: 'publications', label: 'Publications', jp: '巻物', en: 'The Scrolls', style: 'library', footprint: 4.2, height: 7.5,
    kage: 'The Scrolls. Every paper, preprint and talk.' },
  { id: 'builder', panel: 'builder', label: 'Agentic AI', jp: '工房', en: 'The Workshop', style: 'tower', tiers: 3, footprint: 3.8, height: 12.5,
    kage: 'The Workshop. The lights on the roof are his AI agents.' },
  { id: 'shrine', panel: 'research', label: 'PhD Thesis', jp: '論文', en: 'The Shrine', style: 'shrine', footprint: 3.6, height: 7,
    kage: 'The Shrine. His PhD, and the research that came after it.' },
  { id: 'flow', panel: 'music', label: 'Music', jp: '流れ', en: 'The Stage', style: 'stage', footprint: 3.8, height: 6.5,
    kage: 'The Stage. Sai makes music too.' },
  { id: 'path', panel: 'life', label: 'Off the Clock', jp: '道', en: 'The Path', style: 'gate', footprint: 3.2, height: 7.5,
    kage: 'The Path. Where Sai goes when the lab is closed: travel, stories, music and games.' },
  { id: 'lantern', panel: 'contact', label: 'Contact', jp: '縁', en: 'The Lantern', style: 'lanternTower', footprint: 2.6, height: 9,
    kage: 'The Lantern. Light it and Sai will hear from you.' },
];

// Top-menu order (the music stage is reachable in the scene and from the About panel).
export const MENU = ['about', 'research', 'projects', 'publications', 'builder', 'contact'];

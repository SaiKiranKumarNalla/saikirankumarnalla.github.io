// Visuals for skills that have no brand logo.
// Competencies get a faceted gem (hexagon with shaded facets, tinted by domain) carrying a small line
// glyph for the method. Logo-less tools (DICOM, TotalSegmentator, the AFM) get a small multi-colour
// emblem drawn with gradients, shown on the same white disc as the brand logos.

export const DOMAIN_HUE = {
  imaging: '#d0473f',
  sim: '#3b82c4',
  code: '#7a5fd0',
  agents: '#d29a2a',
  creative: '#2aa392',
  lab: '#6f9a35',
};

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (h, t, k) => {
  const a = hex2rgb(h), b = t === 'w' ? [255, 255, 255] : [12, 8, 14];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
};

// Line glyphs on a 24-unit grid, drawn white on the gem's table.
const GLYPH = {
  petsim: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M4.5 7l15 10"/>',
  recon: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 3.5V8h-4.5"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  quant: '<path d="M4 20h16"/><path d="M7 20v-6M12 20V7M17 20v-9"/>',
  radiomics: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"/>',
  dynamic: '<path d="M3.5 20h17M3.5 20V4"/><path d="M5.5 18c2-9 4-11 6-9s5 5 9 5"/>',
  genpet: '<path d="M12 2.5v4.5M12 17v4.5M2.5 12H7M17 12h4.5"/><path d="M12 7.5l1.6 2.9L16.5 12l-2.9 1.6L12 16.5l-1.6-2.9L7.5 12l2.9-1.6z"/>',
  surrogate: '<path d="M13.5 2.5L5.5 13.5h5.5l-1 8 8.5-11.5h-5.5z"/>',
  dosimetry: '<circle cx="12" cy="12" r="1.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(-60 12 12)"/>',
  cfd: '<path d="M2.5 7.5c4-3 7 3 11 0s5.5-2 8-1"/><path d="M2.5 12.5c4-3 7 3 11 0s5.5-2 8-1"/><path d="M2.5 17.5c4-3 7 3 11 0s5.5-2 8-1"/>',
  transport: '<circle cx="6" cy="12" r="2.8"/><circle cx="12.5" cy="7.5" r="1.8"/><circle cx="13" cy="16" r="1.8"/><circle cx="19" cy="5.5" r="1"/><circle cx="19.5" cy="12" r="1"/><circle cx="18.5" cy="18.5" r="1"/>',
  vcycle: '<path d="M3 4.5l9 15 9-15"/><path d="M6.8 10.8h10.4"/>',
  vlm: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  hitl: '<circle cx="12" cy="6" r="2.8"/><path d="M6.5 20.5c0-3.8 2.4-6.5 5.5-6.5s5.5 2.7 5.5 6.5"/><circle cx="3.5" cy="11" r="1.6"/><circle cx="20.5" cy="11" r="1.6"/>',
  print: '<path d="M9 2.5h6v4l-3 3-3-3z"/><path d="M6 12.5h12M4.5 16h15M3.5 19.5h17"/>',
  phantoms: '<ellipse cx="12" cy="5.5" rx="8" ry="2.6"/><path d="M4 5.5v12.5c0 1.4 3.6 2.6 8 2.6s8-1.2 8-2.6V5.5"/><circle cx="9" cy="12.5" r="1.8"/><circle cx="15" cy="14" r="2.4"/>',
  microfluidics: '<path d="M2.5 7.5h19M2.5 16.5h19"/><circle cx="8" cy="12" r="2.2"/><circle cx="15.5" cy="12" r="2.2"/>',
  exvivo: '<path d="M12 21.5V10"/><path d="M12 9.5c-3-2-3-5 0-7 3 2 3 5 0 7z"/><path d="M5.5 15a6.5 6.5 0 0 0 13 0"/>',
};

// A cut gem seen from above: outer hexagon, inner table, six facets lit from the top left.
function gemSvg(id, domain) {
  const base = DOMAIN_HUE[domain] || '#888888';
  const P = (r, k) => { const a = (-90 + k * 60) * Math.PI / 180; return [16 + r * Math.cos(a), 16 + r * Math.sin(a)]; };
  const outer = [0, 1, 2, 3, 4, 5].map((k) => P(15, k)), inner = [0, 1, 2, 3, 4, 5].map((k) => P(9.2, k));
  // Facet k spans outer k..k+1; its light depends on which way it faces.
  const shade = [0.42, 0.18, -0.25, -0.45, -0.12, 0.3];
  const facets = shade.map((s, k) => {
    const a = outer[k], b = outer[(k + 1) % 6], c = inner[(k + 1) % 6], d = inner[k];
    const fill = s >= 0 ? mix(base, 'w', s) : mix(base, 'k', -s);
    return `<path d="M${a}L${b}L${c}L${d}Z" fill="${fill}"/>`;
  }).join('');
  const table = `M${inner.join('L')}Z`;
  const g = GLYPH[id] || GLYPH.quant;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(base, 'w', 0.12)}"/><stop offset="1" stop-color="${mix(base, 'k', 0.18)}"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>${facets}<path d="${table}" fill="url(#t)"/><path d="${table}" fill="url(#s)"/><path d="M${outer.join('L')}Z" fill="none" stroke="${mix(base, 'k', 0.5)}" stroke-opacity=".55" stroke-width=".8" stroke-linejoin="round"/><g transform="translate(16 16) scale(.46) translate(-12 -12)" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${g}</g></svg>`;
}

// Emblems for tools without a usable logo (24-unit grid, drawn on a white disc).
const EMBLEM = {
  // A stack of three scan slices with a body section on the top one.
  dicom: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb2e6"/><stop offset="1" stop-color="#2d5f9e"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a8fcf"/><stop offset="1" stop-color="#1f477c"/></linearGradient></defs><path d="M3 16.5l9-4.2 9 4.2-9 4.2z" fill="#1c3a63"/><path d="M3 12.5l9-4.2 9 4.2-9 4.2z" fill="url(#b)"/><path d="M3 8.5l9-4.2 9 4.2-9 4.2z" fill="url(#a)"/><ellipse cx="12" cy="8.5" rx="4.2" ry="1.9" fill="none" stroke="#fff" stroke-width="1.1"/><ellipse cx="12" cy="8.6" rx="1.3" ry=".7" fill="#fff"/>',
  // A torso with organs in segmentation-overlay colours.
  totalseg: '<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e4f1"/><stop offset="1" stop-color="#c9c0d8"/></linearGradient></defs><path d="M7 2.5h10c1.5 0 2.5 1 2.6 2.5l.9 14.5c.1 1.2-.8 2-2 2H5.5c-1.2 0-2.1-.8-2-2l.9-14.5C4.5 3.5 5.5 2.5 7 2.5z" fill="url(#t)" stroke="#8d82a3" stroke-width=".7"/><path d="M8.2 5c-1.6.4-2.4 2.4-2.2 5 .1 1.2 1.6 1.4 2.6.6.9-.7 1-3.8.6-5.2-.2-.4-.5-.5-1-.4z" fill="#4f8fd8"/><path d="M15.8 5c1.6.4 2.4 2.4 2.2 5-.1 1.2-1.6 1.4-2.6.6-.9-.7-1-3.8-.6-5.2.2-.4.5-.5 1-.4z" fill="#4f8fd8"/><path d="M11 8.8c.6-.9 2.6-.8 2.7.6.1 1.6-1.6 2.4-2.4 2.3-1-.2-.9-2.1-.3-2.9z" fill="#e0475a"/><path d="M6.4 12.6c2.6-.6 5.6-.4 6.6.6.4 1.4-1.2 2.6-3.4 2.6-2 0-3.8-.9-3.2-3.2z" fill="#b5653a"/><path d="M14.4 13.2c1.4-.6 3-.5 3.4.4.2 1-.8 1.8-2.2 1.8-1 0-1.6-1.4-1.2-2.2z" fill="#8a5bc9"/><ellipse cx="8.4" cy="17.6" rx="1.2" ry="1.7" fill="#f09a2a"/><ellipse cx="15.6" cy="17.6" rx="1.2" ry="1.7" fill="#f09a2a"/><path d="M12 15.5v5" stroke="#6b6380" stroke-width="1.1" stroke-linecap="round"/>',
  // A cantilever with its tip over a rough sample, read by a laser.
  afm: '<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c2cc"/><stop offset="1" stop-color="#5d6772"/></linearGradient></defs><path d="M3 20.5c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" fill="none" stroke="#2d6f8f" stroke-width="1.6" stroke-linecap="round"/><rect x="2.5" y="6" width="6.5" height="4.5" rx="1" fill="url(#m)"/><path d="M8.5 8.2h9.5l-.3 1.5H8.5z" fill="#7c8792"/><path d="M15.8 9.7h1.9l-1 5.6z" fill="#3d4650"/><path d="M21.5 2.5l-4.2 5.8" stroke="#e0473a" stroke-width="1.2" stroke-linecap="round"/><path d="M17.3 8.3L13 3" stroke="#e0473a" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="1.6 1.2"/>',
};
const emblemSvg = (k) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${EMBLEM[k]}</svg>`;

const url = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
const cache = new Map();
// The image every skill shows: the brand logo, a crafted emblem, or the competency's gem.
export function iconUrl(s) {
  if (s.logo) return s.logo;
  if (!cache.has(s.id)) cache.set(s.id, url(s.emblem ? emblemSvg(s.emblem) : gemSvg(s.id, s.domain)));
  return cache.get(s.id);
}

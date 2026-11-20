# Working on this portfolio

This folder, `~/Downloads/sainalla-portfolio-v2`, is the only copy of the site. Do not create or edit other copies, such as `sainalla-portfolio-v2-3d` or anything in `~/Documents`.

- Branch: `main`. Pushing `main` deploys to https://saikirankumarnalla.github.io/ through GitHub Actions (`npm ci && npm run build`, which publishes `dist/`).
- Run locally: `npx vite` for the dev server, or `npx vite build` to build.
- Pages:
  - Home (3D village): `index.html` and `src/world/`.
  - Section pages: `sections/<name>.html` with `src/page3d/<name>.js`. Content lives in `content/*.json`.
- Link section pages as `/sections/<name>.html`.
- Media goes in `public/media/`. Use WebP for images and MP4 for video, keep files small, and don't keep duplicate copies.

Style rules from the owner:
- Professional 3D, not gamey.
- No emoji in the UI.
- English names first; Japanese only as an accent.
- Section pages use the layout kit (`src/page3d/layout.js` + `layout.css`; the API is documented at the top of `layout.js`), not a column of cards beside one fixed 3D canvas. Build each page from varied, page-wide blocks: full-bleed hero, alternating text/3D splits, wide 3D bands with an overlay caption, card grids, step/pipeline bands, timelines, stat strips, bar charts, figure galleries with the lightbox, tabs, accordions, callouts and a closing CTA band. Don't repeat the same block down the whole page.
- 3D lives in stages inside the layout. Split a page's scene into the parts each stage needs; only visible stages are drawn. The 3D never sits behind body text: overlay captions sit on a readable panel, and the hero copy sits on a scrim with the subject framed away from it.
- Every page works in both themes (`data-theme` on `<html>`) and on phones (~390px, everything stacks, no sideways scroll).
- Pages still on the old engine (`src/page3d/engine.js` + `page3d.css`: text cards on the left, one 3D canvas on the right) are being converted to the kit; don't start new pages on the engine. The VeriTomiX page (`sections/veritomix.html`) is a standalone organisation page with its own full-width layouts.
- Don't duplicate content across pages.
- Keep styles in the page's CSS file, not inline.

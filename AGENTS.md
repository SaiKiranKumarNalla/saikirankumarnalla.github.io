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
- Each page puts the 3D on the right and the text cards on the left, and the 3D never sits behind the cards.
- Don't duplicate content across pages.
- Keep styles in the page's CSS file, not inline.

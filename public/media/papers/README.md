# Paper thumbnails

The Publications page automatically looks for one image per paper:

    /media/papers/<paper id>.webp

If the file exists it is shown as the paper thumbnail (and opens full size on click).
If it is missing, a typographic placeholder (journal + year) is shown instead. Nothing else needs editing.

## How to add one

1. Take a screenshot or export of the paper's first page (or a key figure).
2. Resize to about 600 x 800 px (portrait) and save as WebP, quality ~80, ideally under 100 KB.
3. Name it exactly after the paper id and drop it in this folder (public/media/papers/).
4. Reload the page. No code change required.

Example: `cwebp -q 80 -resize 600 800 page1.png -o pesm2025.webp`

## Current paper ids (file names)

- pesm2025.webp  (published, 2025: Enhancing PET/CT target assessment with porous 3D printed gr)
- dualcentre.webp  (preprint, 2025: From Digital File to Transferable Phantom: A Dual-Centre Eva)
- quantreality.webp  (preprint, 2025: Quantitative Reality: A Physical Ground Truth to Assess Hete)
- mupet.webp  (preprint, 2025: MuPET (Multiphysics PET): Bridging Computational Mass Transp)
- geoanchored.webp  (in-preparation, 2026: From Physical Phantom to Clinical Background: A Geometry-Anc)
- cassoulet-ms.webp  (in-preparation, 2026: CASSOULET: a virtual PET reference for multicentre phantom e)
- virtualpet.webp  (in-preparation, 2026: From PET/CT to Virtual PET: An Agentic Framework with Human-)
- eanm2025.webp  (conference, 2025: 3D Printed PET/CT Phantom with Mixed Target Uptake Character)
- ecr2025.webp  (conference, 2025: Synthetic lesion insertion versus 3D-printed uniform targets)
- sfpm2024.webp  (conference, 2024: Porous 3D-printed grids for PET/CT)
- jbme2022.webp  (published, 2022: Effects of Gas Embolism on Pulsatile Flow Characteristics Wi)
- oceans2021.webp  (published, 2021: Systems Engineering V-Cycle Approach for Design and Developm)

Ids come from `content/publications.json` (the `id` field); a new paper added there gets the same behaviour automatically.

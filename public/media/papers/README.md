# Paper first-page images

Per paper id (content/publications.json), two WebP files:

- `<id>-thumb.webp`  card thumbnail, about 240 px wide, under 30 KB
- `<id>.webp`        readable first page, about 1400 px wide, under 250 KB (opens in the lightbox)

Set `"firstPage": true` on the paper in the JSON to use them. Papers without the flag show a typographic placeholder (journal + year).

Policy: only first pages of preprints (medRxiv) and own posters/abstracts. Published journal papers and unpublished manuscripts use the placeholder; the journal paper is linked via its DOI. Do not host publisher PDFs.

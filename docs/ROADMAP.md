# Portfolio v2: implementation roadmap

Working folder: `~/Documents/sainalla-portfolio-v2` (branch `v2-rebuild`; tag `v1-legacy` = GitHub state).
The old folder `~/Documents/sainalla.github.io` stays untouched. Each task is one session, reviewed before the next starts.

## Phase A: Foundation
- **A1. Content model.** `content/*.json`: profile, publications, thesis, projects, simulations, music, ai-builder, timeline.
  Fill it from CONTENT_INVENTORY.md and fix the GitHub handle.
- **A2. Asset pipeline.** Copy approved figures and GIFs into `assets/`, convert them to WebP/MP4 and strip metadata, and add a manifest.
- **A3. Tooling decision.** Vite plus vanilla modules (or Astro) builds to static files for GitHub Pages and keeps the current theme CSS.

## Phase B: Content pages (current ronin/dōjō theme, 2D)
- **B1. The Scrolls 2.0:** publications and preprints with filters, DOI badges, BibTeX copy, and status chips.
- **B2. The Defense:** thesis page with a slide viewer (Soutenance PDF), abstract in EN and FR, and the 4-study map.
- **B3. The Forge 2.0:** project cards for CASSOULET, VeriTomiX, VeriTomiX Office, ANIMUS Jobs, Flow Lab, the digital twin, and GitHub (live API).
- **B4. The Trials:** simulations gallery with GIFs/MP4s, the WebGL atlas embed, and before/after sliders (physical vs simulated).
- **B5. The Flow:** music player with Google Flow video visuals.
- **B6. The Builder:** the AI-builder page. Agentic workflow diagram, tool stack, "how I work with agents", and the generative PET/CT and dosimetry models.
- **B7. Refresh existing pages:** home, about, experience, recruiter, CV (post-PhD).

## Phase C: "Explain like I'm 5" motion stories
- **C1. Motion system:** a GSAP ScrollTrigger (or Motion One) component kit with clean, high-end styling, plus a reduced-motion fallback.
- **C2. Thesis story:** "How do we know the scanner tells the truth?" in about 8 scroll scenes (study arc in inventory §2).
- **C3. Project explainers:** CASSOULET ("a flight simulator for scanners"), VeriTomiX Office ("a company of AI coworkers"),
  ANIMUS ("a job-hunting sidekick"), Flow Lab, and the generative models.

## Phase D: Kage 2.0
- **D1. Secure worker:** system prompt on the server, current Claude model, streaming, KV rate limit, daily cost cap.
- **D2. Knowledge:** inject `content/*.json` and add tools (search_pubs, open_page, play_track, github_stats).
- **D3. Modes:** a recruiter JD-fit mode, an ELI5 mode, and a research mode that cites DOIs. Add an evaluation prompt set.

## Phase E: Full 3D world
- **E1.** Upgrade three.js and decide between a walkable village and scroll-driven 3D scenes.
- **E2.** Build the world shell (dōjō village; one building per section) with a 2D fallback and Recruiter Mode.
- **E3.** Add 3D exhibits: phantom cube, scanner ring, the atlas, and Kage as a 3D guide.

## Phase F: Launch
- **F1.** Performance, accessibility, SEO/OG and mobile QA (the nav overflows on phones on every page; needs a menu button).  **F2.** Merge to `main` and push (only with your OK).

## Performance rules (agreed 2026-10-28)
- No heavy PDFs online: the thesis and slides are told through the motion story and WebP stills, not hosted PDFs. The CV is the only PDF.
- Originals stay on the Mac. `npm run media` converts the files listed in `media/sources.local.tsv` (gitignored) into
  `public/media/`: WebP at 1600px plus a 640px thumb, and muted MP4 + WebM at 960px/24fps with a poster image. Metadata is stripped.
- Never publish real-body surface renders or debugging figures.

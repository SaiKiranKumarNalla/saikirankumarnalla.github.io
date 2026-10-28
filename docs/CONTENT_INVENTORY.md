# Portfolio v2: content inventory (Step 1)

Gathered 2026-10-28 from Documents, Downloads, `~/Jobagent`, `~/Downloads/cassoulet_sim`, `/Users/Shared/VeriTomiX`
and GitHub. Items marked **CONFIRM** need your check before they go public.

## 1. Identity & positioning (new)
- **Headline:** Medical imaging scientist × AI builder. PET/CT simulation, digital twins, agentic research workflows.
- **Now:** building small-scale generative / foundation models for PET/CT simulation and dosimetry (**CONFIRM**: I found
  no write-up of this work yet; send 3–5 lines: data, model type, goal, status).
- **Status:** PhD completed Sept 2026 (defense done, jury questions doc, thesis manuscript final). Update the site from "candidate" to "Dr." **CONFIRM** the title/date to show.
- **GitHub account is `SaiKiranKumarNalla`.** The old site links to `Sainalla82`, which does not exist on GitHub.

## 2. PhD thesis: "Evaluation of medical imaging devices using synthetically modified clinical images and 3D-printed phantoms"
Université de Toulouse · IUCT Oncopole · Rambam Health Care Campus. Supervisors: O. Caselles, J. Kennedy.
Partners: eMotion Tech (3D printing), GE HealthCare (simulation software).
Sources: `Documents/Thesis_Abstract_ADUM.docx`, `Soutenance_SaiNalla.pptx` (70 slides), `Thesis_dissertation_version_ADUM_corrected_v3.pdf`.

Story arc (ready for the "explained like you're 5" motion piece):
1. **Problem:** scanners give numbers that doctors trust for treatment, but there is no answer key to check them against.
2. **Tools:** 3D-printed porous phantoms (porosity sets the contrast: 50/60/70/75 % solidity → TBR 2.0–4.0),
   synthetic lesion insertion (DUETTO, then CASSOULET), and MATLAB/3D Slicer analysis.
3. **Study 1: Repeatability.** 36-cube phantom, DMI scanner. Contrast held; preparation drove day-to-day change. (PESM 2025, SFPM 2024)
4. **Study 1b: Uniform insertion.** Simulation matched mean contrast within ~0–6 %. (ECR 2025)
5. **Study 2: Two hospitals.** Same design files at two facilities met the ±10 % equivalence bounds. (Physica Medica, under revision EJMP-D-26-00590)
6. **Study 3: Heterogeneity.** Nested necrosis-like inserts, FDG and Ga-PSMA, Gini index and radiomics rank agreement ρ 0.76–0.92. (EANM 2025)
7. **Study 3b: CASSOULET simulator** reproduces heterogeneity trends.
8. **Study 4: Patient-derived lesions.** 8 TCIA lesion shapes, printed and also inserted into healthy-volunteer scans. Dice 0.67–0.92. (manuscript: *Geometry-Anchored Dual-Domain Framework*)

## 3. Publications & preprints
| # | Title | Venue / status | Link |
|---|---|---|---|
| 1 | Enhancing PET/CT target assessment with porous 3D printed grids: a pilot study | Phys Eng Sci Med 2025 | doi.org/10.1007/s13246-025-01687-y |
| 2 | From Digital File to Transferable Phantom: dual-centre multi-contrast phantom | medRxiv 2025, under revision at Physica Medica | doi.org/10.1101/2025.05.30.25328639 |
| 3 | Quantitative Reality: physical ground truth for heterogeneity | medRxiv 2025 | doi.org/10.1101/2025.11.26.25341036 |
| 4 | MuPET: mass-transport physics for synthetic PET data | medRxiv 2025 | doi.org/10.1101/2025.07.31.25332512 |
| 5 | 3D printed PET/CT phantom with mixed target uptake | EANM 2025 e-poster EP-0949 | — |
| 6 | Gas embolism and pulsatile flow in a human carotid artery | J Biomech Eng 2022 | doi.org/10.1115/1.4054679 |
| 7 | Geometry-Anchored Dual-Domain Framework for PET lesion ground truth | manuscript (**CONFIRM** if public) | — |
| 8 | CASSOULET Sim / Virtual PET reference manuscripts (5R/6R, 3D) | drafts, Oct 2026 (**CONFIRM**) | — |
| 9 | ECR 2025 (C-28068), SFPM 2024, GEETS 2026 talk/article | conference | `Downloads/ECR25_C-28068.pdf`, `Article_GEETS_NALLA.pdf` |

## 4. Projects
- **CASSOULET** (Compositional Anthropomorphic Spatial Synthesizer for ground-truth Lesion Export). PET/CT
  simulator with physics v2: GE DMI 5R, OMNI and Siemens Quadra models, DOI, TOF scatter, BSREM/OSEM, GPU on Colab A100/T4.
  It already has logos, a product brief, and publication figures (`figure_multicenter_physical_validation.png`, etc.).
- **VeriTomiX:** a venture concept (benchmarking-as-a-service for imaging AI, built on CASSOULET evidence). Strategy,
  grant and evidence decks are in Documents/Downloads.
  **VeriTomiX Virtual Office:** a native macOS app that runs an AI company of 8 department-head agents (Mira R&D,
  Noah Phantoms, Ada Product, Lina Clinical, Leo Partnerships, Iris IP/Ops, Atlas coordinator, Finn Finance) on
  Codex/Gemini CLIs, with local Llama-3.2 specialists via Ollama, Whisper, task queues, GPU allocation and meetings.
  Screenshot: `VeriTomiX Office.app/Contents/Resources/office.png`.
- **ANIMUS Jobs (Job agent):** a local-first AI career agent. Multi-source discovery, AI web radar, link
  verification by Claude/Codex, tailored CVs and letters, Fellowship Match, a game layer (XP, rarity tiers), kanban, calendar.
  Python, v0.6. **CONFIRM** whether it's public and where the repo is.
- **Flow Lab:** a parametric pulsatile flow phantom simulator with a GUI. Pulsatile flow, bladder storage, exchanging
  sphere, PET/CT quality. Animated GIF/MP4 outputs are ready to reuse.
- **Abdominal / human digital twin:** coupled FDG circulation and renal excretion, vascular splines, organ TACs, and a
  **WebGL anatomical atlas prototype** (`Abdominal_Phantom/Prototype_WebGL_Atlas_2026-10-18/atlas.html`), a good fit for the 3D site.
- **Patient population pipeline (Quadra):** PET/CT QC, functional compartments, heatmap viewer (Oct 2026).
- **Earlier work:** 3DynaPET (dynamic PET), Hepta Medical ablation toolbox, TEVAR/carotid CFD, LadHyX RBC drug delivery,
  Saint Joseph 3D-printed cardiology bench, AUV MEC.
- **Medical-AI self-learning** (public GitHub repo) plus the 45-day medical-imaging AI apprenticeship using a local Gemma tutor with Codex review.

## 5. AI builder profile (evidence for "AI enthusiast")
- Agent-native research: AGENTS.md/CLAUDE.md "constitutions" for CASSOULET (read-only originals, dated session folders,
  logged deviations), multi-model teams (Claude Code, Codex, Gemini, Antigravity, local Ollama), Colab GPU orchestration.
- More than 150 dated simulation sessions in October 2026 alone, run through agentic workflows.
- Products: VeriTomiX Office (multi-agent org), ANIMUS Jobs (agent with verification), Kage (site assistant).
- Generative media: Google Flow cinematic videos (owl GIFs and MP4s, Japanese animation, storyboard workflow).

## 6. Music / "Flow"
Tracks found: *Sangeethama*, *C'est une grâce*, *Shāpanang Theme (ENG)* with stems, *Vathsalyama*, *With Synth Lead
Melody* stems, and `shapnang_jukebbox`. Videos: Sangeethama.mp4, Shapnang Theme MP4, plus Google Flow AI clips.
**CONFIRM:** is "flow music" your AI-made music (Suno/Udio?) shown with Google Flow videos? Which tracks may be public?

## 7. GitHub (SaiKiranKumarNalla)
Public: `Medical-AI-self-learning-tasks`, `saikirankumarnalla.github.io`, `Self_Driving_Car_specialization`.
Private: `MuPET-Noise-Generator`, `PET-Lesion-Mask-Generator`. **CONFIRM** which to feature.

## 8. Do NOT publish
Personal IDs, payslips, housing, visa and bank documents. `office.json` (holds an email and security settings). Local paths and Colab account
details in AGENTS.md. Jury feedback reports. Patient-derived data beyond published figures.

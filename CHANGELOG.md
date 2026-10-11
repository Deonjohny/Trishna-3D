# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T08:54:20+05:30 — Rebuild Pitch Deck Around Requested Story

- Changed: Replaced the earlier pitch deck with a five-slide presentation: TRISHNA 3D introduction, problem statement, proposed solution, scalability, and sustainability. Updated the presentation link and refreshed the deck served by the app.
- Why: Match the requested storyline and keep the presentation clear and low-clutter.
- Validation: Rendered and inspected all five slides; package integrity and geometry validators passed with zero findings.
- Limitations: Sustainability benefits are framed as potential; the prototype does not measure material, energy, or carbon savings. The bundled finalizer remains blocked by sandbox `fs.realpath` EPERM.



## 2026-10-11T08:46:59+05:30 — Refined Pitch Presentation

- Changed: Created a spacious 7-slide deck at `presentation-output/Trishna 3D - Pitch Deck.pptx` and copied it to `public/Trishna 3D Pitch Deck.pptx`; updated the in-app download, README and submission link.
- Why: Make the project story easier to follow with consistent visuals, concise copy and more whitespace.
- Validation: Rendered and inspected all seven slides; package integrity and slide geometry checks passed with zero findings. TypeScript compilation passed; Vite bundling stopped because sandboxed `fs.realpath` returned `EPERM` for `index.html`.
- Limitations: The bundled presentation finalizer could not resolve the workspace directory in this Windows sandbox (`fs.realpath` returned `EPERM`); direct package and layout validators passed.


## 2026-10-11T08:00:00+05:30 — Final Polish & Documentation for Submission

- Changed: Completed `README.md`, `SUBMISSION.md`, `AI_USAGE.md`, and added `.env.example`. Aligned 16:9 widescreen presentation deck (`Trishna 3D ppt.pptx`) with balanced margins and UI download button.
- Why: Provide reproducible demo instructions, project overview, tech stack definitions, and complete hackathon submission documentation.
- Validation: Verified `npm run build` succeeds, server returns HTTP 200 on port 5173, and PowerPoint file validates at 2.1 MB.
- Limitations: None identified in these checks.

## 2026-10-11T07:35:00+05:30 — 16:9 Pitch Deck & UI Download Integration

- Changed: Created `generate_ppt.cjs` and produced `Trishna 3D ppt.pptx` covering Intro, Existing Tech, Our Tech, Tech Stack Definitions, Comparisons, and Conclusion. Added download button to `Dashboard.tsx`.
- Why: Deliver an automated, beautifully branded presentation for judges and stakeholders.
- Validation: Verified presentation generation via Node.js script and tested download link via Vite local server.
- Limitations: None.

## 2026-10-11T07:10:00+05:30 — Inward-Facing Doors & Collision-Free Circulation

- Changed: Configured procedural wall generator in `BuildingViewer3D.tsx` to orient all room doors inward towards internal corridors, eliminating external garden-facing openings except for the front entry. Made stairs and outdoor trees fully navigable without collision trapping.
- Why: Comply with user architectural safety specifications and enable fluid walkthrough navigation.
- Validation: Tested person walking mode across all rooms, stair core, and outdoor perimeter.
- Limitations: None.

## 2026-10-11T06:30:00+05:30 — Progressive Bottom-to-Top Build Timeline

- Changed: Implemented staged 7-second construction animation in `BuildingViewer3D.tsx` with cubic easing, foundation-to-terrace progression, and live HUD stage tracker.
- Why: Provide a visually engaging build transition that demonstrates how the multi-storey residence is erected from the ground up.
- Validation: Tested timeline replay button and verified smooth 60fps interpolation.
- Limitations: None.

## 2026-10-11T05:00:00+05:30 — 3-Floor Residence Architecture & Gemini Vision Ingestion

- Changed: Implemented `sampleResidencePlan.ts` representing the 10m × 14m 3-storey drawing sheet and built `geminiPlanAnalyzer.ts` and `parseFloorPlanPdf.ts` for PDF ingestion.
- Why: Reconstruct accurate 3D geometry matching user floor plans.
- Validation: Verified room boundaries, stairwell openings, and floor heights.
- Limitations: Scanned sketch parsing requires an active Gemini API key.

## 2026-10-11T03:30:00+05:30 — Pastel Green UI & Trishna 3D Brick Intro

- Changed: Built `TrishnaIntro.tsx` and updated theme styles (`architecture.css`, `trishna-intro.css`) with pastel green/mint colors (`#1E3D2F`, `#2D563F`, `#D5EBD9`).
- Why: Establish a cute, professional, branded design aesthetic.
- Validation: Verified animation timing, responsiveness, and replay capabilities.
- Limitations: None.

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included.

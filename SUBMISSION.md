# Project submission

Complete this file during the hackathon and use it to prepare your submission through the method announced by the organizers. Do not submit your project to the template repository.

## Project

- **Project name:** Trishna 3D
- **Short description:** Trishna 3D transforms complex 2D architectural blueprints, PDF layouts, and scanned floor plans into interactive, true-to-scale 3D multi-storey walkthrough environments in seconds. Featuring progressive bottom-to-top construction timelines, continuous multi-storey stair kinematics, and privacy-first inward-facing doors, it empowers architects, engineers, and home buyers to experience their future home before a single brick is laid.
- **Code repository URL:** https://github.com/Deonjohny/Trishna-3D
- **Final submitted implementation commit SHA:** 5ebbc5a0d2154516d5d65986c29642bd890834b9
- **Working demo URL or local demo steps:**
  1. Clone: `git clone https://github.com/Deonjohny/Trishna-3D.git`
  2. Install: `npm install`
  3. Start: `npm run dev`
  4. Open: `http://localhost:5173`
  5. Click **"Load 3-Floor Residence Model (10m × 14m)"** to experience the 7-second progressive build animation and switch to **Person Walk View** to freely climb stairs and explore all three floors.
  6. Demo video available in repository: [`demo vedio.mp4`](demo%20vedio.mp4)
  7. Pitch presentation: [`Trishna 3D ppt.pptx`](Trishna%203D%20ppt.pptx) (also downloadable directly inside the web UI)
- **Demo access requirements:** Modern web browser with WebGL 2.0 enabled. No mandatory paid API keys or cloud account required to run the local demo (offline architectural sample models and vector parsing are bundled).

## Participants

Participate solo or in a team of up to 4. Remove unused rows.

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| Deon Johny | @Deonjohny | End-to-end architecture: Three.js 3D diorama, bottom-to-top progressive construction animation, kinematic stair & inward door systems, Gemini Vision integration, and presentation generator |

## Run and demonstrate

- **Prerequisites and versions:** Node.js `>= 18.0.0` (tested on `v20.18.0`), npm `>= 9.0.0`
- **Install command:** `npm install`
- **Required environment variable names:** `VITE_GEMINI_API_KEY` (optional; for live Gemini AI parsing of newly uploaded custom drawings. Built-in models work 100% offline).
- **Start command:** `npm run dev`
- **Demo walkthrough:**
  1. **Intro Sequence:** Watch the pastel green brick building transition and Trishna 3D brand reveal.
  2. **Model Selection:** Click **"Load 3-Floor Residence Model (10m × 14m)"** to load the multi-storey residential plan from the architectural drawing sheet.
  3. **Progressive Construction:** Observe the 7-second bottom-to-top animation as the ground foundation, living hall, continuous stair core, upper villa, and terrace emerge chronologically with a live progress HUD.
  4. **First-Person Walkthrough:** Click **"Walk View"** (or press W/A/S/D). Walk through the main front entrance, note that every room's door opens inward upon approach, and freely climb the stair flights to the 1st floor and terrace without collision blocks.
  5. **Presentation Export:** Click **"📊 Download Trishna 3D PPT ↓"** to view the comprehensive 7-slide pitch presentation.
- **Checks performed and results:**
  - `npm run build` executed cleanly (`tsc -b && vite build`) with zero TypeScript errors.
  - Server responsiveness verified at `http://localhost:5173` (HTTP 200 OK).
  - Continuous collision and vertical stair step elevation verified across Ground, 1st, and 2nd floor levels.
- **Known limitations or incomplete features:**
  - Extreme complex spiral stair geometries fall back to continuous ramp-step kinematics.
  - Live AI vision analysis of non-standard hand sketches requires an active Gemini API key.
- **Libraries, APIs, and public datasets used:**
  - Three.js (r170) — WebGL rendering and spatial scene graph.
  - Google Gemini API (`gemini-1.5-flash`) — Blueprint OCR and semantic spatial reasoning.
  - PDF.js (v4.6) — In-browser PDF rasterization and vector rendering.
  - React 18 & TypeScript — UI state and type-safe architectural data structures.
  - PptxGenJS (v3.12) — Automated PowerPoint slide deck generator.
- **AI usage record:** [AI_USAGE.md](AI_USAGE.md)
- **Development change log:** [CHANGELOG.md](CHANGELOG.md)

## Submission checklist

- [x] The project implementation started from scratch at the event.
- [x] I participated solo or with no more than 4 team members in total.
- [x] Codex was used during development and its usage is documented.
- [x] The code repository URL, short description, and working demo are provided.

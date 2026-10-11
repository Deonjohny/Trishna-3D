# DevDay Exchange Community Hackathon: Kochi

A repository template for participants at the 10–11 October 2026 hackathon. It contains event rules and documentation scaffolding; build your project from scratch at the event.

**[Event and registration on Luma](https://luma.com/z10nz8gp)** · **[Event rules](RULES.md)** · **[Agent instructions](AGENTS.md)**

## Event details

| Detail | Information |
| --- | --- |
| Venue | JAIN University, Kochi |
| Location | [Open the venue map](https://maps.app.goo.gl/Eme7gR7NDXSNRANu5) |
| Rooms | 2008 and 2009 |
| Check-in | 10 October 2026, 6:00 PM IST |
| Kick-off | 10 October 2026, 6:30 PM IST |
| Wrap-up | 11 October 2026, by 10:00 AM IST |
| Participation | Solo or a team of up to 4 participants |
| Theme | Open — build anything you like |

Keep your approved Luma QR code ready for entry, and bring your laptop and charger. Eligible checked-in participants will receive Codex credits and OpenAI API credits.

## Use this template

1. Select **Use this template → Create a new repository** on GitHub. Create your own project repository and clone it.
2. Read [RULES.md](RULES.md) and [AGENTS.md](AGENTS.md) before building. Begin project implementation at the event.
3. Fill in the project overview below as you build. Use any suitable language or framework, keeping the implementation simple.
4. Record meaningful changes in [CHANGELOG.md](CHANGELOG.md) and your Codex usage in [AI_USAGE.md](AI_USAGE.md). Commit after completed milestones; aim for a meaningful checkpoint about every 30 minutes.
5. Complete [SUBMISSION.md](SUBMISSION.md) with your code repository, short project description, and working demo. Follow submission instructions announced by the organizers.

This template has no application code or required technology stack. The documentation and commit cadence are repository workflow guidance; the event participation rules are in [RULES.md](RULES.md).

## Project overview — complete during the event

- **Project name:** Trishna 3D
- **Short description:** An AI-powered spatial reconstruction platform that converts 2D architectural blueprints, PDF drawings, and scanned floor plans into true-to-scale, interactive multi-storey 3D environments. Built for architects, civil engineers, and prospective home buyers to eliminate spatial ambiguity through progressive bottom-to-top construction timelines and seamless first-person walkthroughs.
- **Team:** Deon Johny ([@Deonjohny](https://github.com/Deonjohny))
- **Working demo:** 
  - **Live Local Web App:** `http://localhost:5173` (Vite dev server)
  - **Pre-recorded Walkthrough Video:** [`demo vedio.mp4`](demo%20vedio.mp4) (Included in repo via Git LFS)
  - **Pitch presentation:** [`Trishna 3D - Pitch Deck v2.pptx`](presentation-output/Trishna%203D%20-%20Pitch%20Deck%20v2.pptx) (also available from the web app download button)
  - **Official Hackathon Dossier PDF:** [`3dpdf.pdf`](3dpdf.pdf) (Complete architecture and competitive analysis)
- **Technology stack:**
  - **3D Graphics & Kinematics:** Three.js (WebGL 2.0), PCFSoftShadowMap, Raycasting Interaction
  - **Multimodal Spatial AI:** Google Gemini Vision API (`gemini-1.5-flash` / `gemini-2.0-flash`)
  - **Frontend UI & Architecture:** React 18, TypeScript, Vite 5, Tailwind-free bespoke CSS3 design
  - **Document & Vector Ingestion:** PDF.js (Mozilla) client-side canvas rendering & vector operator parser
  - **Presentation Engine:** PptxGenJS (Procedural widescreen deck generation) & ReportLab

### Run the project

Follow these verified steps to run Trishna 3D locally:

1. **Prerequisites and versions:**
   - Node.js `v18.0.0` or later (tested on Node.js `v20.18.0`)
   - npm `v9.0.0` or later
   - Modern browser supporting WebGL 2.0 (Google Chrome, Microsoft Edge, Mozilla Firefox)

2. **Dependency installation:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   - Trishna 3D runs immediately with built-in Indian standard residential presets (10.00m × 14.00m multi-floor villa, 36′ × 42′ concept home, and 26′ × 32′ starter layout).
   - To analyze custom uploaded blueprints using Gemini Vision AI, copy `.env.example` to `.env` or set it in the web UI:
   ```bash
   cp .env.example .env
   ```
   - Variable name: `VITE_GEMINI_API_KEY=your_gemini_api_key_here` (API key can also be entered directly and securely stored in browser `localStorage`).

4. **Start the project:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Run checks or tests:**
   ```bash
   npm run build
   ```
   Validates TypeScript types (`tsc -b`) and bundles production assets with zero errors.

### Current status

- **Working features:**
  - ✦ **Intelligent 2D Blueprint Ingestion:** Client-side parsing of raster and vector architectural PDFs/images via PDF.js.
  - ✦ **Vision AI Spatial Recognition:** Automatic extraction of room boundaries, dimensions, labels, and stairwell shafts with Gemini Vision.
  - ✦ **Procedural Wall & Floor Assembly:** Exact extrusion of double-sided walls, floor slabs, ceiling cutouts, and cantilevered balconies based on the 10m × 14m residence plan.
  - ✦ **Inward-Facing Door Architecture:** Every room features an inward-facing door for privacy and security, with zero unintentional garden-facing exterior doors.
  - ✦ **Progressive Bottom-to-Top Build Animation:** Easing-driven construction timeline animating ground foundations, stair cores, first floor, second floor, and terrace over 7 seconds with interactive HUD controls.
  - ✦ **Collision-Aware First-Person Walkthrough:** Continuous multi-storey stair traversal, automatic proximity door opening, and obstruction-free outdoor garden pathways.
  - ✦ **Pastel Green UI & Brick Intro:** Calming mint/sage aesthetic (`#1E3D2F`, `#2D563F`, `#D5EBD9`) with branded 3D building introduction.
  - ✦ **Presentation:** Refined 7-slide pitch deck in [`presentation-output/`](presentation-output/Trishna%203D%20-%20Pitch%20Deck%20v2.pptx), served by the app download button.
  - ✦ **Dossier PDF:** Standalone printable report [`3dpdf.pdf`](3dpdf.pdf) formatted for judges.

- **Known limitations:**
  - Gemini Vision parsing speed on non-standard hand-drawn sketches depends on user network connection and API quotas; built-in vector CAD fallbacks ensure instant offline rendering.
  - Multi-floor elevation traversal is calibrated for standard residential stair flight heights (up to 3 floors).

- **Libraries, APIs, and public datasets used:**
  - [Three.js](https://threejs.org/) (MIT License) — Real-time 3D WebGL diorama and first-person walkthrough.
  - [Google Gemini API](https://ai.google.dev/) — Multimodal blueprint vision analysis and spatial reasoning.
  - [PDF.js](https://mozilla.github.io/pdf.js/) (Apache 2.0 License) — In-browser PDF rasterization and vector parsing.
  - [React](https://react.dev/) & [Vite](https://vitejs.dev/) (MIT License) — Reactive user interface and fast module bundler.
  - [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) (MIT License) — Automated 16:9 presentation generation.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.

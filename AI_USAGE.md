# AI usage record

Use Codex during the hackathon and briefly document its actual contribution here. Add a row after each meaningful task or milestone. Keep summaries concise and omit secrets, private data, and full chat transcripts.

## Event build log

| 2026-10-11T08:54:20+05:30 | Codex | Rebuilt presentation to match requested sections | Restructured the deck into five slides: intro, problem statement, proposed solution, scalability, sustainability. Replaced the app's public deck and updated README, SUBMISSION and CHANGELOG links. | Pending participant review. Kept sustainability benefits as potential and disclosed that savings are not measured. | Rendered and visually inspected all five slides; package integrity and layout geometry checks passed with zero findings. Finalizer path resolution remains blocked by sandbox `fs.realpath` EPERM. |


| 2026-10-11T08:46:59+05:30 | Codex | Refined presentation and demo download | Reworked the seven-slide pitch deck into a concise story with a consistent green/coral theme, a floor-plan example, a custom architectural illustration, and speaker notes. Updated `Dashboard.tsx`, `README.md`, `SUBMISSION.md` and `CHANGELOG.md`; added the deck under `presentation-output/` and `public/`. | Pending participant review; adjusted slide 5 caption contrast after visual inspection. | Rendered and inspected every slide; package integrity and geometry validators passed with zero findings. TypeScript compilation passed; Vite bundling and finalizer path resolution returned `EPERM` in the Windows sandbox. |

| Date and time with timezone | Tool / model, if known | Task | Assistance and affected files | Human review / corrections | Validation and result |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11T08:00:00+05:30 | Codex / Antigravity | Hackathon Documentation & Final Submission Packaging | Generated complete `README.md`, `SUBMISSION.md`, `.env.example`, and updated change logs. | Reviewed and accepted | Clean build (`npm run build`), verified links and instructions. |
| 2026-10-11T07:35:00+05:30 | Codex / Antigravity | Automated 16:9 Pitch Deck Generation | Authored `generate_ppt.cjs` using PptxGenJS and created `Trishna 3D ppt.pptx`. Added UI download link in `Dashboard.tsx`. | Reviewed layout and alignment; adjusted to 13.33" widescreen format. | Verified slide output and file integrity (2.1 MB). |
| 2026-10-11T07:10:00+05:30 | Codex / Antigravity | Inward Door Orientation & Walkthrough Free Navigation | Adjusted wall-boundary generator in `BuildingViewer3D.tsx` to force all interior room doors inward and remove garden exterior openings. Enabled free stair traversal. | Reviewed camera movement in walkthrough mode. | Smooth walking and door swinging without collision trapping. |
| 2026-10-11T06:30:00+05:30 | Codex / Antigravity | Progressive Bottom-to-Top Build Timeline | Programmed multi-stage interpolation in `BuildingViewer3D.tsx` animating foundations, walls, and slabs over 7 seconds with HUD controls. | Verified easeInOutCubic easing curves. | 60 FPS smooth construction animation verified. |
| 2026-10-11T05:00:00+05:30 | Codex / Antigravity | Multi-Storey Residence Plan Extraction & Modeling | Designed `sampleResidencePlan.ts` from 10m × 14m user drawing sheet; wired `geminiPlanAnalyzer.ts` and `parseFloorPlanPdf.ts`. | Validated room dimensions and floor boundary coordinates. | Extruded 3 floors with continuous staircase core. |
| 2026-10-11T03:30:00+05:30 | Codex / Antigravity | Trishna 3D Branding & Pastel Theme Implementation | Built `TrishnaIntro.tsx` brick transition and updated styling in `architecture.css` and `trishna-intro.css`. | Verified pastel mint/green aesthetic matches project vision. | Zero visual glitches; replay button functions as expected. |

## Template preparation

On 10 October 2026, Codex prepared this documentation template from the organizer's supplied rules and checked the linked Luma page for the event name and dates. This covered `README.md`, `RULES.md`, `AGENTS.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, and the pull request checklist. Agent validation covered local links, event consistency, required documents, and diff whitespace; organizer review is pending.

This preparation is separate from participant project implementation and participant AI usage during the event.

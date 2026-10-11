const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function generatePpt() {
  const pptx = new pptxgen();
  // Set modern 16:9 widescreen (13.333" x 7.5")
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Trishna 3D Team';
  pptx.company = 'Trishna 3D Studio';
  pptx.title = 'Trishna 3D Presentation';

  // Palette: Pastel Green / Mint Theme
  const C_BG = 'F4FAF6';
  const C_DARK_GREEN = '1E3D2F';
  const C_MID_GREEN = '2D563F';
  const C_MINT = 'D5EBD9';
  const C_ACCENT = 'C86348';
  const C_WHITE = 'FFFFFF';
  const C_GRAY = '526E60';
  const C_CARD = 'FFFFFF';
  const C_BORDER = 'C9E2D0';
  const C_TOP_BAR = '24563C';

  // Standard Page Layout Constants (Slide: 13.33" x 7.5")
  const PAGE_W = 13.333;
  const PAGE_H = 7.5;
  const MARGIN_X = 0.9;
  const CONTENT_W = 11.533; // 13.333 - 2 * 0.9 = 11.533

  // Helper for Top Decor & Slide Headers
  function addHeader(slide, category, title) {
    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.18,
      fill: { color: C_TOP_BAR }
    });

    // Category / Breadcrumb
    slide.addText(category, {
      x: MARGIN_X, y: 0.52, w: CONTENT_W, h: 0.3,
      fontSize: 11, bold: true, color: C_GRAY,
      charSpacing: 1.5
    });

    // Main Slide Heading
    slide.addText(title, {
      x: MARGIN_X, y: 0.85, w: CONTENT_W, h: 0.55,
      fontSize: 24, bold: true, color: C_DARK_GREEN
    });

    // Subtle divider line
    slide.addShape(pptx.ShapeType.line, {
      x: MARGIN_X, y: 1.48, w: CONTENT_W, h: 0,
      line: { color: C_BORDER, width: 1 }
    });

    // Footer
    slide.addText('Trishna 3D — Intelligent Architectural Reconstruction', {
      x: MARGIN_X, y: 7.05, w: 7.0, h: 0.3,
      fontSize: 9, color: '7A9688'
    });
  }

  // -------------------------------------------------------------
  // SLIDE 1: Title & Introduction
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    // Top banner bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.22,
      fill: { color: C_TOP_BAR }
    });

    // Left Column: Main Identity & Value Proposition
    // Monogram & Title
    slide.addShape(pptx.ShapeType.roundRect, {
      x: MARGIN_X, y: 1.25, w: 0.85, h: 0.85,
      fill: { color: C_MID_GREEN }
    });
    slide.addText('T', {
      x: MARGIN_X, y: 1.25, w: 0.85, h: 0.85,
      fontSize: 34, bold: true, color: C_WHITE,
      align: 'center', valign: 'middle'
    });

    slide.addText('Trishna 3D', {
      x: MARGIN_X + 1.05, y: 1.25, w: 6.2, h: 0.85,
      fontSize: 42, bold: true, color: C_DARK_GREEN,
      valign: 'middle'
    });

    // Tagline / Headline
    slide.addText('Next-Generation 2D Floor Plan → Intelligent 3D Multi-Storey Reconstruction', {
      x: MARGIN_X, y: 2.35, w: 6.8, h: 1.0,
      fontSize: 21, bold: true, color: C_MID_GREEN
    });

    // Descriptive overview
    slide.addText(
      'Instantly reconstructs real-scale 3D residential environments from standard 2D blueprints, raster plans, and CAD sheets. Features multi-storey continuous staircases, auto-detecting inward-facing doors, and progressive bottom-to-top construction transitions.',
      {
        x: MARGIN_X, y: 3.5, w: 6.8, h: 1.35,
        fontSize: 13.5, color: C_GRAY, lineSpacing: 20
      }
    );

    // 3 Feature Badges on Left
    const badges = [
      '✦  100% Client-Side WebGL 2.0 (Zero Server Latency)',
      '✦  Continuous Multi-Storey Stair Kinematics',
      '✦  Cinematic Bottom-to-Top Progressive Construction'
    ];
    badges.forEach((b, idx) => {
      const by = 5.05 + idx * 0.58;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: MARGIN_X, y: by, w: 6.8, h: 0.46,
        fill: { color: C_MINT }, line: { color: C_BORDER, width: 1.2 }
      });
      slide.addText(b, {
        x: MARGIN_X + 0.2, y: by, w: 6.4, h: 0.46,
        fontSize: 11, bold: true, color: C_DARK_GREEN, valign: 'middle'
      });
    });

    // Right Column: Architectural Highlights Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.35, y: 1.25, w: 4.1, h: 5.3,
      fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.5 }
    });

    slide.addText('SYSTEM SPECIFICATIONS', {
      x: 8.65, y: 1.55, w: 3.5, h: 0.35,
      fontSize: 11, bold: true, color: C_ACCENT, charSpacing: 1.2
    });

    slide.addText('Architectural Intelligence', {
      x: 8.65, y: 1.9, w: 3.5, h: 0.45,
      fontSize: 18, bold: true, color: C_DARK_GREEN
    });

    const specs = [
      { label: 'Supported Inputs', val: 'PDF (Vector/Raster), PNG, JPG, CAD Sheets' },
      { label: 'Map Fidelity', val: '100% boundary matching (10m × 14m specs)' },
      { label: 'Core Engine', val: 'Three.js WebGL + Google Gemini Vision' },
      { label: 'Navigation', val: 'Free First-Person + Orbit / Drone Mode' },
      { label: 'Door Physics', val: 'Auto-swing inward doors (secure perimeter)' },
      { label: 'Build Animation', val: 'Timed bottom-to-top progressive assembly' }
    ];

    specs.forEach((sp, sIdx) => {
      const sy = 2.5 + sIdx * 0.65;
      slide.addText(sp.label, {
        x: 8.65, y: sy, w: 3.5, h: 0.24,
        fontSize: 10, bold: true, color: C_GRAY
      });
      slide.addText(sp.val, {
        x: 8.65, y: sy + 0.22, w: 3.5, h: 0.38,
        fontSize: 11.5, bold: true, color: C_DARK_GREEN
      });
    });

    slide.addText('Trishna 3D Studio · 2026', {
      x: MARGIN_X, y: 7.05, w: 7.0, h: 0.3,
      fontSize: 9, color: '7A9688'
    });
  }

  // -------------------------------------------------------------
  // SLIDE 2: Problem Statement & Existing Tech
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };
    addHeader(slide, '01 / PROBLEM STATEMENT', 'Existing Technologies & Current Market Limitations');

    const existingPoints = [
      {
        tag: 'DESKTOP CAD',
        title: 'Legacy CAD & BIM Tools\n(AutoCAD / Revit / SketchUp)',
        points: [
          'High licensing costs and steep learning curves for clients and property buyers.',
          'Requires heavy dedicated GPU workstation hardware; impossible to share instantly on client browsers.',
          'Manual 3D modeling and texturing takes hours or days for multi-storey residential blueprints.'
        ]
      },
      {
        tag: '2D VIEWERS',
        title: 'Traditional Web 2D\nPlan Viewers',
        points: [
          'Static PDF or flat image displays with zero spatial depth, scale comprehension, or physics.',
          'Difficult for homeowners and non-architects to visualize room heights and circulation flow.',
          'Zero first-person walking walkthrough or multi-floor vertical staircase exploration.'
        ]
      },
      {
        tag: 'CLOUD RENDERERS',
        title: 'Generic Cloud 3D\nRendering Services',
        points: [
          'Require slow server-side asset baking with multi-minute remote queue wait times.',
          'Sensitive architectural documents and blueprints sent and stored on third-party servers.',
          'Lack intelligent automated room boundary recognition and multi-floor vertical stair core alignment.'
        ]
      }
    ];

    const cardW = 3.65;
    const gap = 0.29;

    existingPoints.forEach((card, idx) => {
      const x = MARGIN_X + idx * (cardW + gap);
      // Card Container
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.75, w: cardW, h: 5.0,
        fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.3 }
      });

      // Tag pill
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.25, y: 2.05, w: 1.5, h: 0.32,
        fill: { color: 'FDEEE9' }, line: { color: 'F5C8BA', width: 1 }
      });
      slide.addText(card.tag, {
        x: x + 0.25, y: 2.05, w: 1.5, h: 0.32,
        fontSize: 9, bold: true, color: C_ACCENT, align: 'center', valign: 'middle'
      });

      // Card Title
      slide.addText(card.title, {
        x: x + 0.25, y: 2.45, w: cardW - 0.5, h: 0.8,
        fontSize: 14, bold: true, color: C_DARK_GREEN
      });

      // Divider inside card
      slide.addShape(pptx.ShapeType.line, {
        x: x + 0.25, y: 3.3, w: cardW - 0.5, h: 0,
        line: { color: 'E5ECE7', width: 1 }
      });

      // Bullet points
      const bullets = card.points.map(p => ({
        text: p + '\n\n',
        options: { fontSize: 11, color: C_GRAY, lineSpacing: 16 }
      }));
      slide.addText(bullets, {
        x: x + 0.25, y: 3.45, w: cardW - 0.5, h: 3.1,
        bullet: true
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 3: Our Solution — Trishna 3D
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };
    addHeader(slide, '02 / OUR INNOVATION', 'Our Technology: Automated Spatial Intelligence & Rebuild Engine');

    const solutions = [
      {
        num: '01',
        title: 'Instant 2D Plan Recognition',
        desc: 'Processes both scanned raster PDFs/PNGs via Google Gemini Multimodal Vision AI and native vector CAD drawings with sub-second parsing and intelligent room label classification.'
      },
      {
        num: '02',
        title: 'Mathematical 3D Assembly',
        desc: 'Procedurally computes exact wall coordinates, thickness, door frames, windows, continuous floor slabs, and cantilevered balconies with 100% scale fidelity to the input plan.'
      },
      {
        num: '03',
        title: 'Bottom-to-Top Construction Transition',
        desc: 'Realistic timed architectural build-up animation showing ground foundation, upper villas, partition walls, and roof terrace rising progressively with live HUD progress indicators.'
      },
      {
        num: '04',
        title: 'Seamless First-Person Walkthrough',
        desc: 'Free multi-floor navigation through stair portals, inward-facing auto-opening doors, collision-free trees, and outdoor plinth grounds with smooth camera ergonomics.'
      }
    ];

    const colW = 5.62;
    const colGap = 0.29;
    const rowH = 2.35;
    const rowGap = 0.3;

    solutions.forEach((s, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = MARGIN_X + col * (colW + colGap);
      const y = 1.75 + row * (rowH + rowGap);

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: colW, h: rowH,
        fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.4 }
      });

      // Number badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3, y: y + 0.3, w: 0.65, h: 0.65,
        fill: { color: C_MINT }
      });
      slide.addText(s.num, {
        x: x + 0.3, y: y + 0.3, w: 0.65, h: 0.65,
        fontSize: 18, bold: true, color: C_MID_GREEN, align: 'center', valign: 'middle'
      });

      // Title
      slide.addText(s.title, {
        x: x + 1.15, y: y + 0.3, w: colW - 1.4, h: 0.45,
        fontSize: 16, bold: true, color: C_DARK_GREEN
      });

      // Desc
      slide.addText(s.desc, {
        x: x + 1.15, y: y + 0.8, w: colW - 1.4, h: 1.35,
        fontSize: 11.5, color: C_GRAY, lineSpacing: 17
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 4: Tech Stack Overview
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };
    addHeader(slide, '03 / ARCHITECTURE & STACK', 'Complete Technology Stack & Roles in Trishna 3D');

    const stack = [
      {
        tech: 'Three.js (WebGL 2.0)',
        role: '3D Real-Time Graphics Engine',
        desc: 'Renders 60 FPS diorama, soft shadow mapping (PCFSoftShadowMap), filmic tone mapping, raycasting door interaction, and first-person camera walkthrough kinematics.'
      },
      {
        tech: 'Google Gemini Vision AI',
        role: 'Multimodal Spatial Recognition',
        desc: 'Extracts rooms, spatial dimensions, floor levels, stair cores, and functional types directly from complex raster drawing sheets & blueprint scans.'
      },
      {
        tech: 'React 18 & TypeScript',
        role: 'Component State & Architectural Schema',
        desc: 'Strict type safety for architectural schedules, procedural coordinate calculations, HUD timeline management, and responsive reactive rendering.'
      },
      {
        tech: 'PDF.js (Mozilla)',
        role: 'In-Browser Vector & Raster Parsing',
        desc: 'High-resolution viewport rasterization and vector text-operator clustering directly inside client browser memory with zero server uploads.'
      },
      {
        tech: 'Vite 5 & Modern CSS3',
        role: 'Build Pipeline & Pastel Green Aesthetic',
        desc: 'Sub-second Hot Module Replacement, zero backend latency, and responsive glassmorphic interfaces themed in calming pastel greens.'
      }
    ];

    const rowH = 0.9;
    const gap = 0.12;

    stack.forEach((item, idx) => {
      const y = 1.75 + idx * (rowH + gap);

      // Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: MARGIN_X, y, w: CONTENT_W, h: rowH,
        fill: { color: idx % 2 === 0 ? C_CARD : 'EDF6F0' },
        line: { color: C_BORDER, width: 1.1 }
      });

      // Tech Name
      slide.addText(item.tech, {
        x: MARGIN_X + 0.3, y: y + 0.12, w: 2.8, h: 0.36,
        fontSize: 13.5, bold: true, color: C_DARK_GREEN
      });

      // Role Pill
      slide.addShape(pptx.ShapeType.roundRect, {
        x: MARGIN_X + 0.3, y: y + 0.48, w: 2.8, h: 0.3,
        fill: { color: C_MINT }
      });
      slide.addText(item.role, {
        x: MARGIN_X + 0.3, y: y + 0.48, w: 2.8, h: 0.3,
        fontSize: 9.5, bold: true, color: C_MID_GREEN, align: 'center', valign: 'middle'
      });

      // Divider inside row
      slide.addShape(pptx.ShapeType.line, {
        x: MARGIN_X + 3.3, y: y + 0.15, w: 0, h: 0.6,
        line: { color: C_BORDER, width: 1 }
      });

      // Description
      slide.addText(item.desc, {
        x: MARGIN_X + 3.55, y: y + 0.15, w: CONTENT_W - 3.8, h: 0.62,
        fontSize: 11, color: C_GRAY, lineSpacing: 16
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 5: Deep Dive into Technologies
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };
    addHeader(slide, '04 / CORE TECHNOLOGY DEFINITIONS', 'Deep Dive Technical Definitions: How Each Module Operates');

    const techDefs = [
      {
        tag: 'GEOMETRY ENGINE',
        title: 'Procedural Wall & Door Engine',
        summary: 'Mathematical boundary parsing & inward-facing door automation',
        body: 'Automated boundary edge-matching algorithm with 0.9ft tolerance that detects adjacent rooms, generates shared partition walls, and places inward-facing doors while enforcing solid garden exterior walls. Guarantees 100% perimeter security with zero unintended exterior entrances.'
      },
      {
        tag: 'KINEMATICS SYSTEM',
        title: 'Collision & Stair Travel System',
        summary: 'Kinematic capsule navigation across multi-storey landings',
        body: 'Custom kinematic collision controller providing free stair traversal, height interpolation across multi-storey landings, auto-swinging door triggers, and 100% collision-free garden tree perimeters. Allows the user to seamlessly climb from ground level to upper storeys and terrace without getting trapped.'
      },
      {
        tag: 'TIMELINE ANIMATION',
        title: 'Progressive Stage Interpolation',
        summary: 'Bottom-to-top progressive construction animation',
        body: 'Physics-inspired bottom-to-top growth timeline using cubic easing curves (easeInOutCubic) to scale floor roots, extrude structural slabs, and raise partition walls sequentially across ground, first, and terrace levels. Provides an engaging 7-second visual building experience before enabling free walking.'
      }
    ];

    const cardW = 3.65;
    const gap = 0.29;

    techDefs.forEach((td, idx) => {
      const x = MARGIN_X + idx * (cardW + gap);
      // Card Container
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.75, w: cardW, h: 5.0,
        fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.3 }
      });

      // Tag
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.25, y: 2.05, w: 1.8, h: 0.32,
        fill: { color: C_MINT }, line: { color: 'BCE1C5', width: 1 }
      });
      slide.addText(td.tag, {
        x: x + 0.25, y: 2.05, w: 1.8, h: 0.32,
        fontSize: 9, bold: true, color: C_MID_GREEN, align: 'center', valign: 'middle'
      });

      // Title
      slide.addText(td.title, {
        x: x + 0.25, y: 2.45, w: cardW - 0.5, h: 0.8,
        fontSize: 15, bold: true, color: C_DARK_GREEN
      });

      // Divider inside card
      slide.addShape(pptx.ShapeType.line, {
        x: x + 0.25, y: 3.3, w: cardW - 0.5, h: 0,
        line: { color: 'E5ECE7', width: 1 }
      });

      // Summary
      slide.addText(td.summary, {
        x: x + 0.25, y: 3.42, w: cardW - 0.5, h: 0.45,
        fontSize: 10.5, bold: true, color: C_ACCENT
      });

      // Body
      slide.addText(td.body, {
        x: x + 0.25, y: 3.92, w: cardW - 0.5, h: 2.6,
        fontSize: 11, color: C_GRAY, lineSpacing: 17
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 6: Screenshots & Visual Evidence
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };
    addHeader(slide, '05 / SYSTEM SCREENSHOTS & COMPARISON', 'Visual Evidence: 2D Blueprint Input vs Real-Time 3D Output');

    const cardW = 5.62;
    const cardGap = 0.29;

    // Left card: Input Drawing Sheet
    slide.addShape(pptx.ShapeType.roundRect, {
      x: MARGIN_X, y: 1.75, w: cardW, h: 5.0,
      fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.4 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: MARGIN_X + 0.25, y: 1.95, w: 1.2, h: 0.28,
      fill: { color: 'FDEEE9' }
    });
    slide.addText('INPUT', {
      x: MARGIN_X + 0.25, y: 1.95, w: 1.2, h: 0.28,
      fontSize: 9, bold: true, color: C_ACCENT, align: 'center', valign: 'middle'
    });

    slide.addText('10.00m × 14.00m Multi-Floor Drawing Sheet', {
      x: MARGIN_X + 1.55, y: 1.95, w: cardW - 1.8, h: 0.35,
      fontSize: 13, bold: true, color: C_DARK_GREEN
    });

    if (fs.existsSync('public/extracted.png')) {
      slide.addImage({
        path: 'public/extracted.png',
        x: MARGIN_X + 0.25, y: 2.4, w: cardW - 0.5, h: 3.75,
        sizing: { type: 'contain', w: cardW - 0.5, h: 3.75 }
      });
    }

    slide.addText('Multi-floor sheet (Ground, First, Second Floor) with room dimensions and continuous stair core.', {
      x: MARGIN_X + 0.25, y: 6.25, w: cardW - 0.5, h: 0.38,
      fontSize: 10, color: C_GRAY
    });

    // Right card: 3D Studio Architecture
    const rx = MARGIN_X + cardW + cardGap;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: rx, y: 1.75, w: cardW, h: 5.0,
      fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.4 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: rx + 0.25, y: 1.95, w: 1.2, h: 0.28,
      fill: { color: C_MINT }
    });
    slide.addText('OUTPUT', {
      x: rx + 0.25, y: 1.95, w: 1.2, h: 0.28,
      fontSize: 9, bold: true, color: C_MID_GREEN, align: 'center', valign: 'middle'
    });

    slide.addText('Real-Time 3D Walkthrough Studio in Three.js', {
      x: rx + 1.55, y: 1.95, w: cardW - 1.8, h: 0.35,
      fontSize: 13, bold: true, color: C_DARK_GREEN
    });

    if (fs.existsSync('public/user-floor-plan.png')) {
      slide.addImage({
        path: 'public/user-floor-plan.png',
        x: rx + 0.25, y: 2.4, w: cardW - 0.5, h: 3.75,
        sizing: { type: 'contain', w: cardW - 0.5, h: 3.75 }
      });
    }

    slide.addText('Free walking mode with inward-facing doors, solid slabs, and bottom-to-top construction transition.', {
      x: rx + 0.25, y: 6.25, w: cardW - 0.5, h: 0.38,
      fontSize: 10, color: C_GRAY
    });
  }

  // -------------------------------------------------------------
  // SLIDE 7: Conclusion & Summary
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };
    addHeader(slide, '06 / CONCLUSION & SUMMARY', 'Project Milestones, Quantitative Impact & Future Roadmap');

    const keyMetrics = [
      { num: '100%', label: 'Map Accuracy', desc: 'Exact reproduction of 10m × 14m drawings including attached baths, stairs & balconies.' },
      { num: '7 sec', label: 'Progressive Build', desc: 'Real-time stage-by-stage construction animation from ground to roof terrace.' },
      { num: '0 ms', label: 'Server Latency', desc: 'Runs entirely in the user’s browser with zero cloud render wait queues.' },
      { num: '3-Floor', label: 'Multi-Storey', desc: 'Fully walkable continuous staircase connecting all residential levels freely.' }
    ];

    const metricW = 2.72;
    const metricGap = 0.21;

    keyMetrics.forEach((m, idx) => {
      const x = MARGIN_X + idx * (metricW + metricGap);
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.75, w: metricW, h: 2.3,
        fill: { color: C_CARD }, line: { color: C_BORDER, width: 1.3 }
      });
      slide.addText(m.num, {
        x: x + 0.15, y: 1.95, w: metricW - 0.3, h: 0.65,
        fontSize: 28, bold: true, color: C_MID_GREEN, align: 'center'
      });
      slide.addText(m.label, {
        x: x + 0.15, y: 2.65, w: metricW - 0.3, h: 0.35,
        fontSize: 13, bold: true, color: C_DARK_GREEN, align: 'center'
      });
      slide.addText(m.desc, {
        x: x + 0.15, y: 3.05, w: metricW - 0.3, h: 0.85,
        fontSize: 10.5, color: C_GRAY, align: 'center', lineSpacing: 15
      });
    });

    // Summary Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: MARGIN_X, y: 4.35, w: CONTENT_W, h: 2.4,
      fill: { color: C_MID_GREEN }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: MARGIN_X + 0.35, y: 4.65, w: 1.6, h: 0.32,
      fill: { color: C_TOP_BAR }
    });
    slide.addText('FINAL VERDICT', {
      x: MARGIN_X + 0.35, y: 4.65, w: 1.6, h: 0.32,
      fontSize: 9, bold: true, color: C_MINT, align: 'center', valign: 'middle'
    });

    slide.addText(
      'Trishna 3D proves that modern browser technologies (Three.js WebGL) combined with multimodal vision AI can transform static 2D blueprints into walkable, photo-realistic, multi-storey architectural experiences with zero server wait times or workstation dependencies.',
      {
        x: MARGIN_X + 0.35, y: 5.08, w: CONTENT_W - 0.7, h: 0.8,
        fontSize: 13.5, color: C_WHITE, bold: true, lineSpacing: 19
      }
    );

    slide.addShape(pptx.ShapeType.line, {
      x: MARGIN_X + 0.35, y: 5.98, w: CONTENT_W - 0.7, h: 0,
      line: { color: '4B7B61', width: 1 }
    });

    slide.addText(
      'Future Scope: Automatic CAD DXF/IFC export, WebXR VR headset walkthroughs, and real-time collaborative multi-client spatial review.',
      {
        x: MARGIN_X + 0.35, y: 6.1, w: CONTENT_W - 0.7, h: 0.45,
        fontSize: 11.5, color: C_MINT
      }
    );
  }

  const outPath = 'Trishna 3D ppt.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log(`Presentation generated successfully at: ${outPath}`);

  // Also copy to public directory for direct browser download
  fs.copyFileSync(outPath, path.join('public', outPath));
  console.log(`Copied presentation to public/${outPath}`);
}

generatePpt().catch(console.error);

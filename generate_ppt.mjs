import pptxgen from 'pptxgenjs/dist/pptxgen.cjs';
import fs from 'fs';
import path from 'path';

async function generatePpt() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
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
  const C_GRAY = '607D6D';
  const C_CARD = 'FFFFFF';

  // -------------------------------------------------------------
  // SLIDE 1: Title & Introduction
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.25,
      fill: { color: C_MID_GREEN }
    });

    // Monogram & Title
    slide.addText('T', {
      x: 0.8, y: 1.6, w: 1.1, h: 1.1,
      fontSize: 44, bold: true, color: C_WHITE,
      align: 'center', valign: 'middle',
      fill: { color: C_MID_GREEN },
      shape: pptx.ShapeType.roundRect
    });

    slide.addText('Trishna 3D', {
      x: 2.1, y: 1.6, w: 9.0, h: 1.1,
      fontSize: 48, bold: true, color: C_DARK_GREEN,
      fontFace: 'Arial'
    });

    slide.addText('Next-Generation 2D Floor Plan → Intelligent 3D Multi-Storey Reconstruction', {
      x: 0.8, y: 3.0, w: 11.5, h: 0.6,
      fontSize: 20, bold: true, color: C_MID_GREEN
    });

    slide.addText('Bridging CAD blueprints, AI vision recognition, and interactive WebGL architectural walkthroughs in real-time.', {
      x: 0.8, y: 3.7, w: 10.5, h: 0.8,
      fontSize: 15, color: C_GRAY
    });

    // 3 Feature Pills
    const badges = [
      { t: '✦ 100% Client-Side WebGL', x: 0.8 },
      { t: '✦ Multi-Storey Stair Cores', x: 4.2 },
      { t: '✦ Dynamic Construction Animation', x: 7.6 }
    ];
    badges.forEach(b => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: b.x, y: 5.2, w: 3.1, h: 0.6,
        fill: { color: C_MINT }, line: { color: 'BCE1C5', width: 1.5 }
      });
      slide.addText(b.t, {
        x: b.x, y: 5.2, w: 3.1, h: 0.6,
        fontSize: 12, bold: true, color: C_DARK_GREEN, align: 'center', valign: 'middle'
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 2: Problem Statement & Existing Tech
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('01 / PROBLEM STATEMENT', { x: 0.8, y: 0.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: C_GRAY });
    slide.addText('Existing Technologies & Current Limitations', { x: 0.8, y: 0.9, w: 11, h: 0.6, fontSize: 26, bold: true, color: C_DARK_GREEN });

    const existingPoints = [
      {
        title: 'Legacy Desktop CAD (AutoCAD / Revit / SketchUp)',
        points: [
          'High licensing costs and steep learning curves for clients & buyers.',
          'Heavy workstation GPU hardware requirements; zero instant web sharing.',
          'Manual 3D extrusion takes hours or days for multi-storey residential plans.'
        ]
      },
      {
        title: 'Traditional Web 2D Plan Viewers',
        points: [
          'Static PDF or flat image displays with zero spatial depth or physics.',
          'Difficult for non-architects to understand room scales and circulation.',
          'No first-person walking walkthrough or multi-floor stair progression.'
        ]
      },
      {
        title: 'Generic Cloud 3D Renderers',
        points: [
          'Require slow server-side baking with multi-minute wait queues.',
          'Sensitive architectural documents sent and stored on remote servers.',
          'Lack automated intelligent room boundary and stairwell vertical alignment.'
        ]
      }
    ];

    existingPoints.forEach((card, idx) => {
      const x = 0.8 + idx * 3.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.8, w: 3.6, h: 4.8,
        fill: { color: C_CARD }, line: { color: 'E0E8E3', width: 1.2 }
      });
      slide.addText(card.title, {
        x: x + 0.25, y: 2.1, w: 3.1, h: 0.9,
        fontSize: 14, bold: true, color: C_DARK_GREEN
      });
      const bulletText = card.points.map(p => ({ text: p + '\n\n', options: { fontSize: 11, color: C_GRAY } }));
      slide.addText(bulletText, {
        x: x + 0.25, y: 3.1, w: 3.1, h: 3.2,
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

    slide.addText('02 / OUR INNOVATION', { x: 0.8, y: 0.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: C_GRAY });
    slide.addText('Our Technology: Automated Spatial Intelligence', { x: 0.8, y: 0.9, w: 11, h: 0.6, fontSize: 26, bold: true, color: C_DARK_GREEN });

    const solutions = [
      {
        num: '01',
        title: 'Instant 2D Plan Recognition',
        desc: 'Processes both scanned raster PDFs/PNGs via Gemini Vision AI and native vector CAD drawings with sub-second parsing.'
      },
      {
        num: '02',
        title: 'Mathematical 3D Assembly',
        desc: 'Procedurally computes exact wall coordinates, thickness, door frames, windows, continuous floor slabs, and cantilevered balconies.'
      },
      {
        num: '03',
        title: 'Bottom-to-Top Construction Transition',
        desc: 'Realistic 7-second architectural build-up animation showing ground foundation, upper villas, and roof terrace rising progressively.'
      },
      {
        num: '04',
        title: 'Seamless First-Person Walkthrough',
        desc: 'Free multi-floor navigation through stair portals, inward-facing auto-opening doors, collision-free trees, and outdoor plinth grounds.'
      }
    ];

    solutions.forEach((s, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.8;
      const y = 1.8 + row * 2.5;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 5.5, h: 2.2,
        fill: { color: C_CARD }, line: { color: 'BCE1C5', width: 1.5 }
      });
      slide.addText(s.num, {
        x: x + 0.3, y: y + 0.25, w: 0.7, h: 0.5,
        fontSize: 22, bold: true, color: C_ACCENT
      });
      slide.addText(s.title, {
        x: x + 1.1, y: y + 0.25, w: 4.1, h: 0.5,
        fontSize: 15, bold: true, color: C_DARK_GREEN
      });
      slide.addText(s.desc, {
        x: x + 1.1, y: y + 0.8, w: 4.1, h: 1.2,
        fontSize: 12, color: C_GRAY
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 4: Tech Stack Overview
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('03 / ARCHITECTURE & STACK', { x: 0.8, y: 0.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: C_GRAY });
    slide.addText('Technology Stack Used in Trishna 3D', { x: 0.8, y: 0.9, w: 11, h: 0.6, fontSize: 26, bold: true, color: C_DARK_GREEN });

    const stack = [
      {
        tech: 'Three.js (WebGL 2.0)',
        role: '3D Real-Time Rendering Engine',
        desc: 'Powers the 60fps 3D diorama, shadow mapping (PCFSoftShadowMap), filmic tone mapping, raycasting door interaction, and first-person camera walkthrough.'
      },
      {
        tech: 'Google Gemini Vision AI',
        role: 'Multimodal Spatial Plan Recognition',
        desc: 'Extracts rooms, spatial dimensions, floor levels, stair cores, and functional types directly from complex raster drawing sheets & blueprints.'
      },
      {
        tech: 'React 18 & TypeScript',
        role: 'State & Component Architecture',
        desc: 'Strong typing for architectural standards (Indian / Compact schedules), procedural geometry coordinates, and seamless reactive state flow.'
      },
      {
        tech: 'PDF.js (Mozilla)',
        role: 'In-Browser Vector & Raster Parsing',
        desc: 'High-resolution page rendering to offscreen canvas and vector text-operator clustering directly inside client browser memory.'
      },
      {
        tech: 'Vite 5 & Modern CSS3',
        role: 'Build Pipeline & Pastel Green Aesthetic',
        desc: 'Sub-second Hot Module Replacement, zero backend latency, pastel mint/sage responsive glassmorphic interfaces.'
      }
    ];

    stack.forEach((item, idx) => {
      const y = 1.7 + idx * 1.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y, w: 11.7, h: 0.88,
        fill: { color: idx % 2 === 0 ? C_CARD : 'EBF5EE' },
        line: { color: 'CBE5D3', width: 1 }
      });
      slide.addText(item.tech, {
        x: 1.1, y: y + 0.12, w: 2.7, h: 0.35,
        fontSize: 13, bold: true, color: C_DARK_GREEN
      });
      slide.addText(item.role, {
        x: 1.1, y: y + 0.45, w: 2.7, h: 0.3,
        fontSize: 10, bold: true, color: C_ACCENT
      });
      slide.addText(item.desc, {
        x: 4.0, y: y + 0.15, w: 8.2, h: 0.6,
        fontSize: 11, color: C_GRAY
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 5: Deep Dive into Technologies
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('04 / CORE TECHNOLOGY DEFINITIONS', { x: 0.8, y: 0.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: C_GRAY });
    slide.addText('Detailed Technical Analysis of Each Component', { x: 0.8, y: 0.9, w: 11, h: 0.6, fontSize: 26, bold: true, color: C_DARK_GREEN });

    const techDefs = [
      {
        title: 'Procedural Wall & Door Engine',
        body: 'Automated boundary edge-matching algorithm with 0.9ft tolerance that detects adjacent rooms, generates shared partition walls, and places inward-facing doors while enforcing solid garden exterior walls.'
      },
      {
        title: 'Collision & Stair Travel System',
        body: 'Custom kinematic collision controller providing free stair traversal, height interpolation across multi-storey landings, auto-swinging door triggers, and 100% collision-free garden tree perimeters.'
      },
      {
        title: 'Progressive Stage Interpolation',
        body: 'Physics-inspired bottom-to-top growth timeline using cubic easing curves to scale floor roots, extrude structural slabs, and raise partition walls sequentially across ground, first, and terrace levels.'
      }
    ];

    techDefs.forEach((td, idx) => {
      const x = 0.8 + idx * 3.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.8, w: 3.6, h: 4.8,
        fill: { color: C_CARD }, line: { color: 'BCE1C5', width: 1.5 }
      });
      slide.addText(td.title, {
        x: x + 0.25, y: 2.1, w: 3.1, h: 0.8,
        fontSize: 15, bold: true, color: C_DARK_GREEN
      });
      slide.addText(td.body, {
        x: x + 0.25, y: 3.0, w: 3.1, h: 3.2,
        fontSize: 12, color: C_GRAY
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 6: Screenshots & Visual Evidence
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('05 / SYSTEM SCREENSHOTS & RESULTS', { x: 0.8, y: 0.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: C_GRAY });
    slide.addText('Live Architectural Map & 3D Output Comparison', { x: 0.8, y: 0.9, w: 11, h: 0.6, fontSize: 26, bold: true, color: C_DARK_GREEN });

    // Left card: Input Drawing Sheet
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.6, h: 4.8,
      fill: { color: C_CARD }, line: { color: 'BCE1C5', width: 1.5 }
    });
    slide.addText('Input: 10.00m × 14.00m Multi-Floor Drawing Sheet', {
      x: 1.0, y: 2.0, w: 5.2, h: 0.4,
      fontSize: 13, bold: true, color: C_DARK_GREEN
    });

    if (fs.existsSync('public/extracted.png')) {
      slide.addImage({
        path: 'public/extracted.png',
        x: 1.0, y: 2.5, w: 5.2, h: 3.5,
        sizing: { type: 'contain', w: 5.2, h: 3.5 }
      });
    }

    slide.addText('Ground, First, and Second Floor sheets with room dimensions and cantilever balconies.', {
      x: 1.0, y: 6.1, w: 5.2, h: 0.4,
      fontSize: 10, color: C_GRAY
    });

    // Right card: 3D Studio Architecture
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.9, y: 1.8, w: 5.6, h: 4.8,
      fill: { color: C_CARD }, line: { color: 'BCE1C5', width: 1.5 }
    });
    slide.addText('Output: Real-Time 3D Interactive Walkthrough Studio', {
      x: 7.1, y: 2.0, w: 5.2, h: 0.4,
      fontSize: 13, bold: true, color: C_DARK_GREEN
    });

    if (fs.existsSync('public/user-floor-plan.png')) {
      slide.addImage({
        path: 'public/user-floor-plan.png',
        x: 7.1, y: 2.5, w: 5.2, h: 3.5,
        sizing: { type: 'contain', w: 5.2, h: 3.5 }
      });
    }

    slide.addText('Free walking mode with auto-swing doors, solid floor slabs, and bottom-to-top assembly.', {
      x: 7.1, y: 6.1, w: 5.2, h: 0.4,
      fontSize: 10, color: C_GRAY
    });
  }

  // -------------------------------------------------------------
  // SLIDE 7: Conclusion & Future Scope
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('06 / CONCLUSION & SUMMARY', { x: 0.8, y: 0.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: C_GRAY });
    slide.addText('Project Milestones & Impact', { x: 0.8, y: 0.9, w: 11, h: 0.6, fontSize: 26, bold: true, color: C_DARK_GREEN });

    const keyMetrics = [
      { num: '100%', label: 'Map Accuracy', desc: 'Exact reproduction of 10m × 14m drawings including attached baths & lofts.' },
      { num: '7 sec', label: 'Progressive Build', desc: 'Real-time stage-by-stage construction animation from ground to roof terrace.' },
      { num: '0 ms', label: 'Server Latency', desc: 'Runs entirely in the user’s browser with zero cloud render wait queues.' },
      { num: '3-Floor', label: 'Multi-Storey', desc: 'Fully walkable continuous staircase connecting all residential levels.' }
    ];

    keyMetrics.forEach((m, idx) => {
      const x = 0.8 + idx * 2.95;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.8, w: 2.7, h: 2.3,
        fill: { color: C_CARD }, line: { color: 'BCE1C5', width: 1.5 }
      });
      slide.addText(m.num, {
        x: x + 0.15, y: 2.0, w: 2.4, h: 0.6,
        fontSize: 26, bold: true, color: C_MID_GREEN, align: 'center'
      });
      slide.addText(m.label, {
        x: x + 0.15, y: 2.6, w: 2.4, h: 0.35,
        fontSize: 13, bold: true, color: C_DARK_GREEN, align: 'center'
      });
      slide.addText(m.desc, {
        x: x + 0.15, y: 3.0, w: 2.4, h: 0.9,
        fontSize: 10, color: C_GRAY, align: 'center'
      });
    });

    // Summary Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.4, w: 11.7, h: 2.2,
      fill: { color: C_MID_GREEN }
    });
    slide.addText('Trishna 3D proves that modern browser technologies combined with intelligent vision AI can transform static 2D blueprints into walkable, photo-realistic, multi-storey architectural experiences without heavy CAD workstations.', {
      x: 1.2, y: 4.7, w: 10.9, h: 0.9,
      fontSize: 14, color: C_WHITE, bold: true
    });
    slide.addText('Future Scope: Automatic CAD DXF/IFC export, VR headset support (WebXR), and real-time multiplayer walkthroughs.', {
      x: 1.2, y: 5.7, w: 10.9, h: 0.5,
      fontSize: 12, color: C_MINT
    });
  }

  const outPath = 'Trishna 3D ppt.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log(`Presentation generated successfully at: ${outPath}`);
}

generatePpt().catch(console.error);

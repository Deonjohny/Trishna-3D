import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Props = {
  onFinish: () => void;
  autoCloseTimeoutMs?: number;
};

export default function TrishnaIntro({ onFinish, autoCloseTimeoutMs = 6800 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [brickCount, setBrickCount] = useState(0);
  const [isZoomingIn, setIsZoomingIn] = useState(false);
  const [closing, setClosing] = useState(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ==========================================
    // THREE.JS REALISTIC MINIATURE 3D DIORAMA
    // ==========================================
    const width = el.clientWidth || 640;
    const height = el.clientHeight || 340;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 4.6, 9.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    // Ambient & Hemisphere Lighting in Warm Pastel Green
    scene.add(new THREE.HemisphereLight(0xf5fbf6, 0xbfdcce, 2.4));

    // Warm Architectural Sunlight casting soft shadows
    const sun = new THREE.DirectionalLight(0xfff7e6, 3.2);
    sun.position.set(7, 11, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 28;
    sun.shadow.camera.left = -5;
    sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;
    sun.shadow.camera.bottom = -5;
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    // Warm Interior Glow
    const interiorGlow = new THREE.PointLight(0xffdf88, 3.8, 8, 1.2);
    interiorGlow.position.set(0, 1.2, 0);
    scene.add(interiorGlow);

    // Materials
    const mat = (color: string, roughness = 0.65) => new THREE.MeshStandardMaterial({ color, roughness });
    const plinthMat = mat('#cce8d5', 0.8);
    const wallMat = mat('#f6f2e8', 0.72);
    const brickMat = mat('#df7c62', 0.62);
    const woodMat = mat('#9b6843', 0.52);
    const darkWoodMat = mat('#694228', 0.45);
    const roofMat = mat('#4f7d63', 0.58);
    const brassMat = new THREE.MeshStandardMaterial({ color: '#f3c968', metalness: 0.8, roughness: 0.25 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#ffe5a0',
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.3,
      emissive: '#ffe082',
      emissiveIntensity: 0.45,
    });
    const leafMat = mat('#68a87c', 0.75);
    const leafLight = mat('#82bf95', 0.75);

    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Pedestal Plinth with Subtle Bevel
    const plinthGeom = new THREE.CylinderGeometry(4.2, 4.4, 0.4, 48);
    const plinth = new THREE.Mesh(plinthGeom, plinthMat);
    plinth.position.y = -0.2;
    plinth.receiveShadow = true;
    houseGroup.add(plinth);

    // Architectural Blueprint Grid on Plinth
    const gridHelper = new THREE.GridHelper(7.6, 20, '#659c7a', '#a6cfb5');
    gridHelper.position.y = 0.005;
    houseGroup.add(gridHelper);

    // Helper function for quick boxes
    const box = (parent: THREE.Object3D, w: number, h: number, d: number, material: THREE.Material, px = 0, py = 0, pz = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(px, py, pz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // ==========================================
    // 1. ANIMATED BRICK ARRAY (Simulated Physics)
    // ==========================================
    interface BrickData {
      mesh: THREE.Mesh;
      targetY: number;
      startX: number;
      startZ: number;
      dropDelay: number;
      landed: boolean;
      bounceTime: number;
    }

    const bricks: BrickData[] = [];
    const brickW = 0.56, brickH = 0.24, brickD = 0.36;

    // Create 20 bricks positioned around the wall perimeter
    const brickCoords: [number, number, number][] = [
      // Ground Course 1
      [-1.4, 0.12, 1.2], [-0.8, 0.12, 1.2], [0.8, 0.12, 1.2], [1.4, 0.12, 1.2],
      [-1.4, 0.12, -1.2], [-0.8, 0.12, -1.2], [0, 0.12, -1.2], [0.8, 0.12, -1.2], [1.4, 0.12, -1.2],
      // Ground Course 2
      [-1.4, 0.36, 1.2], [1.4, 0.36, 1.2],
      [-1.4, 0.36, -1.2], [1.4, 0.36, -1.2],
      // Ground Course 3 (Lintels)
      [-1.4, 0.60, 1.2], [1.4, 0.60, 1.2],
      [-0.8, 0.60, 1.2], [0.8, 0.60, 1.2],
      // Upper Storey Corners
      [-1.2, 1.62, 1.0], [1.2, 1.62, 1.0],
      [-1.2, 1.86, 1.0], [1.2, 1.86, 1.0],
    ];

    brickCoords.forEach(([bx, by, bz], idx) => {
      const brickMesh = new THREE.Mesh(new THREE.BoxGeometry(brickW, brickH, brickD), brickMat);
      brickMesh.position.set(bx, by + 6 + idx * 0.45, bz);
      brickMesh.castShadow = true;
      brickMesh.receiveShadow = true;
      brickMesh.visible = false;
      houseGroup.add(brickMesh);

      bricks.push({
        mesh: brickMesh,
        targetY: by,
        startX: bx,
        startZ: bz,
        dropDelay: 0.65 + idx * 0.08,
        landed: false,
        bounceTime: 0,
      });
    });

    // ==========================================
    // 2. MAIN 3D ARCHITECTURAL HOUSE MODEL
    // ==========================================
    const buildingModel = new THREE.Group();
    buildingModel.position.set(0, 0, 0);
    buildingModel.scale.set(0.001, 0.001, 0.001); // scales up in Phase 2
    houseGroup.add(buildingModel);

    // Ground Floor Body
    box(buildingModel, 3.2, 1.4, 2.6, wallMat, 0, 0.7, 0);

    // Ground Floor Wooden Door
    const door = box(buildingModel, 0.7, 1.15, 0.08, woodMat, 0, 0.58, 1.31);
    box(door, 0.06, 0.06, 0.06, brassMat, 0.22, 0, 0.06); // knob
    box(buildingModel, 0.86, 0.09, 0.14, darkWoodMat, 0, 1.18, 1.32); // door header lintel

    // Ground Floor Glowing Windows
    box(buildingModel, 0.85, 0.72, 0.08, glassMat, -1.05, 0.75, 1.31);
    box(buildingModel, 0.85, 0.72, 0.08, glassMat, 1.05, 0.75, 1.31);
    // Window Frames
    box(buildingModel, 0.92, 0.06, 0.12, darkWoodMat, -1.05, 0.38, 1.32);
    box(buildingModel, 0.92, 0.06, 0.12, darkWoodMat, 1.05, 0.38, 1.32);

    // Level 01 Structural Floor Slab (Beveled architectural edge)
    box(buildingModel, 3.48, 0.18, 2.88, mat('#ded9cc', 0.6), 0, 1.48, 0);

    // Level 01 First Floor Living & Master Room
    box(buildingModel, 2.8, 1.3, 2.3, wallMat, 0.15, 2.22, -0.1);

    // Cantilever Balcony
    box(buildingModel, 1.4, 0.12, 0.95, mat('#d0c9ba'), -0.85, 1.48, 1.45);
    // Balcony Railings
    const railY = 1.95;
    box(buildingModel, 1.4, 0.05, 0.05, darkWoodMat, -0.85, railY, 1.92);
    box(buildingModel, 0.05, 0.05, 0.92, darkWoodMat, -1.55, railY, 1.46);
    box(buildingModel, 0.05, 0.05, 0.92, darkWoodMat, -0.15, railY, 1.46);
    for (let r = 0; r <= 6; r++) {
      box(buildingModel, 0.03, 0.42, 0.03, brassMat, -1.5 + r * 0.22, railY - 0.21, 1.92);
    }

    // Level 01 Windows
    box(buildingModel, 0.75, 0.75, 0.08, glassMat, 0.85, 2.25, 1.06);
    box(buildingModel, 0.82, 0.06, 0.12, darkWoodMat, 0.85, 1.86, 1.07);

    // Level 02 Rooftop Terrace & Central Stair Tower
    box(buildingModel, 2.9, 0.16, 2.4, mat('#ded9cc', 0.6), 0.15, 2.94, -0.1);
    box(buildingModel, 1.3, 1.15, 1.4, wallMat, -0.55, 3.58, -0.3);

    // Pitched Roof Over Stair Tower
    const roofGeom = new THREE.ConeGeometry(1.2, 0.7, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(-0.55, 4.45, -0.3);
    roof.castShadow = true;
    buildingModel.add(roof);

    // Rooftop Wooden Pergola
    for (let p = 0; p < 4; p++) {
      box(buildingModel, 1.45, 0.07, 0.08, darkWoodMat, 0.75, 3.75, -0.7 + p * 0.38);
    }

    // Chimney with Puffing Smoke
    box(buildingModel, 0.32, 0.85, 0.32, brickMat, 0.65, 3.9, -0.85);
    const smokeParticles: THREE.Mesh[] = [];
    const smokeMat = new THREE.MeshStandardMaterial({ color: '#f0f5f1', transparent: true, opacity: 0.65 });
    for (let s = 0; s < 4; s++) {
      const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.12 + s * 0.04, 10, 8), smokeMat);
      smoke.position.set(0.65, 4.4 + s * 0.32, -0.85);
      buildingModel.add(smoke);
      smokeParticles.push(smoke);
    }

    // Miniature Trees & Potted Greenery
    const addTree = (tx: number, tz: number, scale = 1) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.7 * scale, 8), darkWoodMat);
      trunk.position.set(tx, 0.35 * scale, tz);
      trunk.castShadow = true;
      houseGroup.add(trunk);

      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * scale, 1), scale > 0.8 ? leafMat : leafLight);
      crown.position.set(tx, 0.85 * scale, tz);
      crown.castShadow = true;
      houseGroup.add(crown);
    };
    addTree(-2.5, 1.4, 1.1);
    addTree(2.6, 1.2, 0.95);
    addTree(2.4, -1.6, 1.05);

    // ==========================================
    // INTERACTION & ORBITING CONTROLS
    // ==========================================
    let isDragging = false;
    let prevPointerX = 0;
    let orbitAngle = 0;
    let targetOrbitAngle = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const delta = (e.clientX - prevPointerX) * 0.007;
      targetOrbitAngle += delta;
      prevPointerX = e.clientX;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ==========================================
    // ANIMATION LOOP (Butter-smooth 60fps)
    // ==========================================
    const clock = new THREE.Clock();
    let startTime = performance.now();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const realSeconds = (performance.now() - startTime) / 1000;

      // Update Phase State according to time
      if (realSeconds > 0.9 && realSeconds <= 2.2) {
        setPhase(1);
      } else if (realSeconds > 2.2 && realSeconds <= 3.8) {
        setPhase(2);
      } else if (realSeconds > 3.8) {
        setPhase(3);
      }

      // Smooth Orbiting
      if (!isDragging) {
        targetOrbitAngle += 0.005; // gentle idle rotation
      }
      orbitAngle = THREE.MathUtils.lerp(orbitAngle, targetOrbitAngle, 0.08);
      houseGroup.rotation.y = orbitAngle;

      // 1. Brick Drop Simulation
      let landedCount = 0;
      bricks.forEach(b => {
        if (realSeconds >= b.dropDelay) {
          b.mesh.visible = true;
          if (b.mesh.position.y > b.targetY) {
            b.mesh.position.y = Math.max(b.targetY, b.mesh.position.y - 14 * 0.016);
            if (b.mesh.position.y <= b.targetY) {
              b.landed = true;
              b.bounceTime = 0;
            }
          } else if (b.landed && b.bounceTime < 0.25) {
            b.bounceTime += 0.016;
            const bounce = Math.sin(b.bounceTime * Math.PI * 4) * 0.08 * Math.exp(-b.bounceTime * 12);
            b.mesh.position.y = b.targetY + Math.max(0, bounce);
          }
        }
        if (b.landed) landedCount++;
      });
      setBrickCount(landedCount);

      // 2. Building Scale-Up & Morph in Phase 2
      if (realSeconds > 2.1) {
        const morphProgress = Math.min(1, (realSeconds - 2.1) / 0.85);
        const springScale = THREE.MathUtils.lerp(buildingModel.scale.x, 1, 0.12);
        buildingModel.scale.set(springScale, springScale, springScale);

        // When building is fully erected, bricks gently fade/dissolve into the structure
        if (morphProgress > 0.6) {
          bricks.forEach(b => {
            b.mesh.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.08);
          });
        }
      }

      // 3. Smoke Puffs Animation
      smokeParticles.forEach((sp, i) => {
        const t = (elapsed * 0.8 + i * 0.35) % 1.5;
        sp.position.y = 4.3 + t * 0.7;
        sp.position.x = 0.65 + Math.sin(elapsed * 2 + i) * 0.08;
        sp.scale.setScalar(0.7 + t * 0.8);
      });

      // 4. Zoom-in Transition (when user clicks Enter or auto-completes)
      if (isZoomingIn) {
        camera.position.lerp(new THREE.Vector3(0, 1.4, 2.2), 0.08);
        camera.lookAt(new THREE.Vector3(0, 1.2, 0));
        houseGroup.rotation.y = THREE.MathUtils.lerp(houseGroup.rotation.y, 0, 0.1);
      } else {
        camera.lookAt(new THREE.Vector3(0, 1.3, 0));
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!el) return;
      const w = el.clientWidth || 640;
      const h = el.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [isZoomingIn]);

  // Auto transition after timeout
  useEffect(() => {
    const tAuto = setTimeout(() => {
      triggerEntryTransition();
    }, autoCloseTimeoutMs);

    return () => clearTimeout(tAuto);
  }, [autoCloseTimeoutMs]);

  const triggerEntryTransition = () => {
    setIsZoomingIn(true);
    setClosing(true);
    setTimeout(() => {
      onFinish();
    }, 720);
  };

  const storyMessages = [
    <>Architectural blueprint plotting on <b>pastel sage plinth</b>…</>,
    <>Laying 3D terracotta bricks <b>({Math.min(brickCount, 20)}/20)</b> with contact shadows…</>,
    <>Morphing <b>Trishna 3D</b> letterforms into realistic multi-storey residence…</>,
    <><b>Trishna 3D Model Complete!</b> Drag to inspect or step inside in 3D walkthrough.</>,
  ];

  return (
    <div className={`trishna-intro-overlay ${closing ? 'fade-out' : ''}`}>
      <div className="trishna-grid-bg" />

      {/* Floating cute clouds */}
      <div className="trishna-floating-elements">
        <div className="trishna-cloud c1" />
        <div className="trishna-cloud c2" />
        <div className="trishna-cloud c3" />
      </div>

      <div className="trishna-stage">
        <div className="trishna-cute-pill">
          <i>✦</i> TRISHNA 3D STUDIO <i>✦</i>
        </div>

        {/* 3D Realistic Miniature Scene */}
        <div className="trishna-3d-viewport" ref={mountRef}>
          <div className="trishna-3d-hint">Drag in 3D to rotate miniature</div>
        </div>

        {/* Phase Progress Indicators */}
        <div className="trishna-phase-row">
          <div className={`trishna-phase-step ${phase >= 0 ? 'active' : ''}`}>
            <span className="step-dot" />
            <span>01 Blueprint</span>
          </div>
          <div className={`trishna-phase-step ${phase >= 1 ? 'active' : ''}`}>
            <span className="step-dot" />
            <span>02 3D Brickwork</span>
          </div>
          <div className={`trishna-phase-step ${phase >= 2 ? 'active' : ''}`}>
            <span className="step-dot" />
            <span>03 Real 3D Villa</span>
          </div>
          <div className={`trishna-phase-step ${phase >= 3 ? 'active' : ''}`}>
            <span className="step-dot" />
            <span>04 Walkthrough Ready</span>
          </div>
        </div>

        {/* Story narrative text */}
        <p className="trishna-story-text">
          {storyMessages[phase]}
        </p>

        {/* Action Controls */}
        <div className="trishna-intro-actions">
          <button className="trishna-btn-enter" onClick={triggerEntryTransition}>
            Step Inside in 3D <span>↗</span>
          </button>
          <button className="trishna-btn-skip" onClick={triggerEntryTransition}>
            Skip Intro
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Miniature animated brick & house vignette for the Dashboard preview card
 */
export function TrishnaMiniBuilding({ active = true }: { active?: boolean }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, [active]);

  const labels = ['Trishna 3D', 'Laying Bricks', 'Building Villa', 'Studio Walkthrough'];

  return (
    <div className={`trishna-mini-vignette phase-${phase}`}>
      <span className="trishna-mini-label">{labels[phase]}</span>
      <div className="mini-brick-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} className={`mini-brick b-${i} ${phase >= 1 ? 'laid' : ''}`} />
        ))}
      </div>
      <svg className={`mini-house-svg ${phase >= 2 ? 'visible' : ''}`} viewBox="0 0 76 72">
        <path d="M7 34 38 9l31 25" fill="none" stroke="#fff7df" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M15 31v34h46V31" fill="#f4c99d" stroke="#fff7df" strokeWidth="2.5" />
        <path d="M31 65V44h14v21" fill="#8f6452" />
        <path d="M20 39h9v9h-9zM48 39h8v9h-8z" fill="#bce8dc" />
        <circle cx="58" cy="18" r="4" fill="#fde68a" />
      </svg>
    </div>
  );
}

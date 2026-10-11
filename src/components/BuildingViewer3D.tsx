import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Room, ViewMode } from '../types/building';
import type { BuildingStandard } from '../data/standards';

type Props = {
  rooms: Room[];
  view: ViewMode;
  walkthrough: boolean;
  onSelect: (id: string) => void;
  onRoom: (name: string) => void;
  standard: BuildingStandard;
  buildProgress?: number; // 0 to 1 progressive bottom-to-top construction animation
  onBuildComplete?: () => void;
};
type Bounds = { x: number; z: number; w: number; d: number };
type Axis = 'x' | 'z';
const FT = 0.3048;
const stairLandingDepth = (depth: number) => Math.min(depth * 0.34, Math.max(0.9, depth * 0.29));

function proceduralFloor(kind: string, color: string, w: number, d: number): THREE.MeshStandardMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const c = canvas.getContext('2d')!;
  c.fillStyle = kind === 'Teak' ? '#9c704c' : kind === 'Tile' || kind === 'Ceramic' ? '#d8d6cf' : kind === 'Carpet' ? '#aaa99d' : kind === 'Stone' ? '#b5ad9d' : '#d7d2c7';
  c.fillRect(0, 0, 512, 512);
  if (kind === 'Teak') {
    for (let row = 0; row < 8; row++) {
      const y = row * 64, offset = (row % 2) * 64;
      for (let col = -1; col < 9; col++) {
        const x = col * 128 + offset;
        c.fillStyle = ['#bd9369', '#a87c54', '#c49b70', '#ab8059'][(row * 7 + col + 30) % 4];
        c.fillRect(x + 2, y + 2, 124, 60);
        c.strokeStyle = '#785439';
        c.lineWidth = 2;
        c.strokeRect(x + 2, y + 2, 124, 60);
        for (let g = 0; g < 5; g++) {
          c.strokeStyle = 'rgba(77,48,28,.16)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(x + 8, y + 10 + g * 9);
          c.bezierCurveTo(x + 40, y + 7 + g * 9, x + 80, y + 14 + g * 9, x + 118, y + 9 + g * 9);
          c.stroke();
        }
      }
    }
  } else if (kind === 'Tile' || kind === 'Ceramic') {
    c.strokeStyle = '#aca99f';
    c.lineWidth = 5;
    for (let i = 0; i <= 4; i++) {
      c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, 512); c.stroke();
      c.beginPath(); c.moveTo(0, i * 128); c.lineTo(512, i * 128); c.stroke();
    }
  } else if (kind === 'Marble') {
    c.strokeStyle = 'rgba(117,127,128,.25)';
    c.lineWidth = 3;
    for (let i = 0; i < 11; i++) {
      c.beginPath();
      c.moveTo(-20, i * 57);
      c.bezierCurveTo(120, i * 57 - 45, 260, i * 57 + 38, 535, i * 57 - 18);
      c.stroke();
    }
  } else {
    let seed = 73;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 400; i++) {
      c.fillStyle = `rgba(65,65,60,${0.04 + rand() * 0.12})`;
      const x = rand() * 512, y = rand() * 512, size = 1 + rand() * 3;
      c.fillRect(x, y, size, size);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(Math.max(0.6, w / 1.6), Math.max(0.6, d / 1.6));
  texture.anisotropy = 4;
  return new THREE.MeshStandardMaterial({ color, map: texture, roughness: kind === 'Marble' ? 0.34 : 0.78, metalness: 0 });
}

export default function BuildingViewer3D({
  rooms,
  view,
  walkthrough,
  onSelect,
  onRoom,
  standard,
  buildProgress = 1,
  onBuildComplete,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ dispose: () => void } | null>(null);
  const viewRef = useRef(view);
  const walkthroughRef = useRef(walkthrough);
  const buildProgressRef = useRef(buildProgress);
  const onBuildCompleteRef = useRef(onBuildComplete);
  viewRef.current = view;
  walkthroughRef.current = walkthrough;
  buildProgressRef.current = buildProgress;
  onBuildCompleteRef.current = onBuildComplete;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const { floorHeight: LEVEL, wallHeight: WALL, wallThickness, doorHeight: DOOR_H } = standard;

    // Determine building dimensions dynamically from room bounds
    const rawBounds = (r: Room): Bounds =>
      r.bounds ?? { x: 13 + r.x / FT - r.w / 2, z: 16 - r.z / FT - r.d / 2, w: r.w, d: r.d };
    const allBounds = rooms.map(rawBounds);
    const maxW = Math.max(...allBounds.map(b => b.x + b.w), 26);
    const maxD = Math.max(...allBounds.map(b => b.z + b.d), 32);
    const BUILDING_W = Math.round(maxW);
    const BUILDING_D = Math.round(maxD);

    const roomBounds = (r: Room): Bounds =>
      r.bounds ?? { x: BUILDING_W / 2 + r.x / FT - r.w / 2, z: BUILDING_D / 2 - r.z / FT - r.d / 2, w: r.w, d: r.d };

    const worldX = (ft: number) => (ft - BUILDING_W / 2) * FT;
    const worldZ = (frontFt: number) => (BUILDING_D / 2 - frontFt) * FT;

    const floorLevels = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);
    const maxFloorIndex = floorLevels.length ? Math.max(...floorLevels) : 0;
    const floorCount = Math.max(floorLevels.length, maxFloorIndex + 1, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#dce5e4');
    scene.fog = new THREE.Fog('#dce5e4', 28, 85);

    const buildingHeight = floorCount * LEVEL;
    const camDist = Math.max(BUILDING_W, BUILDING_D) * FT * 1.3;
    const camera = new THREE.PerspectiveCamera(walkthrough ? 88 : 48, 1, 0.1, 200);
    const orbitPosition = new THREE.Vector3(camDist * 0.9, buildingHeight + 8, camDist * 1.1);
    const orbitTarget = new THREE.Vector3(0, buildingHeight * 0.45, 0);
    camera.position.copy(orbitPosition);
    camera.lookAt(orbitTarget);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf8f8ef, 0x6f7771, 2.15));
    const sun = new THREE.DirectionalLight(0xffe7c7, 3.1);
    sun.position.set(-12, buildingHeight + 15, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const root = new THREE.Group();
    scene.add(root);

    const floorRoots = Array.from({ length: floorCount }, () => new THREE.Group());
    floorRoots.forEach(g => root.add(g));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const floorHits: THREE.Object3D[] = [];
    const doorRoots: THREE.Object3D[] = [];
    const walls: { axis: Axis; x: number; z: number; length: number; floor: number; stairRail?: boolean }[] = [];
    const doorPlanes: { axis: Axis; x: number; z: number; width: number; floor: number; pivot: THREE.Group }[] = [];

    const wallMat = new THREE.MeshStandardMaterial({ color: '#f5f1e8', roughness: 0.88 });
    const trim = new THREE.MeshStandardMaterial({ color: '#b68b5c', roughness: 0.72 });
    const wood = new THREE.MeshStandardMaterial({ color: '#84532f', roughness: 0.42 });
    const woodAlt = new THREE.MeshStandardMaterial({ color: '#a87548', roughness: 0.48 });
    const frameMat = new THREE.MeshStandardMaterial({ color: '#3e352a', roughness: 0.38 });
    const brass = new THREE.MeshStandardMaterial({ color: '#d8b96d', metalness: 0.72, roughness: 0.25 });
    const glass = new THREE.MeshPhysicalMaterial({ color: '#a8d9e2', transparent: true, opacity: 0.62, roughness: 0.12, metalness: 0.08, side: THREE.DoubleSide });
    const mat = (color: string, roughness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness });

    const box = (parent: THREE.Object3D, w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => {
      const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };

    const addDoor = (parent: THREE.Object3D, axis: Axis, x: number, z: number, y: number, width: number, swingSign = 1) => {
      const height = DOOR_H, thick = 0.055, pivot = new THREE.Group(), baseAngle = axis === 'z' ? Math.PI / 2 : 0;
      pivot.position.set(x - (axis === 'x' ? width / 2 : 0), y, z - (axis === 'z' ? width / 2 : 0));
      pivot.rotation.y = baseAngle;
      parent.add(pivot);
      pivot.userData.isDoor = true;
      pivot.userData.open = false;
      pivot.userData.baseAngle = baseAngle;
      pivot.userData.targetAngle = baseAngle;

      box(pivot, width - 0.06, height - 0.05, thick, wood, width / 2, height / 2, 0);
      box(pivot, 0.035, height - 0.15, 0.018, woodAlt, width * 0.23, height / 2, 0.04);
      box(pivot, 0.035, height - 0.15, 0.018, woodAlt, width * 0.76, height / 2, 0.04);
      box(pivot, width - 0.14, 0.045, 0.018, woodAlt, width / 2, height * 0.72, 0.04);
      box(pivot, width - 0.14, 0.045, 0.018, woodAlt, width / 2, height * 0.32, 0.04);
      const handle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), brass);
      handle.position.set(width - 0.13, Math.min(1.02, height * 0.48), 0.075);
      pivot.add(handle);

      if (axis === 'x') {
        box(parent, 0.07, height + 0.08, 0.14, trim, x - width / 2 - 0.035, y + height / 2, z);
        box(parent, 0.07, height + 0.08, 0.14, trim, x + width / 2 + 0.035, y + height / 2, z);
        box(parent, width + 0.14, 0.075, 0.14, trim, x, y + height + 0.04, z);
      } else {
        box(parent, 0.14, height + 0.08, 0.07, trim, x, y + height / 2, z - width / 2 - 0.035);
        box(parent, 0.14, height + 0.08, 0.07, trim, x, y + height / 2, z + width / 2 + 0.035);
        box(parent, 0.14, 0.075, width + 0.14, trim, x, y + height + 0.04, z);
      }
      pivot.userData.toggle = () => {
        const isOpen = !(pivot.userData.open as boolean);
        pivot.userData.open = isOpen;
        pivot.userData.targetAngle = isOpen ? baseAngle + (axis === 'x' ? -Math.PI / 2 : Math.PI / 2) * swingSign : baseAngle;
      };
      doorRoots.push(pivot);
      doorPlanes.push({ axis, x, z, width, floor: Math.round(y / LEVEL), pivot });
    };

    const addWindow = (parent: THREE.Object3D, axis: Axis, x: number, z: number, y: number, width: number) => {
      const sill = standard.windowSill, h = standard.windowHeight, b = 0.055;
      if (axis === 'x') {
        box(parent, width, h, 0.045, glass, x, y + sill + h / 2, z);
        box(parent, width + 2 * b, b, 0.09, frameMat, x, y + sill, z);
        box(parent, width + 2 * b, b, 0.09, frameMat, x, y + sill + h, z);
        box(parent, b, h, 0.09, frameMat, x - width / 2, y + sill + h / 2, z);
        box(parent, b, h, 0.09, frameMat, x + width / 2, y + sill + h / 2, z);
        box(parent, b, h, 0.07, frameMat, x, y + sill + h / 2, z);
      } else {
        box(parent, 0.045, h, width, glass, x, y + sill + h / 2, z);
        box(parent, 0.09, b, width + 2 * b, frameMat, x, y + sill, z);
        box(parent, 0.09, b, width + 2 * b, frameMat, x, y + sill + h, z);
        box(parent, 0.09, h, b, frameMat, x, y + sill + h / 2, z - width / 2);
        box(parent, 0.09, h, b, frameMat, x, y + sill + h / 2, z + width / 2);
        box(parent, 0.07, h, b, frameMat, x, y + sill + h / 2, z);
      }
    };

    const addRailing = (parent: THREE.Object3D, axis: Axis, x: number, z: number, y: number, length: number, gap = 0) => {
      const railH = standard.railingHeight, count = Math.max(2, Math.ceil(length / 0.42)), lo = (length - gap) / 2, hi = (length + gap) / 2;
      const floor = Math.round(y / LEVEL);
      if (lo > 0.12) walls.push({ axis, x: axis === 'x' ? x - length / 2 + lo / 2 : x, z: axis === 'z' ? z - length / 2 + lo / 2 : z, length: lo, floor });
      if (length - hi > 0.12) walls.push({ axis, x: axis === 'x' ? x - length / 2 + (hi + length) / 2 : x, z: axis === 'z' ? z - length / 2 + (hi + length) / 2 : z, length: length - hi, floor });
      for (let i = 0; i <= count; i++) {
        const t = length * i / count;
        if (gap > 0 && t > lo - 0.12 && t < hi + 0.12) continue;
        const px = axis === 'x' ? x - length / 2 + t : x, pz = axis === 'z' ? z - length / 2 + t : z;
        box(parent, 0.055, railH, 0.055, trim, px, y + railH / 2, pz);
      }
      for (const [start, end] of [[0, lo], [hi, length]]) {
        const span = end - start;
        if (span < 0.12) continue;
        const center = start + span / 2;
        if (axis === 'x') {
          box(parent, span, 0.065, 0.065, trim, x - length / 2 + center, y + railH, z);
          box(parent, span, 0.055, 0.055, trim, x - length / 2 + center, y + 0.16, z);
        } else {
          box(parent, 0.065, 0.065, span, trim, x, y + railH, z - length / 2 + center);
          box(parent, 0.055, 0.055, span, trim, x, y + 0.16, z - length / 2 + center);
        }
      }
    };

    const addWall = (parent: THREE.Object3D, axis: Axis, x: number, z: number, y: number, length: number, doorWidth = 0, window = false, openPassage = false, openingCenter?: number, swingSign = 1) => {
      const thickness = wallThickness;
      if (doorWidth > 0) {
        if (openPassage && doorWidth >= length * 0.75) {
          // Fully open architectural archway / portal (zero side collision posts)
          const beamH = Math.max(0.35, WALL - 2.4);
          if (axis === 'x') {
            box(parent, length, beamH, thickness, wallMat, x, y + WALL - beamH / 2, z);
          } else {
            box(parent, thickness, beamH, length, wallMat, x, y + WALL - beamH / 2, z);
          }
          return;
        }

        const gap = Math.min(doorWidth, length * 0.88);
        const start = axis === 'x' ? x - length / 2 : z - length / 2;
        const center = openingCenter ?? (axis === 'x' ? x : z);
        const before = Math.max(0, center - gap / 2 - start);
        const after = Math.max(0, length - before - gap);
        const floor = Math.round(y / LEVEL);
        if (axis === 'x') {
          if (before > 0.08) { walls.push({ axis, x: start + before / 2, z, length: before, floor }); box(parent, before, WALL, thickness, wallMat, start + before / 2, y + WALL / 2, z); }
          if (after > 0.08) { walls.push({ axis, x: center + gap / 2 + after / 2, z, length: after, floor }); box(parent, after, WALL, thickness, wallMat, center + gap / 2 + after / 2, y + WALL / 2, z); }
          box(parent, gap, WALL - DOOR_H, thickness, wallMat, center, y + DOOR_H + (WALL - DOOR_H) / 2, z);
          if (!openPassage) addDoor(parent, axis, center, z + 0.025, y, gap, swingSign);
        } else {
          if (before > 0.08) { walls.push({ axis, x, z: start + before / 2, length: before, floor }); box(parent, thickness, WALL, before, wallMat, x, y + WALL / 2, start + before / 2); }
          if (after > 0.08) { walls.push({ axis, x, z: center + gap / 2 + after / 2, length: after, floor }); box(parent, thickness, WALL, after, wallMat, x, y + WALL / 2, center + gap / 2 + after / 2); }
          box(parent, thickness, WALL - DOOR_H, gap, wallMat, x, y + DOOR_H + (WALL - DOOR_H) / 2, center);
          if (!openPassage) addDoor(parent, axis, x + 0.025, center, y, gap, swingSign);
        }
      } else if (window && length > 1.45) {
        walls.push({ axis, x, z, length, floor: Math.round(y / LEVEL) });
        const span = Math.min(standard.windowWidth, length * 0.43);
        const sill = standard.windowSill;
        const upper = WALL - sill - standard.windowHeight;
        const side = (length - span) / 2;
        if (axis === 'x') {
          box(parent, side, WALL, thickness, wallMat, x - length / 2 + side / 2, y + WALL / 2, z);
          box(parent, side, WALL, thickness, wallMat, x + length / 2 - side / 2, y + WALL / 2, z);
          box(parent, span, sill, thickness, wallMat, x, y + sill / 2, z);
          box(parent, span, upper, thickness, wallMat, x, y + sill + standard.windowHeight + upper / 2, z);
          addWindow(parent, axis, x, z, y, span);
        } else {
          box(parent, thickness, WALL, side, wallMat, x, y + WALL / 2, z - length / 2 + side / 2);
          box(parent, thickness, WALL, side, wallMat, x, y + WALL / 2, z + length / 2 - side / 2);
          box(parent, thickness, sill, span, wallMat, x, y + sill / 2, z);
          box(parent, thickness, upper, span, wallMat, x, y + sill + standard.windowHeight + upper / 2, z);
          addWindow(parent, axis, x, z, y, span);
        }
      } else if (axis === 'x') {
        walls.push({ axis, x, z, length, floor: Math.round(y / LEVEL) });
        box(parent, length, WALL, thickness, wallMat, x, y + WALL / 2, z);
      } else {
        walls.push({ axis, x, z, length, floor: Math.round(y / LEVEL) });
        box(parent, thickness, WALL, length, wallMat, x, y + WALL / 2, z);
      }
    };

    const stairRoom = rooms.find(r => r.kind === 'stair');
    const stairBounds = stairRoom ? roomBounds(stairRoom) : { x: 14, z: 0, w: 8, d: 14 };

    // Continuous architectural floor slab for each level ensuring solid ground everywhere
    const createFloorSlab = (f: number, parent: THREE.Group) => {
      const slabW = BUILDING_W * FT;
      const slabD = BUILDING_D * FT;
      const y = f * LEVEL;
      const slabShape = new THREE.Shape();
      slabShape.moveTo(-slabW / 2, -slabD / 2);
      slabShape.lineTo(slabW / 2, -slabD / 2);
      slabShape.lineTo(slabW / 2, slabD / 2);
      slabShape.lineTo(-slabW / 2, slabD / 2);
      slabShape.closePath();

      // On upper floors (f >= 1), cut the stairwell opening so climbing through is unobstructed
      if (f >= 1 && stairRoom) {
        const sb = stairBounds;
        const sxMin = worldX(sb.x) + 0.05;
        const sxMax = worldX(sb.x + sb.w) - 0.05;
        const szFront = worldZ(sb.z);
        const szBack = worldZ(sb.z + sb.d);
        // szBack is north (smaller Z), szFront is south (larger Z).
        // Retain a solid arrival landing (~1.2m) at the front so stepping off onto floor f has solid ground!
        const hzMin = szBack + 0.05;
        const hzMax = szFront - 1.15;
        if (sxMax > sxMin && hzMax > hzMin) {
          const hole = new THREE.Path();
          hole.moveTo(sxMin, hzMin);
          hole.lineTo(sxMax, hzMin);
          hole.lineTo(sxMax, hzMax);
          hole.lineTo(sxMin, hzMax);
          hole.closePath();
          slabShape.holes.push(hole);
        }
      }

      const slabGeom = new THREE.ExtrudeGeometry(slabShape, {
        depth: 0.12,
        bevelEnabled: false,
      });
      slabGeom.rotateX(Math.PI / 2);
      const slabMat = mat('#e8e5dc', 0.82);
      const slabMesh = new THREE.Mesh(slabGeom, slabMat);
      slabMesh.position.set(0, y, 0);
      slabMesh.receiveShadow = true;
      slabMesh.castShadow = true;
      parent.add(slabMesh);
      floorHits.push(slabMesh);
      return slabMesh;
    };

    const makeFloor = (parent: THREE.Object3D, r: Room, _b: Bounds, x: number, z: number, y: number, w: number, d: number) => {
      if (r.kind === 'stair') {
        // The staircase core has its own wooden flights, treads, and landings
        return null;
      }
      const geom = new THREE.PlaneGeometry(w - 0.02, d - 0.02);
      geom.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geom, proceduralFloor(r.material, r.color, w, d));
      mesh.position.set(x, y + 0.006, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      parent.add(mesh);
      floorHits.push(mesh);
      return mesh;
    };

    const addFurniture = (r: Room, parent: THREE.Object3D, y: number, x: number, z: number, w: number, d: number) => {
      if (r.kind || r.name.toLowerCase().includes('passage') || r.name.toLowerCase().includes('lobby')) return;
      if (/bed/i.test(r.name)) {
        box(parent, Math.min(w * 0.58, 1.55), 0.32, Math.min(d * 0.45, 2.0), mat('#e9ddca'), x, y + 0.22, z);
        box(parent, Math.min(w * 0.62, 1.65), 0.18, 0.52, mat('#d7c4ab'), x, y + 0.38, z - d * 0.12);
        box(parent, 0.12, 0.45, 0.14, trim, x, y + 0.35, z - d * 0.28);
      } else if (/living|lounge|family/i.test(r.name)) {
        box(parent, Math.min(w * 0.52, 1.8), 0.52, 0.72, mat('#6f8981'), x, y + 0.3, z);
        box(parent, 0.18, 0.42, 0.75, mat('#80958a'), x - w * 0.18, y + 0.34, z);
        box(parent, 0.76, 0.34, 0.62, mat('#a87950'), x + 0.45, y + 0.19, z + 0.7);
      } else if (/kitchen/i.test(r.name)) {
        box(parent, w * 0.72, 0.88, 0.48, mat('#d0d0c7'), x, y + 0.45, z + d * 0.25);
        box(parent, w * 0.68, 0.045, 0.44, mat('#858d87'), x, y + 0.92, z + d * 0.25);
      } else if (/dining/i.test(r.name)) {
        box(parent, 0.95, 0.12, 0.78, woodAlt, x, y + 0.78, z);
        for (const dx of [-0.34, 0.34]) for (const dz of [-0.27, 0.27]) box(parent, 0.11, 0.53, 0.11, wood, x + dx, y + 0.3, z + dz);
      } else if (/puja|prayer/i.test(r.name)) {
        box(parent, 0.62, 0.82, 0.28, trim, x, y + 0.45, z - d * 0.2);
        box(parent, 0.75, 0.07, 0.33, brass, x, y + 0.88, z - d * 0.2);
      } else if (/bath|wc|toilet/i.test(r.name)) {
        const ceramic = mat('#f5f5f0'), cabinet = mat('#b99570');
        const showerGlass = new THREE.MeshPhysicalMaterial({ color: '#c8e0dc', roughness: 0.16, metalness: 0.04, transparent: true, opacity: 0.34 });
        box(parent, 0.82, 0.65, 0.48, cabinet, x - w * 0.27, y + 0.34, z - d * 0.23);
        const basin = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), ceramic);
        basin.scale.set(0.39, 0.105, 0.27);
        basin.position.set(x - w * 0.27, y + 0.72, z - d * 0.23);
        basin.castShadow = true;
        parent.add(basin);
        const tap = box(parent, 0.045, 0.24, 0.045, brass, x - w * 0.27, y + 0.86, z - d * 0.42);
        tap.castShadow = true;
        const toilet = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), ceramic);
        toilet.scale.set(0.28, 0.22, 0.38);
        toilet.position.set(x + w * 0.24, y + 0.22, z + d * 0.12);
        toilet.castShadow = true;
        parent.add(toilet);
        box(parent, 0.48, 0.54, 0.19, ceramic, x + w * 0.24, y + 0.48, z + d * 0.43);
        box(parent, 0.92, 0.055, 0.95, mat('#d8e1de'), x + w * 0.25, y + 0.055, z + d * 0.36);
        box(parent, 0.045, 2.05, 0.98, showerGlass, x + w * 0.25, y + 1.03, z + d * 0.36);
      }
    };

    // Scaled garden plinth
    const gardenW = BUILDING_W * FT + 16, gardenD = BUILDING_D * FT + 16;
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(gardenW, 0.3, gardenD), mat('#718c62'));
    foundation.position.y = -0.16;
    foundation.receiveShadow = true;
    root.add(foundation);

    const pathMat = mat('#c6bda9'), stoneMat = mat('#8c987e'), leafMat = mat('#66894f'), leafLight = mat('#7d9d5d'), trunkMat = mat('#70513b');
    const entryRoom = rooms.find(r => r.floor === 0 && /sitout|entrance|foyer|living/i.test(r.name) && Math.abs(roomBounds(r).z) < 0.001) ?? rooms.find(r => r.floor === 0);
    const entryBounds = entryRoom ? roomBounds(entryRoom) : { x: BUILDING_W / 2, z: 0, w: 8, d: 6 };
    const pathLength = 5.2, pathCenterZ = worldZ(-1.8) - pathLength / 2;
    const approach = box(root, 1.65, 0.08, pathLength, pathMat, worldX(entryBounds.x + entryBounds.w / 2), -0.005, pathCenterZ);
    approach.receiveShadow = true;

    const halfW = BUILDING_W * FT / 2, halfD = BUILDING_D * FT / 2;
    const bedPositions = [[-halfW - 2.5, -halfD + 4], [halfW + 2.5, -halfD + 4], [-halfW - 2.5, halfD - 4], [halfW + 2.5, halfD - 4]] as const;
    for (const [bx, bz] of bedPositions) {
      const bed = box(root, 2.1, 0.12, 1.25, stoneMat, bx, -0.015, bz);
      bed.receiveShadow = true;
      for (let i = 0; i < 5; i++) {
        const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.34 + (i % 2) * 0.06, 12, 10), i % 2 ? leafLight : leafMat);
        shrub.scale.y = 0.72;
        shrub.position.set(bx - 0.72 + i * 0.36, 0.24, bz);
        shrub.castShadow = true;
        root.add(shrub);
      }
    }

    const treePlaces = [[-halfW - 3.5, -halfD - 3.5], [halfW + 3.5, -halfD - 3.5], [-halfW - 3.5, halfD + 3.5], [halfW + 3.5, halfD + 3.5]] as const;
    for (const [tx, tz] of treePlaces) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.65, 9), trunkMat);
      trunk.position.set(tx, 0.8, tz);
      trunk.castShadow = true;
      root.add(trunk);
      for (const [ox, oy, oz, rad] of [[0, 1.85, 0, 1.05], [-0.48, 1.5, 0.16, 0.72], [0.46, 1.52, -0.12, 0.76]] as const) {
        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 1), leafLight);
        crown.position.set(tx + ox, oy, tz + oz);
        crown.castShadow = true;
        root.add(crown);
      }
    }

    // Add continuous solid structural floor slabs to every floor
    for (let f = 0; f < floorCount; f++) {
      createFloorSlab(f, floorRoots[f]);
    }

    rooms.forEach(r => {
      const b = roomBounds(r);
      const x = worldX(b.x + b.w / 2);
      const z = worldZ(b.z + b.d / 2);
      const w = b.w * FT;
      const d = b.d * FT;
      const y = r.floor * LEVEL;
      const group = new THREE.Group();
      group.userData.room = r;
      floorRoots[r.floor].add(group);

      makeFloor(group, r, b, x, z, y, w, d);

      if (r.kind === 'stair') {
        const hasFloorAbove = rooms.some(other => other.floor === r.floor + 1);
        const risers = Math.max(4, Math.round(standard.stairSteps / 2));
        const rise = LEVEL / standard.stairSteps;
        const landingDepth = stairLandingDepth(d);
        const run = Math.max(0.8, d - landingDepth);
        const tread = run / risers;
        const flightWidth = w * 0.44;
        const flightCenters = [x - w * 0.26, x + w * 0.26];
        const front = z + d / 2 - 0.06;
        const landingZ = z - d / 2 + landingDepth / 2;
        const railY = standard.railingHeight;
        const railRadius = 0.035;

        if (hasFloorAbove) {
          box(group, w, 0.12, landingDepth, woodAlt, x, y + LEVEL / 2 - 0.06, landingZ);
          for (let flight = 0; flight < 2; flight++) {
            for (let i = 0; i < risers; i++) {
              const climbIndex = flight * risers + i;
              const stepY = y + rise * (climbIndex + 1);
              const stepZ = flight === 0 ? front - tread * (i + 0.5) : landingZ + landingDepth / 2 + tread * (i + 0.5);
              const treadBox = box(group, flightWidth, 0.07, tread - 0.012, woodAlt, flightCenters[flight], stepY - 0.045, stepZ);
              treadBox.receiveShadow = true;
              box(group, flightWidth, 0.018, tread - 0.02, trim, flightCenters[flight], stepY - 0.008, stepZ);
              box(group, flightWidth, 0.13, 0.038, trim, flightCenters[flight], stepY - 0.105, flight === 0 ? stepZ + tread / 2 - 0.018 : stepZ - tread / 2 + 0.018);
            }
          }

          const addSlopedRail = (xc: number, z0: number, z1: number, y0: number, y1: number) => {
            const a = new THREE.Vector3(xc, y0, z0), bVec = new THREE.Vector3(xc, y1, z1);
            const delta = bVec.clone().sub(a);
            const beam = new THREE.Mesh(new THREE.CylinderGeometry(railRadius, railRadius, delta.length(), 10), wood);
            beam.position.copy(a).add(bVec).multiplyScalar(0.5);
            beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
            beam.castShadow = true;
            group.add(beam);
          };

          for (let flight = 0; flight < 2; flight++) {
            const xc = flightCenters[flight];
            const outer = xc + (flight === 0 ? -1 : 1) * (flightWidth / 2 - 0.06);
            const inner = xc + (flight === 0 ? 1 : -1) * (flightWidth / 2 - 0.06);
            const z0 = flight === 0 ? front : landingZ + landingDepth / 2;
            const z1 = flight === 0 ? landingZ + landingDepth / 2 : front;
            const baseY = flight === 0 ? y : y + LEVEL / 2;
            addSlopedRail(outer, z0, z1, baseY + railY, baseY + LEVEL / 2 + railY);
            addSlopedRail(inner, z0, z1, baseY + railY, baseY + LEVEL / 2 + railY);
          }

          // Central dividing handrail collision only, stopping well before front entry/exit
          const railMidZ = (front + landingZ + landingDepth / 2) / 2;
          const railLen = Math.max(0.4, (front - (landingZ + landingDepth / 2)) - 0.6);
          walls.push({
            axis: 'z',
            x,
            z: railMidZ,
            length: railLen,
            floor: r.floor,
            stairRail: true,
          });

          const upperEdge = front + 0.92;
          const exitMid = (front + upperEdge) / 2;
          const exitDepth = Math.max(0.92, Math.abs(upperEdge - front) + 0.18);
          const topLanding = box(group, w * 0.88, 0.11, exitDepth, woodAlt, x, y + LEVEL - 0.055, exitMid);
          topLanding.receiveShadow = true;

          const guardY = y + LEVEL / 2 + railY, landingSide = landingDepth * 0.46;
          for (const side of [-1, 1]) {
            const gx = x + side * w * 0.46;
            box(group, 0.055, railY, 0.055, wood, gx, guardY - railY / 2, landingZ);
            box(group, 0.055, 0.065, landingDepth * 0.92, wood, gx, guardY, landingZ);
            for (let i = 0; i <= 4; i++) {
              box(group, 0.035, railY, 0.035, wood, gx, y + LEVEL / 2 + railY / 2, landingZ - landingSide + landingDepth * 0.23 * i);
            }
            walls.push({ axis: 'z', x: gx, z: landingZ, length: landingDepth * 0.92, floor: r.floor });
          }
        } else {
          // Top-floor landing arrival guard railings:
          // Guard only the left flight stairwell opening, leaving the arrival on the right 100% free!
          const guardY = y + railY;
          const voidRailSpan = w * 0.48;
          box(group, voidRailSpan, railY, 0.05, wood, x - w * 0.24, guardY - railY / 2, front);
          for (const side of [-1, 1]) {
            const gx = x + side * w * 0.46;
            box(group, 0.055, railY, 0.055, wood, gx, guardY - railY / 2, landingZ);
            box(group, 0.055, 0.065, landingDepth * 0.92, wood, gx, guardY, landingZ);
          }
        }
        const lowerApron = box(group, w * 0.88, 0.11, 0.92, woodAlt, x, y - 0.055, front + 0.35);
        lowerApron.receiveShadow = true;
      } else if (r.kind === 'outdoor') {
        const deck = box(group, w, 0.06, d, mat('#ba9d77'), x, y + 0.025, z);
        deck.receiveShadow = true;
      }

      addFurniture(r, group, y + 0.05, x, z, w, d);
    });

    // =========================================================
    // ROBUST ARCHITECTURAL WALL GENERATOR
    // Encloses every single room with crisp, well-defined walls,
    // interior partition doors, exterior windows, and railings.
    // =========================================================
    const EDGE_TOL = 0.9; // ~11 inches tolerance for matching adjacent room edges

    // Exterior main door only for the designated main entrance
    const exteriorEntry = rooms.find(r => r.floor === 0 && /sitout|entrance|foyer/i.test(r.name))
      ?? rooms.find(r => r.floor === 0 && /living/i.test(r.name))
      ?? rooms.find(r => r.floor === 0);

    interface RoomEdge {
      room: Room;
      axis: Axis;
      coord: number;
      start: number;
      end: number;
      side: 'south' | 'north' | 'west' | 'east';
    }

    const buildEdgeSpan = (
      parent: THREE.Object3D,
      e: RoomEdge,
      start: number,
      end: number,
      y: number,
      floor: number,
      roomDoorCount: Map<string, number>
    ) => {
      const span = (end - start) * FT;
      if (span < 0.28) return;
      const mid = (start + end) / 2;
      const wallX = e.axis === 'x' ? worldX(mid) : worldX(e.coord);
      const wallZ = e.axis === 'x' ? worldZ(e.coord) : worldZ(mid);

      const r = e.room;
      const outdoor = r.kind === 'outdoor' || /balcony|terrace|sitout|porch|verandah|deck/i.test(r.name);
      const isStair = r.kind === 'stair' || /stair|steps/i.test(r.name);

      // 1. Ground floor outdoor areas (balconies, car porch, sitouts) are completely fence-less!
      if (outdoor && floor === 0) {
        return;
      }

      // 2. Upper floor balconies / terraces have safety railings
      if (outdoor && floor > 0) {
        addRailing(parent, e.axis, wallX, wallZ, y, span);
        return;
      }

      // 3. Stair entry / exit threshold along south edge is ALWAYS 100% open
      if (isStair && e.side === 'south') {
        const beamH = Math.max(0.35, WALL - 2.4);
        if (e.axis === 'x') {
          box(parent, span, beamH, wallThickness, wallMat, wallX, y + WALL - beamH / 2, wallZ);
        } else {
          box(parent, wallThickness, beamH, span, wallMat, wallX, y + WALL - beamH / 2, wallZ);
        }
        return;
      }

      // Exterior outer boundary facing outside garden/yard
      const isOuterBoundary = e.axis === 'z'
        ? (e.coord <= 1.2 || e.coord >= BUILDING_W - 1.2)
        : (e.coord <= 1.2 || e.coord >= BUILDING_D - 1.2);

      // NO outside garden-facing doors anywhere EXCEPT the single main entrance on Ground Floor!
      const isMainEntry = floor === 0 && e.side === 'south' && r.id === exteriorEntry?.id;
      const needsCorridorDoor = (roomDoorCount.get(r.id) || 0) === 0 && !isOuterBoundary;

      if (isMainEntry) {
        addWall(parent, e.axis, wallX, wallZ, y, span, standard.mainDoorWidth, false);
        roomDoorCount.set(r.id, (roomDoorCount.get(r.id) || 0) + 1);
      } else if (needsCorridorDoor) {
        // Interior corridor/circulation door
        addWall(parent, e.axis, wallX, wallZ, y, span, standard.internalDoorWidth, false);
        roomDoorCount.set(r.id, (roomDoorCount.get(r.id) || 0) + 1);
      } else {
        // Solid exterior or interior wall (with windows on outer boundary for light)
        const hasWindow = span > 1.45 && isOuterBoundary && !/toilet|bath|wc|stair/i.test(r.name);
        addWall(parent, e.axis, wallX, wallZ, y, span, 0, hasWindow);
      }
    };

    for (let f = 0; f < floorCount; f++) {
      const floorRooms = rooms.filter(r => r.floor === f);
      if (!floorRooms.length) continue;
      const y = f * LEVEL;
      const parent = floorRoots[f];

      const roomDoorCount = new Map<string, number>();
      floorRooms.forEach(r => roomDoorCount.set(r.id, 0));

      const allEdges: RoomEdge[] = [];
      for (const r of floorRooms) {
        const b = roomBounds(r);
        allEdges.push(
          { room: r, axis: 'x', coord: b.z, start: b.x, end: b.x + b.w, side: 'south' },
          { room: r, axis: 'x', coord: b.z + b.d, start: b.x, end: b.x + b.w, side: 'north' },
          { room: r, axis: 'z', coord: b.x, start: b.z, end: b.z + b.d, side: 'west' },
          { room: r, axis: 'z', coord: b.x + b.w, start: b.z, end: b.z + b.d, side: 'east' }
        );
      }

      const generatedSharedPairs = new Set<string>();

      for (const e of allEdges) {
        const adjacent: { otherEdge: RoomEdge; oStart: number; oEnd: number }[] = [];
        for (const other of allEdges) {
          if (other.room.id === e.room.id) continue;
          if (other.axis !== e.axis) continue;
          if (Math.abs(other.coord - e.coord) > EDGE_TOL) continue;
          const oStart = Math.max(e.start, other.start);
          const oEnd = Math.min(e.end, other.end);
          if (oEnd - oStart > 0.45) {
            adjacent.push({ otherEdge: other, oStart, oEnd });
          }
        }
        adjacent.sort((a, b) => a.oStart - b.oStart);

        // A) Shared Partition Walls between adjacent rooms
        for (const adj of adjacent) {
          const rA = e.room, rB = adj.otherEdge.room;
          const pairKey = [rA.id, rB.id, e.axis, Math.round(e.coord * 5)].sort().join(':');
          if (generatedSharedPairs.has(pairKey)) continue;
          generatedSharedPairs.add(pairKey);

          const span = (adj.oEnd - adj.oStart) * FT;
          if (span < 0.28) continue;

          const centerCoord = (e.coord + adj.otherEdge.coord) / 2;
          const midPos = (adj.oStart + adj.oEnd) / 2;
          const wallX = e.axis === 'x' ? worldX(midPos) : worldX(centerCoord);
          const wallZ = e.axis === 'x' ? worldZ(centerCoord) : worldZ(midPos);

          const isBath = /bath|wc|toilet/i.test(`${rA.name} ${rB.name}`);
          const isStair = rA.kind === 'stair' || rB.kind === 'stair';
          const isLivingDining = /living/i.test(`${rA.name} ${rB.name}`) && /dining/i.test(`${rA.name} ${rB.name}`);
          const isPassage = /passage|corridor|lobby|hall|landing/i.test(`${rA.name} ${rB.name}`);
          const isOutdoor = rA.kind === 'outdoor' || rB.kind === 'outdoor';

          let doorWidth = 0;
          let openPassage = false;
          let swingSign = 1;

          if (isStair) {
            // Stair entry/exit portal: fully open for free passage!
            doorWidth = span;
            openPassage = true;
            roomDoorCount.set(rA.id, (roomDoorCount.get(rA.id) || 0) + 1);
            roomDoorCount.set(rB.id, (roomDoorCount.get(rB.id) || 0) + 1);
          } else if (isOutdoor) {
            // Outdoor connection (balcony / terrace doorway from inside)
            doorWidth = standard.internalDoorWidth;
            roomDoorCount.set(rA.id, (roomDoorCount.get(rA.id) || 0) + 1);
            roomDoorCount.set(rB.id, (roomDoorCount.get(rB.id) || 0) + 1);
          } else if (isBath) {
            // Attached toilet door facing inward from bedroom
            doorWidth = standard.bathDoorWidth;
            const bathRoom = /bath|wc|toilet/i.test(rA.name) ? rA : rB;
            const bb = roomBounds(bathRoom);
            swingSign = e.axis === 'x'
              ? (bb.z + bb.d / 2 > centerCoord ? 1 : -1)
              : (bb.x + bb.w / 2 > centerCoord ? -1 : 1);
            roomDoorCount.set(rA.id, (roomDoorCount.get(rA.id) || 0) + 1);
            roomDoorCount.set(rB.id, (roomDoorCount.get(rB.id) || 0) + 1);
          } else if (isLivingDining) {
            doorWidth = Math.min(2.4, span * 0.85);
            openPassage = true;
            roomDoorCount.set(rA.id, (roomDoorCount.get(rA.id) || 0) + 1);
            roomDoorCount.set(rB.id, (roomDoorCount.get(rB.id) || 0) + 1);
          } else if (isPassage) {
            doorWidth = standard.internalDoorWidth;
            openPassage = true;
            roomDoorCount.set(rA.id, (roomDoorCount.get(rA.id) || 0) + 1);
            roomDoorCount.set(rB.id, (roomDoorCount.get(rB.id) || 0) + 1);
          } else if (/bedroom/i.test(rA.name) && /bedroom/i.test(rB.name)) {
            doorWidth = 0; // Solid partition between two adjacent bedrooms
          } else {
            // Internal partition door (bedroom to hall, kitchen to dining, store to kitchen)
            doorWidth = standard.internalDoorWidth;
            roomDoorCount.set(rA.id, (roomDoorCount.get(rA.id) || 0) + 1);
            roomDoorCount.set(rB.id, (roomDoorCount.get(rB.id) || 0) + 1);
          }

          addWall(parent, e.axis, wallX, wallZ, y, span, doorWidth, false, openPassage, undefined, swingSign);
        }

        // B) Unshared Walls
        let currentPos = e.start;
        for (const adj of adjacent) {
          if (adj.oStart > currentPos + 0.4) {
            buildEdgeSpan(parent, e, currentPos, adj.oStart, y, f, roomDoorCount);
          }
          currentPos = Math.max(currentPos, adj.oEnd);
        }
        if (e.end > currentPos + 0.4) {
          buildEdgeSpan(parent, e, currentPos, e.end, y, f, roomDoorCount);
        }
      }

      // C) INWARD DOOR GUARANTOR: Every single room MUST have a door facing inwards towards the hallway/living core
      // NO external doors facing the outside garden/yard (except the single front main entrance on ground floor)
      for (const r of floorRooms) {
        if ((roomDoorCount.get(r.id) || 0) === 0 && r.kind !== 'outdoor' && r.kind !== 'stair') {
          const b = roomBounds(r);
          // Candidate interior edges sorted by closeness to building's central circulation spine (x: 16.4, z: 23)
          const centerX = BUILDING_W / 2;
          const centerZ = BUILDING_D / 2;
          const candidateEdges = [
            // South wall (if not on outer boundary)
            { axis: 'x' as Axis, coord: b.z, x: b.x + b.w / 2, z: b.z, len: b.w, isOuter: b.z <= 1.2 },
            // North wall (if not on outer boundary)
            { axis: 'x' as Axis, coord: b.z + b.d, x: b.x + b.w / 2, z: b.z + b.d, len: b.w, isOuter: b.z + b.d >= BUILDING_D - 1.2 },
            // West wall (if not on outer boundary)
            { axis: 'z' as Axis, coord: b.x, x: b.x, z: b.z + b.d / 2, len: b.d, isOuter: b.x <= 1.2 },
            // East wall (if not on outer boundary)
            { axis: 'z' as Axis, coord: b.x + b.w, x: b.x + b.w, z: b.z + b.d / 2, len: b.d, isOuter: b.x + b.w >= BUILDING_W - 1.2 },
          ];

          // Filter out garden-facing outer boundary walls so doors face strictly INWARDS into the home
          const inwardEdges = candidateEdges.filter(c => !c.isOuter);
          const list = inwardEdges.length > 0 ? inwardEdges : candidateEdges;
          list.sort((p1, p2) => Math.hypot(p1.x - centerX, p1.z - centerZ) - Math.hypot(p2.x - centerX, p2.z - centerZ));

          const best = list[0];
          const span = best.len * FT;
          const wallX = best.axis === 'x' ? worldX(best.x) : worldX(best.coord);
          const wallZ = best.axis === 'x' ? worldZ(best.coord) : worldZ(best.z);
          addWall(parent, best.axis, wallX, wallZ, y, span, standard.internalDoorWidth, false);
          roomDoorCount.set(r.id, 1);
        }
      }
    }

    const gridSpan = Math.max(BUILDING_W, BUILDING_D) * FT + 14;
    const grid = new THREE.GridHelper(gridSpan, Math.round(gridSpan), '#a0ae98', '#aab7a2');
    grid.position.y = -0.32;
    scene.add(grid);

    const floorFades = floorRoots.map(floorRoot => {
      const entries: { materials: THREE.Material[]; opacity: number[]; transparent: boolean[]; depthWrite: boolean[] }[] = [];
      floorRoot.traverse(object => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const copies = source.map(material => material.clone());
        mesh.material = Array.isArray(mesh.material) ? copies : copies[0];
        entries.push({
          materials: copies,
          opacity: copies.map(material => material.opacity),
          transparent: copies.map(material => material.transparent),
          depthWrite: copies.map(material => material.depthWrite),
        });
      });
      return entries;
    });
    const floorAlpha = Array.from({ length: floorCount }, () => 1);

    const stairB = stairBounds;
    const minFloor = floorLevels.length ? Math.min(...floorLevels) : 0;
    const spawnRoom = rooms.find(r => r.floor === minFloor && /sitout|entrance|foyer|living|hall|loft|bedroom/i.test(r.name)) ?? rooms.find(r => r.floor === minFloor) ?? rooms[0];
    const spawnFloor = spawnRoom?.floor ?? minFloor;
    const spawnBounds = spawnRoom ? roomBounds(spawnRoom) : { x: BUILDING_W / 2, z: 0, w: 8, d: 6 };
    const controls = {
      yaw: Math.PI / 2,
      pitch: 0,
      x: worldX(spawnBounds.x + spawnBounds.w / 2),
      z: worldZ(spawnBounds.z + spawnBounds.d / 2),
      y: 1.6 + spawnFloor * LEVEL,
      floor: spawnFloor,
      stairBaseFloor: undefined as number | undefined,
      keys: new Set<string>(),
      drag: false,
      lastX: 0,
      lastY: 0,
    };

    if (walkthroughRef.current) {
      camera.position.set(controls.x, controls.y, controls.z);
      camera.rotation.order = 'YXZ';
    } else {
      camera.position.copy(orbitPosition);
      camera.lookAt(orbitTarget);
    }

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };

    const down = (e: PointerEvent) => {
      controls.drag = true;
      controls.lastX = e.clientX;
      controls.lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const move = (e: PointerEvent) => {
      if (controls.drag && walkthroughRef.current) {
        controls.yaw -= (e.clientX - controls.lastX) * 0.003;
        controls.pitch = Math.max(-1.2, Math.min(1.2, controls.pitch - (e.clientY - controls.lastY) * 0.0025));
      } else if (controls.drag) {
        const dx = (controls.lastX - e.clientX) * 0.025, dz = (e.clientY - controls.lastY) * 0.025;
        camera.position.x += dx;
        camera.position.z += dz;
        orbitPosition.x += dx;
        orbitPosition.z += dz;
        camera.lookAt(orbitTarget);
      }
      controls.lastX = e.clientX;
      controls.lastY = e.clientY;
    };

    const up = () => (controls.drag = false);

    const key = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
        controls.keys.add(k);
        if (k.startsWith('arrow')) e.preventDefault();
      }
    };

    const keyup = (e: KeyboardEvent) => controls.keys.delete(e.key.toLowerCase());

    const click = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...doorRoots, ...floorHits], true)[0];
      let node = hit?.object as THREE.Object3D | undefined;
      while (node && !node.userData.toggle) node = node.parent ?? undefined;
      if (node) {
        (node.userData.toggle as () => void)();
        return;
      }
      if (walkthroughRef.current) return;
      let roomNode = hit?.object as THREE.Object3D | undefined;
      while (roomNode && !roomNode.userData.room) roomNode = roomNode.parent ?? undefined;
      const r = roomNode?.userData.room as Room | undefined;
      if (r) onSelect(r.id);
    };

    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('click', click);
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', keyup);
    window.addEventListener('resize', resize);
    resize();

    let raf = 0;
    const gaitClock = new THREE.Clock();

    const render = () => {
      const delta = Math.min(gaitClock.getDelta(), 0.05);
      doorRoots.forEach(door => {
        const target = door.userData.targetAngle as number | undefined;
        if (target !== undefined) door.rotation.y = THREE.MathUtils.damp(door.rotation.y, target, 11, delta);
      });

      if (walkthroughRef.current) {
        const forward = Number(controls.keys.has('w') || controls.keys.has('arrowup')) - Number(controls.keys.has('s') || controls.keys.has('arrowdown'));
        const side = Number(controls.keys.has('d') || controls.keys.has('arrowright')) - Number(controls.keys.has('a') || controls.keys.has('arrowleft'));
        const length = Math.hypot(forward, side) || 1;
        const speed = (controls.keys.has('shift') ? 3.5 : 1.85) * delta / length;
        const moveX = (-Math.sin(controls.yaw) * forward + Math.cos(controls.yaw) * side) / length;
        const moveZ = (-Math.cos(controls.yaw) * forward - Math.sin(controls.yaw) * side) / length;
        const nextX = controls.x + moveX * speed;
        const nextZ = controls.z + moveZ * speed;
        const stairX = worldX(stairB.x), stairRight = worldX(stairB.x + stairB.w);
        const stairFront = worldZ(stairB.z) + 0.08, stairBack = worldZ(stairB.z + stairB.d);
        const stairCenter = (stairX + stairRight) / 2;
        const stairD = stairFront - stairBack;
        const landingDepth = stairLandingDepth(stairD);
        const stairRun = Math.max(0.5, stairD - landingDepth);
        const landingCenter = stairBack + landingDepth / 2;
        const landingFront = landingCenter + landingDepth / 2;

        const blocked = (x: number, z: number) => {
          // Allow generous outdoor travel including around all trees, gardens, and porches
          const halfBoundaryW = BUILDING_W * FT / 2 + 7.5;
          const halfBoundaryD = BUILDING_D * FT / 2 + 7.5;
          if (x < -halfBoundaryW || x > halfBoundaryW || z < -halfBoundaryD || z > halfBoundaryD) return true;

          // Trees and landscaping areas are 100% free of collision — never block walking!
          const nearStairThreshold = x > stairX - 0.5 && x < stairRight + 0.5 && z > stairFront - 1.2 && z < stairFront + 1.4;
          const insideStair = x > stairX - 0.25 && x < stairRight + 0.25 && z < stairFront + 0.35 && z > stairBack - 0.35;

          // Staircore is 100% free to move around — zero snagging or invisible handrail bumps
          if (nearStairThreshold || insideStair) {
            return false;
          }

          // Doors allow camera to pass freely (triggering smooth swing open)
          for (const door of doorPlanes) {
            if (door.floor !== controls.floor) continue;
            const inDoorway = door.axis === 'x'
              ? Math.abs(z - door.z) < 1.05 && Math.abs(x - door.x) < door.width / 2 + 0.3
              : Math.abs(x - door.x) < 1.05 && Math.abs(z - door.z) < door.width / 2 + 0.3;
            if (inDoorway) {
              if (!door.pivot.userData.open) {
                (door.pivot.userData.toggle as () => void)();
              }
              return false; // CAMERA PASSES FREELY THROUGH DOORWAY!
            }
          }

          // Check standard interior & exterior partition walls
          for (const wall of walls) {
            if (wall.floor !== controls.floor) continue;
            if (wall.stairRail) continue;
            const hitsWall = wall.axis === 'x'
              ? Math.abs(z - wall.z) < 0.22 && Math.abs(x - wall.x) < wall.length / 2 + 0.15
              : Math.abs(x - wall.x) < 0.22 && Math.abs(z - wall.z) < wall.length / 2 + 0.15;
            if (hitsWall) return true;
          }
          return false;
        };

        if (!blocked(nextX, controls.z)) controls.x = nextX;
        if (!blocked(controls.x, nextZ)) controls.z = nextZ;

        // =========================================================
        // SMOOTH MULTI-FLOOR STAIR ELEVATION & TRANSITION
        // Entire stair zone is 100% free to move around in all directions!
        // =========================================================
        const inStairZone = controls.x > stairX - 0.25 && controls.x < stairRight + 0.25
          && controls.z < stairFront + 0.45 && controls.z > stairBack - 0.3;

        if (inStairZone) {
          const leftFlight = controls.x < stairCenter;
          const onLanding = controls.z <= landingFront + 0.15;

          // When entering descending flight (right flight) from an upper floor
          if (controls.floor > 0 && !leftFlight && controls.z < stairFront - 0.22 && controls.stairBaseFloor === undefined) {
            controls.stairBaseFloor = controls.floor - 1;
          } else if (controls.stairBaseFloor === undefined) {
            controls.stairBaseFloor = controls.floor;
          }

          const baseF = controls.stairBaseFloor ?? controls.floor;

          let flightFraction = 0;
          if (leftFlight) {
            // Left flight: climbs smoothly from stairFront (0) to intermediate landing (0.5)
            const t1 = Math.max(0, Math.min(1, (stairFront - controls.z) / stairRun));
            flightFraction = t1 * 0.5;
          } else if (onLanding) {
            flightFraction = 0.5;
          } else {
            // Right flight: climbs smoothly from intermediate landing (0.5) to upper floor arrival (1.0)
            const t2 = Math.max(0, Math.min(1, (controls.z - landingFront) / stairRun));
            flightFraction = 0.5 + t2 * 0.5;
          }

          // Arrived at upper floor (right flight near front portal)
          if (!leftFlight && controls.z >= stairFront - 0.22) {
            controls.floor = Math.min(maxFloorIndex, baseF + 1);
            controls.stairBaseFloor = undefined;
            controls.y = THREE.MathUtils.damp(controls.y, 1.6 + controls.floor * LEVEL, 14, delta);
          }
          // Arrived at lower floor (left flight near front portal)
          else if (leftFlight && controls.z >= stairFront - 0.22) {
            controls.floor = Math.max(0, baseF);
            controls.stairBaseFloor = undefined;
            controls.y = THREE.MathUtils.damp(controls.y, 1.6 + controls.floor * LEVEL, 14, delta);
          } else {
            const targetY = 1.6 + (baseF + flightFraction) * LEVEL;
            controls.y = THREE.MathUtils.damp(controls.y, targetY, 14, delta);
          }
        } else {
          controls.stairBaseFloor = undefined;
          controls.y = THREE.MathUtils.damp(controls.y, 1.6 + controls.floor * LEVEL, 14, delta);
        }

        camera.position.lerp(new THREE.Vector3(controls.x, controls.y, controls.z), 0.3);
        camera.rotation.set(controls.pitch, controls.yaw, 0, 'YXZ');

        const current = rooms.find(r => {
          const b = roomBounds(r);
          return r.floor === controls.floor &&
            controls.x >= worldX(b.x) && controls.x <= worldX(b.x + b.w) &&
            controls.z <= worldZ(b.z) && controls.z >= worldZ(b.z + b.d);
        });
        onRoom(current?.name ?? (controls.floor > 0 ? `Level ${controls.floor} Hall` : 'Passage'));
      } else {
        camera.position.lerp(orbitPosition, 0.13);
        camera.lookAt(orbitTarget);
      }

      const desiredFov = walkthroughRef.current ? 88 : 48;
      if (Math.abs(camera.fov - desiredFov) > 0.05) {
        camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, 6, 1 / 60);
        camera.updateProjectionMatrix();
      }

      const activeView = viewRef.current, walking = walkthroughRef.current;
      const progress = walking ? 1 : Math.max(0, Math.min(1, buildProgressRef.current));
      const totalBuildStages = floorCount;

      floorRoots.forEach((floorRoot, index) => {
        const singleFloor = floorLevels.length === 1 ? floorLevels[0] : null;
        const isSelectedFloor = (activeView === 'ground' && (index === 0 || singleFloor === index))
          || (activeView === 'upper' && (index === 1 || singleFloor === index))
          || activeView === `floor-${index}`;
        const viewPermitsShow = walking || activeView === 'all' || activeView === 'exploded' || isSelectedFloor;

        // Progressive bottom-to-top construction stages:
        // Floor 0 builds from 0.00 to 0.33, Floor 1 from 0.33 to 0.66, Floor 2 from 0.66 to 1.00
        const stageStart = index / totalBuildStages;
        const stageEnd = (index + 1) / totalBuildStages;
        const floorBuildFactor = Math.max(0, Math.min(1, (progress - stageStart) / (stageEnd - stageStart)));

        const isBuilt = floorBuildFactor > 0.02;
        const show = viewPermitsShow && isBuilt;

        const targetAlpha = show ? (floorBuildFactor >= 0.98 ? 1 : 0.85 * floorBuildFactor) : 0;
        const alpha = THREE.MathUtils.damp(floorAlpha[index], targetAlpha, 7, 1 / 60);
        floorAlpha[index] = Math.abs(alpha - targetAlpha) < 0.004 ? targetAlpha : alpha;
        floorRoot.visible = floorAlpha[index] > 0.005;

        // Scale building height and position smoothly as it rises from the slab
        const scaleY = walking ? 1 : Math.min(1, Math.max(0.01, floorBuildFactor));
        floorRoot.scale.set(1, scaleY, 1);

        for (const entry of floorFades[index]) {
          entry.materials.forEach((material, matIndex) => {
            material.opacity = entry.opacity[matIndex] * floorAlpha[index];
            const transparent = entry.transparent[matIndex] || floorAlpha[index] < 0.995;
            if (material.transparent !== transparent) {
              material.transparent = transparent;
              material.needsUpdate = true;
            }
            material.depthWrite = floorAlpha[index] < 0.995 ? false : entry.depthWrite[matIndex];
          });
        }
        const liftTarget = !walking && activeView === 'exploded' ? index * 1.6 : 0;
        floorRoot.position.y = THREE.MathUtils.damp(floorRoot.position.y, liftTarget, 6, 1 / 60);
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    api.current = {
      dispose: () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', key);
        window.removeEventListener('keyup', keyup);
        renderer.dispose();
        el.removeChild(renderer.domElement);
      },
    };
    return () => api.current?.dispose();
  }, [rooms, onSelect, onRoom, standard]);

  return (
    <div className="viewer" ref={host}>
      <div className="scene-label">{walkthrough ? 'WIDE FIRST-PERSON WALKTHROUGH' : 'INTERACTIVE 3D MODEL'}</div>
      <div className="door-hint">Click a wooden door to open or close it</div>
      {walkthrough && <div className="crosshair">+</div>}
      <div className="compass">N<br />⌃</div>
    </div>
  );
}

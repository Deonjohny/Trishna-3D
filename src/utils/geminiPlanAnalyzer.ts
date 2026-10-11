import type { Room } from '../types/building';
import { getDocument, GlobalWorkerOptions, type PDFPageProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof (Promise as any).withResolvers !== 'function') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

GlobalWorkerOptions.workerSrc = workerUrl;

export const DEFAULT_GEMINI_API_KEY = '';

export function getGeminiApiKey(): string {
  try {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // localStorage may be restricted in some environments
  }
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function setGeminiApiKey(key: string): void {
  try {
    localStorage.setItem('gemini_api_key', key.trim());
  } catch {
    // ignore
  }
}

export interface GeminiRoom {
  id: string;
  name: string;
  kind?: string;
  bounds: {
    x: number;
    z: number;
    w: number;
    d?: number;
    h?: number;
    width?: number;
    depth?: number;
    height?: number;
  };
}

export interface GeminiPlanResponse {
  floorLevel: number;
  floorName?: string;
  footprint: {
    widthFt: number;
    depthFt: number;
  };
  rooms: GeminiRoom[];
}

export interface PlanAnalysisResult {
  rooms: Room[];
  pages: number;
  roomCount: number;
  footprint: string;
  stairDetected: boolean;
  floorLevels: number[];
}

/**
 * Fast client-side image downscaling to max 1536px (or 1024px) for crisp multi-floor presentation sheets.
 * Keeps transfer bandwidth small and AI inference latency low (~3-8s).
 */
export async function downscaleImageFile(file: File, maxDim = 1536): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for AI plan analysis.'));
    };
    img.src = url;
  });
}

/**
 * Render a PDF page directly to a downscaled JPEG base64 string for fast AI vision.
 */
export async function renderPdfPageToBase64(page: PDFPageProxy, maxDim = 1536): Promise<{ base64: string; mimeType: string }> {
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(2.0, maxDim / Math.max(baseViewport.width, baseViewport.height, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  await page.render({ canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
}

/**
 * Call Gemini API with fast fallback chain:
 * Primary: gemini-3.1-flash-lite (fastest ~3-6s)
 * Fallback: gemini-3.8-flash
 */
export async function callGeminiVision(base64: string, mimeType = 'image/jpeg', pageHint = ''): Promise<GeminiPlanResponse[]> {
  const apiKey = getGeminiApiKey();
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  const prompt = `You are an expert architectural plan analyzer.
Convert this architectural drawing into structured 3D room layout JSON.
${pageHint ? `Context: ${pageHint}\n` : ''}
IMPORTANT MULTI-FLOOR INSTRUCTION:
An architectural drawing or PDF sheet may contain ONE floor plan OR MULTIPLE floor plans side-by-side or stacked on the same sheet (e.g. "GROUND FLOOR PLAN", "FIRST FLOOR PLAN", "SECOND FLOOR PLAN", "TERRACE PLAN").
Examine the sheet carefully. If multiple floor plans are present, extract EACH floor plan as its own floor entry in the JSON array.

Return a JSON array of floor objects:
[
  {
    "floorLevel": 0, // 0 for Ground Floor, 1 for First / Upper Floor, 2 for Second Floor, etc.
    "floorName": "Ground Floor Plan",
    "footprint": {
      "widthFt": 33, // overall width of this building floor in feet
      "depthFt": 46  // overall depth of this building floor in feet
    },
    "rooms": [
      {
        "id": "g_living",
        "name": "Living",
        "kind": "living", // 'bedroom' | 'bathroom' | 'living' | 'kitchen' | 'dining' | 'stair' | 'open_below' | 'storage' | 'passage' | 'outdoor'
        "bounds": {
          "x": 0,    // distance from left wall in feet (0 to widthFt)
          "z": 15,   // distance from front wall in feet (0 to depthFt)
          "w": 13,   // room width in feet
          "d": 11.5  // room depth / length in feet
        }
      }
    ]
  }
]

Requirements:
1. Detect ALL floor plans visible on the sheet (Ground, First, Second, etc.).
2. For each floor, its bounds (x, z, w, d) must be in that floor's local coordinate system (x from 0 to widthFt, z from 0 to depthFt).
3. If dimensions are printed (e.g. 10.00m x 14.00m, 3.6 x 3.3, 11'-10" x 10'-10"), use them converted to feet (1m ≈ 3.28084 ft).
4. Extract every room, toilet/bath, kitchen, store, balcony, and terrace.
5. ALWAYS extract the staircase ('kind': 'stair') on every floor where shown with its bounds, keeping its (x, z) location aligned between floors.
6. Rooms on the same floor should fit tightly together without overlapping.`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64 } }
      ]
    }],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1,
      max_output_tokens: 3500
    }
  };

  let lastError: Error | null = null;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Model ${model} failed (${response.status}):`, errorText);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean);
      }

      const list: GeminiPlanResponse[] = Array.isArray(parsed) ? parsed : [parsed];
      const valid = list.filter(item => item && Array.isArray(item.rooms) && item.rooms.length > 0);
      if (valid.length > 0) {
        return valid;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Attempt with ${model} failed:`, err);
    }
  }

  throw lastError || new Error('Could not recognize floor plan with Gemini Vision. Please check your network and API key.');
}

function roomStyle(name: string, kind?: string): Pick<Room, 'material' | 'color' | 'kind'> {
  const n = name.toLowerCase();
  const k = (kind || '').toLowerCase();

  if (k === 'stair' || /stair|steps/.test(n)) return { material: 'Teak', color: '#9e7047', kind: 'stair' };
  if (k === 'open_below' || /open\s*below|void/.test(n)) return { material: 'Marble', color: '#b0bcc2', kind: 'passage' };
  if (k === 'passage' || /passage|landing|corridor|lobby|hall|foyer/.test(n)) return { material: 'Marble', color: '#c3c0b4', kind: 'passage' };
  if (k === 'outdoor' || /balcony|terrace|sitout|verandah|deck|porch|cantilever/.test(n)) return { material: 'Stone', color: '#c9bca6', kind: 'outdoor' };
  if (k === 'bathroom' || /bath|ensuite|wc|toilet|powder/.test(n)) return { material: 'Tile', color: '#88aeb3' };
  if (k === 'kitchen' || /kitchen|utility|pantry/.test(n)) return { material: 'Ceramic', color: '#9cb9b0' };
  if (k === 'storage' || /store|closet|w\.i\.c|wic|laundry/.test(n)) return { material: 'Teak', color: '#a8947f' };
  if (k === 'bedroom' || /bed|guest|master|primary|suite/.test(n)) return { material: 'Teak', color: '#bd9c79' };
  if (k === 'dining' || /dining/.test(n)) return { material: 'Teak', color: '#bc8b57' };
  if (k === 'living' || /living|lounge|family|great\s*room|loft|play\s*area|multipurpose/.test(n)) return { material: 'Marble', color: '#d8c9ad' };
  return { material: 'Marble', color: '#d8c9ad' };
}

/**
 * Transforms Gemini JSON output into typed Room[] objects ready for 3D generation.
 * Handles multiple floors from single combined sheets and aligns stairwells.
 */
export function convertGeminiPlansToRooms(
  plans: GeminiPlanResponse[],
  pageFloorOffset = 0
): { rooms: Room[]; floorLevels: number[]; footprint: string } {
  const allRooms: Room[] = [];
  const floorLevelsSet = new Set<number>();
  let primaryFootprint = '33′ × 46′';

  let globalStairBounds: { x: number; z: number; w: number; d: number } | null = null;

  plans.forEach((plan, planIdx) => {
    const rawFloor = typeof plan.floorLevel === 'number' ? plan.floorLevel : (pageFloorOffset + planIdx);
    const floorLevel = Math.max(0, rawFloor);
    floorLevelsSet.add(floorLevel);

    const fpW = Math.max(20, plan.footprint?.widthFt || 33);
    const fpD = Math.max(20, plan.footprint?.depthFt || 46);
    if (planIdx === 0) {
      primaryFootprint = `${Math.round(fpW)}′ × ${Math.round(fpD)}′`;
    }

    const floorRooms: Room[] = plan.rooms.map((r, rIdx) => {
      const style = roomStyle(r.name, r.kind);
      const rawBounds = (r as any).bounds || {};
      const w = Math.max(3, Number(rawBounds.w || rawBounds.width || 8));
      const d = Math.max(3, Number(rawBounds.d || rawBounds.h || rawBounds.depth || rawBounds.height || 8));
      const rawX = Number(rawBounds.x ?? (rIdx % 3) * 10);
      const rawZ = Number(rawBounds.z ?? rawBounds.y ?? Math.floor(rIdx / 3) * 10);
      const x = Math.max(0, Math.min(fpW - w, rawX));
      const z = Math.max(0, Math.min(fpD - d, rawZ));

      if (style.kind === 'stair' && !globalStairBounds) {
        globalStairBounds = { x, z, w, d };
      }

      return {
        id: r.id || `ai_room_f${floorLevel}_${rIdx}`,
        name: r.name || `Room ${rIdx + 1}`,
        floor: floorLevel,
        x: x + w / 2,
        z: z + d / 2,
        w,
        d,
        material: style.material,
        color: style.color,
        kind: style.kind,
        bounds: { x, z, w, d },
      };
    });

    allRooms.push(...floorRooms);
  });

  // Align stair cores vertically between all levels so stair navigation is continuous
  if (globalStairBounds) {
    allRooms.forEach(room => {
      if (room.kind === 'stair' && globalStairBounds) {
        room.bounds = { ...globalStairBounds };
        room.w = globalStairBounds.w;
        room.d = globalStairBounds.d;
        room.x = globalStairBounds.x + globalStairBounds.w / 2;
        room.z = globalStairBounds.z + globalStairBounds.d / 2;
      }
    });
  }

  const floorLevels = [...floorLevelsSet].sort((a, b) => a - b);

  return {
    rooms: allRooms,
    floorLevels,
    footprint: primaryFootprint,
  };
}

/**
 * Pipeline for image floor plans (PNG, JPG, WEBP).
 * Detects whether image contains 1 floor or multiple side-by-side floors!
 */
export async function analyzePlanImageFile(file: File): Promise<PlanAnalysisResult> {
  const { base64, mimeType } = await downscaleImageFile(file, 1536);
  const geminiPlans = await callGeminiVision(base64, mimeType);
  const converted = convertGeminiPlansToRooms(geminiPlans);

  const stairDetected = converted.rooms.some(r => r.kind === 'stair');

  return {
    rooms: converted.rooms,
    pages: 1,
    roomCount: converted.rooms.length,
    footprint: converted.footprint,
    stairDetected,
    floorLevels: converted.floorLevels,
  };
}

/**
 * Pipeline for scanned / raster / presentation PDF plans.
 * Supports multi-page PDFs as well as single-page sheets containing multiple floors!
 */
export async function analyzeScannedPdfWithGemini(file: File): Promise<PlanAnalysisResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await getDocument({ data }).promise;

  const allPlans: GeminiPlanResponse[] = [];
  const maxPagesToProcess = Math.min(document.numPages, 4);

  for (let pageNum = 1; pageNum <= maxPagesToProcess; pageNum++) {
    const page = await document.getPage(pageNum);
    const { base64, mimeType } = await renderPdfPageToBase64(page, 1536);
    const pageHint = `PDF Page ${pageNum} of ${document.numPages}`;

    try {
      const pagePlans = await callGeminiVision(base64, mimeType, pageHint);
      allPlans.push(...pagePlans);
    } catch (err) {
      console.warn(`Gemini Vision on PDF page ${pageNum} skipped:`, err);
    }
  }

  if (allPlans.length === 0) {
    throw new Error('Gemini Vision could not detect any room spaces in this PDF. Please check your image or drawing.');
  }

  const converted = convertGeminiPlansToRooms(allPlans);
  const stairDetected = converted.rooms.some(r => r.kind === 'stair');

  return {
    rooms: converted.rooms,
    pages: document.numPages,
    roomCount: converted.rooms.length,
    footprint: converted.footprint,
    stairDetected,
    floorLevels: converted.floorLevels,
  };
}

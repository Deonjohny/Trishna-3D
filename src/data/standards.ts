export type UnitSystem = 'ft' | 'm';
export type StandardId = 'indian' | 'compact';
import type { Room } from '../types/building';

export type BuildingStandard = {
  label: string;
  floorHeight: number;
  wallHeight: number;
  wallThickness: number;
  mainDoorWidth: number;
  internalDoorWidth: number;
  bathDoorWidth: number;
  doorHeight: number;
  windowWidth: number;
  windowHeight: number;
  windowSill: number;
  railingHeight: number;
  stairSteps: number;
  stairTread: number;
};

export const buildingStandards: Record<StandardId, BuildingStandard> = {
  indian: { label: 'Indian home schedule', floorHeight: 3.2, wallHeight: 2.8, wallThickness: 0.12, mainDoorWidth: 1.067, internalDoorWidth: 0.914, bathDoorWidth: 0.762, doorHeight: 2.134, windowWidth: 1.3, windowHeight: 1.08, windowSill: 0.88, railingHeight: 1.02, stairSteps: 16, stairTread: 0.28 },
  compact: { label: 'Compact residential', floorHeight: 3, wallHeight: 2.7, wallThickness: 0.10, mainDoorWidth: 0.914, internalDoorWidth: 0.813, bathDoorWidth: 0.711, doorHeight: 2.032, windowWidth: 1.2, windowHeight: 1.05, windowSill: 0.9, railingHeight: 1, stairSteps: 16, stairTread: 0.27 },
};

// Default planning targets in feet. Applied to every room on both floor levels.
export const DEFAULT_ROOM_MINIMUMS_FT = {
  bedroom: [8, 10],
  living: [8, 10],
  dining: [7, 7],
  kitchen: [7, 7],
  bathroom: [5, 7],
  study: [8, 8],
  prayer: [4, 4],
  passage: [3, 3],
  stair: [6, 9],
  outdoor: [4, 5],
  multiuse: [8, 8],
  other: [4, 4],
} as const;

export function minimumRoomSizeFt(room: Pick<Room, 'name' | 'kind'>): readonly [number, number] {
  const name = room.name.toLowerCase();
  if (room.kind === 'stair' || /stair/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.stair;
  if (/bath|wc|toilet/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.bathroom;
  if (/bedroom/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.bedroom;
  if (/kitchen/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.kitchen;
  if (/dining/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.dining;
  if (/study/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.study;
  if (/puja|prayer/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.prayer;
  if (room.kind === 'passage' || /passage|landing|corridor/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.passage;
  if (room.kind === 'outdoor') return DEFAULT_ROOM_MINIMUMS_FT.outdoor;
  if (/multiuse|family/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.multiuse;
  if (/living|lounge/.test(name)) return DEFAULT_ROOM_MINIMUMS_FT.living;
  return DEFAULT_ROOM_MINIMUMS_FT.other;
}

export function roomMeetsMinimum(room: Pick<Room, 'name' | 'kind' | 'w' | 'd' | 'bounds'>): boolean {
  const [minW, minD] = minimumRoomSizeFt(room);
  const width = room.bounds?.w ?? room.w;
  const depth = room.bounds?.d ?? room.d;
  return (width >= minW && depth >= minD) || (width >= minD && depth >= minW);
}

export function formatLength(meters: number, units: UnitSystem): string {
  return units === 'ft' ? `${(meters / 0.3048).toFixed(1)} ft` : `${meters.toFixed(2)} m`;
}

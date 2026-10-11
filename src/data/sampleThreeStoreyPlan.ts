import type { Room } from '../types/building';

const FT = 0.3048;
const BW = 36;
const BD = 42;

function r(
  floor: number,
  idx: number,
  name: string,
  bx: number,
  bz: number,
  bw: number,
  bd: number,
  nominalW: number,
  nominalD: number,
  material: string,
  color: string,
  kind?: 'outdoor' | 'stair' | 'passage'
): Room {
  return {
    id: `concept-${floor}-${idx}`,
    name,
    floor,
    bounds: { x: bx, z: bz, w: bw, d: bd },
    x: (bx + bw / 2 - BW / 2) * FT,
    z: (BD / 2 - bz - bd / 2) * FT,
    w: nominalW,
    d: nominalD,
    material,
    color,
    kind,
  };
}

export const sampleThreeStoreyRooms: Room[] = [
  // GROUND FLOOR (Level 00)
  // Front Row (z: 0 to 14)
  r(0, 0, 'Living Room', 0, 0, 14, 14, 12, 14, 'Marble', '#eee5d5'),
  r(0, 1, 'Main Staircase', 14, 0, 8, 14, 8, 14, 'Teak', '#9e7047', 'stair'),
  r(0, 2, 'Guest / Flex Room', 22, 0, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  // Middle Row (z: 14 to 28)
  r(0, 3, 'Dining', 0, 14, 14, 14, 12, 14, 'Teak', '#e5efe8'),
  r(0, 4, 'Lobby / Passage', 14, 14, 8, 14, 8, 14, 'Marble', '#e8e7df', 'passage'),
  r(0, 5, 'Kitchen', 22, 14, 14, 14, 12, 14, 'Ceramic', '#e2eeec'),
  // Rear Row (z: 28 to 42)
  r(0, 6, 'Bath 1', 0, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
  r(0, 7, 'Store', 7, 28, 7, 14, 6, 14, 'Ceramic', '#f4edda'),
  r(0, 8, 'Utility / Wash', 14, 28, 8, 14, 8, 14, 'Ceramic', '#e4efed'),
  r(0, 9, 'Bath 2', 22, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
  r(0, 10, 'Bath 3 + 4', 29, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),

  // FIRST FLOOR (Level 01)
  // Front Row (z: 0 to 14)
  r(1, 0, 'Bedroom 1', 0, 0, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  r(1, 1, 'Stair / Landing', 14, 0, 8, 14, 8, 14, 'Teak', '#9e7047', 'stair'),
  r(1, 2, 'Bedroom 2', 22, 0, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  // Middle Row (z: 14 to 28)
  r(1, 3, 'Bedroom 3', 0, 14, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  r(1, 4, 'Family Lounge / Passage', 14, 14, 8, 14, 8, 14, 'Marble', '#e6e8df', 'passage'),
  r(1, 5, 'Bedroom 4', 22, 14, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  // Rear Row (z: 28 to 42)
  r(1, 6, 'Bath 1', 0, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
  r(1, 7, 'Bedroom 5', 7, 28, 7, 14, 6, 14, 'Teak', '#eee7dc'),
  r(1, 8, 'Bath 2 + Linen', 14, 28, 8, 14, 8, 14, 'Tile', '#e3edf0'),
  r(1, 9, 'Bath 3', 22, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
  r(1, 10, 'Bath 4', 29, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),

  // SECOND FLOOR (Level 02)
  // Front Row (z: 0 to 14)
  r(2, 0, 'Bedroom 1', 0, 0, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  r(2, 1, 'Stair / Landing', 14, 0, 8, 14, 8, 14, 'Teak', '#9e7047', 'stair'),
  r(2, 2, 'Bedroom 2', 22, 0, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  // Middle Row (z: 14 to 28)
  r(2, 3, 'Bedroom 3', 0, 14, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  r(2, 4, 'Family Lounge / Passage', 14, 14, 8, 14, 8, 14, 'Marble', '#e6e8df', 'passage'),
  r(2, 5, 'Bedroom 4', 22, 14, 14, 14, 12, 14, 'Teak', '#eee7dc'),
  // Rear Row (z: 28 to 42)
  r(2, 6, 'Bath 1', 0, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
  r(2, 7, 'Bedroom 5', 7, 28, 7, 14, 6, 14, 'Teak', '#eee7dc'),
  r(2, 8, 'Bath 2 + Linen', 14, 28, 8, 14, 8, 14, 'Tile', '#e3edf0'),
  r(2, 9, 'Bath 3', 22, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
  r(2, 10, 'Bath 4', 29, 28, 7, 14, 6, 14, 'Tile', '#e3edf0'),
];

import type { Room } from '../types/building';

const FT = 0.3048;
const BW = 32.81; // 10.00m in feet
const BD = 45.93; // 14.00m in feet

// Exact conversion factors from metric plan dimensions
const m2ft = (m: number) => +(m * 3.28084).toFixed(2);

function r(
  floor: number,
  idx: number,
  name: string,
  bx: number,
  bz: number,
  bw: number,
  bd: number,
  material: string,
  color: string,
  kind?: 'outdoor' | 'stair' | 'passage'
): Room {
  return {
    id: `residence-f${floor}-${idx}`,
    name,
    floor,
    bounds: { x: bx, z: bz, w: bw, d: bd },
    x: (bx + bw / 2 - BW / 2) * FT,
    z: (BD / 2 - bz - bd / 2) * FT,
    w: bw,
    d: bd,
    material,
    color,
    kind,
  };
}

/**
 * 100% Mathematically Exact Room Layout for the 10.00m × 14.00m Three-Floor Residence
 * Matching the exact floor plans, dimensions, room alignments, and cantilever balconies.
 *
 * Coordinate Origin (0,0):
 * - x = 0 is the Western (Left) outer wall
 * - x = 32.81 is the Eastern (Right) outer wall
 * - z = 0 is the Southern (Front / Road / Main Gate) outer wall
 * - z = 45.93 is the Northern (Rear) outer wall
 */
export const sampleResidenceRooms: Room[] = [
  // =========================================================================
  // GROUND FLOOR PLAN (Scale 1:100) — 10.00m × 14.00m (32'-10" × 45'-11")
  // =========================================================================
  // Front Porch & Foyer Entry
  // Car Porch: 5.0m × 4.5m (16'-5" × 14'-9") at bottom-left
  r(0, 0, 'Car Porch', 0, 0, m2ft(5.0), m2ft(4.5), 'Stone', '#d8cfbe', 'outdoor'),

  // Front Bedroom 1: 3.6m × 3.3m (11'-10" × 10'-10") at front-right
  r(0, 1, 'Bedroom 1', m2ft(5.0), 0, m2ft(3.6), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 1: 1.5m × 2.4m (4'-11" × 7'-10") attached to Bedroom 1
  r(0, 2, 'Toilet 1', m2ft(8.5), 0, m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),

  // Living Room: 4.0m × 3.5m (13'-1" × 11'-6") behind Car Porch
  r(0, 3, 'Living Room', 0, m2ft(4.5), m2ft(4.0), m2ft(3.5), 'Marble', '#d8c9ad'),

  // Bedroom 2: 3.6m × 3.3m (11'-10" × 10'-10") in middle right
  r(0, 4, 'Bedroom 2', m2ft(5.0), m2ft(3.3), m2ft(3.6), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 2: 1.5m × 2.4m (4'-11" × 7'-10") attached to Bedroom 2
  r(0, 5, 'Toilet 2', m2ft(8.5), m2ft(3.3), m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),

  // Dining Room: 4.0m × 3.5m (13'-1" × 11'-6") behind Living
  r(0, 6, 'Dining Room', 0, m2ft(8.0), m2ft(4.0), m2ft(3.5), 'Teak', '#bc8b57'),

  // Central Staircase Core: aligned vertically across all 3 floors
  r(0, 7, 'Main Staircase', m2ft(4.0), m2ft(6.6), m2ft(2.8), m2ft(3.8), 'Teak', '#9e7047', 'stair'),

  // Kitchen: 3.5m × 3.0m (11'-6" × 9'-10") at rear-left
  r(0, 8, 'Kitchen', 0, m2ft(11.0), m2ft(3.5), m2ft(3.0), 'Ceramic', '#9cb9b0'),

  // Store: 2.0m × 1.5m (6'-7" × 4'-11") adjacent to Kitchen
  r(0, 9, 'Store', m2ft(3.5), m2ft(12.5), m2ft(2.0), m2ft(1.5), 'Teak', '#a8947f'),

  // Bedroom 3: 3.6m × 3.3m (11'-10" × 10'-10") at rear-right
  r(0, 10, 'Bedroom 3', m2ft(5.0), m2ft(10.7), m2ft(3.6), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 3: 1.5m × 2.4m (4'-11" × 7'-10") attached to Bedroom 3
  r(0, 11, 'Toilet 3', m2ft(8.5), m2ft(11.6), m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),


  // =========================================================================
  // FIRST FLOOR PLAN (Scale 1:100) — 10.00m × 14.00m
  // =========================================================================
  // Bedroom 1 (Front Master): 3.6m × 3.3m (11'-10" × 10'-10") at front-left
  r(1, 0, 'Bedroom 1 (Master)', 0, 0, m2ft(3.6), m2ft(3.3), 'Teak', '#bd9c79'),
  // Attached Toilet 1: 1.5m × 2.4m (4'-11" × 7'-10")
  r(1, 1, 'Toilet 1', m2ft(3.6), 0, m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),

  // Front Cantilever Balcony: 3.0m × 1.5m (9'-10" × 4'-11") at front-right (No balcony above)
  r(1, 2, 'Cantilever Balcony (Front)', m2ft(5.2), 0, m2ft(3.0), m2ft(1.5), 'Stone', '#c9bca6', 'outdoor'),

  // Central Staircase Core (Exact same position as Ground Floor)
  r(1, 3, 'Central Staircase', m2ft(4.0), m2ft(6.6), m2ft(2.8), m2ft(3.8), 'Teak', '#9e7047', 'stair'),

  // Family Lounge: 4.0m × 3.8m (13'-1" × 12'-6")
  r(1, 4, 'Family Lounge', 0, m2ft(4.5), m2ft(4.0), m2ft(3.8), 'Marble', '#d8c9ad'),

  // Bedroom 2: 3.6m × 3.3m (11'-10" × 10'-10")
  r(1, 5, 'Bedroom 2', m2ft(5.0), m2ft(3.3), m2ft(3.6), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 2: 1.5m × 2.4m (4'-11" × 7'-10")
  r(1, 6, 'Toilet 2', m2ft(8.5), m2ft(3.3), m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),

  // Rear Cantilever Balcony: 2.4m × 1.5m (7'-10" × 4'-11") at rear-left (No balcony above)
  r(1, 7, 'Cantilever Balcony (Rear)', 0, m2ft(12.5), m2ft(2.4), m2ft(1.5), 'Stone', '#c9bca6', 'outdoor'),

  // Bedroom 3: 4.0m × 3.3m (13'-1" × 10'-10") at rear
  r(1, 8, 'Bedroom 3', m2ft(2.6), m2ft(10.7), m2ft(4.0), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 3: 1.5m × 2.4m (4'-11" × 7'-10") attached to Bedroom 3
  r(1, 9, 'Toilet 3', m2ft(8.5), m2ft(11.6), m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),


  // =========================================================================
  // SECOND FLOOR PLAN (Scale 1:100) — 10.00m × 14.00m
  // =========================================================================
  // Open Terrace: 4.0m × 3.0m (13'-1" × 9'-10") at front
  r(2, 0, 'Open Terrace', 0, 0, m2ft(4.0), m2ft(3.0), 'Stone', '#c9bca6', 'outdoor'),

  // Central Staircase Core (Aligned vertically with Ground & First floors)
  r(2, 1, 'Central Staircase', m2ft(4.0), m2ft(6.6), m2ft(2.8), m2ft(3.8), 'Teak', '#9e7047', 'stair'),

  // Bedroom 2: 3.6m × 3.3m (11'-10" × 10'-10")
  r(2, 2, 'Bedroom 2', m2ft(5.0), m2ft(3.3), m2ft(3.6), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 2: 1.5m × 2.4m (4'-11" × 7'-10")
  r(2, 3, 'Toilet 2', m2ft(8.5), m2ft(3.3), m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),

  // Large Play Area / Multipurpose Hall: 7.0m × 4.0m (23'-0" × 13'-1")
  r(2, 4, 'Play Area / Multipurpose Hall', 0, m2ft(4.0), m2ft(7.0), m2ft(4.0), 'Marble', '#d8c9ad'),

  // Bedroom 3: 4.0m × 3.3m (13'-1" × 10'-10") at rear-left
  r(2, 5, 'Bedroom 3', 0, m2ft(10.7), m2ft(4.0), m2ft(3.3), 'Teak', '#bd9c79'),
  // Toilet 3: 1.5m × 2.4m (4'-11" × 7'-10") attached to Bedroom 3
  r(2, 6, 'Toilet 3', m2ft(4.0), m2ft(11.6), m2ft(1.5), m2ft(2.4), 'Tile', '#88aeb3'),

  // Top Cantilever Balcony: 3.0m × 1.5m (9'-10" × 4'-11") at rear-right (No balcony above)
  r(2, 7, 'Cantilever Balcony (Roof)', m2ft(7.0), m2ft(12.5), m2ft(3.0), m2ft(1.5), 'Stone', '#c9bca6', 'outdoor'),
];

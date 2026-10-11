export type Room = {
  id: string;
  name: string;
  floor: number;
  x: number;
  z: number;
  w: number;
  d: number;
  material: string;
  color: string;
  kind?: 'outdoor' | 'stair' | 'passage';
  bounds?: { x: number; z: number; w: number; d: number };
};

export type ViewMode = 'all' | 'ground' | 'upper' | 'exploded' | `floor-${number}`;

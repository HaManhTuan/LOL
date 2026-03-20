export type Direction = "up" | "down" | "left" | "right" | null;

export interface Tile {
  x: number;
  y: number;
  icon: string | number | null;
  isEmpty: boolean;
}

export interface Board {
  grid: Tile[][];
  width: number;
  height: number;
  paddedWidth: number;
  paddedHeight: number;
}

export interface SelectionState {
  first: Tile | null;
  second: Tile | null;
}

export interface PathNode {
  x: number;
  y: number;
  direction: Direction;
  turns: number;
}

export interface ConnectionPath {
  nodes: Array<{ x: number; y: number }>;
  turns?: number;
}

export interface MatchResult {
  isMatch: boolean;
  path: ConnectionPath;
}

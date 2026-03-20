import type { Board, Direction, MatchResult, Tile } from "../types/game";

type SearchState = {
  x: number;
  y: number;
  direction: Direction;
  turns: number;
  path: Array<{ x: number; y: number }>;
};

const DIRECTIONS: Array<{ dx: number; dy: number; name: Exclude<Direction, null> }> = [
  { dx: 0, dy: -1, name: "up" },
  { dx: 1, dy: 0, name: "right" },
  { dx: 0, dy: 1, name: "down" },
  { dx: -1, dy: 0, name: "left" },
];

function isInside(board: Board, x: number, y: number): boolean {
  return x >= 0 && x < board.paddedWidth && y >= 0 && y < board.paddedHeight;
}

function canStep(board: Board, x: number, y: number, target: Tile): boolean {
  if (!isInside(board, x, y)) return false;
  if (x === target.x && y === target.y) return true;
  return board.grid[y][x].isEmpty;
}

export function findPath(board: Board, tileA: Tile, tileB: Tile): MatchResult {
  if (tileA.isEmpty || tileB.isEmpty || tileA.icon !== tileB.icon) {
    return { isMatch: false, path: { nodes: [] } };
  }
  if (tileA.x === tileB.x && tileA.y === tileB.y) {
    return { isMatch: false, path: { nodes: [] } };
  }

  const queue: SearchState[] = [
    {
      x: tileA.x,
      y: tileA.y,
      direction: null,
      turns: 0,
      path: [{ x: tileA.x, y: tileA.y }],
    },
  ];

  const visited = new Map<string, number>();
  visited.set(`${tileA.x},${tileA.y},start`, 0);

  while (queue.length > 0) {
    const current = queue.shift() as SearchState;

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      if (!canStep(board, nx, ny, tileB)) continue;

      const nextTurns = current.direction === null || current.direction === dir.name
        ? current.turns
        : current.turns + 1;
      if (nextTurns > 2) continue;

      const nextPath = [...current.path, { x: nx, y: ny }];
      if (nx === tileB.x && ny === tileB.y) {
        return { isMatch: true, path: { nodes: nextPath, turns: nextTurns } };
      }

      const key = `${nx},${ny},${dir.name}`;
      const bestTurns = visited.get(key);
      if (bestTurns !== undefined && bestTurns <= nextTurns) continue;

      visited.set(key, nextTurns);
      queue.push({
        x: nx,
        y: ny,
        direction: dir.name,
        turns: nextTurns,
        path: nextPath,
      });
    }
  }

  return { isMatch: false, path: { nodes: [] } };
}

export function isMatch(board: Board, tileA: Tile, tileB: Tile): boolean {
  return findPath(board, tileA, tileB).isMatch;
}

export function usePathFinding() {
  return { findPath, isMatch };
}

import { ref } from "vue";
import type { Board, Tile } from "../types/game";
import { cloneBoard } from "../utils/board-helpers";
import { shuffleArray } from "../utils/rng";
import { championIconIds } from "../utils/champion-icons";
import { isMatch } from "./usePathFinding";

type GameLevel = 1 | 2 | 3 | 4 | 5;

function buildBoard(width: number, height: number, icons: Array<string | number>): Board {
  const pairsCount = (width * height) / 2;
  const iconPool: Array<string | number> = [];
  for (let i = 0; i < pairsCount; i += 1) {
    const icon = icons[i % icons.length];
    iconPool.push(icon, icon);
  }
  const shuffled = shuffleArray(iconPool);

  const paddedWidth = width + 2;
  const paddedHeight = height + 2;
  const grid: Tile[][] = [];

  for (let y = 0; y < paddedHeight; y += 1) {
    const row: Tile[] = [];
    for (let x = 0; x < paddedWidth; x += 1) {
      row.push({ x, y, icon: null, isEmpty: true });
    }
    grid.push(row);
  }

  let idx = 0;
  for (let y = 1; y <= height; y += 1) {
    for (let x = 1; x <= width; x += 1) {
      grid[y][x] = { x, y, icon: shuffled[idx], isEmpty: false };
      idx += 1;
    }
  }
  return { grid, width, height, paddedWidth, paddedHeight };
}

function getPlayableTiles(board: Board): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 1; y <= board.height; y += 1) {
    for (let x = 1; x <= board.width; x += 1) {
      const tile = board.grid[y][x];
      if (!tile.isEmpty) tiles.push(tile);
    }
  }
  return tiles;
}

function hasValidMoveInternal(board: Board): boolean {
  const iconBuckets = new Map<string, Tile[]>();
  for (const tile of getPlayableTiles(board)) {
    const key = String(tile.icon);
    const current = iconBuckets.get(key) ?? [];
    current.push(tile);
    iconBuckets.set(key, current);
  }

  for (const bucket of iconBuckets.values()) {
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        if (isMatch(board, bucket[i], bucket[j])) return true;
      }
    }
  }
  return false;
}

function findHintPairInternal(board: Board): [Tile, Tile] | null {
  const iconBuckets = new Map<string, Tile[]>();
  for (const tile of getPlayableTiles(board)) {
    const key = String(tile.icon);
    const current = iconBuckets.get(key) ?? [];
    current.push(tile);
    iconBuckets.set(key, current);
  }

  for (const bucket of iconBuckets.values()) {
    for (let i = 0; i < bucket.length; i += 1) {
      for (let j = i + 1; j < bucket.length; j += 1) {
        if (isMatch(board, bucket[i], bucket[j])) return [bucket[i], bucket[j]];
      }
    }
  }
  return null;
}

function applyLevelShift(next: Board, level: GameLevel) {
  if (level === 1) return;

  if (level === 2 || level === 3) {
    for (let y = 1; y <= next.height; y += 1) {
      const icons: Array<string | number> = [];
      for (let x = 1; x <= next.width; x += 1) {
        const tile = next.grid[y][x];
        if (!tile.isEmpty && tile.icon !== null) icons.push(tile.icon);
      }

      for (let x = 1; x <= next.width; x += 1) {
        next.grid[y][x] = { ...next.grid[y][x], isEmpty: true, icon: null };
      }

      if (level === 2) {
        for (let i = 0; i < icons.length; i += 1) {
          next.grid[y][1 + i] = { ...next.grid[y][1 + i], isEmpty: false, icon: icons[i] };
        }
      } else {
        for (let i = 0; i < icons.length; i += 1) {
          const x = next.width - i;
          next.grid[y][x] = { ...next.grid[y][x], isEmpty: false, icon: icons[icons.length - 1 - i] };
        }
      }
    }
    return;
  }

  for (let x = 1; x <= next.width; x += 1) {
    const icons: Array<string | number> = [];
    for (let y = 1; y <= next.height; y += 1) {
      const tile = next.grid[y][x];
      if (!tile.isEmpty && tile.icon !== null) icons.push(tile.icon);
    }

    for (let y = 1; y <= next.height; y += 1) {
      next.grid[y][x] = { ...next.grid[y][x], isEmpty: true, icon: null };
    }

    if (level === 4) {
      for (let i = 0; i < icons.length; i += 1) {
        const y = next.height - i;
        next.grid[y][x] = { ...next.grid[y][x], isEmpty: false, icon: icons[icons.length - 1 - i] };
      }
    } else {
      for (let i = 0; i < icons.length; i += 1) {
        const y = 1 + i;
        next.grid[y][x] = { ...next.grid[y][x], isEmpty: false, icon: icons[i] };
      }
    }
  }
}

export function useGameBoard() {
  const defaultIcons = championIconIds.length > 0
    ? championIconIds
    : Array.from({ length: 90 }, (_, i) => String(i + 1));
  const defaultWidth = 10;
  const defaultHeight = 8;
  const board = ref<Board>(buildBoard(10, 8, defaultIcons));

  function initialize(width: number, height: number, icons: Array<string | number>) {
    board.value = buildBoard(width, height, icons);
    shuffleUntilPlayable();
  }

  function removePair(first: Tile, second: Tile, level: GameLevel = 1) {
    const next = cloneBoard(board.value);
    next.grid[first.y][first.x] = { ...next.grid[first.y][first.x], isEmpty: true, icon: null };
    next.grid[second.y][second.x] = { ...next.grid[second.y][second.x], isEmpty: true, icon: null };
    applyLevelShift(next, level);
    board.value = next;
  }

  function shuffleRemaining() {
    const next = cloneBoard(board.value);
    const playable = getPlayableTiles(next);
    const nonEmpty = playable.map((tile) => tile.icon) as Array<string | number>;
    const shuffled = shuffleArray(nonEmpty);
    let idx = 0;
    for (let y = 1; y <= next.height; y += 1) {
      for (let x = 1; x <= next.width; x += 1) {
        const tile = next.grid[y][x];
        if (tile.isEmpty) continue;
        next.grid[y][x] = {
          ...tile,
          icon: shuffled[idx],
        };
        idx += 1;
      }
    }
    board.value = next;
  }

  function hasValidMove() {
    return hasValidMoveInternal(board.value);
  }

  function getHintPair() {
    return findHintPairInternal(board.value);
  }

  function shuffleUntilPlayable(maxRetries = 40) {
    if (getPlayableTiles(board.value).length === 0) return;
    for (let i = 0; i < maxRetries; i += 1) {
      if (hasValidMove()) return;
      shuffleRemaining();
    }
  }

  function restartBoard() {
    initialize(defaultWidth, defaultHeight, defaultIcons);
  }

  initialize(defaultWidth, defaultHeight, defaultIcons);

  return {
    board,
    initialize,
    removePair,
    shuffleRemaining,
    shuffleUntilPlayable,
    hasValidMove,
    getHintPair,
    restartBoard,
  };
}

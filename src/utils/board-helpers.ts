import type { Board, Tile } from "../types/game";

export function cloneBoard(board: Board): Board {
  return {
    width: board.width,
    height: board.height,
    paddedWidth: board.paddedWidth,
    paddedHeight: board.paddedHeight,
    grid: board.grid.map((row) => row.map((tile) => ({ ...tile }))),
  };
}

export function isBoardCleared(board: Board): boolean {
  return board.grid.every((row) => row.every((tile) => tile.isEmpty));
}

export function flattenNonEmpty(board: Board): Tile[] {
  return board.grid.flat().filter((tile) => !tile.isEmpty);
}

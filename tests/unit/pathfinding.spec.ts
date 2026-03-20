import { describe, expect, it } from "vitest";
import { findPath, isMatch } from "../../src/composables/usePathFinding";
import type { Board } from "../../src/types/game";

function emptyPadded(width: number, height: number): Board {
  const paddedWidth = width + 2;
  const paddedHeight = height + 2;
  const grid = Array.from({ length: paddedHeight }, (_, y) =>
    Array.from({ length: paddedWidth }, (_, x) => ({ x, y, icon: null, isEmpty: true })),
  );
  return { width, height, paddedWidth, paddedHeight, grid };
}

function put(board: Board, x: number, y: number, icon: string | number) {
  board.grid[y][x] = { x, y, icon, isEmpty: false };
}

describe("pathfinding", () => {
  it("supports straight path", () => {
    const board = emptyPadded(4, 4);
    put(board, 1, 1, "A");
    put(board, 4, 1, "A");
    expect(isMatch(board, board.grid[1][1], board.grid[1][4])).toBe(true);
  });

  it("supports one-turn path", () => {
    const board = emptyPadded(4, 4);
    put(board, 1, 1, "A");
    put(board, 3, 3, "A");
    expect(isMatch(board, board.grid[1][1], board.grid[3][3])).toBe(true);
  });

  it("supports two-turn path", () => {
    const board = emptyPadded(4, 4);
    put(board, 1, 1, "A");
    put(board, 4, 4, "A");
    put(board, 2, 1, "X");
    put(board, 1, 2, "Y");
    const result = findPath(board, board.grid[1][1], board.grid[4][4]);
    expect(result.isMatch).toBe(true);
    expect((result.path.turns ?? 0) <= 2).toBe(true);
  });

  it("rejects blocked path", () => {
    const board = emptyPadded(5, 5);
    put(board, 1, 1, "A");
    put(board, 3, 3, "A");
    put(board, 2, 3, "B");
    put(board, 4, 3, "C");
    put(board, 3, 2, "D");
    put(board, 3, 4, "E");
    expect(isMatch(board, board.grid[1][1], board.grid[3][3])).toBe(false);
  });

  it("allows border path around blocked cells", () => {
    const board = emptyPadded(4, 4);
    put(board, 1, 1, "A");
    put(board, 1, 4, "A");
    put(board, 1, 2, "B");
    put(board, 1, 3, "C");
    const result = findPath(board, board.grid[1][1], board.grid[4][1]);
    expect(result.isMatch).toBe(true);
    expect(result.path.nodes.length).toBeGreaterThan(2);
  });
});

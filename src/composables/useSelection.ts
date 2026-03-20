import { ref } from "vue";
import type { Board, ConnectionPath, SelectionState, Tile } from "../types/game";
import { findPath } from "./usePathFinding";

export function useSelection(
  onMatch: (first: Tile, second: Tile, path: ConnectionPath) => void,
  onInvalid?: () => void,
) {
  const selection = ref<SelectionState>({ first: null, second: null });

  function reset() {
    selection.value = { first: null, second: null };
  }

  function selectTile(board: Board, tile: Tile) {
    if (tile.isEmpty) return;

    if (!selection.value.first) {
      selection.value.first = tile;
      return;
    }

    if (selection.value.first.x === tile.x && selection.value.first.y === tile.y) {
      selection.value = { first: tile, second: null };
      return;
    }

    selection.value.second = tile;
    const first = selection.value.first;
    const result = findPath(board, first, tile);

    if (result.isMatch) {
      onMatch(first, tile, result.path);
      selection.value = { first: null, second: null };
      return;
    }
    onInvalid?.();
    reset();
  }

  return { selection, selectTile, reset };
}

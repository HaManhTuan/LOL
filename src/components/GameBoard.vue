<script setup lang="ts">
import { computed, ref, watch } from "vue";
import TileButton from "./Tile.vue";
import { useGameBoard } from "../composables/useGameBoard";
import { useSelection } from "../composables/useSelection";
import { useGameSession } from "../composables/useGameSession";
import type { ConnectionPath } from "../types/game";

const props = defineProps<{
  playerName: string;
  level: 1 | 2 | 3 | 4 | 5;
}>();
const emit = defineEmits<{
  levelComplete: [level: 1 | 2 | 3 | 4 | 5];
}>();

const TILE_SIZE = 56;
const TILE_GAP = 8;
const LEVEL_DURATION_SECONDS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 180,
  2: 160,
  3: 160,
  4: 140,
  5: 140,
};

const { board, removePair, shuffleUntilPlayable, hasValidMove, getHintPair, restartBoard } = useGameBoard();
const lastPath = ref<ConnectionPath>({ nodes: [] });
const invalidFlashKey = ref("");
const hintKeys = ref<string[]>([]);

const { selection, selectTile } = useSelection((first, second, path) => {
  lastPath.value = path;
  removePair(first, second, props.level);
  if (!isComplete.value && !hasValidMove()) {
    shuffleUntilPlayable();
  }
  window.setTimeout(() => {
    lastPath.value = { nodes: [] };
  }, 260);
}, () => {
  const first = selection.value.first;
  if (!first) return;
  invalidFlashKey.value = `${first.x}-${first.y}-${Date.now()}`;
  window.setTimeout(() => {
    invalidFlashKey.value = "";
  }, 180);
});

const { isComplete, isTimeUp, isGameOver, formattedTime, isPaused, togglePause, restartTimer } = useGameSession(
  () => board.value,
  LEVEL_DURATION_SECONDS[props.level],
);

watch(isComplete, (done, prev) => {
  if (done && !prev) {
    emit("levelComplete", props.level);
  }
});

const selectedKey = computed(() =>
  selection.value.first ? `${selection.value.first.x}-${selection.value.first.y}` : "",
);

const visibleTiles = computed(() => {
  const rows = [];
  for (let y = 1; y <= board.value.height; y += 1) {
    for (let x = 1; x <= board.value.width; x += 1) {
      rows.push(board.value.grid[y][x]);
    }
  }
  return rows;
});

const pathPoints = computed(() =>
  lastPath.value.nodes.map((n) => ({
    x: (n.x - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
    y: (n.y - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
  })),
);

const pathPolyline = computed(() => pathPoints.value.map((p) => `${p.x},${p.y}`).join(" "));
const borderOffset = TILE_SIZE / 2 + TILE_GAP;
const boardPixelWidth = computed(() => board.value.width * TILE_SIZE + (board.value.width - 1) * TILE_GAP);
const boardPixelHeight = computed(() => board.value.height * TILE_SIZE + (board.value.height - 1) * TILE_GAP);

function onTileClick(tile: (typeof board.value.grid)[number][number]) {
  if (isGameOver.value || isPaused.value) return;
  selectTile(board.value, tile);
}

function onShuffleClick() {
  if (isGameOver.value || isPaused.value) return;
  shuffleUntilPlayable();
}

function onPauseClick() {
  togglePause();
}

function onRestartClick() {
  restartBoard();
  restartTimer();
  selection.value = { first: null, second: null };
  invalidFlashKey.value = "";
  lastPath.value = { nodes: [] };
  hintKeys.value = [];
}

function onHintClick() {
  if (isGameOver.value || isPaused.value) return;
  const pair = getHintPair();
  if (!pair) return;
  hintKeys.value = pair.map((tile) => `${tile.x}-${tile.y}`);
  window.setTimeout(() => {
    hintKeys.value = [];
  }, 900);
}
</script>

<template>
  <section
    class="space-y-5 rounded-2xl border border-indigo-300/20 bg-slate-900/85 p-6 shadow-[0_0_48px_rgba(56,189,248,0.2)] backdrop-blur-sm"
  >
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-['Russo_One'] text-2xl tracking-wide text-cyan-300">Champion Rift Puzzle</h2>
        <p class="text-sm text-slate-300">Match champion portraits with at most 2 turns.</p>
        <p class="text-xs font-semibold uppercase tracking-wider text-amber-300">Summoner: {{ playerName }}</p>
        <p class="text-xs font-semibold uppercase tracking-wider text-indigo-300">Level: {{ level }}</p>
      </div>
      <div class="flex items-center gap-3">
        <p class="min-w-[7.5rem] text-center tabular-nums rounded-md border border-violet-300/30 bg-slate-800 px-3 py-2 text-sm font-semibold text-violet-100">
          Time: {{ formattedTime }}
        </p>
        <button
          class="rounded-md border border-amber-300/40 bg-slate-800 px-4 py-2 text-sm font-medium text-amber-100 transition hover:border-amber-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isGameOver"
          @click="onPauseClick"
        >
          {{ isPaused ? "Resume" : "Pause" }}
        </button>
        <!-- <button
          class="rounded-md border border-cyan-300/40 bg-slate-800 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isGameOver || isPaused"
          @click="onShuffleClick"
        >
          Shuffle Board
        </button> -->
        <!-- <button
          class="rounded-md border border-yellow-300/40 bg-slate-800 px-4 py-2 text-sm font-medium text-yellow-100 transition hover:border-yellow-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isGameOver || isPaused"
          @click="onHintClick"
        >
          Hint
        </button> -->
        <button
          class="rounded-md border border-emerald-300/40 bg-slate-800 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-200 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          @click="onRestartClick"
        >
          Restart
        </button>
      </div>
    </header>

    <div class="flex w-full justify-center">
      <div class="relative inline-block overflow-visible">
        <svg
          v-if="pathPoints.length > 1"
          class="pointer-events-none absolute z-20"
          :style="{ left: `-${borderOffset}px`, top: `-${borderOffset}px` }"
          :width="boardPixelWidth + borderOffset * 2"
          :height="boardPixelHeight + borderOffset * 2"
        >
          <polyline
            :points="pathPolyline"
            fill="none"
            stroke="#22d3ee"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            :transform="`translate(${borderOffset}, ${borderOffset})`"
            class="drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]"
          />
        </svg>

        <div
          class="grid gap-2 rounded-lg border border-slate-700/80 bg-slate-950/70 p-2"
          :style="{ gridTemplateColumns: `repeat(${board.width}, ${TILE_SIZE}px)` }"
        >
        <TileButton
          v-for="tile in visibleTiles"
          :key="`${tile.x}-${tile.y}`"
          :tile="tile"
          :selected="selectedKey === `${tile.x}-${tile.y}`"
          :invalid="invalidFlashKey.startsWith(`${tile.x}-${tile.y}`)"
          :hinted="hintKeys.includes(`${tile.x}-${tile.y}`)"
          @click="onTileClick"
        />
        </div>

        <div
          v-if="isPaused"
          class="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-slate-950/95 backdrop-blur-sm"
        >
          <div class="text-center">
            <p class="font-['Russo_One'] text-3xl tracking-wide text-amber-300">Paused</p>
            <p class="mt-2 text-sm text-slate-300">Board is hidden to prevent cheating.</p>
          </div>
        </div>
      </div>
    </div>

    <p v-if="isComplete" class="font-semibold text-emerald-300">Victory! All champions were matched.</p>
    <p v-else-if="isTimeUp" class="font-semibold text-rose-300">Time up! Try again with faster matching.</p>
  </section>
</template>

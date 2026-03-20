import { computed, onUnmounted, ref } from "vue";
import type { Board } from "../types/game";
import { isBoardCleared } from "../utils/board-helpers";

export function useGameSession(board: () => Board, durationSeconds = 180) {
  const remainingSeconds = ref(durationSeconds);
  const isPaused = ref(false);
  const timerId = window.setInterval(() => {
    if (isPaused.value || remainingSeconds.value <= 0 || isBoardCleared(board())) return;
    remainingSeconds.value -= 1;
  }, 1000);

  onUnmounted(() => {
    window.clearInterval(timerId);
  });

  const isComplete = computed(() => isBoardCleared(board()));
  const isTimeUp = computed(() => remainingSeconds.value <= 0);
  const isGameOver = computed(() => isComplete.value || isTimeUp.value);
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds.value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  });

  function togglePause() {
    if (isGameOver.value) return;
    isPaused.value = !isPaused.value;
  }

  function restartTimer() {
    remainingSeconds.value = durationSeconds;
    isPaused.value = false;
  }

  return { isComplete, isTimeUp, isGameOver, remainingSeconds, formattedTime, isPaused, togglePause, restartTimer };
}

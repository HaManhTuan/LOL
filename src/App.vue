<script setup lang="ts">
import { ref } from "vue";
import GameBoard from "./components/GameBoard.vue";

const nicknameInput = ref("");
const playerName = ref("");
const hasStarted = ref(false);
const currentLevel = ref<1 | 2 | 3 | 4 | 5>(1);
const boardInstanceKey = ref(0);
const isCampaignCompleted = ref(false);

function onStartGame() {
  const name = nicknameInput.value.trim();
  if (!name) return;
  playerName.value = name;
  currentLevel.value = 1;
  isCampaignCompleted.value = false;
  boardInstanceKey.value += 1;
  hasStarted.value = true;
}

function onLevelComplete(level: 1 | 2 | 3 | 4 | 5) {
  if (level >= 5) {
    isCampaignCompleted.value = true;
    return;
  }
  currentLevel.value = (level + 1) as 1 | 2 | 3 | 4 | 5;
  boardInstanceKey.value += 1;
}
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl p-5 sm:p-8">
    <header class="mx-auto w-full max-w-4xl space-y-2 text-center">
      <h1 class="font-['Russo_One'] text-4xl tracking-wide text-cyan-300 sm:text-5xl">LOL Classical</h1>
      <p class="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
        A web-based tile matching challenge inspired by Pikachu Classic, styled with a champion-themed
        neon fantasy interface.
      </p>
    </header>

    <section class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <div v-if="!hasStarted" class="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-slate-900/85 p-6 text-center shadow-[0_0_48px_rgba(56,189,248,0.2)] backdrop-blur-sm">
        <h2 class="font-['Russo_One'] text-2xl tracking-wide text-cyan-300">Enter The Rift</h2>
        <p class="mt-2 text-sm text-slate-300">Enter your nickname to start the match.
        </p>

        <form class="mt-5 space-y-3" @submit.prevent="onStartGame">
          <input
            v-model="nicknameInput"
            type="text"
            maxlength="24"
            placeholder="Nhap nickname..."
            class="w-full rounded-md border border-slate-600 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
          />
          <!-- Tam thoi khoa chon level: choi tuan tu 1 -> 5 -->
          <!--
          <div class="rounded-md border border-indigo-300/30 bg-slate-800 px-3 py-2 text-left text-sm text-indigo-100">
            <label class="mb-1 block font-semibold">Level</label>
            <select
              v-model.number="currentLevel"
              class="w-full rounded bg-slate-900 px-2 py-2 text-indigo-100 outline-none"
            >
              <option :value="1">1 - Normal (03:00)</option>
              <option :value="2">2 - Shift From Right (02:40)</option>
              <option :value="3">3 - Shift From Left (02:40)</option>
              <option :value="4">4 - Shift From Top (02:20)</option>
              <option :value="5">5 - Shift From Bottom (02:20)</option>
            </select>
          </div>
          -->
          <button
            type="submit"
            class="w-full rounded-md border border-cyan-300/40 bg-slate-800 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="nicknameInput.trim().length === 0"
          >
            Start
          </button>
        </form>
      </div>

      <div v-else-if="!isCampaignCompleted" class="mx-auto w-full max-w-fit">
        <GameBoard
          :key="`level-${currentLevel}-${boardInstanceKey}`"
          :player-name="playerName"
          :level="currentLevel"
          @level-complete="onLevelComplete"
        />
      </div>

      <div
        v-else
        class="w-full max-w-md rounded-2xl border border-emerald-300/30 bg-slate-900/85 p-6 text-center shadow-[0_0_48px_rgba(16,185,129,0.2)] backdrop-blur-sm"
      >
        <h2 class="font-['Russo_One'] text-2xl tracking-wide text-emerald-300">Campaign Completed</h2>
        <p class="mt-2 text-sm text-slate-300">
          Chuc mung {{ playerName }}, ban da vuot qua tat ca 5 level.
        </p>
        <button
          class="mt-5 w-full rounded-md border border-emerald-300/40 bg-slate-800 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-slate-700"
          @click="onStartGame"
        >
          Choi lai tu level 1
        </button>
      </div>
    </section>
  </main>
</template>

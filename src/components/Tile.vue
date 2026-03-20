<script setup lang="ts">
import { computed } from "vue";
import type { Tile } from "../types/game";
import { getChampionIconUrl } from "../utils/champion-icons";

const props = defineProps<{
  tile: Tile;
  selected: boolean;
  invalid?: boolean;
  hinted?: boolean;
}>();

const iconSrc = computed(() => getChampionIconUrl(props.tile.icon));

defineEmits<{
  click: [tile: Tile];
}>();
</script>

<template>
  <button
    class="group relative h-14 w-14 overflow-hidden rounded-md border text-lg font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    :class="[
      tile.isEmpty
        ? 'cursor-default border-slate-700/40 bg-slate-800/20 text-transparent'
        : 'cursor-pointer border-sky-400/40 bg-slate-900/90 hover:border-cyan-300/70 hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]',
      selected ? 'ring-2 ring-cyan-300' : '',
      invalid ? 'ring-2 ring-rose-400' : '',
      hinted ? 'ring-2 ring-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.7)]' : ''
    ]"
    :aria-label="tile.isEmpty ? 'Empty tile' : `Champion tile ${tile.icon}`"
    :disabled="tile.isEmpty"
    @click="$emit('click', tile)"
  >
    <img
      v-if="!tile.isEmpty"
      :src="iconSrc"
      :alt="`Champion ${tile.icon}`"
      class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
      loading="lazy"
    />
  </button>
</template>

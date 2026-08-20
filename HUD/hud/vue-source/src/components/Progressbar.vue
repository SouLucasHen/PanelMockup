<script setup>
import { watch } from "vue";
import { useSettingsStore } from "@stores/settings";
import { useProgressbarStore } from "@stores/progressbar";

const settings = useSettingsStore();
const progress = useProgressbarStore();

let interval = null;

watch(
  () => progress.percentage,
  (value) => {
    if (value === 0) {
      clearInterval(interval);
      interval = setInterval(() => {
        if (progress.percentage > 100) {
          clearInterval(interval);
          interval = null;
          return;
        }
        progress.percentage++;
      }, progress.timeout / 100);
    }
  },
);
</script>

<template>
  <transition name="fade">
    <div v-if="progress.percentage <= 100">
      <div
        class="flex flex-col items-center text-center w-52 mb-3"
        :style="{ color: `rgb(${settings.theme.progress.letter})` }"
      >
        <p class="text-sm leading-4 font-light">{{ progress.title }}</p>
        <p class="leading-4 font-extrabold">{{ progress.description }}</p>
      </div>
      <div
        class="w-52 h-1 overflow-hidden relative flex items-center justify-center"
        :style="{ backgroundColor: `rgb(${settings.theme.progress.background} / 0.4)` }"
      >
        <div
          class="h-full bg-white transition-all duration-75 ease-linear"
          :style="{
            width: progress.percentage + '%',
            backgroundColor: `rgb(${settings.theme.progress.circle})`,
          }"
        />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

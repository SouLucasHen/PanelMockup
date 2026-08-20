<script setup>
import { useInfoStore } from "@stores/info";
import SafezoneIcon from "@icons/Safezone.vue";

const info = useInfoStore();
</script>

<template>
  <transition name="fade">
    <div
      v-if="info.safezone"
      class="flex flex-col items-center gap-1 text-center text-white/50 w-52"
    >
      <SafezoneIcon class="w-7 h-7" />
      <p class="font-semibold text-xl">Safezone</p>
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

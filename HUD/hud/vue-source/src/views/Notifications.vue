<script setup>
import { useInfoStore } from "@stores/info";
import Warning from "@icons/Warning.vue";

const info = useInfoStore();
</script>

<template>
  <transition-group
    name="slide"
    tag="div"
    class="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-6"
  >
    <div
      v-if="info.robberies.display"
      key="robberies"
      class="w-56 flex items-center gap-4 py-3 px-4 bg-gray-light/90 bg-gradient-to-r from-[#D70F3F]/50 to-[#D70F3F]/0 rounded-t-lg"
    >
      <Warning class="w-4 h-4" />
      <div>
        <h2 class="font-extrabold text-sm leading-5">Assaltos Liberados</h2>
        <p class="font-light leading-4 text-sm">Local: {{ info.robberies.location }}</p>
      </div>
    </div>
  </transition-group>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active,
.slide-move {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translate(-100%);
}
.slide-leave-active {
  position: absolute;
}
</style>

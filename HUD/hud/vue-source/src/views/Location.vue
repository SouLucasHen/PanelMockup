<script setup>
import { useInfoStore } from "@stores/info";
import { useVehicleStore } from "@stores/vehicle";
import LocationIcon from "@icons/Location.vue";
import SafezoneIcon from "@icons/Safezone.vue";

const info = useInfoStore();
const vehicle = useVehicleStore();
</script>

<template>
  <div
    class="absolute flex flex-col gap-3 transition-all"
    :style="{ left: '55px', bottom: (vehicle.display ? 265 : 55) + 'px' }"
  >
    <transition name="fade">
      <div
        v-if="info.safezone"
        class="flex items-stretch gap-3 drop-shadow-light"
      >
        <div class="flex items-center justify-center">
          <SafezoneIcon class="w-6 h-6" />
        </div>
        <div class="text-sm leading-[1.125rem]">
          <p class="font-bold whitespace-nowrap">Safezone</p>
          <p class="whitespace-nowrap text-white/75">{{ info.safezoneName }}</p>
        </div>
      </div>
    </transition>
    <div class="flex items-stretch gap-3 drop-shadow-light">
      <div class="flex items-center justify-center">
        <LocationIcon class="w-6 h-6" />
      </div>
      <div class="text-sm leading-[1.125rem]">
        <p class="font-bold whitespace-nowrap">{{ info.location.top }}</p>
        <p class="whitespace-nowrap text-white/75">{{ info.location.bottom }}</p>
      </div>
    </div>
  </div>
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

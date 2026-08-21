<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@stores/settings";
import { useVehicleStore } from "@stores/vehicle";
import Status from "@components/Status.vue";
import SpeedometerTicks from "@icons/Speedometer.vue";
import Pointer from "@icons/Pointer.vue";
import Fuel from "@icons/Fuel.vue";
import Stress from "@icons/Stress.vue";
import Seatbelt from "@icons/Seatbelt.vue";
import Doors from "@icons/Doors.vue";
import Engine from "@icons/Engine.vue";

const settings = useSettingsStore();
const vehicle = useVehicleStore();

const speedPad = computed(() =>
  vehicle.speed >= 100 ? "" : vehicle.speed >= 10 ? "0" : "00",
);

const rpmFill = computed(() => {
  const value = (vehicle.rpm / 10) * 100 * 10;
  return value > 100 ? 75 : value < 0 ? 0 : 0.75 * value;
});

const pointerRotation = computed(() => {
  const value = (vehicle.rpm / 10) * 100 * 10;
  return value > 100 ? 135 : value < 0 ? -135 : 2.7 * value - 135;
});

const rpmCircumference = 2 * Math.PI * 90;

const fuelFill = computed(() =>
  vehicle.fuel > 100
    ? 100 * 0.275 * 0.75
    : vehicle.fuel < 0
      ? 0
      : 0.275 * vehicle.fuel * 0.75,
);

const fuelCircumference = 2 * Math.PI * 110;

const nitroFill = computed(() =>
  vehicle.nitro > 2000 ? 100 : vehicle.nitro < 0 ? 0 : 0.05 * vehicle.nitro,
);

const nitroCircumference = 2 * Math.PI * 105;

const nosPath =
  "m247.76,34.23c-2.96,0-5.55,1.57-7,3.91v-3.88c0-1.11-.9-2.01-2.01-2.01h-.76v-4.38h3.88v-6.4h-4.32v-3.54h-5.36v3.54h-4.32v6.4h3.88v4.38h-.76c-1.11,0-2.01.9-2.01,2.01v3.76h-5.41v-7.14c0-1.42-1.15-2.58-2.58-2.58h-11.94v-8.4c0-1.88-1.52-3.4-3.4-3.4h-10.07C187.86,6.47,175.74,0,162.11,0H22.3C9.99,0,0,9.99,0,22.3v39.82c0,12.32,9.99,22.3,22.3,22.3h139.8c13.63,0,25.75-6.47,33.47-16.5h10.07c1.88,0,3.4-1.52,3.4-3.4v-7.89h11.94c1.42,0,2.58-1.15,2.58-2.58v-7.14h5.41v3.76c0,1.11.9,2.01,2.01,2.01h.76v4.38h-3.88v6.4h4.32v2.96h5.36v-2.96h4.32v-6.4h-3.88v-4.38h.76c1.11,0,2.01-.9,2.01-2.01v-3.88c1.45,2.34,4.04,3.91,7,3.91,4.55,0,8.24-3.69,8.24-8.24s-3.69-8.24-8.24-8.24Zm-120.31,5.99l-25.83,30.99,2.9-23.2h-21.14c-1.58,0-2.37,0-2.77-.32-.35-.28-.55-.7-.54-1.15,0-.51.51-1.12,1.52-2.33l25.83-30.99-2.9,23.2h21.14c1.58,0,2.37,0,2.77.32.35.28.55.7.54,1.15,0,.51-.51,1.12-1.52,2.33Z";
</script>

<template>
  <transition-group
    name="slide"
    tag="div"
    class="absolute bottom-10 right-10 flex flex-col items-end gap-4"
  >
    <div v-if="vehicle.display" key="vehicle" class="relative -mb-6 -mr-4">
      <svg
        class="w-60 h-60 relative overflow-visible"
        viewBox="0 0 220 220"
        style="transform: rotate(135deg)"
      >
        <circle
          class="stroke-gray-light/80"
          r="90"
          cx="110"
          cy="110"
          fill="transparent"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="`${rpmCircumference}px`"
          :stroke-dashoffset="`${0.25 * rpmCircumference}px`"
        />
        <circle
          class="stroke-white transition-all"
          r="90"
          cx="110"
          cy="110"
          fill="transparent"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="`${rpmCircumference}px`"
          :stroke-dashoffset="`${rpmCircumference * ((100 - rpmFill) / 100)}px`"
          :style="{ stroke: `rgb(${settings.theme.rpm})` }"
        />
        <circle
          class="stroke-gray-light/80"
          r="110"
          cx="110"
          cy="110"
          fill="transparent"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="`${fuelCircumference}px`"
          :stroke-dashoffset="`${0.79375 * fuelCircumference}px`"
        />
        <circle
          class="transition-all"
          r="110"
          cx="110"
          cy="110"
          fill="transparent"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="`${fuelCircumference}px`"
          :stroke-dashoffset="`${fuelCircumference * ((100 - fuelFill) / 100)}px`"
          :style="{ stroke: `rgb(${vehicle.isElectric ? settings.theme.electricFuel : settings.theme.fuel})` }"
        />
      </svg>
      <svg
        class="w-45 h-45 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 rotate-[143deg] -scale-100"
        viewBox="0 0 220 220"
      >
        <circle
          class="stroke-white/60"
          r="105"
          cx="110"
          cy="110"
          fill="transparent"
          stroke-width="6"
          :stroke-dasharray="`${nitroCircumference}px`"
          :stroke-dashoffset="`${0.77125 * nitroCircumference}px`"
        />
      </svg>
      <SpeedometerTicks
        class="w-44 h-44 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
      />
      <svg
        viewBox="0 0 256 84.42"
        class="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-12"
      >
        <defs>
          <clipPath id="clippath">
            <rect fill="none" :width="nitroFill + '%'" height="100%" />
          </clipPath>
        </defs>
        <path fill="#ffffff80" :d="nosPath" />
        <path
          clip-path="url(#clippath)"
          :d="nosPath"
          :style="{ fill: `rgb(${settings.theme.nitro})` }"
        />
      </svg>
      <component
        :is="vehicle.isElectric ? Stress : Fuel"
        class="absolute left-12 bottom-5 w-3.5 h-3.5"
        :class="{
          'text-white': fuelFill > 0,
          'text-gray-light/80 drop-shadow-stats-vehicle-off': fuelFill <= 0,
        }"
      />
      <Pointer
        class="absolute top-10 left-1/2 origin-bottom h-20 transition-transform"
        :style="{
          transform: `translate(-50%, 0) rotate(${pointerRotation}deg)`,
          color: `rgb(${settings.theme.pointer})`,
        }"
      />
      <div class="absolute left-1/2 -translate-x-1/2 top-[38%] text-center">
        <p class="text-5xl font-semibold">
          <span class="text-white/50">{{ speedPad }}</span>
          <span>{{ vehicle.speed }}</span>
        </p>
        <p class="opacity-50 text-xs -mt-1">KM/H</p>
      </div>
      <p class="absolute text-sm" style="top: 66.5%; left: 27.5%">0</p>
      <p class="absolute text-sm" style="top: 55%; left: 21%">1</p>
      <p class="absolute text-sm" style="top: 40.5%; left: 19%">2</p>
      <p class="absolute text-sm" style="top: 27.5%; left: 24.5%">3</p>
      <p class="absolute text-sm" style="top: 19%; left: 34.5%">4</p>
      <p class="absolute text-sm" style="top: 15.75%; left: 48.5%">5</p>
      <p class="absolute text-sm" style="top: 19%; right: 34.5%">6</p>
      <p class="absolute text-sm" style="top: 27.5%; right: 24.5%">7</p>
      <p class="absolute text-sm" style="top: 40.5%; right: 19%">8</p>
      <p class="absolute text-sm" style="top: 55%; right: 20.5%">9</p>
      <p class="absolute text-sm" style="top: 66%; right: 27%">10</p>
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3"
      >
        <Seatbelt
          class="w-3 h-5"
          :class="{
            'text-gray-light/80 drop-shadow-stats-vehicle-off': !vehicle.seatbelt,
            'text-white drop-shadow-stats-vehicle-on': vehicle.seatbelt,
          }"
        />
        <Doors
          class="w-4 h-4"
          :class="{
            'text-gray-light/80 drop-shadow-stats-vehicle-off': !vehicle.doors,
            'text-white drop-shadow-stats-vehicle-on': vehicle.doors,
          }"
        />
        <Engine
          class="w-4 h-4"
          :class="{
            'text-gray-light/80 drop-shadow-stats-vehicle-off': vehicle.engine > 300,
            'text-white drop-shadow-stats-vehicle-on': vehicle.engine <= 300,
          }"
        />
      </div>
    </div>
    <Status key="status" />
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
  transform: translate(100%);
}
.slide-leave-active {
  position: absolute;
}
</style>

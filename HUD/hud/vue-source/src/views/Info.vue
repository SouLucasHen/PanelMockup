<script setup>
import { useInfoStore } from "@stores/info";
import { useSettingsStore } from "@stores/settings";
import RegionIcon from "@icons/Region.vue";
import ClockIcon from "@icons/Clock.vue";
import GemstoneIcon from "@icons/Gemstone.vue";
import PassportIcon from "@icons/Passport.vue";
import MicrophoneIcon from "@icons/Microphone.vue";
import RadioIcon from "@icons/Radio.vue";
import StarIcon from "@icons/Star.vue";
import AmmoIcon from "@icons/Ammo.vue";
import { computed } from "vue";

const info = useInfoStore();
const settings = useSettingsStore();

const ammoPrefix = computed(() =>
  info.weapon.ammo.current >= 100 ? "" : info.weapon.ammo.current >= 10 ? "0" : "00"
);

const gemstoneFormatted = computed(() =>
  Number(info.gemstone).toLocaleString("pt-BR")
);
</script>

<template>
  <div class="absolute top-10 right-10 flex flex-col items-end gap-3">
    <!-- Info items row: Region, Clock, Gemstone, Passport -->
    <div class="flex items-center justify-end gap-2 drop-shadow-light">
      <div class="flex items-stretch rounded-md overflow-hidden">
        <div class="bg-white/30 flex items-center justify-center px-2">
          <RegionIcon class="w-3.5 h-3.5 shrink-0" />
        </div>
        <div class="bg-white/15 flex items-center justify-center py-1.5 px-2">
          <span class="font-semibold text-xs uppercase">{{ info.region }}</span>
        </div>
      </div>
      <div class="flex items-stretch rounded-md overflow-hidden">
        <div class="bg-white/30 flex items-center justify-center px-2">
          <ClockIcon class="w-3.5 h-3.5 shrink-0" />
        </div>
        <div class="bg-white/15 flex items-center justify-center py-1.5 px-2">
          <span class="font-semibold text-xs"
            >{{ info.clock[0] < 10 ? "0" : "" }}{{ info.clock[0] }}:{{
              info.clock[1] < 10 ? "0" : ""
            }}{{ info.clock[1] }}</span
          >
        </div>
      </div>
      <div class="flex items-stretch rounded-md overflow-hidden">
        <div class="bg-white/30 flex items-center justify-center px-2">
          <GemstoneIcon class="w-3.5 h-3.5 shrink-0" />
        </div>
        <div class="bg-white/15 flex items-center justify-center py-1.5 px-2">
          <span class="font-semibold text-xs">{{ gemstoneFormatted }}</span>
        </div>
      </div>
      <div class="flex items-stretch rounded-md overflow-hidden">
        <div class="bg-white/30 flex items-center justify-center px-2">
          <PassportIcon class="w-3.5 h-3.5 shrink-0" />
        </div>
        <div class="bg-white/15 flex items-center justify-center py-1.5 px-2">
          <span class="font-semibold text-xs">{{ info.id }}</span>
        </div>
      </div>
    </div>

    <!-- Voice and Radio row -->
    <div class="flex items-center justify-end gap-2 drop-shadow-light">
      <div class="flex items-stretch rounded-md overflow-hidden">
        <div
          :class="[
            'flex items-center justify-center px-2',
            info.voice.isTalking ? 'voice-pulse' : 'bg-white/30',
          ]"
          :style="
            info.voice.isTalking
              ? { '--voice-color': `rgb(${settings.theme.main})` }
              : {}
          "
        >
          <MicrophoneIcon class="w-3.5 h-3.5 shrink-0" />
        </div>
        <div class="bg-white/15 flex items-center justify-center py-1.5 px-2">
          <span class="font-semibold text-xs uppercase">{{
            info.voice.distance
          }}</span>
        </div>
      </div>
      <div v-if="info.radio !== 'Offline'" class="flex items-stretch rounded-md overflow-hidden">
        <div class="bg-white/30 flex items-center justify-center px-2">
          <RadioIcon class="w-3.5 h-3.5 shrink-0" />
        </div>
        <div class="bg-white/15 flex items-center justify-center py-1.5 px-2">
          <span class="font-semibold text-xs uppercase">{{ info.radio }}</span>
        </div>
      </div>
    </div>

    <!-- Wanted stars -->
    <div
      v-if="settings.theme.wanted || info.wantedLevel > 0"
      class="flex items-center justify-end gap-2 w-72"
    >
      <StarIcon
        v-show="settings.theme.wanted || info.wantedLevel >= 5"
        :class="[
          'w-6 h-6',
          info.wantedLevel >= 5
            ? 'wanted-star-active'
            : 'text-white/15',
        ]"
        :style="
          info.wantedLevel >= 5
            ? { color: `rgb(${settings.theme.wantedColor})` }
            : {}
        "
      />
      <StarIcon
        v-show="settings.theme.wanted || info.wantedLevel >= 4"
        :class="[
          'w-6 h-6',
          info.wantedLevel >= 4
            ? 'wanted-star-active'
            : 'text-white/15',
        ]"
        :style="
          info.wantedLevel >= 4
            ? { color: `rgb(${settings.theme.wantedColor})` }
            : {}
        "
      />
      <StarIcon
        v-show="settings.theme.wanted || info.wantedLevel >= 3"
        :class="[
          'w-6 h-6',
          info.wantedLevel >= 3
            ? 'wanted-star-active'
            : 'text-white/15',
        ]"
        :style="
          info.wantedLevel >= 3
            ? { color: `rgb(${settings.theme.wantedColor})` }
            : {}
        "
      />
      <StarIcon
        v-show="settings.theme.wanted || info.wantedLevel >= 2"
        :class="[
          'w-6 h-6',
          info.wantedLevel >= 2
            ? 'wanted-star-active'
            : 'text-white/15',
        ]"
        :style="
          info.wantedLevel >= 2
            ? { color: `rgb(${settings.theme.wantedColor})` }
            : {}
        "
      />
      <StarIcon
        v-show="settings.theme.wanted || info.wantedLevel >= 1"
        :class="[
          'w-6 h-6',
          info.wantedLevel >= 1
            ? 'wanted-star-active'
            : 'text-white/15',
        ]"
        :style="
          info.wantedLevel >= 1
            ? { color: `rgb(${settings.theme.wantedColor})` }
            : {}
        "
      />
      <StarIcon
        v-show="settings.theme.wanted || info.wantedLevel > 0"
        :class="[
          'w-6 h-6',
          info.wantedLevel > 0
            ? 'wanted-star-active'
            : 'text-white/15',
        ]"
        :style="
          info.wantedLevel > 0
            ? { color: `rgb(${settings.theme.wantedColor})` }
            : {}
        "
      />
    </div>

    <!-- Weapon -->
    <Transition name="fade">
      <div
        v-if="info.weapon.display"
        class="flex flex-col items-end w-72 min-w-72 max-w-72 text-right"
      >
        <p class="text-sm font-light">{{ info.weapon.name }}</p>
        <p class="text-5xl mt-1 font-extrabold">
          <span class="text-white/50">{{ ammoPrefix }}</span
          ><span>{{ info.weapon.ammo.current }}</span>
        </p>
        <div
          class="text-sm font-light flex items-center justify-end gap-1 border-t border-white/40 pt-2"
        >
          {{ info.weapon.ammo.stored }}
          <AmmoIcon class="w-3 h-3" />
        </div>
      </div>
    </Transition>
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
}.voice-pulse {
  animation: voice-blink 1s ease-in-out infinite;
  background-color: var(--voice-color);
}

.wanted-star-active {
  animation: wanted-pulse 1.5s ease-in-out infinite;
}

@keyframes voice-blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@keyframes wanted-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

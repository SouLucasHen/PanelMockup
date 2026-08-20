<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@stores/settings";

const props = defineProps(["icon", "color", "percentage", "big"]);
const settings = useSettingsStore();

const circumference = 2 * Math.PI * 19;

const clamped = computed(() =>
  props.percentage > 100 ? 100 : props.percentage < 0 ? 0 : props.percentage,
);

// Escurece a cor do status para usar como fundo do círculo.
// Pega os valores R G B (formato "R G B"), reduz para 25% do original
// e aplica com 55% de opacidade — compatível com qualquer versão do CEF.
const bgFill = computed(() => {
  const [r, g, b] = (props.color || "255 255 255")
    .split(" ")
    .map((v) => Math.round(Number(v) * 0.45));
  return `rgba(${r}, ${g}, ${b}, 0.75)`;
});
</script>

<template>
  <div class="relative" :class="{ 'mb-6': settings.theme.percentage }">
    <svg class="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
      <circle r="16" cx="20" cy="20" :fill="bgFill" />
      <circle r="19" cx="20" cy="20" fill="transparent" stroke-width="2" class="stroke-gray-light/60" />
      <circle
        r="19"
        cx="20"
        cy="20"
        fill="transparent"
        :stroke="`rgb(${color})`"
        stroke-width="2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference * ((100 - clamped) / 100)"
        class="transition-all"
      />
    </svg>
    <component
      :is="icon"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4"
      :style="{ color: `rgb(${color})` }"
    />
    <p
      v-if="settings.theme.percentage"
      class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold"
    >
      {{ Math.floor(clamped) }}%
    </p>
  </div>
</template>

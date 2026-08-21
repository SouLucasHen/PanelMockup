<script setup>
import { useSettingsStore } from "@stores/settings";
import { useInfoStore } from "@stores/info";
import Circle from "@components/Circle.vue";
import Health from "@icons/Health.vue";
import Armor from "@icons/Armor.vue";
import Hunger from "@icons/Hunger.vue";
import Thirst from "@icons/Thirst.vue";
import Stress from "@icons/Stress.vue";
import Luck from "@icons/Luck.vue";
import Dexterity from "@icons/Dexterity.vue";
import Repose from "@icons/Repose.vue";
import Illness from "@icons/Illness.vue";

const settings = useSettingsStore();
const info = useInfoStore();
</script>

<template>
  <div class="mt-4 flex items-center gap-3">
    <Circle
      v-if="info.illness > 0"
      :icon="Illness"
      :color="settings.theme.illness"
      :percentage="info.illness"
    />
    <Circle :icon="Health" :color="settings.theme.health" :percentage="info.health" />
    <Circle
      v-if="info.armor > 0"
      :icon="Armor"
      :color="settings.theme.armor"
      :percentage="info.armor"
    />
    <Circle :icon="Hunger" :color="settings.theme.hunger" :percentage="info.hunger" />
    <Circle :icon="Thirst" :color="settings.theme.thirst" :percentage="info.thirst" />
    <Circle
      v-if="info.stress > 0"
      :icon="Stress"
      :color="settings.theme.stress"
      :percentage="info.stress"
    />
    <Circle
      v-if="info.luckPercentage > 0"
      :icon="Luck"
      :color="settings.theme.luck"
      :percentage="info.luckPercentage"
    />
    <Circle
      v-if="info.dexterityPercentage > 0"
      :icon="Dexterity"
      :color="settings.theme.dexterity"
      :percentage="info.dexterityPercentage"
    />
    <Circle
      v-if="info.reposePercentage > 0"
      :icon="Repose"
      :color="settings.theme.repose"
      :percentage="info.reposePercentage"
    />
  </div>
</template>

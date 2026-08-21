<script setup>
import { onMounted } from "vue";
import { useSettingsStore } from "@stores/settings";
import { useInfoStore } from "@stores/info";
import { useProgressbarStore } from "@stores/progressbar";
import { useVehicleStore } from "@stores/vehicle";
import loadTheme from "@utils/loadTheme";

import Logo from "./views/Logo.vue";
import Center from "./views/Center.vue";
import Notifications from "./views/Notifications.vue";
import Location from "./views/Location.vue";
import Info from "./views/Info.vue";
import Vehicle from "./views/Vehicle.vue";

const settings = useSettingsStore();

onMounted(() => {
  loadTheme();

  const info = useInfoStore();
  const progressbar = useProgressbarStore();
  const settingsStore = useSettingsStore();
  const vehicle = useVehicleStore();

  window.addEventListener("message", (event) => {
    const actionName = event.data.name || event.data.Action;
    const payload = event.data.payload || event.data.Payload;
    switch (actionName) {
      case "Body":
        settingsStore.display = payload;
        break;
      case "Health":
        info.health = payload;
        break;
      case "Armour":
        info.armor = payload;
        break;
      case "Road":
        info.location.top = payload;
        break;
      case "Crossing":
        info.location.bottom = payload;
        break;
      case "Clock":
        info.clock = payload;
        break;
      case "Luck":
        info.luck = payload;
        break;
      case "Dexterity":
        info.dexterity = payload;
        break;
      case "Wanted":
        info.wanted = payload;
        break;
      case "Repose":
        info.repose = payload;
        break;
      case "Hunger":
        info.hunger = payload;
        break;
      case "Thirst":
        info.thirst = payload;
        break;
      case "Stress":
        info.stress = payload;
        break;
      case "Illness":
        info.illness = payload;
        break;
      case "Passport":
        info.id = payload;
        break;
      case "Safezone":
        if (Array.isArray(payload)) {
          info.safezone = payload[0];
          info.safezoneName = payload[1];
        } else {
          info.safezone = !!payload;
          info.safezoneName = "";
        }
        break;
      case "Voip":
        info.voice.distance = payload;
        break;
      case "Voice":
        info.voice.isTalking = payload;
        break;
      case "Progress": {
        const [title, description, timeout] = payload;
        progressbar.percentage = 0;
        progressbar.title = title;
        progressbar.description = description;
        progressbar.timeout = timeout;
        break;
      }
      case "Gemstone":
        info.gemstone = payload;
        break;
      case "Frequency":
        info.radio = payload;
        break;
      case "Vehicle":
        vehicle.display = payload;
        break;
      case "EngineHealth":
        vehicle.engine = payload;
        break;
      case "Locked":
        vehicle.doors = payload === 2;
        break;
      case "Nitro":
        vehicle.nitro = payload;
        break;
      case "Fuel":
        vehicle.fuel = payload;
        break;
      case "Speed":
        vehicle.speed = payload;
        break;
      case "Rpm":
        vehicle.rpm = payload;
        break;
      case "Seatbelt":
        vehicle.seatbelt = payload;
        break;
      case "IsElectric":
        vehicle.isElectric = payload;
        break;
      case "Weapons":
        if (typeof payload === "object") {
          const [display, current, stored, weaponName] = payload;
          info.weapon.display = display;
          info.weapon.name = weaponName;
          info.weapon.ammo.current = current;
          info.weapon.ammo.stored = stored;
        } else info.weapon.display = payload;
        break;
      case "Region":
        info.region = payload;
        break;
      case "Robberies":
        if (typeof payload === "object") {
          const [display, location] = payload;
          info.robberies.display = display;
          info.robberies.location = location;
        } else info.robberies.display = payload;
        break;
    }
  });
});
</script>

<template>
  <div v-show="settings.display" class="flex items-center justify-center h-full">
    <Logo />
    <Center />
    <Notifications />
    <Location />
    <Info />
    <Vehicle />
  </div>
</template>

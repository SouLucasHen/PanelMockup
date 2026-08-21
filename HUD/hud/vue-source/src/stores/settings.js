import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    display: false,
    theme: {
      main: "191 148 255",
      percentage: true,
      icons: "255 255 255",
      pointer: "255 255 255",
      nitro: "255 255 255",
      rpm: "255 255 255",
      fuel: "255 255 255",
      electricFuel: "255 165 0",
      health: "97 255 141",
      armor: "104 165 255",
      hunger: "255 195 126",
      thirst: "165 219 255",
      stress: "255 250 132",
      luck: "109 255 255",
      dexterity: "83 100 255",
      repose: "28 165 255",
      illness: "255 94 94",
      wanted: true,
      wantedColor: "245 166 35",
      progress: {
        background: "255 255 255",
        circle: "255 255 255",
        letter: "255 255 255",
      },
    },
  }),
  actions: {},
});

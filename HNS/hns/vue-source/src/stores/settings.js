import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    display: false,
    activeTab: "inicio",
    theme: {
      main: "102 173 67",
      mainText: "255 255 255",
      mainHover: "77 130 50",
    },
  }),
  actions: {},
});

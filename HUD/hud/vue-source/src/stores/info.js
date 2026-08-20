import { defineStore } from "pinia";

export const useInfoStore = defineStore("info", {
  state: () => ({
    voice: { distance: "Normal", isTalking: false },
    radio: "Offline",
    clock: "00:00",
    id: 0,
    gemstone: 0,
    region: "Sul",
    wanted: [],
    safezone: false,
    safezoneName: "",
    weapon: {
      display: false,
      name: "",
      ammo: { current: 0, stored: 0 },
    },
    robberies: { display: false, location: "" },
    location: { top: "", bottom: "" },
    health: 0,
    armor: 0,
    hunger: 0,
    thirst: 0,
    stress: 0,
    luck: 0,
    dexterity: 0,
    repose: [],
    illness: 0,
  }),
  getters: {
    wantedLevel() {
      return this.wanted.length > 0 && this.wanted[0] > 0
        ? (this.wanted[0] / this.wanted[1]) * 100 * 0.06
        : 0;
    },
    reposePercentage() {
      return this.repose.length > 0 && this.repose[0] > 0
        ? (this.repose[0] / this.repose[1]) * 100
        : 0;
    },
    luckPercentage() {
      return this.luck > 3600
        ? 100
        : this.luck < 0
          ? 0
          : this.luck * (100 / 3600);
    },
    dexterityPercentage() {
      return this.dexterity > 3600
        ? 100
        : this.dexterity < 0
          ? 0
          : this.dexterity * (100 / 3600);
    },
  },
});

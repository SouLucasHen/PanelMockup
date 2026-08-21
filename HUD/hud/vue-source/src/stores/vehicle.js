import { defineStore } from "pinia";

export const useVehicleStore = defineStore("vehicle", {
  state: () => ({
    display: false,
    speed: 0,
    rpm: 0,
    fuel: 0,
    nitro: 0,
    seatbelt: false,
    lights: false,
    doors: false,
    engine: 1000,
    isElectric: false,
  }),
  actions: {},
});

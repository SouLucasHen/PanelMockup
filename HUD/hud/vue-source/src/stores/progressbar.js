import { defineStore } from "pinia";

export const useProgressbarStore = defineStore("progressbar", {
  state: () => ({
    percentage: 101,
    title: "",
    description: "",
    timeout: 5000,
  }),
  actions: {},
});

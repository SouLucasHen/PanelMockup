import { defineStore } from "pinia";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    playerName: "Jogador",
    avatar: "",
  }),
  actions: {},
});

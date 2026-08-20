import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    display: false,
    // Símbolo da moeda vindo de Theme.currency (vrp/config/Global.lua).
    // "$" é o fallback para dev no navegador ou tema antigo sem currency.
    currency: "$",
    // Quantidade de gemas do jogador (enviada via postMessage "Gemstone")
    gemstone: 0,
  }),
});

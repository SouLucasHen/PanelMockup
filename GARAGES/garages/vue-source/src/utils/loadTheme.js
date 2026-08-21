import fetchNui from "./fetchNui";
import setTheme from "./setTheme";

/**
 * Busca o tema no resource "vrp" (NUI "Theme") e aplica no painel via
 * setTheme — mesmo padrão da HUD. Usa a cor principal (response.main) e as
 * cores dos botões da garagem (response.garage, de vrp/config/Global.lua).
 * Sem resposta, os defaults do CSS permanecem.
 */
export default async function loadTheme() {
  const response = await fetchNui("Theme");
  if (!response || !response.main) return;
  setTheme(response.main, response.garage);
  // Retorna o tema para o consumidor (ex.: Theme.garage.scribble no App.vue)
  return response;
}

import fetchNui from "./fetchNui";
import setTheme from "./setTheme";

/**
 * Busca o tema no resource "vrp" (NUI "Theme") e aplica a cor principal
 * (response.main) no painel via setTheme — mesmo padrão da HUD.
 * Sem resposta, os defaults do CSS permanecem.
 */
export default async function loadTheme() {
  const response = await fetchNui("Theme");
  if (!response || !response.main) return;
  setTheme(response.main);
}

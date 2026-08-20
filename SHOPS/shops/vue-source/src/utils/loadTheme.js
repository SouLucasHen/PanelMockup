import fetchNui from "./fetchNui";
import setTheme from "./setTheme";

/**
 * Busca o tema no resource "vrp" (NUI "Theme") e aplica no painel via
 * setTheme — mesmo padrão da HUD. Usa a cor principal (response.main) e as
 * cores da loja (response.shop, de vrp/config/Global.lua).
 * Sem resposta, os defaults do CSS permanecem.
 *
 * Também extrai o símbolo da moeda (response.currency) para que a interface
 * use o mesmo símbolo configurado em vrp/config/Global.lua (Currency = "$"
 * por padrão). O consumidor (App.vue) salva no settings.store.currency.
 */
export default async function loadTheme() {
  const response = await fetchNui("Theme");
  if (!response || !response.main) return;
  // Cores de raridade do Theme (vrp/config/Global.lua): common/rare/epic/
  // legendary/mythic — usadas no fundo dos cards por raridade.
  setTheme(response.main, response.shop, {
    common: response.common,
    rare: response.rare,
    epic: response.epic,
    legendary: response.legendary,
    mythic: response.mythic,
  });
  // Retorna o tema para o consumidor (ex.: Theme.shop.scribble no App.vue)
  return response;
}

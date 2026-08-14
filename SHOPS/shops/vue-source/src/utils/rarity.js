/**
 * Cores e intensidades das raridades dos itens (vrp/config/Item.lua), vindas do
 * Theme da vrp (vrp/config/Global.lua) e expostas como CSS vars
 * (--rarityCommon, --rarityRare, ...). Usadas no fundo dos cards e das linhas
 * do carrinho — o tint cresce com a raridade e é sempre contido (padding-box),
 * sem pintar sob a borda/anel.
 */
export const RARITY_VARS = {
  common: "--rarityCommon",
  rare: "--rarityRare",
  epic: "--rarityEpic",
  legendary: "--rarityLegendary",
  mythic: "--rarityMythic",
};

export const RARITY_ALPHA = {
  common: 0.16,
  rare: 0.21,
  epic: 0.26,
  legendary: 0.31,
  mythic: 0.36,
};

/**
 * Estilo de tint de raridade para um elemento: gradiente no fundo com
 * background-clip: padding-box (a cor não atravessa a linha da borda).
 * Retorna {} quando a raridade não tem cor (sem Rarity ou desconhecida).
 * @param {string} rarity - Rarity do item (ex.: "rare", "epic")
 * @returns {object}
 */
export default function rarityStyle(rarity) {
  const varName = RARITY_VARS[rarity];
  if (!varName) return {};
  return {
    backgroundImage: `linear-gradient(160deg, rgb(var(${varName})/${RARITY_ALPHA[rarity]}), transparent 72%)`,
    backgroundClip: "padding-box",
  };
}

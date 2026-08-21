import isBrowser from "./isBrowser";

/**
 * URL da imagem do item. No jogo as imagens ficam na resource "vrp"
 * (vrp/config/inventory/<Index>.png, servidas pelo files do fxmanifest).
 * Em dev no navegador o mock usa os thumbnails locais de public/inv/.
 * @param {string} image - Index da imagem do item (ex.: "bait")
 * @returns {string}
 */
export default function itemImage(image) {
  if (!image) return "";
  return isBrowser() ? `/inv/${image}.png` : `nui://vrp/config/inventory/${image}.png`;
}

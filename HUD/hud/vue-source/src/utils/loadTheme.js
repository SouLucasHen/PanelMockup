import fetchNui from "./fetchNui";
import { useSettingsStore } from "@stores/settings";

/** Converte "#rrggbb"/"#rgb" em { r, g, b } (ou null). */
function hexToRgb(hex) {
  if (hex[0] === "#") hex = hex.substring(1, hex.length);
  if (hex.length > 6) hex = hex.substring(0, 6);
  if (hex.length === 3)
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
      }
    : null;
}

const toRgbString = (rgb) => `${rgb.r} ${rgb.g} ${rgb.b}`;

/**
 * Busca o tema no resource "vrp" (NUI "Theme") e preenche settings.theme com as
 * cores no formato "r g b". Sem resposta, os defaults da store permanecem.
 */
export default async function loadTheme() {
  const response = await fetchNui("Theme");
  if (!response) return;

  const settings = useSettingsStore();
  const { hud } = response;

  settings.theme.percentage = hud.percentage;
  if (typeof hud.wanted === "boolean") settings.theme.wanted = hud.wanted;

  const mainRgb = response.main && hexToRgb(response.main);
  if (mainRgb) settings.theme.main = toRgbString(mainRgb);

  const keys = [
    "icons",
    "pointer",
    "nitro",
    "rpm",
    "fuel",
    "electricFuel",
    "health",
    "armor",
    "hunger",
    "thirst",
    "stress",
    "luck",
    "dexterity",
    "repose",
    "illness",
  ];

  for (const key of keys) {
    const rgb = hud[key] && hexToRgb(hud[key]);
    if (rgb) settings.theme[key] = toRgbString(rgb);
  }

  for (const key of ["background", "circle", "letter"]) {
    const rgb = hexToRgb(hud.progress[key]);
    if (rgb) settings.theme.progress[key] = toRgbString(rgb);
  }
}

/**
 * Configura o tema dinamicamente, escrevendo as CSS variables que o Tailwind
 * usa (--main, --mainHover, --mainLight, --from, --to). Todas as variações
 * (hover, luz, fundo escuro do modal) são derivadas da cor principal para que
 * o painel mantenha o tema coerente em qualquer cor recebida do cliente.
 *
 * Também aplica as cores da loja vindas de `Theme.shop`
 * (vrp/config/Global.lua): buy (botão Realizar Compra) e category (aba ativa),
 * e as cores de raridade vindas de `Theme` (vrp/config/Global.lua):
 * common/rare/epic/legendary/mythic (usadas no fundo dos cards).
 * Se alguma faltar, o default do :root (style.css) permanece. O hover de cada
 * cor é derivado clareando ~12% (mesma lógica das demais variações do tema).
 *
 * @param {string} mainColor - Cor principal do tema em hexadecimal (#rrggbb)
 * @param {object} [shopColors] - Cores da loja em hexadecimal
 * @param {object} [rarityColors] - Cores de raridade em hexadecimal
 */
export default function setTheme(mainColor, shopColors = {}, rarityColors = {}) {
  const root = document.documentElement;

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const toVar = ({ r, g, b }) => `${r} ${g} ${b}`;

  // Clareia uma cor misturando `pct` com branco (0..1)
  const lighten = ({ r, g, b }, pct) => ({
    r: Math.round(r + (255 - r) * pct),
    g: Math.round(g + (255 - g) * pct),
    b: Math.round(b + (255 - b) * pct),
  });

  const rgb = hexToRgb(mainColor);
  if (rgb) {
    const { r, g, b } = rgb;

    // Cor principal
    root.style.setProperty("--main", toVar(rgb));

    // Hover: escurece ~25%
    root.style.setProperty(
      "--mainHover",
      toVar({ r: Math.round(r * 0.75), g: Math.round(g * 0.75), b: Math.round(b * 0.75) }),
    );

    // Luz: mistura ~40% com branco (círculos de contraste)
    root.style.setProperty("--mainLight", toVar(lighten(rgb, 0.4)));

    // Fundo escuro do modal: verde escuro com subtons do tema
    root.style.setProperty("--from", toVar({ r: Math.round(r * 0.12), g: Math.round(g * 0.12), b: Math.round(b * 0.13) }));
    root.style.setProperty("--to", toVar({ r: Math.round(r * 0.2), g: Math.round(g * 0.22), b: Math.round(b * 0.22) }));
  }

  // Cores da loja (Theme.shop): usa as enviadas pelo servidor ou, se faltarem,
  // deriva da cor principal do tema — a loja nunca foge da família de cores do
  // painel (nada de azul/roxo fora do tema). Base + hover derivado (~12%).
  const shopVars = {
    buy: "shopBuy",
    category: "shopCategory",
  };

  const buy = (shopColors.buy && hexToRgb(shopColors.buy)) || rgb;
  const category = (shopColors.category && hexToRgb(shopColors.category)) || (rgb && lighten(rgb, 0.12));

  for (const [key, varName] of Object.entries(shopVars)) {
    const color = key === "buy" ? buy : category;
    if (color) {
      root.style.setProperty(`--${varName}`, toVar(color));
      root.style.setProperty(`--${varName}Hover`, toVar(lighten(color, 0.12)));
    }
  }

  // Cores de raridade (Theme do vrp/config/Global.lua) — usadas no fundo dos
  // cards de itens com Rarity (vrp/config/Item.lua). Quem não vier no tema
  // mantém o default do :root (style.css).
  const rarityVars = {
    common: "rarityCommon",
    rare: "rarityRare",
    epic: "rarityEpic",
    legendary: "rarityLegendary",
    mythic: "rarityMythic",
  };

  for (const [key, varName] of Object.entries(rarityVars)) {
    const color = rarityColors[key] && hexToRgb(rarityColors[key]);
    if (color) {
      root.style.setProperty(`--${varName}`, toVar(color));
    }
  }
}

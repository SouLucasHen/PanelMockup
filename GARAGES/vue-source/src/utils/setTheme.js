/**
 * Configura o tema dinamicamente, escrevendo as CSS variables que o Tailwind
 * usa (--main, --mainHover, --mainLight, --from, --to). Todas as variações
 * (hover, luz, fundo escuro do modal) são derivadas da cor principal para que
 * o painel mantenha o tema coerente em qualquer cor recebida do cliente.
 *
 * Também aplica as cores dos botões da garagem vindas de `Theme.garage`
 * (vrp/config/Global.lua): get / mechanic / save / sell. Se alguma faltar,
 * o default do :root (style.css) permanece. O hover de cada botão é derivado
 * clareando ~12% (mesma lógica das demais variações do tema).
 *
 * @param {string} mainColor - Cor principal do tema em hexadecimal (#rrggbb)
 * @param {object} [garageColors] - Cores dos botões da garagem em hexadecimal
 */
export default function setTheme(mainColor, garageColors = {}) {
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

  // Botões da garagem (Theme.garage): base + hover derivado (~12% mais claro)
  const garageVars = {
    get: "garageGet",
    mechanic: "garageMechanic",
    save: "garageSave",
    sell: "garageSell",
  };

  for (const [key, varName] of Object.entries(garageVars)) {
    const parsed = garageColors[key] && hexToRgb(garageColors[key]);
    if (parsed) {
      root.style.setProperty(`--${varName}`, toVar(parsed));
      root.style.setProperty(`--${varName}Hover`, toVar(lighten(parsed, 0.12)));
    }
  }
}

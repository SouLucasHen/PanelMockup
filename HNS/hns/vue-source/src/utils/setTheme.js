/**
 * Configura o tema dinamicamente, escrevendo as CSS variables que o Tailwind
 * usa (--main, --mainHover, --mainLight, --from, --to). Todas as variações
 * (hover, luz, fundo escuro do modal) são derivadas da cor principal para que
 * o painel mantenha o tema coerente em qualquer cor recebida do cliente.
 * @param {string} mainColor - Cor principal do tema em hexadecimal (#rrggbb)
 */
export default function setTheme(mainColor) {
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

  const rgb = hexToRgb(mainColor);
  if (rgb) {
    const { r, g, b } = rgb;

    // Cor principal
    root.style.setProperty("--main", `${r} ${g} ${b}`);

    // Hover: escurece ~25%
    root.style.setProperty(
      "--mainHover",
      `${Math.round(r * 0.75)} ${Math.round(g * 0.75)} ${Math.round(b * 0.75)}`,
    );

    // Luz: mistura ~40% com branco (círculos de contraste)
    root.style.setProperty(
      "--mainLight",
      `${Math.round(r + (255 - r) * 0.4)} ${Math.round(g + (255 - g) * 0.4)} ${Math.round(b + (255 - b) * 0.4)}`,
    );

    // Fundo escuro do modal: verde escuro com subtons do tema
    root.style.setProperty("--from", `${Math.round(r * 0.12)} ${Math.round(g * 0.12)} ${Math.round(b * 0.13)}`);
    root.style.setProperty("--to", `${Math.round(r * 0.2)} ${Math.round(g * 0.22)} ${Math.round(b * 0.22)}`);
  }
}

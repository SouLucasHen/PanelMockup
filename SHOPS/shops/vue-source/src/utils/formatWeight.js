/**
 * Formata um peso em kg, mantendo até 3 casas e cortando zeros à direita
 * (0.755 → "0.755 kg", 2.75 → "2.75 kg", 0 → "0 kg").
 * @param {number} weight - Peso em kg
 * @returns {string}
 */
export default function formatWeight(weight) {
  const value = Number(weight) || 0;
  const text =
    value % 1 === 0
      ? String(value)
      : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return `${text} kg`;
}

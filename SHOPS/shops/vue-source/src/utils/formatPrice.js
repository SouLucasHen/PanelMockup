/**
 * Formata um valor como moeda no padrão brasileiro: ponto nos milhares e
 * vírgula nos decimais (ex.: "$ 1.275", "$ 10.000,00").
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export default function formatPrice(value, decimals = 0) {
  const number = Number(value) || 0;
  const fixed = number.toFixed(decimals);
  const [integer, decimal] = fixed.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimal ? `${grouped},${decimal}` : grouped;
}

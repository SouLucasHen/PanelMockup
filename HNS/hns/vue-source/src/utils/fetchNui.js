/**
 * Chamada NUI para o resource do FiveM.
 * @param {string} method
 * @param {object} [data]
 * @returns {Promise<any>}
 */
export default async function fetchNui(method, data) {
  const resource =
    typeof GetParentResourceName === "function"
      ? GetParentResourceName()
      : "nui-fallback";

  try {
    const response = await fetch(`https://${resource}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data ?? {}),
    });
    const result = await response.json();
    if (!result) return false;
    return result || {};
  } catch {
    return false;
  }
}

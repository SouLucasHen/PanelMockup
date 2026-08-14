/**
 * Mock de ambiente NUI (FiveM) para rodar a base de painéis no navegador
 * durante o dev, espelhando o mock da HUD (hud/vue-source/src/mock/browser.js).
 *
 * Fora do jogo não existe `GetParentResourceName`, o `fetch` para
 * `https://<resource>/<callback>` não resolve, e o client nunca dispara os
 * eventos `{ action, data }` (via `window.postMessage`). Este módulo simula
 * tudo isso. Todo o corpo fica atrás de `import.meta.env.DEV && isBrowser()`,
 * então em produção (`vite build`) vira código morto e some do bundle.
 */
import isBrowser from "@utils/isBrowser";

if (import.meta.env.DEV && isBrowser()) {
  const RESOURCE = "shops";
  const THEME = "#66ad43";
  // Mesmas cores do Theme.shop em vrp/config/Global.lua — edite lá para
  // ver os botões com a cor configurada (no dev, este mock espelha a config).
  // Ambas seguem a tonalidade da cor principal do tema (main #66ad43).
  const SHOP_THEME = {
    buy: "#66ad43",
    category: "#78b75a",
    // Espelha o Theme.shop.scribble da vrp: false desliga rabiscos/glows
    scribble: true,
  };
  // Mesmas cores de raridade do Theme em vrp/config/Global.lua — edite lá
  // para ver os tints dos cards com a cor configurada (no dev, este mock
  // espelha a config).
  const RARITY_THEME = {
    common: "#6fc66a",
    rare: "#6ac6c5",
    epic: "#c66a75",
    legendary: "#c6986a",
    mythic: "#c66ae0",
  };

  // ==================== STUB DO RESOURCE NAME ====================
  if (typeof window.GetParentResourceName !== "function") {
    window.GetParentResourceName = () => RESOURCE;
  }

  // ==================== INTERCEPTA AS CHAMADAS NUI ====================
  const realFetch = window.fetch.bind(window);

  const json = (data) =>
    new Response(JSON.stringify(data ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const callbacks = {
    // Mesmos callbacks NUI registrados no client (client-side/core.lua)
    Close: () => {
      send("Close");
      return {};
    },
    Checkout: (body) => {
      console.info("[mock] Checkout (realizar compra):", body);
      // Mesmo comportamento do client (client-side/core.lua): a interface
      // fecha na hora do clique para confirmar a compra; sucesso true limpa
      // o carrinho (que é resetado ao reabrir a loja)
      send("Close");
      return { Success: true };
    },
    // Mesma convenção da HUD: o tema vem do resource "vrp"
    Theme: () => ({ main: THEME, shop: SHOP_THEME, ...RARITY_THEME }),
  };

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input?.url ?? "");
    const match = new RegExp(`^https?://(?:${RESOURCE}|vrp|nui-fallback)/(.+)$`).exec(url);
    if (!match) return realFetch(input, init);
    const method = match[1];
    let body = {};
    try {
      if (init?.body) body = JSON.parse(init.body);
    } catch {}
    const handler = callbacks[method];
    const data = handler ? await handler(body) : {};
    return json(data);
  };

  // ==================== SEED INICIAL ====================
  // Mesma convenção da HUD: { name (Action), Payload }.
  const send = (action, data) => window.postMessage({ name: action, Payload: data }, "*");

  // Seed no MESMO formato que o servidor envia: { Name, Description, Mode, Type,
  // Items = { { Item, Name, Price, Weight, Image } } } — gerado a partir da List do
  // Megamall em shared-side/shared.lua, com Image sendo o Index do item
  // (vrp/config/Item.lua), servido em nui://vrp/config/inventory/<Index>.png e
  // Weight o peso em kg por unidade (mesma fonte do Item.lua).
  const open = () => {
    send("Open", {
      // Key = chave da loja na List (como o client envia) — separa o carrinho
      // de cada loja; Mode é sempre "Buy"/"Sell" e não identifica a loja.
      Key: "Megamall",
      Name: "Megamall",
      Description: "A loja de departamentos completa da cidade.",
      Mode: "Buy",
      Type: "Cash",
      Items: [
        // Max = quantidade máxima de manuseio (vrp/config/Item.lua), Current =
        // quanto o jogador já carrega e Rarity (Rarity em vrp/config/Item.lua)
        // — juntos limitam o carrinho e tingem o fundo do card no dev.
        { Item: "bait", Name: "Isca", Price: 5, Weight: 0.25, Image: "bait" },
        { Item: "rope", Name: "Cordas", Price: 925, Weight: 1.75, Image: "rope", Max: 2, Current: 1, Rarity: "rare" },
        { Item: "scuba", Name: "Roupa de Mergulho", Price: 975, Weight: 2.25, Image: "scuba", Max: 3, Rarity: "legendary" },
        { Item: "notepad", Name: "Bloco de Notas", Price: 10, Weight: 0.0, Image: "notepad" },
        { Item: "suitcase", Name: "Mala de Dinheiro", Price: 275, Weight: 1.0, Image: "suitcase" },
        { Item: "WEAPON_BRICK", Name: "Tijolo", Price: 25, Weight: 0.75, Image: "brick" },
        { Item: "WEAPON_SHOES", Name: "Tênis", Price: 25, Weight: 0.755, Image: "shoes" },
        { Item: "WEAPON_ACIDPACKAGE", Name: "Jornal", Price: 10, Weight: 0.75, Image: "newspaper" },
        { Item: "alliance", Name: "Aliança", Price: 525, Weight: 0.0, Image: "alliance" },
        { Item: "GADGET_PARACHUTE", Name: "Paraquedas", Price: 225, Weight: 2.25, Image: "parachute" },
        { Item: "axe", Name: "Machadinha", Price: 1225, Weight: 2.75, Image: "axe" },
        { Item: "pickaxe", Name: "Picareta", Price: 1225, Weight: 2.75, Image: "pickaxe" },
        { Item: "fishingrod", Name: "Vara de Madeira", Price: 1225, Weight: 2.75, Image: "fishingrod" },
        { Item: "emptypurifiedwater", Name: "Galão de Água Vazio", Price: 1275, Weight: 0.75, Image: "emptypurifiedwater" },
        // Clones são registrados dinamicamente no Item.lua (Clones + Puritys):
        // Index = "clone" (clone.png) e Weight = 0.05 kg.
        { Item: "tomatoclone_0", Name: "Clonagem de Tomate", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "passionclone_0", Name: "Clonagem de Maracujá", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "tangeclone_0", Name: "Clonagem de Tangerina", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "orangeclone_0", Name: "Clonagem de Laranja", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "appleclone_0", Name: "Clonagem de Maçã", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "grapeclone_0", Name: "Clonagem de Uva", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "lemonclone_0", Name: "Clonagem de Limão", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "bananaclone_0", Name: "Clonagem de Banana", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "acerolaclone_0", Name: "Clonagem de Acerola", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "strawberryclone_0", Name: "Clonagem de Morango", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "blueberryclone_0", Name: "Clonagem de Blueberry", Price: 3000, Weight: 0.05, Image: "clone" },
        { Item: "coffeeclone_0", Name: "Clonagem de Café", Price: 3000, Weight: 0.05, Image: "clone" },
      ],
    });
  };

  setTimeout(open, 50);

  // ==================== PAINEL DE TESTE ====================
  const buildPanel = () => {
    const panel = document.createElement("div");
    panel.id = "mock-panel";
    Object.assign(panel.style, {
      position: "fixed",
      bottom: "12px",
      left: "12px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontFamily: "sans-serif",
    });

    const groups = [
      {
        label: "Painel",
        buttons: [
          { label: "Abrir", action: () => open() },
          { label: "Fechar", action: () => send("Close") },
        ],
      },
    ];

    groups.forEach(({ label, buttons }) => {
      const row = document.createElement("div");
      Object.assign(row.style, { display: "flex", alignItems: "center", gap: "4px" });

      const lbl = document.createElement("span");
      lbl.textContent = label;
      Object.assign(lbl.style, {
        color: "rgba(255,255,255,0.5)",
        fontSize: "10px",
        minWidth: "52px",
        textAlign: "right",
        marginRight: "2px",
      });
      row.appendChild(lbl);

      buttons.forEach(({ label: btnLabel, action }) => {
        const btn = document.createElement("button");
        btn.textContent = btnLabel;
        Object.assign(btn.style, {
          padding: "3px 8px",
          fontSize: "11px",
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "4px",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          whiteSpace: "nowrap",
        });
        btn.addEventListener("mouseenter", () => {
          btn.style.background = "rgba(255,255,255,0.15)";
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.background = "rgba(0,0,0,0.55)";
        });
        btn.addEventListener("click", action);
        row.appendChild(btn);
      });

      panel.appendChild(row);
    });

    document.body.appendChild(panel);
  };

  if (document.body) buildPanel();
  else document.addEventListener("DOMContentLoaded", buildPanel);
}

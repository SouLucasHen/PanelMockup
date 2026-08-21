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
      // Mesmo comportamento do client (client-side/core.lua): a interface
      // fecha na hora do clique para confirmar a compra; sucesso true limpa
      // o carrinho (que é resetado ao reabrir a loja)
      send("Close");
      return { Success: true };
    },
    // Mesma convenção da HUD: o tema vem do resource "vrp".
    // currency = Theme.currency de vrp/config/Global.lua (Currency = "$").
    Theme: () => ({ main: THEME, currency: "$", shop: SHOP_THEME, ...RARITY_THEME }),
    // Peso atual e máximo do jogador (enviado pelo client no payload Open)
    Weight: () => ({ Weight: 12.5, MaxWeight: 50 }),
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

  // ==================== SEEDS — Lojas de teste ====================
  const send = (action, data) => window.postMessage({ name: action, Payload: data }, "*");

  // Itens compartilhados entre as lojas
  const COMMON_ITEMS = [
    { Item: "bait", Name: "Isca", Description: "Isca natural para atrair peixes.", Type: "Comum", Price: 5, Weight: 0.25, Image: "bait" },
    { Item: "notepad", Name: "Bloco de Notas", Description: "Bloco de notas compacto.", Type: "Comum", Price: 10, Weight: 0.0, Image: "notepad" },
    { Item: "suitcase", Name: "Mala de Dinheiro", Description: "Mala reforçada para transportar dinheiro.", Type: "Comum", Price: 275, Weight: 1.0, Image: "suitcase" },
    { Item: "alliance", Name: "Aliança", Description: "Aliança simples e elegante.", Type: "Comum", Price: 525, Weight: 0.0, Image: "alliance" },
    { Item: "axe", Name: "Machadinha", Description: "Machadinha robusta para cortar lenha.", Type: "Comum", Price: 1225, Weight: 2.75, Image: "axe" },
    { Item: "pickaxe", Name: "Picareta", Description: "Picareta resistente para mineração.", Type: "Comum", Price: 1225, Weight: 2.75, Image: "pickaxe" },
  ];

  const WEAPONS = [
    { Item: "WEAPON_BRICK", Name: "Tijolo", Description: "Arma improvisada.", Type: "Armamento", Price: 25, Weight: 0.75, Image: "brick" },
    { Item: "WEAPON_SHOES", Name: "Tênis", Description: "Tênis velho para arremesso.", Type: "Armamento", Price: 25, Weight: 0.755, Image: "shoes" },
    { Item: "WEAPON_HATCHET", Name: "Machado", Description: "Machado de combate.", Type: "Armamento", Price: 975, Weight: 1.5, Image: "hatchet", Rarity: "rare" },
  ];

  const CONSUMABLES = [
    { Item: "scuba", Name: "Roupa de Mergulho", Description: "Equipamento para mergulho autônomo.", Type: "Consumível", Price: 975, Weight: 2.25, Image: "scuba", Max: 3, Durability: 720, Rarity: "legendary" },
    { Item: "GADGET_PARACHUTE", Name: "Paraquedas", Description: "Paraquedas de reserva.", Type: "Consumível", Price: 225, Weight: 2.25, Image: "parachute" },
    { Item: "fishingrod", Name: "Vara de Madeira", Description: "Vara de pescar artesanal.", Type: "Consumível", Price: 1225, Weight: 2.75, Image: "fishingrod", Durability: 720 },
  ];

  const CLONES = [
    { Item: "tomatoclone_0", Name: "Clonagem de Tomate", Description: "Clone genético de tomate.", Type: "Comum", Price: 3000, Weight: 0.05, Image: "clone" },
    { Item: "passionclone_0", Name: "Clonagem de Maracujá", Description: "Clone genético de maracujá.", Type: "Comum", Price: 3000, Weight: 0.05, Image: "clone" },
    { Item: "appleclone_0", Name: "Clonagem de Maçã", Description: "Clone genético de maçã.", Type: "Comum", Price: 3000, Weight: 0.05, Image: "clone" },
  ];

  // ==================== LOJA CASH (Megamall) ====================
  const openCash = () => {
    send("Open", {
      Key: "Megamall", Name: "Megamall",
      Description: "A loja de departamentos completa da cidade.",
      Mode: "Buy", Type: "Cash",
      Weight: 12.5, MaxWeight: 50, Blackout: false,
      Items: [...COMMON_ITEMS, ...WEAPONS, ...CONSUMABLES, ...CLONES],
    });
  };

  // ==================== LOJA GEMSTONE (Banned) ====================
  const openGemstone = () => {
    send("Open", {
      Key: "Banned", Name: "Banidos",
      Description: "Itens restritos disponíveis mediante autorização.",
      Mode: "Buy", Type: "Gemstone",
      Weight: 12.5, MaxWeight: 50, Blackout: false,
      Items: [
        { Item: "banned_reduce", Name: "Redução de Sentença", Description: "Reduz 1 minuto do tempo restante.", Type: "Consumível", Price: 10, Weight: 0.0, Image: "banned_reduce", Rarity: "common" },
        { Item: "WEAPON_KATANA", Name: "Katana", Description: "Espada lendária.", Type: "Armamento", Price: 500, Weight: 1.75, Image: "katana", Rarity: "legendary", Durability: 240 },
        { Item: "gemstone", Name: "Diamante", Description: "Diamante brilhante.", Type: "Consumível", Price: 20, Weight: 0.0, Image: "gemstone", Rarity: "legendary" },
        { Item: "backpackg", Name: "Mochila Grande", Description: "Mochila de 100Kg.", Type: "Comum", Price: 2000, Weight: 2.5, Image: "backpackg", Rarity: "legendary" },
      ],
    });
  };

  // ==================== LOJA CONSUME (Desmanche) ====================
  // Type: "Consume" = troca por item (não usa dinheiro).
  // ItemName = nome do item de troca exibido no botão de pagamento.
  // Price = quantidade do item de troca necessária (sem símbolo $).
  const openConsume = () => {
    send("Open", {
      Key: "Dismantle", Name: "Desmanche",
      Description: "Troque limas de ferro por materiais de desmanche.",
      Mode: "Buy", Type: "Consume", ItemName: "Limas de Ferro",
      Weight: 12.5, MaxWeight: 50, ItemWeight: 0.3, Blackout: false,
      Items: [
        { Item: "plastic", Name: "Plástico", Description: "Plástico reciclado para fabricação.", Type: "Comum", Price: 30, Weight: 0.045, Image: "plastic" },
        { Item: "glass", Name: "Vidro", Description: "Vidro reciclado para fabricação.", Type: "Comum", Price: 30, Weight: 0.045, Image: "glass" },
        { Item: "rubber", Name: "Borracha", Description: "Borracha reciclada para fabricação.", Type: "Comum", Price: 30, Weight: 0.045, Image: "rubber" },
        { Item: "aluminum", Name: "Alumínio", Description: "Alumínio reciclado de alta qualidade.", Type: "Comum", Price: 50, Weight: 0.045, Image: "aluminum" },
        { Item: "copper", Name: "Cobre", Description: "Cobre reciclado de alta qualidade.", Type: "Comum", Price: 50, Weight: 0.045, Image: "copper" },
      ],
    });
  };

  // ==================== LOJA COM BLACKOUT ====================
  const openBlackout = () => {
    send("Open", {
      Key: "Megamall", Name: "Megamall (Blackout)",
      Description: "Loja com sistema bancário fora do ar.",
      Mode: "Buy", Type: "Cash",
      Weight: 12.5, MaxWeight: 50, Blackout: true,
      Items: [...COMMON_ITEMS.slice(0, 3)],
    });
  };

  // Envia quantidade de gemas (mesmo evento da HUD)
  setTimeout(() => send("Gemstone", 42), 30);
  setTimeout(openCash, 50);

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
        label: "Lojas",
        buttons: [
          { label: "Cash", action: () => openCash(), accent: "#66ad43" },
          { label: "Gemstone", action: () => openGemstone(), accent: "#c6986a" },
          { label: "Consume", action: () => openConsume(), accent: "#6ac6c5" },
        ],
      },
      {
        label: "Estado",
        buttons: [
          { label: "Blackout ON", action: () => openBlackout(), accent: "#f87171" },
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

      buttons.forEach(({ label: btnLabel, action, accent }) => {
        const btn = document.createElement("button");
        btn.textContent = btnLabel;
        Object.assign(btn.style, {
          padding: "3px 8px",
          fontSize: "11px",
          fontWeight: "500",
          background: accent ? accent + "22" : "rgba(0,0,0,0.55)",
          color: accent || "#fff",
          border: `1px solid ${accent ? accent + "44" : "rgba(255,255,255,0.2)"}`,
          borderRadius: "4px",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          whiteSpace: "nowrap",
        });
        btn.addEventListener("mouseenter", () => {
          btn.style.background = accent ? accent + "33" : "rgba(255,255,255,0.15)";
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.background = accent ? accent + "22" : "rgba(0,0,0,0.55)";
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

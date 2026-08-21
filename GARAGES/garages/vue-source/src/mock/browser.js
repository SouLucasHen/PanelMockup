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
  const RESOURCE = "hensa-panel";
  const THEME = "#66ad43";
  // Mesmas cores do Theme.garage em vrp/config/Global.lua — edite lá para
  // ver os botões com a cor configurada (no dev, este mock espelha a config)
  const GARAGE_THEME = {
    get: "#3fa466",
    mechanic: "#a4713f",
    save: "#ad4443",
    sell: "#737373",
    // Espelha o Theme.garage.scribble da vrp: false desliga rabiscos/glows
    scribble: true,
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
    Spawn: (body) => {
      console.info("[mock] Spawn (pegar veículo):", body);
      // Mesmo comportamento do client (client-side/core.lua): fecha o painel
      send("Close");
      return {};
    },
    Delete: () => {
      console.info("[mock] Delete (guardar veículo mais próximo)");
      // Mesmo comportamento do client (client-side/core.lua): fecha o painel
      send("Close");
      return {};
    },
    Tax: (body) => {
      console.info("[mock] Tax (pagar taxa):", body);
      return {};
    },
    Sell: (body) => {
      console.info("[mock] Sell (vender):", body);
      return {};
    },
    Transfer: (body) => {
      console.info("[mock] Transfer (transferir):", body);
      return {};
    },
    Mechanic: (body) => {
      console.info("[mock] Mechanic (solicitar mecânico):", body);
      // Mesmo comportamento do client (client-side/core.lua): fecha o painel
      send("Close");
      return {};
    },
    // Mesma convenção da HUD: o tema vem do resource "vrp"
    Theme: () => ({ main: THEME, garage: GARAGE_THEME }),
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

  // Seed no MESMO formato que o client envia (SendNUIMessage no
  // client-side/core.lua): { Action = "Open", Payload = Vehicles } onde
  // Payload é o array de veículos direto. Cada veículo: Model, Name, Tax, Mode,
  // Weight, Engine, Body, Fuel, Plate, Health, TaxTime, RentalTime. O store
  // normaliza para o formato da interface.
  // Garagem normal (particulares)
  const openNormal = () => {
    send("Open", { Name: "Garage", Number: "1", Vehicles: [
      { Model: "emperor", Name: "Emperor", Tax: 750, Mode: "Normal", Weight: 125, Engine: 900, Body: 600, Health: 85, Fuel: 100, Plate: "74NSY128", TaxTime: "30 Dias", RentalTime: false },
      { Model: "sultan", Name: "Sultan", Tax: 600, Mode: "Normal", Weight: 90, Engine: 750, Body: 800, Health: 95, Fuel: 55, Plate: "65GTV204", TaxTime: false, RentalTime: false },
      { Model: "sentinel2", Name: "Sentinel XS", Tax: 700, Mode: "Normal", Weight: 110, Engine: 850, Body: 450, Health: 72, Fuel: 70, Plate: "38RKM491", TaxTime: "30 Dias", RentalTime: false },
      { Model: "oracle", Name: "Oracle", Tax: 1450000, Mode: "Normal", Weight: 140, Engine: 950, Body: 500, Health: 65, Fuel: 65, Plate: "42HDS733", TaxTime: "30 Dias", RentalTime: "3 Dias" },
      { Model: "voltic", Name: "Voltic", Tax: 450, Mode: "Normal", Weight: 70, Engine: 800, Body: 700, Health: 91, Fuel: 60, Plate: "58WNE120", TaxTime: "30 Dias", RentalTime: false },
    ] });
  };

  // Garagem de serviço (Policia — com veículos possuídos e disponíveis)
  const openWork = () => {
    send("Open", { Name: "Policia", Number: "51", Vehicles: [
      // Possuídos (Owned: true) — já desbloqueados pelo jogador
      { Model: "tahoepol", Name: "Taureau POL", Tax: 800, Mode: "Work", Work: true, Owned: true, Weight: 110, Engine: 850, Body: 700, Health: 90, Fuel: 80, Plate: "POL001", TaxTime: "30 Dias", RentalTime: false },
      { Model: "policepol", Name: "Police Cruiser", Tax: 700, Mode: "Work", Work: true, Owned: true, Weight: 105, Engine: 800, Body: 650, Health: 85, Fuel: 75, Plate: "POL002", TaxTime: "30 Dias", RentalTime: false },
      { Model: "sultanrspol", Name: "Sultan RS POL", Tax: 900, Mode: "Work", Work: true, Owned: true, Weight: 95, Engine: 900, Body: 800, Health: 95, Fuel: 70, Plate: "POL003", TaxTime: "30 Dias", RentalTime: false },
      // Disponíveis (Owned: false) — ainda não adquiridos
      { Model: "policetpol", Name: "Police Touring", Tax: 750, Mode: "Work", Work: true, Owned: false, Weight: 0, Engine: 100, Body: 100, Health: 100, Fuel: 100, Plate: null, TaxTime: "30 Dias", RentalTime: false },
      { Model: "polchall", Name: "Police Challenger", Tax: 850, Mode: "Work", Work: true, Owned: false, Weight: 0, Engine: 100, Body: 100, Health: 100, Fuel: 100, Plate: null, TaxTime: "30 Dias", RentalTime: false },
      { Model: "polvic", Name: "Police Vic", Tax: 650, Mode: "Work", Work: true, Owned: false, Weight: 0, Engine: 100, Body: 100, Health: 100, Fuel: 100, Plate: null, TaxTime: "30 Dias", RentalTime: false },
    ] });
  };

  setTimeout(openNormal, 50);

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
        label: "Garagem",
        buttons: [
          { label: "Normal", action: () => openNormal() },
          { label: "Serviço", action: () => openWork() },
        ],
      },
      {
        label: "",
        buttons: [
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

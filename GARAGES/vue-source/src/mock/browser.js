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
    // Mesma convenção da HUD: o tema vem do resource "vrp"
    Theme: () => ({ main: THEME }),
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
  // Weight, Engine, Body, Fuel, TaxTime, RentalTime. O store normaliza para o
  // formato da interface.
  const open = () => {
    send("Open", [
      // TaxTime preenchido = IPVA em dia (botão de taxa desativado); false = vencido
      { Model: "emperor", Name: "Emperor", Tax: 750, Mode: "Normal", Weight: 125, Engine: 900, Body: 600, Fuel: 100, TaxTime: "30 Dias", RentalTime: false },
      { Model: "sultan", Name: "Sultan", Tax: 600, Mode: "Normal", Weight: 90, Engine: 750, Body: 800, Fuel: 55, TaxTime: false, RentalTime: false },
      { Model: "sentinel2", Name: "Sentinel XS", Tax: 700, Mode: "Normal", Weight: 110, Engine: 850, Body: 450, Fuel: 70, TaxTime: "30 Dias", RentalTime: false },
      { Model: "blista", Name: "Blista", Tax: 400, Mode: "Normal", Weight: 60, Engine: 600, Body: 900, Fuel: 80, TaxTime: false, RentalTime: false },
      { Model: "oracle", Name: "Oracle", Tax: 1450000, Mode: "Normal", Weight: 140, Engine: 950, Body: 500, Fuel: 65, TaxTime: "30 Dias", RentalTime: false },
      { Model: "f620", Name: "F620", Tax: 450, Mode: "Normal", Weight: 70, Engine: 800, Body: 700, Fuel: 60, TaxTime: "30 Dias", RentalTime: false },
    ]);
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
      {
        label: "Reset",
        buttons: [
          { label: "Resetar tudo", action: () => open() },
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

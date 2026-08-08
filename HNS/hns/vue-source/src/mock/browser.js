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
  const BACKGROUND_URL = "https://atmusbr.github.io/background-vehicle-map.jpg";
  const FAVICON_URL = "https://atmusbr.github.io/favicon.png";

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
    closeNUI: () => {
      send("Close");
      return {};
    },
  };

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input?.url ?? "");
    const match = new RegExp(`^https?://(?:${RESOURCE}|nui-fallback)/(.+)$`).exec(url);
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

  // ==================== FAVICON + FUNDO (mockup de teste, igual à HUD) ====================
  const applyAssets = () => {
    let icon = document.querySelector("link[rel~='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = FAVICON_URL;
    const s = document.body.style;
    s.backgroundImage = `url("${BACKGROUND_URL}")`;
    s.backgroundSize = "cover";
    s.backgroundPosition = "center";
    s.backgroundRepeat = "no-repeat";
  };
  if (document.body) applyAssets();
  else document.addEventListener("DOMContentLoaded", applyAssets);

  // ==================== SEED INICIAL ====================
  // Mesma convenção da HUD: { name (Action), Payload }.
  const send = (action, data) => window.postMessage({ name: action, Payload: data }, "*");

  const open = () => {
    send("Open", {
      PlayerName: "Lucas Hen",
      Theme: THEME,
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

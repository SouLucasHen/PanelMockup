/**
 * Mock de ambiente NUI (FiveM) para rodar a HUD no navegador durante o dev.
 *
 * Fora do jogo não existe `GetParentResourceName`, o `fetch` para
 * `https://<resource>/<callback>` não resolve, e o client nunca dispara os
 * eventos `{ name, payload }` (via `window.postMessage`). Este módulo simula
 * tudo isso. Todo o corpo fica atrás de `import.meta.env.DEV && isBrowser()`,
 * então em produção (`vite build`) vira código morto e some do bundle, e dentro
 * do CEF do FiveM não ativa.
 */
import isBrowser from "@utils/isBrowser";

if (import.meta.env.DEV && isBrowser()) {
  const RESOURCE = "hud";
  const BACKGROUND_URL = "https://raw.githubusercontent.com/SouLucasHen/Versions/refs/heads/main/images/wallpaper.png";

  const THEME = {
    hud: {
      percentage: true,
      wanted: true,
      icons: "#ffffff",
      pointer: "#ffffff",
      nitro: "#ffffff",
      rpm: "#ffffff",
      fuel: "#ffffff",
      electricFuel: "#FFA500",
      health: "#61ff8d",
      armor: "#68a5ff",
      hunger: "#ffc37e",
      thirst: "#a5dbff",
      stress: "#fffa84",
      luck: "#6dffff",
      dexterity: "#5364ff",
      repose: "#1ca5ff",
      illness: "#ff5e5e",
      progress: { background: "#ffffff", circle: "#ffffff", letter: "#ffffff" },
    },
    main: "#bf94ff",
  };

  // Stub do resource name (usado por fetchNui).
  if (typeof window.GetParentResourceName !== "function") {
    window.GetParentResourceName = () => RESOURCE;
  }

  // Intercepta as chamadas NUI.
  const realFetch = window.fetch.bind(window);
  const callbacks = { Theme: () => THEME };

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input?.url ?? "");
    const match = new RegExp(
      `^https?://(?:${RESOURCE}|vrp|nui-fallback)/(.+)$`,
    ).exec(url);
    if (!match) return realFetch(input, init);
    const method = match[1];
    let body = {};
    try { if (init?.body) body = JSON.parse(init.body); } catch { /* ignora */ }
    const handler = callbacks[method];
    const data = handler ? await handler(body) : {};
    return new Response(JSON.stringify(data ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  // Fundo de dev no body.
  const applyAssets = () => {
    const s = document.body.style;
    s.backgroundImage = `url("${BACKGROUND_URL}")`;
    s.backgroundSize = "cover";
    s.backgroundPosition = "center";
    s.backgroundRepeat = "no-repeat";
  };
  if (document.body) applyAssets();
  else document.addEventListener("DOMContentLoaded", applyAssets);

  // Helpers para testar qualquer evento pelo console (window.nui).
  const send = (name, payload) => window.postMessage({ name, payload }, "*");

  window.nui = {
    send,
    show:      (v = true)  => send("Body", v),
    vehicle:   (v = true)  => send("Vehicle", v),
    electric:  (v = true)  => send("IsElectric", v),
    safezone:  (name = "Praia Redonda") => send("Safezone", [true, name]),
    noSafezone: ()          => send("Safezone", false),
    weapon:    (current = 24, stored = 120, name = "Pistol") => send("Weapons", [true, current, stored, name]),
    noWeapon:  ()          => send("Weapons", false),
    progress:  (title = "Serrando...", desc = "", ms = 5000) => send("Progress", [title, desc, ms]),
    coupon:    (mins = 30) => send("Coupon", [true, "Cupom VIP", "+20% de XP", new Date(Date.now() + mins * 60000).toISOString()]),
    wanted:    (cur = 3, max = 5) => send("Wanted", [cur, max]),
    illness:   (v = 45)   => send("Illness", v),
    stress:    (v = 80)   => send("Stress", v),
    radio:     (freq = "100.5") => send("Frequency", freq),
    radioOff:  ()          => send("Frequency", "Offline"),
  };

  // Seed inicial.
  const seed = () => {
    send("Body", true);

    // Stats do jogador
    send("Health", 80);
    send("Armour", 50);
    send("Hunger", 70);
    send("Thirst", 60);
    send("Stress", 30);
    send("Luck", 1800);
    send("Dexterity", 1200);
    send("Repose", [50, 100]);
    send("Wanted", [3, 5]);
    send("Illness", 45);
    send("Safezone", [true, "Praia Redonda"]);

    // Topo direito
    send("Clock", [14, 30]);
    send("Gemstone", 42);
    send("Passport", 1234);
    send("Region", "Sul");
    send("Voip", "Normal");
    send("Voice", false);
    send("Frequency", "100.5");

    // Localização
    send("Road", "Vinewood Blvd");
    send("Crossing", "Downtown");

    // Arma
    send("Weapons", [true, 24, 120, "Pistol"]);

    // Veículo
    send("Vehicle", true);
    send("Speed", 80);
    send("Rpm", 5);
    send("Fuel", 65);
    send("Nitro", 1000);
    send("Seatbelt", true);
    send("EngineHealth", 800);
    send("Locked", 1);
    send("IsElectric", false);
  };

  setTimeout(seed, 50);

  // ── Painel de teste profissional (topo-esquerda, colapsável) ───
  const buildPanel = () => {
    // Estado do painel
    let collapsed = false;

    // Estilos compartilhados
    const S = {
      glass: {
        background: "rgba(12, 12, 20, 0.82)",
        backdropFilter: "blur(16px) saturate(1.4)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        fontFamily: "'Inter', 'SF Pro', -apple-system, system-ui, sans-serif",
        color: "#fff",
        userSelect: "none",
      },
      btn: {
        padding: "3px 6px",
        fontSize: "10px",
        fontWeight: "500",
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "4px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s ease",
        lineHeight: "1.3",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: "0",
      },
    };

    // Container principal
    const panel = document.createElement("div");
    panel.id = "mock-panel";
    Object.assign(panel.style, {
      ...S.glass,
      position: "fixed",
      top: "8px",
      left: "8px",
      zIndex: "9999",
      width: "min(220px, calc(100vw - 16px))",
      maxHeight: "calc(100vh - 16px)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
    });

    // ── Header (sempre visível, clica para colapsar) ──
    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 10px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer",
      flexShrink: "0",
    });

    const headerLeft = document.createElement("div");
    Object.assign(headerLeft.style, { display: "flex", alignItems: "center", gap: "8px" });

    const dot = document.createElement("span");
    Object.assign(dot.style, {
      width: "6px", height: "6px", borderRadius: "50%",
      background: "#4ade80",
      boxShadow: "0 0 6px rgba(74,222,128,0.5)",
      flexShrink: "0",
    });

    const title = document.createElement("span");
    title.textContent = "HUD Dev";
    Object.assign(title.style, {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.04em",
      color: "rgba(255,255,255,0.9)",
    });

    headerLeft.append(dot, title);

    const chevron = document.createElement("span");
    chevron.textContent = "\u25B2";
    Object.assign(chevron.style, {
      fontSize: "10px",
      color: "rgba(255,255,255,0.4)",
      transition: "transform 0.25s ease",
      lineHeight: "1",
    });

    header.append(headerLeft, chevron);
    panel.appendChild(header);

    // ── Corpo rolável ──
    const body = document.createElement("div");
    Object.assign(body.style, {
      display: "flex",
      flexDirection: "column",
      gap: "0",
      padding: "4px 6px 8px",
      overflowY: "auto",
      overflowX: "hidden",
      flex: "1 1 auto",
      scrollbarWidth: "thin",
      scrollbarColor: "rgba(255,255,255,0.15) transparent",
    });
    // Webkit scrollbar
    const styleTag = document.createElement("style");
    styleTag.textContent = `#mock-panel ::-webkit-scrollbar { width: 4px; }
      #mock-panel ::-webkit-scrollbar-track { background: transparent; }
      #mock-panel ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }`;
    panel.appendChild(styleTag);

    // Toggle colapso
    const toggleCollapse = () => {
      collapsed = !collapsed;
      if (collapsed) {
        body.style.maxHeight = "0";
        body.style.paddingTop = "0";
        body.style.paddingBottom = "0";
        body.style.opacity = "0";
        body.style.overflow = "hidden";
        header.style.borderBottom = "none";
        chevron.style.transform = "rotate(180deg)";
      } else {
        body.style.maxHeight = "9999px";
        body.style.paddingTop = "4px";
        body.style.paddingBottom = "6px";
        body.style.opacity = "1";
        body.style.overflowY = "auto";
        header.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
        chevron.style.transform = "rotate(0deg)";
      }
    };
    header.addEventListener("click", toggleCollapse);

    // ── Grupos ──
    const groups = [
      {
        label: "HUD",
        cols: 2,
        buttons: [
          { label: "ON",  action: () => send("Body", true),  accent: "#4ade80" },
          { label: "OFF", action: () => send("Body", false) },
          { label: "Safe ON",  action: () => send("Safezone", [true, "Praia Redonda"]),  accent: "#4ade80" },
          { label: "Safe OFF", action: () => send("Safezone", false) },
        ],
      },
      {
        label: "Veículo",
        cols: 2,
        buttons: [
          { label: "ON",  action: () => send("Vehicle", true),  accent: "#4ade80" },
          { label: "OFF", action: () => send("Vehicle", false) },
          { label: "⚡ Elétrico",  action: () => send("IsElectric", true),  accent: "#facc15" },
          { label: "⛽ 0",  action: () => send("Fuel", 0),  accent: "#f87171" },
          { label: "⛽ 65", action: () => send("Fuel", 65) },
        ],
      },
      {
        label: "Status",
        cols: 3,
        buttons: [
          { label: "♥ 100", action: () => send("Health", 100), accent: "#4ade80" },
          { label: "♥ 20",  action: () => send("Health", 20),  accent: "#f87171" },
          { label: "🛡 100", action: () => send("Armour", 100), accent: "#60a5fa" },
          { label: "🛡 0",   action: () => send("Armour", 0) },
          { label: "🍖 100", action: () => send("Hunger", 100) },
          { label: "🍖 10",  action: () => send("Hunger", 10),  accent: "#f87171" },
          { label: "💧 100", action: () => send("Thirst", 100) },
          { label: "💧 10",  action: () => send("Thirst", 10),  accent: "#f87171" },
          { label: "Str 0",  action: () => send("Stress", 0) },
          { label: "Str 80", action: () => send("Stress", 80), accent: "#facc15" },
          { label: "Doen",    action: () => send("Illness", 75), accent: "#f87171" },
          { label: "Limpo", action: () => send("Illness", 0) },
        ],
      },
      {
        label: "Rádio / Voz",
        cols: 2,
        buttons: [
          { label: "100.5", action: () => send("Frequency", "100.5") },
          { label: "OFF",   action: () => send("Frequency", "Offline") },
          { label: "🎙 ON",  action: () => send("Voice", true),  accent: "#4ade80" },
          { label: "🎙 OFF", action: () => send("Voice", false) },
        ],
      },
      {
        label: "Arma",
        cols: 2,
        buttons: [
          { label: "🔫 Pistol", action: () => send("Weapons", [true, 24, 120, "Pistol"]), accent: "#60a5fa" },
          { label: "Sem arma", action: () => send("Weapons", false) },
        ],
      },
      {
        label: "Outros",
        cols: 2,
        buttons: [
          { label: "⏳ Progresso", action: () => send("Progress", ["Serrando...", "", 5000]) },
          { label: "⭐ Procurado", action: () => send("Wanted", [3, 5]), accent: "#facc15" },
          { label: "↺ Reset", action: () => seed(), accent: "#c084fc" },
        ],
      },
    ];

    groups.forEach(({ label, buttons, cols }) => {
      // Separador
      const sep = document.createElement("div");
      Object.assign(sep.style, {
        display: "flex", alignItems: "center", gap: "4px",
        marginTop: "4px", marginBottom: "2px",
        paddingLeft: "2px",
      });
      const sepLine = document.createElement("div");
      Object.assign(sepLine.style, { flex: "1", height: "1px", background: "rgba(255,255,255,0.06)" });
      const sepLabel = document.createElement("span");
      sepLabel.textContent = label;
      Object.assign(sepLabel.style, {
        fontSize: "8px", fontWeight: "600", letterSpacing: "0.08em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
        flexShrink: "0",
      });
      sep.append(sepLine, sepLabel, sepLine.cloneNode(true));
      body.appendChild(sep);

      // Grid de botões — colunas responsivas
      const grid = document.createElement("div");
      Object.assign(grid.style, {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "3px",
        padding: "0 2px",
      });

      buttons.forEach(({ label: btnLabel, action, accent }) => {
        const btn = document.createElement("button");
        btn.textContent = btnLabel;
        btn.title = btnLabel;
        Object.assign(btn.style, {
          ...S.btn,
          ...(accent ? { borderColor: accent + "33", color: accent } : {}),
        });
        btn.addEventListener("mouseenter", () => {
          btn.style.background = accent ? accent + "22" : "rgba(255,255,255,0.12)";
          btn.style.borderColor = accent ? accent + "55" : "rgba(255,255,255,0.15)";
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.background = "rgba(255,255,255,0.06)";
          btn.style.borderColor = accent ? accent + "33" : "rgba(255,255,255,0.08)";
        });
        btn.addEventListener("click", action);
        grid.appendChild(btn);
      });

      body.appendChild(grid);
    });

    panel.appendChild(body);
    document.body.appendChild(panel);
  };

  if (document.body) buildPanel();
  else document.addEventListener("DOMContentLoaded", buildPanel);
}

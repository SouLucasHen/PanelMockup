# Design System — Shops

Guia visual completo para reproduzir e manter o padrão estético da resource shops. Qualquer nova resource que precise combinar visualmente com esta deve seguir estas diretrizes.

---

## 1. Paleta de Cores

Tudo é derivado de **uma cor principal** (`--main`). Não existem cores externas — azul, roxo, etc. só aparecem nas raridades.

### Cores Principais

| Variável | RGB | Hex | Uso |
|---|---|---|---|
| `--main` | `102 173 67` | `#66ad43` | Cor principal (ícones, acentos, scroll) |
| `--mainDark` | `82 143 54` | `#528f36` | Botão de adicionar ao carrinho |
| `--mainHover` | `77 130 50` | `#4d8232` | Hover (~25% mais escuro que main) |
| `--mainLight` | `163 206 142` | `#a3ce8e` | Círculos de glow (~40% mais claro) |
| `--mainText` | `255 255 255` | `#ffffff` | Texto sobre a cor principal |

### Cores de Fundo

| Variável | RGB | Hex | Uso |
|---|---|---|---|
| `--from` | `12 21 9` | `#0c1509` | Base escura (fundo do modal, popup) |
| `--to` | `20 38 15` | `#14260f` | Destino do gradiente (levemente mais claro) |

### Cores da Loja

| Variável | RGB | Hex | Uso |
|---|---|---|---|
| `--shopBuy` | `82 143 54` | `#528f36` | Botões de pagamento |
| `--shopBuyHover` | `102 173 67` | `#66ad43` | Hover dos botões de pagamento |

### Cores de Estado

| Variável | RGB | Hex | Uso |
|---|---|---|---|
| `--common` | `111 198 106` | `#6fc66a` | Preço/valor |

### Raridades

| Rarity | RGB | Hex | Alpha no card |
|---|---|---|---|
| `common` | `111 198 106` | `#6fc66a` | `0.16` |
| `rare` | `106 198 197` | `#6ac6c5` | `0.21` |
| `epic` | `198 106 117` | `#c66a75` | `0.26` |
| `legendary` | `198 152 106` | `#c6986a` | `0.31` |
| `mythic` | `198 106 224` | `#c66ae0` | `0.36` |

> **Regra**: As cores de raridade vêm do `vrp/config/Global.lua` e são aplicadas via CSS variables. Os defaults espelham a config.

---

## 2. Hierarquia de Opacidades

O design usa `white/X` como sistema de hierarquia. Quanto maior o X, mais visível o elemento:

```
white/5   →  Dividers, fundos de botões sutis
white/10  →  Bordas/rings, fundo de botões secundários
white/15  →  Hover de botões secundários
white/20  →  Separadores decorativos
white/40  →  Labels, textos terciários
white/50  →  Descrições, textos secundários
white/60  →  Texto de botões, preços secundários
white/70  →  Texto de botões (hover), ícones secundários
white/80  →  Valores de stats
white/90  →  Texto dos botões de pagamento
white     →  Títulos, nomes, valores principais
```

---

## 3. Bordas e Rings

**Padrão unificado**: Usar `ring-1` (box-shadow) em vez de `border` (CSS border real). O `ring` não afeta o layout e mantém consistência visual.

| Contexto | Classe | Cor |
|---|---|---|
| Painel principal | `ring-1 ring-white/10` | `white/10` |
| Seções internas | `ring-1 ring-main/15` | `main/15` |
| Cards de itens | `ring-1 ring-white/10` | `white/10` |
| Itens do carrinho | `ring-1 ring-white/10` | `white/10` |
| Botões com ring | `ring-1 ring-white/10` | `white/10` |
| Botão de perigo | `ring-1 ring-red-500/20` | `red-500/20` |

> **Regra**: Nunca misturar `border` com `ring` no mesmo nível. Usar sempre `ring-1` para bordas de container.

---

## 4. Tipografia

**Fonte**: Manrope (ou fallback sans-serif)
**Peso base**: 300 (light) — ênfase só com `font-semibold` ou `font-bold`

### Hierarquia

| Contexto | Tamanho | Peso | Classe |
|---|---|---|---|
| Título do painel | `1.5rem` | 600 | `text-2xl font-semibold` |
| Título do popup | `1.125rem` | 600 | `text-lg font-semibold` |
| Nome do item (card) | `0.75rem` | 600 | `text-[0.75rem] font-semibold` |
| Preço do item | `0.75rem` | 600 | `text-[0.75rem] font-semibold` |
| Nome no carrinho | `0.875rem` | 600 | `text-sm font-semibold` |
| Preço total | `1.25rem` | 700 | `text-xl font-bold` |
| Labels stats | `0.625rem` | 500 | `text-[0.625rem] font-medium uppercase tracking-wide` |
| Valores stats | `0.75rem` | 600 | `text-xs font-semibold` |
| Descrição | `0.75rem` | 300 | `text-xs` |

---

## 5. Botões

### Padrão por Categoria

**A) Secundários (com ring):**
```html
<button class="bg-white/5 text-white/60 ring-1 ring-white/10
               hover:bg-white/10 hover:text-white
               rounded-md transition-colors">
```
→ Fechar (X), +/- do carrinho

**B) Primários (sólidos):**
```html
<button class="bg-shopBuy text-white/90
               hover:bg-shopBuyHover
               disabled:bg-shopBuy/25 disabled:text-white/30
               rounded-md transition-colors">
```
→ Pagamento, adicionar ao carrinho

**C) Neutros (sólidos sem ring):**
```html
<button class="bg-white/10 text-white/70
               hover:bg-white/15 hover:text-white
               rounded-[0.25rem] transition-colors">
```
→ Info nos cards

**D) Perigo:**
```html
<button class="bg-red-500/10 text-red-400 ring-1 ring-red-500/20
               hover:bg-red-500/20
               rounded-md transition-colors">
```
→ Remover do carrinho

### Tamanhos

| Contexto | Tamanho | Border Radius |
|---|---|---|
| Fechar painel | `w-10 h-10` | `rounded-md` |
| Fechar popup | `w-9 h-9` | `rounded-lg` |
| +/- carrinho | `h-7 w-7` | `rounded-md` |
| Botões card | `h-7 w-7` | `rounded-[0.25rem]` |
| Pagamento | `py-3` (altura auto) | `rounded-md` |

---

## 6. Backgrounds por Camada

```
Camada 1 (externa):    bg-from/0.95 + bg-default (gradiente from→to, 0.92)
Camada 2 (decoração):  Scribbles (text-main, opacity-5)
                        Glows (mainLight, opacity-40 e opacity-20)
Camada 3 (painel):     bg-neutral-950/85 + bg-default/opacity-50
Camada 4 (seções):     bg-main/10
Camada 5 (cards):      bg-white/[0.02] → hover: bg-white/[0.04]
Camada 6 (carrinho):   bg-white/[0.04]
Camada 7 (popup):      bg-from + bloco interno rgb(var(--main)/0.08)
```

### Gradientes

```css
/* Fundo do painel */
.bg-default {
    background: linear-gradient(to bottom right,
        rgb(var(--from) / 0.92),
        rgb(var(--to) / 0.92)
    );
}

/* Glow circular */
.bg-shadow-circle {
    background: radial-gradient(circle,
        rgb(var(--mainLight)),
        rgb(var(--mainLight) / 0) 75%
    );
}

/* Overlay do popup (padrão dynamic) */
background: linear-gradient(to top,
    rgb(var(--from) / 0.7),
    rgb(var(--from) / 0.4) 50%,
    rgb(var(--from) / 0.7)
);
```

---

## 7. Border Radius

```
rounded-2xl   (1rem)     → Painel principal
rounded-xl    (0.75rem)  → Ícone do header, popup
rounded-lg    (0.5rem)   → Botão fechar, bloco interno do popup
rounded-md    (0.375rem) → Seções, cards, itens do carrinho, botões +/-
rounded-[0.25rem]        → Botões de ação nos cards
```

---

## 8. Transições

### Padrão Espelhado

```
ABRIR:  bg aparece (0.3s) → painel aparece (0.3s com 0.2s delay)
FECHAR: painel some (0.3s) → bg some (0.3s com 0.2s delay)
Total:  0.5s em ambas as direções
```

### Classes

```css
/* Painel principal */
.fade-enter-active { transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s; }
.fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.95); }

/* Fundo externo */
.bg-fade-enter-active { transition: opacity 0.3s ease; }
.bg-fade-leave-active { transition: opacity 0.3s ease 0.2s; }
.bg-fade-enter-from, .bg-fade-leave-to { opacity: 0; }

/* Popup (modal) — padrão dynamic */
.modal-bg-enter-active { transition: opacity 0.3s ease; }
.modal-bg-leave-active { transition: opacity 0.3s ease 0.2s; }
.modal-panel-enter-active { transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s; }
.modal-panel-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-panel-enter-from, .modal-panel-leave-to { opacity: 0; transform: scale(0.95); }
```

### Fechamento por ESC

Popup usa `visible` ref + `setTimeout(300ms)` antes de emitir `close` para a transição terminar.

---

## 9. Scrollbar

```css
.cards-scroll::-webkit-scrollbar { width: 4px; margin: 0 2px; }
.cards-scroll::-webkit-scrollbar-track { background: transparent; }
.cards-scroll::-webkit-scrollbar-thumb {
    background: rgb(var(--main) / 0.2);
    border-radius: 9999px;
}
.cards-scroll::-webkit-scrollbar-thumb:hover {
    background: rgb(var(--main) / 0.35);
}
```

---

## 10. Responsividade

Escala via `font-size` no `:root` — todo conteúdo usa `rem`, então escala proporcionalmente:

| Resolução | font-size |
|---|---|
| `< 800px ou < 600px` | `0.3rem` |
| `800x600` | `0.425rem` |
| `1000x700` | `0.55rem` |
| `1100x700` | `0.6rem` |
| `1300x700` | `0.7rem` |
| `1400x700` | `0.75rem` |
| `1600x800` | `0.8rem` |
| `1750x900` | `0.9rem` |
| `1850x1000` | `1rem` |

---

## 11. Instruções para IA Replicar a Interface

Seja qual for a IA (Codebuff, ChatGPT, Claude, etc.), siga estas instruções na ordem para criar uma interface que combine com o design system da shops.

---

### Passo 1 — Setup do Projeto

```
vue-source/
├── index.html
├── package.json          # vue 3.4, pinia 2.1, tailwind 3.4, vite 5
├── vite.config.js        # aliases @components, @stores, @utils, @icons
├── tailwind.config.js    # cores via CSS vars (main, from, to, shopBuy)
├── postcss.config.js
└── src/
    ├── main.js           # createApp + Pinia + mock condicional
    ├── App.vue           # Layout principal
    ├── style.css         # CSS vars + responsividade + scrollbar + transições
    ├── views/            # Páginas
    ├── components/       # Componentes reutilizáveis
    ├── stores/           # Pinia stores
    ├── utils/            # Funções puras
    ├── icons/            # SVGs (componentes Vue)
    └── mock/browser.js   # Mock NUI para dev
```

**Dependências**:
```json
{
  "dependencies": { "pinia": "2.1.7", "vue": "3.4.21" },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "tailwindcss": "3.4.1",
    "vite": "^5.4.11"
  }
}
```

**Aliases obrigatórios no vite.config.js**:
```js
alias: {
  "@": "./src",
  "@components": "./src/components",
  "@stores": "./src/stores",
  "@utils": "./src/utils",
  "@icons": "./src/icons",
}
```

---

### Passo 2 — CSS Variables (style.css)

Copie exatamente este bloco para o `:root` do `style.css`:

```css
:root {
    font-size: 1rem;
    --main: 102 173 67;
    --mainText: 255 255 255;
    --mainHover: 77 130 50;
    --mainLight: 163 206 142;
    --from: 12 21 9;
    --to: 20 38 15;
    --common: 111 198 106;
    --rarityCommon: 111 198 106;
    --rarityRare: 106 198 197;
    --rarityEpic: 198 106 117;
    --rarityLegendary: 198 152 106;
    --rarityMythic: 198 106 224;
    --mainDark: 82 143 54;
    --shopBuy: 82 143 54;
    --shopBuyHover: 102 173 67;
    --shopCategory: 120 183 90;
    --shopCategoryHover: 136 192 110;
}
```

**IMPORTANTE**: As cores são RGB separados por espaço (não hex), porque o Tailwind usa `rgb(var(--main) / <alpha-value>)` para opacidade.

---

### Passo 3 — Tailwind Config

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        main: "rgb(var(--main) / <alpha-value>)",
        mainDark: "rgb(var(--mainDark) / <alpha-value>)",
        mainHover: "rgb(var(--mainHover) / <alpha-value>)",
        from: "rgb(var(--from) / <alpha-value>)",
        to: "rgb(var(--to) / <alpha-value>)",
        shopBuy: "rgb(var(--shopBuy) / <alpha-value>)",
        shopBuyHover: "rgb(var(--shopBuyHover) / <alpha-value>)",
      },
    },
  },
}
```

---

### Passo 4 — Base do body e reset

```css
/* style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }
img { pointer-events: none; }
html, body, #app { height: 100%; width: 100%; overflow: hidden; }
body { @apply text-white bg-transparent; font-weight: 300; }
```

**NUNCA** usar `font-weight: 400` ou `500` como base. Sempre 300. Ênfase é com `font-semibold` (600) ou `font-bold` (700).

---

### Passo 5 — Layout do Painel Principal

```
<div class="fixed inset-0 ...">                    /* Fundo externo */
  <div class="relative w-[84rem] h-[50rem]">       /* Container */
    <div class="rounded-2xl bg-neutral-950/85        /* Modal */
                  ring-1 ring-white/10 shadow-2xl">
      <div class="border-b border-white/5 ...">    /* Header */
      <div class="flex ... gap-6">                  /* Conteúdo */
        <div class="flex-1 bg-main/10                /* Seção esquerda */
                      ring-1 ring-main/15 rounded-md">
        <div class="w-[26rem] bg-main/10             /* Seção direita */
                      ring-1 ring-main/15 rounded-md">
      </div>
    </div>
  </div>
</div>
```

**Regras do painel**:
- Largura fixa: `w-[84rem] h-[50rem]`
- Modal: `rounded-2xl bg-neutral-950/85 ring-1 ring-white/10`
- Seções: `bg-main/10 ring-1 ring-main/15 rounded-md`
- Header divider: `border-b border-white/5` (aqui `border` é aceitável porque é divisor, não container)

---

### Passo 6 — Cards de Itens

```html
<div class="relative flex flex-col items-center gap-3
            rounded-md ring-1 ring-white/10
            bg-white/[0.02] p-2.5
            transition-all duration-200
            hover:ring-main/60 hover:bg-white/[0.04]">
  <!-- Nome -->
  <p class="w-full text-[0.75rem] font-semibold text-white truncate">
    Nome do Item
  </p>
  <!-- Imagem -->
  <img class="w-[62%] aspect-square object-contain
              drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]" />
  <!-- Base -->
  <div class="mt-auto flex w-full items-center justify-between">
    <div class="flex items-center gap-1.5">
      <!-- Botão Info -->
      <button class="h-7 w-7 rounded-[0.25rem] bg-white/10
                     text-white/70 hover:bg-white/15 hover:text-white">
      <!-- Botão Adicionar -->
      <button class="h-7 w-7 rounded-[0.25rem] bg-shopBuy
                     text-white hover:bg-shopBuyHover">
    </div>
    <span class="text-[0.75rem] font-semibold text-[rgb(var(--common))]">
      $ 1.225
    </span>
  </div>
</div>
```

**Regras dos cards**:
- Borda: `ring-1 ring-white/10` (NUNCA `border`)
- Fundo: `bg-white/[0.02]` → hover `bg-white/[0.04]`
- Imagem: `w-[62%] aspect-square` com drop-shadow
- Botões: `h-7 w-7 rounded-[0.25rem]`
- Preço: cor `rgb(var(--common))`

---

### Passo 7 — Botões de Pagamento

```html
<button class="flex-1 whitespace-nowrap rounded-md py-3
               text-xs font-bold uppercase tracking-wide
               transition-colors cursor-pointer
               bg-shopBuy text-white/90 hover:bg-shopBuyHover">
  Pagar com Dinheiro
</button>
```

**Desabilitado**:
```html
bg-shopBuy/25 text-white/30 cursor-default
```

---

### Passo 8 — Botão Fechar (Padrão Unificado)

```html
<button class="w-10 h-10 rounded-md                    /* Painel: maior, rounded-md */
               bg-white/5 text-white/60
               ring-1 ring-white/10
               hover:bg-white/10 hover:text-white
               transition-colors cursor-pointer">
  <svg class="w-5 h-5" viewBox="0 0 24 24" ...>     /* SVG X icon */
</button>
```

Para **popup**: `w-9 h-9 rounded-lg` e ícone `w-4 h-4`.

**NUNCA** usar `✕` (texto). Sempre SVG com `stroke-width="2"`.

---

### Passo 9 — Popup (Modal)

```html
<Teleport to="body">
  <!-- Overlay -->
  <transition name="modal-bg">
    <div v-if="visible" class="fixed inset-0 z-[9999]"
         style="background: linear-gradient(to top,
           rgb(var(--from) / 0.7),
           rgb(var(--from) / 0.4) 50%,
           rgb(var(--from) / 0.7))"
         @click.self="close" />
  </transition>

  <!-- Card -->
  <transition name="modal-panel">
    <div v-if="visible"
         class="fixed inset-0 z-[9999] flex items-center
                justify-center pointer-events-none p-6">
      <div class="bg-from rounded-xl ring-1 ring-white/10
                  shadow-2xl w-[30rem] overflow-hidden
                  pointer-events-auto flex flex-col"
           @click.self="close">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5">
          <h2 class="font-semibold text-white text-lg truncate">
            Título
          </h2>
          <button class="w-9 h-9 rounded-lg ...">X</button>
        </div>
        <!-- Conteúdo -->
        <div class="px-6 pb-6">
          <div class="flex gap-5 rounded-lg p-4"
               style="background: rgb(var(--main) / 0.08)">
            <!-- Imagem + Detalhes -->
          </div>
        </div>
      </div>
    </div>
  </transition>
</Teleport>
```

**Estados do popup**:
```js
const visible = ref(false);

function close() {
  visible.value = false;
  setTimeout(() => emit("close"), 300);  // Espera transição
}

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  nextTick(() => { visible.value = true; });
});
```

---

### Passo 10 — Ícones SVG

Todos os ícones seguem o mesmo padrão:

```html
<!-- Padrão: stroke-based, 24x24, stroke-width="2" -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="..." stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
```

**Regras**:
- viewBox `0 0 24 24`
- `fill="none"` (sem preenchimento)
- `stroke="currentColor"` (herda a cor do pai)
- `stroke-width="2"`
- `stroke-linecap="round" stroke-linejoin="round"`
- Usar na classe: `text-white/70` ou `text-main` etc.

---

### Passo 11 — Transições (copiar para style.css)

```css
/* Painel principal */
.fade-enter-active { transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s; }
.fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.95); }

/* Fundo externo */
.bg-fade-enter-active { transition: opacity 0.3s ease; }
.bg-fade-leave-active { transition: opacity 0.3s ease 0.2s; }
.bg-fade-enter-from, .bg-fade-leave-to { opacity: 0; }
```

Para popups ( scoped):
```css
.modal-bg-enter-active { transition: opacity 0.3s ease; }
.modal-bg-leave-active { transition: opacity 0.3s ease 0.2s; }
.modal-bg-enter-from, .modal-bg-leave-to { opacity: 0; }
.modal-panel-enter-active { transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s; }
.modal-panel-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-panel-enter-from, .modal-panel-leave-to { opacity: 0; transform: scale(0.95); }
```

---

### Passo 12 — Scrollbar (copiar para style.css)

```css
.scroll-area { overscroll-behavior: contain; scroll-behavior: smooth; }
.scroll-area::-webkit-scrollbar { width: 4px; margin: 0 2px; }
.scroll-area::-webkit-scrollbar-track { background: transparent; }
.scroll-area::-webkit-scrollbar-thumb { background: rgb(var(--main) / 0.2); border-radius: 9999px; }
.scroll-area::-webkit-scrollbar-thumb:hover { background: rgb(var(--main) / 0.35); }
```

---

### Passo 13 — Responsividade (copiar para style.css)

```css
@media screen and (max-height: 600px), screen and (max-width: 800px) { :root { font-size: 0.3rem; } }
@media screen and (min-width: 800px) and (min-height: 600px) { :root { font-size: 0.425rem; } }
@media screen and (min-width: 1000px) and (min-height: 700px) { :root { font-size: 0.55rem; } }
@media screen and (min-width: 1100px) and (min-height: 700px) { :root { font-size: 0.6rem; } }
@media screen and (min-width: 1300px) and (min-height: 700px) { :root { font-size: 0.7rem; } }
@media screen and (min-width: 1400px) and (min-height: 700px) { :root { font-size: 0.75rem; } }
@media screen and (min-width: 1600px) and (min-height: 800px) { :root { font-size: 0.8rem; } }
@media screen and (min-width: 1750px) and (min-height: 900px) { :root { font-size: 0.9rem; } }
@media screen and (min-width: 1850px) and (min-height: 1000px) { :root { font-size: 1rem; } }
```

**IMPORTANTE**: Todo o conteúdo deve usar `rem` (não `px`) para escalar corretamente.

---

### Passo 14 — Tema via NUI

Copie `loadTheme.js` e `setTheme.js` da resource shops. Eles:
1. Buscam o tema via `fetchNui("Theme")` no resource `vrp`
2. Escrevem CSS variables dinamicamente (`--main`, `--from`, `--shopBuy`, etc.)
3. Derivam hover, dark, light automaticamente

```js
// loadTheme.js
import fetchNui from "./fetchNui";
import setTheme from "./setTheme";

export default async function loadTheme() {
  const response = await fetchNui("Theme");
  if (!response || !response.main) return;
  setTheme(response.main, response.shop, {
    common: response.common, rare: response.rare,
    epic: response.epic, legendary: response.legendary,
    mythic: response.mythic,
  });
  return response;
}
```

---

### Resumo Rápido (Cheat Sheet)

| Elemento | Classe principal |
|---|---|
| Painel | `rounded-2xl bg-neutral-950/85 ring-1 ring-white/10 shadow-2xl` |
| Seção | `rounded-md bg-main/10 ring-1 ring-main/15` |
| Card | `rounded-md ring-1 ring-white/10 bg-white/[0.02]` |
| Botão fechar | `rounded-md bg-white/5 text-white/60 ring-1 ring-white/10` |
| Botão primário | `rounded-md bg-shopBuy text-white/90` |
| Botão perigo | `rounded-md bg-red-500/10 text-red-400 ring-1 ring-red-500/20` |
| Popup overlay | `z-[9999] linear-gradient(--from/0.7)` |
| Popup card | `rounded-xl bg-from ring-1 ring-white/10 shadow-2xl` |
| Título | `text-2xl font-semibold text-white` |
| Label | `text-[0.625rem] font-medium uppercase tracking-wide text-white/40` |
| Valor | `text-xs font-semibold text-white/80` |
| Preço | `text-[0.75rem] font-semibold text-[rgb(var(--common))]` |
| Divider | `border-t border-white/5` |
| Scroll | `::-webkit-scrollbar` 4px, thumb `main/0.2` |

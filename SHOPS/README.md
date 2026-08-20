# Shops — Resource FiveM

Resource de lojas para FiveM com interface NUI (Vue 3 + Tailwind + Pinia). Os jogadores compram itens em lojas espalhadas pelo mapa, com suporte a diferentes formas de pagamento.

---

## Estrutura

```
shops/
├── fxmanifest.lua          # Manifesto da resource
├── client-side/
│   └── core.lua            # Lógica do cliente (abrir/fechar loja, NUI callbacks)
├── server-side/
│   └── core.lua            # Lógica do servidor (permissão, checkout, peso, limite)
├── shared-side/
│   └── shared.lua          # Configuração das lojas (List + Location)
├── vue-source/             # Código-fonte da interface (desenvolvimento)
│   └── src/
│       ├── App.vue         # Layout principal (painel + carrinho)
│       ├── views/Inicio.vue
│       ├── components/
│       │   ├── ItemCard.vue
│       │   └── ItemDetail.vue
│       ├── stores/
│       │   ├── shop.js     # Store principal (catálogo, carrinho, checkout)
│       │   └── settings.js # Visibilidade + currency
│       ├── utils/          # Funções puras (fetchNui, formatação, tema)
│       ├── mock/browser.js # Mock para dev no navegador
│       └── icons/          # SVGs
└── web-side/               # Build da interface (produção)
```

---

## Como Funciona

### Fluxo de Abertura

1. Jogador interage com o marker/target no mapa → dispara `shops:Open`
2. Client verifica permissão via `vSERVER.Permission(Name)`
3. Client monta o catálogo com dados dos itens (via exports do vrp)
4. Client envia `SendNUIMessage({ Action = "Open", Payload = {...} })`
5. Interface exibe o painel com catálogo + carrinho

### Fluxo de Compra (Checkout)

1. Jogador seleciona itens e clica em "Pagar"
2. Interface envia `fetchNui("Checkout", { Items, Payment })`
3. Client fecha o painel e chama `vSERVER.Checkout(Name, Items, Payment)`
4. Server verifica: peso, limite de itens, saldo (dinheiro/banco/gemas/item)
5. Server gera os itens no inventário do jogador
6. Server retorna `{ Success = true/false }`
7. Interface limpa o carrinho em caso de sucesso

### Formas de Pagamento

| Type | Pagamento | Botões |
|------|-----------|--------|
| `Cash` | Dinheiro (`dollar`) ou Banco | "Pagar com Dinheiro" + "Pagar com Banco" |
| `Gemstone` | Diamantes | "Pagar com Gemas" |
| `Consume` | Item de troca (ex: `ironfilings`) | "Pagar com {ItemName}" |

### Modos

| Modo | Comportamento |
|------|---------------|
| `Buy` | Interface de compra (painel NUI com catálogo) |
| `Sell` | Abre o inventário em modo venda (via resource `inventory`) |

---

## Como Criar uma Loja

### 1. Adicionar na List (shared-side/shared.lua)

```lua
List = {
    MinhaLoja = {
        Name = "Minha Loja",
        Description = "Descrição da loja.",
        Mode = "Buy",           -- "Buy" ou "Sell"
        Type = "Cash",          -- "Cash", "Gemstone" ou "Consume"
        -- Item = "dirtydollar", -- Obrigatório se Type = "Consume"
        -- Permission = "LSPD", -- Opcional: requer serviço/group
        -- Route = 0,           -- Opcional: restringe a rota do jogador
        List = {
            -- key = preço
            bait = 5,
            rope = 925,
            WEAPON_HATCHET = 975,
        }
    }
}
```

**Campos da List:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `Name` | string | ✅ | Nome exibido no cabeçalho |
| `Description` | string | ❌ | Descrição abaixo do nome |
| `Mode` | string | ✅ | `"Buy"` ou `"Sell"` |
| `Type` | string | ✅ | `"Cash"`, `"Gemstone"` ou `"Consume"` |
| `Item` | string | Consume | Item de troca (ex: `"dirtydollar"`, `"ironfilings"`) |
| `Permission` | string | ❌ | Permissão necessária (group/service) |
| `Route` | number | ❌ | Routing bucket restrito |
| `List` | table | ✅ | `{ itemKey = price, ... }` |

### 2. Adicionar no Location (shared-side/shared.lua)

```lua
Location = {
    {
        Coords = vec3(24.51, -1346.75, 29.49),  -- Posição no mapa
        Mode = "MinhaLoja",                       -- Chave da List
        -- Circle = 0.1,                          -- Opcional: zona circular (senão, usa BoxZone)
        -- Route = 9999998,                       -- Opcional: routing bucket
        -- Name = "Nome do Marker",               -- Opcional: label no target
        -- Sound = true,                          -- Opcional: som ao abrir
    }
}
```

**Campos do Location:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `Coords` | vec3 | ✅ | Coordenadas do marker/target |
| `Mode` | string | ✅ | Chave correspondente na List |
| `Circle` | number | ❌ | Raio da zona circular (senão usa BoxZone 0.75x0.75) |
| `Route` | number | ❌ | Routing bucket restrito |
| `Name` | string | ❌ | Label exibido no target |
| `Sound` | boolean | ❌ | Toca som ao abrir |

### 3. Itens dos Itens (vrp/config/Item.lua)

Cada item vendido precisa estar definido no `vrp/config/Item.lua`:

```lua
local List = {
    ["meuitem"] = {
        AdminLevel = 1,
        Index = "meuitem",          -- Nome da imagem em inventory/
        Name = "Meu Item",
        Description = "Descrição do item.",
        Type = "Comum",             -- Comum, Consumível, Armamento, Attachs
        Rarity = "common",          -- common, rare, epic, legendary, mythic
        Weight = 0.5,               -- Peso em kg
        Durability = 720,           -- Durabilidade em horas (opcional)
        Max = 5,                    -- Limite de manuseio (opcional)
    }
}
```

**Exports disponíveis para consultar itens:**

```lua
exports.vrp:ItemName(key)         -- Nome do item
exports.vrp:ItemWeight(key)       -- Peso
exports.vrp:ItemIndex(key)        -- Index da imagem
exports.vrp:ItemMaxAmount(key)    -- Limite de manuseio
exports.vrp:ItemRarity(key)       -- Raridade
exports.vrp:ItemDescription(key)  -- Descrição
exports.vrp:ItemDurability(key)   -- Durabilidade (horas)
exports.vrp:ItemType(key)         -- Tipo
```

---

## Desenvolvimento (vue-source)

### Setup

```bash
cd vue-source
npm install
npm run dev
```

O mock em `src/mock/browser.js` simula o ambiente FiveM no navegador, interceptando `fetch` e `postMessage`.

### Build

```bash
npm run build           # Gera dist/
npm run build:resource  # Build + copia para web-side/
```

### Estrutura da Interface

```
App.vue
├── Fundo (gradiente + scribbles + glows)
├── Painel Principal (84rem x 50rem)
│   ├── Cabeçalho (nome da loja + botão fechar)
│   ├── Catálogo (grid 5 colunas de ItemCards)
│   └── Carrinho
│       ├── Lista de itens (+/-/🗑)
│       ├── Preço Total + Peso Total
│       └── Botões de pagamento
└── ItemDetail (popup, Teleport to body)
```

### Comunicação NUI

**Client → Interface (postMessage):**

| Action | Payload | Descrição |
|--------|---------|-----------|
| `Open` | `{ Key, Name, Description, Mode, Type, ItemName, Items }` | Abre a loja |
| `Close` | — | Fecha o painel |

**Interface → Client (fetchNui):**

| Callback | Body | Retorno |
|----------|------|---------|
| `Close` | — | `{}` |
| `Checkout` | `{ Items: [{Item, Amount}], Payment }` | `{ Success: bool }` |
| `Theme` | — | `{ main, currency, shop, ...rarity }` (via resource `vrp`) |

### Tema

O tema vem do resource `vrp` via NUI `Theme`. Inclui:

- `main` — Cor principal (hex)
- `currency` — Símbolo da moeda (ex: `"$"`)
- `shop.buy` — Cor do botão de compra
- `shop.category` — Cor da aba ativa
- `shop.scribble` — Habilita/desabilita decoração do fundo
- `common/rare/epic/legendary/mythic` — Cores de raridade

---

## Notas Técnicas

- **Responsividade**: Escala via `font-size` no `:root` (9 faixas de 0.3rem a 1rem)
- **Scroll**: `::-webkit-scrollbar` customizado (4px, thumb na cor do tema)
- **Transições**: Padrão espelhado (bg aparece → painel aparece | painel some → bg some)
- **Carrinho persistente**: Salvo por loja (`savedCarts[shopKey]`), restaurado ao reabrir
- **Limite de itens**: `Max` (Item.lua) - `Current` (já carregado) = disponível para compra

import { defineStore, acceptHMRUpdate } from "pinia";

// ==================== NORMALIZAÇÃO DO PAYLOAD (LUA → INTERFACE) ====================
// O servidor envia { Name, Description, Mode, Type, Items = { { Item, Name, Price,
// Weight, Image, Max, Current } } } (gerado a partir da List em shared-side/shared.lua,
// com Image sendo o Index do item em vrp/config/Item.lua — servido em
// nui://vrp/config/inventory/ —, Weight o peso em kg por unidade, Max a quantidade
// máxima de manuseio do item (vrp/config/Item.lua) e Current quanto o jogador já
// carrega do item).
// A interface espera: name, description, mode, type e items = [ { key, name, price,
// weight, image, max, current } ].
export const normalizeItem = (item) => ({
  key: item.Item,
  name: item.Name,
  description: item.Description || "",
  type: item.Type || "Comum",
  price: item.Price,
  weight: item.Weight,
  image: item.Image,
  // Max = limite de manuseio do item (null = sem limite definido)
  max: item.Max || null,
  // Durability = durabilidade em horas (null = sem durabilidade)
  durability: item.Durability || null,
  // Current = quanto o jogador já carrega do item no momento da abertura
  current: item.Current || 0,
  // Rarity = raridade do item (vrp/config/Item.lua) — "normal" quando não
  // definida; controla o tint de fundo do card (cores do Theme na vrp).
  rarity: item.Rarity || "normal",
});

export const useShopStore = defineStore("shop", {
  state: () => ({
    name: "Loja",
    description: "",
    mode: "Buy",
    type: "Cash",
    // Lojas Consume trocam por um item (ex.: dirtydollar, ironfilings) — o nome
    // vem no payload para o botão de pagamento. Vazio para os demais tipos.
    itemName: "",
    // Peso atual e máximo do jogador (enviados pelo client no payload Open)
    weight: 0,
    maxWeight: 0,
    // Peso do item de troca (Consume) — usado para calcular peso líquido
    itemWeight: 0,
    // GlobalState.Blackout — quando true, pagamento via banco é desativado
    blackout: false,
    items: [],
    // Carrinho: { [key]: { key, name, price, image, rarity, amount } }
    cart: {},
    // Carrinhos salvos por loja (chave = Key do payload, que é a chave na List
    // do shared-side — ex.: "Departament", "Ammunation"). Ao reabrir a MESMA
    // loja (ex.: após uma compra que falhou por falta de dinheiro) o carrinho
    // dela é restaurado; trocar de loja mantém cada carrinho no seu lugar e uma
    // compra concluída com sucesso apaga o salvo daquela loja.
    savedCarts: {},
    // Loja aberta no momento (para saber de onde salvar/restaurar o carrinho)
    currentShop: null,
  }),
  getters: {
    cartList(state) {
      return Object.values(state.cart);
    },
    cartCount(state) {
      return Object.values(state.cart).reduce((total, entry) => total + entry.amount, 0);
    },
    cartTotal(state) {
      return Object.values(state.cart).reduce(
        (total, entry) => total + entry.price * entry.amount,
        0,
      );
    },
    // Peso total do carrinho (soma do peso de cada item × quantidade). Usa o
    // peso gravado na própria entrada do carrinho (fallback para o catálogo em
    // entradas antigas), então o total não depende do estado do catálogo.
    cartWeight(state) {
      const byKey = {};
      for (const entry of state.items) byKey[entry.key] = entry.weight;
      return Object.values(state.cart).reduce(
        (total, entry) => total + (entry.weight ?? byKey[entry.key] ?? 0) * entry.amount,
        0,
      );
    },
    // Limite de unidades de um item que cabem no carrinho: Max do item menos o
    // que o jogador já carrega. Infinity = sem limite definido.
    limitFor: (state) => (key) => {
      const item = state.items.find((entry) => entry.key === key);
      if (!item || !item.max) return Infinity;
      return Math.max(item.max - item.current, 0);
    },
    // Custo total do carrinho em unidades do item de troca (Consume)
    cartConsumeTotal(state) {
      return Object.values(state.cart).reduce(
        (total, entry) => total + entry.price * entry.amount,
        0,
      );
    },
    // Peso líquido: peso dos itens recebidos menos peso dos itens entregues
    // Em lojas Consume, o jogador entrega itemWeight × cartConsumeTotal
    cartNetWeight(state) {
      if (state.type !== "Consume" || !state.itemWeight) {
        return Object.values(state.cart).reduce(
          (total, entry) => total + (entry.weight ?? 0) * entry.amount,
          0,
        );
      }
      const received = Object.values(state.cart).reduce(
        (total, entry) => total + (entry.weight ?? 0) * entry.amount,
        0,
      );
      const given = state.itemWeight * state.cartConsumeTotal;
      return received - given;
    },
    // Se ainda é possível adicionar mais unidades do item ao carrinho
    // (considerando o que já está no carrinho).
    canAddMore: (state) => (key) => {
      const item = state.items.find((entry) => entry.key === key);
      if (!item || !item.max) return true;
      const inCart = (state.cart[key] && state.cart[key].amount) || 0;
      return inCart < Math.max(item.max - item.current, 0);
    },
  },
  actions: {
    setCatalog(catalog = {}) {
      // Identifica a loja pela chave na List (Key enviado pelo client). Mode no
      // payload é sempre "Buy"/"Sell" (modo da loja) — NÃO identifica a loja;
      // usar ele misturaria o carrinho de todas as lojas de compra. Falls back
      // para Name (único por loja) em payloads antigos.
      const shopKey = catalog.Key || catalog.Name || catalog.Mode || "";

      // Guarda o carrinho da loja anterior antes de trocar (mesmo vazio, para
      // sobrescrever um salvo antigo quando o jogador esvazia o carrinho), de
      // forma que cada loja mantenha o próprio carrinho ao reabrir.
      if (this.currentShop) {
        this.savedCarts[this.currentShop] = { ...this.cart };
      }

      // Restaura o carrinho salvo da loja sendo aberta (se existir). Compra
      // concluída com sucesso apaga o salvo, então a loja reabre vazia.
      const saved = shopKey && this.savedCarts[shopKey];
      this.cart = saved ? { ...saved } : {};

      this.currentShop = shopKey;

      this.name = catalog.Name || "Loja";
      this.description = catalog.Description || "";
      this.mode = catalog.Mode || "Buy";
      this.type = catalog.Type || "Cash";
      this.itemName = catalog.ItemName || "";
      this.weight = catalog.Weight || 0;
      this.maxWeight = catalog.MaxWeight || 0;
      this.itemWeight = catalog.ItemWeight || 0;
      this.blackout = catalog.Blackout || false;
      this.items = (catalog.Items || []).map(normalizeItem);

      // Garante que o carrinho restaurado respeite o limite do item: o jogador
      // pode ter adquirido mais unidades entre uma abertura e outra.
      for (const key of Object.keys(this.cart)) {
        const limit = this.limitFor(key);
        if (this.cart[key].amount > limit) {
          this.cart[key].amount = limit;
        }
        if (this.cart[key].amount <= 0) {
          delete this.cart[key];
        }
      }
    },
    addToCart(item) {
      if (!this.canAddMore(item.key)) return;

      const entry = this.cart[item.key];
      if (entry) {
        entry.amount += 1;
      } else {
        this.cart[item.key] = {
          key: item.key,
          name: item.name,
          price: item.price,
          weight: item.weight,
          image: item.image,
          rarity: item.rarity || "normal",
          amount: 1,
        };
      }
    },
    changeAmount(key, delta) {
      const entry = this.cart[key];
      if (!entry) return;

      if (delta > 0 && !this.canAddMore(key)) return;

      entry.amount += delta;
      if (entry.amount <= 0) {
        delete this.cart[key];
      }
    },
    removeFromCart(key) {
      delete this.cart[key];
    },
    // Compra concluída com sucesso: limpa o carrinho e apaga o salvo da loja
    // atual, para que a próxima abertura dela comece vazia.
    onPurchaseSuccess() {
      this.cart = {};
      if (this.currentShop) {
        delete this.savedCarts[this.currentShop];
      }
    },
  },
});

// HMR do Pinia: ao editar o store no dev, o Vite atualiza getters/ações sem
// perder o estado atual (carrinho/loja aberta). Sem isso, a instância antiga
// fica viva e getters novos (ex.: cartWeight) não existem nela até um reload
// completo — por isso o "Peso Total" parecia travado em "0 kg" no dev.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useShopStore, import.meta.hot));
}

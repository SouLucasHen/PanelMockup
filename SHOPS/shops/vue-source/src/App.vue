<!--
  Loja Hensa Studio — Painel NUI (FiveM)
  Feito por Hensa (Lucas Hen)
  Base Vue 3 + Tailwind + Pinia. O conteúdo é editado em src/views/Inicio.vue.
-->
<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useSettingsStore } from "@stores/settings";
import { useShopStore } from "@stores/shop";
import setTheme from "@utils/setTheme";
import loadTheme from "@utils/loadTheme";
import fetchNui from "@utils/fetchNui";
import formatPrice from "@utils/formatPrice";
import formatWeight from "@utils/formatWeight";
import itemImage from "@utils/itemImage";
import rarityStyle from "@utils/rarity";

import Inicio from "./views/Inicio.vue";
import ItemDetail from "@components/ItemDetail.vue";
import { playAdd, playRemove, playClick } from "@utils/sound";
import Cart from "@icons/Cart.vue";
import Gemstone from "@icons/Gemstone.vue";
import Plus from "@icons/Plus.vue";
import Minus from "@icons/Minus.vue";
import Trash from "@icons/Trash.vue";
import Swap from "@icons/Swap.vue";
import Scribble from "@icons/Scribble.vue";

const settings = useSettingsStore();
const shop = useShopStore();

// Em dev (navegador) o fundo usa o wallpaper simulando o mundo do jogo;
// no jogo (build) o fundo continua o overlay escuro sobre o mundo real.
const isDev = import.meta.env.DEV;

// ==================== POPUP DE DETALHES DO ITEM ====================
// Item selecionado para exibir no popup de detalhes (null = fechado).
const detailItem = ref(null);

const openDetail = (item) => {
  detailItem.value = item;
};

const closeDetail = () => {
  detailItem.value = null;
};

// ==================== SOM ====================
const handleAddToCart = (item) => {
  shop.addToCart(item);
  playAdd();
};

const handleChangeAmount = (key, delta) => {
  shop.changeAmount(key, delta);
  playClick();
};

const handleRemoveFromCart = (key) => {
  shop.removeFromCart(key);
  playRemove();
};

// ==================== PESO ====================
// Para Consume: usa peso líquido (recebido - entregue)
// Para Cash/Gemstone: usa peso bruto (só recebido)
const effectiveCartWeight = computed(() => shop.cartNetWeight);

const weightPercent = computed(() => {
  if (!shop.maxWeight) return 0;
  const total = shop.weight + effectiveCartWeight.value;
  return Math.min((total / shop.maxWeight) * 100, 100);
});

const weightCurrentPercent = computed(() => {
  if (!shop.maxWeight) return 0;
  return Math.min((shop.weight / shop.maxWeight) * 100, 100);
});

const weightCartPercent = computed(() => {
  if (!shop.maxWeight) return 0;
  const cart = effectiveCartWeight.value;
  if (cart < 0) {
    // Consume: mostra a redução de peso (barra vai para esquerda)
    return Math.min(Math.abs(cart) / shop.maxWeight * 100, weightCurrentPercent.value);
  }
  return Math.min(cart / shop.maxWeight * 100, 100 - weightCurrentPercent.value);
});

const isWeightWarning = computed(() => weightPercent.value >= 80);
const isWeightFull = computed(() => weightPercent.value >= 100);
const isOverWeight = computed(() => shop.maxWeight > 0 && (shop.weight + effectiveCartWeight.value) > shop.maxWeight);

const weightBarColor = computed(() => {
  if (isWeightFull.value) return "bg-red-500";
  if (isWeightWarning.value) return "bg-yellow-500";
  return "bg-main";
});

// Rabiscos (Scribble) e glows (círculos) do fundo — controlados pelo
// Theme.shop.scribble da vrp (vrp/config/Global.lua). false = só a cor de
// fundo, sem decoração.
const showDecor = ref(true);

// ==================== LOJA / FINALIZAR COMPRA ====================
// Callback NUI "Checkout" no client (client-side/core.lua) para compra,
// ou "Sell" para venda. O Payment é a forma de pagamento escolhida:
// "Cash" (dinheiro via TakeItem do dollar), "Bank" (vRP.PaymentBank),
// "Gems" (vRP.PaymentGems) ou "Item" (lojas Consume).
const handleCheckout = (payment) => {
  if (!shop.cartCount) return;

  const items = shop.cartList.map((entry) => ({
    Item: entry.key,
    Amount: entry.amount,
  }));

  const callback = shop.mode === "Sell" ? "Sell" : "Checkout";
  const payload = shop.mode === "Sell"
    ? { Items: items }
    : { Items: items, Payment: payment };

  fetchNui(callback, payload).then((result) => {
    const success = result === true || result?.Success === true;
    if (success) {
      shop.onPurchaseSuccess();
    }
  });
};

// Botões de pagamento/conclusão conforme o modo e tipo da loja.
// Sell → único botão "Vender". Buy → Cash = Dinheiro + Banco;
// Gemstone = Gemas; Consume = item de troca.
const checkoutButtons = computed(() => {
  if (shop.mode === "Sell") {
    return [{ payment: "Sell", label: "Vender" }];
  }

  if (shop.type === "Gemstone") {
    return [{ payment: "Gems", label: "Pagar com Gemas" }];
  }

  if (shop.type === "Consume") {
    return [{ payment: "Item", label: `Pagar com ${shop.itemName || "Item"}` }];
  }

  // Padrão (Cash): dinheiro sempre disponível
  const buttons = [
    { payment: "Cash", label: "Pagar com Dinheiro" },
  ];

  // Banco só aparece se não estiver em blackout
  if (!shop.blackout) {
    buttons.push({ payment: "Bank", label: "Pagar com Banco" });
  }

  return buttons;
});

// ==================== NUI / FECHAR ====================
// O painel fecha apenas pelo botão X do cabeçalho (ESC não fecha mais).
const closeNUI = () => {
  settings.display = false;
  fetchNui("Close");
};

// ==================== LISTENER DE MENSAGENS ====================
// Segue a convenção da HUD: o client envia { Action, Payload } (Lua),
// o mock envia { name, Payload } (dev no navegador).
const handleMessage = (event) => {
  const actionName = event.data.name || event.data.Action;
  const payload = event.data.Payload || event.data.data || {};

  if (actionName === "Open") {
    settings.display = true;
    shop.setCatalog(payload);
  } else if (actionName === "Close") {
    settings.display = false;
  } else if (actionName === "Gemstone") {
    settings.gemstone = payload;
  }
};

onMounted(async () => {
  const theme = document.body.getAttribute("theme");
  if (theme) setTheme(theme);

  // Tema vindo do resource "vrp" (mesmo padrão da HUD); o retorno traz
  // Theme.shop (cores dos botões + scribble) para controlar rabiscos/glows
  const themeData = await loadTheme();
  if (themeData?.shop?.scribble !== undefined) {
    showDecor.value = themeData.shop.scribble !== false;
  }
  // Símbolo da moeda vindo de Theme.currency (vrp/config/Global.lua).
  // Permite que o cliente mude o símbolo em um só lugar (Global.lua).
  if (themeData?.currency) {
    settings.currency = themeData.currency;
  }

  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
</script>

<template>
  <div>
    <!-- Wallpaper de cenário (teste no navegador): sempre visível em dev -->
    <div v-if="isDev" class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 size-full bg-wallpaper"></div>
    </div>

    <!-- Fundo externo (tela cheia): overlay escuro 95% visível (bg-from + gradiente
         bg-default), com os glows (círculos) e rabiscos por cima. -->
    <transition name="bg-fade">
      <div
        v-show="settings.display"
        class="fixed inset-0 bg-from opacity-[0.95] pointer-events-none overflow-hidden"
      >
        <div class="absolute inset-0 size-full bg-default">
          <template v-if="showDecor">
            <Scribble class="absolute -top-[25rem] -left-[17.5rem] w-[50rem] h-[50rem] opacity-5 text-main" />
            <div class="absolute -top-[34.5rem] -left-[30rem] w-[60rem] h-[60rem] opacity-40 bg-shadow-circle"></div>
            <Scribble class="absolute -top-[29.5rem] -left-[25rem] w-[50rem] h-[50rem] text-main" />
            <div class="absolute -top-[17.5rem] -left-[15.5rem] w-[60rem] h-[60rem] opacity-20 bg-shadow-circle"></div>
            <Scribble class="absolute -bottom-[14.5rem] -right-[12rem] w-[50rem] h-[50rem] opacity-5 text-main" />
            <div class="absolute -bottom-[15rem] -right-[8.25rem] w-[46rem] h-[45rem] opacity-40 bg-shadow-circle"></div>
            <Scribble class="absolute -bottom-[12.5rem] -right-[5.75rem] w-[36rem] h-[35rem] text-main" />
            <div class="absolute -bottom-[20.5rem] -right-[17.5rem] w-[60rem] h-[60rem] opacity-20 bg-shadow-circle"></div>
          </template>
        </div>
      </div>
    </transition>

    <!-- Painel Principal -->
    <transition name="fade" mode="out-in">
      <div
        v-show="settings.display"
        class="relative w-screen h-screen flex items-center justify-center bg-transparent"
      >
        <div class="relative w-[84rem] h-[50rem]">
          <!-- Modal do painel -->
          <div class="relative isolate rounded-2xl bg-neutral-950/85 shadow-2xl ring-1 ring-white/10 size-full flex flex-col overflow-hidden">
            <div class="absolute z-0 top-0 left-0 size-full bg-default pointer-events-none opacity-50"></div>

            <!-- Cabeçalho: nome da loja + descrição (Name/Description da config) -->
            <div class="relative z-20 flex items-center justify-between gap-6 px-8 pt-7 pb-6 border-b border-white/5">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-14 h-14 rounded-xl bg-main/15 ring-1 ring-main/15 flex items-center justify-center shrink-0">
                  <Cart class="w-7 h-7 text-main" />
                </div>
                <div class="flex flex-col min-w-0">
                  <p class="text-2xl font-semibold text-white leading-tight truncate uppercase">
                    {{ shop.name }}
                  </p>
                  <p class="text-sm text-white/50 leading-tight truncate">{{ shop.description || (shop.mode === 'Sell' ? 'VENDA OS ITENS DO SEU INVENTÁRIO' : 'COMPRE OS ITENS DISPONÍVEIS NESTA LOJA') }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <!-- Contador de gemas (só lojas Gemstone) -->
                <div
                  v-if="shop.type === 'Gemstone'"
                  class="flex items-center gap-2 h-10 px-3 rounded-md bg-white/5 ring-1 ring-white/10"
                >
                  <Gemstone class="w-4 h-4 text-[rgb(var(--common))] shrink-0" />
                  <span class="text-sm font-semibold text-white/80">{{ settings.gemstone.toLocaleString('pt-BR') }}</span>
                </div>

                <button
                  @click.stop="closeNUI()"
                  class="w-10 h-10 rounded-md bg-white/5 text-white/60 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white cursor-pointer flex items-center justify-center"
                  aria-label="Fechar painel"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Conteúdo: catálogo (esquerda) + carrinho (direita) -->
            <div class="flex-1 relative z-10 isolate flex flex-col overflow-hidden">
              <div class="flex-1 min-h-0 mx-6 mt-6 mb-6 flex gap-6">
                <!-- Catálogo: grade de itens -->
                <div class="flex-1 min-w-0 overflow-hidden rounded-md bg-main/10 ring-1 ring-main/15">
                  <div class="h-full min-h-0 overflow-x-hidden overflow-y-auto cards-scroll px-6 pt-6">
                    <Inicio @info="openDetail" @add="handleAddToCart" />
                  </div>
                </div>

                <!-- Carrinho + finalização -->
                <div class="flex w-[26rem] shrink-0 flex-col overflow-hidden rounded-md bg-main/10 ring-1 ring-main/15">
                <!-- Itens do carrinho -->
                <div class="flex-1 min-h-0 overflow-y-auto cards-scroll px-5 py-5">
                  <div v-if="shop.cartList.length" class="flex flex-col gap-3 pb-2">
                    <div
                      v-for="entry in shop.cartList"
                      :key="entry.key"
                      :style="rarityStyle(entry.rarity)"
                      class="flex items-center gap-3 rounded-md bg-white/[0.04] ring-1 ring-white/10 px-3 py-2.5"
                    >
                      <img :src="itemImage(entry.image)" :alt="entry.name" class="h-10 w-10 shrink-0 object-contain" />
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-white leading-tight">{{ entry.name }}</p>
                        <p class="flex items-center gap-1 text-xs font-medium text-white/60 leading-tight">
                          <template v-if="shop.type === 'Consume'">x{{ formatPrice(entry.price * entry.amount) }}</template>
                          <template v-else-if="shop.type === 'Gemstone'"><Gemstone class="w-2.5 h-2.5 shrink-0" /> {{ formatPrice(entry.price * entry.amount) }}</template>
                          <template v-else>{{ settings.currency }} {{ formatPrice(entry.price * entry.amount) }}</template>
                        </p>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0">
                        <button
                          @click="handleChangeAmount(entry.key, -1)"
                          class="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus class="h-3.5 w-3.5" />
                        </button>
                        <span class="w-6 text-center text-sm font-semibold text-white">{{ entry.amount }}</span>
                        <button
                          @click="handleChangeAmount(entry.key, 1)"
                          :disabled="!shop.canAddMore(entry.key)"
                          class="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white/5"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus class="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <button
                          @click="handleRemoveFromCart(entry.key)"
                          class="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 text-red-400 ring-1 ring-red-500/20 transition-colors hover:bg-red-500/20"
                          aria-label="Remover do carrinho"
                        >
                          <Trash class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Estado vazio -->
                  <div v-else class="flex size-full flex-col items-center justify-center gap-4 text-center">
                    <template v-if="shop.mode === 'Sell'">
                      <Swap class="h-10 w-10 text-white/40" />
                      <p class="text-white/50">Nenhum item selecionado para venda.</p>
                    </template>
                    <template v-else-if="shop.type === 'Consume'">
                      <Swap class="h-10 w-10 text-white/40" />
                      <p class="text-white/50">Nenhum item selecionado para troca.</p>
                    </template>
                    <template v-else>
                      <Cart class="h-10 w-10 text-white/40" />
                      <p class="text-white/50">Seu carrinho está vazio.</p>
                    </template>
                  </div>
                </div>

                <!-- Rodapé: preço total + botões de pagamento -->
                <div class="shrink-0 border-t border-white/5 px-5 py-5 flex flex-col gap-4">
                  <!-- Total -->
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold uppercase tracking-wide text-white/60">
                      {{ shop.mode === 'Sell' ? 'Ganho Total:' : shop.type === 'Consume' ? 'Consumo Total:' : 'Preço Total:' }}
                    </p>
                    <p class="flex items-center gap-1.5 text-xl font-bold text-white">
                      <template v-if="shop.mode === 'Sell' && shop.type === 'Consume'">x{{ formatPrice(shop.cartTotal) }} {{ shop.itemName }}</template>
                      <template v-else-if="shop.type === 'Consume'">x{{ formatPrice(shop.cartTotal) }}</template>
                      <template v-else-if="shop.type === 'Gemstone'"><Gemstone class="w-4 h-4 shrink-0" /> {{ formatPrice(shop.cartTotal) }}</template>
                      <template v-else>{{ settings.currency }} {{ formatPrice(shop.cartTotal) }}</template>
                    </p>
                  </div>
                  <!-- Item de troca / recebimento (Consume) -->
                  <div v-if="shop.type === 'Consume' && shop.itemName && shop.mode !== 'Sell'" class="-mt-2 flex items-center justify-between">
                    <p class="text-xs font-medium uppercase tracking-wide text-white/40">Item de troca</p>
                    <p class="text-xs font-semibold text-[rgb(var(--common))]">x{{ formatPrice(shop.cartTotal) }} {{ shop.itemName }}</p>
                  </div>
                  <!-- Peso: barra com 2 segmentos (atual + carrinho/liquido) -->
                  <div v-if="shop.maxWeight" class="-mt-2 flex flex-col gap-1.5">
                    <div class="flex items-center justify-between">
                      <p class="text-xs font-medium uppercase tracking-wide text-white/40">Peso</p>
                      <p class="text-xs font-semibold" :class="isWeightFull ? 'text-red-400' : isWeightWarning ? 'text-yellow-400' : 'text-white/80'">
                        {{ formatWeight(shop.weight) }}
                        <span v-if="effectiveCartWeight !== 0" :class="effectiveCartWeight > 0 ? 'text-[rgb(var(--common))]' : 'text-red-400'">
                          {{ effectiveCartWeight > 0 ? '+' : '' }} {{ formatWeight(effectiveCartWeight) }}
                        </span>
                        <span class="text-white/40"> / {{ formatWeight(shop.maxWeight) }}</span>
                      </p>
                    </div>
                    <div class="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <!-- Peso atual (verde escuro) -->
                      <div
                        class="absolute inset-y-0 left-0 rounded-full bg-main/30 transition-all duration-300"
                        :style="{ width: weightCurrentPercent + '%' }"
                      ></div>
                      <!-- Peso do carrinho (verde = ganho, vermelho = perda) -->
                      <div
                        v-if="effectiveCartWeight !== 0"
                        class="absolute inset-y-0 rounded-full transition-all duration-300"
                        :class="effectiveCartWeight > 0 ? weightBarColor : 'bg-red-500/60'"
                        :style="effectiveCartWeight > 0
                          ? { left: weightCurrentPercent + '%', width: weightCartPercent + '%' }
                          : { left: (weightCurrentPercent - weightCartPercent) + '%', width: weightCartPercent + '%' }"
                      ></div>
                    </div>
                  </div>
                  <!-- Fallback: só texto se não tiver maxWeight -->
                  <div v-else class="-mt-2 flex items-center justify-between">
                    <p class="text-xs font-medium uppercase tracking-wide text-white/40">Peso Total:</p>
                    <p class="text-sm font-semibold text-white/80">{{ formatWeight(shop.cartWeight) }}</p>
                  </div>

                  <!-- Botões conforme o tipo da loja: Cash = 2 lado a lado
                       (Dinheiro + Banco); Gemstone/Consume = 1 único -->
                  <div class="flex gap-3">
                    <button
                      v-for="btn in checkoutButtons"
                      :key="btn.payment"
                      @click="handleCheckout(btn.payment)"
                      :disabled="!shop.cartCount || isOverWeight"
                      :class="[
                        'flex-1 whitespace-nowrap rounded-md py-3 text-xs font-bold uppercase tracking-wide transition-colors',
                        shop.cartCount && !isOverWeight
                          ? (shop.mode === 'Sell' ? 'bg-shopSell hover:bg-shopSellHover text-white/90 cursor-pointer' : 'bg-shopBuy hover:bg-shopBuyHover text-white/90 cursor-pointer')
                          : (shop.mode === 'Sell' ? 'bg-shopSell/25 text-white/30 cursor-default' : 'bg-shopBuy/25 text-white/30 cursor-default'),
                      ]"
                    >
                      {{ btn.label }}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- Popup de detalhes do item (renderizado quando um item é selecionado) -->
    <ItemDetail v-if="detailItem" :item="detailItem" @close="closeDetail" />


  </div>
</template>

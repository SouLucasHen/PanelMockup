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
import Cart from "@icons/Cart.vue";
import Plus from "@icons/Plus.vue";
import Minus from "@icons/Minus.vue";
import Trash from "@icons/Trash.vue";
import Scribble from "@icons/Scribble.vue";

const settings = useSettingsStore();
const shop = useShopStore();

// Em dev (navegador) o fundo usa o wallpaper simulando o mundo do jogo;
// no jogo (build) o fundo continua o overlay escuro sobre o mundo real.
const isDev = import.meta.env.DEV;

// Rabiscos (Scribble) e glows (círculos) do fundo — controlados pelo
// Theme.shop.scribble da vrp (vrp/config/Global.lua). false = só a cor de
// fundo, sem decoração.
const showDecor = ref(true);

// ==================== LOJA / FINALIZAR COMPRA ====================
// Callback NUI "Checkout" no client (client-side/core.lua). O Payment é a
// forma de pagamento escolhida: "Cash" (dinheiro via TakeItem do dollar),
// "Bank" (vRP.PaymentBank), "Gems" (vRP.PaymentGems) ou "Item" (lojas
// Consume, que trocam por um item da loja — ex.: dirtydollar/ironfilings).
const handleCheckout = (payment) => {
  if (!shop.cartCount) return;

  const items = shop.cartList.map((entry) => ({
    Item: entry.key,
    Amount: entry.amount,
  }));

  fetchNui("Checkout", { Items: items, Payment: payment }).then((result) => {
    // Sucesso (true ou { Success = true }): limpa o carrinho (e o salvo da loja)
    // para a próxima abertura começar vazia; falha (ex.: dinheiro insuficiente)
    // mantém o carrinho, que é restaurado ao reabrir a mesma loja.
    const success = result === true || result?.Success === true;
    if (success) {
      shop.onPurchaseSuccess();
    }
  });
};

// Botões de pagamento conforme o tipo da loja (Type da List em shared-side).
// Cash → Dinheiro + Banco lado a lado; Gemstone → só Gemas; Consume → o item
// de troca da loja.
const checkoutButtons = computed(() => {
  if (shop.type === "Gemstone") {
    return [{ payment: "Gems", label: "Pagar com Gemas" }];
  }

  if (shop.type === "Consume") {
    return [{ payment: "Item", label: `Pagar com ${shop.itemName || "Item"}` }];
  }

  // Padrão (Cash e demais): dinheiro e banco lado a lado, mesma cor
  return [
    { payment: "Cash", label: "Pagar com Dinheiro" },
    { payment: "Bank", label: "Pagar com Banco" },
  ];
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
                  <p class="text-sm text-white/50 leading-tight truncate">{{ shop.description || "COMPRE OS ITENS DISPONÍVEIS NESTA LOJA" }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <button
                  @click.stop="closeNUI()"
                  class="w-10 h-10 rounded-md bg-neutral-800 text-white transition-colors hover:bg-neutral-700 cursor-pointer flex items-center justify-center"
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
                    <Inicio />
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
                        <p class="text-xs font-medium text-white/60 leading-tight">$ {{ formatPrice(entry.price * entry.amount) }}</p>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0">
                        <button
                          @click="shop.changeAmount(entry.key, -1)"
                          class="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus class="h-3.5 w-3.5" />
                        </button>
                        <span class="w-6 text-center text-sm font-semibold text-white">{{ entry.amount }}</span>
                        <button
                          @click="shop.changeAmount(entry.key, 1)"
                          :disabled="!shop.canAddMore(entry.key)"
                          class="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white/5"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus class="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <button
                          @click="shop.removeFromCart(entry.key)"
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
                    <Cart class="h-10 w-10 text-white/40" />
                    <p class="text-white/50">Seu carrinho está vazio.</p>
                  </div>
                </div>

                <!-- Rodapé: preço total + botões de pagamento -->
                <div class="shrink-0 border-t border-white/5 px-5 py-5 flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold uppercase tracking-wide text-white/60">Preço Total:</p>
                    <p class="text-xl font-bold text-white">$ {{ formatPrice(shop.cartTotal) }}</p>
                  </div>
                  <!-- Peso total do carrinho — linha menor, só informação (mesmo
                       padrão do Preço/Peso dos cards, onde o preço é o destaque) -->
                  <div class="-mt-2 flex items-center justify-between">
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
                      :disabled="!shop.cartCount"
                      :class="[
                        'flex-1 whitespace-nowrap rounded-md py-3 text-xs font-bold uppercase tracking-wide text-white transition-colors',
                        shop.cartCount
                          ? 'bg-shopBuy hover:bg-shopBuyHover cursor-pointer'
                          : 'bg-shopBuy/25 text-white/40 cursor-default',
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
  </div>
</template>

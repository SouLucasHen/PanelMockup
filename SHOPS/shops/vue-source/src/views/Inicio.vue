<script setup>
import { computed } from "vue";
import { useShopStore } from "@stores/shop";
import ItemCard from "@components/ItemCard.vue";

const shop = useShopStore();
const emit = defineEmits(["info", "add"]);

// Em Sell, mostra apenas itens que o jogador possui no inventário.
// Em Buy, mostra todos os itens do catálogo.
const visibleItems = computed(() => {
  if (shop.mode === "Sell") {
    return shop.items.filter((item) => item.current > 0);
  }
  return shop.items;
});
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <!-- Grade de itens da loja. O pb-6 garante respiro simétrico com o topo
         (pt-6 do container de scroll) mesmo em browsers que ignoram padding
         inferior de scroll. -->
    <div
      v-if="visibleItems.length"
      class="grid grid-cols-5 gap-3 pb-6"
    >
      <ItemCard v-for="item in visibleItems" :key="item.key" :item="item" @info="emit('info', $event)" @add="emit('add', $event)" />
    </div>

    <div v-else class="flex size-full flex-col items-center justify-center gap-4 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-10 w-10 text-white/50">
        <circle cx="12" cy="12" r="9" />
        <path d="m4.5 4.5 15 15" />
      </svg>
      <p class="text-white/50">
        {{ shop.mode === 'Sell' ? 'Você não possui itens para vender nesta loja.' : 'Nenhum item disponível nesta loja.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useShopStore } from "@stores/shop";
import itemImage from "@utils/itemImage";
import formatPrice from "@utils/formatPrice";
import formatWeight from "@utils/formatWeight";
import rarityStyle from "@utils/rarity";
import Plus from "@icons/Plus.vue";

const props = defineProps({
  item: { type: Object, required: true },
});

const shop = useShopStore();

const addToCart = () => {
  shop.addToCart(props.item);
};

// ==================== RARIDADE (tint de fundo) ====================
// Mesmo padrão do carrinho (utils/rarity): tint no fundo do card usando as
// cores de raridade do Theme da vrp, contido por padding-box para a borda
// de 1px ficar sempre uniforme. A intensidade cresce com a raridade.
const cardStyle = computed(() => rarityStyle(props.item.rarity));
</script>

<template>
  <!-- Card no padrão do inventário, com ritmo vertical uniforme (gap-3) e
       hierarquia consistente de fontes: 0.75rem para conteúdo (nome/valores)
       e 0.625rem para rótulos. Topo equilibrado (nome à esquerda, badge à
       direita), imagem central maior com respiro e, na base, o segundo
       background mais escuro com Preço/Peso. -->
  <div
    :style="cardStyle"
    class="group relative flex w-full flex-col items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] p-2.5 transition-all duration-200 hover:border-main/60 hover:bg-white/[0.04]"
  >
    <!-- Topo: nome do item à esquerda + badge verde (adicionar) à direita -->
    <div class="flex w-full items-center justify-between gap-2">
      <p class="min-w-0 truncate text-left text-[0.75rem] font-semibold leading-tight text-white">
        {{ item.name }}
      </p>
      <button
        @click="addToCart"
        :disabled="!shop.canAddMore(item.key)"
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.25rem] bg-main text-white transition-colors hover:bg-mainHover disabled:cursor-default disabled:bg-main/25 disabled:hover:bg-main/25"
        aria-label="Adicionar ao carrinho"
      >
        <Plus class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Imagem central: ocupa a maior parte do slot -->
    <img
      :src="itemImage(item.image)"
      :alt="item.name"
      class="w-[62%] shrink-0 aspect-square object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
    />

    <!-- Segundo background (mais escuro): Preço | valor e Peso | peso. O
         limite de manuseio (Max em vrp/config/Item.lua) não é exibido — ele
         apenas trava o botão de adicionar quando o carrinho atinge o máximo. -->
    <div class="mt-auto flex w-full flex-col gap-2 rounded-md bg-black/30 p-2.5 ring-1 ring-white/10">
      <div class="flex items-center justify-between gap-2">
        <span class="shrink-0 text-[0.625rem] font-medium uppercase leading-none tracking-wide text-white/50">Preço</span>
        <span class="min-w-0 truncate text-[0.75rem] font-semibold leading-tight text-[rgb(var(--common))]">$ {{ formatPrice(item.price) }}</span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="shrink-0 text-[0.625rem] font-medium uppercase leading-none tracking-wide text-white/50">Peso</span>
        <span class="min-w-0 truncate text-[0.75rem] font-semibold leading-tight text-white">{{ formatWeight(item.weight) }}</span>
      </div>
    </div>
  </div>
</template>

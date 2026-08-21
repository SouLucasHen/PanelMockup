<script setup>
import { computed } from "vue";
import { useShopStore } from "@stores/shop";
import { useSettingsStore } from "@stores/settings";
import itemImage from "@utils/itemImage";
import formatPrice from "@utils/formatPrice";
import rarityStyle from "@utils/rarity";
import Cart from "@icons/Cart.vue";
import Swap from "@icons/Swap.vue";
import Gemstone from "@icons/Gemstone.vue";
import Info from "@icons/Info.vue";

const props = defineProps({
  item: { type: Object, required: true },
});

const shop = useShopStore();
const settings = useSettingsStore();

// ==================== POPUP DE DETALHES ====================
// Abre o popup de informações do item no catálogo.
const emit = defineEmits(["info", "add"]);

const openInfo = () => {
  emit("info", props.item);
};

const handleAdd = () => {
  emit("add", props.item);
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
    class="group relative flex w-full flex-col items-center gap-3 rounded-md ring-1 ring-white/10 bg-white/[0.02] p-2.5 transition-all duration-200 hover:ring-main/60 hover:bg-white/[0.04]"
  >
    <!-- Topo: nome do item -->
    <p class="w-full min-w-0 truncate text-left text-[0.75rem] font-semibold leading-tight text-white">
      {{ item.name }}
    </p>

    <!-- Imagem central: ocupa a maior parte do slot -->
    <img
      :src="itemImage(item.image)"
      :alt="item.name"
      class="w-[62%] shrink-0 aspect-square object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
    />

    <!-- Base: botões (esquerda) + preço (direita) -->
    <div class="mt-auto flex w-full items-center justify-between">
      <div class="flex items-center gap-1.5">
        <!-- Detalhes -->
        <button
          @click="openInfo"
          class="flex h-7 w-7 items-center justify-center rounded-[0.25rem] bg-white/10 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Ver detalhes do item"
        >
          <Info class="h-3.5 w-3.5" />
        </button>

        <!-- Adicionar ao carrinho / trocar -->
        <button
          @click="handleAdd"
          :disabled="!shop.canAddMore(item.key)"
          class="flex h-7 w-7 items-center justify-center rounded-[0.25rem] bg-shopBuy text-white transition-colors hover:bg-shopBuyHover disabled:cursor-default disabled:bg-shopBuy/25 disabled:hover:bg-shopBuy/25"
          :aria-label="shop.type === 'Consume' ? 'Adicionar para troca' : 'Adicionar ao carrinho'"
        >
          <Swap v-if="shop.type === 'Consume'" class="h-3.5 w-3.5" />
          <Cart v-else class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Preço -->
      <span class="flex items-center gap-1 text-[0.75rem] font-semibold text-[rgb(var(--common))] truncate">
        <template v-if="shop.type === 'Consume'">x{{ formatPrice(item.price) }}</template>
        <template v-else-if="shop.type === 'Gemstone'"><Gemstone class="w-3 h-3 shrink-0 text-[rgb(var(--common))]" /> {{ formatPrice(item.price) }}</template>
        <template v-else>{{ settings.currency }} {{ formatPrice(item.price) }}</template>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import itemImage from "@utils/itemImage";
import formatWeight from "@utils/formatWeight";
import rarityStyle from "@utils/rarity";

const props = defineProps({
  item: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

// ==================== ANIMAÇÃO (padrão dynamic) ====================
const visible = ref(false);

function handleKeydown(e) {
  if (e.key === "Escape") close();
}

function close() {
  visible.value = false;
  setTimeout(() => emit("close"), 300);
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  nextTick(() => { visible.value = true; });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

// ==================== DADOS DO ITEM ====================
const rarityLabel = computed(() => {
  const labels = {
    common: "Comum",
    rare: "Raro",
    epic: "Épico",
    legendary: "Lendário",
    mythic: "Mítico",
  };
  return labels[props.item?.rarity] || "Normal";
});

const rarityColor = computed(() => {
  const colors = {
    common: "text-[rgb(var(--rarityCommon))]",
    rare: "text-[rgb(var(--rarityRare))]",
    epic: "text-[rgb(var(--rarityEpic))]",
    legendary: "text-[rgb(var(--rarityLegendary))]",
    mythic: "text-[rgb(var(--rarityMythic))]",
  };
  return colors[props.item?.rarity] || "text-white/60";
});

const cardStyle = computed(() => rarityStyle(props.item?.rarity));

const hasDurability = computed(() => props.item?.durability && props.item.durability > 0);
const hasMax = computed(() => props.item?.max && props.item.max > 0);
const hasWeight = computed(() => props.item?.weight > 0);
const hasDescription = computed(() => props.item?.description && props.item.description.length > 0);
const hasStats = computed(() => hasWeight.value || hasDurability.value || hasMax.value);

// ==================== PARSE DA DESCRIÇÃO ====================
function parseDesc(text) {
  if (!text) return "";
  const tagMap = {
    common: "rgb(var(--rarityCommon))",
    rare: "rgb(var(--rarityRare))",
    epic: "rgb(var(--rarityEpic))",
    legendary: "rgb(var(--rarityLegendary))",
    mythic: "rgb(var(--rarityMythic))",
  };
  let result = text;
  for (const [tag, color] of Object.entries(tagMap)) {
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, "gi");
    result = result.replace(regex, `<span style="color:${color};font-weight:600">$1</span>`);
  }
  return result;
}
</script>

<template>
  <Teleport to="body">
    <!-- Background overlay -->
    <transition name="modal-bg">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999]"
        style="background: linear-gradient(to top, rgb(var(--from) / 0.7), rgb(var(--from) / 0.4) 50%, rgb(var(--from) / 0.7))"
        @click.self="close"
      />
    </transition>

    <!-- Modal card -->
    <transition name="modal-panel">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-6"
      >
        <div
          :style="cardStyle"
          class="bg-from rounded-xl ring-1 ring-white/10 shadow-2xl w-[30rem] overflow-hidden pointer-events-auto flex flex-col"
          @click.self="close"
        >
          <!-- Header: título + fechar -->
          <div class="flex items-center justify-between px-6 py-5">
            <div class="flex-1 min-w-0 pr-4">
              <h2 class="font-semibold text-white text-lg truncate">{{ item.name }}</h2>
              <div class="flex items-center gap-2 mt-0.5">
                <span :class="[rarityColor, 'text-xs font-bold uppercase tracking-wider']">{{ rarityLabel }}</span>
                <span class="text-white/20">·</span>
                <span class="text-xs font-medium uppercase tracking-wider text-white/40">{{ item.type }}</span>
              </div>
            </div>
            <button
              class="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 text-white/60 ring-1 ring-white/10 flex items-center justify-center transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              @click="close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <!-- Conteúdo -->
          <div class="px-6 pb-6">
            <div class="flex gap-5 rounded-lg p-4" style="background: rgb(var(--main) / 0.08)">
              <!-- Imagem -->
              <img
                :src="itemImage(item.image)"
                :alt="item.name"
                class="shrink-0 w-24 h-24 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] rounded"
              />

              <!-- Info -->
              <div class="flex-1 min-w-0 flex flex-col gap-2.5">
                <!-- Descrição -->
                <p
                  v-if="hasDescription"
                  class="text-xs text-white/50 leading-relaxed"
                  v-html="parseDesc(item.description)"
                ></p>

                <!-- Stats (só aparece se existir algum) -->
                <template v-if="hasStats">
                  <div class="border-t border-white/5"></div>
                  <div class="grid grid-cols-2 gap-x-5 gap-y-2">
                    <div v-if="hasWeight" class="flex items-center justify-between gap-1">
                      <span class="text-[0.625rem] font-medium uppercase tracking-wide text-white/40">Peso</span>
                      <span class="text-xs font-semibold text-white/80">{{ formatWeight(item.weight) }}</span>
                    </div>
                    <div v-if="hasDurability" class="flex items-center justify-between gap-1">
                      <span class="text-[0.625rem] font-medium uppercase tracking-wide text-white/40">Durabilidade</span>
                      <span class="text-xs font-semibold text-white/80">{{ item.durability }}h</span>
                    </div>
                    <div v-if="hasMax" class="flex items-center justify-between gap-1">
                      <span class="text-[0.625rem] font-medium uppercase tracking-wide text-white/40">Máximo</span>
                      <span class="text-xs font-semibold text-white/80">{{ item.max }}x</span>
                    </div>
                    <div v-if="hasMax" class="flex items-center justify-between gap-1">
                      <span class="text-[0.625rem] font-medium uppercase tracking-wide text-white/40">Restante</span>
                      <span class="text-xs font-semibold text-white/80">{{ Math.max(item.max - item.current, 0) }}x</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-bg-enter-active {
  transition: opacity 0.3s ease;
}
.modal-bg-leave-active {
  transition: opacity 0.3s ease 0.2s;
}
.modal-bg-enter-from,
.modal-bg-leave-to {
  opacity: 0;
}

.modal-panel-enter-active {
  transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s;
}
.modal-panel-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

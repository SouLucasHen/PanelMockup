<script setup>
import { ref, nextTick } from "vue";

/**
 * Tooltip estilizado (combina com o layout do painel).
 * Envolve qualquer conteúdo e mostra o texto ao passar o mouse/focar,
 * posicionado acima ou abaixo do gatilho via Teleport (nunca é cortado
 * por overflow-hidden do container).
 */
const props = defineProps({
  text: { type: String, default: "" },
  position: { type: String, default: "above" }, // "above" | "below"
});

const visible = ref(false);
const triggerEl = ref(null);
const tipEl = ref(null);
const coords = ref({ left: 0, top: 0 });

const show = async () => {
  if (!props.text) return;
  visible.value = true;
  await nextTick();
  if (!triggerEl.value || !tipEl.value) return;

  const tr = triggerEl.value.getBoundingClientRect();
  const tt = tipEl.value.getBoundingClientRect();
  const gap = 8;

  let left = tr.left + tr.width / 2 - tt.width / 2;
  left = Math.max(4, Math.min(left, window.innerWidth - tt.width - 4));

  let top;
  if (props.position === "below") {
    top = tr.bottom + gap;
  } else {
    top = tr.top - tt.height - gap;
  }

  coords.value = { left, top };
};

const hide = () => {
  visible.value = false;
};
</script>

<template>
  <span
    ref="triggerEl"
    class="inline-flex"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible"
        ref="tipEl"
        class="tooltip"
        :class="position === 'below' ? 'tooltip--below' : 'tooltip--above'"
        :style="{ left: coords.left + 'px', top: coords.top + 'px' }"
      >
        {{ text }}
      </div>
    </Transition>
  </Teleport>
</template>

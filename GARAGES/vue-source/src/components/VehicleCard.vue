<script setup>
import { useGarageStore } from "@stores/garage";
import fetchNui from "@utils/fetchNui";

const props = defineProps({
  vehicle: { type: Object, required: true },
});

const garage = useGarageStore();

// Ações do card — chamam os callbacks NUI do client (client-side/core.lua):
//   Tax → garages:Tax | Sell → garages:Sell | Transfer → garages:Transfer
const handleAction = (method) => {
  if (!props.vehicle.model) return;
  fetchNui(method, { Model: props.vehicle.model });
};
</script>

<template>
  <div
    @click.stop="garage.toggleVehicle(vehicle.id)"
    :class="[
      'flex cursor-pointer gap-6 rounded-md p-5 ring-1 transition-all duration-200',
      garage.selectedVehicleId === vehicle.id
        ? 'bg-main/10 ring-main/30'
        : 'bg-main/5 ring-main/10 hover:bg-main/10 hover:ring-main/20',
    ]"
  >
    <!-- Coluna esquerda: nome, informações e ações -->
    <div class="flex min-w-0 flex-1 flex-col justify-between gap-5">
      <div class="flex flex-col gap-2">
        <p class="truncate text-lg font-bold text-white">{{ vehicle.name }}</p>

        <!-- Baú e Taxa separados, com wrap para números grandes -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p class="text-xs text-white/40">
            Baú: <span class="font-medium text-white/60">{{ vehicle.trunk }}</span>
          </p>
          <p class="text-xs text-white/40">
            Taxa: <span class="font-medium text-white/60">{{ vehicle.fee }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          title="Taxas"
          aria-label="Taxas"
          :disabled="vehicle.taxPaid"
          @click.stop="handleAction('Tax')"
          class="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white/40 transition-colors disabled:cursor-default disabled:opacity-40 hover:enabled:bg-white/10 hover:enabled:text-white/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <rect width="20" height="12" x="2" y="6" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        </button>
        <button
          title="Vender"
          aria-label="Vender"
          @click.stop="handleAction('Sell')"
          class="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
        </button>
        <button
          title="Transferir"
          aria-label="Transferir"
          @click.stop="handleAction('Transfer')"
          class="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M8 3 4 7l4 4" />
            <path d="M4 7h16" />
            <path d="m16 21 4-4-4-4" />
            <path d="M20 17H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Divisor -->
    <div class="w-px bg-white/10"></div>

    <!-- Coluna direita: status -->
    <div class="flex w-40 shrink-0 flex-col justify-between gap-3">
      <div v-for="(value, key) in vehicle.stats" :key="key" class="flex shrink-0 flex-col gap-1.5">
        <span class="shrink-0 text-[0.7rem] font-semibold uppercase tracking-wide text-white/50">{{ key }}</span>
        <div class="relative h-1 w-full shrink-0 overflow-hidden rounded-full bg-white/10">
          <div class="absolute inset-y-0 left-0 rounded-full bg-main" :style="{ width: value + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

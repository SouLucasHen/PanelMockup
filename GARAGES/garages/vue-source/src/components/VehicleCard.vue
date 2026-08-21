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

// Rótulos dos status (mesma ordem da imagem de referência)
const statusLabels = {
  motor: "Motor",
  lataria: "Lataria",
  chassi: "Chassi",
  gasolina: "Gasolina",
};

// Em veículos elétricos o status de gasolina vira "Bateria" (mesmo padrão da HUD)
const statusLabel = (key) => {
  if (key === "gasolina" && props.vehicle.electric) return "Bateria";
  return statusLabels[key] || key;
};
</script>

<template>
  <div
    @click.stop="garage.toggleVehicle(vehicle.id)"
    :class="[
      'flex w-full items-center justify-between gap-4 rounded-md px-5 py-4 ring-1 transition-all duration-200',
      garage.selectedVehicleId === vehicle.id
        ? 'bg-main/10 ring-main/30'
        : 'bg-white/[0.03] ring-white/10 hover:bg-white/[0.06] hover:ring-white/20',
    ]"
  >
    <!-- Veículo de serviço NÃO adquirido: nome + selo SERVIÇO abaixo (mesma posição dos
         cards normais) à esquerda, aviso em pill laranja de uma linha à direita.
         Os demais veículos (incluindo serviços adquiridos) seguem no layout de 4 partes. -->
    <div v-if="vehicle.work && !vehicle.owned" class="flex w-full items-center justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-1.5">
        <p class="min-w-0 truncate text-lg font-semibold leading-tight text-white">{{ vehicle.name }}</p>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex shrink-0 items-center justify-center rounded-md bg-main/15 px-2 py-0.5 text-xs font-semibold leading-none uppercase tracking-wide text-main ring-1 ring-main/25"
          >
            Serviço
          </span>
          <span v-if="vehicle.weight > 0" class="shrink-0 text-xs text-white/50">{{ vehicle.weight }} kg</span>
        </div>
      </div>
      <div
        class="flex max-w-[36rem] shrink-0 items-center justify-center gap-2 rounded-md bg-garageMechanic/25 px-4 py-2 ring-1 ring-garageMechanic/40"
        title="Você ainda não possui este veículo. Retire-o para adicioná-lo à sua garagem."
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 shrink-0 text-garageMechanic"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span class="min-w-0 truncate text-xs text-garageMechanic">
          Você ainda não possui este veículo. Retire-o para adicioná-lo à sua garagem.
        </span>
      </div>
    </div>

    <template v-else>
      <!-- 1ª parte: informações do veículo (largura fixa — nome trunca) -->
      <div class="flex w-64 shrink-0 flex-col gap-1.5">
      <p class="min-w-0 truncate text-lg font-semibold leading-tight text-white">{{ vehicle.name }}</p>
      <div class="flex items-center gap-2">
        <!-- Selos de situação (Serviço verde / Alugado amarelo) ao lado da placa.
             inline-flex + items-center/justify-center mantém o texto centralizado
             no pill (vertical e horizontal), mesmo com uppercase/tracking. -->
        <span
          v-if="vehicle.work"
          class="inline-flex shrink-0 items-center justify-center rounded-md bg-main/15 px-2 py-0.5 text-xs font-semibold leading-none uppercase tracking-wide text-main ring-1 ring-main/25"
        >
          Serviço
        </span>
        <span
          v-if="vehicle.rented"
          class="inline-flex shrink-0 items-center justify-center rounded-md bg-yellow-400/15 px-2 py-0.5 text-xs font-semibold leading-none uppercase tracking-wide text-yellow-400 ring-1 ring-yellow-400/25"
        >
          Alugado
        </span>          <span
          v-if="vehicle.plate"
          class="inline-flex shrink-0 items-center justify-center rounded-md bg-white/5 px-2.5 py-1 font-mono text-xs leading-none tracking-wide text-white/70 ring-1 ring-white/10"
          >
          {{ vehicle.plate }}
        </span>
        <!-- Só mostra o peso quando o veículo tem porta-malas (peso > 0) -->
        <span v-if="vehicle.weight > 0" class="shrink-0 text-xs text-white/50">{{ vehicle.weight }} kg</span>
      </div>
    </div>

    <!-- 2ª parte: status do veículo (largura fixa) -->
    <div class="flex shrink-0 items-center gap-2">
      <div
        v-for="(value, key) in vehicle.stats"
        :key="key"
        class="flex w-20 flex-col items-center gap-1 rounded-md bg-white/5 py-2.5 ring-1 ring-white/10"
      >
        <span class="text-base font-semibold leading-none text-white">{{ value }}%</span>
        <span class="text-xs uppercase tracking-wide text-white/50">{{ statusLabel(key) }}</span>
      </div>
    </div>

    <!-- 3ª parte: tempo de taxa (largura fixa — texto trunca, tooltip mostra o completo) -->
    <div class="flex w-72 shrink-0 items-center justify-center">
      <div
        :class="[
          'flex max-w-full items-center justify-center gap-2 rounded-md px-4 py-2 ring-1',
          vehicle.time ? 'bg-main/25 ring-main/40' : 'bg-red-500/20 ring-red-500/35',
        ]"
        :title="vehicle.time || 'Taxa vencida'"
      >
        <svg
          v-if="vehicle.time"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 shrink-0 text-main"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span
          :class="[
            'min-w-0 truncate text-xs',
            vehicle.time ? 'text-main' : 'text-red-400',
          ]"
        >
          {{ vehicle.time || 'Taxa vencida' }}
        </span>
      </div>
    </div>

    <!-- 4ª parte: botões (zona fixa — botões ancorados à direita, sempre no mesmo lugar) -->
    <div class="flex w-[8.5rem] shrink-0 items-center justify-end gap-2">
      <button
        v-if="!vehicle.work"
        title="Transferir"
        aria-label="Transferir"
        @click.stop="handleAction('Transfer')"
        class="flex h-10 w-10 items-center justify-center rounded-md bg-garageGet/15 text-garageGet ring-1 ring-garageGet/25 transition-colors hover:bg-garageGet/25"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <path d="M8 3 4 7l4 4" />
          <path d="M4 7h16" />
          <path d="m16 21 4-4-4-4" />
          <path d="M20 17H4" />
        </svg>
      </button>
      <button
        v-if="!vehicle.taxPaid"
        title="Taxas"
        aria-label="Taxas"
        @click.stop="handleAction('Tax')"
        class="flex h-10 w-10 items-center justify-center rounded-md bg-garageSave/15 text-garageSave ring-1 ring-garageSave/25 transition-colors hover:bg-garageSave/25"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      </button>
      <button
        title="Vender"
        aria-label="Vender"
        @click.stop="handleAction('Sell')"
        class="flex h-10 w-10 items-center justify-center rounded-md bg-garageSell/15 text-garageSell ring-1 ring-garageSell/25 transition-colors hover:bg-garageSell/25"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
      </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGarageStore } from "@stores/garage";
import VehicleCard from "@components/VehicleCard.vue";

const garage = useGarageStore();

// Lista filtrada pela barra de pesquisa (busca por nome ou modelo).
const vehicles = computed(() => garage.filteredVehicles);
</script>

<template>
  <div class="h-full w-full">
    <!-- Cards de veículos: largura total do modal, um abaixo do outro.
         O pb-6 garante respiro simétrico com o topo (pt-6 do container de
         scroll) mesmo em browsers que ignoram padding inferior de scroll. -->
    <div v-if="vehicles.length" class="flex flex-col gap-4 pb-6">
      <VehicleCard
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :vehicle="vehicle"
      />
    </div>

    <!-- Estado vazio -->
    <div v-else class="flex size-full flex-col items-center justify-center gap-4 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-10 w-10 text-white/50">
        <circle cx="12" cy="12" r="9" />
        <path d="m4.5 4.5 15 15" />
      </svg>
      <p class="text-white/50">Nenhum veículo guardado aqui.</p>
    </div>
  </div>
</template>

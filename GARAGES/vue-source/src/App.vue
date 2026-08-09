<!--
  Garagem Hensa Studio — Painel NUI (FiveM)
  Feito por Hensa (Lucas Hen)
  Base Vue 3 + Tailwind + Pinia. O conteúdo é editado em src/views/Inicio.vue.
-->
<script setup>
import { onMounted, onUnmounted } from "vue";
import { useSettingsStore } from "@stores/settings";
import { usePlayerStore } from "@stores/player";
import { useGarageStore } from "@stores/garage";
import setTheme from "@utils/setTheme";
import loadTheme from "@utils/loadTheme";
import fetchNui from "@utils/fetchNui";

import Inicio from "./views/Inicio.vue";
import Car from "@icons/Car.vue";
import Home from "@icons/Home.vue";

const settings = useSettingsStore();
const player = usePlayerStore();
const garage = useGarageStore();

// ==================== GARAGEM / PEGAR VEÍCULO ====================
// Callback NUI "Spawn" no client (client-side/core.lua).
const handlePegarVeiculo = () => {
  const vehicle = garage.selectedVehicle;
  if (!vehicle || !vehicle.model) return;
  fetchNui("Spawn", { Model: vehicle.model });
};

// ==================== GARAGEM / GUARDAR VEÍCULO ====================
// Callback NUI "Delete" no client: salva e remove o veículo mais próximo.
const handleGuardarVeiculo = () => {
  fetchNui("Delete");
};

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
    player.playerName = payload.PlayerName || payload.playerName || "Jogador";
    player.avatar = payload.Avatar || payload.avatar || "";
    // O client envia { Action = "Open", Payload = Vehicles } com Payload sendo
    // o array de veículos direto (client-side/core.lua). Aceita também o
    // formato { Payload = { Vehicles = [...] } } para compatibilidade.
    const vehicles = Array.isArray(payload) ? payload : payload.Vehicles || payload.vehicles || [];
    garage.setVehicles(vehicles);
  } else if (actionName === "Close") {
    settings.display = false;
  }
};

onMounted(() => {
  const theme = document.body.getAttribute("theme");
  if (theme) setTheme(theme);

  // Tema vindo do resource "vrp" (mesmo padrão da HUD)
  loadTheme();

  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
</script>

<template>
  <div>
    <!-- Fundo externo (tela cheia): idêntico ao interior do modal, 95% visível (leve transparência), com transição própria de aparecer/sumir -->
    <transition name="bg-fade">
      <div
        v-show="settings.display"
        class="fixed inset-0 bg-from opacity-[0.95] pointer-events-none overflow-hidden"
      >
        <div class="absolute inset-0 size-full bg-default">
          <div class="absolute -top-[34.5rem] -left-[30rem] w-[60rem] h-[60rem] opacity-40 bg-shadow-circle"></div>
          <div class="absolute -top-[17.5rem] -left-[15.5rem] w-[60rem] h-[60rem] opacity-20 bg-shadow-circle"></div>
          <div class="absolute -bottom-[15rem] -right-[8.25rem] w-[46rem] h-[45rem] opacity-40 bg-shadow-circle"></div>
          <div class="absolute -bottom-[20.5rem] -right-[17.5rem] w-[60rem] h-[60rem] opacity-20 bg-shadow-circle"></div>
        </div>
      </div>
    </transition>

    <!-- Painel Principal -->
    <transition name="fade" mode="out-in">
      <div
        v-show="settings.display"
        class="relative w-screen h-screen flex items-center justify-center bg-transparent"
        @click="garage.deselectVehicle()"
      >
        <div class="relative w-[80rem] h-[52rem]">
          <!-- Modal do painel -->
          <div class="relative rounded-2xl bg-neutral-950/95 shadow-2xl ring-1 ring-white/10 size-full flex flex-col overflow-hidden">
            <div class="absolute z-0 top-0 left-0 size-full bg-default pointer-events-none opacity-50">
              <!-- Sem círculos dentro do modal: só o fundo gradiente (os círculos
                   externos, atrás do modal, continuam intactos) -->
            </div>

            <!-- Cabeçalho do painel (estilo do modal de garagem) -->
            <div class="relative z-10 flex items-center justify-between gap-6 px-8 pt-7 pb-6 border-b border-white/5">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-14 h-14 rounded-xl bg-main/15 ring-1 ring-main/15 flex items-center justify-center shrink-0">
                  <Car class="w-7 h-7 text-main" />
                </div>
                <div class="flex flex-col min-w-0">
                  <p class="text-2xl font-extrabold tracking-wide text-white leading-tight truncate">GARAGEM</p>
                  <p class="text-sm text-white/40 leading-tight truncate">GERENCIE OS VEÍCULOS GUARDADOS NESTE PONTO</p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <button
                  v-if="garage.vehicles.length"
                  @click.stop="handlePegarVeiculo"
                  :disabled="!garage.selectedVehicle"
                  :class="[
                    'flex items-center gap-2.5 rounded-md px-4 py-2.5 transition-all',
                    garage.selectedVehicle
                      ? 'bg-main/20 text-main hover:bg-main/30 cursor-pointer'
                      : 'bg-main/15 text-main/40 cursor-default',
                  ]"
                >
                  <Car class="w-5 h-5 min-w-max" />
                  <span class="text-sm font-semibold">Pegar Veículo</span>
                </button>
                <button
                  @click.stop="handleGuardarVeiculo"
                  class="flex items-center gap-2.5 rounded-md px-4 py-2.5 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                >
                  <Home class="w-5 h-5 min-w-max" />
                  <span class="text-sm font-semibold">Guardar Veículo</span>
                </button>
                <button
                  @click.stop="closeNUI()"
                  class="w-10 h-10 rounded-md bg-white/5 text-white transition-colors hover:bg-white/10 cursor-pointer flex items-center justify-center"
                  aria-label="Fechar painel"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Barra de pesquisa (acima do conteúdo) — só aparece quando a garagem tem veículos -->
            <div
              v-if="garage.vehicles.length"
              class="relative z-10 mx-6 mt-6 overflow-hidden rounded-md bg-main/10 ring-1 ring-main/15 flex flex-col gap-2 px-6 py-4"
            >
              <label for="search-vehicle" class="text-xs font-semibold uppercase tracking-wider text-white/40">
                Pesquisar veículo
              </label>
              <input
                id="search-vehicle"
                v-model="garage.search"
                type="text"
                placeholder="Digite o nome do veículo..."
                class="h-12 w-full rounded-md bg-white/5 px-4 text-sm text-white ring-1 ring-white/5 placeholder:text-white/30 transition-colors focus:bg-white/[0.07] focus:ring-main/40"
              />
            </div>

            <!-- Conteúdo -->
            <div class="flex-1 relative overflow-hidden flex flex-col z-10">
              <div class="flex-1 p-6 overflow-hidden overflow-y-auto scrollbar-hide">
                <Inicio />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

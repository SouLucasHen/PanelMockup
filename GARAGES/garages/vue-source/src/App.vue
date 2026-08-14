<!--
  Garagem Hensa Studio — Painel NUI (FiveM)
  Feito por Hensa (Lucas Hen)
  Base Vue 3 + Tailwind + Pinia. O conteúdo é editado em src/views/Inicio.vue.
-->
<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useSettingsStore } from "@stores/settings";
import { useGarageStore } from "@stores/garage";
import setTheme from "@utils/setTheme";
import loadTheme from "@utils/loadTheme";
import fetchNui from "@utils/fetchNui";

import Inicio from "./views/Inicio.vue";
import Garage from "@icons/Garage.vue";
import Car from "@icons/Car.vue";
import Home from "@icons/Home.vue";
import Scribble from "@icons/Scribble.vue";

const settings = useSettingsStore();
const garage = useGarageStore();

// Em dev (navegador) o fundo usa o wallpaper simulando o mundo do jogo;
// no jogo (build) o fundo continua o overlay escuro sobre o mundo real.
const isDev = import.meta.env.DEV;

// Rabiscos (Scribble) e glows (círculos) do fundo — controlados pelo
// Theme.garage.scribble da vrp (vrp/config/Global.lua). false = só a cor de
// fundo, sem decoração.
const showDecor = ref(true);

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

// ==================== GARAGEM / SOLICITAR MECÂNICO ====================
// Callback NUI "Mechanic" no client: fecha a interface (mesmo padrão de
// Spawn/Delete) e o servidor abre o vRP.Request de confirmação.
const handleSolicitarMecanico = () => {
  const vehicle = garage.selectedVehicle;
  if (!vehicle || !vehicle.model || !vehicle.owned) return;
  fetchNui("Mechanic", { Model: vehicle.model });
};

// Solicitar Mecânico só aparece quando o card selecionado é de um veículo
// que o jogador possui — veículos de serviço ainda não adquiridos
// (owned = false) ficam de fora.
const canRequestMechanic = computed(() => {
  const vehicle = garage.selectedVehicle;
  return !!vehicle && vehicle.owned;
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
    // O client envia { Action = "Open", Payload = Vehicles } com Payload sendo
    // o array de veículos direto (client-side/core.lua). Aceita também o
    // formato { Payload = { Vehicles = [...] } } para compatibilidade.
    const vehicles = Array.isArray(payload) ? payload : payload.Vehicles || payload.vehicles || [];
    garage.setVehicles(vehicles);
  } else if (actionName === "Close") {
    settings.display = false;
  }
};

onMounted(async () => {
  const theme = document.body.getAttribute("theme");
  if (theme) setTheme(theme);

  // Tema vindo do resource "vrp" (mesmo padrão da HUD); o retorno traz
  // Theme.garage (cores dos botões + scribble) para controlar rabiscos/glows
  const themeData = await loadTheme();
  if (themeData?.garage?.scribble !== undefined) {
    showDecor.value = themeData.garage.scribble !== false;
  }

  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
</script>

<template>
  <div>
    <!-- Wallpaper de cenário (teste no navegador): sempre visível em dev, a
         interface (fundo + painel) abre/fecha por cima dele -->
    <div v-if="isDev" class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 size-full bg-wallpaper"></div>
    </div>

    <!-- Fundo externo (tela cheia): overlay escuro 95% visível (bg-from + gradiente
         bg-default), com os glows (círculos) e rabiscos por cima — réplica do fundo
         da HUD. O wallpaper de cenário (dev) fica atrás, sempre visível. -->
    <transition name="bg-fade">
      <div
        v-show="settings.display"
        class="fixed inset-0 bg-from opacity-[0.95] pointer-events-none overflow-hidden"
      >
        <div class="absolute inset-0 size-full bg-default">
          <!-- Rabiscos (componente Scribble) + círculos — réplica fiel do fundo da HUD
               (study/index.html). Somem quando Theme.garage.scribble = false. -->
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
        @click="garage.deselectVehicle()"
      >
        <div class="relative w-[80rem] h-[52rem]">
          <!-- Modal do painel -->
          <div class="relative isolate rounded-2xl bg-neutral-950/85 shadow-2xl ring-1 ring-white/10 size-full flex flex-col overflow-hidden">
            <div class="absolute z-0 top-0 left-0 size-full bg-default pointer-events-none opacity-50">
              <!-- Sem círculos dentro do modal: só o fundo gradiente (os círculos
                   externos, atrás do modal, continuam intactos) -->
            </div>

            <!-- Cabeçalho do painel (estilo do modal de garagem) -->
            <div class="relative z-20 flex items-center justify-between gap-6 px-8 pt-7 pb-6 border-b border-white/5">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-14 h-14 rounded-xl bg-main/15 ring-1 ring-main/15 flex items-center justify-center shrink-0">
                  <Garage class="w-7 h-7 text-main" />
                </div>
                <div class="flex flex-col min-w-0">
                  <p class="text-2xl font-semibold text-white leading-tight truncate">GARAGEM</p>
                  <p class="text-sm text-white/50 leading-tight truncate">GERENCIE OS VEÍCULOS GUARDADOS NESTE PONTO</p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <!-- Solicitar Mecânico: só aparece com um card selecionado de veículo possuído -->
                <button
                  v-if="canRequestMechanic"
                  @click.stop="handleSolicitarMecanico"
                  class="flex items-center gap-2.5 rounded-md px-4 py-2.5 bg-garageMechanic text-white transition-colors hover:bg-garageMechanicHover cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 min-w-max">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span class="text-sm">Solicitar Mecânico</span>
                </button>
                <button
                  v-if="garage.vehicles.length"
                  @click.stop="handlePegarVeiculo"
                  :disabled="!garage.selectedVehicle"
                  :class="[
                    'flex items-center gap-2.5 rounded-md px-4 py-2.5 transition-all',
                    garage.selectedVehicle
                      ? 'bg-garageGet text-white hover:bg-garageGetHover cursor-pointer'
                      : 'bg-garageGet/25 text-white/40 cursor-default',
                  ]"
                >
                  <Car class="w-5 h-5 min-w-max" />
                  <span class="text-sm">Pegar Veículo</span>
                </button>
                <button
                  @click.stop="handleGuardarVeiculo"
                  class="flex items-center gap-2.5 rounded-md px-4 py-2.5 bg-garageSave text-white transition-colors hover:bg-garageSaveHover cursor-pointer"
                >
                  <Home class="w-5 h-5 min-w-max" />
                  <span class="text-sm">Guardar Veículo</span>
                </button>
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

            <!-- Barra de pesquisa (acima do conteúdo) — só aparece quando a garagem tem veículos -->
            <div
              v-if="garage.vehicles.length"
              class="relative z-20 mx-6 mt-6 overflow-hidden rounded-md bg-main/10 ring-1 ring-main/15 flex flex-col gap-2 px-6 py-4"
            >
              <label for="search-vehicle" class="text-xs uppercase tracking-wide text-white/50">
                Pesquisar veículo
              </label>
              <input
                id="search-vehicle"
                v-model="garage.search"
                type="text"
                placeholder="Digite o nome do veículo..."
                class="h-12 w-full rounded-md bg-white/5 px-4 text-sm text-white ring-1 ring-white/5 placeholder:text-white/40 transition-colors focus:bg-white/[0.07] focus:ring-main/40"
              />
            </div>

            <!-- Conteúdo: segundo fundo no mesmo padrão da barra de pesquisa, com os cards dentro -->
            <div class="flex-1 relative z-10 isolate flex flex-col overflow-hidden">
              <div class="flex-1 min-h-0 mx-6 mt-6 mb-6 overflow-hidden rounded-md bg-main/10 ring-1 ring-main/15">
                <div class="h-full min-h-0 px-6 pt-6 overflow-hidden overflow-y-auto cards-scroll">
                  <Inicio />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

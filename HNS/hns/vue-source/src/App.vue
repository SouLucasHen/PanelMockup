<!--
  Painel Base — Hensa Studio
  Feito por Hensa (Lucas Hen)
  Estrutura base para criação de painéis NUI (FiveM): Vue 3 + Tailwind + Pinia.
  Para criar um novo painel, edite a view em src/views/Inicio.vue.
-->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useSettingsStore } from "@stores/settings";
import { usePlayerStore } from "@stores/player";
import setTheme from "@utils/setTheme";
import loadTheme from "@utils/loadTheme";
import fetchNui from "@utils/fetchNui";

import Inicio from "./views/Inicio.vue";
import History from "@icons/History.vue";
import Logout from "@icons/Logout.vue";
import User from "@icons/User.vue";

const settings = useSettingsStore();
const player = usePlayerStore();

const userImgError = ref(false);

// ==================== TABS (menu) ====================
const switchTab = (tab) => {
  settings.activeTab = tab;
};

// ==================== NUI / FECHAR ====================
const closeNUI = () => {
  settings.display = false;
  fetchNui("closeNUI");
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
    userImgError.value = false;
  } else if (actionName === "Close") {
    settings.display = false;
  }
};

// ESC para fechar o painel
const handleKeydown = (event) => {
  if (event.key === "Escape" && settings.display) {
    closeNUI();
  }
};

onMounted(() => {
  const theme = document.body.getAttribute("theme");
  if (theme) setTheme(theme);

  // Tema vindo do resource "vrp" (mesmo padrão da HUD)
  loadTheme();

  window.addEventListener("message", handleMessage);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div>
    <!-- Fundo externo (tela cheia): idêntico ao interior do modal, 85% visível, com transição própria de aparecer/sumir -->
    <transition name="bg-fade">
      <div
        v-show="settings.display"
        class="fixed inset-0 bg-from opacity-[0.85] pointer-events-none overflow-hidden"
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
        >
          <div class="relative w-[80rem] h-[52rem]">
          <div class="relative rounded-[1.5rem] bg-neutral-950 size-full p-7 shadow-tablet ring-1 ring-white/10 transition-all duration-300">
            <div class="relative rounded-xl ring-1 ring-white/5 size-full flex flex-col overflow-hidden bg-from">
              <div class="absolute z-0 top-0 left-0 size-full bg-default pointer-events-none opacity-50">
                <div class="absolute -top-[34.5rem] -left-[30rem] w-[60rem] h-[60rem] opacity-40 bg-shadow-circle"></div>
                <div class="absolute -top-[17.5rem] -left-[15.5rem] w-[60rem] h-[60rem] opacity-20 bg-shadow-circle"></div>
                <div class="absolute -bottom-[15rem] -right-[8.25rem] w-[46rem] h-[45rem] opacity-40 bg-shadow-circle"></div>
                <div class="absolute -bottom-[20.5rem] -right-[17.5rem] w-[60rem] h-[60rem] opacity-20 bg-shadow-circle"></div>
              </div>

              <div class="flex-1 relative overflow-hidden flex flex-col z-10">
                <div class="flex-1 p-6 overflow-hidden overflow-y-auto scrollbar-hide">
                  <Inicio v-show="settings.activeTab === 'inicio'" />
                </div>

                <div class="mx-6 mb-6 overflow-hidden rounded-md bg-main/10 ring-1 ring-main/20 flex items-center justify-between gap-5 py-4 px-6 h-20 min-h-20 max-h-20">
                  <div class="flex items-center gap-4 overflow-hidden">
                    <div class="w-12 h-12">
                      <img
                        v-if="player.avatar && !userImgError"
                        :src="player.avatar"
                        class="w-full h-full rounded-full object-cover object-center ring-1 ring-white/10"
                        @error="userImgError = true"
                      />
                      <User v-else class="w-full h-full rounded-full p-1 text-white/40 bg-main/10" />
                    </div>
                    <div class="flex flex-col overflow-hidden">
                      <p class="text-sm text-white/30">Olá, seja bem-vindo(a)</p>
                      <p class="font-semibold truncate text-white">{{ player.playerName || "Jogador" }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      @click="switchTab('inicio')"
                      :class="[
                        'flex items-center gap-2.5 rounded-md px-4 py-2.5 ring-1 cursor-pointer transition-colors',
                        settings.activeTab === 'inicio'
                          ? 'bg-main/20 ring-main/30 text-main'
                          : 'bg-main/5 ring-main/15 text-white/40 hover:text-white/60 hover:bg-main/10',
                      ]"
                    >
                      <History class="w-5 h-5 min-w-max" />
                      <span class="text-sm font-semibold">Início</span>
                    </button>
                    <button
                      @click="closeNUI()"
                      class="flex items-center gap-2.5 rounded-md px-4 py-2.5 bg-main/5 ring-1 ring-main/15 text-white/40 transition-colors hover:text-white/60 hover:bg-main/10 cursor-pointer"
                    >
                      <Logout class="w-5 h-5 min-w-max" />
                      <span class="text-sm font-semibold">Fechar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Tablet decorations -->
          <div class="tablet-sensors"></div>
          <div class="tablet-btn"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

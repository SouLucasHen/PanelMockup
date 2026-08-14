<script setup>
import { ref } from "vue";
import { useSettingsStore } from "@stores/settings";
import { themeState } from "@stores/theme";
import Audio from "./Audio.vue";
import Shortcuts from "./Shortcuts.vue";
import Socials from "./Socials.vue";
import Progressbar from "./Progressbar.vue";
import Classification from "./Classification.vue";
import Keyboard from "@icons/Keyboard.vue";

// ==================== MODELO 1 ====================
// Overlay na parte inferior da tela (gradiente a partir da base), com o player
// de música fixo à esquerda, redes sociais + botão de atalhos à direita e a
// barra de progresso (SVG equalizer) na base. Alternativa ao modelo 2 via
// Theme.loading.model = 1.

const settings = useSettingsStore();
const showShortcuts = ref(false);
</script>

<template>
    <div
        :class="[
            'fixed top-0 left-0 size-full flex flex-col justify-end gap-4 p-16',
            settings.progressVisible ? 'bg-default' : 'bg-default-without-progress',
        ]"
    >
        <div class="flex items-end justify-between gap-4">
            <!-- Player de música (sempre visível neste modelo) -->
            <div>
                <Audio v-if="settings.playlist.length" />
            </div>

            <!-- Redes sociais + botão de atalhos -->
            <div v-if="settings.socials.length || settings.classification" class="relative flex items-center gap-2">
                <transition name="fade-down">
                    <div v-show="showShortcuts" class="absolute bottom-full right-0 mb-4">
                        <Shortcuts />
                    </div>
                </transition>

                <button
                    v-if="settings.shortcuts"
                    @click="showShortcuts = !showShortcuts"
                    :class="[
                        'rounded-lg p-3 flex items-center gap-4 transition-colors backdrop-blur-[0.5rem] cursor-pointer',
                        themeState.grayscale ? 'hover:bg-white hover:text-from' : 'hover:bg-main hover:text-mainText',
                        showShortcuts
                            ? themeState.grayscale
                                ? 'bg-white text-from'
                                : 'bg-main text-mainText'
                            : themeState.loading?.mode === 'light'
                              ? 'bg-white/10'
                              : 'bg-from/40',
                    ]"
                >
                    <Keyboard class="w-6 h-6" />
                    <div>
                        <p class="text-[0.625rem] font-light leading-3 opacity-50 tracking-normal">
                            Veja nossos
                        </p>
                        <p class="text-lg font-extrabold leading-5 tracking-normal">Atalhos</p>
                    </div>
                </button>

                <Socials
                    v-for="social in settings.socials"
                    :key="social.type"
                    :type="social.type"
                    :url="social.url"
                />

                <!-- Selo de classificação indicativa (canto inferior direito) -->
                <Classification />
            </div>
        </div>

        <Progressbar v-if="settings.progressVisible" />
    </div>
</template>

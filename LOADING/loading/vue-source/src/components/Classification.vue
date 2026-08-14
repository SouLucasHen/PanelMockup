<script setup>
import { useSettingsStore } from "@stores/settings";
import { themeState } from "@stores/theme";

// ==================== SELO DE CLASSIFICAÇÃO INDICATIVA ====================
// Canto inferior direito, mesmo padrão dos botões da loading (rounded +
// backdrop blur + fundo do tema + mesma altura dos botões sociais para nada
// desalinhar). Configuração em shared-side/shared.lua:
//   Classification = true        → liga/desliga o selo
//   ClassificationAge = 18       → número na caixa preta
//   ClassificationTitle          → linha de cima (título)
//   ClassificationText           → linha de baixo (descrição)
const settings = useSettingsStore();
</script>

<template>
    <div
        v-if="settings.classification"
        :class="[
            'rounded-lg backdrop-blur-[0.5rem] px-3 py-2 flex items-center gap-3',
            themeState.loading?.mode === 'light' ? 'bg-white/10' : 'bg-from/40',
        ]"
    >
        <!-- Caixa preta com a idade -->
        <div class="bg-black rounded-md w-10 h-10 shrink-0 flex items-center justify-center">
            <p class="font-extrabold text-xl leading-none text-white">
                {{ settings.classificationAge }}
            </p>
        </div>

        <!-- Textos do selo (nowrap para a altura bater exata com os botões) -->
        <div class="flex flex-col">
            <p class="font-extrabold uppercase text-sm leading-4 whitespace-nowrap">
                {{ settings.classificationTitle }}
            </p>
            <p class="font-light text-xs opacity-60 leading-4 mt-0.5 whitespace-nowrap">
                {{ settings.classificationText }}
            </p>
        </div>
    </div>
</template>

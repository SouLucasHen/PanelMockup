<script setup>
import SectionHeader from "@components/SectionHeader.vue";
import History from "@icons/History.vue";
</script>

<template>
  <div class="h-full w-full flex flex-col gap-6">
    <SectionHeader>
      <template #icon>
        <History class="w-5 h-5 text-main" />
      </template>
      <template #title>Início</template>
    </SectionHeader>

    <!-- Área de conteúdo central: lorem ipsum (substitua pelo conteúdo do seu painel) -->
    <div class="flex-1 overflow-hidden rounded-md bg-main/5 ring-1 ring-main/15 p-8 overflow-y-auto scrollbar-hide">
      <div class="size-full flex flex-col items-center justify-center gap-6 text-center max-w-3xl mx-auto">
        <p class="text-white/70 text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p class="text-white/40 text-sm leading-relaxed">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>
  </div>
</template>

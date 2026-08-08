<template>
  <div class="overflow-hidden rounded-md bg-main/10 ring-1 ring-main/20 flex items-center justify-between gap-5 py-4 px-6 h-20 min-h-20">
    <div class="flex items-center gap-3">
      <slot name="icon" />
      <p class="font-semibold text-white"><slot name="title" /></p>
    </div>
    <div class="flex items-center gap-3">
      <slot />
    </div>
  </div>
</template>

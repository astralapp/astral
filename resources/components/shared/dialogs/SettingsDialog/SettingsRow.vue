<script setup lang="ts">
defineProps<{
  description?: string
  title: string
}>()
</script>

<template>
  <div class="flex flex-col gap-y-3 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-x-8 sm:gap-y-0">
    <div class="min-w-0 sm:max-w-[60ch]">
      <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ title }}</p>

      <p
        v-if="description"
        class="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
      >
        {{ description }}
      </p>
    </div>

    <div class="flex shrink-0 items-center sm:pt-0.5">
      <slot />
    </div>
  </div>
</template>

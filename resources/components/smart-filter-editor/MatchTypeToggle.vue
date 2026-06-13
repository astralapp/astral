<script setup lang="ts">
const value = defineModel<'all' | 'any' | 'none'>({ default: 'any' })

const options = [
  { label: 'Any', value: 'any' },
  { label: 'All', value: 'all' },
  { label: 'None', value: 'none' },
] as const
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-md bg-gray-100 p-0.5 dark:bg-gray-900"
    role="radiogroup"
    aria-label="Match type"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="value === option.value"
      class="cursor-pointer rounded-[5px] px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-300 dark:focus-visible:ring-brand-500/40"
      :class="
        value === option.value
          ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-700 dark:text-white'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      "
      @click="value = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

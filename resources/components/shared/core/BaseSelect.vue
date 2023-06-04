<script setup lang="ts">
import { useVModel } from '@vueuse/core'

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <select
    v-model="value"
    class="inline-block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus-visible:border-brand-500 focus-visible:ring-brand-500 sm:text-sm"
  >
    <slot />
  </select>
</template>

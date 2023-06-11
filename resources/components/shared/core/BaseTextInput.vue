<script setup lang="ts">
import { useVModel } from '@vueuse/core'

interface Props {
  modelValue?: number | string
  type?: 'email' | 'number' | 'password' | 'text'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <input
    v-model="value"
    class="min-w-0 flex-auto appearance-none rounded-md border border-gray-900/20 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-gray-800/5 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-700/[0.15] dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-400/10 sm:text-sm"
    :type="props.type"
  />
</template>

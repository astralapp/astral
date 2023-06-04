<script setup lang="ts">
import { useVModel } from '@vueuse/core'

interface Props {
  type?: 'text' | 'email' | 'password' | 'number'
  modelValue?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <input
    v-model="value"
    class="rounded-md border border-transparent bg-white px-3 py-2 text-base text-gray-600 shadow ring-1 ring-gray-300 transition-colors focus:border-gray-400 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:focus:border-gray-600 sm:text-sm"
    :type="props.type"
  />
</template>

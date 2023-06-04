<script setup lang="ts">
import BaseTextInput from '@/views/components/shared/core/BaseTextInput.vue'
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

<template><BaseTextInput v-model="value" class="flex-grow" /></template>

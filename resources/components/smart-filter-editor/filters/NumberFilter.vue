<script setup lang="ts">
import BaseTextInput from '@/views/components/shared/core/BaseTextInput.vue'
import { useVModel } from '@vueuse/core'

interface Props {
  modelValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const value = useVModel(props, 'modelValue', emit)
</script>

<template><BaseTextInput v-model="value" type="number" /></template>

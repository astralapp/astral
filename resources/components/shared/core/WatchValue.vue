<script lang="ts" setup>
import { watch } from 'vue'

const props = defineProps<{
  value: any
}>()

const emit = defineEmits<{
  (e: 'change', value: any): void
}>()

watch(
  () => props.value,
  val => {
    emit('change', val)
  }
)
</script>

<template><slot /></template>

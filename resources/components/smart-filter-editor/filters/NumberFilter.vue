<script setup lang="ts">
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'

const modelValue = defineModel<number>('modelValue', { default: 0 })
</script>

<template>
  <BaseTextInput
    v-model="modelValue"
    type="number"
  />
</template>

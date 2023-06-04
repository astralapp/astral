<script lang="ts" setup>
import { TransitionRoot } from '@headlessui/vue'
</script>

<template>
  <TransitionRoot
    enter="transition-opacity"
    enter-from="opacity-0"
    enter-to="opacity-100"
    leave="transition-opacity"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <slot />
  </TransitionRoot>
</template>

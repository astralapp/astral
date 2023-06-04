<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalToast, ToastType } from '@/scripts/composables/useGlobalToast'
import { TransitionRoot } from '@headlessui/vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/solid'

const { isVisible, currentMessage, currentType } = useGlobalToast()

const toastClasses = computed(() => {
  return {
    [ToastType.Success]: 'bg-green-200 text-green-700',
    [ToastType.Error]: 'bg-red-200 text-red-700',
  }[currentType.value]
})
</script>

<template>
  <TransitionRoot
    :show="isVisible"
    enter-from="opacity-0 translate-x-full"
    enter-to="opacity-100 translate-x-0"
    leave-from="opacity-100 translate-x-0"
    leave-to="opacity-0 translate-x-full"
    as="template"
  >
    <div
      class="absolute bottom-0 right-0 z-30 mb-4 mr-4 flex transform items-center rounded-full px-3 py-2 text-sm font-semibold transition duration-300"
      :class="toastClasses"
      aria-role="status"
      aria-live="assertive"
    >
      <CheckCircleIcon v-if="currentType === ToastType.Success" class="mr-1 h-5 w-5" aria-hidden="true" />

      <XCircleIcon v-if="currentType === ToastType.Error" class="mr-1 h-5 w-5" aria-hidden="true" />

      <span class="sr-only">{{ currentType === ToastType.Success ? 'Success: ' : 'Error: ' }}</span>
      {{ currentMessage }}
    </div>
  </TransitionRoot>
</template>

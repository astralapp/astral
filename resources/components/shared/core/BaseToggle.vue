<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { watch, ref } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  enabled: false,
})

const emit = defineEmits<{
  (e: 'change', enabled: Maybe<boolean>): void
}>()

interface Props {
  enabled?: boolean
}

const enabledState = ref(props.enabled)

watch(enabledState, () => emit('change', enabledState.value))
</script>

<template>
  <Switch
    v-model="enabledState"
    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    :class="[enabledState ? 'bg-brand-600' : 'bg-gray-200']"
  >
    <span class="sr-only">Use setting</span>

    <span
      class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
      :class="[enabledState ? 'translate-x-5' : 'translate-x-0']"
    >
      <span
        class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
        :class="[enabledState ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in']"
        aria-hidden="true"
      >
        <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
          <path
            d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <span
        class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
        :class="[enabledState ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out']"
        aria-hidden="true"
      >
        <svg class="h-3 w-3 text-brand-600" fill="currentColor" viewBox="0 0 12 12">
          <path
            d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
          />
        </svg>
      </span>
    </span>
  </Switch>
</template>

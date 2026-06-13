<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

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

const attrs = useAttrs()

// Width/layout classes belong on the wrapper; everything else (aria-label, etc.)
// belongs on the native select so it stays accessible.
const selectAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs

  return rest
})
</script>

<template>
  <div
    class="relative"
    :class="($attrs.class as string | undefined)"
  >
    <select
      v-model="value"
      v-bind="selectAttrs"
      class="h-9 w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white bg-none py-0 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-xs transition focus:outline-hidden focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus-visible:border-brand-500 dark:focus-visible:ring-brand-500/30"
    >
      <slot />
    </select>

    <i-lucide-chevron-down
      class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
      role="presentation"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  as?: 'button' | 'link'
  active?: boolean
  tone?: 'danger' | 'default'
  size?: 'md' | 'sm'
  label: string
  shortcut?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  active: false,
  tone: 'default',
  size: 'md',
})

const element = computed(() => (props.as === 'link' ? 'a' : 'button'))

const sizeClass = computed(() => (props.size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'))

const titleText = computed(() => (props.shortcut ? `${props.label}  ${props.shortcut}` : props.label))

const toneClass = computed(() => {
  if (props.tone === 'danger') {
    return 'text-gray-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-200 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-500 dark:focus-visible:ring-red-500/30'
  }

  return props.active
    ? 'bg-brand-100 text-brand-700 focus-visible:ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:focus-visible:ring-brand-500/30'
    : 'text-gray-500 hover:bg-gray-200/70 hover:text-gray-700 focus-visible:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-gray-100 dark:focus-visible:ring-gray-600'
})
</script>

<template>
  <component
    :is="element"
    :type="as === 'button' ? 'button' : undefined"
    :aria-label="label"
    :title="titleText"
    class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md outline-hidden transition focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
    :class="[sizeClass, toneClass]"
  >
    <slot />
  </component>
</template>

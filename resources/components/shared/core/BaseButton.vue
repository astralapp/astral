<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  as?: 'button' | 'link'
  buttonType?: 'button' | 'submit'
  kind?:
    | 'base'
    | 'base-borderless'
    | 'danger'
    | 'danger-borderless'
    | 'primary'
    | 'primary-borderless'
    | 'warning'
    | 'warning-borderless'
  size?: 'base' | 'lg' | 'sm' | 'xl'
}
const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  buttonType: 'button',
  kind: 'base',
  size: 'base',
})

const buttonElement = computed(() => (props.as === 'link' ? 'a' : 'button'))
const resolvedButtonType = computed(() => (props.as === 'link' ? null : props.buttonType))

const classesForSizeProp = {
  base: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-sm',
  sm: 'px-2.5 py-1.5 text-xs',
  xl: 'px-4 py-3 text-base',
}[props.size]

const classesForKindProp = {
  base: 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-200 font-medium active:bg-gray-100 hover:dark:bg-black dark:bg-gray-950 dark:border-gray-700 dark:text-gray-200 border shadow-sm',
  'base-borderless': 'text-gray-700 bg-transparent focus-visible:ring-brand-200 font-medium dark:text-gray-900',
  danger:
    'text-white bg-red-600 border-transparent hover:bg-red-700 focus-visible:ring-red-200 font-semibold border shadow-sm',
  'danger-borderless':
    'text-red-600 border-transparent hover:text-red-700 focus-visible:ring-red-200 font-semibold dark:text-red-500 dark:hover:text-red-400',
  primary:
    'text-white bg-brand-600 border-transparent hover:bg-brand-700 focus-visible:ring-brand-200 font-semibold border shadow-sm',
  'primary-borderless':
    'text-brand-600 hover:text-brand-700 focus-visible:ring-brand-200 font-semibold dark:text-brand-500 dark:hover:text-brand-400',
  warning:
    'text-yellow-950 bg-yellow-500 border-transparent hover:bg-yellow-400 focus-visible:ring-yellow-200 font-semibold border shadow-sm',
  'warning-borderless': 'text-yellow-500 hover:text-yellow-600 focus-visible:ring-yellow-200 font-semibold',
}[props.kind]
</script>

<template>
  <component
    :is="buttonElement"
    :type="resolvedButtonType"
    class="inline-flex cursor-pointer items-center justify-center rounded text-center transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60"
    :class="[classesForSizeProp, classesForKindProp]"
  >
    <slot />
  </component>
</template>

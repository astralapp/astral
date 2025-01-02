<script lang="ts" setup>
import { computed, h, useSlots } from 'vue'

interface Props {
  count?: null | number
  hasContextMenu?: boolean
  isActive?: boolean
  isContextMenuActive?: boolean
  isHighlighted?: boolean
  tag?: string
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  hasContextMenu: false,
  isActive: false,
  isContextMenuActive: false,
  isHighlighted: false,
  tag: 'li',
})

const slots = useSlots()

const labelClasses = computed(() => {
  return props.isHighlighted
    ? 'text-white bg-brand-600'
    : props.isActive
    ? 'text-brand-600 dark:text-brand-500'
    : 'text-gray-400 hover:text-gray-300 dark:text-gray-300 dark:hover:text-gray-200'
})

const badgeClasses = computed(() => {
  return (
    (props.isHighlighted
      ? 'text-brand-600 bg-white dark:text-brand-500'
      : props.isActive
      ? 'text-white bg-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
      : 'text-white bg-gray-700') +
    (props.hasContextMenu ? (props.isContextMenuActive ? ' invisible' : ' group-hover:opacity-0') : '')
  )
})

const iconClasses = computed(() => {
  return !(props.isActive || props.isHighlighted) ? 'opacity-60' : 'opacity-100'
})

const Render = () =>
  h(
    props.tag,
    {
      ariaSelected: props.isActive,
      class: `group flex items-center p-1 font-semibold cursor-pointer text-sm transition-colors ${labelClasses.value}`,
      role: 'option',
    },
    [
      !!slots.icon &&
        h(
          'div',
          {
            ariaHidden: true,
            class: `flex-shrink-0 w-4 h-4 mr-2 ${iconClasses.value}`,
          },
          slots.icon()
        ),
      h('span', { ariaLive: 'polite', class: 'truncate pr-2', role: 'region', title: props.title }, props.title),
      h('div', { class: 'relative ml-auto' }, [
        !!props.count &&
          h(
            'div',
            {
              ariaLive: 'polite',
              class: `transition-opacity rounded-full px-2 h-5 text-xs inline-flex items-center flex-shrink-0 ${badgeClasses.value}`,
              role: 'region',
            },
            props.count.toLocaleString()
          ),
        !!props.hasContextMenu && slots.contextMenu && slots.contextMenu(),
      ]),
    ]
  )
</script>

<template><Render /></template>

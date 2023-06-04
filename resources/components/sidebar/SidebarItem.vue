<script lang="ts" setup>
import { h, computed, useSlots } from 'vue'

interface Props {
  tag?: string
  title: string
  isActive?: boolean
  isHighlighted?: boolean
  count?: number
  hasContextMenu?: boolean
  isContextMenuActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'li',
  isActive: false,
  isHighlighted: false,
  count: 0,
  hasContextMenu: false,
  isContextMenuActive: false,
})

const slots = useSlots()

const labelClasses = computed(() => {
  return props.isHighlighted
    ? 'text-white bg-brand-600'
    : props.isActive
    ? 'text-brand-600'
    : 'text-gray-400 hover:text-gray-300'
})

const badgeClasses = computed(() => {
  return (
    (props.isHighlighted
      ? 'text-brand-600 bg-white'
      : props.isActive
      ? 'text-white bg-brand-600'
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
      class: `group flex items-center p-1 font-semibold cursor-pointer text-sm transition-colors ${labelClasses.value}`,
      role: 'option',
      ariaSelected: props.isActive,
    },
    [
      !!slots.icon &&
        h(
          'div',
          {
            class: `flex-shrink-0 w-5 h-5 mr-2 ${iconClasses.value}`,
            ariaHidden: true,
          },
          slots.icon()
        ),
      h('span', { class: 'truncate pr-2', role: 'region', ariaLive: 'polite', title: props.title }, props.title),
      h('div', { class: 'relative ml-auto' }, [
        !!props.count &&
          h(
            'div',
            {
              class: `transition-opacity rounded-full px-2 h-5 text-xs inline-flex items-center flex-shrink-0 ${badgeClasses.value}`,
              role: 'region',
              ariaLive: 'polite',
            },
            props.count.toLocaleString()
          ),
        !!props.hasContextMenu && slots.contextMenu && slots.contextMenu(),
      ]),
    ]
  )
</script>

<template><Render /></template>

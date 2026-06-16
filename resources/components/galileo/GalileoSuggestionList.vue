<script lang="ts" setup>
import { QualifierType, SuggestionOption } from '@/utils/search'
import { computed, watch } from 'vue'

const props = defineProps<{
  highlightedIndex: number
  items: SuggestionOption[]
  listId: string
  partial: string
  qualifier: QualifierType
}>()

defineEmits<{
  highlight: [index: number]
  select: [name: string]
}>()

const QUALIFIER_NOUNS: Record<QualifierType, string> = {
  is: 'states',
  lang: 'languages',
  tag: 'tags',
  topic: 'topics',
}

const noun = computed(() => QUALIFIER_NOUNS[props.qualifier])
const trimmedPartial = computed(() => props.partial.trim())

watch(
  () => props.highlightedIndex,
  index => {
    document.getElementById(`${props.listId}-option-${index}`)?.scrollIntoView({ block: 'nearest' })
  },
  { flush: 'post' }
)
</script>

<template>
  <ul
    :id="listId"
    class="absolute inset-x-0 top-full z-50 mt-2 max-h-64 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
    role="listbox"
  >
    <li
      v-for="(item, index) in items"
      :id="`${listId}-option-${index}`"
      :key="item.name"
      role="option"
      :aria-selected="index === highlightedIndex"
      class="flex cursor-pointer items-center justify-between gap-4 px-4 py-2 text-xs"
      :class="
        index === highlightedIndex
          ? 'bg-brand-500 font-semibold text-white'
          : 'font-medium text-gray-700 dark:text-gray-400'
      "
      @mousedown.prevent
      @click="$emit('select', item.name)"
      @mouseenter="$emit('highlight', index)"
    >
      <span>{{ item.name }}</span>

      <span
        v-if="item.count !== null"
        :class="index === highlightedIndex ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'"
      >
        {{ item.count }}
      </span>
    </li>

    <li
      v-if="!items.length"
      class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400"
    >
      <template v-if="trimmedPartial"
        >No matching {{ noun }} — Enter filters by “{{ trimmedPartial }}” anyway.</template
      >

      <template v-else>No {{ noun }} left to suggest.</template>
    </li>
  </ul>
</template>

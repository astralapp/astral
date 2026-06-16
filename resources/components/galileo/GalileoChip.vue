<script lang="ts" setup>
import { SearchToken } from '@/utils/search'
import { XMarkIcon } from '@heroicons/vue/16/solid'

defineProps<{
  pendingDelete: boolean
  token: SearchToken
}>()

defineEmits<{
  remove: []
}>()
</script>

<template>
  <span
    class="flex shrink-0 items-center gap-1 rounded-xs px-2 py-0.5 text-xs font-semibold tracking-wide ring-1 ring-inset"
    :class="
      pendingDelete
        ? 'bg-red-100 text-red-800 ring-red-400 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/60'
        : 'bg-indigo-100 text-indigo-800 ring-transparent dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30'
    "
  >
    <i-lucide-tag
      v-if="token.type === 'tag'"
      class="h-3 w-3"
      aria-hidden="true"
    />

    <i-lucide-code
      v-else-if="token.type === 'lang'"
      class="h-3 w-3"
      aria-hidden="true"
    />

    <i-lucide-hash
      v-else-if="token.type === 'topic'"
      class="h-3 w-3"
      aria-hidden="true"
    />

    <i-lucide-archive
      v-else-if="token.value === 'archived'"
      class="h-3 w-3"
      aria-hidden="true"
    />

    <i-lucide-circle-slash
      v-else
      class="h-3 w-3"
      aria-hidden="true"
    />

    <span class="sr-only">{{ token.type }}:</span>

    <span>{{ token.value }}</span>

    <button
      type="button"
      class="cursor-pointer pl-0.5"
      :aria-label="`Remove filter ${token.type}:${token.value}`"
      @mousedown.prevent
      @click.stop="$emit('remove')"
    >
      <XMarkIcon class="h-3 w-3 fill-current" />
    </button>
  </span>
</template>

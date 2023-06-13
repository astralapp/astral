<script lang="ts" setup>
import { useStarsFilterStore } from '@/store/useStarsFilterStore'
import { isFocusedElementEditable } from '@/utils'
import { SearchIcon } from '@heroicons/vue/outline'
import { onKeyStroke } from '@vueuse/core'
import { computed, ref } from 'vue'

const starsFilterStore = useStarsFilterStore()

const input = ref<HTMLInputElement>()
const searchQuery = computed({
  get() {
    return starsFilterStore.searchQuery
  },
  set(query: string) {
    starsFilterStore.searchQuery = query
  },
})

onKeyStroke('/', e => {
  if (!isFocusedElementEditable() && document.activeElement !== input.value) {
    e.preventDefault()
    input.value?.focus()
  }
})
</script>

<template>
  <div
    class="flex h-16 flex-shrink-0 items-center border-b border-gray-300 bg-white px-4 dark:border-gray-950 dark:bg-gray-900"
  >
    <div
      class="relative flex items-center w-full appearance-none rounded-md border border-gray-900/20 bg-white px-3 shadow-md shadow-gray-800/5 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-700/[0.15] dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus-within:border-gray-500 dark:focus-within:ring-gray-400/10"
    >
      <input
        ref="input"
        v-model="searchQuery"
        type="text"
        class="peer w-full flex-grow border-none pr-3 pl-6 py-2 text-gray-500 placeholder:text-gray-400 focus:placeholder-gray-400 focus:ring-0 dark:text-gray-200 sm:text-sm bg-transparent"
        placeholder="Gaze through your telescope..."
        aria-keyshortcuts="/"
      />

      <SearchIcon
        class="pointer-events-none absolute left-2 h-5 w-5 text-gray-300 transition-colors peer-focus:text-gray-400 dark:text-gray-400"
        aria-hidden="true"
      />

      <span
        class="pointer-events-none absolute right-2 hidden rounded-sm border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-300 transition-opacity peer-focus:opacity-0 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-400 sm:block"
        aria-hidden="true"
        >/</span
      >
    </div>
  </div>
</template>

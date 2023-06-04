<script lang="ts" setup>
import { computed, ref } from 'vue'
import { SearchIcon } from '@heroicons/vue/outline'
import { useStarsFilterStore } from '@/scripts/store/useStarsFilterStore'
import { onKeyStroke } from '@vueuse/core'
import { isFocusedElementEditable } from '@/scripts/utils'

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
    class="flex h-16 flex-shrink-0 items-center border-b border-gray-300 bg-white px-4 dark:border-gray-600 dark:bg-gray-900"
  >
    <div
      class="relative flex w-full items-center rounded-md border border-transparent bg-white py-2 shadow ring-1 ring-gray-300 transition-colors focus-within:border-gray-400 focus-within:ring-gray-400 dark:bg-gray-700 dark:ring-gray-600 dark:focus-within:border-gray-600"
    >
      <input
        ref="input"
        v-model="searchQuery"
        type="text"
        class="peer w-full flex-grow border-none py-0 pr-3 pl-9 text-gray-500 placeholder-gray-300 focus:placeholder-gray-400 focus:ring-0 dark:bg-gray-700 dark:text-gray-300"
        placeholder="Gaze through your telescope..."
        aria-keyshortcuts="/"
      />

      <SearchIcon
        class="pointer-events-none absolute left-2 h-5 w-5 text-gray-300 transition-colors peer-focus:text-gray-400 dark:text-gray-400"
        aria-hidden="true"
      />

      <span
        class="pointer-events-none absolute right-2 hidden rounded-sm border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-300 transition-opacity peer-focus:opacity-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 sm:block"
        aria-hidden="true"
        >/</span
      >
    </div>
  </div>
</template>

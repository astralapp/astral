<script setup lang="ts">
import { computed } from 'vue'

const isMac = computed(() => typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent))
const metaKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'))

interface Shortcut {
  keys: string[]
  label: string
  withClick?: boolean
}

const groups = computed<Array<{ title: string; shortcuts: Shortcut[] }>>(() => [
  {
    title: 'Search & reading',
    shortcuts: [
      { keys: ['/'], label: 'Focus the search bar' },
      { keys: ['N'], label: 'Toggle the notes panel' },
      { keys: ['C'], label: 'Focus the clone field' },
    ],
  },
  {
    title: 'Browsing your stars',
    shortcuts: [
      { keys: ['↑', '↓'], label: 'Move between repos' },
      { keys: [metaKey.value], label: 'Add a repo to your selection', withClick: true },
      { keys: ['⇧'], label: 'Select a range of repos', withClick: true },
    ],
  },
])
</script>

<template>
  <div class="space-y-7">
    <section
      v-for="group in groups"
      :key="group.title"
    >
      <h3 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {{ group.title }}
      </h3>

      <ul class="mt-1 divide-y divide-gray-200 dark:divide-gray-800">
        <li
          v-for="shortcut in group.shortcuts"
          :key="shortcut.label"
          class="flex items-center justify-between gap-x-4 py-2.5"
        >
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ shortcut.label }}</span>

          <span class="flex shrink-0 items-center gap-x-1.5">
            <kbd
              v-for="key in shortcut.keys"
              :key="key"
              class="inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-gray-300 bg-gray-50 px-1.5 font-sans text-xs font-bold text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
            >
              {{ key }}
            </kbd>

            <span
              v-if="shortcut.withClick"
              class="text-xs font-medium text-gray-400 dark:text-gray-500"
            >
              + click
            </span>
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

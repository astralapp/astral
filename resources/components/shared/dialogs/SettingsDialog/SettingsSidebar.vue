<script lang="ts" setup>
import { SettingsTab } from '@/types'

defineProps<{
  activeTab?: SettingsTab
  onTabSelected: (tab: SettingsTab) => void
}>()
</script>

<template>
  <nav class="py-5 pl-5 pr-4 space-y-4 flex-shrink-0 max-w-[200px]">
    <button
      type="button"
      class="w-full text-left dark:text-white p-2 rounded text-sm"
      :class="{
        'dark:bg-gray-700/90': activeTab === 'general',
      }"
      @click="onTabSelected('general')"
    >
      General
    </button>

    <button
      type="button"
      class="w-full text-left dark:text-gray-50 p-2 rounded text-sm"
      :class="{
        'dark:bg-gray-700/90': activeTab === 'data-controls',
      }"
      @click="onTabSelected('data-controls')"
    >
      Data controls
    </button>
  </nav>
</template>

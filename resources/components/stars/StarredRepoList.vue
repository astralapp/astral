<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'
import { createVirtualScroller } from 'vue-typed-virtual-list'

import StarFetchProgress from '@/components/stars/StarFetchProgress.vue'
import { useSyncToLocalStorage } from '@/composables/useSyncToLocalStorage'
import { useStarsStore } from '@/store/useStarsStore'
import { GitHubRepo } from '@/types'

const emit = defineEmits<{
  blur: [e: FocusEvent]
  focus: [e: FocusEvent]
}>()

const VirtualScroller = createVirtualScroller<GitHubRepo>()

/** Stars fetch lifecycle
 * - First sync / cleared cache (`!isFullySynced`): fetch the full list in parallel.
 * - Returning visit (cached): fetch only stars added since last sync and prepend them.
 **/
const starsStore = useStarsStore()
const reposHaveSynced = ref(false)
const syncStateHasSynced = ref(false)

useSyncToLocalStorage(starsStore, 'starredRepos').then(() => {
  reposHaveSynced.value = true
})
useSyncToLocalStorage(starsStore, 'isFullySynced').then(() => {
  syncStateHasSynced.value = true
})

watch([reposHaveSynced, syncStateHasSynced], async syncChecks => {
  if (syncChecks.every(Boolean)) {
    await nextTick()

    if (!starsStore.isFullySynced) {
      await starsStore.fetchAllStars()
    } else {
      await starsStore.fetchNewStars()
    }
  }
})
</script>

<template>
  <VirtualScroller
    v-if="starsStore.filteredRepos.length"
    :default-size="156"
    :items="starsStore.filteredRepos"
    class="relative h-full bg-white dark:bg-black focus:outline-hidden"
    role="listbox"
    aria-label="Stars List"
    aria-multiselectable="true"
    tabindex="0"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template #item="{ ref: item }">
      <slot :repo="item as GitHubRepo" />
    </template>
  </VirtualScroller>

  <div
    v-if="!starsStore.filteredRepos.length && starsStore.isFetchingStars"
    class="flex w-full h-full items-center justify-center p-8"
  >
    <StarFetchProgress
      class="max-w-md"
      label="Loading your stars…"
      :fetched-count="starsStore.fetchedCount"
      :total-repos="starsStore.totalRepos"
    />
  </div>

  <div
    v-if="!starsStore.filteredRepos.length && !starsStore.isFetchingStars"
    class="flex w-full h-full items-center justify-center"
  >
    <p class="text-center text-gray-500">No results found</p>
  </div>
</template>

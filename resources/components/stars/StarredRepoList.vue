<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { useSyncToLocalStorage } from '@/scripts/composables/useSyncToLocalStorage'
// import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { createVirtualScroller } from 'vue-typed-virtual-list'
import { GitHubRepo } from '@/scripts/types'

const VirtualScroller = createVirtualScroller<GitHubRepo>()

/** Stars Fetch Lifecycle
 * 1. if hasNextPage is true, fetch using whatever the end cursor is, even if it's null
 * 2. Keep fetching until `hasNextPage` is false.
 * 3. fetch any new repos in ASC order using the first repo's cursor, fetch until `hasNextPage` is false
 **/
const starsStore = useStarsStore()
const reposHaveSynced = ref(false)
const pageInfoHasSynced = ref(false)

useSyncToLocalStorage(starsStore, 'starredRepos').then(() => {
  reposHaveSynced.value = true
})
useSyncToLocalStorage(starsStore, 'pageInfo').then(() => {
  pageInfoHasSynced.value = true
})

watch([reposHaveSynced, pageInfoHasSynced], async syncChecks => {
  if (syncChecks.every(Boolean) && starsStore.pageInfo.hasNextPage) {
    // We're ready to start fetching stars
    await nextTick()
    while (starsStore.pageInfo.hasNextPage) {
      const { viewer } = await starsStore.fetchStars(starsStore.pageInfo.endCursor)

      starsStore.totalRepos = viewer.starredRepositories.totalCount
      starsStore.pageInfo = viewer.starredRepositories.pageInfo

      starsStore.starredRepos = starsStore.starredRepos.concat(viewer.starredRepositories.edges)
    }
  }
})
</script>

<template>
  <VirtualScroller
    v-if="starsStore.filteredRepos.length"
    :default-size="156"
    :items="starsStore.filteredRepos"
    class="relative flex-grow bg-white"
    role="listbox"
    aria-label="Stars List"
    aria-multiselectable="true"
    tabindex="0"
  >
    <template #item="{ ref: item }">
      <slot :repo="(item as GitHubRepo)" />
    </template>
  </VirtualScroller>

  <div
    v-if="starsStore.isFetchingStars && !starsStore.filteredRepos.length"
    class="flex h-full items-center justify-center"
  >
    <p class="text-center text-gray-500">Loading starred repositories...</p>
  </div>

  <div
    v-if="!starsStore.filteredRepos.length && !starsStore.isFetchingStars"
    class="flex h-full items-center justify-center"
  >
    <p class="text-center text-gray-500">No results found</p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/use-auth'
import { useSyncToLocalStorage } from '@/composables/useSyncToLocalStorage'
import { useSyncValuesToStores } from '@/composables/useSyncValuesToStores'
import LogoSvg from '@/img/logo.svg?component'
import { useStarsStore } from '@/store/useStarsStore'
import { useUserStore } from '@/store/useUserStore'
import { StarMetaInput } from '@/types'
import localForage from 'localforage'
import { pick } from 'lodash'
import { computed, nextTick, ref, watch } from 'vue'

// This page is a one-off, just do everything here
const props = defineProps<{
  stars: App.Data.StarData[]
}>()

const { user } = useAuth()

const starsStore = useStarsStore()
const userStore = useUserStore()

const reposHaveSynced = ref(false)
const pageInfoHasSynced = ref(false)

const isReadyToBeginMigration = ref(true)
const hasMigrationStarted = ref(false)

const haveStarsBeenFetched = ref(false)

const progress = computed(() => {
  if (starsStore.totalRepos === 0) return 100

  return 100 - (starsStore.allStars.length / starsStore.totalRepos) * 100
})

useSyncValuesToStores(
  [userStore, 'user', computed(() => user.value)],
  [starsStore, 'userStars', computed(() => props.stars)]
)

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
    isReadyToBeginMigration.value = true
  }
})

const beginMigration = async () => {
  hasMigrationStarted.value = true

  await localForage.clear()
  starsStore.resetPageInfo()
  starsStore.clearStarredRepos()

  await nextTick()

  while (starsStore.pageInfo.hasNextPage) {
    const { viewer } = await starsStore.fetchStars(starsStore.pageInfo.endCursor)

    starsStore.totalRepos = viewer.starredRepositories.totalCount
    starsStore.pageInfo = viewer.starredRepositories.pageInfo

    starsStore.starredRepos = starsStore.starredRepos.concat(viewer.starredRepositories.edges)
  }

  haveStarsBeenFetched.value = true

  updateStarMetadata()
}

const updateStarMetadata = () => {
  const starData: (StarMetaInput & { starId: number })[] = []
  starsStore.userStars.forEach(star => {
    const repoNode = starsStore.starredRepos.find(repo => repo.node.databaseId === star.repo_id)?.node

    if (!repoNode) return

    const starInput: StarMetaInput = pick(repoNode, ['databaseId', 'nameWithOwner', 'url', 'description'])

    starData.push({
      ...starInput,
      starId: star.id,
    })
  })

  starsStore.backfillStarMetadata(starData)
}
</script>

<template>
  <div
    class="fixed inset-0 flex items-center bg-gray-900 bg-[length:1000px_1000px] bg-repeat"
    :style="{ backgroundImage: 'url(/img/migrate-bg.svg)' }"
  >
    <div class="mx-auto flex w-full max-w-screen-lg justify-between">
      <img
        class="h-auto w-full max-w-xs motion-safe:animate-float"
        alt="a waving astronaut"
        src="/img/migrate-waving-astronaut.svg"
      />

      <div class="space-y-8 pl-24">
        <h2 class="bg-gray-900 text-6xl font-bold leading-tight text-white shadow-[0_0_10px_10px_#111827]">
          Welcome to the<br />
          new
          <LogoSvg class="px relative -top-1 inline-flex h-6 fill-current text-brand-500 sm:h-12" />
        </h2>

        <p class="bg-gray-900 leading-loose text-white shadow-[0_0_10px_10px_#111827]">
          Before you get started we need to migrate some of your data to the new version. Depending on the number of
          stars you have, this could take from a few seconds to a few minutes. Please do not close this tab until the
          migration is complete.
        </p>

        <div>
          <button
            v-show="!hasMigrationStarted"
            type="button"
            :disabled="!isReadyToBeginMigration"
            class="relative rounded-full bg-brand-600 px-6 py-4 text-2xl font-bold text-white shadow-lg shadow-brand-900 transition-all hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-800 active:top-px disabled:pointer-events-none disabled:opacity-50"
            @click="beginMigration"
          >
            Begin Migration 🚀
          </button>
        </div>

        <div v-if="hasMigrationStarted && !haveStarsBeenFetched">
          <p class="animate-pulse text-lg font-bold text-white">Fetching stars...</p>

          <div class="mt-4 flex w-full items-center gap-x-4">
            <div
              role="progressbar"
              class="h-8 w-full overflow-hidden rounded-full bg-gray-900 ring-2 ring-inset ring-white [transform:translateZ(0)]"
            >
              <div
                class="relative h-full w-full rounded-full bg-white transition-[translate] duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
                :style="{ translate: `-${progress}% 0%` }"
              ></div>
            </div>

            <p
              v-if="starsStore.totalRepos > 0"
              class="flex-shrink-0 font-semibold tabular-nums text-white"
            >
              {{ starsStore.allStars.length }} / {{ starsStore.totalRepos }}
            </p>
          </div>
        </div>

        <div v-if="hasMigrationStarted && haveStarsBeenFetched">
          <p class="animate-pulse text-lg font-bold text-white">Updating star metadata...</p>
        </div>
      </div>
    </div>
  </div>
</template>

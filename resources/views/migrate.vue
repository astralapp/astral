<script setup lang="ts">
import StarFetchProgress from '@/components/stars/StarFetchProgress.vue'
import { useAuth } from '@/composables/use-auth'
import { useSyncToLocalStorage } from '@/composables/useSyncToLocalStorage'
import { useSyncValuesToStores } from '@/composables/useSyncValuesToStores'
import LogoSvg from '@/img/logo.svg?component'
import { useStarsStore } from '@/store/useStarsStore'
import { useUserStore } from '@/store/useUserStore'
import { StarMetaInput } from '@/types'
import { pick } from 'lodash'
import { computed, nextTick, ref } from 'vue'

// This page is a one-off, just do everything here
const props = defineProps<{
  stars: App.Data.StarData[]
}>()

const { user } = useAuth()

const starsStore = useStarsStore()
const userStore = useUserStore()

const hasMigrationStarted = ref(false)
const haveStarsBeenFetched = ref(false)

useSyncValuesToStores(
  [userStore, 'user', computed(() => user.value)],
  [starsStore, 'userStars', computed(() => props.stars)]
)

// Wire persistence so the fetched list survives the redirect to the dashboard, and so an
// interrupted migration can be resumed instead of restarted.
const reposRestored = useSyncToLocalStorage(starsStore, 'starredRepos')
const syncStateRestored = useSyncToLocalStorage(starsStore, 'isFullySynced')

const beginMigration = async () => {
  hasMigrationStarted.value = true

  // Wait for any cached partial to be restored so fetchAllStars resumes from it.
  await Promise.all([reposRestored, syncStateRestored])

  await nextTick()

  await starsStore.fetchAllStars()

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
    class="fixed inset-0 flex items-center bg-gray-900 bg-size-[1000px_1000px] bg-repeat"
    :style="{ backgroundImage: 'url(/img/migrate-bg.svg)' }"
  >
    <div class="mx-auto flex w-full max-w-(--breakpoint-lg) justify-between">
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
            class="relative rounded-full bg-brand-600 px-6 py-4 text-2xl font-bold text-white shadow-lg shadow-brand-900 transition-all hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-800 active:top-px"
            @click="beginMigration"
          >
            Begin Migration 🚀
          </button>
        </div>

        <div v-if="hasMigrationStarted && !haveStarsBeenFetched">
          <StarFetchProgress
            variant="onDark"
            label="Fetching stars…"
            :fetched-count="starsStore.fetchedCount"
            :total-repos="starsStore.totalRepos"
          />
        </div>

        <div v-if="hasMigrationStarted && haveStarsBeenFetched">
          <p class="animate-pulse text-lg font-bold text-white">Updating star metadata...</p>
        </div>
      </div>
    </div>
  </div>
</template>

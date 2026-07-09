<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import OnboardingScaffold from '@/components/shared/OnboardingScaffold.vue'
import StarFetchProgress from '@/components/stars/StarFetchProgress.vue'
import { useAuth } from '@/composables/use-auth'
import { useSyncToLocalStorage } from '@/composables/useSyncToLocalStorage'
import { useSyncValuesToStores } from '@/composables/useSyncValuesToStores'
import { useStarsStore } from '@/store/useStarsStore'
import { useUserStore } from '@/store/useUserStore'
import { StarMetaInput } from '@/types'
import { router } from 'hybridly'
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
const isImportComplete = ref(false)
const haveStarsBeenFetched = ref(false)

type Phase = 'ready' | 'importing' | 'fetching' | 'finalizing'
const PHASE_ORDER: Record<Phase, number> = { ready: 0, importing: 1, fetching: 2, finalizing: 3 }

const phase = computed<Phase>(() => {
  if (!hasMigrationStarted.value) return 'ready'
  if (!isImportComplete.value) return 'importing'
  return haveStarsBeenFetched.value ? 'finalizing' : 'fetching'
})

type StepStatus = 'upcoming' | 'active' | 'done'
const statusFor = (stepPhase: Phase): StepStatus => {
  if (PHASE_ORDER[phase.value] > PHASE_ORDER[stepPhase]) return 'done'
  return PHASE_ORDER[phase.value] === PHASE_ORDER[stepPhase] ? 'active' : 'upcoming'
}

const steps = computed(() => [
  { key: 'import', label: 'Restore library', status: statusFor('importing') },
  { key: 'fetch', label: 'Fetch stars', status: statusFor('fetching') },
  { key: 'catalog', label: 'Build catalog', status: statusFor('finalizing') },
])

const phaseCopy = computed<string>(
  () =>
    ({
      ready: '',
      importing: 'Bringing your tags, filters, and notes over from the old Astral.',
      fetching: 'Pulling every starred repo from your GitHub account.',
      finalizing: 'Saving names, descriptions, and links so search is ready the moment you land.',
    }[phase.value])
)

const dotClass = (status: StepStatus) =>
  ({
    done: 'bg-brand-500 text-gray-950',
    active: 'text-brand-400 ring-2 ring-brand-500',
    upcoming: 'text-gray-600 ring-1 ring-gray-700',
  }[status])

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

  // Pull the user's legacy tags, smart filters, and stars+notes into the new DB first,
  // so the catalog step has rows to attach GitHub metadata to.
  await starsStore.importLegacyData()
  isImportComplete.value = true

  // Wait for any cached partial to be restored so fetchAllStars resumes from it.
  await Promise.all([reposRestored, syncStateRestored])

  await nextTick()

  await starsStore.fetchAllStars()

  haveStarsBeenFetched.value = true

  await updateStarMetadata()
}

const updateStarMetadata = async () => {
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

  await starsStore.backfillStarMetadata(starData)

  // The backfill endpoint no longer redirects (it returns JSON per slice), so land the
  // user on the dashboard once the final slice has marked them migrated.
  router.get(route('dashboard.show'))
}
</script>

<template>
  <OnboardingScaffold>
    <Transition
      name="swap"
      mode="out-in"
    >
      <!-- Ready: explain the one-time migration and invite the user to start. -->
      <div
        v-if="phase === 'ready'"
        key="ready"
        class="mt-8 flex w-full flex-col items-center"
      >
        <h1 class="text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl">
          Let's bring your stars over
        </h1>

        <p class="mt-4 text-base leading-relaxed text-pretty text-gray-300">
          Welcome back. We're moving your library to the rebuilt Astral. Depending on how many stars you've collected,
          this takes anywhere from a few seconds to a couple of minutes. Keep this tab open until it finishes.
        </p>

        <BaseButton
          kind="primary"
          size="xl"
          class="group mt-8 gap-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          @click="beginMigration"
        >
          <span>Begin migration</span>

          <i-ph-arrow-right
            class="h-5 w-5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            role="presentation"
          />
        </BaseButton>

        <p class="mt-4 text-xs text-gray-400">
          One-time step. Astral only reads your stars from GitHub; nothing on your account is changed.
        </p>
      </div>

      <!-- Working: a two-step sequence with live progress, announced to assistive tech. -->
      <div
        v-else
        key="working"
        class="mt-8 flex w-full flex-col items-center"
        aria-live="polite"
      >
        <ol class="flex items-center justify-center gap-2 text-xs font-medium sm:gap-3">
          <template
            v-for="(step, index) in steps"
            :key="step.key"
          >
            <li
              v-if="index > 0"
              aria-hidden="true"
              class="h-px w-6 transition-colors duration-300 sm:w-10"
              :class="steps[index - 1].status === 'done' ? 'bg-brand-500/60' : 'bg-gray-700'"
            ></li>

            <li class="flex items-center gap-2">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300"
                :class="dotClass(step.status)"
              >
                <i-ph-check
                  v-if="step.status === 'done'"
                  class="h-3.5 w-3.5"
                />

                <span
                  v-else
                  class="h-1.5 w-1.5 rounded-full"
                  :class="step.status === 'active' ? 'bg-brand-400 motion-safe:animate-pulse' : 'bg-gray-600'"
                ></span>
              </span>

              <span :class="step.status === 'upcoming' ? 'text-gray-500' : 'text-gray-200'">
                {{ step.label }}
              </span>
            </li>
          </template>
        </ol>

        <div class="mt-8 w-full">
          <StarFetchProgress
            v-if="phase === 'importing'"
            variant="onDark"
            label="Restoring your library"
            :fetched-count="starsStore.importScanned"
            :total-repos="starsStore.importTotal"
          />

          <StarFetchProgress
            v-else-if="phase === 'fetching'"
            variant="onDark"
            label="Fetching your stars"
            :fetched-count="starsStore.fetchedCount"
            :total-repos="starsStore.totalRepos"
          />

          <div v-else>
            <p class="text-lg font-bold text-white motion-safe:animate-pulse">Cataloging your library</p>

            <div class="mt-4 h-8 w-full overflow-hidden rounded-full bg-gray-900 ring-2 ring-inset ring-white">
              <div class="relative h-full w-full bg-white">
                <div class="finalize-sweep absolute inset-0"></div>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-6 text-sm text-balance text-gray-400">
          {{ phaseCopy }}
        </p>

        <p class="mt-6 flex items-center gap-2 text-xs text-gray-400">
          <span class="relative flex h-1.5 w-1.5">
            <span
              class="absolute inline-flex h-full w-full rounded-full bg-brand-500/70 motion-safe:animate-ping"
            ></span>

            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500"></span>
          </span>
          Keep this tab open until it finishes.
        </p>
      </div>
    </Transition>
  </OnboardingScaffold>
</template>

<style scoped>
/* Crossfade between the ready and working states. */
.swap-enter-active,
.swap-leave-active {
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* The finalize phase is indeterminate: a green sweep over a full bar reads as "data's in, now processing". */
.finalize-sweep {
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.65), transparent);
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: no-preference) {
  .finalize-sweep {
    animation: finalize-sweep 1.5s ease-in-out infinite;
  }
}

@keyframes finalize-sweep {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .swap-enter-active,
  .swap-leave-active {
    transition: opacity 120ms ease;
  }

  .swap-enter-from,
  .swap-leave-to {
    transform: none;
  }
}
</style>

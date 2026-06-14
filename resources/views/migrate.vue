<script setup lang="ts">
import AuthStarfield from '@/components/auth/AuthStarfield.vue'
import BaseButton from '@/components/shared/core/BaseButton.vue'
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

type Phase = 'ready' | 'fetching' | 'finalizing'
const phase = computed<Phase>(() => {
  if (!hasMigrationStarted.value) return 'ready'
  return haveStarsBeenFetched.value ? 'finalizing' : 'fetching'
})

type StepStatus = 'upcoming' | 'active' | 'done'
const steps = computed(() => [
  { key: 'fetch', label: 'Fetch stars', status: (phase.value === 'finalizing' ? 'done' : 'active') as StepStatus },
  {
    key: 'catalog',
    label: 'Build catalog',
    status: (phase.value === 'finalizing' ? 'active' : 'upcoming') as StepStatus,
  },
])

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
  <div class="relative grid min-h-dvh w-full place-items-center overflow-hidden bg-gray-950 px-6 py-12">
    <!-- Cosmic field: a faint aurora glow and a starfield. Decorative; static under reduced motion. -->
    <div
      class="aurora pointer-events-none absolute inset-0"
      aria-hidden="true"
    ></div>

    <AuthStarfield class="absolute inset-0" />

    <div class="migrate-content relative z-10 flex w-full max-w-md flex-col items-center text-center">
      <LogoSvg
        role="img"
        aria-label="Astral"
        class="h-8 w-auto fill-current text-white"
      />

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
                :class="steps[0].status === 'done' ? 'bg-brand-500/60' : 'bg-gray-700'"
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
              v-if="phase === 'fetching'"
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
            {{
              phase === 'fetching'
                ? 'Pulling every starred repo from your GitHub account.'
                : 'Saving names, descriptions, and links so search is ready the moment you land.'
            }}
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
    </div>
  </div>
</template>

<style scoped>
/* A faint green aurora behind the wordmark, plus a low horizon glow. Matches the auth page. */
.aurora {
  background: radial-gradient(55% 45% at 50% 34%, rgba(16, 185, 129, 0.16), transparent 70%),
    radial-gradient(45% 32% at 50% 102%, rgba(5, 150, 105, 0.1), transparent 70%);
}

@media (prefers-reduced-motion: no-preference) {
  .aurora {
    animation: aurora-breathe 12s ease-in-out infinite alternate;
  }
}

@keyframes aurora-breathe {
  from {
    opacity: 0.75;
  }

  to {
    opacity: 1;
  }
}

/* One restrained entrance for the page. */
.migrate-content {
  animation: migrate-rise 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes migrate-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

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
  .migrate-content {
    animation: none;
  }

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

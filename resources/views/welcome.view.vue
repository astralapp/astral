<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import OnboardingScaffold from '@/components/shared/OnboardingScaffold.vue'
import StarFetchProgress from '@/components/stars/StarFetchProgress.vue'
import { useAuth } from '@/composables/use-auth'
import { useSyncToLocalStorage } from '@/composables/useSyncToLocalStorage'
import { useSyncValuesToStores } from '@/composables/useSyncValuesToStores'
import { useStarsStore } from '@/store/useStarsStore'
import { useUserStore } from '@/store/useUserStore'
import axios from 'axios'
import { router } from 'hybridly'
import { computed, nextTick, ref } from 'vue'

const { user } = useAuth()

const starsStore = useStarsStore()
const userStore = useUserStore()

type Phase = 'ready' | 'fetching' | 'error'
const phase = ref<Phase>('ready')

// The user store feeds fetchAllStars its GitHub access token.
useSyncValuesToStores([userStore, 'user', computed(() => user.value)])

// Persist the fetched list so it survives the redirect to the dashboard, and so an
// interrupted fetch resumes instead of restarting. Mirrors the migrate flow.
const reposRestored = useSyncToLocalStorage(starsStore, 'starredRepos')
const syncStateRestored = useSyncToLocalStorage(starsStore, 'isFullySynced')

const landOnDashboard = async () => {
  await axios.post(route('welcome.complete'))
  router.get(route('dashboard.show'))
}

const beginFetch = async () => {
  phase.value = 'fetching'

  try {
    await Promise.all([reposRestored, syncStateRestored])
    await nextTick()

    // ponytail: a small floor so a tiny library doesn't flash the screen away instantly.
    await Promise.all([starsStore.fetchAllStars(), new Promise(resolve => setTimeout(resolve, 1200))])

    await landOnDashboard()
  } catch {
    phase.value = 'error'
  }
}

// The dashboard is gated behind this screen, so a failing fetch must not trap the user:
// clear the gate and let the dashboard fetch inline as it normally would.
const continueAnyway = () => landOnDashboard()
</script>

<template>
  <OnboardingScaffold>
    <Transition
      name="swap"
      mode="out-in"
    >
      <!-- Ready: greet the user and invite them to pull their stars in. -->
      <div
        v-if="phase === 'ready'"
        key="ready"
        class="mt-8 flex w-full flex-col items-center"
      >
        <h1 class="text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl">
          Your stars, finally searchable
        </h1>

        <p class="mt-4 text-base leading-relaxed text-pretty text-gray-300">
          Tag, note, and find any repo in seconds. Let's bring them in.
        </p>

        <BaseButton
          kind="primary"
          size="xl"
          class="group mt-8 gap-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          @click="beginFetch"
        >
          <span>Get started</span>

          <i-ph-arrow-right
            class="h-5 w-5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            role="presentation"
          />
        </BaseButton>

        <p class="mt-4 text-xs text-gray-400">
          Astral only reads your stars from GitHub; nothing on your account is changed.
        </p>
      </div>

      <!-- Error: never leave the user stuck behind the gate. -->
      <div
        v-else-if="phase === 'error'"
        key="error"
        class="mt-8 flex w-full flex-col items-center"
      >
        <h1 class="text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl">
          We couldn't reach GitHub
        </h1>

        <p class="mt-4 text-base leading-relaxed text-pretty text-gray-300">
          Fetching your stars didn't finish. Try again, or continue and Astral will keep syncing in the background.
        </p>

        <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <BaseButton
            kind="primary"
            size="xl"
            @click="beginFetch"
          >
            Try again
          </BaseButton>

          <BaseButton
            kind="base"
            size="xl"
            @click="continueAnyway"
          >
            Continue to Astral
          </BaseButton>
        </div>
      </div>

      <!-- Working: a single fetch phase with live progress, announced to assistive tech. -->
      <div
        v-else
        key="fetching"
        class="mt-8 flex w-full flex-col items-center"
        aria-live="polite"
      >
        <div class="w-full">
          <StarFetchProgress
            variant="onDark"
            label="Fetching your stars"
            :fetched-count="starsStore.fetchedCount"
            :total-repos="starsStore.totalRepos"
          />
        </div>

        <p class="mt-6 text-sm text-balance text-gray-400">Pulling every starred repo from your GitHub account.</p>

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
/* Crossfade between states. */
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

<script lang="ts" setup>
import Galileo from '@/components/galileo/Galileo.vue'
import GlobalToast from '@/components/GlobalToast.vue'
import UserMenu from '@/components/UserMenu.vue'
import NotesEditor from '@/components/notes-editor/NotesEditor.vue'
import Readme from '@/components/readme/Readme.vue'
import ConfirmDialog from '@/components/shared/dialogs/ConfirmDialog.vue'
import RenameTagDialog from '@/components/shared/dialogs/RenameTagDialog.vue'
import SettingsDialog from '@/components/shared/dialogs/SettingsDialog/SettingsDialog.vue'
import SmartFiltersDialog from '@/components/shared/dialogs/SmartFilterDialog.vue'
import SponsorshipDialog from '@/components/shared/dialogs/SponsorshipDialog.vue'
import UpgradeOAuthScopeDialog from '@/components/shared/dialogs/UpgradeAuthScopeDialog.vue'
import Sidebar from '@/components/sidebar/Sidebar.vue'
import StarredRepo from '@/components/stars/StarredRepo.vue'
import StarredRepoList from '@/components/stars/StarredRepoList.vue'
import RepoToolbar from '@/components/toolbar/RepoToolbar.vue'
import { useAppearance } from '@/composables/useAppearance'
import { useAuth } from '@/composables/use-auth'
import { useFlashBag } from '@/composables/use-flash-bag'
import { ToastType, useGlobalToast } from '@/composables/useGlobalToast'
import { useListSelectionState } from '@/composables/useListSelectionState'
import { useSettingsDialog } from '@/composables/useSettingsDialog'
import { useSponsorshipDialog } from '@/composables/useSponsorshipDialog'
import { useSyncValuesToStores } from '@/composables/useSyncValuesToStores'
import { useUrlParams } from '@/composables/useUrlParams'
import LogoSvg from '@/img/logo.svg?component'
import { useSmartFiltersStore } from '@/store/useSmartFiltersStore'
import { useStarsFilterStore } from '@/store/useStarsFilterStore'
import { useStarsStore } from '@/store/useStarsStore'
import { useTagsStore } from '@/store/useTagsStore'
import { useUserStore } from '@/store/useUserStore'
import { GitHubRepo } from '@/types'
import { useTour } from '@/composables/useTour'
import { parsePendingInput, parseSearchString, serializeSearch } from '@/utils/search'
import { Bars3CenterLeftIcon as MenuIcon } from '@heroicons/vue/24/outline'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import { driver, type DriveStep } from 'driver.js'
import localForage from 'localforage'
import ConfettiExplosion from 'vue-confetti-explosion'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<App.Data.DashboardData>()
const { user } = useAuth()
const flashBag = useFlashBag()

const userStore = useUserStore()
const tagsStore = useTagsStore()
const starsStore = useStarsStore()
const starsFilterStore = useStarsFilterStore()
const smartFiltersStore = useSmartFiltersStore()
const { show: showSponsorshipDialog } = useSponsorshipDialog()
const { show: showSettingsDialog } = useSettingsDialog()
const { params: urlParams } = useUrlParams()
const { show: showToast } = useGlobalToast()

// Seeds the appearance store from the user setting and keeps `system` in sync
// with live OS changes; the initial paint is handled in root.blade.php.
useAppearance()

useSyncValuesToStores(
  [userStore, 'user', computed(() => user.value)],
  [tagsStore, 'tags', computed(() => props.tags)],
  [starsStore, 'userStars', computed(() => props.stars)],
  [smartFiltersStore, 'smartFilters', computed(() => props.smartFilters)]
)

const isStarsListFocused = ref(false)
const isSidebarOpen = ref(false)

// On mobile the readme pane slides over the list; it's open exactly when a repo
// is selected, so "back" is simply clearing the selection.
const isReadmeOpen = computed(() => starsStore.isAnyRepoSelected)

const { selectItem, selectedItems } = useListSelectionState(
  computed(() => starsStore.filteredRepos.map(repo => repo.node)),
  isStarsListFocused
)

/**
 * After each request finishes we check the session to see if
 * the user attempted to do something that requires an active
 * sponsorship. If true, show them the Sponsor dialog.
 */
registerHook('error', errors => {
  if (errors.sponsorship_required) {
    showSponsorshipDialog(errors.sponsorship_required as App.Data.Enums.Ability)
  }
})

registerHook('success', () => {
  if (flashBag.success.value) {
    showToast(flashBag.success.value, ToastType.Success)
  }

  if (flashBag.error.value) {
    showToast(flashBag.error.value, ToastType.Error)
  }
})

const onAllStarsSelected = () => {
  isSidebarOpen.value = false
  starsFilterStore.setFilterByAll()
  urlParams.smartFilter = null
}

const onUntaggedSelected = () => {
  isSidebarOpen.value = false
  starsFilterStore.setFilterByUntagged()
  urlParams.smartFilter = null
}

const onTagSelected = (tag: App.Data.TagData) => {
  isSidebarOpen.value = false
  starsFilterStore.setFilterByTag(tag.name)
}

const onSmartFilterSelected = (smartFilter: App.Data.SmartFilterData) => {
  isSidebarOpen.value = false
  starsFilterStore.setSelectedSmartFilter(smartFilter)
  urlParams.smartFilter = smartFilter.name
}

const onLanguageSelected = (language: string) => {
  isSidebarOpen.value = false
  starsFilterStore.addSearchToken({ type: 'lang', value: language })
}

const onRepoSelected = (repo: GitHubRepo) => {
  selectItem(repo.node)
}

const onReloadStars = async () => {
  await localForage.clear()
  starsStore.clearStarredRepos()

  await nextTick()

  await starsStore.fetchAllStars()
}

watch(selectedItems, repos => {
  starsStore.selectedRepos = repos
})

// The whole search bar (committed tokens + free text) round-trips through the
// `?search=` param; the string guards on both directions keep the URL and the
// store from ping-ponging updates.
const serializedSearch = computed(() =>
  serializeSearch(starsFilterStore.searchTokens, parsePendingInput(starsFilterStore.searchText).freeText)
)

watch(serializedSearch, serialized => {
  if ((urlParams.search ?? '') !== serialized) {
    urlParams.search = serialized || null
  }
})

watch(
  urlParams,
  params => {
    if (params.search != null && params.search !== serializedSearch.value) {
      const { freeText, tokens } = parseSearchString(params.search)

      starsFilterStore.searchTokens = tokens
      starsFilterStore.searchText = freeText
    }
  },
  { immediate: true }
)

// --- App tour --------------------------------------------------------------
// A first-run driver.js walkthrough of the app's key regions. Auto-starts once
// (until the `app-tour-completed` flag is set) and is replayable from Settings.
// Defined here because the steps drive local state the tour can't reach on its
// own: opening the mobile sidebar and selecting a repo to reveal its detail pane.

const { startSignal } = useTour()
const checkForSponsorship = useProperty<boolean>('checkForSponsorship')
const sponsorUrl = useProperty<string>('sponsorUrl')
const isMobile = useMediaQuery('(max-width: 639px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const showConfetti = ref(false)

let driverObj: ReturnType<typeof driver> | undefined

const hasCompletedTour = computed(() => !!user.value?.flags?.find(flag => flag.key === 'app-tour-completed')?.value)

// The sidebar is a slide-over only below `sm`; on wider screens it's always
// visible, so driving `isSidebarOpen` there would wrongly shift the layout.
const openSidebarIfMobile = () => {
  if (!isMobile.value) {
    return
  }

  isSidebarOpen.value = true
  window.setTimeout(() => driverObj?.refresh(), 340)
}

const closeSidebarIfMobile = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const selectFirstRepo = () => {
  closeSidebarIfMobile()

  const first = starsStore.filteredRepos[0]
  if (!first) {
    return
  }

  selectItem(first.node)
  window.setTimeout(() => driverObj?.refresh(), isMobile.value ? 340 : 60)
}

const fireConfetti = () => {
  closeSidebarIfMobile()

  if (reducedMotion.value) {
    return
  }

  showConfetti.value = false
  nextTick(() => {
    showConfetti.value = true
  })
}

const buildTourSteps = (): DriveStep[] => {
  const steps: DriveStep[] = [
    {
      popover: {
        title: 'Welcome to Astral 🔭',
        description:
          'A 30-second tour of where everything lives. You can skip anytime — and replay it later from Settings.',
      },
      onHighlightStarted: closeSidebarIfMobile,
    },
    {
      element: '[role="combobox"]',
      popover: {
        title: 'Search everything',
        description:
          'Find any repo by name, or narrow things down with <code>lang:</code>, <code>tag:</code>, and <code>topic:</code> filters. Press <code>/</code> anywhere to jump straight here.',
        side: 'bottom',
        align: 'start',
      },
      onHighlightStarted: closeSidebarIfMobile,
    },
    {
      element: '[aria-label="Stars"]',
      popover: {
        title: 'Your stars, organized',
        description:
          'Browse all your stars or just the untagged ones — and re-sync from GitHub anytime with the refresh button.',
        side: 'right',
        align: 'start',
      },
      onHighlightStarted: openSidebarIfMobile,
    },
    {
      element: '[aria-label="Tags"]',
      popover: {
        title: 'Tag to organize',
        description: 'Create tags, then drag any repo onto one to file it. Drag tags themselves to reorder.',
        side: 'right',
        align: 'start',
      },
      onHighlightStarted: openSidebarIfMobile,
    },
    {
      element: '[aria-label="Smart Filters"]',
      popover: {
        title: 'Smart Filters',
        description: 'Save a search as a reusable filter that keeps itself up to date as you star more repos.',
        side: 'right',
        align: 'start',
      },
      onHighlightStarted: openSidebarIfMobile,
    },
  ]

  if (starsStore.filteredRepos.length > 0) {
    steps.push({
      element: '[data-tour="repo-detail"]',
      popover: {
        title: 'Everything about a repo',
        description: 'Select a repo to read its README, jot down notes, copy a clone command, or open it on GitHub.',
        side: 'left',
        align: 'start',
      },
      onHighlightStarted: selectFirstRepo,
    })
  }

  if (checkForSponsorship.value) {
    const isSponsor = user.value?.isSponsor

    steps.push({
      popover: {
        title: isSponsor ? 'Thanks for sponsoring 💚' : 'Powered by sponsors',
        description: isSponsor
          ? 'Notes and Smart Filters are unlocked for you as a sponsor — thank you for supporting Astral.'
          : `Notes and Smart Filters are a thank-you to people who sponsor Astral. <a href="${sponsorUrl.value}" target="_blank" rel="noopener noreferrer">Become a sponsor →</a>`,
      },
      onHighlightStarted: closeSidebarIfMobile,
    })
  }

  steps.push({
    popover: {
      title: "You're all set",
      description: 'Replay this tour anytime from <strong>Settings → General</strong>. Now go tame those stars.',
    },
    onHighlightStarted: fireConfetti,
  })

  return steps
}

const runTour = () => {
  if (driverObj?.isActive()) {
    return
  }

  const steps = buildTourSteps().filter(step => !step.element || !!document.querySelector(step.element as string))

  driverObj = driver({
    showProgress: true,
    animate: !reducedMotion.value,
    allowClose: true,
    disableActiveInteraction: true,
    popoverClass: 'astral-tour',
    overlayColor: '#111827',
    overlayOpacity: 0.6,
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    doneBtnText: 'Done',
    steps,
    onDestroyed: () => {
      showConfetti.value = false
      closeSidebarIfMobile()

      // Skipping counts as seen too. Idempotent, so a replay re-posting is fine.
      if (!hasCompletedTour.value) {
        axios.post(route('tour.complete')).catch(() => {})
      }
    },
  })

  driverObj.drive()
}

watch(startSignal, () => runTour())

onMounted(() => {
  if (hasCompletedTour.value) {
    return
  }

  // Give the star list a beat to render so its anchors exist before we filter steps.
  window.setTimeout(runTour, 150)
})
</script>

<template>
  <div class="absolute left-0 top-0 h-screen w-screen overflow-hidden bg-gray-50">
    <div class="dashboard-grid grid h-screen">
      <!-- Nav -->
      <div
        class="col-span-full flex items-center bg-brand-600 px-4 transition-transform duration-300"
        :class="{
          'translate-x-8': isSidebarOpen,
        }"
      >
        <div class="flex w-1/3 items-center sm:hidden">
          <button
            class="inline-flex h-6 w-6 items-center justify-center text-white"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            <MenuIcon />
          </button>
        </div>

        <div class="flex w-1/3 shrink-0 items-center justify-start">
          <LogoSvg
            class="h-6 fill-current text-white sm:h-8"
            aria-label="Astral"
          />
        </div>

        <div class="flex w-1/3 justify-end sm:w-2/3">
          <UserMenu @show-settings="showSettingsDialog" />
        </div>
      </div>

      <!-- Sidebar -->
      <div
        class="absolute inset-0 z-20 col-start-1 row-start-2 row-end-3 flex transition-colors duration-300 ease-in-out sm:pointer-events-auto sm:relative"
        :aria-hidden="!isSidebarOpen"
        :class="{
          'pointer-events-none bg-gray-900/0': !isSidebarOpen,
          'bg-gray-900/75 backdrop-blur-xs': isSidebarOpen,
        }"
      >
        <div
          class="w-3/4 transform-gpu transition-transform duration-300 ease-in-out sm:w-full sm:translate-x-0"
          :class="{
            '-translate-x-full': !isSidebarOpen,
            'translate-x-0': isSidebarOpen,
          }"
        >
          <Sidebar
            @all-stars-selected="onAllStarsSelected"
            @untagged-selected="onUntaggedSelected"
            @tag-selected="onTagSelected"
            @smart-filter-selected="onSmartFilterSelected"
            @language-selected="onLanguageSelected"
            @reload-stars="onReloadStars"
          />
        </div>

        <button
          v-show="isSidebarOpen"
          class="flex grow justify-center pt-5"
          aria-label="Close Sidebar"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <div
            class="inline-flex h-8 w-8 items-center justify-center text-4xl text-white/75"
            role="presentation"
          >
            <i-lucide-circle-x class="w-full h-full" />
          </div>
        </button>
      </div>

      <!-- Starred Repo List -->
      <div
        class="relative flex flex-col border-r border-gray-300 transition-transform duration-300 dark:border-gray-950 dark:bg-black"
        :class="{
          'translate-x-8': isSidebarOpen,
        }"
      >
        <Galileo />

        <StarredRepoList
          v-slot="{ repo }"
          @focus="isStarsListFocused = true"
          @blur="isStarsListFocused = false"
        >
          <StarredRepo
            :repo="repo"
            @selected="onRepoSelected"
          />
        </StarredRepoList>
      </div>

      <!-- Selected Star Info -->
      <div
        data-tour="repo-detail"
        class="pointer-events-auto absolute inset-0 z-10 col-start-3 row-start-2 row-end-3 transform-gpu bg-white transition-transform duration-300 ease-in-out dark:bg-gray-900 sm:relative sm:translate-x-0"
        :class="{
          'pointer-events-none translate-x-full': !isReadmeOpen,
          'translate-x-0': isReadmeOpen,
        }"
      >
        <div class="relative flex h-full flex-col">
          <RepoToolbar v-if="starsStore.isAnyRepoSelected" />

          <Readme />

          <NotesEditor
            v-if="starsStore.isAnyRepoSelected"
            is-open
          />
        </div>
      </div>
    </div>

    <SponsorshipDialog />

    <RenameTagDialog />

    <SettingsDialog />

    <UpgradeOAuthScopeDialog />

    <SmartFiltersDialog />

    <GlobalToast />

    <ConfirmDialog />

    <div
      v-if="showConfetti"
      class="pointer-events-none fixed inset-x-0 top-1/3 z-[1000000001] flex justify-center"
      aria-hidden="true"
    >
      <ConfettiExplosion
        :colors="['#10b981', '#059669', '#34d399', '#6ee7b7']"
        :particle-count="120"
        :duration="2600"
      />
    </div>
  </div>
</template>

<style>
.dashboard-grid {
  grid-template-columns: 1fr;
  grid-template-rows: 48px calc(100vh - 48px);
}

@media screen and (min-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 320px 400px 1fr;
    grid-template-rows: 64px calc(100vh - 64px);
  }
}
</style>

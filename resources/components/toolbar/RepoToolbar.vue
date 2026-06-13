<script lang="ts" setup>
import CloneMenu from '@/components/toolbar/CloneMenu.vue'
import EditTagsMenu from '@/components/toolbar/EditTagsMenu.vue'
import ToolbarButton from '@/components/toolbar/ToolbarButton.vue'
import { useAuth } from '@/composables/use-auth'
import { useConfirm } from '@/composables/useConfirm'
import { useNotesEditor } from '@/composables/useNotesEditor'
import { useSponsorshipDialog } from '@/composables/useSponsorshipDialog'
import { useUpgradeAuthScopeDialog } from '@/composables/useUpgradeAuthScopeDialog'
import { useStarsStore } from '@/store/useStarsStore'
import { Ability, AuthScope } from '@/types'
import { isFocusedElementEditable } from '@/utils'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { onKeyStroke } from '@vueuse/core'
import { computed } from 'vue'

const { user } = useAuth()
const starsStore = useStarsStore()
const { isOpen: isNotesEditorOpen, show: showNotesEditor, toggle: toggleNotesEditor } = useNotesEditor()
const { show: showSponsorshipDialog } = useSponsorshipDialog()
const { show: showUpgradeAuthScopeDialog } = useUpgradeAuthScopeDialog()
const { isConfirmed } = useConfirm()

const selectedCount = computed(() => starsStore.selectedRepos.length)
const isMultiSelect = computed(() => selectedCount.value > 1)

const repo = computed(() => starsStore.selectedRepo)
const repoOwner = computed(() => repo.value.nameWithOwner?.split('/')[0] ?? '')
const repoName = computed(() => repo.value.nameWithOwner?.split('/').slice(1).join('/') ?? '')
const currentStarHasNotes = computed(() => !!starsStore.userStarsByRepoId[repo.value.databaseId]?.notes)

const ifAllowedToAddNotes = (action: () => void) => {
  if (user.value?.abilities[Ability.ADD_NOTES]) {
    action()
  } else {
    showSponsorshipDialog(Ability.ADD_NOTES)
  }
}

const handleToggleNotesEditor = () => ifAllowedToAddNotes(toggleNotesEditor)

const goBack = () => (starsStore.selectedRepos = [])

const removeSelectedStar = async () => {
  if (user.value?.scope !== AuthScope.PUBLIC_REPO) {
    showUpgradeAuthScopeDialog()
  } else {
    if (
      await isConfirmed(`Are you sure you want to unstar ${repo.value.nameWithOwner}?`, {
        cancelLabel: 'Nevermind',
        confirmLabel: "Yes, I'm sure",
      })
    ) {
      starsStore.removeStar(repo.value.id)
    }
  }
}

onKeyStroke('n', e => {
  if (!isFocusedElementEditable()) {
    e.preventDefault()
    ifAllowedToAddNotes(showNotesEditor)
  }
})
</script>

<template>
  <div
    class="flex h-16 shrink-0 items-center gap-2 border-b border-gray-300 bg-gray-50 px-3 shadow-xs sm:px-4 dark:border-gray-950 dark:bg-gray-800"
  >
    <div class="sm:hidden">
      <ToolbarButton
        label="Back to your stars"
        @click="goBack"
      >
        <i-lucide-arrow-left class="h-4 w-4" />
      </ToolbarButton>
    </div>

    <div class="flex min-w-0 flex-1 items-center">
      <p
        v-if="isMultiSelect"
        class="truncate text-sm font-semibold text-gray-700 dark:text-gray-200"
      >
        {{ selectedCount }} stars selected
      </p>

      <h2
        v-else
        class="flex min-w-0 items-baseline text-sm font-semibold"
      >
        <span class="min-w-0 truncate text-gray-500 dark:text-gray-400">{{ repoOwner }}</span>

        <span class="shrink-0 text-gray-500 dark:text-gray-400">/</span>

        <span class="min-w-0 truncate text-brand-600 dark:text-brand-500">{{ repoName }}</span>
      </h2>
    </div>

    <div
      v-if="!isMultiSelect"
      class="flex items-center gap-1"
    >
      <ToolbarButton
        :active="isNotesEditorOpen"
        :label="`${isNotesEditorOpen ? 'Hide' : 'Show'} notes`"
        aria-keyshortcuts="n"
        @click="handleToggleNotesEditor()"
      >
        <i-lucide-notebook-text
          v-if="currentStarHasNotes"
          class="h-4 w-4"
        />

        <i-lucide-notebook
          v-else
          class="h-4 w-4"
        />
      </ToolbarButton>

      <CloneMenu />

      <EditTagsMenu />

      <div class="hidden items-center gap-1 sm:flex">
        <ToolbarButton
          as="link"
          :href="repo.url"
          target="_blank"
          rel="noopener noreferrer"
          label="Open on GitHub"
        >
          <i-lucide-github class="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          tone="danger"
          label="Unstar repository"
          @click="removeSelectedStar"
        >
          <i-lucide-star-off class="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Menu
        v-slot="{ open }"
        as="div"
        class="relative sm:hidden"
      >
        <MenuButton
          :as="ToolbarButton"
          :active="open"
          label="More actions"
        >
          <i-lucide-ellipsis class="h-4 w-4" />
        </MenuButton>

        <transition
          enter-active-class="transition duration-100 ease-out motion-reduce:transition-none"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in motion-reduce:transition-none"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems
            class="absolute right-0 top-full z-40 mt-2 w-52 origin-top-right overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800"
          >
            <MenuItem v-slot="{ active }">
              <a
                :href="repo.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-4 py-2.5 text-sm"
                :class="
                  active
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300'
                "
              >
                <i-lucide-github
                  class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
                  role="presentation"
                />

                <span>Open on GitHub</span>
              </a>
            </MenuItem>

            <MenuItem v-slot="{ active }">
              <button
                type="button"
                class="flex w-full items-center gap-3 px-4 py-2.5 text-sm"
                :class="
                  active
                    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                    : 'text-red-600 dark:text-red-500'
                "
                @click="removeSelectedStar"
              >
                <i-lucide-star-off
                  class="h-4 w-4 shrink-0"
                  role="presentation"
                />

                <span>Unstar repository</span>
              </button>
            </MenuItem>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
</template>

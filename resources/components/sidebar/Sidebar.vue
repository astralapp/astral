<script lang="ts" setup>
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import SidebarGroup from '@/components/sidebar/SidebarGroup.vue'
import SidebarItem from '@/components/sidebar/SidebarItem.vue'
import SidebarSmartFilter from '@/components/sidebar/SidebarSmartFilter.vue'
import SidebarTag from '@/components/sidebar/SidebarTag.vue'
import SortTagsMenu from '@/components/sidebar/SortTagsMenu.vue'
import { useAbilities } from '@/composables/use-abilities'
import { useAuth } from '@/composables/use-auth'
import { useSmartFilterDialog } from '@/composables/useSmartFilterDialog'
import { useSmartFiltersStore } from '@/store/useSmartFiltersStore'
import { useStarsFilterStore } from '@/store/useStarsFilterStore'
import { useStarsStore } from '@/store/useStarsStore'
import { useTagsStore } from '@/store/useTagsStore'
import { Ability, StarDragDataTransferData } from '@/types'
import { router } from 'hybridly'
import { Sortable } from 'sortablejs-vue3'
import { computed, nextTick, reactive, ref, watch } from 'vue'

type CollapsibleSidebarSettingsKey = Extract<keyof App.Data.UserSettingsData, `sidebar_${string}`>
type SidebarGroupCollapsedState = { [K in CollapsibleSidebarSettingsKey]: boolean }

const LANGUAGES_VISIBLE_LIMIT = 10

const emit = defineEmits<{
  (e: 'all-stars-selected'): void
  (e: 'language-selected', value: string): void
  (e: 'reload-stars'): void
  (e: 'smart-filter-selected', value: App.Data.SmartFilterData): void
  (e: 'tag-selected', tag: App.Data.TagData): void
  (e: 'untagged-selected'): void
}>()

const { user } = useAuth()

const starsFilterStore = useStarsFilterStore()
const tagsStore = useTagsStore()
const starsStore = useStarsStore()
const smartFiltersStore = useSmartFiltersStore()
const { show: showSmartFilterDialog } = useSmartFilterDialog()
const { gate } = useAbilities()

const newTagForm = ref<null | typeof BaseTextInput>(null)
const newTag = ref('')
const isNewTagFormShowing = ref(false)

const sidebarGroupCollapsedState: SidebarGroupCollapsedState = reactive({
  sidebar_languages_collapsed: user.value?.settings.sidebar_languages_collapsed ?? false,
  sidebar_smart_filters_collapsed: user.value?.settings.sidebar_smart_filters_collapsed ?? false,
  sidebar_tags_collapsed: user.value?.settings.sidebar_tags_collapsed ?? false,
})

const tags = computed({
  get: () => tagsStore.tags,
  set: val => {
    tagsStore.tags = val
  },
})

const smartFilters = computed({
  get: () => smartFiltersStore.smartFilters,
  set: val => {
    smartFiltersStore.smartFilters = val
  },
})

const totalRepos = computed(() => starsStore.totalRepos || starsStore.starredRepos.length)
const totalUntaggedRepos = computed(() => starsStore.untaggedStars.length)

const showNewTagForm = () => {
  isNewTagFormShowing.value = true
  newTagForm.value?.$el?.focus()
}

const doAddTag = async (tagName: string) => {
  await tagsStore.addTag(tagName)

  newTag.value = ''
}

const hideNewTagForm = () => {
  isNewTagFormShowing.value = false
  newTag.value = ''
}

const tagIsSelected = (tag: App.Data.TagData): boolean =>
  starsFilterStore.searchTokens.some(token => token.type === 'tag' && token.value === tag.name)
const smartFilterIsSelected = (smartFilter: App.Data.SmartFilterData): boolean =>
  smartFilter.id === starsFilterStore.selectedSmartFilter?.id
const languageIsSelected = (language: string): boolean =>
  starsFilterStore.searchTokens.some(token => token.type === 'lang' && token.value === language)

const isLanguagesExpanded = ref(false)

const visibleLanguages = computed(() =>
  isLanguagesExpanded.value ? starsStore.languages : starsStore.languages.slice(0, LANGUAGES_VISIBLE_LIMIT)
)

const hiddenLanguageCount = computed(() => Math.max(starsStore.languages.length - LANGUAGES_VISIBLE_LIMIT, 0))

// Reveal the rest of the list whenever an active language filter lives past the cap — e.g. picking a
// language chip on a repo that wouldn't otherwise be visible until "View more" is clicked. Re-runs as
// languages populate after stars load, so a deep-linked language still expands once its row exists.
const activeLanguages = computed(() =>
  starsFilterStore.searchTokens.filter(token => token.type === 'lang').map(token => token.value)
)

watch(
  [activeLanguages, () => starsStore.languages],
  ([languages, allLanguages]) => {
    if (
      languages.some(language => allLanguages.findIndex(({ name }) => name === language) >= LANGUAGES_VISIBLE_LIMIT)
    ) {
      isLanguagesExpanded.value = true
    }
  },
  { immediate: true }
)

const onStarsDropped = (data: StarDragDataTransferData) => starsStore.addTagToStars(data.tag.id, data.repos)

const doShowSmartFilterDialog = () => gate(Ability.CREATE_SMART_FILTER, showSmartFilterDialog)

const toggleSidebarGroupCollapsedState = async (key: CollapsibleSidebarSettingsKey) => {
  sidebarGroupCollapsedState[key] = !sidebarGroupCollapsedState[key]

  const data: App.Requests.UpdateUserSettingsRequest = {
    enabled: sidebarGroupCollapsedState[key],
    key,
  }

  await nextTick()

  router.put(route('settings.update'), {
    data,
    only: ['user'],
  })
}
</script>

<template>
  <div class="h-full overflow-y-auto bg-gray-900 dark:bg-gray-800 p-4 dark:border-r dark:border-gray-950">
    <div class="mt-6 space-y-6">
      <SidebarGroup title="Stars">
        <template #right-action>
          <div class="pb-1">
            <button
              aria-label="Reload stars"
              :aria-busy="starsStore.isFetchingStars"
              :disabled="starsStore.isFetchingStars"
              class="rounded-sm p-1 text-gray-400 transition-colors enabled:hover:bg-gray-700 enabled:hover:text-white disabled:cursor-default focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200"
              @click="emit('reload-stars')"
            >
              <i-lucide-refresh-cw
                class="h-4 w-4"
                :class="{
                  'animate-spin': starsStore.isFetchingStars,
                }"
              />
            </button>
          </div>
        </template>

        <ul
          class="mt-2 space-y-2"
          role="listbox"
          aria-label="Stars"
        >
          <SidebarItem
            title="All Stars"
            :is-active="starsFilterStore.isFilteringByAll"
            :count="totalRepos"
            @click="emit('all-stars-selected')"
          >
            <template #icon>
              <i-lucide-inbox class="w-4 h-4" />
            </template>
          </SidebarItem>

          <SidebarItem
            title="Untagged Stars"
            :is-active="starsFilterStore.isFilteringByUntagged"
            :count="totalUntaggedRepos"
            @click="emit('untagged-selected')"
          >
            <template #icon>
              <i-lucide-star class="w-4 h-4" />
            </template>
          </SidebarItem>
        </ul>
      </SidebarGroup>

      <SidebarGroup
        title="Tags"
        collapsible
        class="relative"
        :is-open="!sidebarGroupCollapsedState.sidebar_tags_collapsed"
        :close="() => toggleSidebarGroupCollapsedState('sidebar_tags_collapsed')"
      >
        <template #right-action>
          <SortTagsMenu
            v-if="tags.length > 1"
            class="-mt-1"
            @sort-tags="tagsStore.sortTags"
          />
        </template>

        <template #default>
          <div class="relative mt-2 flex h-10 items-center">
            <button
              class="inline-flex w-full items-center rounded-sm text-sm font-semibold text-gray-400 transition hover:text-gray-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:text-gray-300 dark:hover:text-gray-200"
              :class="{ 'pointer-events-none opacity-0': isNewTagFormShowing }"
              :tabindex="isNewTagFormShowing ? -1 : undefined"
              type="button"
              @click="showNewTagForm"
            >
              <i-lucide-circle-plus
                class="h-4 w-4 shrink-0"
                role="presentation"
              />

              <span class="ml-2">Add a tag...</span>
            </button>

            <form
              class="pointer-events-none absolute left-0 top-0 w-full opacity-0 transition-opacity duration-150"
              :class="{
                'pointer-events-auto opacity-100': isNewTagFormShowing,
              }"
              @submit.prevent="doAddTag(newTag)"
            >
              <BaseTextInput
                ref="newTagForm"
                v-model="newTag"
                type="text"
                placeholder="Enter a tag name..."
                aria-label="Tag name"
                class="w-full"
                @blur="hideNewTagForm"
              />
            </form>
          </div>

          <ul
            class="mt-2"
            role="listbox"
            aria-label="Tags"
          >
            <Sortable
              :list="tags"
              item-key="id"
              :options="{
                ghostClass: 'sortable-ghost',
                animation: 150,
              }"
              class="space-y-2"
              @end="({ oldIndex, newIndex }) => tagsStore.syncTagOrder(oldIndex, newIndex)"
            >
              <template #item="{ element: tag }">
                <SidebarTag
                  :tag="tag"
                  :is-active="tagIsSelected(tag)"
                  @stars-dropped="onStarsDropped"
                  @click="emit('tag-selected', tag)"
                />
              </template>
            </Sortable>
          </ul>
        </template>
      </SidebarGroup>

      <SidebarGroup
        title="Smart Filters"
        collapsible
        class="relative"
        :is-open="!sidebarGroupCollapsedState.sidebar_smart_filters_collapsed"
        :close="() => toggleSidebarGroupCollapsedState('sidebar_smart_filters_collapsed')"
      >
        <template #right-action>
          <button
            class="inline-flex items-center rounded-sm text-gray-400 opacity-0 transition hover:text-gray-200 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 group-hover:opacity-100"
            type="button"
            aria-label="Add smart filter"
            @click="doShowSmartFilterDialog"
          >
            <i-lucide-circle-plus
              class="h-4 w-4 shrink-0"
              role="presentation"
            />
          </button>
        </template>

        <template #default>
          <ul
            class="mt-2 space-y-2"
            role="listbox"
            aria-label="Smart Filters"
          >
            <Sortable
              :list="smartFilters"
              item-key="id"
              :options="{
                ghostClass: 'sortable-ghost',
                animation: 150,
              }"
              class="space-y-2"
              @end="({ oldIndex, newIndex }) => smartFiltersStore.syncSmartFiltersOrder(oldIndex, newIndex)"
            >
              <template #item="{ element: smartFilter }">
                <SidebarSmartFilter
                  :smart-filter="smartFilter"
                  :is-active="smartFilterIsSelected(smartFilter)"
                  @click="emit('smart-filter-selected', smartFilter)"
                />
              </template>
            </Sortable>
          </ul>
        </template>
      </SidebarGroup>

      <SidebarGroup
        title="Languages"
        collapsible
        :is-open="!sidebarGroupCollapsedState.sidebar_languages_collapsed"
        :close="() => toggleSidebarGroupCollapsedState('sidebar_languages_collapsed')"
      >
        <ul
          class="mt-2 space-y-2"
          role="listbox"
          aria-label="Languages"
        >
          <SidebarItem
            v-for="language in visibleLanguages"
            :key="language.name"
            :title="language.name"
            :count="language.count"
            :is-active="languageIsSelected(language.name)"
            @click="emit('language-selected', language.name)"
          />
        </ul>

        <button
          v-if="hiddenLanguageCount > 0"
          type="button"
          class="mt-3 inline-flex w-full items-center rounded-sm text-sm font-semibold text-gray-400 transition-colors hover:text-gray-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:text-gray-300 dark:hover:text-gray-200"
          :aria-expanded="isLanguagesExpanded"
          @click="isLanguagesExpanded = !isLanguagesExpanded"
        >
          <i-lucide-chevron-down
            class="h-4 w-4 shrink-0 transform transition-transform"
            :class="{ 'rotate-180': isLanguagesExpanded }"
            role="presentation"
          />

          <span class="ml-2">{{ isLanguagesExpanded ? 'View less' : `View more (${hiddenLanguageCount})` }}</span>
        </button>
      </SidebarGroup>
    </div>
  </div>
</template>

<style>
.sortable-ghost {
  opacity: 0;
}
</style>

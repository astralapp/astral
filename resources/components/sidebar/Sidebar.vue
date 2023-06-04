<script lang="ts" setup>
import { ref, computed, reactive, nextTick } from 'vue'
import { Errors } from '@inertiajs/core'
import { router } from '@inertiajs/vue3'
import { InboxIcon, StarIcon, PlusCircleIcon, RefreshIcon } from '@heroicons/vue/outline'
import { Sortable } from 'sortablejs-vue3'

import SidebarGroup from '@/views/components/sidebar/SidebarGroup.vue'
import SidebarItem from '@/views/components/sidebar/SidebarItem.vue'
import SidebarTag from '@/views/components/sidebar/SidebarTag.vue'
import SidebarSmartFilter from '@/views/components/sidebar/SidebarSmartFilter.vue'
import SortTagsMenu from '@/views/components/sidebar/SortTagsMenu.vue'

import { useGlobalToast, ToastType } from '@/scripts/composables/useGlobalToast'
import { useSmartFilterDialog } from '@/scripts/composables/useSmartFilterDialog'
import { useSponsorshipDialog } from '@/scripts/composables/useSponsorshipDialog'

import { SPONSORSHIP_REQUIRED_ERROR } from '@/scripts/constants'

import { useTagsStore } from '@/scripts/store/useTagsStore'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { useStarsFilterStore } from '@/scripts/store/useStarsFilterStore'
import { useSmartFiltersStore } from '@/scripts/store/useSmartFiltersStore'
import { useAuthorizationsStore } from '@/scripts/store/useAuthorizationsStore'

import { Tag, StarDragDataTransferData, Ability, SmartFilter, User } from '@/scripts/types'
import { useMe } from '@/scripts/composables/useMe'

type CollapsibleSidebarSettingsKey = Extract<keyof User['settings'], `sidebar_${string}`>
type SidebarGroupCollapsedState = { [K in CollapsibleSidebarSettingsKey]: boolean }

const emit = defineEmits<{
  (e: 'tag-selected', tag: Tag): void
  (e: 'smart-filter-selected', value: SmartFilter): void
  (e: 'language-selected', value: string): void
  (e: 'all-stars-selected'): void
  (e: 'untagged-selected'): void
  (e: 'reload-stars'): void
}>()

const { me } = useMe()

const starsFilterStore = useStarsFilterStore()
const tagsStore = useTagsStore()
const starsStore = useStarsStore()
const smartFiltersStore = useSmartFiltersStore()
const authorizationsStore = useAuthorizationsStore()
const { show: showSmartFilterDialog } = useSmartFilterDialog()
const { show: showSponsorshipDialog } = useSponsorshipDialog()
const { show: showToast } = useGlobalToast()

const newTagForm = ref<HTMLElement>()
const newTag = ref('')
const isNewTagFormShowing = ref(false)

const sidebarGroupCollapsedState: SidebarGroupCollapsedState = reactive({
  sidebar_tags_collapsed: me.value.settings.sidebar_tags_collapsed,
  sidebar_smart_filters_collapsed: me.value.settings.sidebar_smart_filters_collapsed,
  sidebar_languages_collapsed: me.value.settings.sidebar_languages_collapsed,
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
  newTagForm.value?.focus()
}

const doAddTag = async (tagName: string) => {
  try {
    await tagsStore.addTag(tagName)
    showToast(`The '${tagName}' tag was added.`)

    newTag.value = ''
  } catch (e) {
    const errors = e as Errors
    if (!errors[SPONSORSHIP_REQUIRED_ERROR]) {
      showToast(errors[Object.keys(errors)[0]], ToastType.Error)
    }
  }
}

const tagIsSelected = (tag: Tag): boolean => tag.id === starsFilterStore.selectedTag?.id
const smartFilterIsSelected = (smartFilter: SmartFilter): boolean =>
  smartFilter.id === starsFilterStore.selectedSmartFilter?.id
const languageIsSelected = (language: string): boolean => language === starsFilterStore.selectedLanguage

const onStarsDropped = (data: StarDragDataTransferData) => starsStore.addTagToStars(data.tag.id, data.repos)

const doShowSmartFilterDialog = () => {
  if (authorizationsStore.abilities[Ability.CREATE_SMART_FILTER]) {
    showSmartFilterDialog()
  } else {
    showSponsorshipDialog(Ability.CREATE_SMART_FILTER)
  }
}

const toggleSidebarGroupCollapsedState = async (key: CollapsibleSidebarSettingsKey) => {
  sidebarGroupCollapsedState[key] = !sidebarGroupCollapsedState[key]

  await nextTick()

  router.put(
    '/settings',
    { key: key, enabled: sidebarGroupCollapsedState[key] },
    {
      only: ['user'],
    }
  )
}
</script>

<template>
  <div class="h-full overflow-y-auto bg-gray-900 p-4 dark:border-r dark:border-gray-600">
    <div class="mt-6 space-y-6">
      <SidebarGroup title="Stars">
        <template #right-action>
          <div class="pb-1">
            <button
              aria-label="Reload stars"
              :aria-busy="starsStore.isFetchingStars"
              :disabled="starsStore.isFetchingStars"
              class="rounded p-1 text-gray-400 transition-colors"
              :class="{
                'hover:bg-gray-700 hover:text-white': !starsStore.isFetchingStars,
              }"
              @click="emit('reload-stars')"
            >
              <RefreshIcon
                class="h-4 w-4"
                :class="{
                  'animate-spin': starsStore.isFetchingStars,
                }"
              />
            </button>
          </div>
        </template>

        <ul class="mt-2 space-y-2" role="listbox" aria-label="Stars">
          <SidebarItem
            title="All Stars"
            :is-active="starsFilterStore.isFilteringByAll"
            :count="totalRepos"
            @click="emit('all-stars-selected')"
          >
            <template #icon>
              <InboxIcon />
            </template>
          </SidebarItem>

          <SidebarItem
            title="Untagged Stars"
            :is-active="starsFilterStore.isFilteringByUntagged"
            :count="totalUntaggedRepos"
            @click="emit('untagged-selected')"
          >
            <template #icon>
              <StarIcon />
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
          <SortTagsMenu v-if="tags.length > 1" class="-mt-1" @sort-tags="tagsStore.sortTags" />
        </template>

        <template #default>
          <div class="relative mt-2 flex h-10 items-center">
            <button
              class="inline-flex w-full items-center text-sm font-semibold text-gray-500 transition-colors hover:text-gray-400 focus:text-gray-400 focus:outline-none"
              :class="{ 'pointer-events-none': isNewTagFormShowing }"
              type="button"
              @click="showNewTagForm"
            >
              <PlusCircleIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />

              <span class="ml-2">Add a tag...</span>
            </button>

            <form
              class="pointer-events-none absolute left-0 top-0 w-full opacity-0 transition-opacity duration-150"
              :class="{
                'pointer-events-auto opacity-100': isNewTagFormShowing,
              }"
              @submit.prevent="doAddTag(newTag)"
            >
              <input
                ref="newTagForm"
                v-model="newTag"
                type="text"
                placeholder="Enter a tag name..."
                class="w-full rounded-sm border-0 bg-white focus:ring-2 focus:ring-transparent dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-400 sm:text-sm"
                @blur="isNewTagFormShowing = false"
              />
            </form>
          </div>

          <ul class="mt-2" role="listbox" aria-label="Tags">
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
            class="inline-flex w-full items-center text-sm font-semibold text-gray-400 opacity-0 transition hover:text-gray-200 focus:outline-none group-hover:opacity-100"
            type="button"
            aria-label="Add smart filter"
            @click="doShowSmartFilterDialog"
          >
            <PlusCircleIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          </button>
        </template>

        <template #default>
          <ul class="mt-2 space-y-2" role="listbox" aria-label="Smart Filters">
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
        <ul class="mt-2 space-y-2" role="listbox" aria-label="Languages">
          <SidebarItem
            v-for="language in starsStore.languages"
            :key="language.name"
            :title="language.name"
            :count="language.count"
            :is-active="languageIsSelected(language.name)"
            @click="emit('language-selected', language.name)"
          />
        </ul>
      </SidebarGroup>
    </div>
  </div>
</template>

<style>
.sortable-ghost {
  opacity: 0;
}
</style>

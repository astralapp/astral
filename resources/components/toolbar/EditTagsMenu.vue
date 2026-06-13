<script setup lang="ts">
import TagsEditor from '@/components/tags-editor/TagsEditor.vue'
import ToolbarButton from '@/components/toolbar/ToolbarButton.vue'
import { useStarsStore } from '@/store/useStarsStore'
import { useTagsStore } from '@/store/useTagsStore'
import { StarMetaInput, TagEditorTag } from '@/types'
import { isFocusedElementEditable } from '@/utils'
import { onKeyStroke } from '@vueuse/core'
import pick from 'lodash/pick'
import { computed, ref } from 'vue'

const starsStore = useStarsStore()
const tagsStore = useTagsStore()

const isEditing = ref(false)

const tags = computed(() => starsStore.userStarsByRepoId[starsStore.selectedRepo.databaseId]?.tags ?? [])
const autocompleteOptions = computed(() => tagsStore.tags.map(tag => tag.name))

const syncTags = (newTags: TagEditorTag[]) => {
  const starInput: StarMetaInput = pick(starsStore.selectedRepo, ['databaseId', 'nameWithOwner', 'url', 'description'])

  starsStore.syncTagsToStar(starInput, newTags)
  isEditing.value = false
}

onKeyStroke('t', e => {
  if (isFocusedElementEditable()) return

  e.preventDefault()
  isEditing.value = true
})
</script>

<template>
  <div class="relative">
    <ToolbarButton
      :active="isEditing"
      label="Edit tags"
      aria-keyshortcuts="t"
      @click="isEditing = !isEditing"
    >
      <i-lucide-tag class="h-4 w-4" />
    </ToolbarButton>

    <transition
      enter-active-class="transition duration-100 ease-out motion-reduce:transition-none"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in motion-reduce:transition-none"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isEditing"
        class="absolute right-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-md border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800"
      >
        <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tags</p>

        <TagsEditor
          :tags="tags"
          :autocomplete-options="autocompleteOptions"
          @change="syncTags"
          @blur="isEditing = false"
        />
      </div>
    </transition>
  </div>
</template>

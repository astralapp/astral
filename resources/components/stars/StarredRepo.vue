<script lang="ts" setup>
import { computed, ref } from 'vue'
import TagsEditor from '@/views/components/tags-editor/TagsEditor.vue'
import { useUserStore } from '@/scripts/store/useUserStore'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { useTagsStore } from '@/scripts/store/useTagsStore'
import { StarIcon, ShareIcon, GlobeIcon } from '@heroicons/vue/outline'
import { GitHubRepo, GitHubRepoNode, StarMetaInput, Tag, TagEditorTag } from '@/scripts/types'
import { pick } from 'lodash'

const props = defineProps<{
  repo: GitHubRepo
}>()

const emit = defineEmits<{
  (e: 'selected', value: GitHubRepo): void
  (e: 'tagSelected', value: Tag): void
  (e: 'languageSelected', value: string): void
}>()

const userStore = useUserStore()
const starsStore = useStarsStore()
const tagsStore = useTagsStore()

const tags = computed(() => {
  return starsStore.userStarsByRepoId[props.repo.node.databaseId]?.tags || []
})

const shouldShowLanguageTag = computed(() => !!userStore.user?.settings.show_language_tags)

const isEditingTags = ref(false)

const isSelected = computed(() =>
  starsStore.selectedRepos.map(repo => repo.databaseId).includes(props.repo.node.databaseId)
)

const autocompleteOptions = computed(() => {
  return tagsStore.tags.map(tag => tag.name)
})

const syncTagsToStar = (repoNode: GitHubRepoNode, tags: TagEditorTag[]) => {
  const starInput: StarMetaInput = pick(repoNode, ['databaseId', 'nameWithOwner', 'url', 'description'])

  starsStore.syncTagsToStar(starInput, tags)

  isEditingTags.value = false
}

let $dragImage: Maybe<HTMLElement> = undefined

const onDragStart = (e: DragEvent) => {
  starsStore.isDraggingRepo = true

  if (starsStore.selectedRepos.length) {
    if (isSelected.value) {
      starsStore.draggingRepos = [...starsStore.selectedRepos]
    } else {
      starsStore.draggingRepos = [props.repo.node]
    }
  } else {
    starsStore.draggingRepos = [props.repo.node]
  }

  $dragImage = document.createElement('div')
  $dragImage.classList.add(
    ...[
      'star-drag-image',
      'inline-block',
      'bg-white',
      'shadow-md',
      'p-4',
      'font-semibold',
      'rounded-md',
      'text-brand-600',
      'absolute',
      'left-0',
      'z-10',
    ]
  )
  if (starsStore.draggingRepos.length > 1) {
    $dragImage.innerHTML = `<span>${props.repo.node.nameWithOwner} + ${starsStore.draggingRepos.length - 1} more</span>`
  } else {
    $dragImage.innerHTML = `<span>${props.repo.node.nameWithOwner}</span>`
  }
  $dragImage.style.top = '-999px'
  document.body.appendChild($dragImage)

  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copyLink'
    e.dataTransfer.setDragImage($dragImage, 0, 0)
  }
}

const onDragEnd = () => {
  starsStore.isDraggingRepo = false
  starsStore.draggingRepos = []

  if ($dragImage) {
    document.body.removeChild($dragImage)
  }
}
</script>

<template>
  <div
    class="group relative cursor-pointer border-b border-gray-300 p-4 shadow-sm dark:bg-gray-800"
    :class="{
      'bg-gray-100 shadow-inner dark:bg-gray-800': isSelected,
      'bg-white': !isSelected,
    }"
    draggable="true"
    role="option"
    :aria-selected="isSelected"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="emit('selected', repo)"
  >
    <div
      aria-hidden
      class="absolute -bottom-px left-0 top-0 w-1 transform bg-brand-600 transition-transform"
      :class="{
        'translate-x-0': isSelected,
        '-translate-x-full': !isSelected,
      }"
    ></div>

    <p class="font-semibold text-brand-600">{{ repo.node.nameWithOwner }}</p>

    <p class="mt-2 line-clamp-5 text-sm text-gray-700 dark:text-gray-300" :title="repo.node.description">
      {{ repo.node.description }}
    </p>

    <TagsEditor
      v-if="isEditingTags"
      :tags="tags"
      :autocomplete-options="autocompleteOptions"
      class="mt-4"
      @change="syncTagsToStar(repo.node, $event)"
      @blur="isEditingTags = false"
    />

    <ul v-if="!isEditingTags" class="mt-4 inline-flex flex-wrap items-start">
      <li
        v-if="shouldShowLanguageTag && repo.node.primaryLanguage?.name"
        class="mb-1 mr-1 cursor-pointer rounded-sm bg-brand-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-brand-800 dark:bg-brand-800 dark:text-brand-200"
        role="button"
        @click.stop="emit('languageSelected', repo.node.primaryLanguage?.name as string)"
      >
        {{ repo.node.primaryLanguage.name }}
      </li>

      <li
        v-for="tag in tags"
        :key="tag.id"
        class="mb-1 mr-1 cursor-pointer rounded-sm bg-indigo-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200"
        role="button"
        @click.stop="emit('tagSelected', tag)"
      >
        {{ tag.name }}
      </li>

      <li
        class="cursor-pointer rounded-sm bg-gray-200 px-2 py-0.5 text-xs font-semibold tracking-wide text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-600 dark:text-gray-200"
        :class="{
          'opacity-100': !tags.length && !repo.node.primaryLanguage?.name,
        }"
        role="button"
        @click.stop="isEditingTags = true"
      >
        Edit Tags
      </li>
    </ul>

    <div class="mt-4 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
      <div class="flex items-center">
        <StarIcon class="h-4 w-4" />

        <span class="ml-1 text-xs font-medium">{{ repo.node.stargazers.totalCount.toLocaleString() }}</span>
      </div>

      <div class="flex items-center">
        <ShareIcon class="h-4 w-4" />

        <span class="ml-1 text-xs font-medium">{{ repo.node.forkCount.toLocaleString() }}</span>
      </div>

      <a
        class="group-scope flex items-center transition-colors"
        :href="repo.node.url"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <GlobeIcon class="h-4 w-4" />

        <span class="group-scope-hover:underline ml-1 text-xs font-medium">Visit</span>
      </a>
    </div>
  </div>
</template>

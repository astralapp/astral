<script lang="ts" setup>
import TagsEditor from '@/components/tags-editor/TagsEditor.vue'
import { useAuth } from '@/composables/use-auth'
import { useStarsStore } from '@/store/useStarsStore'
import { useTagsStore } from '@/store/useTagsStore'
import { GitHubRepo, GitHubRepoNode, StarMetaInput, TagEditorTag } from '@/types'
import pick from 'lodash/pick'
import { computed, ref } from 'vue'

const props = defineProps<{
  repo: GitHubRepo
}>()

const emit = defineEmits<{
  (e: 'languageSelected', value: string): void
  (e: 'selected', value: GitHubRepo): void
  (e: 'tagSelected', value: App.Data.TagData): void
}>()
const { user } = useAuth()
const starsStore = useStarsStore()
const tagsStore = useTagsStore()

const tags = computed(() => {
  return starsStore.userStarsByRepoId[props.repo.node.databaseId]?.tags || []
})

const shouldShowLanguageTag = computed(() => user.value?.settings.show_language_tags ?? false)

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
      'dark:text-brand-500',
      'dark:bg-gray-950',
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
    class="group relative cursor-pointer border-b border-gray-300 dark:border-gray-700/50 p-4 shadow-sm"
    :class="{
      'bg-gray-100 shadow-inner dark:bg-gray-900': isSelected,
      'bg-white dark:bg-gray-800/80': !isSelected,
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

    <p class="font-semibold text-brand-600 dark:text-brand-500">{{ repo.node.nameWithOwner }}</p>

    <p
      class="mt-2 line-clamp-5 text-sm text-gray-700 dark:text-gray-300"
      :title="repo.node.description"
    >
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

    <ul
      v-if="!isEditingTags"
      class="mt-4 inline-flex flex-wrap items-start"
    >
      <li
        v-if="shouldShowLanguageTag && repo.node.primaryLanguage?.name"
        class="mb-1 mr-1 cursor-pointer rounded-sm bg-brand-100 dark:bg-brand-500/10 px-2 py-0.5 text-xs font-semibold tracking-wide text-brand-800 f dark:text-brand-400 ring-1 ring-inset ring-transparent dark:ring-brand-400/30"
        role="button"
        @click.stop="emit('languageSelected', repo.node.primaryLanguage?.name as string)"
      >
        {{ repo.node.primaryLanguage.name }}
      </li>

      <li
        v-for="tag in tags"
        :key="tag.id"
        class="mb-1 mr-1 cursor-pointer rounded-sm bg-indigo-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400 ring-1 ring-inset ring-transparent dark:ring-indigo-400/30"
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

    <div class="mt-4 flex items-center justify-start gap-x-4 text-gray-500 dark:text-gray-400 w-full">
      <div class="inline-flex items-center">
        <i-ph-star
          class="h-4 w-4"
          role="presentation"
        />

        <span class="ml-0.5 text-sm font-medium">{{ repo.node.stargazers.totalCount.toLocaleString() }}</span>
      </div>

      <div class="inline-flex items-center">
        <i-ph-git-fork
          class="h-4 w-4"
          role="presentation"
        />

        <span class="ml-0.5 text-sm font-medium">{{ repo.node.forkCount.toLocaleString() }}</span>
      </div>

      <a
        class="transition-opacity group-hover:opacity-100 opacity-100 sm:opacity-0 group/repo-link inline-flex items-center ml-auto hover:text-brand-500 px-2 relative"
        :href="repo.node.url"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        <i-ph-github-logo
          class="h-5 w-5 transition group-hover/repo-link:rotate-[-30deg]"
          role="presentation"
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          class="w-3.5 h-3.5 rotate-[75deg] hidden sm:inline-block sm:opacity-0 transition group-hover/repo-link:opacity-100 relative -top-1"
          role="presentation"
        >
          <path
            fill="currentColor"
            d="M6.03 7.03a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06l-2.72-2.72v5.44c0 1.947.245 3.321.74 4.366c.486 1.026 1.243 1.8 2.396 2.49a.75.75 0 1 1-.772 1.287c-1.347-.808-2.34-1.785-2.98-3.134c-.63-1.33-.884-2.956-.884-5.009V4.31z"
          />
        </svg>

        <span class="sr-only">Visit</span>
      </a>
    </div>
  </div>
</template>

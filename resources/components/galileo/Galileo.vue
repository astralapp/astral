<script lang="ts" setup>
import GalileoChip from '@/components/galileo/GalileoChip.vue'
import GalileoSuggestionList from '@/components/galileo/GalileoSuggestionList.vue'
import TransitionFade from '@/components/shared/transitions/TransitionFade.vue'
import { useStarsFilterStore } from '@/store/useStarsFilterStore'
import { useStarsStore } from '@/store/useStarsStore'
import { useTagsStore } from '@/store/useTagsStore'
import { isFocusedElementEditable } from '@/utils'
import { IS_VALUES, SuggestionOption, filterSuggestions, parsePendingInput } from '@/utils/search'
import { XMarkIcon } from '@heroicons/vue/16/solid'
import { onKeyStroke } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

const LIST_ID = 'galileo-suggestions'

const starsFilterStore = useStarsFilterStore()
const starsStore = useStarsStore()
const tagsStore = useTagsStore()

const input = ref<HTMLInputElement>()
const isFocused = ref(false)
const isListDismissed = ref(false)
const highlightedIndex = ref(0)
const chipPendingDeleteIndex = ref<Nullable<number>>(null)

const pendingText = computed({
  get() {
    return starsFilterStore.searchText
  },
  set(text: string) {
    starsFilterStore.searchText = text
    isListDismissed.value = false
    chipPendingDeleteIndex.value = null
  },
})

const parsed = computed(() => parsePendingInput(pendingText.value))
const activeQualifier = computed(() => (parsed.value.mode === 'qualifier' ? parsed.value.qualifier : null))
const qualifierPartial = computed(() => (parsed.value.mode === 'qualifier' ? parsed.value.partial : ''))

const suggestionSource = computed((): SuggestionOption[] => {
  switch (activeQualifier.value) {
    case 'is':
      return IS_VALUES.map(value => ({ count: null, name: value }))
    case 'lang':
      return starsStore.languages.map(language => ({ count: language.count, name: language.name }))
    case 'tag':
      return tagsStore.tags.map(tag => ({ count: tag.stars_count, name: tag.name }))
    case 'topic':
      return starsStore.topics.map(topic => ({ count: topic.count, name: topic.name }))
    case null:
      return []
    default: {
      const exhaustive: never = activeQualifier.value

      return exhaustive
    }
  }
})

const committedValues = computed(() => {
  return starsFilterStore.searchTokens.filter(token => token.type === activeQualifier.value).map(token => token.value)
})

const suggestions = computed(() => {
  return filterSuggestions(suggestionSource.value, qualifierPartial.value, committedValues.value)
})

const isListOpen = computed(() => isFocused.value && !!activeQualifier.value && !isListDismissed.value)
const hasContent = computed(() => starsFilterStore.searchTokens.length > 0 || pendingText.value !== '')

const activeDescendantId = computed(() => {
  return isListOpen.value && suggestions.value.length ? `${LIST_ID}-option-${highlightedIndex.value}` : undefined
})

watch(suggestions, () => {
  highlightedIndex.value = 0
})

const commitToken = (value: string) => {
  const pending = parsed.value

  if (pending.mode !== 'qualifier') return

  starsFilterStore.addSearchToken({ type: pending.qualifier, value })
  pendingText.value = pending.freeText
  input.value?.focus()
}

const onEnter = (e: KeyboardEvent) => {
  const pending = parsed.value

  if (pending.mode !== 'qualifier') return

  e.preventDefault()

  const highlighted = isListOpen.value ? suggestions.value[highlightedIndex.value]?.name : undefined
  const value = highlighted ?? pending.partial.trim()

  if (value) {
    commitToken(value)
  }
}

const onArrowDown = (e: KeyboardEvent) => {
  if (!isListOpen.value) return

  e.preventDefault()
  highlightedIndex.value = Math.min(suggestions.value.length - 1, highlightedIndex.value + 1)
}

const onArrowUp = (e: KeyboardEvent) => {
  if (!isListOpen.value) return

  e.preventDefault()
  highlightedIndex.value = Math.max(0, highlightedIndex.value - 1)
}

const onEscape = () => {
  if (isListOpen.value) {
    isListDismissed.value = true
  }
}

const onBackspace = () => {
  if (pendingText.value !== '') return

  const lastIndex = starsFilterStore.searchTokens.length - 1

  if (lastIndex < 0) return

  if (chipPendingDeleteIndex.value === lastIndex) {
    starsFilterStore.removeSearchTokenAt(lastIndex)
    chipPendingDeleteIndex.value = null
  } else {
    chipPendingDeleteIndex.value = lastIndex
  }
}

const onFocus = () => {
  isFocused.value = true
  isListDismissed.value = false
}

const onBlur = () => {
  isFocused.value = false
  chipPendingDeleteIndex.value = null
}

const removeToken = (index: number) => {
  starsFilterStore.removeSearchTokenAt(index)
  chipPendingDeleteIndex.value = null
  input.value?.focus()
}

const clearSearch = () => {
  starsFilterStore.clearSearch()
  chipPendingDeleteIndex.value = null
  input.value?.focus()
}

onKeyStroke('/', e => {
  if (!isFocusedElementEditable() && document.activeElement !== input.value) {
    e.preventDefault()
    input.value?.focus()
  }
})
</script>

<template>
  <div
    class="flex h-16 shrink-0 items-center border-b border-gray-300 bg-white px-4 dark:border-gray-950 dark:bg-gray-900"
  >
    <div
      class="relative flex w-full items-center rounded-md border border-gray-900/20 bg-white px-3 shadow-md shadow-gray-800/5 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-700/15 dark:text-gray-200 dark:focus-within:border-gray-500 dark:focus-within:ring-gray-400/10"
    >
      <i-lucide-search
        class="pointer-events-none absolute left-2 h-5 w-5 transition-colors"
        :class="isFocused ? 'text-gray-400' : 'text-gray-300 dark:text-gray-400'"
        aria-hidden="true"
      />

      <div class="flex w-full items-center gap-1.5 overflow-x-auto py-2 pl-6 pr-8">
        <GalileoChip
          v-for="(token, index) in starsFilterStore.searchTokens"
          :key="`${index}-${token.type}-${token.value}`"
          :token="token"
          :pending-delete="index === chipPendingDeleteIndex"
          @remove="removeToken(index)"
        />

        <input
          ref="input"
          v-model="pendingText"
          type="text"
          class="min-w-36 flex-1 border-none bg-transparent p-0 text-gray-500 placeholder:text-gray-400 focus:ring-0 dark:text-gray-200 dark:placeholder:text-gray-500 sm:text-sm"
          :placeholder="starsFilterStore.searchTokens.length ? '' : 'Gaze through your telescope...'"
          role="combobox"
          autocomplete="off"
          aria-keyshortcuts="/"
          :aria-expanded="isListOpen"
          :aria-controls="LIST_ID"
          :aria-activedescendant="activeDescendantId"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.enter="onEnter"
          @keydown.down="onArrowDown"
          @keydown.up="onArrowUp"
          @keydown.esc="onEscape"
          @keydown.delete="onBackspace"
        />
      </div>

      <span
        v-if="!hasContent"
        class="pointer-events-none absolute right-2 hidden rounded-xs border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-300 transition-opacity dark:border-gray-600 dark:bg-gray-950 dark:text-gray-400 sm:block"
        :class="{ 'opacity-0': isFocused }"
        aria-hidden="true"
        >/</span
      >

      <button
        v-else
        type="button"
        class="absolute right-2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Clear search"
        @mousedown.prevent
        @click="clearSearch"
      >
        <XMarkIcon class="h-4 w-4 fill-current" />
      </button>

      <TransitionFade
        :show="isListOpen"
        as="div"
      >
        <GalileoSuggestionList
          v-if="activeQualifier"
          :list-id="LIST_ID"
          :items="suggestions"
          :highlighted-index="highlightedIndex"
          :partial="qualifierPartial"
          :qualifier="activeQualifier"
          @highlight="highlightedIndex = $event"
          @select="commitToken"
        />
      </TransitionFade>
    </div>
  </div>
</template>

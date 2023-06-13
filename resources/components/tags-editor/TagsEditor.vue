<script lang="ts" setup>
import AutocompleteMenu from '@/components/tags-editor/AutocompleteMenu.vue'
import { useTagsStore } from '@/store/useTagsStore'
import { TagEditorTag } from '@/types'
import { XIcon } from '@heroicons/vue/solid'
import { whenever } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { computed, nextTick, reactive, ref, unref, watch } from 'vue'

interface Props {
  autocompleteOptions?: string[]
  canCreate?: boolean
  placeholder?: string
  tags?: TagEditorTag[]
}

const props = withDefaults(defineProps<Props>(), {
  autocompleteOptions: () => [] as string[],
  canCreate: true,
  placeholder: 'Add a tag',
  tags: () => [] as TagEditorTag[],
})

const emit = defineEmits<{
  (e: 'blur'): void
  (e: 'change', value: TagEditorTag[]): void
}>()

const tagsStore = useTagsStore()
const autocompleteUUID = nanoid()
const tagText = ref('')
const input = ref<HTMLInputElement | null>(null)
const normalizedTags = Array.isArray(props.tags) ? props.tags : []
const mutableTags = ref<TagEditorTag[]>(normalizedTags.map(tag => ({ id: tag.id, name: tag.name })))
let inputRect = reactive<Pick<Record<keyof DOMRect, number>, 'height' | 'left' | 'top'>>({
  height: 20,
  left: 0,
  top: 0,
})

const autocompleteShowing = ref(false)

const visibleAutocompleteOptions = computed(() => {
  return props.autocompleteOptions.filter(option => {
    return !mutableTags.value.map(tag => tag.name).includes(option)
  })
})

whenever(input, () => {
  positionAutocompleteMenu()
})

watch(props.tags, newValue => {
  if (Array.isArray(newValue)) {
    mutableTags.value = newValue.map(tag => ({ id: tag.id, name: tag.name }))
  }

  mutableTags.value = []
})

watch(
  mutableTags,
  () => {
    setTimeout(() => {
      positionAutocompleteMenu()
    }, 10)
  },
  { deep: true }
)

const positionAutocompleteMenu = () => {
  if (input.value) {
    const { top, left } = input.value.getBoundingClientRect()
    inputRect.top = top
    inputRect.left = left
  }
}

const tagsHasTag = (tag: string) => {
  return mutableTags.value.map(tag => tag.name?.toLowerCase()).includes(tag?.toLowerCase())
}

const tagsHaveChanged = computed(() => {
  return !(
    props.tags.length === mutableTags.value.length &&
    props.tags
      .map(tag => tag.name)
      .every(tag => {
        return mutableTags.value.map(tag => tag.name).includes(tag)
      })
  )
})

const addTagWithName = (name: string) => {
  if (name && !tagsHasTag(name)) {
    const existingTag = tagsStore.tags.find(tag => tag.name === name)

    mutableTags.value.push({ id: existingTag ? existingTag.id : Date.now(), name: name })
    tagText.value = ''
    input.value?.focus()
  }
}
const addTagFromInput = () => {
  if (props.canCreate) {
    addTagWithName(tagText.value.trim())
  }
}

const deleteLastTag = (e: KeyboardEvent) => {
  if (!tagText.value) {
    e.preventDefault()
    mutableTags.value.pop()
  }
}

const deleteTagAtIndex = (i: number) => {
  mutableTags.value.splice(i, 1)

  input.value?.focus()
}

const onBlur = () => {
  if (tagsHaveChanged.value) {
    emit('change', unref(mutableTags))
  } else {
    emit('blur')
  }
}

const onEnter = () => {
  if (!autocompleteShowing.value) {
    input.value?.blur()
  }
}

nextTick(() => {
  input.value?.focus()
})
</script>

<template>
  <div
    class="pt-2 pb-0 min-w-0 flex-auto appearance-none rounded-md border border-gray-900/20 bg-white px-1 shadow-md shadow-gray-800/5 placeholder:text-gray-400 focus-within:border-gray-400 focus-within:outline-none focus-within:ring-4 focus-within:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-700/[0.15] dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus-within:border-gray-500 dark:focus-within:ring-gray-400/10 sm:text-sm"
    @click.stop
  >
    <ul class="relative flex w-full flex-wrap items-center">
      <li
        v-for="(tag, i) in mutableTags"
        :key="tag.name"
        class="mx-1 mb-2 flex items-center rounded-sm bg-indigo-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400 ring-1 ring-inset ring-transparent dark:ring-indigo-400/30"
      >
        <span>{{ tag.name }}</span>

        <button
          class="delete-star-tag cursor-pointer pl-1"
          :aria-label="`Delete tag ${tag.name}`"
          @mousedown.prevent
          @click.stop="deleteTagAtIndex(i)"
        >
          <XIcon class="h-3 w-3 fill-current" />
        </button>
      </li>

      <li
        class="relative isolate mx-1 mb-2 flex-grow leading-none"
        style="flex-basis: 82px"
      >
        <input
          ref="input"
          v-model="tagText"
          type="text"
          class="w-full min-w-0 border-0 bg-transparent p-0 text-base leading-none focus:border-0 focus:outline-none focus:ring-0 sm:text-sm"
          :placeholder="placeholder"
          role="combobox"
          :aria-activedescendant="autocompleteUUID"
          autocomplete="off"
          :aria-owns="autocompleteUUID"
          @keydown.,.prevent="addTagFromInput"
          @keydown.delete="deleteLastTag"
          @blur="onBlur"
          @keydown.enter="onEnter"
        />

        <!-- Autocomplete Menu -->
        <AutocompleteMenu
          :id="autocompleteUUID"
          :style="{
            left: inputRect.left + 'px',
            top: inputRect.top + inputRect.height + 'px',
          }"
          :source="visibleAutocompleteOptions"
          :search="tagText"
          @select="addTagWithName($event)"
          @show="autocompleteShowing = true"
          @hide="autocompleteShowing = false"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped></style>

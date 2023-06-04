<script lang="ts" setup>
import { computed, nextTick, reactive, ref, unref, watch } from 'vue'
import { useTagsStore } from '@/scripts/store/useTagsStore'
import AutocompleteMenu from '@/views/components/tags-editor/AutocompleteMenu.vue'
import { XIcon } from '@heroicons/vue/solid'
import { TagEditorTag } from '@/scripts/types'
import { whenever } from '@vueuse/core'
import { nanoid } from 'nanoid'

interface Props {
  tags?: TagEditorTag[]
  canCreate?: boolean
  placeholder?: string
  autocompleteOptions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [] as TagEditorTag[],
  canCreate: true,
  placeholder: 'Add a tag',
  autocompleteOptions: () => [] as string[],
})

const emit = defineEmits<{
  (e: 'change', value: TagEditorTag[]): void
  (e: 'blur'): void
}>()

const tagsStore = useTagsStore()
const autocompleteUUID = nanoid()
const tagText = ref('')
const input = ref<HTMLInputElement | null>(null)
const normalizedTags = Array.isArray(props.tags) ? props.tags : []
const mutableTags = ref<TagEditorTag[]>(normalizedTags.map(tag => ({ id: tag.id, name: tag.name })))
let inputRect = reactive<Pick<Record<keyof DOMRect, number>, 'top' | 'left' | 'height'>>({
  top: 0,
  left: 0,
  height: 20,
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

    mutableTags.value.push({ name: name, id: existingTag ? existingTag.id : Date.now() })
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
    class="flex cursor-text items-center rounded-md border border-gray-300 bg-white px-1 pt-2 pb-0 shadow-sm ring-2 ring-transparent focus-within:border-indigo-500 focus-within:ring-indigo-100"
    @click.stop
  >
    <ul class="relative flex w-full flex-wrap items-center">
      <li
        v-for="(tag, i) in mutableTags"
        :key="tag.name"
        class="mx-1 mb-2 flex items-center rounded-sm bg-indigo-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-indigo-800"
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

      <li class="relative isolate mx-1 mb-2 flex-grow leading-none" style="flex-basis: 82px">
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

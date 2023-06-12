<script setup lang="ts">
import TagsEditor from '@/components/tags-editor/TagsEditor.vue'
import { useStarsStore } from '@/store/useStarsStore'
import { TagEditorTag } from '@/types'
import { computed } from 'vue'

interface Props {
  modelValue?: TagEditorTag[]
}

const { modelValue = [] } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TagEditorTag[]): void
}>()

const starsStore = useStarsStore()

const autocompleteOptions = computed(() => {
  return starsStore.languages.map(language => language.name)
})
</script>

<template>
  <TagsEditor
    :tags="modelValue ?? []"
    :can-create="false"
    :autocomplete-options="autocompleteOptions"
    class="flex-grow"
    @change="emit('update:modelValue', $event)"
  />
</template>

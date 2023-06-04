<script setup lang="ts">
import { computed } from 'vue'
import TagsEditor from '@/views/components/tags-editor/TagsEditor.vue'
import { useTagsStore } from '@/scripts/store/useTagsStore'
import { TagEditorTag } from '@/scripts/types'

interface Props {
  modelValue?: TagEditorTag[]
}

const { modelValue = [] } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TagEditorTag[]): void
}>()

const tagsStore = useTagsStore()

const autocompleteOptions = computed(() => {
  return tagsStore.tags.map(tag => tag.name)
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

<script setup lang="ts">
import { computed } from 'vue'
import TagsEditor from '@/views/components/tags-editor/TagsEditor.vue'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { TagEditorTag } from '@/scripts/types'

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

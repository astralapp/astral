import { ref } from 'vue'
import { BaseDialogReturnType } from '@/scripts/types'

const isOpen = ref(false)

interface NotesEditorReturnType extends BaseDialogReturnType {
  toggle(): void
}

export const useNotesEditor = (): NotesEditorReturnType => {
  return {
    isOpen,
    show: () => (isOpen.value = true),
    hide: () => (isOpen.value = false),
    toggle: () => (isOpen.value = !isOpen.value),
  }
}

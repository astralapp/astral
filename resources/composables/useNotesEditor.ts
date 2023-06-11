import { BaseDialogReturnType } from '@/types'
import { ref } from 'vue'

const isOpen = ref(false)

interface NotesEditorReturnType extends BaseDialogReturnType {
  toggle(): void
}

export const useNotesEditor = (): NotesEditorReturnType => {
  return {
    hide: () => (isOpen.value = false),
    isOpen,
    show: () => (isOpen.value = true),
    toggle: () => (isOpen.value = !isOpen.value),
  }
}

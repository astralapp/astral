import { BaseDialogReturnType } from '@/types'
import { ref } from 'vue'

const isOpen = ref(false)

export const useSettingsDialog = (): BaseDialogReturnType => {
  return {
    hide: () => {
      isOpen.value = false
    },
    isOpen,
    show: () => {
      isOpen.value = true
    },
  }
}

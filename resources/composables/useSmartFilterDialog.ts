import { ref, computed, Ref } from 'vue'
import { BaseDialogReturnType, SmartFilter } from '@/scripts/types'

interface SmartFilterDialogReturnType extends Omit<BaseDialogReturnType, 'show'> {
  isOpen: Ref<boolean>
  currentSmartFilter: Ref<Nullable<SmartFilter>>
  show(smartFilter?: SmartFilter): void
  hide(): void
}

const isOpen = ref(false)
const currentSmartFilter = ref<Nullable<SmartFilter>>(null)

export const useSmartFilterDialog = (): SmartFilterDialogReturnType => {
  return {
    isOpen: computed(() => isOpen.value),
    currentSmartFilter: computed(() => currentSmartFilter.value),
    show: (smartFilter?: SmartFilter) => {
      if (smartFilter) currentSmartFilter.value = smartFilter
      isOpen.value = true
    },
    hide: () => {
      isOpen.value = false
      setTimeout(() => {
        currentSmartFilter.value = null
      }, 200)
    },
  }
}

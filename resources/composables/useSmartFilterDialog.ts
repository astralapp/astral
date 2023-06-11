import { BaseDialogReturnType } from '@/types'
import { Ref, computed, ref } from 'vue'

interface SmartFilterDialogReturnType extends Omit<BaseDialogReturnType, 'show'> {
  currentSmartFilter: Ref<Nullable<App.Data.SmartFilterData>>
  hide(): void
  isOpen: Ref<boolean>
  show(smartFilter?: App.Data.SmartFilterData): void
}

const isOpen = ref(false)
const currentSmartFilter = ref<Nullable<App.Data.SmartFilterData>>(null)

export const useSmartFilterDialog = (): SmartFilterDialogReturnType => {
  return {
    currentSmartFilter: computed(() => currentSmartFilter.value),
    hide: () => {
      isOpen.value = false
      setTimeout(() => {
        currentSmartFilter.value = null
      }, 200)
    },
    isOpen: computed(() => isOpen.value),
    show: (smartFilter?: App.Data.SmartFilterData) => {
      if (smartFilter) currentSmartFilter.value = smartFilter
      isOpen.value = true
    },
  }
}

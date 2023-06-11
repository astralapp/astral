import { BaseDialogReturnType } from '@/types'
import { Ref, computed, ref } from 'vue'

const isOpen = ref(false)
const currentContext = ref<App.Data.Enums.Ability | null>(null)

interface SponsorshipDialogReturnType extends Omit<BaseDialogReturnType, 'show'> {
  currentContext: Ref<App.Data.Enums.Ability | null>
  hide(): void
  isOpen: Ref<boolean>
  show(context: App.Data.Enums.Ability): void
}

export const useSponsorshipDialog = (): SponsorshipDialogReturnType => {
  return {
    currentContext: computed(() => currentContext.value),
    hide: () => (isOpen.value = false),
    isOpen: computed(() => isOpen.value),
    show: (context: App.Data.Enums.Ability) => {
      currentContext.value = context
      isOpen.value = true
    },
  }
}

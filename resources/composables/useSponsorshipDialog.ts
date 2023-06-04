import { ref, computed, Ref } from 'vue'
import { Ability, BaseDialogReturnType } from '@/scripts/types'

const isOpen = ref(false)
const currentContext = ref<Ability | null>(null)

interface SponsorshipDialogReturnType extends Omit<BaseDialogReturnType, 'show'> {
  isOpen: Ref<boolean>
  currentContext: Ref<Ability | null>
  show(context: Ability): void
  hide(): void
}

export const useSponsorshipDialog = (): SponsorshipDialogReturnType => {
  return {
    isOpen: computed(() => isOpen.value),
    currentContext: computed(() => currentContext.value),
    show: (context: Ability) => {
      currentContext.value = context
      isOpen.value = true
    },
    hide: () => (isOpen.value = false),
  }
}

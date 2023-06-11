import { BaseDialogReturnType } from '@/types'
import { Ref, computed, ref } from 'vue'

interface RenameTagDialogReturnType extends Omit<BaseDialogReturnType, 'show'> {
  currentTag: Ref<Nullable<App.Data.TagData>>
  hide(): void
  isOpen: Ref<boolean>
  show(tag: App.Data.TagData): void
}

const isOpen = ref(false)
const currentTag = ref<Nullable<App.Data.TagData>>(null)

export const useRenameTagDialog = (): RenameTagDialogReturnType => {
  return {
    currentTag: computed(() => currentTag.value),
    hide: () => (isOpen.value = false),
    isOpen: computed(() => isOpen.value),
    show: (tag: App.Data.TagData) => {
      currentTag.value = tag
      isOpen.value = true
    },
  }
}

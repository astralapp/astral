import { ref, computed, Ref } from 'vue'
import { Tag } from '@/scripts/types'
import { BaseDialogReturnType } from '@/scripts/types'

interface RenameTagDialogReturnType extends Omit<BaseDialogReturnType, 'show'> {
  isOpen: Ref<boolean>
  currentTag: Ref<Nullable<Tag>>
  show(tag: Tag): void
  hide(): void
}

const isOpen = ref(false)
const currentTag = ref<Nullable<Tag>>(null)

export const useRenameTagDialog = (): RenameTagDialogReturnType => {
  return {
    isOpen: computed(() => isOpen.value),
    currentTag: computed(() => currentTag.value),
    show: (tag: Tag) => {
      currentTag.value = tag
      isOpen.value = true
    },
    hide: () => (isOpen.value = false),
  }
}

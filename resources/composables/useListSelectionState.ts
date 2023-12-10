import { GitHubRepoNode } from '@/types'
import { MaybeRef, onKeyStroke, useEventListener, useMagicKeys } from '@vueuse/core'
import { ListSelectionStateManager, ListSelectionStateManager as Lssm } from 'lssm'
import { Ref, ref, watch } from 'vue'

import { isFocusedElementEditable } from '../utils'

interface ListSelectionStateReturnType {
  selectItem(item: GitHubRepoNode): void
  selectedItems: Ref<GitHubRepoNode[]>
}

type GenericItems = MaybeRef<GitHubRepoNode[]>

const { shift, cmd, ctrl } = useMagicKeys()

/**
 * There's a strange browser behaviour where when the window blur event
 * triggers, if you're holding any keys that are captured by a keydown event
 * when the window becomes visible again the keydown event will continue to
 * fire, but the keyup event won't. The fix is to manually dispatch a keyup
 * event when the window blur event fires.
 */
useEventListener(window, 'blur', () => {
  ;['shift', 'meta', 'control'].forEach(key => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key }))
  })
})

export const useListSelectionState = (
  items: GenericItems,
  isEnabled: Ref<boolean> = ref(true)
): ListSelectionStateReturnType => {
  const allItems = (): GitHubRepoNode[] => {
    // Strip any reactivity out
    return JSON.parse(JSON.stringify(toValue(items)))
  }

  let manager: ListSelectionStateManager<GitHubRepoNode>

  watch(
    items,
    () => {
      manager = new Lssm(allItems(), (a, b) => a.id === b.id)
    },
    { immediate: true }
  )

  const selectedItems = ref([]) as Ref<GitHubRepoNode[]>

  const selectItem = (item: GitHubRepoNode) => {
    manager.select(toValue(Object.assign({}, item)), {
      ctrlKey: ctrl.value,
      metaKey: cmd.value,
      shiftKey: shift.value,
    })

    selectedItems.value = manager.get()
  }

  onKeyStroke('ArrowDown', e => {
    if (!isFocusedElementEditable() && isEnabled.value) {
      manager.next()
      selectedItems.value = manager.get()

      e.preventDefault()
    }
  })

  onKeyStroke('ArrowUp', e => {
    if (!isFocusedElementEditable() && isEnabled.value) {
      manager.previous()
      selectedItems.value = manager.get()

      e.preventDefault()
    }
  })

  return {
    selectItem,
    selectedItems,
  }
}

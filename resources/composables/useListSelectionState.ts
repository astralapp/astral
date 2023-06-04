import { useMagicKeys, onKeyStroke, MaybeRef, useEventListener } from '@vueuse/core'
import { ref, computed, Ref, isRef, watch, unref } from 'vue'
import { isFocusedElementEditable } from '../utils'

interface ListSelectionStateReturnType<T> {
  selectItem(item: T): void
  selectedItems: Ref<T[]>
}

type GenericItems<T> = MaybeRef<T[]>

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

const isHoldingMetaKey = computed(() => cmd.value || ctrl.value)
const isHoldingShiftKey = computed(() => shift.value)

export const useListSelectionState = <T>(
  items: GenericItems<T> | (() => GenericItems<T>),
  isEnabled: Ref<boolean> = ref(true)
): ListSelectionStateReturnType<T> => {
  const selectedItems = ref([]) as Ref<T[]>
  const lastSelectedItem = ref(null) as Ref<Nullable<T>>
  const lastShiftSelectedItem = ref(null) as Ref<Nullable<T>>

  const allItems = (): T[] => {
    if (typeof items === 'function') {
      return unref(items() as T[])
    } else {
      return unref(items as T[])
    }
  }

  const maxIndex = computed(() => allItems().length - 1)

  const indexOfItem = (item: T): number => {
    return allItems().indexOf(item)
  }

  const lastSelectedIndex = computed(() => {
    if (lastSelectedItem.value !== null) {
      return indexOfItem(lastSelectedItem.value)
    }

    return -1
  })

  const lastShiftSelectedIndex = computed(() => {
    if (lastShiftSelectedItem.value !== null) {
      return indexOfItem(lastShiftSelectedItem.value)
    }

    return -1
  })

  watch(lastShiftSelectedIndex, v => console.log('Last shift-selected index is now:', v))

  const itemAtIndex = (i: number): T => {
    return allItems()[i]
  }

  const nextAvailableSelectedItem = computed(() => {
    let targetItem: Nullable<T> = null

    for (let i = lastSelectedIndex.value; i <= maxIndex.value; i++) {
      if (itemIsSelected(itemAtIndex(i))) {
        targetItem = itemAtIndex(i)
        break
      }
    }

    return targetItem
  })

  const itemIsSelected = (item: Nullable<T>): boolean => {
    if (item === null) {
      return false
    }

    return selectedItems.value.includes(item)
  }

  const appendItemToSelection = (item: T) => {
    if (!itemIsSelected(item)) {
      selectedItems.value.push(item)
    }
  }

  const removeItemFromSelection = (item: T) => {
    selectedItems.value.splice(selectedItems.value.indexOf(item), 1)
  }

  const toggleItem = (item: T) => {
    if (itemIsSelected(item)) {
      removeItemFromSelection(item)
    } else {
      appendItemToSelection(item)
      lastShiftSelectedItem.value = null
    }
  }

  const setSingleSelectedItem = (item: T) => {
    selectedItems.value = [item]
  }

  const getItemsFromRange = (start: number, end: number): T[] => {
    const selectedItems = []

    const [low, high] = [start, end].sort((a, b) => a - b)

    for (let i = low; i <= high; i++) {
      selectedItems.push(itemAtIndex(i))
    }

    return selectedItems
  }

  const setSelectedItemsRange = (item: T) => {
    const clickedItemIndex = indexOfItem(item)
    const didSelectItemBelow = clickedItemIndex > lastSelectedIndex.value
    const didSelectItemAbove = clickedItemIndex < lastSelectedIndex.value
    const lastIndex =
      itemIsSelected(lastSelectedItem.value) && !didSelectItemBelow
        ? lastSelectedIndex.value
        : lastSelectedIndex.value + 1
    let itemsInRange = getItemsFromRange(Math.max(lastIndex, 0), clickedItemIndex)

    /**
     * If the item at last selected index is not selected (it was toggled off)
     * and the new item clicked has a larger index, deselect all items after the
     * last selected index, and select from last index + 1 to clicked index
     */
    if (!itemIsSelected(lastSelectedItem.value)) {
      if (didSelectItemBelow) {
        selectedItems.value.splice(lastIndex, selectedItems.value.length)
      } else {
        /**
         * When the last selected item is not visually selected we need to find the next sibling
         * that is visibly selected to set the correct range
         */
        const nextSelectedSiblingIndex = indexOfItem(nextAvailableSelectedItem.value || itemAtIndex(maxIndex.value))

        if (nextSelectedSiblingIndex) {
          itemsInRange = getItemsFromRange(clickedItemIndex, nextSelectedSiblingIndex)

          /**
           * We then need to find all adjacent visually selected elements and de-select them.
           * We stop searching once we hit a non-selected item to preserve selected state outside the
           * "range" that we're working with
           */
          for (let i = nextSelectedSiblingIndex + 1; i <= maxIndex.value; i++) {
            if (itemIsSelected(itemAtIndex(i))) {
              removeItemFromSelection(itemAtIndex(i))
            } else {
              break
            }
          }
        }
      }
    }
    itemsInRange.forEach(item => {
      appendItemToSelection(item)
    })

    if (didSelectItemBelow) {
      for (let i = clickedItemIndex + 1; i <= maxIndex.value; i++) {
        if (itemIsSelected(itemAtIndex(i))) {
          removeItemFromSelection(itemAtIndex(i))
        } else {
          break
        }
      }
    } else if (didSelectItemAbove) {
      for (let i = clickedItemIndex - 1; i >= 0; i--) {
        if (itemIsSelected(itemAtIndex(i))) {
          removeItemFromSelection(itemAtIndex(i))
        } else {
          break
        }
      }
    }
  }

  const updateSelectedItems = (item: T) => {
    if (isHoldingMetaKey.value && !isHoldingShiftKey.value) {
      toggleItem(item)
    } else if (isHoldingShiftKey.value) {
      setSelectedItemsRange(item)
      lastShiftSelectedItem.value = item
    } else {
      setSingleSelectedItem(item)
      lastShiftSelectedItem.value = null
    }

    if (!isHoldingShiftKey.value || lastSelectedIndex.value === -1) {
      lastSelectedItem.value = item
    }
  }

  const selectItem = (item: T) => {
    updateSelectedItems(item)
  }

  const selectNextItem = () => {
    let targetItem: T
    if (~lastShiftSelectedIndex.value) {
      targetItem = itemAtIndex(Math.min(maxIndex.value, lastShiftSelectedIndex.value + 1))
    } else {
      targetItem = itemAtIndex(Math.min(maxIndex.value, lastSelectedIndex.value + 1))
    }

    setSingleSelectedItem(targetItem)
    lastSelectedItem.value = targetItem
    lastShiftSelectedItem.value = null
  }

  const selectPrevItem = () => {
    let targetItem: T
    if (~lastShiftSelectedIndex.value) {
      targetItem = itemAtIndex(Math.max(0, lastShiftSelectedIndex.value - 1))
    } else {
      targetItem = itemAtIndex(Math.max(0, lastSelectedIndex.value - 1))
    }

    setSingleSelectedItem(targetItem)
    lastSelectedItem.value = targetItem
    lastShiftSelectedItem.value = null
  }

  const setSelectionStateOfNextItem = () => {
    let targetItem = null

    // Just start at 0 if nothing is selected
    if (!lastSelectedItem.value) {
      targetItem = itemAtIndex(0)
      setSingleSelectedItem(targetItem)
      lastShiftSelectedItem.value = targetItem
      lastSelectedItem.value = targetItem
    } else {
      /**
       * If the last selected item was selected with shift, and its index is less than the last
       * non-shift selected item, it should deselect all items with an index less than the last
       * non-shift selected item
       */
      if (lastShiftSelectedItem.value && lastShiftSelectedIndex.value < lastSelectedIndex.value) {
        removeItemFromSelection(lastShiftSelectedItem.value)
        lastShiftSelectedItem.value = itemAtIndex(Math.min(maxIndex.value, lastShiftSelectedIndex.value + 1))
      } else {
        // Find the next non-selected item
        if (~~lastShiftSelectedIndex.value) {
          targetItem = itemAtIndex(Math.min(maxIndex.value, lastShiftSelectedIndex.value + 1))
          appendItemToSelection(targetItem)
          lastShiftSelectedItem.value = targetItem
        } else {
          for (let i = lastSelectedIndex.value; i <= maxIndex.value; i++) {
            const item = itemAtIndex(i)
            if (!itemIsSelected(item)) {
              targetItem = item
              appendItemToSelection(targetItem)
              lastShiftSelectedItem.value = targetItem
              break
            }
          }
        }
      }
    }
  }

  const setSelectionStateOfPrevItem = () => {
    let targetItem = null

    // Just start at 0 if nothing is selected
    if (!lastSelectedItem.value) {
      targetItem = itemAtIndex(maxIndex.value)
      setSingleSelectedItem(targetItem)
      lastShiftSelectedItem.value = targetItem
      lastSelectedItem.value = targetItem
    } else {
      if (lastShiftSelectedItem.value && lastShiftSelectedIndex.value > lastSelectedIndex.value) {
        removeItemFromSelection(lastShiftSelectedItem.value)
        lastShiftSelectedItem.value = itemAtIndex(lastShiftSelectedIndex.value - 1)
      } else {
        const lowestIndex = lastShiftSelectedItem.value
          ? Math.min(lastShiftSelectedIndex.value, lastSelectedIndex.value)
          : lastSelectedIndex.value

        for (let i = lowestIndex - 1; i >= 0; i--) {
          if (!itemIsSelected(itemAtIndex(i))) {
            targetItem = itemAtIndex(Math.max(0, i))
            appendItemToSelection(targetItem)
            break
          }
        }
        if (targetItem) {
          lastShiftSelectedItem.value = targetItem
        }
      }
    }
  }

  onKeyStroke('ArrowDown', e => {
    if (!isFocusedElementEditable() && isEnabled.value) {
      selectNextItem()

      e.preventDefault()
    }
  })

  onKeyStroke('ArrowUp', e => {
    if (!isFocusedElementEditable() && isEnabled.value) {
      selectPrevItem()

      e.preventDefault()
    }
  })

  return {
    selectItem,
    selectedItems,
  }
}

// Taken from: https://github.com/vueuse/vueuse/blob/main/packages/core/onStartTyping/index.ts
export const isFocusedElementEditable = (): boolean => {
  const { activeElement, body } = document

  if (!activeElement) return false

  // If not element has focus, we assume it is not editable, too.
  if (activeElement === body) return false

  // Assume <input> and <textarea> elements are editable.
  switch (activeElement.tagName) {
    case 'INPUT':
    case 'TEXTAREA':
      return true
  }

  // Check if any other focused element id editable.
  return activeElement.hasAttribute('contenteditable')
}

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const moveSort = <T>(array: T[], oldIndex: number, newIndex: number): T[] => {
  const itemRemovedArray = [...array.slice(0, oldIndex), ...array.slice(oldIndex + 1, array.length)]

  return [
    ...itemRemovedArray.slice(0, newIndex),
    array[oldIndex],
    ...itemRemovedArray.slice(newIndex, itemRemovedArray.length),
  ]
}

export const randomIntFromRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

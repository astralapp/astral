import { NavigationResponse } from 'hybridly'

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

/**
 * Runs `task` over `items` with at most `limit` promises in flight at once,
 * returning results in the same order as `items`.
 */
export const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const results = new Array<R>(items.length)
  let cursor = 0

  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await task(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))

  return results
}

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

export const getNavigationResponseErrors = (response: NavigationResponse): Record<string, string> => {
  return response.response?.data.view.properties.errors
}

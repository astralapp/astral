import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useStarsFilterStore } from './useStarsFilterStore'

describe('useStarsFilterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('replaces the active tag filter instead of appending', () => {
    const store = useStarsFilterStore()

    store.setFilterByTag('vue')
    store.setFilterByTag('laravel')

    expect(store.searchTokens).toEqual([{ type: 'tag', value: 'laravel' }])
  })

  it('clears an untagged filter when selecting a tag', () => {
    const store = useStarsFilterStore()

    store.setFilterByUntagged()
    store.setFilterByTag('vue')

    expect(store.searchTokens).toEqual([{ type: 'tag', value: 'vue' }])
  })
})

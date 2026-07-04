import { SmartFilter } from '@/types'
import { SearchToken, parsePendingInput } from '@/utils/search'
import { defineStore } from 'pinia'

export const useStarsFilterStore = defineStore({
  actions: {
    addSearchToken(token: SearchToken) {
      if (this.searchTokens.some(existing => existing.type === token.type && existing.value === token.value)) {
        return
      }

      // Untagged and tags are mutually exclusive — an untagged repo can't carry a tag.
      if (token.type === 'tag') {
        this.searchTokens = this.searchTokens.filter(
          existing => !(existing.type === 'is' && existing.value === 'untagged')
        )
      } else if (token.type === 'is' && token.value === 'untagged') {
        this.searchTokens = this.searchTokens.filter(existing => existing.type !== 'tag')
      }

      this.searchTokens.push(token)
    },
    clearSearch() {
      this.searchText = ''
      this.searchTokens = []
    },
    clearSelectSmartFilter() {
      this.selectedSmartFilter = null
    },
    removeSearchTokenAt(index: number) {
      this.searchTokens.splice(index, 1)
    },
    setFilterByAll() {
      this.clearSelectSmartFilter()
      this.clearSearch()
    },
    setFilterByTag(name: string) {
      // Replace the active tag but leave language, smart filter, and free text intact.
      this.searchTokens = this.searchTokens.filter(token => token.type !== 'tag')
      this.addSearchToken({ type: 'tag', value: name })
    },
    setFilterByUntagged() {
      this.clearSelectSmartFilter()
      this.clearSearch()
      this.addSearchToken({ type: 'is', value: 'untagged' })
    },
    setSelectedSmartFilter(filter: SmartFilter) {
      this.selectedSmartFilter = filter
    },
  },
  getters: {
    isFilteringByAll(): boolean {
      // A bare free-text search still counts as "all"; only structured tokens
      // (tag/language/topic/is) take the highlight off All Stars.
      return !this.isFilteringBySmartFilter && this.searchTokens.length === 0
    },
    isFilteringBySearch(): boolean {
      return this.searchTokens.length > 0 || parsePendingInput(this.searchText).freeText.trim().length > 0
    },
    isFilteringBySmartFilter(): boolean {
      return !!this.selectedSmartFilter
    },
    isFilteringByUntagged(): boolean {
      return this.searchTokens.some(token => token.type === 'is' && token.value === 'untagged')
    },
  },
  id: 'stars-filter',
  state() {
    return {
      searchText: '',
      searchTokens: [] as SearchToken[],
      selectedSmartFilter: null as Nullable<SmartFilter>,
    }
  },
})

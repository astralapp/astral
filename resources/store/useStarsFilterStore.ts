import { RepoLanguage, SmartFilter, Tag } from '@/types'
import { SearchToken, parsePendingInput } from '@/utils/search'
import { defineStore } from 'pinia'

const BASE_FILTERS = {
  ALL: 'all',
  UNTAGGED: 'untagged',
} as const

type BaseFilter = Values<typeof BASE_FILTERS>

export const useStarsFilterStore = defineStore({
  actions: {
    addSearchToken(token: SearchToken) {
      this.searchTokens.push(token)
    },
    clearSearch() {
      this.searchText = ''
      this.searchTokens = []
    },
    clearSelectSmartFilter() {
      this.selectedSmartFilter = null
    },
    clearSelectedLanguage() {
      this.selectedLanguage = null
    },
    clearSelectedTag() {
      this.selectedTag = null
    },
    removeSearchTokenAt(index: number) {
      this.searchTokens.splice(index, 1)
    },
    setFilterByAll() {
      this.clearSelectedTag()
      this.clearSelectedLanguage()
      this.clearSelectSmartFilter()
      this.selectedFilter = BASE_FILTERS.ALL
    },
    setFilterByUntagged() {
      this.clearSelectedTag()
      this.selectedFilter = BASE_FILTERS.UNTAGGED
    },
    setSelectedLanguage(language: string) {
      this.clearSelectSmartFilter()
      this.selectedLanguage = language
    },
    setSelectedSmartFilter(filter: SmartFilter) {
      this.clearSelectedTag()
      this.clearSelectedLanguage()
      this.selectedSmartFilter = filter
    },
    setSelectedTag(tag: Tag) {
      this.clearSelectSmartFilter()
      this.selectedTag = tag
    },
  },
  getters: {
    isFilteringByAll(): boolean {
      return (
        this.selectedFilter === BASE_FILTERS.ALL &&
        !this.isFilteringByTag &&
        !this.isFilteringByLanguage &&
        !this.isFilteringBySmartFilter
      )
    },
    isFilteringByLanguage(): boolean {
      return !!this.selectedLanguage
    },
    isFilteringBySearch(): boolean {
      return this.searchTokens.length > 0 || parsePendingInput(this.searchText).freeText.trim().length > 0
    },
    isFilteringBySmartFilter(): boolean {
      return !!this.selectedSmartFilter
    },
    isFilteringByTag(): boolean {
      return !!this.selectedTag && !!Object.keys(this.selectedTag).length
    },
    isFilteringByUntagged(): boolean {
      return this.selectedFilter === BASE_FILTERS.UNTAGGED && !this.isFilteringByTag
    },
  },
  id: 'stars-filter',
  state() {
    return {
      searchText: '',
      searchTokens: [] as SearchToken[],
      selectedFilter: BASE_FILTERS.ALL as BaseFilter,
      selectedLanguage: null as Nullable<string>,
      selectedSmartFilter: null as Nullable<SmartFilter>,
      selectedTag: null as Nullable<Tag>,
    }
  },
})

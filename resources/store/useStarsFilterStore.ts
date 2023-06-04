import { defineStore } from 'pinia'
import { RepoLanguage, SmartFilter, Tag } from '@/scripts/types'

const BASE_FILTERS = {
  ALL: 'all',
  UNTAGGED: 'untagged',
} as const

interface SearchInput {
  query: string
  tags: string[]
  strings: string[]
}

type BaseFilter = Values<typeof BASE_FILTERS>

export const useStarsFilterStore = defineStore({
  id: 'stars-filter',
  state() {
    return {
      selectedFilter: BASE_FILTERS.ALL as BaseFilter,
      selectedTag: null as Nullable<Tag>,
      selectedLanguage: null as Nullable<string>,
      selectedSmartFilter: null as Nullable<SmartFilter>,
      searchQuery: '',
    }
  },
  getters: {
    search(): SearchInput {
      const queryParts = this.searchQuery.trim().toLowerCase().split(':').filter(Boolean)
      const tags = queryParts.filter(part => part.startsWith('#')).map(tag => tag.substring(1))
      const strings = queryParts.filter(part => !part.startsWith('#'))

      return {
        query: this.searchQuery,
        tags,
        strings,
      }
    },
    isFilteringByAll(): boolean {
      return (
        this.selectedFilter === BASE_FILTERS.ALL &&
        !this.isFilteringByTag &&
        !this.isFilteringByLanguage &&
        !this.isFilteringBySmartFilter
      )
    },
    isFilteringByUntagged(): boolean {
      return this.selectedFilter === BASE_FILTERS.UNTAGGED && !this.isFilteringByTag
    },
    isFilteringByTag(): boolean {
      return !!this.selectedTag && !!Object.keys(this.selectedTag).length
    },
    isFilteringByLanguage(): boolean {
      return !!this.selectedLanguage
    },
    isFilteringBySearch(): boolean {
      return !!this.searchQuery
    },
    isFilteringBySmartFilter(): boolean {
      return !!this.selectedSmartFilter
    },
  },
  actions: {
    clearSelectedTag() {
      this.selectedTag = null
    },
    clearSelectedLanguage() {
      this.selectedLanguage = null
    },
    clearSelectSmartFilter() {
      this.selectedSmartFilter = null
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
    setSelectedTag(tag: Tag) {
      this.clearSelectSmartFilter()
      this.selectedTag = tag
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
  },
})

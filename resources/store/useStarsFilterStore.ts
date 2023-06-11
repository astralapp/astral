import { RepoLanguage, SmartFilter, Tag } from '@/types'
import { defineStore } from 'pinia'

const BASE_FILTERS = {
  ALL: 'all',
  UNTAGGED: 'untagged',
} as const

interface SearchInput {
  query: string
  strings: string[]
  tags: string[]
}

type BaseFilter = Values<typeof BASE_FILTERS>

export const useStarsFilterStore = defineStore({
  actions: {
    clearSelectSmartFilter() {
      this.selectedSmartFilter = null
    },
    clearSelectedLanguage() {
      this.selectedLanguage = null
    },
    clearSelectedTag() {
      this.selectedTag = null
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
      return !!this.searchQuery
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
    search(): SearchInput {
      const queryParts = this.searchQuery.trim().toLowerCase().split(':').filter(Boolean)
      const tags = queryParts.filter(part => part.startsWith('#')).map(tag => tag.substring(1))
      const strings = queryParts.filter(part => !part.startsWith('#'))

      return {
        query: this.searchQuery,
        strings,
        tags,
      }
    },
  },
  id: 'stars-filter',
  state() {
    return {
      searchQuery: '',
      selectedFilter: BASE_FILTERS.ALL as BaseFilter,
      selectedLanguage: null as Nullable<string>,
      selectedSmartFilter: null as Nullable<SmartFilter>,
      selectedTag: null as Nullable<Tag>,
    }
  },
})

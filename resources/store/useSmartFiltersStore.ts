import { defineStore } from 'pinia'
import { router } from '@inertiajs/vue3'
import { Errors, Page, PageProps } from '@inertiajs/core'
import { SmartFilter } from '@/scripts/types'
import { moveSort } from '@/scripts/utils'

export const useSmartFiltersStore = defineStore({
  id: 'smart-filters',
  state() {
    return {
      smartFilters: [] as SmartFilter[],
    }
  },
  actions: {
    addSmartFilter(smartFilter: Pick<SmartFilter, 'name' | 'body'>): Promise<Page<PageProps> | Errors> {
      return new Promise((resolve, reject) => {
        router.post('/smart-filters', smartFilter, {
          only: ['smartFilters', 'abilities', 'errors'],
          onSuccess: page => {
            resolve(page)
          },
          onError: errors => {
            reject(errors)
          },
        })
      })
    },
    updateSmartFilter(id: number, smartFilter: Pick<SmartFilter, 'name' | 'body'>): Promise<Page<PageProps> | Errors> {
      return new Promise((resolve, reject) => {
        router.put(`/smart-filters/${id}`, smartFilter, {
          only: ['smartFilters', 'errors'],
          onSuccess: page => {
            resolve(page)
          },
          onError: errors => {
            reject(errors)
          },
        })
      })
    },
    deleteSmartFilter(id: number) {
      router.delete(`/smart-filters/${id}`, { only: ['smartFilters', 'abilities'] })
    },
    syncSmartFiltersOrder(oldIndex: number, newIndex: number) {
      const reorderedSmartFilters = moveSort(this.smartFilters, oldIndex, newIndex).map((smartFilter, index) => ({
        id: smartFilter.id,
        sort_order: index,
      }))

      router.put('/smart-filters/reorder', { smartFilters: reorderedSmartFilters } as any, { only: ['smartFilters'] })
    },
  },
})

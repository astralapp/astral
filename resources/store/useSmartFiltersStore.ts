import { moveSort } from '@/utils'
import { router } from 'hybridly'
import { defineStore } from 'pinia'

export const useSmartFiltersStore = defineStore({
  actions: {
    addSmartFilter(smartFilter: Pick<App.Data.SmartFilterData, 'body' | 'name'>) {
      return router.post(route('smart-filters.store'), {
        data: {
          smartFilter,
        },
        only: ['smartFilters'],
      })
    },
    deleteSmartFilter(smartFilterId: number) {
      router.delete(
        route('smart-filters.destroy', {
          smartFilter: smartFilterId,
        }),
        { only: ['smartFilters'] }
      )
    },
    syncSmartFiltersOrder(oldIndex: number, newIndex: number) {
      const reorderedSmartFilters = moveSort(this.smartFilters, oldIndex, newIndex).map((smartFilter, index) => ({
        id: smartFilter.id,
        sort_order: index,
      }))

      router.put(route('smart-filters.reorder'), {
        data: {
          smartFilters: reorderedSmartFilters,
        },
        only: ['smartFilters'],
      })
    },
    updateSmartFilter(smartFilterId: number, smartFilter: Pick<App.Data.SmartFilterData, 'body' | 'name'>) {
      return router.post(
        route('smart-filters.update', {
          smartFilter: smartFilterId,
        }),
        {
          data: {
            smartFilter,
          },
          only: ['smartFilters'],
        }
      )
    },
  },
  id: 'smart-filters',
  state() {
    return {
      smartFilters: [] as App.Data.SmartFilterData[],
    }
  },
})

import { FetchDirection, TagSortMethod } from '@/types'
import { moveSort } from '@/utils'
import { router } from 'hybridly'
import orderBy from 'lodash/orderBy'
import { defineStore } from 'pinia'

export const useTagsStore = defineStore({
  actions: {
    _reorderTags(tags: Pick<App.Data.TagData, 'id' | 'sort_order'>[]) {
      router.put(route('tags.reorder'), {
        data: {
          tags,
        },
        only: ['tags'],
      })
    },
    addTag(tagName: string) {
      return router.post(route('tags.store'), {
        data: {
          name: tagName,
        },
        only: ['tags', 'abilities'],
      })
    },
    deleteTag(tagId: number) {
      router.delete(route('tags.destroy', { tag: tagId }), { only: ['tags'] })
    },
    sortTags(method: TagSortMethod, direction: Lowercase<FetchDirection>) {
      this.tags = orderBy(this.tags, method, direction)

      const reorderedTags = this.tags.map((tag, index) => ({
        id: tag.id,
        sort_order: index,
      }))

      this._reorderTags(reorderedTags)
    },
    syncTagOrder(oldIndex: number, newIndex: number) {
      const reorderedTags = moveSort(this.tags, oldIndex, newIndex).map((tag, index) => ({
        id: tag.id,
        sort_order: index,
      }))

      this._reorderTags(reorderedTags)
    },
  },
  id: 'tags',
  state() {
    return {
      tags: [] as App.Data.TagData[],
    }
  },
})

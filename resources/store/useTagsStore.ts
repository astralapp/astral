import { defineStore } from 'pinia'
import { router } from '@inertiajs/vue3'
import { Errors, Page, PageProps } from '@inertiajs/core'
import orderBy from 'lodash/orderBy'
import { FetchDirection, Tag, TagSortMethod } from '@/scripts/types'
import { moveSort } from '@/scripts/utils'

export const useTagsStore = defineStore({
  id: 'tags',
  state() {
    return {
      tags: [] as Tag[],
    }
  },
  actions: {
    addTag(tagName: string): Promise<Page<PageProps> | Errors> {
      return new Promise((resolve, reject) => {
        router.post(
          '/tags',
          { name: tagName },
          {
            only: ['tags', 'abilities', 'errors'],
            onSuccess: page => {
              resolve(page)
            },
            onError: errors => {
              reject(errors)
            },
          }
        )
      })
    },
    sortTags(method: TagSortMethod, direction: Lowercase<FetchDirection>) {
      this.tags = orderBy(this.tags, method, direction)

      const reorderedTags = this.tags.map((tag, index) => ({
        id: tag.id,
        sort_order: index,
      }))

      router.put('/tags/reorder', { tags: reorderedTags } as any, { only: ['tags'] })
    },
    syncTagOrder(oldIndex: number, newIndex: number) {
      const reorderedTags = moveSort(this.tags, oldIndex, newIndex).map((tag, index) => ({
        id: tag.id,
        sort_order: index,
      }))

      router.put('/tags/reorder', { tags: reorderedTags } as any, { only: ['tags'] })
    },
    deleteTag(id: number) {
      router.delete(`/tags/${id}`, { only: ['tags'] })
    },
  },
})

import tags from '@/store/modules/tags'
import router from '@/router'
import client from '@/store/api/client'

jest.mock('@/store/api/client')
jest.mock('@/router', () => ({
  replace: jest.fn(),
  currentRoute: {
    query: ''
  }
}))

const getters = tags.getters
const { SET_TAGS, SET_CURRENT_TAG, ADD_TAG, DELETE_TAG, UPDATE_TAG } = tags.mutations
const { fetchTags, addTag, setCurrentTag, reorderTags, sortTags, deleteTag, renameTag } = tags.actions

describe('Tags Module', () => {
  let state
  let ctx
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    state = { ...tags.state }
    ctx = {
      commit: jest.fn(),
      state,
      dispatch: jest.fn(),
      rootState: {
        stars: {
          stars: []
        }
      }
    }
  })

  describe('Tags state', () => {
    it('returns the tag-related state', () => {
      expect(state.tags).toEqual([])
      expect(state.currentTag).toEqual({})
    })
  })

  describe('Tags getters', () => {
    it('returns the user', () => {
      expect(getters.tags(state)).toEqual(state.tags)
      expect(getters.currentTag(state)).toEqual(state.currentTag)
    })
  })

  describe('Tags mutations', () => {
    it('sets the tags array', () => {
      const tags = ['Vue', 'React', 'Angular']

      SET_TAGS(state, tags)

      expect(state.tags).toEqual(tags)
    })

    it('sets the current tag', () => {
      const currentTag = { name: 'Vue' }

      SET_CURRENT_TAG(state, currentTag)

      expect(state.currentTag).toEqual(currentTag)
    })

    it('adds a new tag', () => {
      ADD_TAG(state, 'Vue')

      expect(state.tags).toEqual(['Vue'])

      ADD_TAG(state, 'React')

      expect(state.tags).toEqual(['Vue', 'React'])
    })

    it('deletes a tag by id', () => {
      state.tags = state.tags.concat([
        {
          id: 1,
          name: 'Vue'
        },
        {
          id: 2,
          name: 'React'
        }
      ])

      expect(state.tags.length).toBe(2)

      DELETE_TAG(state, 1)

      expect(state.tags.length).toBe(1)
      expect(state.tags.findIndex(t => t.id === 1)).toBe(-1)
    })

    it('updates a tag by id with a new tag', () => {
      state.tags = state.tags.concat([
        {
          id: 1,
          name: 'Vue'
        },
        {
          id: 2,
          name: 'React'
        }
      ])
      const newTag = {
        id: 1,
        name: 'VueJS'
      }
      UPDATE_TAG(state, { id: 1, newTag })
      expect(state.tags[0].name).toBe('VueJS')
    })
  })

  describe('Tags actions', () => {
    it("fetches the user's tags", async () => {
      const res = ['Vue', 'React', 'Angular']
      client.get.mockResolvedValue(res)

      await fetchTags(ctx)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.get).toHaveBeenCalledWith('/api/tags')
      expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', res)
    })

    it('adds a tag', async () => {
      const newTag = { name: 'Jest' }
      client.post.mockResolvedValue(newTag)

      await addTag(ctx, newTag.name)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.post).toHaveBeenCalledWith('/api/tags', { name: newTag.name })
      expect(ctx.commit).toHaveBeenCalledWith('ADD_TAG', newTag)
    })

    describe('Setting the current tag', () => {
      it('sets the current tag', async () => {
        const currentTag = { name: 'Jest' }

        await setCurrentTag(ctx, currentTag)

        expect(ctx.commit).toHaveBeenCalledWith('SET_CURRENT_TAG', currentTag)
        expect(ctx.commit).toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', false)
        expect(router.replace).toHaveBeenCalledWith({ query: { tag: currentTag.name } })
      })

      it('sets the viewing status to untagged if no tag is set', async () => {
        await setCurrentTag(ctx, {})
        expect(ctx.commit).not.toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', false)
      })
    })

    it('reorders tags', async () => {
      const dummyMap = []
      client.put.mockResolvedValue([])
      await reorderTags(ctx, dummyMap)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.put).toHaveBeenCalledWith('/api/tags/reorder', { tags: dummyMap })
      expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', [])
    })
    describe('sorting tags', () => {
      it('sorts by ascending alpha', async () => {
        ctx.state.tags = ctx.state.tags.concat([
          { name: 'Vue', stars_count: 50 },
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 10 }
        ])

        const sortedTags = [
          { name: 'Angular', stars_count: 10 },
          { name: 'React', stars_count: 35 },
          { name: 'Vue', stars_count: 50 }
        ]

        await sortTags(ctx, 'ALPHA_ASC')

        expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(ctx.dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })

      it('sorts by descending alpha', async () => {
        ctx.state.tags = ctx.state.tags.concat([
          { name: 'Vue', stars_count: 50 },
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 10 }
        ])

        const sortedTags = [
          { name: 'Vue', stars_count: 50 },
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 10 }
        ]

        await sortTags(ctx, 'ALPHA_DESC')

        expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(ctx.dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })

      it('sorts by ascending star count', async () => {
        ctx.state.tags = ctx.state.tags.concat([
          { name: 'Vue', stars_count: 50 },
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 40 }
        ])

        const sortedTags = [
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 40 },
          { name: 'Vue', stars_count: 50 }
        ]

        await sortTags(ctx, 'STARS_ASC')

        expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(ctx.dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })
      it('sorts by descending star count', async () => {
        ctx.state.tags = ctx.state.tags.concat([
          { name: 'Vue', stars_count: 50 },
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 40 }
        ])

        const sortedTags = [
          { name: 'Vue', stars_count: 50 },
          { name: 'Angular', stars_count: 40 },
          { name: 'React', stars_count: 35 }
        ]

        await sortTags(ctx, 'STARS_DESC')

        expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(ctx.dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })
    })

    describe('deleting tags', () => {
      it('deletes tags', async () => {
        await deleteTag(ctx, 2)

        expect(client.withAuth).toHaveBeenCalled()
        expect(client.delete).toHaveBeenCalledWith('/api/tags/2')
        expect(ctx.commit).toHaveBeenCalledWith('DELETE_TAG', 2)
        expect(ctx.commit).not.toHaveBeenCalledWith('SET_CURRENT_TAG', {})
      })

      it("resets the current tag if it's the deleted tag", async () => {
        state.currentTag = { id: 2, name: 'React' }

        await deleteTag(ctx, 2)

        expect(ctx.commit).toHaveBeenCalledWith('SET_CURRENT_TAG', {})
      })

      it('removes any tags from stars matching the deleted tag', async () => {
        ctx.rootState.stars.stars = [].concat([
          {
            node: {
              name: 'vuejs/vue',
              databaseId: 1234
            },
            tags: [{ id: 1, name: 'VueJS' }]
          },
          {
            node: {
              name: 'facebook/react',
              databaseId: 5678
            },
            tags: [{ id: 2, name: 'React' }]
          },
          {
            node: {
              name: 'facebook/prop-types',
              databaseId: 9101112
            },
            tags: [{ id: 2, name: 'React' }]
          }
        ])

        await deleteTag(ctx, 2)

        expect(ctx.commit).toHaveBeenNthCalledWith(2, 'SET_STAR_TAGS', {
          starId: 5678,
          tags: []
        })
        expect(ctx.commit).toHaveBeenNthCalledWith(3, 'SET_STAR_TAGS', {
          starId: 9101112,
          tags: []
        })
      })
    })

    describe('renaming tags', () => {
      it('renames tags', async () => {
        const renamedTag = { id: 1, name: 'VueJS' }
        client.patch.mockResolvedValue(renamedTag)
        await renameTag(ctx, renamedTag)

        expect(client.withAuth).toHaveBeenCalled()
        expect(client.patch).toHaveBeenCalledWith(`/api/tags/${renamedTag.id}`, { name: renamedTag.name })
        expect(ctx.commit).toHaveBeenCalledWith('UPDATE_TAG', { id: renamedTag.id, newTag: renamedTag })
        expect(ctx.commit).not.toHaveBeenCalledWith('SET_CURRENT_TAG', renamedTag)
      })

      it('updates the current tag if it matches the renamed tag', async () => {
        const renamedTag = { id: 1, name: 'VueJS' }
        state.currentTag = { id: 1, name: 'Vue' }

        await renameTag(ctx, renamedTag)

        expect(ctx.commit).toHaveBeenCalledWith('SET_CURRENT_TAG', renamedTag)
      })

      it('updates any tags from stars matching the renamed tag', async () => {
        const renamedTag = { id: 1, name: 'VueJS' }
        ctx.rootState.stars.stars = [].concat([
          {
            node: {
              name: 'vuejs/vue',
              databaseId: 1234
            },
            tags: [{ id: 1, name: 'Vue' }]
          }
        ])

        await renameTag(ctx, renamedTag)

        expect(ctx.commit).toHaveBeenNthCalledWith(2, 'SET_STAR_TAGS', {
          starId: 1234,
          tags: [{ id: 1, name: 'VueJS' }]
        })
      })
    })
  })
})

function generateSortMap (tags) {
  return tags.map((tag, i) => {
    return {
      id: tag.id,
      sort_order: i
    }
  })
}

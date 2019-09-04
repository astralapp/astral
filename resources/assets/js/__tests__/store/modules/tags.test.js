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
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('Tags getters', () => {
    it('returns the tags', () => {
      const state = {
        tags: []
      }

      expect(getters.tags(state)).toEqual(state.tags)
    })

    it('returns the current tag', () => {
      const state = {
        currentTag: { name: 'Vue' }
      }

      expect(getters.currentTag(state)).toEqual(state.currentTag)
    })
  })

  describe('Tags mutations', () => {
    it('sets the tags array', () => {
      const tags = ['Vue', 'React', 'Angular']
      const state = {
        tags
      }

      SET_TAGS(state, tags)

      expect(state.tags).toEqual(tags)
    })

    it('sets the current tag', () => {
      const currentTag = { name: 'Vue' }

      const state = {
        currentTag
      }

      SET_CURRENT_TAG(state, currentTag)

      expect(state.currentTag).toEqual(currentTag)
    })

    it('adds a new tag', () => {
      const state = {
        tags: []
      }

      ADD_TAG(state, 'Vue')

      expect(state.tags).toEqual(['Vue'])

      ADD_TAG(state, 'React')

      expect(state.tags).toEqual(['Vue', 'React'])
    })

    it('deletes a tag', () => {
      const state = {
        tags: [
          {
            id: 1,
            name: 'Vue'
          },
          {
            id: 2,
            name: 'React'
          }
        ]
      }

      expect(state.tags.length).toBe(2)

      DELETE_TAG(state, 1)

      expect(state.tags.length).toBe(1)
      expect(state.tags.findIndex(t => t.id === 1)).toBe(-1)
    })

    it('updates a tag', () => {
      const state = {
        tags: [
          {
            id: 1,
            name: 'Vue'
          },
          {
            id: 2,
            name: 'React'
          }
        ]
      }

      const newTag = {
        id: 1,
        name: 'VueJS'
      }

      UPDATE_TAG(state, { id: 1, newTag })

      expect(state.tags[0].name).toBe('VueJS')
    })
  })

  describe('Tags actions', () => {
    const commit = jest.fn()
    const dispatch = jest.fn()

    it("fetches the user's tags", async () => {
      const res = ['Vue', 'React', 'Angular']
      client.get.mockResolvedValue({ data: res })

      await fetchTags({ commit })

      expect(client.get).toHaveBeenCalledWith('/tags')
      expect(commit).toHaveBeenCalledWith('SET_TAGS', res)
    })

    it('adds a tag', async () => {
      const newTag = { name: 'Jest' }
      client.post.mockResolvedValue({ data: newTag })

      await addTag({ commit }, newTag.name)

      expect(client.post).toHaveBeenCalledWith('/tags', { name: newTag.name })
      expect(commit).toHaveBeenCalledWith('ADD_TAG', newTag)
    })

    describe('Setting the current tag', () => {
      it('sets the current tag', async () => {
        const currentTag = { name: 'Jest' }

        await setCurrentTag({ commit, dispatch }, currentTag)

        expect(commit).toHaveBeenCalledWith('SET_CURRENT_TAG', currentTag)
        expect(dispatch).toHaveBeenCalledWith('setViewingUntagged', false)
        expect(dispatch).toHaveBeenCalledWith('setCurrentPredicate', {})
        expect(router.replace).toHaveBeenCalledWith({ query: { tag: currentTag.name } })

        jest.clearAllMocks()

        await setCurrentTag({ commit, dispatch }, {})

        expect(commit).toHaveBeenCalledWith('SET_CURRENT_TAG', {})
        expect(dispatch).not.toHaveBeenCalledWith('setViewingUntagged', false)
        expect(dispatch).not.toHaveBeenCalledWith('setCurrentPredicate', {})
        expect(router.replace).toHaveBeenCalledWith({ query: {} })
      })

      it('sets the viewing status to untagged if no tag is set', async () => {
        await setCurrentTag({ commit }, {})
        expect(commit).not.toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', false)
      })
    })

    it('reorders tags', async () => {
      const dummyMap = []
      client.put.mockResolvedValue({ data: [] })

      await reorderTags({ commit }, dummyMap)

      expect(client.put).toHaveBeenCalledWith('/tags/reorder', { tags: dummyMap })
      expect(commit).toHaveBeenCalledWith('SET_TAGS', dummyMap)
    })
    describe('sorting tags', () => {
      it('sorts by ascending alpha', async () => {
        const state = {
          tags: [
            { name: 'Vue', stars_count: 50 },
            { name: 'React', stars_count: 35 },
            { name: 'Angular', stars_count: 10 }
          ]
        }

        const sortedTags = [
          { name: 'Angular', stars_count: 10 },
          { name: 'React', stars_count: 35 },
          { name: 'Vue', stars_count: 50 }
        ]

        await sortTags({ commit, dispatch, state }, 'ALPHA_ASC')

        expect(commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })

      it('sorts by descending alpha', async () => {
        const state = {
          tags: [
            { name: 'Vue', stars_count: 50 },
            { name: 'React', stars_count: 35 },
            { name: 'Angular', stars_count: 10 }
          ]
        }

        const sortedTags = [
          { name: 'Vue', stars_count: 50 },
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 10 }
        ]

        await sortTags({ commit, dispatch, state }, 'ALPHA_DESC')

        expect(commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })

      it('sorts by ascending star count', async () => {
        const state = {
          tags: [
            { name: 'Vue', stars_count: 50 },
            { name: 'React', stars_count: 35 },
            { name: 'Angular', stars_count: 40 }
          ]
        }

        const sortedTags = [
          { name: 'React', stars_count: 35 },
          { name: 'Angular', stars_count: 40 },
          { name: 'Vue', stars_count: 50 }
        ]

        await sortTags({ commit, dispatch, state }, 'STARS_ASC')

        expect(commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })
      it('sorts by descending star count', async () => {
        const state = {
          tags: [
            { name: 'Vue', stars_count: 50 },
            { name: 'React', stars_count: 35 },
            { name: 'Angular', stars_count: 40 }
          ]
        }

        const sortedTags = [
          { name: 'Vue', stars_count: 50 },
          { name: 'Angular', stars_count: 40 },
          { name: 'React', stars_count: 35 }
        ]

        await sortTags({ commit, dispatch, state }, 'STARS_DESC')

        expect(commit).toHaveBeenCalledWith('SET_TAGS', sortedTags)
        expect(dispatch).toHaveBeenCalledWith('reorderTags', generateSortMap(sortedTags))
      })
    })

    describe('deleting tags', () => {
      it('deletes tags', async () => {
        const rootState = {
          stars: {
            stars: []
          }
        }
        const state = {
          currentTag: { id: 1 }
        }
        await deleteTag({ commit, rootState, state, dispatch }, 2)

        expect(client.delete).toHaveBeenCalledWith('/tags/2')
        expect(commit).toHaveBeenCalledWith('DELETE_TAG', 2)
        expect(dispatch).not.toHaveBeenCalledWith('setCurrentTag', {})

        jest.clearAllMocks()

        await deleteTag({ commit, rootState, state, dispatch }, 1)

        expect(client.delete).toHaveBeenCalledWith('/tags/1')
        expect(commit).toHaveBeenCalledWith('DELETE_TAG', 1)
        expect(dispatch).toHaveBeenCalledWith('setCurrentTag', {})
      })

      it("resets the current tag if it's the deleted tag", async () => {
        const rootState = {
          stars: {
            stars: []
          }
        }
        const state = {
          currentTag: { id: 2 }
        }
        await deleteTag({ commit, rootState, state, dispatch }, 2)

        expect(dispatch).toHaveBeenCalledWith('setCurrentTag', {})
      })

      it('removes any tags from stars matching the deleted tag', async () => {
        const rootState = {
          stars: {
            stars: [
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
            ]
          }
        }
        const state = {
          currentTag: { id: 2 }
        }

        await deleteTag({ commit, rootState, state, dispatch }, 2)

        expect(commit).toHaveBeenNthCalledWith(2, 'SET_STAR_TAGS', {
          starId: 5678,
          tags: []
        })
        expect(commit).toHaveBeenNthCalledWith(3, 'SET_STAR_TAGS', {
          starId: 9101112,
          tags: []
        })
      })
    })

    describe('renaming tags', () => {
      it('renames tags', async () => {
        const rootState = {
          stars: {
            stars: []
          }
        }
        const state = {
          currentTag: { id: 2 }
        }
        const renamedTag = { id: 1, name: 'VueJS' }
        client.patch.mockResolvedValue({ data: renamedTag })
        await renameTag({ commit, rootState, state }, renamedTag)

        expect(client.patch).toHaveBeenCalledWith(`/tags/${renamedTag.id}`, { name: renamedTag.name })
        expect(commit).toHaveBeenCalledWith('UPDATE_TAG', { id: renamedTag.id, newTag: renamedTag })
        expect(commit).not.toHaveBeenCalledWith('SET_CURRENT_TAG', renamedTag)
      })

      it('updates the current tag if it matches the renamed tag', async () => {
        const rootState = {
          stars: {
            stars: []
          }
        }
        const state = {
          currentTag: { id: 1, name: 'Vue' }
        }
        const renamedTag = { id: 1, name: 'VueJS' }

        await renameTag({ commit, rootState, state }, renamedTag)

        expect(commit).toHaveBeenCalledWith('SET_CURRENT_TAG', renamedTag)
      })

      it('updates any tags from stars matching the renamed tag', async () => {
        const rootState = {
          stars: {
            stars: [
              {
                node: {
                  name: 'vuejs/vue',
                  databaseId: 1234
                },
                tags: [{ id: 1, name: 'Vue' }, { id: 2, name: 'SPA' }]
              }
            ]
          }
        }
        const state = {
          currentTag: { id: 4, name: 'Svelte' }
        }
        const renamedTag = { id: 1, name: 'VueJS' }

        await renameTag({ commit, rootState, state }, renamedTag)

        expect(commit).toHaveBeenNthCalledWith(2, 'SET_STAR_TAGS', {
          starId: 1234,
          tags: [{ id: 1, name: 'VueJS' }, { id: 2, name: 'SPA' }]
        })
      })
    })
  })
})

function generateSortMap(tags) {
  return tags.map((tag, i) => {
    return {
      id: tag.id,
      sort_order: i
    }
  })
}

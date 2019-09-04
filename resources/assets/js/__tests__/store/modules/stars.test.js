import stars from '@/store/modules/stars'
import sampleStars from '../../utils/sample-stars'
import router from '@/router'
import client from '@/store/api/client'
import { cloneDeep } from 'lodash'

jest.mock('@/store/api/client')
jest.mock('@/router', () => ({
  replace: jest.fn(),
  currentRoute: {
    query: ''
  }
}))

const getters = stars.getters
const {
  CLEAR_STARS,
  ADD_TAG_TO_STARS,
  SET_CURRENT_LANGUAGE,
  SET_CURRENT_STAR,
  PUSH_TO_CURRENT_STARS,
  SELECT_STARS,
  SET_README,
  SET_STARS_PAGE_INFO,
  SET_STAR_TAGS,
  SET_TOTAL_STARS,
  SET_USER_STARS,
  SET_VIEWING_UNTAGGED,
  MAP_USER_STARS_TO_GITHUB_STARS,
  SET_STAR_NOTES,
  RESET_STARS
} = stars.mutations
const {
  fetchGitHubStars,
  fetchUserStars,
  setCurrentLanguage,
  addTagToStars,
  setCurrentStar,
  pushToCurrentStars,
  selectStars,
  fetchReadme,
  setViewingUntagged,
  syncStarTags,
  editStarNotes,
  cleanupStars,
  autotagStars
} = stars.actions

describe('Stars Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('Stars getters', () => {
    it('returns the stars', () => {
      const state = {
        stars: [{ id: 1 }]
      }

      expect(getters.stars(state)).toEqual(state.stars)
    })

    it('returns the page info', () => {
      const state = {
        pageInfo: { currentPage: 1 }
      }

      expect(getters.pageInfo(state)).toEqual(state.pageInfo)
    })

    it('returns total stars', () => {
      const state = {
        totalStars: 420
      }
      expect(getters.totalStars(state)).toEqual(state.totalStars)
    })

    it('returns total untagged stars', () => {
      const state = {
        stars: [{ id: 1, tags: ['a', 'b', 'c'] }, { id: 2, tags: [] }, { id: 3, tags: [] }]
      }
      expect(getters.totalUntaggedStars(state)).toEqual(2)
    })

    it('returns a list of all star languages with counts', () => {
      const state = {
        stars: cloneDeep(sampleStars.edges)
      }
      expect(getters.languages(state)).toEqual([{ name: 'JavaScript', count: 3 }, { name: 'PHP', count: 2 }])
    })

    it('returns the current language', () => {
      const state = {
        currentLanguage: 'JavaScript'
      }

      expect(getters.currentLanguage(state)).toEqual(state.currentLanguage)
    })

    it('returns the first current star or an empty object if there is none', () => {
      const state = {
        currentStars: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }]
      }
      const gettersStub = {
        currentStars: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }]
      }
      expect(getters.currentStar(state, gettersStub)).toEqual({ name: 'First' })

      state.currentStars = []
      gettersStub.currentStars = []

      expect(getters.currentStar(state, gettersStub)).toEqual({})
    })

    it('returns the current stars, and omits duplicates', () => {
      const state = {
        currentStars: [{ node: { databaseId: 1234 } }, { node: { databaseId: 1234 } }, { node: { databaseId: 5678 } }]
      }
      expect(getters.currentStars(state).length).toBe(2)
    })

    it('returns the current star indexes if they exist or defaults to an empty array if no stars are selected', () => {
      const stars = cloneDeep(sampleStars.edges)
      const state = {
        stars,
        currentStars: [stars[0], stars[1]]
      }
      const filteredStars = state.stars.map(star => {
        return { value: star }
      })

      expect(getters.currentStarIndexes(state, { filteredStars })).toEqual([0, 1])

      state.currentStars = []

      expect(getters.currentStarIndexes(state, getters)).toEqual([])
    })

    it('returns the readme', () => {
      const state = { readme: '# Hello World' }
      expect(getters.readme(state)).toEqual(state.readme)
    })

    it('returns the viewing untagged bool', () => {
      const state = { viewingUntagged: false }
      expect(getters.viewingUntagged(state)).toEqual(state.viewingUntagged)
    })
  })

  describe('Stars mutations', () => {
    it('sets the stars', () => {
      const stars = cloneDeep(sampleStars.edges)
      const state = {
        stars
      }

      expect(state.stars).toEqual(stars)
    })

    it('clears the stars', () => {
      const stars = cloneDeep(sampleStars.edges)
      const state = {
        stars
      }

      CLEAR_STARS(state, stars)

      expect(state.stars).toEqual([])
    })

    it('sets the total stars count', () => {
      const state = {
        totalStars: 0
      }

      SET_TOTAL_STARS(state, 500)

      expect(state.totalStars).toBe(500)
    })

    it('sets the stars pagination info', () => {
      const state = {
        pageInfo: {}
      }

      SET_STARS_PAGE_INFO(state, sampleStars.pageInfo)

      expect(state.pageInfo).toEqual(sampleStars.pageInfo)
    })

    it('sets the current language', () => {
      const state = {
        currentLanguage: ''
      }

      SET_CURRENT_LANGUAGE(state, 'JavaScript')

      expect(state.currentLanguage).toBe('JavaScript')
    })

    it('adds tags to stars', () => {
      const sampleTags = [{ name: 'VueJS' }, { name: 'React' }, { name: 'Angular' }]
      const state = {
        tags: sampleTags,
        stars: cloneDeep(sampleStars.edges).map(star => ({
          ...star,
          tags: [{ name: 'Testing' }]
        }))
      }

      ADD_TAG_TO_STARS(state, {
        stars: [sampleStars.edges[0].node],
        tag: sampleTags[0]
      })

      expect(state.stars[0].tags).toEqual([{ name: 'Testing' }, sampleTags[0]])
    })

    it('sets multiple tags  on a single star', () => {
      const sampleTags = [{ name: 'VueJS' }, { name: 'React' }, { name: 'Angular' }]
      const stars = cloneDeep(sampleStars).edges.map(s => ({ ...s, tags: [] }))
      const state = {
        stars
      }

      SET_STAR_TAGS(state, {
        starId: sampleStars.edges[0].node.databaseId,
        tags: sampleTags
      })

      expect(state.stars[0].tags).toEqual(sampleTags)
    })

    it('sets the user stars', () => {
      const sampleUserStars = [
        { name: sampleStars.edges[0].node.nameWithOwner },
        { name: sampleStars.edges[1].node.nameWithOwner }
      ]

      const state = {
        userStars: sampleUserStars
      }

      SET_USER_STARS(state, sampleUserStars)

      expect(state.userStars).toEqual(sampleUserStars)
    })

    it('maps the user stars to the users GitHub stars', () => {
      const sampleTags = [{ name: 'VueJS' }, { name: 'React' }, { name: 'Angular' }]
      const sampleUserStars = [
        {
          name: sampleStars.edges[0].node.nameWithOwner,
          tags: [sampleTags[0]],
          repo_id: sampleStars.edges[0].node.databaseId
        },
        {
          name: sampleStars.edges[1].node.nameWithOwner,
          tags: [sampleTags[1], sampleTags[2]],
          repo_id: sampleStars.edges[1].node.databaseId,
          notes: 'Hello World'
        }
      ]

      const state = {
        stars: cloneDeep(sampleStars).edges,
        userStars: sampleUserStars
      }

      MAP_USER_STARS_TO_GITHUB_STARS(state)

      expect(state.stars[0].tags).toEqual(sampleUserStars[0].tags)
      expect(state.stars[1].tags).toEqual(sampleUserStars[1].tags)
      expect(state.stars[1].notes).toEqual(sampleUserStars[1].notes)
    })

    it('sets the current star', () => {
      const star = sampleStars.edges[0]

      const state = {
        currentStars: [star]
      }

      SET_CURRENT_STAR(state, star)

      expect(state.currentStars).toEqual([star])
    })

    it('can push or remove a star to or from the selected stars list', () => {
      const state = {
        stars: cloneDeep(sampleStars).edges,
        currentStars: []
      }

      PUSH_TO_CURRENT_STARS(state, sampleStars.edges[0])

      expect(state.currentStars).toEqual([sampleStars.edges[0]])

      PUSH_TO_CURRENT_STARS(state, sampleStars.edges[1])

      expect(state.currentStars).toEqual([sampleStars.edges[0], sampleStars.edges[1]])

      PUSH_TO_CURRENT_STARS(state, sampleStars.edges[0])

      expect(state.currentStars).toEqual([sampleStars.edges[1]])
    })

    it('can append multiple stars to the selected stars list', () => {
      const state = {
        stars: cloneDeep(sampleStars).edges,
        currentStars: []
      }

      SELECT_STARS(state, [sampleStars.edges[0], sampleStars.edges[1]])

      expect(state.currentStars).toEqual([sampleStars.edges[0], sampleStars.edges[1]])

      SELECT_STARS(state, [sampleStars.edges[3], sampleStars.edges[4]])

      expect(state.currentStars).toEqual([sampleStars.edges[3], sampleStars.edges[4]])
    })

    it('can set the readme', () => {
      const state = {
        readme: ''
      }

      SET_README(state, 'Hello World')

      expect(state.readme).toBe('Hello World')
    })

    it('can set the "viewing untagged" bool state', () => {
      const state = {
        viewingUntagged: false
      }

      SET_VIEWING_UNTAGGED(state, true)

      expect(state.viewingUntagged).toBe(true)

      SET_VIEWING_UNTAGGED(state, false)

      expect(state.viewingUntagged).toBe(false)
    })

    it('can set the notes for a star', () => {
      const state = {
        stars: cloneDeep(sampleStars).edges,
        currentStars: [sampleStars.edges[0]]
      }

      SET_STAR_NOTES(state, {
        id: sampleStars.edges[0].node.databaseId,
        notes: 'Hello World'
      })

      expect(state.stars[0].notes).toBe('Hello World')
      expect(state.currentStars[0].notes).toBe('Hello World')
    })

    it('can reset all the stars state', () => {
      const state = {
        stars: cloneDeep(sampleStars).edges,
        currentStars: [sampleStars.edges[0]],
        readme: '',
        pageInfo: { currentPage: 1 },
        totalStars: sampleStars.edges.length
      }

      RESET_STARS(state)

      expect(state.readme).toBe('')
      expect(state.pageInfo).toEqual({})
      expect(state.totalStars).toBe(0)
      expect(state.stars).toEqual([])
      expect(state.currentStars).toEqual([])
    })
  })

  describe('Stars actions', () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    describe("Fetching the user's GitHub stars", () => {
      it('fetches their stars', async () => {
        let sampleRes = sampleStars.edges.map(edge => {
          edge.tags = []
          edge.notes = ''
          return edge
        })
        client.get.mockResolvedValue({ data: sampleStars })

        await fetchGitHubStars({ commit }, { cursor: null, refresh: false })

        expect(client.get).toHaveBeenCalledWith('/stars/github?')
        expect(commit).not.toHaveBeenCalledWith('RESET_STARS')
        expect(commit).toHaveBeenCalledWith('SET_STARS', sampleRes)
        expect(commit).toHaveBeenCalledWith('SET_STARS_PAGE_INFO', sampleStars.pageInfo)
        expect(commit).toHaveBeenCalledWith('SET_TOTAL_STARS', sampleStars.totalCount)
        expect(commit).toHaveBeenCalledWith('MAP_USER_STARS_TO_GITHUB_STARS')
      })

      it('resets the star-related state if refresh is true', async () => {
        await fetchGitHubStars({ commit }, { cursor: null, refresh: true })

        expect(commit).toHaveBeenCalledWith('RESET_STARS')
        expect(client.get).toHaveBeenCalledWith('/stars/github?refresh=true')
      })

      it('does not set the total count state if a cursor is passed', async () => {
        await fetchGitHubStars({ commit }, { cursor: null, refresh: false })

        expect(commit).not.toHaveBeenCalledWith('SET_TOTAL_STARS')
      })

      it('can pass a cursor to the request query string', async () => {
        await fetchGitHubStars({ commit }, { cursor: 'abc123', refresh: false })

        expect(commit).not.toHaveBeenCalledWith('SET_TOTAL_STARS')
        expect(client.get).toHaveBeenCalledWith('/stars/github?cursor=abc123')
      })
    })

    it('fetches user stars', async () => {
      client.get.mockResolvedValue({ data: sampleStars.edges })

      await fetchUserStars({ commit })

      expect(client.get).toHaveBeenCalledWith('/stars')
      expect(commit).toHaveBeenCalledWith('SET_USER_STARS', sampleStars.edges)
    })

    it('sets the current language', async () => {
      await setCurrentLanguage({ commit, dispatch }, 'JavaScript')

      expect(commit).toHaveBeenCalledWith('SET_CURRENT_LANGUAGE', 'JavaScript')
      expect(dispatch).toHaveBeenCalledWith('setCurrentPredicate', {})
      expect(router.replace).toHaveBeenCalledWith({
        query: { language: 'JavaScript' }
      })
    })

    it('adds a tag to one or more stars', async () => {
      const sampleRes = { data: { tags: [{ name: 'VueJS' }, { name: 'React' }] } }
      const reqArgs = {
        stars: [sampleStars.edges[0].node],
        tag: sampleRes.data.tags[0]
      }
      client.post.mockResolvedValue(sampleRes)

      await addTagToStars({ commit }, reqArgs)

      expect(commit).toHaveBeenCalledWith('ADD_TAG_TO_STARS', reqArgs)

      expect(client.post).toHaveBeenCalledWith('/star/tags', {
        starIds: [sampleStars.edges[0].node.databaseId],
        tag: sampleRes.data.tags[0]
      })

      expect(commit).toHaveBeenCalledWith('SET_TAGS', sampleRes.data.tags)
    })

    it('sets the current star', async () => {
      const currentStar = sampleStars.edges[0]

      await setCurrentStar({ commit }, currentStar)

      expect(commit).toHaveBeenCalledWith('SET_CURRENT_STAR', currentStar)
    })

    it('can set the currently selected stars', async () => {
      const stars = [sampleStars.edges[0], sampleStars.edges[1]]

      await selectStars({ commit }, stars)

      expect(commit).toHaveBeenCalledWith('SELECT_STARS', stars)
    })

    it('can push to the selected stars list', async () => {
      const star = sampleStars.edges[0]

      await pushToCurrentStars({ commit }, star)

      expect(commit).toHaveBeenCalledWith('PUSH_TO_CURRENT_STARS', star)
    })

    describe('fetching repo readmes', () => {
      it('fetches a repo readme', async () => {
        client.get.mockResolvedValue({ data: 'Hello World' })

        await fetchReadme({ commit }, 'astralapp/astral')

        expect(client.get).toHaveBeenCalledWith(`/stars/readme?repo=astralapp/astral`)
        expect(commit).toHaveBeenCalledWith('SET_README', 'Hello World')
      })

      it('sets the readme to an empty string if the request fails', async () => {
        client.get.mockRejectedValue(null)

        await fetchReadme({ commit }, 'astralapp/astral')

        expect(commit).toHaveBeenCalledWith('SET_README', '')
      })
    })

    it('sets the viewing state', async () => {
      await setViewingUntagged({ commit, dispatch }, true)

      expect(dispatch).toHaveBeenCalledWith('setCurrentTag', {})
      expect(dispatch).toHaveBeenCalledWith('setCurrentPredicate', {})
      expect(commit).toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', true)

      jest.clearAllMocks()

      await setViewingUntagged({ commit, dispatch }, false)

      expect(dispatch).not.toHaveBeenCalledWith('setCurrentTag', {})
      expect(dispatch).not.toHaveBeenCalledWith('setCurrentPredicate', {})
      expect(commit).toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', false)
    })

    it('syncs tags to a star', async () => {
      const sampleRes = {
        data: {
          tags: [{ name: 'VueJS' }, { name: 'React' }],
          star: {
            name: sampleStars.edges[0].node.nameWithOwner,
            tags: [{ name: 'VueJS' }]
          }
        }
      }
      const sampleReq = {
        id: sampleStars.edges[0].node.databaseId,
        tags: [sampleRes.data.tags[0]]
      }

      client.put.mockResolvedValue(sampleRes)

      await syncStarTags({ commit }, { id: sampleReq.id, tags: sampleReq.tags })

      expect(client.put).toHaveBeenCalledWith('/star/tags', {
        id: sampleReq.id,
        tags: sampleReq.tags
      })
      expect(commit).toHaveBeenCalledWith('SET_TAGS', sampleRes.data.tags)
      expect(commit).toHaveBeenCalledWith('SET_STAR_TAGS', {
        starId: sampleReq.id,
        tags: sampleRes.data.star.tags
      })
    })

    it('edits a stars notes', async () => {
      const id = sampleStars.edges[0].node.databaseId
      const sampleReq = { id, notes: 'Hello World' }

      await editStarNotes({ commit }, sampleReq)

      expect(client.post).toHaveBeenCalledWith('/star/notes', sampleReq)
      expect(commit).toHaveBeenCalledWith('SET_STAR_NOTES', sampleReq)
    })

    it('cleans up stars', async () => {
      client.delete.mockResolvedValue({ data: sampleStars.edges })

      await cleanupStars({ commit })

      expect(client.delete).toHaveBeenCalledWith('/stars/cleanup')
      expect(commit).toHaveBeenCalledWith('SET_USER_STARS', sampleStars.edges)
      expect(commit).toHaveBeenCalledWith('MAP_USER_STARS_TO_GITHUB_STARS')
    })

    it('autotags stars', async () => {
      const sampleRes = {
        data: {
          stars: sampleStars.edges,
          tags: [{ name: 'VueJS' }, { name: 'React' }]
        }
      }

      client.put.mockResolvedValue({ data: sampleRes })

      await autotagStars({ commit })

      expect(client.put).toHaveBeenCalledWith('/stars/autotag')
      expect(commit).toHaveBeenCalledWith('SET_TAGS', sampleRes.tags)
      expect(commit).toHaveBeenCalledWith('SET_USER_STARS', sampleRes.stars)
      expect(commit).toHaveBeenCalledWith('MAP_USER_STARS_TO_GITHUB_STARS')
    })
  })
})

import stars from '@/store/modules/stars'
import sampleStars from '../../utils/sample-stars'
import router from '@/router'
import client from '@/store/api/client'

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
  SET_STARS,
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

let ctx, state
const defaultState = stars.state

describe('Stars Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    state = JSON.parse(JSON.stringify(defaultState))
    ctx = {
      commit: jest.fn(),
      state,
      dispatch: jest.fn(),
      rootState: {
        user: {
          user: {
            access_token: 'abcde12345'
          }
        },
        stars: {
          stars: []
        }
      }
    }
  })

  describe('Stars state', () => {
    it('returns the stars-related state', () => {
      expect(state).toEqual({
        userStars: [],
        stars: [],
        pageInfo: {},
        totalStars: 0,
        currentLanguage: '',
        currentStars: [],
        readme: '',
        viewingUntagged: false
      })
    })
  })

  describe('Stars getters', () => {
    it('returns the stars', () => {
      expect(getters.stars(state)).toEqual(state.stars)
    })

    it('returns the page info', () => {
      expect(getters.pageInfo(state)).toEqual(state.pageInfo)
    })

    it('returns total stars', () => {
      expect(getters.totalStars(state)).toEqual(state.totalStars)
    })

    it('returns total untagged stars', () => {
      expect(getters.totalUntaggedStars(state)).toEqual(state.stars.filter(star => !star.tags.length).length)
    })

    it('returns a list of all star languages with counts', () => {
      state.stars = [...sampleStars.edges]
      expect(getters.languages(state)).toEqual([{ name: 'JavaScript', count: 3 }, { name: 'PHP', count: 2 }])
    })

    it('returns the current language', () => {
      expect(getters.currentLanguage(state)).toEqual(state.currentLanguage)
    })

    it('returns the first current star or an empty object if there is none', () => {
      state.currentStars = [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }]
      expect(getters.currentStar(state)).toEqual({ name: 'First' })

      state.currentStars = []
      expect(getters.currentStar(state)).toEqual({})
    })

    it('returns the current stars, and omits duplicates', () => {
      const stars = [sampleStars.edges[0], sampleStars.edges[1]]
      state.currentStars = stars
      expect(getters.currentStars(state)).toEqual(stars)

      // Concat a duplicate entry and assert the duplicate is not included in the getter
      state.currentStars = stars.concat(sampleStars.edges[0])
      expect(getters.currentStars(state)).toEqual(stars)
    })

    it('returns the current star indexes if they exist or defaults to an empty array if no stars are selected', () => {
      state.stars = sampleStars.edges
      state.currentStars = [sampleStars.edges[0]]
      expect(getters.currentStarIndexes(state)).toEqual([0])

      state.currentStars = []
      expect(getters.currentStarIndexes(state)).toEqual([])
    })

    it('returns the readme', () => {
      expect(getters.readme(state)).toEqual(state.readme)
    })

    it('returns the viewing untagged bool', () => {
      expect(getters.viewingUntagged(state)).toEqual(state.viewingUntagged)
    })
  })

  describe('Stars mutations', () => {
    it('sets the stars', () => {
      const stars = [...sampleStars.edges]

      SET_STARS(state, stars)

      expect(state.stars).toEqual(stars)
    })

    it('clears the stars', () => {
      const stars = [...sampleStars.edges]
      SET_STARS(state, stars)

      expect(state.stars).toEqual(stars)

      CLEAR_STARS(state, stars)

      expect(state.stars).toEqual([])
    })

    it('sets the total stars count', () => {
      SET_TOTAL_STARS(state, 500)

      expect(state.totalStars).toBe(500)
    })

    it('sets the stars pagination info', () => {
      SET_STARS_PAGE_INFO(state, sampleStars.pageInfo)

      expect(state.pageInfo).toEqual(sampleStars.pageInfo)
    })

    it('sets the current language', () => {
      SET_CURRENT_LANGUAGE(state, 'JavaScript')

      expect(state.currentLanguage).toBe('JavaScript')
    })

    it('adds tags to stars', () => {
      const sampleTags = [{ name: 'VueJS' }, { name: 'React' }, { name: 'Angular' }]
      state.tags = sampleTags
      state.stars = [...sampleStars.edges].map(s => ({
        ...s,
        tags: [{ name: 'Testing' }]
      }))

      ADD_TAG_TO_STARS(state, {
        stars: [sampleStars.edges[0].node],
        tag: sampleTags[0]
      })

      expect(state.stars[0].tags).toEqual([{ name: 'Testing' }, sampleTags[0]])
    })

    it('sets multiple tags  on a single star', () => {
      const sampleTags = [{ name: 'VueJS' }, { name: 'React' }, { name: 'Angular' }]
      state.stars = [...sampleStars.edges.map(s => ({ ...s, tags: [] }))]

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

      SET_STARS(state, sampleStars.edges)
      SET_USER_STARS(state, sampleUserStars)
      MAP_USER_STARS_TO_GITHUB_STARS(state)

      expect(state.stars[0].tags).toEqual(sampleUserStars[0].tags)
      expect(state.stars[1].tags).toEqual(sampleUserStars[1].tags)
      expect(state.stars[1].notes).toEqual(sampleUserStars[1].notes)
    })

    it('sets the current star', () => {
      const star = sampleStars.edges[0]
      SET_CURRENT_STAR(state, star)

      expect(state.currentStars).toEqual([star])
    })

    it('can push or remove a star to or from the selected stars list', () => {
      SET_STARS(state, sampleStars.edges)

      PUSH_TO_CURRENT_STARS(state, sampleStars.edges[0])

      expect(state.currentStars).toEqual([sampleStars.edges[0]])

      PUSH_TO_CURRENT_STARS(state, sampleStars.edges[1])

      expect(state.currentStars).toEqual([sampleStars.edges[0], sampleStars.edges[1]])

      PUSH_TO_CURRENT_STARS(state, sampleStars.edges[0])

      expect(state.currentStars).toEqual([sampleStars.edges[1]])
    })

    it('can append multiple stars to the selected stars list', () => {
      SET_STARS(state, sampleStars.edges)

      SELECT_STARS(state, [sampleStars.edges[0], sampleStars.edges[1]])

      expect(state.currentStars).toEqual([sampleStars.edges[0], sampleStars.edges[1]])

      SELECT_STARS(state, [sampleStars.edges[3], sampleStars.edges[4]])

      expect(state.currentStars).toEqual([sampleStars.edges[3], sampleStars.edges[4]])
    })

    it('can set the readme', () => {
      SET_README(state, 'Hello World')

      expect(state.readme).toBe('Hello World')
    })

    it('can set the "viewing untagged" bool state', () => {
      SET_VIEWING_UNTAGGED(state, true)

      expect(state.viewingUntagged).toBe(true)

      SET_VIEWING_UNTAGGED(state, false)

      expect(state.viewingUntagged).toBe(false)
    })

    it('can set the notes for a star', () => {
      SET_STARS(state, sampleStars.edges)
      SET_CURRENT_STAR(state, sampleStars.edges[0])

      SET_STAR_NOTES(state, {
        id: sampleStars.edges[0].node.databaseId,
        notes: 'Hello World'
      })

      expect(state.stars[0].notes).toBe('Hello World')
      expect(state.currentStars[0].notes).toBe('Hello World')
    })

    it('can reset all the stars state', () => {
      SET_README(state, 'Foo')
      SET_STARS_PAGE_INFO(state, sampleStars.pageInfo)
      SET_TOTAL_STARS(state, 500)
      SET_STARS(state, sampleStars.edges)
      SET_CURRENT_STAR(state, sampleStars.edges[0])

      RESET_STARS(state)

      expect(state.readme).toBe('')
      expect(state.pageInfo).toEqual({})
      expect(state.totalStars).toBe(0)
      expect(state.stars).toEqual([])
      expect(state.currentStars).toEqual([])
    })
  })

  describe('Stars actions', () => {
    describe("Fetching the user's GitHub stars", () => {
      it('fetches their stars', async () => {
        let sampleRes = sampleStars.edges.map(edge => {
          edge.tags = []
          edge.notes = ''
          return edge
        })
        client.get.mockResolvedValue(sampleStars)

        await fetchGitHubStars(ctx, { cursor: null, refresh: false })

        expect(client.withAuth).toHaveBeenCalled()
        expect(client.get).toHaveBeenCalledWith('/api/stars/github?')
        expect(ctx.commit).not.toHaveBeenCalledWith('RESET_STARS')
        expect(ctx.commit).toHaveBeenCalledWith('SET_STARS', sampleRes)
        expect(ctx.commit).toHaveBeenCalledWith('SET_STARS_PAGE_INFO', sampleStars.pageInfo)
        expect(ctx.commit).toHaveBeenCalledWith('SET_TOTAL_STARS', sampleStars.totalCount)
        expect(ctx.commit).toHaveBeenCalledWith('MAP_USER_STARS_TO_GITHUB_STARS')
      })

      it('resets the star-related state if refresh is true', async () => {
        await fetchGitHubStars(ctx, { cursor: null, refresh: true })

        expect(ctx.commit).toHaveBeenCalledWith('RESET_STARS')
        expect(client.get).toHaveBeenCalledWith('/api/stars/github?refresh=true')
      })

      it('does not set the total count state if a cursor is passed', async () => {
        await fetchGitHubStars(ctx, { cursor: null, refresh: false })

        expect(ctx.commit).not.toHaveBeenCalledWith('SET_TOTAL_STARS')
      })

      it('can pass a cursor to the request query string', async () => {
        await fetchGitHubStars(ctx, { cursor: 'abc123', refresh: false })

        expect(ctx.commit).not.toHaveBeenCalledWith('SET_TOTAL_STARS')
        expect(client.get).toHaveBeenCalledWith('/api/stars/github?cursor=abc123')
      })
    })

    it('fetches user stars', async () => {
      client.get.mockResolvedValue(sampleStars.edges)

      await fetchUserStars(ctx)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.get).toHaveBeenCalledWith('/api/stars')
      expect(ctx.commit).toHaveBeenCalledWith('SET_USER_STARS', sampleStars.edges)
    })

    it('sets the current language', async () => {
      await setCurrentLanguage(ctx, 'JavaScript')
      expect(ctx.commit).toHaveBeenCalledWith('SET_CURRENT_LANGUAGE', 'JavaScript')
      expect(router.replace).toHaveBeenCalledWith({
        query: { language: 'JavaScript' }
      })
    })

    it('adds a tag to one or more stars', async () => {
      const sampleRes = { tags: [{ name: 'VueJS' }, { name: 'React' }] }
      const reqArgs = {
        stars: [sampleStars.edges[0].node],
        tag: sampleRes.tags[0]
      }
      client.post.mockResolvedValue(sampleRes)

      await addTagToStars(ctx, reqArgs)

      expect(ctx.commit).toHaveBeenCalledWith('ADD_TAG_TO_STARS', reqArgs)
      expect(client.withAuth).toHaveBeenCalled()
      expect(client.post).toHaveBeenCalledWith('/api/star/tags', {
        starIds: [sampleStars.edges[0].node.databaseId],
        tag: sampleRes.tags[0]
      })
      expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sampleRes.tags)
    })

    it('sets the current star', async () => {
      const currentStar = sampleStars.edges[0]

      await setCurrentStar(ctx, currentStar)

      expect(ctx.commit).toHaveBeenCalledWith('SET_CURRENT_STAR', currentStar)
    })

    it('can set the currently selected stars', async () => {
      const stars = [sampleStars.edges[0], sampleStars.edges[1]]

      await selectStars(ctx, stars)

      expect(ctx.commit).toHaveBeenCalledWith('SELECT_STARS', stars)
    })

    it('can push to the selected stars list', async () => {
      const star = sampleStars.edges[0]

      await pushToCurrentStars(ctx, star)

      expect(ctx.commit).toHaveBeenCalledWith('PUSH_TO_CURRENT_STARS', star)
    })

    describe('fetching repo readmes', () => {
      it('fetches a repo readme', async () => {
        client.get.mockResolvedValue('Hello World')

        await fetchReadme(ctx, 'astralapp/astral')

        expect(client.withoutAuth).toHaveBeenCalled()
        expect(client.get).toHaveBeenCalledWith(
          `https://api.github.com/repos/astralapp/astral/readme?access_token=${ctx.rootState.user.user.access_token}`,
          {},
          { Accept: 'application/vnd.github.v3.html' }
        )
        expect(ctx.commit).toHaveBeenCalledWith('SET_README', 'Hello World')
      })

      it('sets the readme to an empty string if the request fails', async () => {
        client.get.mockRejectedValue(null)

        await fetchReadme(ctx, 'astralapp/astral')

        expect(ctx.commit).toHaveBeenCalledWith('SET_README', '')
      })
    })

    it('sets the viewing state', async () => {
      await setViewingUntagged(ctx, true)

      expect(ctx.commit).toHaveBeenCalledWith('SET_CURRENT_TAG', {})
      expect(ctx.commit).toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', true)

      await setViewingUntagged(ctx, false)

      expect(ctx.commit).not.toHaveBeenLastCalledWith('SET_CURRENT_TAG', {})
      expect(ctx.commit).toHaveBeenLastCalledWith('SET_VIEWING_UNTAGGED', false)
    })

    it('syncs tags to a star', async () => {
      const sampleRes = {
        tags: [{ name: 'VueJS' }, { name: 'React' }],
        star: {
          name: sampleStars.edges[0].node.nameWithOwner,
          tags: [{ name: 'VueJS' }]
        }
      }
      const sampleReq = {
        id: sampleStars.edges[0].node.databaseId,
        tags: [sampleRes.tags[0]]
      }
      client.put.mockResolvedValue(sampleRes)

      await syncStarTags(ctx, { id: sampleReq.id, tags: sampleReq.tags })

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.put).toHaveBeenCalledWith('/api/star/tags', {
        id: sampleReq.id,
        tags: sampleReq.tags
      })
      expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sampleRes.tags)
      expect(ctx.commit).toHaveBeenCalledWith('SET_STAR_TAGS', {
        starId: sampleReq.id,
        tags: sampleRes.star.tags
      })
    })

    it('edits a stars notes', async () => {
      const id = sampleStars.edges[0].node.databaseId
      const sampleReq = { id, notes: 'Hello World' }

      await editStarNotes(ctx, sampleReq)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.post).toHaveBeenCalledWith('/api/star/notes', sampleReq)
      expect(ctx.commit).toHaveBeenCalledWith('SET_STAR_NOTES', sampleReq)
    })

    it('cleans up stars', async () => {
      client.delete.mockResolvedValue(sampleStars.edges)

      await cleanupStars(ctx)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.delete).toHaveBeenCalledWith('/api/stars/cleanup')
      expect(ctx.commit).toHaveBeenCalledWith('SET_USER_STARS', sampleStars.edges)
      expect(ctx.commit).toHaveBeenCalledWith('MAP_USER_STARS_TO_GITHUB_STARS')
    })

    it('autotags stars', async () => {
      const sampleRes = {
        stars: sampleStars.edges,
        tags: [{ name: 'VueJS' }, { name: 'React' }]
      }
      client.put.mockResolvedValue(sampleRes)

      await autotagStars(ctx)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.put).toHaveBeenCalledWith('/api/stars/autotag')
      expect(ctx.commit).toHaveBeenCalledWith('SET_TAGS', sampleRes.tags)
      expect(ctx.commit).toHaveBeenCalledWith('SET_USER_STARS', sampleRes.stars)
      expect(ctx.commit).toHaveBeenCalledWith('MAP_USER_STARS_TO_GITHUB_STARS')
    })
  })
})

import galileo from '@/store/modules/galileo'

const getters = galileo.getters
const { SET_SEARCH_QUERY, SET_TOKENIZED_SEARCH } = galileo.mutations
const { setSearchQuery } = galileo.actions

let ctx, state
const defaultState = galileo.state

describe('Galileo Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    state = JSON.parse(JSON.stringify(defaultState))
    ctx = {
      commit: jest.fn(),
      state,
      dispatch: jest.fn()
    }
  })

  describe('Galileo state', () => {
    it('returns the search-related state', () => {
      expect(state).toEqual({
        searchQuery: '',
        tokenizedSearchQuery: {
          query: '',
          tags: [],
          strings: []
        }
      })
    })
  })

  describe('Galileo getters', () => {
    it('returns the search query', () => {
      expect(getters.searchQuery(state)).toEqual(state.searchQuery)
    })

    it('returns the tokenized search query', () => {
      expect(getters.tokenizedSearchQuery(state)).toEqual(
        state.tokenizedSearchQuery
      )
    })
  })

  describe('Galileo mutations', () => {
    it('sets the search query', () => {
      SET_SEARCH_QUERY(state, 'Hello World')

      expect(state.searchQuery).toBe('Hello World')
    })

    it('sets the tokenized search query', () => {
      const query = {
        query: '#hello:world',
        tags: ['hello'],
        strings: ['world']
      }

      SET_TOKENIZED_SEARCH(state, query)

      expect(state.tokenizedSearchQuery).toEqual(query)
    })
  })

  describe('Galileo actions', () => {
    it('sets and tokenizes the search query', () => {
      setSearchQuery(ctx, '#Hello:World:#Test')

      const expectedTokenizedQuery = {
        query: '#Hello:World:#Test',
        tags: ['hello', 'test'],
        strings: ['world']
      }

      expect(ctx.commit).toHaveBeenCalledWith(
        'SET_SEARCH_QUERY',
        expectedTokenizedQuery.query
      )

      expect(ctx.commit).toHaveBeenCalledWith(
        'SET_TOKENIZED_SEARCH',
        expectedTokenizedQuery
      )
    })
  })
})

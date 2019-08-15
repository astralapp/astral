import galileo from '@/store/modules/galileo'

const getters = galileo.getters
const { SET_SEARCH_QUERY, SET_TOKENIZED_SEARCH } = galileo.mutations
const { setSearchQuery } = galileo.actions

describe('Galileo Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('Galileo getters', () => {
    it('returns the search query', () => {
      const state = {
        searchQuery: '#vue:validation'
      }
      expect(getters.searchQuery(state)).toEqual(state.searchQuery)
    })

    it('returns the tokenized search query', () => {
      const state = {
        tokenizedSearchQuery: {
          query: '#vue:validation',
          tags: ['vue'],
          strings: ['validation']
        }
      }
      expect(getters.tokenizedSearchQuery(state)).toEqual(state.tokenizedSearchQuery)
    })
  })

  describe('Galileo mutations', () => {
    it('sets the search query', () => {
      const state = {
        searchQuery: ''
      }

      SET_SEARCH_QUERY(state, 'Hello World')

      expect(state.searchQuery).toBe('Hello World')
    })

    it('sets the tokenized search query', () => {
      const query = {
        query: '#vue:validation',
        tags: ['hello'],
        strings: ['world']
      }

      const state = {
        tokenizedSearchQuery: query
      }

      SET_TOKENIZED_SEARCH(state, query)

      expect(state.tokenizedSearchQuery).toEqual(query)
    })
  })

  describe('Galileo actions', () => {
    const commit = jest.fn()
    it('sets and tokenizes the search query', async () => {
      await setSearchQuery({ commit }, '#vue:validation')

      const expectedTokenizedQuery = {
        query: '#vue:validation',
        tags: ['vue'],
        strings: ['validation']
      }

      expect(commit).toHaveBeenCalledWith('SET_SEARCH_QUERY', expectedTokenizedQuery.query)

      expect(commit).toHaveBeenCalledWith('SET_TOKENIZED_SEARCH', expectedTokenizedQuery)
    })
  })
})

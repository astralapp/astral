import { describe } from 'ava-spec'
import { mutations } from './../../store/modules/galileo.js'

const {
  SET_SEARCH_QUERY,
  SET_TOKENIZED_SEARCH
} = mutations

describe('Galileo Mutations', it => {
  it('can set the search query', t => {
    const query = '#javascript:template'
    const state = {}
    SET_SEARCH_QUERY(state, query)

    t.is(state.searchQuery, query)
  })

  it('can set the tokenized search query', t => {
    const tokenizedQuery = {
      query: '#javascript:template',
      tags: ['javascript'],
      strings: ['template'],
      languages: []
    }
    const state = {}
    SET_TOKENIZED_SEARCH(state, tokenizedQuery)

    t.is(state.tokenizedSearchQuery, tokenizedQuery)
  })
})

import predicates from '@/store/modules/predicates'
import router from '@/router'
import client from '@/store/api/client'
import { defaultPredicate } from '@/utils/predicates'
import { cloneDeep } from 'lodash'

jest.mock('@/store/api/client')

jest.mock('@/router', () => ({
  replace: jest.fn()
}))

const getters = predicates.getters
const { SET_CURRENT_PREDICATE, SET_PREDICATES } = predicates.mutations
const { fetchPredicates, setCurrentPredicate, savePredicate } = predicates.actions

describe('Predicates Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('Predicates getters', () => {
    it('returns the current predicate', () => {
      const state = {
        currentPredicate: { groups: [cloneDeep(defaultPredicate)] }
      }
      expect(getters.currentPredicate(state)).toEqual(state.currentPredicate)
    })

    it('returns the list of predicates', () => {
      const state = {
        predicates: [{ groups: [cloneDeep(defaultPredicate)] }]
      }
      expect(getters.predicates(state)).toEqual(state.predicates)
    })
  })

  describe('Predicates mutations', () => {
    it('sets the current predicate object', () => {
      const state = {
        currentPredicate: {}
      }
      const newPredicate = {
        groups: [cloneDeep(defaultPredicate)]
      }

      SET_CURRENT_PREDICATE(state, newPredicate)

      expect(state.currentPredicate).toEqual(newPredicate)
    })

    it('sets the predicates list', () => {
      const state = {
        predicates: []
      }
      const userPredicates = [cloneDeep(defaultPredicate)]

      SET_PREDICATES(state, userPredicates)

      expect(state.predicates).toEqual(userPredicates)
    })
  })

  describe('Predicates actions', () => {
    const commit = jest.fn()
    it('fetches the predicates', async () => {
      const res = []
      client.get.mockResolvedValue(res)

      await fetchPredicates({ commit })

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.get).toHaveBeenCalledWith('/predicates')
      expect(commit).toHaveBeenCalledWith('SET_PREDICATES', res)
    })

    it('sets the current predicate', async () => {
      const predicate = cloneDeep(defaultPredicate)

      await setCurrentPredicate({ commit }, predicate)

      expect(commit).toHaveBeenCalledWith('SET_VIEWING_UNTAGGED', false)
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_TAG', {})
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_LANGUAGE', '')
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_PREDICATE', predicate)

      expect(router.replace).toHaveBeenCalledWith({ query: { predicate: predicate.name } })
    })

    it('saves a new predicate', async () => {
      JSON.parse = jest.fn().mockImplementationOnce(() => predicate)
      const predicate = cloneDeep(defaultPredicate)
      const stringifiedPredicate = JSON.stringify(predicate)
      client.post.mockResolvedValue(predicate)

      await savePredicate({ commit }, stringifiedPredicate)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.post).toHaveBeenCalledWith('/predicates', stringifiedPredicate)
      expect(JSON.parse).toHaveBeenCalledWith(predicate)
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_PREDICATE', predicate)
    })
  })
})

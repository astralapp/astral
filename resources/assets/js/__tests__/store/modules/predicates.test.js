import predicates from '@/store/modules/predicates'
import router from '@/router'
import client from '@/store/api/client'
import { defaultPredicate } from '@/utils/predicates'
import { cloneDeep } from 'lodash'

jest.mock('@/store/api/client')

jest.mock('@/router', () => ({
  replace: jest.fn(),
  currentRoute: {
    query: ''
  }
}))

const getters = predicates.getters
const { SET_CURRENT_PREDICATE, SET_PREDICATES, SET_EDITING_PREDICATE, DELETE_PREDICATE } = predicates.mutations
const {
  fetchPredicates,
  setCurrentPredicate,
  savePredicate,
  setEditingPredicate,
  reorderPredicates,
  deletePredicate
} = predicates.actions

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

    it('sets the current editing predicate object', () => {
      const state = {
        editingPredicate: {}
      }
      const newPredicate = {
        groups: [cloneDeep(defaultPredicate)]
      }

      SET_EDITING_PREDICATE(state, newPredicate)

      expect(state.editingPredicate).toEqual(newPredicate)
    })

    it('deletes a predicate', () => {
      const state = {
        predicates: [
          {
            id: 1,
            groups: [cloneDeep(defaultPredicate)]
          }
        ]
      }

      expect(state.predicates.length).toBe(1)

      DELETE_PREDICATE(state, 1)

      expect(state.predicates.length).toBe(0)
    })
  })

  describe('Predicates actions', () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    it('fetches the predicates', async () => {
      const res = []
      client.get.mockResolvedValue({ data: res })

      await fetchPredicates({ commit })

      expect(client.get).toHaveBeenCalledWith('/predicates')
      expect(commit).toHaveBeenCalledWith('SET_PREDICATES', res)
    })

    it('sets the current predicate', async () => {
      const predicate = { ...cloneDeep(defaultPredicate), name: 'Foo' }

      await setCurrentPredicate({ commit, dispatch }, predicate)

      expect(dispatch).toHaveBeenCalledWith('setViewingUntagged', false)
      expect(dispatch).toHaveBeenCalledWith('setCurrentTag', {})
      expect(dispatch).toHaveBeenCalledWith('setCurrentLanguage', '')
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_PREDICATE', predicate)

      expect(router.replace).toHaveBeenCalledWith({ query: { predicate: predicate.name } })

      jest.clearAllMocks()

      await setCurrentPredicate({ commit, dispatch }, {})

      expect(dispatch).not.toHaveBeenCalledWith('setViewingUntagged', false)
      expect(dispatch).not.toHaveBeenCalledWith('setCurrentTag', {})
      expect(dispatch).not.toHaveBeenCalledWith('setCurrentLanguage', '')
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_PREDICATE', {})

      expect(router.replace).toHaveBeenCalledWith({ query: {} })
    })

    it('saves a new predicate', async () => {
      const predicate = cloneDeep(defaultPredicate)
      const stringifiedPredicate = JSON.stringify(predicate)
      client.post.mockResolvedValue({ data: predicate })

      dispatch.mockImplementationOnce(() => Promise.resolve(42))

      const getters = {
        currentPredicate: { name: 'Foo', id: 1 },
        predicates: [{ id: 1 }]
      }
      await savePredicate({ commit, dispatch, getters }, stringifiedPredicate)

      expect(client.post).toHaveBeenCalledWith('/predicates', stringifiedPredicate)
      expect(dispatch).toHaveBeenCalledWith('setCurrentPredicate', getters.predicates[0])
    })

    it('sets the editing predicate', async () => {
      const predicate = cloneDeep(defaultPredicate)

      await setEditingPredicate({ commit }, predicate)

      expect(commit).toHaveBeenCalledWith('SET_EDITING_PREDICATE', predicate)
    })

    it('reorders predicates', async () => {
      const dummyMap = []
      client.put.mockResolvedValue({ data: [] })

      await reorderPredicates({ commit }, dummyMap)

      expect(client.put).toHaveBeenCalledWith('/predicates/reorder', { predicates: dummyMap })
      expect(commit).toHaveBeenCalledWith('SET_PREDICATES', dummyMap)
    })

    it('deletes predicates', async () => {
      client.delete.mockResolvedValue({ data: [] })

      const getters = {
        currentPredicate: { id: 1 }
      }

      await deletePredicate({ commit, dispatch, getters }, 1)

      expect(client.delete).toHaveBeenCalledWith('/predicates/1')
      expect(commit).toHaveBeenCalledWith('DELETE_PREDICATE', 1)
      expect(dispatch).toHaveBeenCalledWith('setCurrentPredicate', {})
    })
  })
})

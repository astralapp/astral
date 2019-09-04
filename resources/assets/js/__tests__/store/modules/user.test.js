import user from '@/store/modules/user'
import router from '@/router'
import client from '@/store/api/client'

jest.mock('@/store/api/client')

jest.mock('@/router', () => ({
  push: jest.fn()
}))

const getters = user.getters
const { SET_USER, DELETE_USER } = user.mutations
const { fetchUser, deleteUser, setShowLanguageTags, setAutosaveNotes } = user.actions

describe('User Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('User getters', () => {
    it('returns the user', () => {
      const state = {
        user: { username: 'syropian' }
      }
      expect(getters.user(state)).toEqual(state.user)
    })
  })

  describe('User mutations', () => {
    it('sets the user object', () => {
      const state = {
        user: {}
      }
      const newUser = {
        username: 'syropian'
      }

      SET_USER(state, newUser)

      expect(state.user).toEqual(newUser)
    })

    it('deletes the user object', () => {
      const state = {
        user: { username: 'syropian' }
      }

      DELETE_USER(state)
      expect(state.user).toEqual({})
    })
  })

  describe('User actions', () => {
    const commit = jest.fn()
    it('fetches the authenticated user', async () => {
      const res = { username: 'syropian' }
      client.get.mockResolvedValue({ data: res })

      await fetchUser({ commit })

      expect(client.get).toHaveBeenCalledWith('/auth/me')
      expect(commit).toHaveBeenCalledWith('SET_USER', res)
    })

    it('deletes the authenticated user', async () => {
      await deleteUser({ commit })

      expect(client.delete).toHaveBeenCalledWith('/auth/delete')
      expect(commit).toHaveBeenCalledWith('DELETE_USER')
      expect(router.push).toHaveBeenCalledWith('auth/logout')
    })

    it('sets the users language tag visibility option', async () => {
      const res = { username: 'syropian' }
      client.put.mockResolvedValue({ data: res })

      await setShowLanguageTags({ commit }, true)

      expect(client.put).toHaveBeenCalledWith('/user/show-language-tags', { flag: true })
      expect(commit).toHaveBeenCalledWith('SET_USER', res)
    })

    it('sets the users auto-save notes option', async () => {
      const res = { username: 'syropian' }
      client.put.mockResolvedValue({ data: res })

      await setAutosaveNotes({ commit }, true)

      expect(client.put).toHaveBeenCalledWith('/user/autosave-notes', { flag: true })
      expect(commit).toHaveBeenCalledWith('SET_USER', res)
    })
  })
})

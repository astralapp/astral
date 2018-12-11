import user from '@/store/modules/user'
import router from '@/router'
import client from '@/store/api/client'
import ls from 'local-storage'

jest.mock('@/store/api/client')
jest.mock('local-storage')

jest.mock('@/router', () => ({
  push: jest.fn()
}))

const state = { ...user.state }
const getters = user.getters
const { SET_USER, DELETE_USER } = user.mutations
const { fetchUser, deleteUser, setShowLanguageTags, setAutosaveNotes } = user.actions
const ctx = { commit: jest.fn() }

describe('User Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('User state', () => {
    it('returns the user-related state', () => {
      expect(state).toEqual({ user: {} })
    })
  })

  describe('User getters', () => {
    it('returns the user', () => {
      expect(getters.user(state)).toEqual(state.user)

      ls.mockReturnValueOnce('abcde12345')
      expect(getters.isAuthenticated(state)).toBe(true)
      ls.mockReturnValueOnce('')
      expect(getters.isAuthenticated(state)).toBe(false)
    })
  })

  describe('User mutations', () => {
    it('sets the user object', () => {
      const newUser = {
        username: 'syropian'
      }

      SET_USER(state, newUser)

      expect(state.user).toEqual(newUser)
    })

    it('deletes the user object', () => {
      const user = {
        username: 'syropian'
      }

      SET_USER(state, user)
      expect(state.user).toEqual(user)

      DELETE_USER(state)
      expect(state.user).toEqual({})
    })
  })

  describe('User actions', () => {
    it('fetches the authenticated user', async () => {
      const res = { username: 'syropian' }
      client.get.mockResolvedValue(res)

      await fetchUser(ctx)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.get).toHaveBeenCalledWith('/api/auth/me')
      expect(ctx.commit).toHaveBeenCalledWith('SET_USER', res)
    })

    it('deletes the authenticated user', async () => {
      const user = {
        id: 1,
        username: 'syropian'
      }
      SET_USER(state, user)

      await deleteUser(ctx)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.delete).toHaveBeenCalledWith('/api/auth/delete')
      expect(ctx.commit).toHaveBeenCalledWith('DELETE_USER')
      expect(router.push).toHaveBeenCalledWith('auth/logout')
    })

    it('sets the users language tag visibility option', async () => {
      const res = { username: 'syropian' }
      client.put.mockResolvedValue(res)

      await setShowLanguageTags(ctx, true)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.put).toHaveBeenCalledWith('/api/user/show-language-tags', { flag: true })
      expect(ctx.commit).toHaveBeenCalledWith('SET_USER', res)
    })

    it('sets the users auto-save notes option', async () => {
      const res = { username: 'syropian' }
      client.put.mockResolvedValue(res)

      await setAutosaveNotes(ctx, true)

      expect(client.withAuth).toHaveBeenCalled()
      expect(client.put).toHaveBeenCalledWith('/api/user/autosave-notes', { flag: true })
      expect(ctx.commit).toHaveBeenCalledWith('SET_USER', res)
    })
  })
})

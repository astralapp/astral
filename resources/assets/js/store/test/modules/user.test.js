import 'babel-polyfill'
import ls from 'local-storage'
import user from '../../modules/user'
import client from '../../api/client'

jest.mock('../../api/client', () => ({
  auth: false,
  withAuth: jest.fn().mockReturnThis(),
  withoutAuth: jest.fn().mockReturnThis(),
  get: jest.fn(() => Promise.resolve({})),
  post: jest.fn(() => Promise.resolve({}))
}))

jest.mock('local-storage', () => jest.fn().mockReturnValue('12345'))

const state = Object.assign({}, user.state)
const getters = user.getters
const { SET_USER } = user.mutations
const { fetchUser, register, login } = user.actions

describe('User Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('User getters', () => {
    it('Can get the current user', () => {
      expect(getters.user(state)).toEqual(state.user)
      expect(getters.isAuthenticated(state)).toBe(true)
    })
  })

  describe('User mutations', () => {
    it('Can set the user object', () => {
      const newUser = {
        email: 'jane@doe.com',
        gamertag: 'FazeXxXSniperBlazeIt420xXx'
      }

      SET_USER(state, newUser)

      expect(state.user).toEqual(newUser)
    })
  })

  describe('User actions', () => {
    it('fetches a user', async () => {
      const ctx = { commit: jest.fn() }
      await fetchUser(ctx)
      expect(client['get']).toHaveBeenCalled()
      expect(ctx.commit).toHaveBeenCalled()
    })

    it('registers a user', async () => {
      const ctx = { commit: jest.fn() }
      await register(ctx, {})
      expect(client['post']).toHaveBeenCalled()
      expect(ctx.commit).toHaveBeenCalled()
      expect(ls).toHaveBeenCalled()
    })

    it('logs a user in', async () => {
      const ctx = { commit: jest.fn() }
      await login(ctx, {})
      expect(client['post']).toHaveBeenCalled()
      expect(ctx.commit).toHaveBeenCalled()
      expect(ls).toHaveBeenCalled()
    })
  })
})

import 'babel-polyfill'
import clips from '@/store/modules/clips'
import client from '@/store/api/client'

jest.mock('@/store/api/client', () => ({
  auth: false,
  withAuth: jest.fn().mockReturnThis(),
  withoutAuth: jest.fn().mockReturnThis(),
  get: jest.fn(() => Promise.resolve({})),
  post: jest.fn(() => Promise.resolve({}))
}))

const state = Object.assign(clips.state, {
  clips: [
    { id: 1, titleName: 'Rocket League' },
    { id: 2, titleName: 'Destiny' },
    { id: 3, titleName: 'Shadow of War' }
  ],
  currentGame: ''
})
const getters = clips.getters
const { SET_CLIPS, SET_CURRENT_GAME } = clips.mutations
const { fetchClips } = clips.actions

describe('Clips Module', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('Clips getters', () => {
    it('Can get the clips', () => {
      expect(getters.clips(state)).toEqual(state.clips)
    })
    it('can get a list of clip games', () => {
      expect(getters.games(state)).toEqual([
        'Rocket League',
        'Destiny',
        'Shadow of War'
      ])
    })
  })

  describe('Clips mutations', () => {
    it('Can set the clips list', () => {
      const newClips = [{ id: 1, titleName: 'Halo 5' }]

      SET_CLIPS(state, newClips)

      expect(state.clips).toEqual(newClips)
    })
    it('can set the current game', () => {
      const newGame = 'Halo 5'
      SET_CURRENT_GAME(state, newGame)

      expect(state.currentGame).toBe(newGame)
    })
  })

  describe('Clips actions', () => {
    it('fetches clips from the server', async () => {
      const ctx = { commit: jest.fn() }
      await fetchClips(ctx)
      expect(client['get']).toHaveBeenCalled()
      expect(ctx.commit).toHaveBeenCalled()
    })
  })
})

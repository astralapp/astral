import 'babel-polyfill'
import client from '../api/client'
import axios from 'axios'
import router from '@/router'

jest.mock('axios', () => {
  const moxios = jest.fn(() => Promise.resolve({ data: { gamertag: 'Syro' } }))
  moxios.defaults = {
    headers: {
      common: {
        'X-Request-With': 'XMLHttpRequest'
      }
    }
  }
  return moxios
})

jest.mock('@/router', () => {
  return jest.fn()
})

describe('GameReel HTTP Client', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('can enable an authorized request', () => {
    client.withAuth()
    expect(client.auth).toBe(true)
  })

  it('can enable an unauthorized request', () => {
    client.withoutAuth()
    expect(client.auth).toBe(false)
  })

  it('sends a request', async () => {
    const res = await client.get('/user')
    expect(axios).toHaveBeenCalled()
    expect(res).toEqual({ gamertag: 'Syro' })
  })
})

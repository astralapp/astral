import client from '@/store/api/client'
import mockAxios from 'axios'
import '@/router'

jest.mock('@/router', () => {
  return jest.fn()
})

describe('Astral HTTP Client', () => {
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
    mockAxios.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          username: 'syropian'
        }
      })
    )
    const res = await client.get('/user')

    expect(mockAxios).toHaveBeenCalledWith({
      method: 'get',
      url: '/user',
      data: {},
      headers: {}
    })
    expect(res).toEqual({ username: 'syropian' })
  })
})

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
    expect(res).toEqual({ data: { username: 'syropian' } })
  })
})

import client from './client'

export default {
  fetch () {
    return client.get('/api/auth/user')
  },
  setAutoTag (state) {
    return client.post('/api/auth/user/autotag', { state })
  },
  setSeenPatreonNotice () {
    return client.post('/api/auth/user/flag/patreon')
  }
}

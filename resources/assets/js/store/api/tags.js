import client from './client'

export default {
  fetch () {
    return client.get('/api/tags')
  },
  reorder (sortMap) {
    return client.post('/api/tags/reorder', { sortMap })
  },
  add (tag) {
    return client.post('/api/tags', tag)
  },
  sync (star, tags) {
    return client.post('/api/stars/syncTags', { star, tags })
  },
  edit (id, name) {
    return client.put(`/api/tags/${id}`, { name })
  },
  delete (id) {
    return client.delete(`/api/tags/${id}`)
  }
}

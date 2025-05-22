import axios from 'axios'
import router from '@/router'

const http = axios.create({
  baseURL: '/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
})

http.interceptors.response.use(
  function(response) {
    return response
  },
  function(error) {
    const resp = error.response
    if ('status' in resp) {
      if (resp.status === 422) {
        return Promise.reject(resp.data)
      }

      if (resp.status >= 400 && resp.status < 500) {
        router.push('auth/logout')
        return Promise.reject(resp.data)
      }

      return Promise.reject(resp.data)
    }
  }
)

const verbs = ['get', 'post', 'put', 'patch', 'delete']

const client = {}

verbs.forEach(verb => {
  client[verb] = (url, data = {}, headers = {}) => {
    return http({
      method: verb,
      url,
      data,
      headers
    })
  }
})

export default client

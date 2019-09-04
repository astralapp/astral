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
  function() {
    router.push('auth/logout')
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

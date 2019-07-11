import { Promise } from 'es6-promise'
import { get } from 'lodash'
import axios from 'axios'
import ls from 'local-storage'
import router from '@/router'

const http = axios.create({
  baseURL: '/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
})

http.interceptors.response.use(
  response => {
    const newToken = get(response, 'headers.authorization')

    if (newToken) {
      ls('jwt', newToken)
    }

    return response
  },
  error => {
    if (error.response.status === 401) {
      ls.clear()
      router.push('auth/logout')
    }

    return Promise.reject(error)
  }
)

const verbs = ['get', 'post', 'put', 'patch', 'delete']

const client = {
  auth: false,
  withAuth() {
    client.auth = true
    return client
  },
  withoutAuth() {
    client.auth = false
    return client
  }
}

verbs.forEach(verb => {
  client[verb] = (url, data = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
      return http({
        method: verb,
        url,
        data,
        headers: client.auth && ls('jwt') ? Object.assign({}, { Authorization: `${ls('jwt')}` }, headers) : headers
      })
        .then(res => {
          client.auth = false
          resolve(res.data)
        })
        .catch(({ response }) => {
          client.auth = false

          reject(response.data)
        })
    })
  }
})

export default client

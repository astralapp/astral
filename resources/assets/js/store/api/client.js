import { Promise } from 'es6-promise'
import axios from 'axios'
import ls from 'local-storage'
import router from '@/router'

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

const verbs = ['get', 'post', 'put', 'delete']

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
      return axios({
        method: verb,
        url,
        data,
        headers:
          client.auth && ls('jwt')
            ? Object.assign(
                {},
                { Authorization: `Bearer ${ls('jwt')}` },
                headers
              )
            : headers
      })
        .then(res => {
          client.auth = false
          resolve(res.data)
        })
        .catch(error => {
          client.auth = false
          if (error.response.status === 401) {
            router.push('auth/logout')
          }
          reject(error.response.data)
        })
    })
  }
})

export default client

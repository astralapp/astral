import Vue from 'vue'
import VueResource from 'vue-resource'
import ls from 'local-storage'

Vue.use(VueResource)

const client = {
  auth: true,
  withoutAuth: () => {
    client.auth = false
    return client
  }
}

const httpMethods = ['get', 'post', 'put', 'delete']

httpMethods.forEach((verb) => {
  client[verb] = (path, data = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
      Vue.http[verb](path, data, { headers: client.auth ? Object.assign({}, { 'Authorization': `Bearer ${ls('jwt')}` }, headers) : headers }).then((res) => {
        client.auth = true
        resolve(res.data)
      }, (res) => {
        client.auth = true
        reject(res)
      })
    })
  }
})

export default client

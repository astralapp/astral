import Vue from "vue"
import VueResource from "vue-resource"
import ls from "local-storage"

Vue.use(VueResource)

const client = {
  defaultHeaders: { "Authorization": `Bearer ${ls("jwt")}` },
  headers: { "Authorization": `Bearer ${ls("jwt")}` },
  mergeHeaders: (headers) => {
    return Object.assign({}, client.headers, headers)
  },
  withoutAuth: () => {
    client.headers = {}
    return client
  }
}
const httpMethods = ['get', 'post', 'put', 'delete']
httpMethods.forEach((verb) => {
    client[verb] = (path, data = {}, headers = {}) => {
      return new Promise((resolve, reject) => {
        Vue.http[verb](path, data, { headers: client.mergeHeaders(headers) }).then((res) => {
          client.headers = client.defaultHeaders
          resolve(res.data)
        }, (res) => {
          client.headers = client.defaultHeaders
          reject(res)
        })
      })
    }
})

export default client;

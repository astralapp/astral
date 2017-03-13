import Vue from "vue"
import VueResource from "vue-resource"
import ls from "local-storage"

Vue.use(VueResource)

const client = {
  defaultHeaders: { "Authorization": `Bearer ${ls("jwt")}` },
  mergeHeaders: (headers) => {
    return Object.assign({}, client.defaultHeaders, headers)
  }
}
const httpMethods = ['get', 'post', 'put', 'delete']
httpMethods.forEach((verb) => {
    client[verb] = (path, data = {}, headers = {}) => {
      return new Promise((resolve, reject) => {
        Vue.http[verb](path, data, mergeHeaders(headers)).then((res) => {
          resolve(res.data)
        }, (res) => {
          reject(res)
        })
      })
    }
})

export default client;

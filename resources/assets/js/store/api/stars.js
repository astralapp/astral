import Vue from 'vue'
import VueResource from 'vue-resource'
import client from './client'
import { Base64 } from 'js-base64'

Vue.use(VueResource)

const normalizeReadmeAssetUrls = (name, readmeResponse) => {
  const readme = Base64.decode(readmeResponse.content)
  const branch = readmeResponse.url.split('?ref=')[1]
  const regex = /(!\[.*\])\(\/?(?!(http:\/\/)|(https:\/\/)|(\/))(.*)\)/igm
  const replaceWith = `$1(https://github.com/${name}/blob/${branch}/$5?raw=true)`
  return readme.replace(regex, replaceWith)
}

export default {
  fetch (page = 1, autotag = true, refresh = false) {
    const url = refresh ? `/api/github/stars/refresh` : `/api/github/stars?page=${page}&autotag=${autotag}`
    return client.get(url)
  },
  fetchReadme (name, accessToken) {
    return new Promise((resolve, reject) => {
      client.withoutAuth().get(`https://api.github.com/repos/${name}/readme?access_token=${accessToken}`).then((res) => {
        const readmeMarkdown = normalizeReadmeAssetUrls(name, res)
        client.withoutAuth().post(`https://api.github.com/markdown/raw?access_token=${accessToken}`, readmeMarkdown, { 'Content-Type': 'text/plain' }).then((res) => {
          const readme = res
          resolve(readme)
        })
      })
    })
  },
  editStarNotes (star, text) {
    return client.post('/api/stars/notes', { star, text })
  },
  tagStar (data) {
    return client.post('/api/stars/tag', data)
  },
  cleanup () {
    return client.post('/api/stars/cleanup')
  }

}

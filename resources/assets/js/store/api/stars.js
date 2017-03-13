import Vue from 'vue'
import VueResource from 'vue-resource'
import client from './client'
import ls from 'local-storage'
import { Base64 } from 'js-base64'

Vue.use(VueResource)

const normalizeReadmeAssetUrls = (readmeResponse) => {
  let readme = Base64.decode(readmeResponse.data.content)
  const branch = readmeResponse.data.url.split('?ref=')[1]
  const regex = /(!\[.*\])\(\/?(?!(http:\/\/)|(https:\/\/)|(\/))(.*)\)/igm
  const replaceWith = `$1(https://github.com/${name}/blob/${branch}/$5?raw=true)`
  return readme.replace(regex, replaceWith)
}

export default {
  fetch(page = 1, autotag = true, refresh = false) {
    const url = refresh ? `/api/github/stars/refresh` : `/api/github/stars?page=${page}&autotag=${autotag}`
    const token = ls('access_token')
    return client.get(url, {}, { 'Access-Token': token })
  },
  fetchReadme(name) {
    const token = ls('access_token')
    return new Promise((resolve, reject) => {
      client.get(`https://api.github.com/repos/${name}/readme?access_token=${accessToken}`).then((res) => {
        let readme = normalizeReadmeAssetUrls(res)
        client.post(`https://api.github.com/markdown/raw?access_token=${accessToken}`, readme, {'Content-Type': 'text/plain'}).then((res) => {
          const renderedReadme = res.data
          resolve(renderedReadme)
        })
      })
    })
  },
  editStarNotes(star, notes) {
    return client.post('/api/stars/notes', {star, notes})
  },
  tagStar(data) {
    client.post('/api/stars/tag', data)
  }

}

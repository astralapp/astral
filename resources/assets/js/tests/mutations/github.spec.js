import { describe } from 'ava-spec'
import { mutations } from './../../store/modules/github.js'

const {
  APPEND_GITHUB_STARS,
  SET_GITHUB_STARS,
  SET_TOTAL_PAGES,
  SET_CACHED_PAGES,
  INCREMENT_CACHED_PAGES,
  SET_README
} = mutations

describe('GitHub Star Mutations', it => {
  it('can receive an array of GitHub stars', t => {
    const stars = [
      { id: 56919458, name: 'vue-multiselect' },
      { id: 58734906, name: 'vue-jwt-auth' },
      { id: 58905085, name: 'bideo.js' }
    ]
    const state = {}
    SET_GITHUB_STARS(state, stars)

    t.is(state.githubStars, stars)
  })

  it('can append new GitHub stars', t => {
    const stars = [
      { id: 56919458, name: 'vue-multiselect' },
      { id: 58734906, name: 'vue-jwt-auth' },
      { id: 58905085, name: 'bideo.js' }
    ]
    const newStars = [
      { id: 38582384, name: 'vuex-assert' },
      { id: 92783554, name: 'onfontready' },
      { id: 10549354, name: 'vue-flatpickr' }
    ]
    const state = { githubStars: stars }
    APPEND_GITHUB_STARS(state, newStars)

    t.deepEqual(state.githubStars, stars.concat(newStars))
  })

  it('can set the total number of pages in the api pagination response', t => {
    const state = {}
    SET_TOTAL_PAGES(state, 5)

    t.is(state.totalPages, 5)
  })

  it('can set the number of cached pages from the server', t => {
    const state = {}
    SET_CACHED_PAGES(state, 3)

    t.is(state.cachedPages, 3)
  })

  it('can increment the number of cached pages', t => {
    const state = { cachedPages: 1 }
    INCREMENT_CACHED_PAGES(state)

    t.is(state.cachedPages, 2)
  })

  it('can set the readme text', t => {
    const readmeText = 'This is a readme.'
    const state = {}
    SET_README(state, readmeText)

    t.is(state.readme, readmeText)
  })
})

import { describe } from 'ava-spec'
import { mutations } from './../../store/modules/tags.js'

const {
  SET_NEW_TAG,
  SET_TAGS,
  RESET_NEW_TAG,
  SET_TAG_FILTER,
  SET_CURRENT_TAG,
  RESET_CURRENT_TAG
} = mutations

describe('Tag Mutations', it => {
  it('can set content for a new tag', t => {
    const newTag = {
      name: 'VueJS',
      description: 'All things VueJS'
    }
    const state = {}
    SET_NEW_TAG(state, newTag)

    t.deepEqual(state.newTag, newTag)
  })

  it('can reset a new tag entry', t => {
    const currentTag = {
      name: 'VueJS',
      description: 'All things VueJS'
    }
    const state = { newTag: currentTag }
    RESET_NEW_TAG(state)

    t.deepEqual(state.newTag, { name: '', description: '' })
  })

  it('can receive an array of tags', t => {
    const testTags = [
      { id: 1, name: 'VueJS' },
      { id: 2, name: 'Laravel' },
      { id: 3, name: 'Gulp' }
    ]
    const state = {}
    SET_TAGS(state, testTags)

    t.is(state.tags, testTags)
  })

  it('can set the current tag', t => {
    const tag = { id: 1, name: 'VueJS' }
    const state = {}
    SET_CURRENT_TAG(state, tag)

    t.deepEqual(state.currentTag, tag)
  })

  it('can reset the current tag', t => {
    const currentTag = { id: 1, name: 'VueJS' }
    const state = { currentTag: currentTag }
    RESET_CURRENT_TAG(state)

    t.deepEqual(state.currentTag, {})
  })

  it('can set the tag filter mode', t => {
    const state = { tagFilter: 'ALL' }
    SET_TAG_FILTER(state, 'UNTAGGED')

    t.is(state.tagFilter, 'UNTAGGED')
  })
})

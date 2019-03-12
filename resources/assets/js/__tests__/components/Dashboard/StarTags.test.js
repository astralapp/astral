import { shallowMount, createLocalVue } from '@vue/test-utils'
import StarTags from '@/components/Dashboard/StarTags'
import Vuex from 'vuex'
import sampleStars from '../../utils/sample-stars'

jest.unmock('lodash')

const localVue = createLocalVue()
localVue.use(Vuex)

const mountWithTags = (tags = []) => {
  return shallowMount(StarTags, {
    localVue,
    propsData: {
      star: {
        node: {
          databaseId: 12345,
          primaryLanguage: 'JavaScript'
        },
        tags
      }
    },
    stubs: ['GlobalEvents'],
    store: new Vuex.Store({
      state: {},
      getters: {
        allTags: () => tags,
        user: () => {
          return {
            show_language_tags: true
          }
        },
        currentStars: () => {
          return [sampleStars[0]]
        }
      },
      actions: {
        syncStarTags: jest.fn(),
        setCurrentTag: jest.fn(),
        setCurrentLanguage: jest.fn()
      }
    })
  })
}
describe('Star Tags Editor', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('creates a mutable copy of the passed in tags', () => {
    const wrapper = mountWithTags([{ id: 1, name: 'Vue.js' }, { id: 2, name: 'Laravel' }, { id: 3, name: 'Tailwind' }])

    expect(wrapper.vm.mutableTags.length).toBe(3)
  })

  describe('Adding a tag', () => {
    const wrapper = mountWithTags([{ id: 1, name: 'Vue.js' }, { id: 2, name: 'Laravel' }, { id: 3, name: 'Tailwind' }])
    wrapper.vm.onBlur = jest.fn()

    it('adds a new tag to the end', () => {
      wrapper.vm.addTag('React')

      expect([...wrapper.vm.mutableTags].pop().name).toBe('React')
    })

    it('trims whitespace and removes commas from the tag name', () => {
      wrapper.vm.addTag('  BadCom,maTag  ')

      expect([...wrapper.vm.mutableTags].pop().name).toBe('BadCommaTag')
    })
  })

  describe('Removing a tag', () => {
    const wrapper = mountWithTags([{ id: 1, name: 'Vue.js' }, { id: 2, name: 'Laravel' }, { id: 3, name: 'Tailwind' }])
    wrapper.vm.onBlur = jest.fn()

    it('removes a tag by index', () => {
      wrapper.vm.removeTagAtIndex(2)

      expect(wrapper.vm.mutableTags).toEqual([{ id: 1, name: 'Vue.js' }, { id: 2, name: 'Laravel' }])
    })

    it('removes a tag by refernce', () => {
      const tagToRemove = { id: 1, name: 'Vue.js' }
      wrapper.vm.removeTag(tagToRemove)

      expect(wrapper.vm.mutableTags).toEqual([{ id: 2, name: 'Laravel' }, { id: 3, name: 'Tailwind' }])
    })
  })
})

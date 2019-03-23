import { shallowMount, createLocalVue } from '@vue/test-utils'
import StarTags from '@/components/Dashboard/StarTags'
import Vuex from 'vuex'
import sampleStars from '../../utils/sample-stars'

jest.unmock('lodash')

const localVue = createLocalVue()
localVue.use(Vuex)

const sampleTags = [{ id: 1, name: 'Vue.js' }, { id: 2, name: 'Laravel' }, { id: 3, name: 'Tailwind' }]

const actions = {
  syncStarTags: jest.fn(),
  setCurrentTag: jest.fn(),
  setCurrentLanguage: jest.fn()
}

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
        tags: () => tags,
        user: () => {
          return {
            show_language_tags: true
          }
        },
        currentStars: () => {
          return [sampleStars[0]]
        }
      },
      actions
    })
  })
}
describe('Star Tags Editor', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('creates a mutable copy of the passed in tags', () => {
    const wrapper = mountWithTags([...sampleTags])

    expect(wrapper.vm.mutableTags.length).toBe(3)
  })

  describe('Adding a tag', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mountWithTags(sampleTags)
      wrapper.vm.onBlur = jest.fn()
    })

    it('adds a new tag to the end', () => {
      wrapper.vm.addTag('React')

      expect([...wrapper.vm.mutableTags].pop().name).toBe('React')
    })

    it('trims whitespace and removes commas from the tag name', () => {
      wrapper.vm.addTag('  BadCom,maTag  ')

      expect([...wrapper.vm.mutableTags].pop().name).toBe('BadCommaTag')
    })

    it('adds a tag via the enterPressed method', () => {
      const addTagSpy = jest.spyOn(wrapper.vm, 'addTag')

      wrapper.setData({ newTag: 'Foo', isEditing: true })

      wrapper.vm.enterPressed()

      expect(addTagSpy).toHaveBeenCalledWith('Foo')
      expect(wrapper.vm.isEditing).toBeFalsy()

      wrapper.setData({ canSaveTags: false })
      wrapper.vm.enterPressed()

      expect(addTagSpy).toHaveBeenCalledTimes(1)

      wrapper.setData({ canSaveTags: true, newTag: '' })
      wrapper.vm.enterPressed()

      expect(addTagSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Removing a tag', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mountWithTags(sampleTags)
      wrapper.vm.onBlur = jest.fn()
    })

    it('removes a tag by index', () => {
      wrapper.vm.removeTagAtIndex(2)

      expect(wrapper.vm.mutableTags).toEqual([{ id: 1, name: 'Vue.js' }, { id: 2, name: 'Laravel' }])
    })

    it('removes a tag by reference', () => {
      const tagToRemove = { id: 1, name: 'Vue.js' }
      wrapper.vm.removeTag(tagToRemove)
      expect(wrapper.vm.mutableTags).toEqual([{ id: 2, name: 'Laravel' }, { id: 3, name: 'Tailwind' }])
    })
  })

  describe('Blurring tag input', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mountWithTags(sampleTags)
      wrapper.setData({
        awesomplete: {
          destroy: jest.fn()
        }
      })
    })

    it('calls the syncStarTags action', () => {
      wrapper.vm.addTag('React')

      wrapper.vm.onBlur({ relatedTarget: null })

      expect(wrapper.vm.awesomplete.destroy).toHaveBeenCalled()
      expect(wrapper.vm.isEditing).toBe(false)
      expect(actions.syncStarTags).toHaveBeenDispatchedWith({
        id: 12345,
        tags: [
          ...sampleTags.map(t => {
            return { name: t.name }
          }),
          { name: 'React' }
        ]
      })
    })
  })

  describe('UI Events', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mountWithTags(sampleTags)
      wrapper.setData({
        awesomplete: {
          destroy: jest.fn()
        }
      })
    })

    it('removes the last tag when delete is pressed', () => {
      const deletePressedSpy = jest.spyOn(wrapper.vm, 'deletePressed')
      const removeTagAtIndexSpy = jest.spyOn(wrapper.vm, 'removeTagAtIndex')

      wrapper.find('input').trigger('keydown.delete')

      expect(deletePressedSpy).toHaveBeenCalled()
      expect(removeTagAtIndexSpy).toHaveBeenCalledWith(2)

      wrapper.setData({ newTag: 'Foo' })
      wrapper.find('input').trigger('keydown.delete')

      expect(removeTagAtIndexSpy).toHaveBeenCalledTimes(1)
    })

    it('resets the tags when escape is pressed', () => {
      const escPressedSpy = jest.spyOn(wrapper.vm, 'escapePressed')

      wrapper.vm.addTag('React')
      wrapper.setData({ newTag: 'Foo' }, { isEditing: true })
      wrapper.find('input').trigger('keyup.esc')

      expect(escPressedSpy).toHaveBeenCalled()
      expect(wrapper.vm.mutableTags).toEqual(sampleTags)
      expect(wrapper.vm.newTag).toBe('')
      expect(wrapper.vm.isEditing).toBe(false)
    })

    it('pressing enter adds a new tag when the input has a value', () => {
      const enterPressedSpy = jest.spyOn(wrapper.vm, 'enterPressed')

      wrapper.find('input').trigger('keyup.enter')

      expect(enterPressedSpy).toHaveBeenCalled()
    })

    it('calls onBlur method when blurring input', () => {
      const blurStub = jest.fn()

      wrapper.setMethods({ onBlur: blurStub })
      wrapper.find('input').element.focus()
      wrapper.find('input').element.blur()

      expect(blurStub).toHaveBeenCalled()
    })
  })
})

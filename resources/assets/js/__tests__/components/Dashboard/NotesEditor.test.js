import { shallowMount } from '@vue/test-utils'
import EasyMDE from 'easymde'
import flushPromises from 'flush-promises'
import NotesEditor from '@/components/Dashboard/NotesEditor'

jest.useFakeTimers()
jest.unmock('lodash')

const lodash = require.requireActual('lodash')
lodash.debounce = jest.fn(fn => fn)

describe('Notes Editor', () => {
  beforeEach(() => {
    jest.clearAllTimers()
  })

  describe('on component mounted', () => {
    it('creates an EasyMDE instance', () => {
      const wrapper = shallowMount(NotesEditor, {
        propsData: {
          notes: 'Lorem Ipsum'
        }
      })
      expect(wrapper.vm.editor instanceof EasyMDE).toBe(true)
    })
    it('sets and saves the notes on change', async () => {
      const wrapper = shallowMount(NotesEditor, {
        propsData: {
          notes: 'Lorem Ipsum'
        }
      })
      const valueSpy = jest.spyOn(wrapper.vm.editor, 'value').mockImplementation(() => {
        return 'New value'
      })
      const saveSpy = jest.spyOn(wrapper.vm, 'saveNotes')

      wrapper.vm.editor.codemirror.setValue('New value')
      wrapper.vm.editor.codemirror.refresh()

      expect(valueSpy).toHaveBeenCalled()
      expect(wrapper.vm.currentNotes).toBe('New value')
      await flushPromises()
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  describe('watchers', () => {
    it('toggles the preview when notes change', () => {
      const wrapper = shallowMount(NotesEditor, {
        propsData: {
          notes: 'Lorem Ipsum'
        }
      })
      const previewActiveSpy = jest.spyOn(wrapper.vm.editor, 'isPreviewActive').mockImplementation(() => {
        return true
      })
      const togglePreviewSpy = jest.spyOn(wrapper.vm.editor, 'togglePreview')
      const valueSpy = jest.spyOn(wrapper.vm.editor, 'value')

      wrapper.setProps({ notes: 'New notes' })

      expect(previewActiveSpy).toHaveBeenCalled()
      expect(togglePreviewSpy).toHaveBeenCalled()
      expect(valueSpy).toHaveBeenCalledWith('New notes')
    })
  })

  describe('component methods', () => {
    it('saves notes', () => {
      const wrapper = shallowMount(NotesEditor, {
        propsData: {
          notes: 'Lorem Ipsum'
        }
      })
      wrapper.vm.saveNotes()
      expect(wrapper.emitted().save).toBeTruthy()
      expect(wrapper.vm.notesSaved).toBe(true)
      expect(wrapper.find('.repo-notes-status').isVisible()).toBe(true)
      jest.advanceTimersByTime(3000)
      expect(wrapper.vm.notesSaved).toBe(false)
      expect(wrapper.find('.repo-notes-status').isVisible()).toBe(false)
    })
  })
})

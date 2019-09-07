import { shallowMount } from '@vue/test-utils'
import EasyMDE from 'easymde'
import flushPromises from 'flush-promises'
import NotesEditor from '@/components/Dashboard/NotesEditor'

jest.unmock('lodash')

const lodash = require.requireActual('lodash')
lodash.debounce = jest.fn((fn, ms) => fn.bind(this, ms))

describe('Notes Editor', () => {
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
          notes: 'Lorem Ipsum',
          autosave: true
        }
      })
      const valueSpy = jest.spyOn(wrapper.vm.editor, 'value').mockImplementationOnce(() => {
        return 'New value'
      })
      const debouncedSaveSpy = jest.spyOn(wrapper.vm, 'debounceSaveNotes')

      wrapper.vm.editor.codemirror.setValue('New value')
      wrapper.vm.editor.codemirror.refresh()

      expect(valueSpy).toHaveBeenCalled()
      expect(wrapper.vm.currentNotes).toBe('New value')

      await flushPromises()

      expect(debouncedSaveSpy).toHaveBeenCalled()
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
    })
  })
})

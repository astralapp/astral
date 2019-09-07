import { mount, TransitionStub } from '@vue/test-utils'
import NewTagForm from '@/components/Dashboard/Sidebar/NewTagForm'

describe('New Tag Form', () => {
  describe('methods', () => {
    it('shows the form when clicking the button', () => {
      const wrapper = mount(NewTagForm, {
        stubs: {
          Transition: TransitionStub
        }
      })
      const $btn = wrapper.find('.toggle-new-tag-button')
      const $form = wrapper.find('.toggle-new-tag-form')

      expect(wrapper.vm.formShowing).toBe(false)
      expect($form.isVisible()).toBe(false)
      expect($btn.isVisible()).toBe(true)

      $btn.trigger('click')

      expect(wrapper.vm.formShowing).toBe(true)
      expect($form.isVisible()).toBe(true)
      expect($btn.isVisible()).toBe(false)
    })

    it('hides the form when blurring the text input', () => {
      const wrapper = mount(NewTagForm, {
        stubs: {
          Transition: TransitionStub
        }
      })
      const $form = wrapper.find('.toggle-new-tag-form')
      const $input = wrapper.find('.toggle-new-tag-form input[type=text]')
      const $btn = wrapper.find('.toggle-new-tag-button')

      wrapper.setData({ formShowing: true })

      expect($btn.isVisible()).toBe(false)
      expect($form.isVisible()).toBe(true)

      $input.trigger('blur')

      expect(wrapper.vm.formShowing).toBe(false)
      expect($btn.isVisible()).toBe(true)
      expect($form.isVisible()).toBe(false)
    })

    it('emits an event with the form value when submitting the form', () => {
      const wrapper = mount(NewTagForm, {
        stubs: {
          transition: TransitionStub
        }
      })
      const $form = wrapper.find('.toggle-new-tag-form')

      wrapper.setData({ tagName: 'Testing' })
      $form.trigger('submit')

      expect(wrapper.emitted().submit[0]).toEqual(['Testing'])
      expect(wrapper.vm.tagName).toBe('')
    })
  })
})

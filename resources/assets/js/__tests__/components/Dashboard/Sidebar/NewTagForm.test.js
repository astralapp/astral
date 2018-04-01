import { shallow } from '@vue/test-utils'
import NewTagForm from '@/components/Dashboard/Sidebar/NewTagForm'

describe('New Tag Form', () => {
  describe('methods', () => {
    it('shows the form when clicking the button', () => {
      const wrapper = shallow(NewTagForm)
      const $btn = wrapper.find('.toggle-new-tag-button')
      const $form = wrapper.find('.toggle-new-tag-form')

      expect(wrapper.vm.formShowing).toBe(false)
      expect($btn.isVisible()).toBe(true)
      expect($form.isVisible()).toBe(false)

      $btn.trigger('click')

      expect($btn.isVisible()).toBe(false)
      expect($form.isVisible()).toBe(true)
      expect(wrapper.vm.formShowing).toBe(true)
    })

    it('hides the form when blurring the text input', () => {
      const wrapper = shallow(NewTagForm)
      const $input = wrapper.find('.toggle-new-tag-form input[type=text]')

      wrapper.setData({ formShowing: true })

      expect(wrapper.vm.formShowing).toBe(true)

      $input.trigger('blur')

      expect(wrapper.vm.formShowing).toBe(false)
    })

    it('emits an event with the form value when submitting the form', () => {
      const wrapper = shallow(NewTagForm)
      const $form = wrapper.find('.toggle-new-tag-form')

      wrapper.setData({ tagName: 'Testing' })
      $form.trigger('submit')

      expect(wrapper.emitted().submit[0]).toEqual(['Testing'])
      expect(wrapper.vm.tagName).toBe('')
    })
  })
})

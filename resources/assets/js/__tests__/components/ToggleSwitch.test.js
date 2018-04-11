import { shallow } from '@vue/test-utils'
import ToggleSwitch from '@/components/ToggleSwitch'

describe('Toggle Switch', () => {
  it('is not checked by default', () => {
    const wrapper = shallow(ToggleSwitch)

    expect(wrapper.vm.checked).toBe(false)
    expect(wrapper.find('input[type=checkbox]').element.checked).toBe(false)
    expect(wrapper.find('.toggle-switch-label').text()).toBe('Off')
  })

  it('emits a change event', () => {
    const wrapper = shallow(ToggleSwitch)

    const $checkbox = wrapper.find('input[type=checkbox]')
    $checkbox.trigger('click')

    expect(wrapper.emitted('change')[0]).toEqual([true])
  })

  it('sets the correct label and class', () => {
    const wrapper = shallow(ToggleSwitch, {
      propsData: {
        checked: true,
        onLabel: 'Yes',
        offLabel: 'No'
      }
    })

    expect(wrapper.find('.toggle-switch-label').text()).toBe('Yes')
    expect(wrapper.find('.toggle-switch-label').classes()).toContain(
      'text-brand'
    )

    wrapper.setProps({ checked: false })

    expect(wrapper.find('.toggle-switch-label').text()).toBe('No')
    expect(wrapper.find('.toggle-switch-label').classes()).toContain(
      'text-grey'
    )
  })
})

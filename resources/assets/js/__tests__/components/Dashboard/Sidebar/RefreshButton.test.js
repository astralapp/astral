import { shallowMount } from '@vue/test-utils'
import RefreshButton from '@/components/dashboard/sidebar/RefreshButton'

describe('Sidebar refresh button', () => {
  it('applies the active class when the prop is true', () => {
    const wrapper = shallowMount(RefreshButton, {
      propsData: {
        active: true
      }
    })

    expect(wrapper.find('.refresh-stars').classes()).toContain('active')
  })

  it('does not apply the active class when the prop is false', () => {
    const wrapper = shallowMount(RefreshButton, {
      propsData: {
        active: false
      }
    })

    expect(wrapper.find('.refresh-stars').classes()).not.toContain('active')
  })
})

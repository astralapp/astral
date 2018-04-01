import { shallow } from '@vue/test-utils'
import RefreshButton from '@/components/Dashboard/Sidebar/RefreshButton'

describe('Sidebar refresh button', () => {
  it('applies the active class when the prop is true', () => {
    const wrapper = shallow(RefreshButton, {
      propsData: {
        active: true
      }
    })

    expect(wrapper.find('.refresh-stars').classes()).toContain('active')
  })

  it('does not apply the active class when the prop is false', () => {
    const wrapper = shallow(RefreshButton, {
      propsData: {
        active: false
      }
    })

    expect(wrapper.find('.refresh-stars').classes()).not.toContain('active')
  })
})

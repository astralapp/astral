import { shallow } from '@vue/test-utils'
import SidebarHeader from '@/components/Dashboard/Sidebar/SidebarHeader'

describe('Sidebar Header', () => {
  it('sets the title', () => {
    const wrapper = shallow(SidebarHeader, {
      propsData: {
        title: 'Stars'
      }
    })

    expect(wrapper.find('h3').text()).toBe('Stars')
  })
})

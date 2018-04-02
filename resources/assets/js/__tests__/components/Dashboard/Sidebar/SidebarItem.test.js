import { shallow, mount } from '@vue/test-utils'
import SidebarItem from '@/components/Dashboard/Sidebar/SidebarItem'

describe('Sidebar Item', () => {
  it('renders a title', () => {
    const wrapper = shallow(SidebarItem, {
      propsData: {
        title: 'Testing',
        icon: 'PlayIcon'
      }
    })

    expect(wrapper.find('.dashboard-list-item-name').text()).toBe('Testing')
  })
  it('renders an icon with the correct size', () => {
    const wrapper = mount(SidebarItem, {
      propsData: {
        icon: 'PlayIcon'
      }
    })
    expect(wrapper.find('svg').isVisible()).toBe(true)
  })

  it('does not render an icon if no icon prop is passed', () => {
    const wrapper = mount(SidebarItem, {
      propsData: {
        title: 'Testing'
      }
    })
    expect(wrapper.find('svg').exists()).toBe(false)
  })
  it('can render a badge', () => {
    const wrapper = mount(SidebarItem, {
      propsData: {
        title: 'Testing',
        badge: 10
      }
    })
    const $badge = wrapper.find('.dashboard-list-item-badge')

    expect($badge.isVisible()).toBe(true)
    expect($badge.text()).toBe('10')

    wrapper.setProps({ badge: 'Foo' })

    expect($badge.text()).toBe('Foo')
  })

  it('does not show a badge if no badge prop is passed', () => {
    const wrapper = mount(SidebarItem, {
      propsData: {
        title: 'Testing'
      }
    })

    expect(wrapper.find('.dashboard-list-item-badge').exists()).toBe(false)
  })
})

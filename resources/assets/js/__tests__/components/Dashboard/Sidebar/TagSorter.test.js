import { shallow } from '@vue/test-utils'
import TagSorter from '@/components/Dashboard/Sidebar/TagSorter'

const $bus = {
  $on: jest.fn((e, fn) => fn(e))
}

describe('Tag Sorter', () => {
  it('toggles the dropdown state when clicking the button', () => {
    const wrapper = shallow(TagSorter, {
      mocks: { $bus }
    })
    const $btn = wrapper.find('button')

    $btn.trigger('click')

    expect(wrapper.vm.dropdownVisible).toBe(true)

    $btn.trigger('click')

    expect(wrapper.vm.dropdownVisible).toBe(false)
  })
  it('hides the dropdown', () => {
    const wrapper = shallow(TagSorter, {
      mocks: { $bus }
    })

    wrapper.setData({ dropdownVisible: true })
    wrapper.vm.hideDropdown()

    expect(wrapper.vm.dropdownVisible).toBe(false)
  })
})

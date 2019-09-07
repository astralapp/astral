import { shallowMount } from '@vue/test-utils'
import TagSortDropdown from '@/components/dashboard/sidebar/TagSortDropdown'

const $bus = {
  $emit: jest.fn((e, data) => data)
}

describe('Tag Sort Dropdown', () => {
  it('shows if visibility is true', () => {
    const wrapper = shallowMount(TagSortDropdown, {
      propsData: {
        visible: true
      },
      mocks: { $bus }
    })

    expect(wrapper.find('.tag-sort-dropdown').isVisible()).toBe(true)
  })
  it('is hidden if visibility is false', () => {
    const wrapper = shallowMount(TagSortDropdown, {
      propsData: {
        visible: false
      },
      mocks: { $bus }
    })

    expect(wrapper.find('.tag-sort-dropdown').isVisible()).toBe(false)
  })
  it('emits an event when a sort method is clicked', () => {
    const wrapper = shallowMount(TagSortDropdown, {
      propsData: {
        visible: false
      },
      mocks: { $bus }
    })

    const busSpy = jest.spyOn(wrapper.vm.$bus, '$emit')

    wrapper.findAll('.tag-sort-item').wrappers.forEach(item => {
      item.trigger('click')
    })

    expect(busSpy).toHaveBeenCalledWith('TAGS_SORTED', 'ALPHA_ASC')
    expect(busSpy).toHaveBeenCalledWith('TAGS_SORTED', 'ALPHA_DESC')
    expect(busSpy).toHaveBeenCalledWith('TAGS_SORTED', 'STARS_DESC')
    expect(busSpy).toHaveBeenCalledWith('TAGS_SORTED', 'STARS_ASC')
  })
})

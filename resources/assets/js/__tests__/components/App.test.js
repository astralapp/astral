import { shallowMount } from '@vue/test-utils'
import App from '@/components/App'

describe('App', () => {
  it('is a Vue instance', () => {
    const wrapper = shallowMount(App, { stubs: ['router-view'] })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})

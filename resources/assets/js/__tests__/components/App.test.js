import { mount } from '@vue/test-utils'
import App from '@/components/App'

describe('App', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(App, { stubs: ['router-view'] })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})

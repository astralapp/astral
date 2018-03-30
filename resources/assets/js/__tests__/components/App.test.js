import { shallow } from '@vue/test-utils'
import App from '@/components/App'

describe('App', () => {
  it('is a Vue instance', () => {
    const wrapper = shallow(App, { stubs: ['router-view'] })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})

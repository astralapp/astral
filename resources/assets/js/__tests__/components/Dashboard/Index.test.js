import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import DashboardIndex from '@/components/Dashboard/Index'
import Vuex from 'vuex'

const $bus = {
  $emit: jest.fn((e, data) => data)
}

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Dashboard Index', () => {
  let store
  let actions

  beforeEach(() => {
    actions = {
      fetchUser: jest.fn(),
      fetchGitHubStars: jest.fn(),
      fetchUserStars: jest.fn(),
      cleanupStars: jest.fn(),
      fetchPredicates: jest.fn()
    }

    store = new Vuex.Store({
      state: {},
      getters: {
        stars: () => [{ name: 'vuejs/vue', tags: [{ name: 'VueJS' }] }, { name: 'other/repo', tags: [] }],
        pageInfo: () => {
          return {
            hasNextPage: false
          }
        },
        currentTag: () => {
          return { name: 'VueJS' }
        },
        user: () => {
          return {}
        }
      },
      actions
    })
  })
  describe('on component created', () => {
    it('is fetches all user-related data', async () => {
      shallowMount(DashboardIndex, {
        localVue,
        store,
        mocks: { $bus }
      })
      expect(actions.fetchUser).toHaveBeenCalled()
      await flushPromises()
      expect(actions.fetchUserStars).toHaveBeenCalled()
      await flushPromises()
      expect(actions.fetchGitHubStars).toHaveBeenCalled()
      await flushPromises()
      expect(actions.cleanupStars).toHaveBeenCalled()
    })
  })

  describe('computed props', () => {
    it('stars that contain the current tag', () => {
      const wrapper = shallowMount(DashboardIndex, {
        localVue,
        store,
        mocks: { $bus }
      })

      expect(wrapper.vm.starsWithCurrentTag).toEqual([
        {
          name: 'vuejs/vue',
          tags: [{ name: 'VueJS' }]
        }
      ])
    })
  })
})

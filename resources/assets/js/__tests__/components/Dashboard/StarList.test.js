import { shallowMount, createLocalVue } from '@vue/test-utils'
import StarList from '@/components/Dashboard/StarList'
import '@/filters/galileo'
import sampleStars from '../../utils/sample-stars'
import Vuex from 'vuex'

const mockStars = [...sampleStars.edges]
jest.mock('@/filters/galileo', () => ({
  __esModule: true,
  default: () => mockStars
}))

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Stars List', () => {
  let store
  let actions

  beforeEach(() => {
    actions = {
      setCurrentStar: jest.fn(),
      pushToCurrentStars: jest.fn(),
      selectStars: jest.fn(),
      fetchReadme: jest.fn()
    }

    store = new Vuex.Store({
      state: {},
      getters: {
        currentStar: () => ({}),
        currentTag: () => ({}),
        currentLanguage: () => '',
        tokenizedSearchQuery: () => ({}),
        viewingUntagged: () => false
      },
      actions
    })
  })

  describe('component methods', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.clearAllMocks()
    })

    describe('star selection', () => {
      const { edges: stars } = sampleStars
      const e = {
        shiftKey: false,
        ctrlKey: false,
        metaKey: false
      }

      it('can select a single star', () => {
        const $wrapper = shallowMount(StarList, {
          localVue,
          store,
          stubs: ['CollectionCluster'],
          propsData: {
            stars: sampleStars.edges
          }
        })
        $wrapper.vm.handleClick(e, stars[1])

        expect(actions.setCurrentStar).toHaveBeenDispatchedWith(stars[1])
      })
    })
  })
})

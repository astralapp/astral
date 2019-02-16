import { shallowMount, createLocalVue } from '@vue/test-utils'
import StarList from '@/components/Dashboard/StarList'
import '@/filters/galileo'
import sampleStars from '../../utils/sample-stars'
import Vuex from 'vuex'

const mockStars = [
  ...sampleStars.edges.map(star => {
    return { value: star }
  })
]
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
        currentStars: () => [],
        currentTag: () => ({}),
        currentLanguage: () => '',
        tokenizedSearchQuery: () => ({
          query: '',
          tags: [],
          strings: []
        }),
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
            stars
          }
        })
        $wrapper.vm.handleClick(e, stars[1])

        expect(actions.setCurrentStar).toHaveBeenDispatchedWith(stars[1])
      })

      describe('holding shift', () => {
        it('selects from index 0 to the selected index if no stars are selected', () => {
          const $wrapper = shallowMount(StarList, {
            localVue,
            store,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[4])

          expect(actions.selectStars).toHaveBeenDispatchedWith([stars[0], stars[1], stars[2], stars[3], stars[4]])
        })

        it('selects the correct stars when selecting a star between two selected stars', () => {
          const $wrapper = shallowMount(StarList, {
            localVue,
            store: {
              ...store,
              getters: {
                ...store.getters,
                currentStars: [stars[0], stars[4]]
              }
            },
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[2])

          expect(actions.selectStars).toHaveBeenDispatchedWith([stars[0], stars[4], stars[2], stars[3]])
        })

        it('selects the correct stars when selecting an index less than the lowest index of the currently selected stars', () => {
          const $wrapper = shallowMount(StarList, {
            localVue,
            store: {
              ...store,
              getters: {
                ...store.getters,
                currentStars: [stars[3], stars[4]]
              }
            },
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[0])

          expect(actions.selectStars).toHaveBeenDispatchedWith([stars[3], stars[4], stars[0], stars[1], stars[2]])
        })

        it('selects the correct stars when selecting an index greater than the highest index of the currently selected stars', () => {
          const $wrapper = shallowMount(StarList, {
            localVue,
            store: {
              ...store,
              getters: {
                ...store.getters,
                currentStars: [stars[1]]
              }
            },
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[3])

          expect(actions.selectStars).toHaveBeenDispatchedWith([stars[1], stars[2], stars[3]])
        })
      })

      describe('holding ctrl or meta', () => {
        it('pushes the selected star to the current stars list', () => {
          const $wrapper = shallowMount(StarList, {
            localVue,
            store,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, ctrlKey: true }, stars[2])

          expect(actions.pushToCurrentStars).toHaveBeenDispatchedWith(stars[2])

          actions.pushToCurrentStars.mockClear()

          $wrapper.vm.handleClick({ ...e, metaKey: true }, stars[3])

          expect(actions.pushToCurrentStars).toHaveBeenDispatchedWith(stars[3])
        })
      })
    })
  })
})

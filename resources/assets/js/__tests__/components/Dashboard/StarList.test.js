import { shallowMount } from '@vue/test-utils'
import StarList from '@/components/Dashboard/StarList'
import '@/filters/galileo'
import sampleStars from '../../utils/sample-stars'
import { Store } from 'vuex-mock-store'

const mockStars = [
  ...sampleStars.edges.map(star => {
    return { value: star }
  })
]

const store = new Store({
  state: {},
  getters: {
    currentStar: {},
    currentStars: [],
    filteredStars: mockStars
  }
})

const mocks = {
  $store: store
}

jest.mock('@/filters/galileo', () => ({
  __esModule: true,
  default: () => mockStars
}))

afterEach(() => store.reset())

describe('Stars List', () => {
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
          mocks,
          stubs: ['CollectionCluster'],
          propsData: {
            stars
          }
        })
        $wrapper.vm.handleClick(e, stars[1])

        expect(store.dispatch).toHaveBeenCalledWith('setCurrentStar', stars[1])
      })

      describe('holding shift', () => {
        it('selects from index 0 to the selected index if no stars are selected', () => {
          const $wrapper = shallowMount(StarList, {
            mocks,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[4])

          expect(store.dispatch).toHaveBeenCalledWith('selectStars', [stars[0], stars[1], stars[2], stars[3], stars[4]])
        })

        it('selects the correct stars when selecting a star between two selected stars', () => {
          store.getters.currentStars = [stars[0], stars[4]]
          store.getters.currentStarIndexes = [0, 4]

          // console.log(mocks.$store.getters.currentStars)

          const $wrapper = shallowMount(StarList, {
            mocks,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[2])

          expect(store.dispatch).toHaveBeenCalledWith('selectStars', [stars[0], stars[4], stars[2], stars[3]])
        })

        it('selects the correct stars when selecting an index less than the lowest index of the currently selected stars', () => {
          store.getters.currentStars = [stars[3], stars[4]]
          store.getters.currentStarIndexes = [3, 4]
          const $wrapper = shallowMount(StarList, {
            mocks,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[0])

          expect(store.dispatch).toHaveBeenCalledWith('selectStars', [stars[3], stars[4], stars[0], stars[1], stars[2]])
        })

        it('selects the correct stars when selecting an index greater than the highest index of the currently selected stars', () => {
          store.getters.currentStars = [stars[1]]
          store.getters.currentStarIndexes = [1]
          const $wrapper = shallowMount(StarList, {
            mocks,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, shiftKey: true }, stars[3])

          expect(store.dispatch).toHaveBeenCalledWith('selectStars', [stars[1], stars[2], stars[3]])
        })
      })

      describe('holding ctrl or meta', () => {
        it('pushes the selected star to the current stars list', () => {
          const $wrapper = shallowMount(StarList, {
            mocks,
            stubs: ['CollectionCluster'],
            propsData: {
              stars
            }
          })
          $wrapper.vm.handleClick({ ...e, ctrlKey: true }, stars[2])

          expect(store.dispatch).toHaveBeenCalledWith('pushToCurrentStars', stars[2])

          store.reset()

          $wrapper.vm.handleClick({ ...e, metaKey: true }, stars[3])

          expect(store.dispatch).toHaveBeenCalledWith('pushToCurrentStars', stars[3])
        })
      })
    })
  })
})

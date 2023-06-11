import { useStarsStore } from '@/store/useStarsStore'
import { router } from 'hybridly'
import { defineStore } from 'pinia'

export const useUserStore = defineStore({
  actions: {
    deleteUser() {
      const starsStore = useStarsStore()
      starsStore.selectedRepos = []
      starsStore.starredRepos = []
      starsStore.resetPageInfo()

      router.delete(route('user.destroy'))
    },
  },
  id: 'user',
  state() {
    return {
      user: null as Nullable<App.Data.UserData>,
    }
  },
})

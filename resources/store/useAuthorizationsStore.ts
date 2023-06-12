import { Ability, Authorizations, Limit, Limits } from '@/types'
import { router } from 'hybridly'
import { defineStore } from 'pinia'

export const useAuthorizationsStore = defineStore({
  actions: {
    checkForSponsorship() {
      router.get(route('sponsor.check'))
    },
  },
  id: 'authorizations',
  state() {
    return {
      abilities: {
        [Ability.ADD_NOTES]: true,
        [Ability.CREATE_SMART_FILTER]: false,
        [Ability.CREATE_TAG]: false,
      } as Authorizations,
      limits: {
        [Limit.MAX_TAGS]: -1,
      } as Limits,
    }
  },
})

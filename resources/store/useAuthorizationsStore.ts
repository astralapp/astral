import { defineStore } from 'pinia'
import { router } from '@inertiajs/core'
import { Ability, Limit, Limits, Authorizations } from '@/scripts/types'

export const useAuthorizationsStore = defineStore({
  id: 'authorizations',
  state() {
    return {
      abilities: {
        [Ability.CREATE_TAG]: false,
        [Ability.CREATE_SMART_FILTER]: false,
        [Ability.ADD_NOTES]: false,
      } as Authorizations,
      limits: {
        [Limit.MAX_TAGS]: -1,
      } as Limits,
    }
  },
  actions: {
    checkForSponsorship() {
      router.get('/check-sponsorship')
    },
  },
})

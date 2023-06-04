import { ref } from 'vue'
import { AuthScope, BaseDialogReturnType } from '@/scripts/types'

const isOpen = ref(false)

interface UpgradeAuthScopeDialogReturnType extends BaseDialogReturnType {
  redirectToGitHub(): void
}

export const useUpgradeAuthScopeDialog = (): UpgradeAuthScopeDialogReturnType => {
  return {
    isOpen,
    show: () => {
      isOpen.value = true
    },
    hide: () => {
      isOpen.value = false
    },
    redirectToGitHub: () => {
      window.location.assign(`/auth/github?scope=${AuthScope.PUBLIC_REPO}`)
    },
  }
}

import { AuthScope, BaseDialogReturnType } from '@/types'
import { ref } from 'vue'

const isOpen = ref(false)

interface UpgradeAuthScopeDialogReturnType extends BaseDialogReturnType {
  redirectToGitHub(): void
}

export const useUpgradeAuthScopeDialog = (): UpgradeAuthScopeDialogReturnType => {
  return {
    hide: () => {
      isOpen.value = false
    },
    isOpen,
    redirectToGitHub: () => {
      window.location.assign(`/auth/github?scope=${AuthScope.PUBLIC_REPO}`)
    },
    show: () => {
      isOpen.value = true
    },
  }
}

import { useAuth } from '@/composables/use-auth'
import { router } from 'hybridly'
import { computed, ref } from 'vue'

export type CloneProtocol = 'https' | 'ssh'

const protocol = ref<CloneProtocol>('ssh')
let initialized = false

export const useCloneProtocol = () => {
  const { user } = useAuth()

  if (!initialized) {
    protocol.value = user.value?.settings.clone_https_url ? 'https' : 'ssh'
    initialized = true
  }

  const cloneProtocol = computed<CloneProtocol>({
    get: () => protocol.value,
    set: next => {
      if (next === protocol.value) return

      protocol.value = next

      router.put(route('settings.update'), {
        data: { enabled: next === 'https', key: 'clone_https_url' },
        only: ['user'],
      })
    },
  })

  return { cloneProtocol }
}

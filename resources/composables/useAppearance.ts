import { useAuth } from '@/composables/use-auth'
import { router } from 'hybridly'
import { computed, ref } from 'vue'

export const APPEARANCE_OPTIONS = ['system', 'light', 'dark'] as const
export type Appearance = (typeof APPEARANCE_OPTIONS)[number]

const systemQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

const resolveIsDark = (appearance: Appearance): boolean =>
  appearance === 'dark' || (appearance === 'system' && !!systemQuery?.matches)

const applyAppearance = (appearance: Appearance): void => {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('dark', resolveIsDark(appearance))
}

const state = ref<Appearance>('system')
let initialized = false

export const useAppearance = () => {
  const { user } = useAuth()

  if (!initialized) {
    state.value = user.value?.settings.appearance ?? 'system'
    initialized = true

    // Follow live OS changes while the user is deferring to the system.
    systemQuery?.addEventListener('change', () => {
      if (state.value === 'system') applyAppearance('system')
    })
  }

  const appearance = computed<Appearance>({
    get: () => state.value,
    set: next => {
      if (next === state.value) return

      state.value = next
      applyAppearance(next)

      router.put(route('settings.appearance.update'), {
        data: { appearance: next },
        only: ['user'],
      })
    },
  })

  return { appearance }
}

import { useAuth } from '@/composables/use-auth'
import { useSponsorshipDialog } from '@/composables/useSponsorshipDialog'

export function useAbilities() {
  const { user } = useAuth()
  const { show } = useSponsorshipDialog()

  const can = (ability: App.Data.Enums.Ability) => !!user.value?.abilities[ability]

  const gate = (ability: App.Data.Enums.Ability, onAllowed: () => void) => (can(ability) ? onAllowed() : show(ability))

  return { can, gate }
}

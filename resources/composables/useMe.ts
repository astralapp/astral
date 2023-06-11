import { SharedData } from '@/types'
import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

export function useMe() {
  const me = computed(() => usePage<SharedData>().props.user)

  return { me }
}

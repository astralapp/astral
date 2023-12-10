import { useStarsStore } from '@/store/useStarsStore'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'

export function useReadmeQuery() {
  const starsStore = useStarsStore()

  return useQuery({
    queryKey: ['readme', computed(() => starsStore.selectedRepo?.nameWithOwner ?? '')],
    queryFn: () => starsStore.fetchReadme(starsStore.selectedRepo?.nameWithOwner),
    enabled: false,
    staleTime: Infinity,
    networkMode: 'offlineFirst',
  })
}

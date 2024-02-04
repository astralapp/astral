import { useStarsStore } from '@/store/useStarsStore'
import { useQuery } from '@tanstack/vue-query'

export function useReadmeQuery() {
  const starsStore = useStarsStore()

  return useQuery({
    enabled: false,
    networkMode: 'offlineFirst',
    queryFn: () => starsStore.fetchReadme(starsStore.selectedRepo?.nameWithOwner),
    queryKey: ['readme', computed(() => starsStore.selectedRepo?.nameWithOwner ?? '')],
    staleTime: Infinity,
  })
}

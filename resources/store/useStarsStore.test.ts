import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GitHubRepo, GitHubRepoNode } from '@/types'

const showToast = vi.fn()
const routerDelete = vi.fn()

vi.mock('@/composables/useGlobalToast', () => ({
  ToastType: { Error: 'error', Success: 'success' },
  useGlobalToast: () => ({ show: showToast }),
}))

vi.mock('hybridly', () => ({
  router: { delete: (...args: unknown[]) => routerDelete(...args) },
}))

vi.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { accessToken: 'token' } }),
}))

import { useStarsStore } from './useStarsStore'

const node = (id: string, databaseId: number, nameWithOwner: string): GitHubRepoNode =>
  ({ databaseId, id, nameWithOwner } as unknown as GitHubRepoNode)

const repo = (repoNode: GitHubRepoNode): GitHubRepo => ({ node: repoNode } as unknown as GitHubRepo)

const okResponse = () => ({ json: () => Promise.resolve({ data: { removeStar: {} } }), ok: true })
const graphqlErrorResponse = () => ({ json: () => Promise.resolve({ errors: [{ message: 'nope' }] }), ok: true })
const restrictedResponse = () => ({
  json: () =>
    Promise.resolve({
      errors: [
        { message: 'the `tailwindlabs` organization has enabled OAuth App access restrictions', type: 'FORBIDDEN' },
      ],
    }),
  ok: true,
})

describe('useStarsStore.removeStars', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('route', (name: string) => `/${name}`)
    showToast.mockClear()
    routerDelete.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('removes succeeded repos, deletes their local rows, and shows a success toast', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()))

    const store = useStarsStore()
    const a = node('gid-a', 1, 'owner/a')
    const b = node('gid-b', 2, 'owner/b')
    store.starredRepos = [repo(a), repo(b)]
    store.selectedRepos = [a, b]
    store.userStars = [{ id: 10, repo_id: 1 } as never, { id: 20, repo_id: 2 } as never]

    await store.removeStars(['gid-a', 'gid-b'])

    expect(store.starredRepos).toHaveLength(0)
    expect(store.selectedRepos).toHaveLength(0)
    expect(routerDelete).toHaveBeenCalledWith('/stars.destroy', {
      data: { ids: [10, 20] },
      only: ['stars', 'tags'],
    })
    expect(showToast).toHaveBeenCalledWith('Unstarred 2 repositories', 'success')
  })

  it('leaves local state untouched and shows an error toast when GitHub rejects the unstar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(graphqlErrorResponse()))

    const store = useStarsStore()
    const a = node('gid-a', 1, 'owner/a')
    store.starredRepos = [repo(a)]
    store.selectedRepos = [a]
    store.userStars = [{ id: 10, repo_id: 1 } as never]

    await store.removeStars(['gid-a'])

    expect(store.starredRepos).toHaveLength(1)
    expect(store.selectedRepos).toHaveLength(1)
    expect(routerDelete).not.toHaveBeenCalled()
    expect(showToast).toHaveBeenCalledWith("Couldn't unstar owner/a", 'error')
  })

  it('keeps failed repos selected and reports a partial-failure summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, options: { body: string }) => {
        const failing = (JSON.parse(options.body).query as string).includes('gid-b')

        return Promise.resolve(failing ? graphqlErrorResponse() : okResponse())
      })
    )

    const store = useStarsStore()
    const a = node('gid-a', 1, 'owner/a')
    const b = node('gid-b', 2, 'owner/b')
    store.starredRepos = [repo(a), repo(b)]
    store.selectedRepos = [a, b]
    store.userStars = [{ id: 10, repo_id: 1 } as never, { id: 20, repo_id: 2 } as never]

    await store.removeStars(['gid-a', 'gid-b'])

    expect(store.starredRepos.map(currentRepo => currentRepo.node.id)).toEqual(['gid-b'])
    expect(store.selectedRepos.map(selectedRepo => selectedRepo.id)).toEqual(['gid-b'])
    expect(routerDelete).toHaveBeenCalledWith('/stars.destroy', {
      data: { ids: [10] },
      only: ['stars', 'tags'],
    })
    expect(showToast).toHaveBeenCalledWith('Unstarred 1 of 2 — 1 failed', 'error')
  })

  it('surfaces actionable guidance naming the org when GitHub blocks the app with OAuth restrictions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(restrictedResponse()))

    const store = useStarsStore()
    const a = node('gid-a', 1, 'tailwindlabs/tailwindcss')
    store.starredRepos = [repo(a)]
    store.selectedRepos = [a]
    store.userStars = [{ id: 10, repo_id: 1 } as never]

    await store.removeStars(['gid-a'])

    expect(store.starredRepos).toHaveLength(1)
    expect(store.selectedRepos).toHaveLength(1)
    expect(routerDelete).not.toHaveBeenCalled()
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('tailwindlabs'), 'error')
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('third-party apps'), 'error')
  })
})

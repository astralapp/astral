import axios from 'axios'
import { router } from 'hybridly'
import { Dictionary } from 'lodash'
import keyBy from 'lodash/keyBy'
import { Octokit } from 'octokit'
import { defineStore } from 'pinia'

import { removeStarQuery } from '@/queries'
import { useStarsFilterStore } from '@/store/useStarsFilterStore'
import { useUserStore } from '@/store/useUserStore'
import { GitHubRepo, GitHubRepoNode, PaginationResponse, RepoLanguage, StarMetaInput, TagEditorTag } from '@/types'
import { runWithConcurrency } from '@/utils'
import { evaluateSmartFilterBody, parseSmartFilterBody } from '@/utils/predicates'
import { freeTextWords, parsePendingInput, repoMatchesSearch } from '@/utils/search'

const STARS_PER_PAGE = 100
const STARS_FETCH_CONCURRENCY = 6
const STARS_BACKFILL_BATCH = 300

interface GitHubStarItem {
  repo: {
    archived: boolean
    default_branch: string
    description: Nullable<string>
    forks_count: number
    full_name: string
    html_url: string
    id: number
    language: Nullable<string>
    node_id: string
    pushed_at: string
    stargazers_count: number
    topics?: string[]
  }
  starred_at: string
}

const mapStarItemToRepo = (item: GitHubStarItem): GitHubRepo => ({
  node: {
    databaseId: item.repo.id,
    defaultBranchRef: { name: item.repo.default_branch },
    description: item.repo.description ?? undefined,
    forkCount: item.repo.forks_count,
    id: item.repo.node_id,
    isArchived: item.repo.archived,
    nameWithOwner: item.repo.full_name,
    primaryLanguage: item.repo.language ? { name: item.repo.language } : null,
    pushedAt: item.repo.pushed_at,
    stargazerCount: item.repo.stargazers_count,
    topics: item.repo.topics ?? [],
    url: item.repo.html_url,
  },
})

const getLastPage = (link?: string): Nullable<number> => {
  if (!link) return null

  const lastSegment = link.split(',').find(segment => segment.includes('rel="last"'))
  const url = lastSegment?.match(/<([^>]+)>/)?.[1]

  if (!url) return null

  const page = new URL(url).searchParams.get('page')

  return page ? Number(page) : null
}

const dedupeById = (repos: GitHubRepo[]): GitHubRepo[] => {
  const seen = new Set<number>()
  const deduped: GitHubRepo[] = []

  for (const repo of repos) {
    if (seen.has(repo.node.databaseId)) continue

    seen.add(repo.node.databaseId)
    deduped.push(repo)
  }

  return deduped
}

export const useStarsStore = defineStore({
  actions: {
    addTagToStars(tagId: number, repos: StarMetaInput[]) {
      router.post(route('star.tags.store'), {
        data: {
          repos,
          tagId,
        },
        only: ['stars', 'tags'],
      })
    },
    async importLegacyData() {
      this.importScanned = 0
      this.importTotal = 0

      let cursor: Nullable<number> = null
      let done = false

      // Pull the legacy account in cursor-bounded chunks so a large library can't blow
      // the request's time/memory limits. The import is idempotent, so it safely resumes.
      while (!done) {
        const { data } = await axios.post<{
          cursor: Nullable<number>
          done: boolean
          total: number
          processed: number
        }>(route('migrate.import'), { cursor })

        this.importTotal = data.total
        this.importScanned += data.processed
        cursor = data.cursor
        done = data.done
      }

      // Refresh userStars so the freshly imported rows are available for metadata backfill.
      await router.reload({ only: ['stars'] })
    },
    async backfillStarMetadata(starInput: (StarMetaInput & { starId: number })[]) {
      const batches: (StarMetaInput & { starId: number })[][] = []
      for (let i = 0; i < starInput.length; i += STARS_BACKFILL_BATCH) {
        batches.push(starInput.slice(i, i + STARS_BACKFILL_BATCH))
      }

      // Always send a final request, even with nothing to backfill, so `finalize` marks
      // the user migrated.
      if (batches.length === 0) {
        batches.push([])
      }

      for (let i = 0; i < batches.length; i++) {
        await axios.put(route('migrate.update'), {
          stars: batches[i],
          finalize: i === batches.length - 1,
        })
      }
    },
    clearStarredRepos() {
      this.starredRepos = []
    },
    async fetchReadme(repoName?: string) {
      if (!repoName) {
        return Promise.resolve('')
      }

      const userStore = useUserStore()

      const octokit = new Octokit({ auth: userStore.user?.accessToken })
      const { data } = await octokit.request(`GET /repos/${repoName}/readme`, {
        headers: {
          Accept: 'application/vnd.github.v3.html',
        },
      })

      return data
    },
    async fetchAllStars() {
      const userStore = useUserStore()
      const octokit = new Octokit({ auth: userStore.user?.accessToken })

      this.isFetchingStars = true
      this.isFullySynced = false

      try {
        // Keep any cached (possibly partial) list visible while we re-fetch every page from
        // scratch, so a reload shows stars immediately instead of an empty screen. The cached
        // prefix is progressively replaced by authoritative pages and fully dropped at the end —
        // which keeps the result correct even if stars were added or removed since an interrupted
        // run (a page-offset resume would miss top-of-list changes).
        const prefix = this.starredRepos.slice()
        const pages: GitHubRepo[][] = [] // 1-indexed by page number

        this.fetchedCount = prefix.length

        const commit = () => {
          const fetched: GitHubRepo[] = []
          for (let page = 1; pages[page] !== undefined; page++) {
            fetched.push(...pages[page])
          }
          // Show fetched pages, falling back to not-yet-refetched cached rows so the list never
          // shrinks mid-fetch.
          this.starredRepos = dedupeById(fetched.concat(prefix.slice(fetched.length)))
          this.fetchedCount = this.starredRepos.length
        }

        const firstPage = await octokit.request('GET /user/starred', {
          headers: { accept: 'application/vnd.github.star+json' },
          page: 1,
          per_page: STARS_PER_PAGE,
        })

        const lastPage = getLastPage(firstPage.headers.link) ?? 1
        pages[1] = (firstPage.data as unknown as GitHubStarItem[]).map(mapStarItemToRepo)
        this.totalRepos = Math.max(lastPage * STARS_PER_PAGE, prefix.length)
        commit()

        const remainingPages = Array.from({ length: lastPage - 1 }, (_, index) => index + 2)

        await runWithConcurrency(remainingPages, STARS_FETCH_CONCURRENCY, async page => {
          const response = await octokit.request('GET /user/starred', {
            headers: { accept: 'application/vnd.github.star+json' },
            page,
            per_page: STARS_PER_PAGE,
          })

          pages[page] = (response.data as unknown as GitHubStarItem[]).map(mapStarItemToRepo)
          commit()
        })

        this.starredRepos = dedupeById(pages.slice(1).flat())
        this.totalRepos = this.starredRepos.length
        this.fetchedCount = this.starredRepos.length
        this.isFullySynced = true
      } finally {
        this.isFetchingStars = false
      }
    },
    async fetchNewStars() {
      const userStore = useUserStore()
      const octokit = new Octokit({ auth: userStore.user?.accessToken })

      this.isFetchingStars = true

      try {
        const existingIds = new Set(this.starredRepos.map(repo => repo.node.databaseId))
        const newRepos: GitHubRepo[] = []

        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await octokit.request('GET /user/starred', {
            headers: { accept: 'application/vnd.github.star+json' },
            page,
            per_page: STARS_PER_PAGE,
          })

          const repos = (response.data as unknown as GitHubStarItem[]).map(mapStarItemToRepo)
          const fresh = repos.filter(repo => !existingIds.has(repo.node.databaseId))

          newRepos.push(...fresh)
          hasMore = repos.length === STARS_PER_PAGE && fresh.length === repos.length
          page++
        }

        if (newRepos.length) {
          this.starredRepos = newRepos.concat(this.starredRepos)
        }
      } finally {
        this.isFetchingStars = false
      }
    },
    async removeStar(id: string) {
      const userStore = useUserStore()
      const repo: Maybe<GitHubRepo> = this.starredRepos.find(repo => repo.node.id === id)

      await fetch('https://api.github.com/graphql', {
        body: JSON.stringify({
          query: removeStarQuery(id),
        }),
        headers: {
          Authorization: `bearer ${userStore.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (repo) {
        const userStar: Maybe<App.Data.StarData> = this.userStars.find(star => star.repo_id === repo.node.databaseId)
        this.selectedRepos = this.selectedRepos.filter(selectedRepo => selectedRepo.id !== id)
        this.starredRepos.splice(this.starredRepos.indexOf(repo), 1)

        if (userStar) {
          router.delete(`/star/${userStar.id}`, { only: ['stars', 'tags'] })
        }
      }
    },
    resetPageInfo() {
      this.pageInfo = {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
      }
    },
    syncTagsToStar(starInput: StarMetaInput, tags: TagEditorTag[]) {
      router.put(route('star.tags.update'), {
        data: {
          ...starInput,
          tags,
        },
        only: ['stars', 'tags'],
      })
    },
  },
  getters: {
    allStars(): GitHubRepo[] {
      return this.starredRepos
    },
    filteredRepos(): GitHubRepo[] {
      const starsFilterStore = useStarsFilterStore()

      // Untagged is just an `is:untagged` search token now, so it filters through the
      // search branch below rather than swapping the base set.
      let filteredRepos = this.allStars

      if (starsFilterStore.isFilteringBySmartFilter && starsFilterStore.selectedSmartFilter) {
        const smartFilterBody = parseSmartFilterBody(starsFilterStore.selectedSmartFilter.body)

        filteredRepos = this.allStars.filter(repo => {
          return evaluateSmartFilterBody(smartFilterBody, repo, this.userStarsByRepoId[repo.node.databaseId])
        })
      }

      if (starsFilterStore.isFilteringBySearch) {
        const words = freeTextWords(parsePendingInput(starsFilterStore.searchText).freeText)
        const tokens = starsFilterStore.searchTokens

        filteredRepos = filteredRepos.filter((repo: GitHubRepo) => {
          const userStar = this.userStarsByRepoId[repo.node.databaseId]

          return repoMatchesSearch(tokens, words, {
            haystack: this.searchHaystackByRepoId[repo.node.databaseId] ?? '',
            isArchived: repo.node.isArchived,
            primaryLanguage: repo.node.primaryLanguage?.name.toLowerCase() ?? null,
            tagNames: (userStar?.tags ?? []).map(tag => tag.name.toLowerCase()),
            topics: (repo.node.topics ?? []).map(topic => topic.toLowerCase()),
          })
        })
      }

      return filteredRepos
    },
    isAnyRepoSelected(): boolean {
      return !!Object.keys(this.selectedRepo).length
    },
    languages(): RepoLanguage[] {
      return Object.entries(
        this.allStars
          .map(repo => {
            return repo.node.primaryLanguage?.name || ''
          })
          .filter(Boolean)
          .reduce((totals: Record<string, number>, lang: string): Record<string, number> => {
            return { ...totals, [lang]: (totals[lang] || 0) + 1 }
          }, {})
      )
        .map((language: [string, number]) => {
          const [name, count] = language

          return {
            count,
            name,
          }
        })
        .sort((a, b) => b.count - a.count)
    },
    searchHaystackByRepoId(): Record<number, string> {
      const haystacks: Record<number, string> = {}

      for (const repo of this.allStars) {
        const notes = this.userStarsByRepoId[repo.node.databaseId]?.notes || ''

        haystacks[repo.node.databaseId] = [repo.node.nameWithOwner, repo.node.description, notes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
      }

      return haystacks
    },
    selectedRepo(): GitHubRepoNode {
      return this.selectedRepos[0] || {}
    },
    topics(): RepoLanguage[] {
      return Object.entries(
        this.allStars
          .flatMap(repo => repo.node.topics ?? [])
          .reduce((totals: Record<string, number>, topic: string): Record<string, number> => {
            return { ...totals, [topic]: (totals[topic] || 0) + 1 }
          }, {})
      )
        .map((topic: [string, number]) => {
          const [name, count] = topic

          return {
            count,
            name,
          }
        })
        .sort((a, b) => b.count - a.count)
    },
    untaggedStars(): GitHubRepo[] {
      return this.allStars.filter(repo => {
        const userStar: App.Data.StarData = this.userStarsByRepoId[repo.node.databaseId]

        return !userStar || !userStar.tags?.length
      })
    },
    userStarsByRepoId(): Dictionary<App.Data.StarData> {
      return keyBy(this.userStars, (star: App.Data.StarData) => `${star.repo_id}`)
    },
  },
  id: 'stars',
  state() {
    return {
      draggingRepos: [] as GitHubRepoNode[],
      fetchedCount: 0,
      hasFetchedFromStorage: false,
      importScanned: 0,
      importTotal: 0,
      isDraggingRepo: false,
      isFetchingStars: false,
      isFullySynced: false,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
      } as PaginationResponse,
      selectedRepos: [] as GitHubRepoNode[],
      starredRepos: [] as GitHubRepo[],
      totalRepos: 0,
      userStars: [] as App.Data.StarData[],
    }
  },
})
